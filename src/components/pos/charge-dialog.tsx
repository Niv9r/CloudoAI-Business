
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CartItem, Discount, Sale, Customer, SalePayment } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, CreditCard, DollarSign, Loader2 } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import { Separator } from '../ui/separator';

interface ChargeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  customer: Customer | null;
  discount: Discount | null;
  onSaleComplete: (saleData: Omit<Sale, 'id' | 'employeeId'>) => void;
}

type PaymentStep = 'payment' | 'complete';
type PaymentMethod = 'Card' | 'Cash';

export default function ChargeDialog({ isOpen, onOpenChange, cart, customer, discount, onSaleComplete }: ChargeDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<PaymentStep>('payment');
  const [payments, setPayments] = useState<SalePayment[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [cashTendered, setCashTendered] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { subtotal, discountAmount, taxAmount, total } = useMemo(() => {
    if (cart.length === 0) return { subtotal: 0, discountAmount: 0, taxAmount: 0, total: 0 };
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = (() => {
      if (!discount) return 0;
      if (discount.type === 'fixed') {
        return Math.min(discount.value, subtotal);
      }
      if (discount.type === 'percentage') {
        return subtotal * (discount.value / 100);
      }
      return 0;
    })();
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * 0.1;
    const total = subtotalAfterDiscount + taxAmount;
    return { subtotal, discountAmount, taxAmount, total };
  }, [cart, discount]);

  const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
  const remainingBalance = useMemo(() => total - totalPaid, [total, totalPaid]);

  useEffect(() => {
    if (isOpen) {
      setStep('payment');
      setPayments([]);
      setCashTendered('');
      setCardAmount(remainingBalance.toFixed(2));
      setIsProcessing(false);
    }
  }, [isOpen]);
  
  useEffect(() => {
      setCardAmount(remainingBalance.toFixed(2));
  }, [remainingBalance]);

  const handleAddPayment = (method: PaymentMethod) => {
    const amountToAdd = method === 'Cash' ? parseFloat(cashTendered) : parseFloat(cardAmount);
    if (!isNaN(amountToAdd) && amountToAdd > 0) {
      setPayments(prev => [...prev, { method, amount: Math.min(amountToAdd, remainingBalance) }]);
      setCashTendered('');
    }
  };

  const changeDue = useMemo(() => {
    const cashPaid = payments.filter(p => p.method === 'Cash').reduce((acc, p) => acc + p.amount, 0);
    const lastCashTendered = parseFloat(cashTendered);
    if (paymentMethod === 'Cash' && !isNaN(lastCashTendered) && (totalPaid + lastCashTendered) >= total) {
      return (totalPaid + lastCashTendered) - total;
    }
    return 0;
  }, [payments, cashTendered, total, totalPaid, paymentMethod]);


  const handleFinalizeSale = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let finalPayments = [...payments];
    if (remainingBalance > 0) {
        const finalAmount = paymentMethod === 'Cash' ? parseFloat(cashTendered) : parseFloat(cardAmount);
        if (!isNaN(finalAmount) && finalAmount > 0) {
            finalPayments.push({method: paymentMethod, amount: finalAmount});
        }
    }
    
    const newSaleData: Omit<Sale, 'id' | 'employeeId'> = {
        timestamp: new Date().toISOString(),
        customerId: customer?.id || null,
        customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Guest',
        subtotal: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: total,
        payments: finalPayments,
        status: 'Completed',
        lineItems: cart.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            costAtTimeOfSale: item.cost,
            subtotal: item.price * item.quantity,
        }))
    };

    onSaleComplete(newSaleData);
    setIsProcessing(false);
    setStep('complete');
  };

  const handleNewSale = () => {
    onOpenChange(false);
  };
  
  const handlePrintReceipt = () => {
    toast({ title: "Printing Receipt", description: "Your receipt has been sent to the printer." });
  }

  const isFinalizeDisabled = remainingBalance > 0.001 && (paymentMethod === 'Cash' ? !cashTendered : !cardAmount)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Payment</DialogTitle>
              <DialogDescription>
                Total Due: <span className="font-bold text-foreground">${total.toFixed(2)}</span>
              </DialogDescription>
            </DialogHeader>
            <div className='py-4 space-y-4'>
                <div className='p-4 rounded-lg border text-center'>
                    <p className='text-sm text-muted-foreground'>Remaining Balance</p>
                    <p className='text-3xl font-bold'>${remainingBalance.toFixed(2)}</p>
                </div>
                {payments.length > 0 && (
                    <div>
                        <Label>Payments Applied</Label>
                        <div className='space-y-1 mt-2'>
                            {payments.map((p, i) => (
                                <div key={i} className='flex justify-between items-center p-2 rounded-md bg-muted/50'>
                                    <span className='text-sm font-medium flex items-center gap-2'>
                                        {p.method === 'Card' ? <CreditCard /> : <DollarSign />}
                                        {p.method}
                                    </span>
                                    <span className='text-sm font-semibold'>${p.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {remainingBalance > 0.001 && (
                    <div className='space-y-4'>
                        <Separator />
                        <div className='grid grid-cols-2 gap-2'>
                             <Button variant={paymentMethod === 'Card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Card')}>Card</Button>
                             <Button variant={paymentMethod === 'Cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Cash')}>Cash</Button>
                        </div>
                        {paymentMethod === 'Card' ? (
                            <div className='space-y-2'>
                                <Label htmlFor='card-amount'>Card Amount</Label>
                                <Input id='card-amount' type='number' value={cardAmount} onChange={(e) => setCardAmount(e.target.value)} />
                                {remainingBalance > 0.001 && <Button variant='secondary' size='sm' className='w-full' onClick={() => handleAddPayment('Card')}>Add Card Payment</Button>}
                            </div>
                        ) : (
                             <div className='space-y-2'>
                                <Label htmlFor='cash-tendered'>Cash Tendered</Label>
                                <Input id='cash-tendered' type='number' value={cashTendered} onChange={(e) => setCashTendered(e.target.value)} />
                                {remainingBalance > 0.001 && <Button variant='secondary' size='sm' className='w-full' onClick={() => handleAddPayment('Cash')}>Add Cash Payment</Button>}
                            </div>
                        )}
                        {changeDue > 0 && (
                            <div className="text-center text-xl font-bold text-primary pt-2">
                                Change Due: ${changeDue.toFixed(2)}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button size='lg' className='w-full' onClick={handleFinalizeSale} disabled={isProcessing || isFinalizeDisabled}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Finalize Sale
                </Button>
            </DialogFooter>
          </>
        )}
        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
            <CheckCircle2 className="h-24 w-24 text-green-500" />
            <h2 className="text-2xl font-bold">Payment Successful</h2>
            <div className="text-lg">
                <p>Total Paid: <span className="font-semibold">${total.toFixed(2)}</span></p>
                {changeDue > 0 && <p>Change Due: <span className="font-semibold">${changeDue.toFixed(2)}</span></p>}
            </div>
            <div className="w-full grid grid-cols-2 gap-4 pt-4">
                <Button size="lg" variant="outline" onClick={handlePrintReceipt}>Print Receipt</Button>
                <Button size="lg" onClick={handleNewSale}>New Sale</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

    