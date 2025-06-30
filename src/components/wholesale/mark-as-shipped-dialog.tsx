
'use client';

import { useState } from 'react';
import type { WholesaleOrder, Product } from '@/lib/types';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface MarkAsShippedDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: WholesaleOrder;
  products: Product[];
  onConfirmShipment: (shippedItems: { productId: string; quantityShipped: number }[]) => void;
}

export default function MarkAsShippedDialog({
  isOpen,
  onOpenChange,
  order,
  products,
  onConfirmShipment,
}: MarkAsShippedDialogProps) {
  const [shippedQuantities, setShippedQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (productId: string, value: string, max: number) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity)) {
        setShippedQuantities(prev => ({ ...prev, [productId]: 0 }));
    } else {
        setShippedQuantities(prev => ({
            ...prev,
            [productId]: Math.min(Math.max(0, quantity), max),
        }));
    }
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  };

  const handleSubmit = () => {
    const shippedItems = Object.entries(shippedQuantities)
      .map(([productId, quantityShipped]) => ({
        productId,
        quantityShipped,
      }))
      .filter(item => item.quantityShipped > 0);
    
    if (shippedItems.length > 0) {
      onConfirmShipment(shippedItems);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ship Items for Order: {order.id}</DialogTitle>
          <DialogDescription>
            Enter the quantity of items being shipped. This will deduct from your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Ordered</TableHead>
                <TableHead className="text-center">Shipped</TableHead>
                <TableHead className="w-[120px]">Shipping Now</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lineItems.map(item => {
                const availableToShip = item.quantity - (item.quantityShipped || 0);
                return (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{getProductName(item.productId)}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">{item.quantityShipped || 0}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={availableToShip}
                      placeholder="0"
                      value={shippedQuantities[item.productId] || ''}
                      onChange={(e) => handleQuantityChange(item.productId, e.target.value, availableToShip)}
                      disabled={availableToShip <= 0}
                    />
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm Shipment & Deduct Stock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
