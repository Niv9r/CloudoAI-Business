'use client';

import type { CartItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, X } from 'lucide-react';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export default function Cart({ cart, onUpdateQuantity, onRemoveItem, onClearCart }: CartProps) {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = 0.1; // 10% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Current Sale</CardTitle>
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
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Add products to start a sale.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium truncate">{item.name}</p>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemoveItem(item.id)}>
                      <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          </div>
        </ScrollArea>
      </CardContent>
      {cart.length > 0 && (
        <CardFooter className="flex-col items-stretch space-y-4 p-4 border-t">
            <div className="space-y-2">
                <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p className="font-medium">${subtotal.toFixed(2)}</p>
                </div>
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
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">Save Sale</Button>
                <Button size="lg">Charge</Button>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
