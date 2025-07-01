
'use client';

import type { CartItem, Customer, Discount, DiscountCode } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, X, User, Tag, Ticket, UserPlus, Archive } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { useMemo, useState } from 'react';
import { useInventory } from '@/context/inventory-context';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/context/business-context';

interface CartProps {
  cart: CartItem[];
  customer: Customer | null;
  discount: Discount | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCharge: () => void;
  onSelectCustomerClick: () => void;
  onApplyDiscount: (discount: Discount) => void;
  onRemoveDiscount: () => void;
  onHoldSale: () => void;
}

function DiscountPopover({ onApplyDiscount, children }: { onApplyDiscount: (discount: Discount) => void, children: React.ReactNode }) {
    const { selectedBusiness } = useBusiness();
    const { getDiscountByCode } = useInventory();
    const { toast } = useToast();
    const [code, setCode] = useState('');

    const handleApplyCode = () => {
        const discount = getDiscountByCode(selectedBusiness.id, code.toUpperCase());
        if(discount) {
            onApplyDiscount({ code: discount.code, type: discount.type, value: discount.value });
            toast({ title: "Discount Applied", description: `Successfully applied ${discount.code}.` });
        } else {
            toast({ variant: 'destructive', title: "Invalid Code", description: "The discount code is invalid or has expired." });
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Apply Discount</h4>
                        <p className="text-sm text-muted-foreground">
                            Enter a valid discount code.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="discount-code">Code</Label>
                            <Input
                                id="discount-code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="col-span-2 h-8 uppercase"
                                placeholder="e.g. SAVE15"
                            />
                        </div>
                    </div>
                    <Button onClick={handleApplyCode}>Apply</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default function Cart({ cart, customer, discount, onUpdateQuantity, onRemoveItem, onClearCart, onCharge, onSelectCustomerClick, onApplyDiscount, onRemoveDiscount, onHoldSale }: CartProps) {
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

  const discountAmount = useMemo(() => {
    if (!discount) return 0;
    if (discount.type === 'fixed') {
      return Math.min(discount.value, subtotal);
    }
    if (discount.type === 'percentage') {
      return subtotal * (discount.value / 100);
    }
    return 0;
  }, [subtotal, discount]);
  
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxRate = 0.1; // 10% tax
  const taxAmount = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + taxAmount;
  

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Current Sale</CardTitle>
          {customer && <p className="text-sm text-muted-foreground">{customer.firstName} {customer.lastName}</p>}
        </div>
        {cart.length > 0 && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClearCart}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Clear Cart</span>
            </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
            <div className="p-6 pt-0">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground p-8 text-center">
              <Ticket className="h-16 w-16 text-primary/20" />
              <p>Add products to the cart to start a new sale.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="h-8 w-12 text-center"
                        />
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={() => onRemoveItem(item.id)}>
                      <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col items-stretch space-y-4 p-4 border-t">
          {cart.length > 0 && (
            <>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Subtotal</p>
                        <p className="font-medium">${subtotal.toFixed(2)}</p>
                    </div>
                     {discount && (
                        <div className="flex justify-between items-center text-primary">
                            <div className='flex items-center gap-2'>
                                <p>Discount ({discount.code ? discount.code : `${discount.value}%`})</p>
                                <button onClick={onRemoveDiscount}><X className="h-3 w-3" /></button>
                            </div>
                            <p className="font-medium">-${discountAmount.toFixed(2)}</p>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</p>
                        <p className="font-medium">${taxAmount.toFixed(2)}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                        <p>Total</p>
                        <p>${total.toFixed(2)}</p>
                    </div>
                </div>
                
            </>
          )}

          <div className="space-y-2">
              <Button variant="outline" className='w-full' onClick={onSelectCustomerClick}>
                  {customer ? <User className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {customer ? `${customer.firstName} ${customer.lastName}` : 'Add Customer'}
              </Button>
              {!discount && cart.length > 0 && (
                 <DiscountPopover onApplyDiscount={onApplyDiscount}>
                    <Button variant="outline" size="sm" className="w-full">
                        <Tag className="mr-2 h-4 w-4" />
                        Apply Discount Code
                    </Button>
                 </DiscountPopover>
              )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" disabled={cart.length === 0} onClick={onHoldSale}>
                <Archive className="mr-2 h-4 w-4" />
                Hold Sale
              </Button>
              <Button size="lg" onClick={onCharge} disabled={cart.length === 0}>Charge</Button>
          </div>
      </CardFooter>
    </Card>
  );
}

    