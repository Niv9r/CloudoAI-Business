'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CartItem, Discount } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, CreditCard, DollarSign, Loader2 } from 'lucide-react';

interface ChargeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  discount: Discount | null;
  onClearCart: () => void;
}

type PaymentStep = 'payment' | 'complete';
type PaymentMethod = 'Cash' | 'Card';

export default function ChargeDialog({ isOpen, onOpenChange, cart, discount, onClearCart }: ChargeDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<PaymentStep>('payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = useMemo(() => {
    if (cart.length === 0) return 0;
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
    const tax = subtotalAfterDiscount * 0.1;
    return subtotalAfterDiscount + tax;
  }, [cart, discount]);

  const changeDue = useMemo(() => {
    const tendered = parseFloat(tenderedAmount);
    if (!isNaN(tendered) && tendered >= total) {
      return tendered - total;
    }
    return 0;
  }, [tenderedAmount, total]);

  useEffect(() => {
    if (isOpen) {
      setStep('payment');
      setPaymentMethod('Card');
      setTenderedAmount('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleExactCash = () => {
    setTenderedAmount(total.toFixed(2));
  };
  
  const suggestNextBill = (amount: number) => {
    if (amount <= 0) return 5;
    const roundedUp = Math.ceil(amount);
    if (roundedUp <= 5) return 5;
    if (roundedUp <= 10) return 10;
    if (roundedUp <= 20) return 20;
    if (roundedUp <= 50) return 50;
    if (roundedUp <= 100) return 100;
    return Math.ceil(amount / 50) * 50;
  }

  const handleNextBill = () => {
      const nextBillValue = suggestNextBill(total);
      setTenderedAmount(nextBillValue.toFixed(2));
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onClearCart();
    setIsProcessing(false);
    setStep('complete');
  };

  const handleNewSale = () => {
    onOpenChange(false);
  };
  
  const handlePrintReceipt = () => {
    toast({
        title: "Printing Receipt",
        description: "Your receipt has been sent to the printer.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Payment</DialogTitle>
              <DialogDescription>
                Total due: <span className="font-bold text-foreground">${total.toFixed(2)}</span>
              </DialogDescription>
            </DialogHeader>
            <Tabs value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Card"><CreditCard className="mr-2 h-4 w-4" />Card</TabsTrigger>
                <TabsTrigger value="Cash"><DollarSign className="mr-2 h-4 w-4" />Cash</TabsTrigger>
              </TabsList>
              <TabsContent value="Card" className="mt-4">
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                  <p className="text-muted-foreground">Ready to process card payment.</p>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Process Card Payment for ${total.toFixed(2)}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="Cash" className="mt-4">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="tendered">Amount Tendered</Label>
                        <Input
                            id="tendered"
                            type="number"
                            placeholder="e.g., 50.00"
                            value={tenderedAmount}
                            onChange={(e) => setTenderedAmount(e.target.value)}
                            className="text-lg h-12"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={handleExactCash}>Exact Cash</Button>
                        <Button variant="outline" onClick={handleNextBill}>Next Bill (${suggestNextBill(total).toFixed(2)})</Button>
                    </div>
                  {parseFloat(tenderedAmount) >= total && (
                    <div className="text-center text-xl font-bold text-primary pt-4">
                      Change Due: ${changeDue.toFixed(2)}
                    </div>
                  )}
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isProcessing || parseFloat(tenderedAmount) < total}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <DollarSign className="mr-2 h-4 w-4" />
                    )}
                    Finalize Cash Payment
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </>
        )}
        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
            <CheckCircle2 className="h-24 w-24 text-green-500" />
            <h2 className="text-2xl font-bold">Payment Successful</h2>
            <div className="text-lg">
                <p>Total Paid: <span className="font-semibold">${total.toFixed(2)}</span></p>
                {paymentMethod === 'Cash' && <p>Change Due: <span className="font-semibold">${changeDue.toFixed(2)}</span></p>}
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
