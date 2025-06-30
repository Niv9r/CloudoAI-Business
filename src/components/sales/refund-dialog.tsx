'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Sale } from '@/lib/types';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RefundDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale;
  onConfirmRefund: (saleId: string, itemsToRefund: { productId: string; quantity: number }[], restockItems: boolean) => void;
}

export default function RefundDialog({ isOpen, onOpenChange, sale, onConfirmRefund }: RefundDialogProps) {
  const [refundQuantities, setRefundQuantities] = useState<Record<string, number>>({});
  const [restockItems, setRestockItems] = useState(true);


  useEffect(() => {
    setRefundQuantities({});
    setRestockItems(true);
  }, [isOpen]);

  const handleQuantityChange = (productId: string, value: string, max: number) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity)) {
      setRefundQuantities(prev => ({ ...prev, [productId]: 0 }));
    } else {
      setRefundQuantities(prev => ({ ...prev, [productId]: Math.min(Math.max(0, quantity), max) }));
    }
  };

  const { refundTotal, itemsToRefund } = useMemo(() => {
    let subtotal = 0;
    const items = Object.entries(refundQuantities)
      .map(([productId, quantity]) => {
        if (quantity > 0) {
          const lineItem = sale.lineItems.find(li => li.productId === productId);
          if (lineItem) {
            subtotal += quantity * lineItem.unitPrice;
          }
          return { productId, quantity };
        }
        return null;
      })
      .filter((item): item is { productId: string; quantity: number } => item !== null);
    
    // Simplified tax calculation for refund
    const effectiveSubtotal = sale.subtotal - sale.discount;
    const taxRate = effectiveSubtotal > 0 ? sale.tax / effectiveSubtotal : 0;
    const total = subtotal * (1 + taxRate);
    
    return { refundTotal: total, itemsToRefund: items };
  }, [refundQuantities, sale]);

  const handleSubmit = () => {
    if (itemsToRefund.length > 0) {
      onConfirmRefund(sale.id, itemsToRefund, restockItems);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Refund for Sale: {sale.id}</DialogTitle>
          <DialogDescription>
            Select the quantity of each item to refund. Stock will be returned to inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Sold</TableHead>
                    <TableHead className="text-center">Refunded</TableHead>
                    <TableHead className="text-center">Refundable</TableHead>
                    <TableHead className="w-[120px]">Refund Qty</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {sale.lineItems.map(item => {
                const availableToRefund = item.quantity - (item.refundedQuantity || 0);
                return (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">{item.refundedQuantity || 0}</TableCell>
                    <TableCell className="text-center">{availableToRefund}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={availableToRefund}
                        placeholder="0"
                        value={refundQuantities[item.productId] || ''}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value, availableToRefund)}
                        disabled={availableToRefund <= 0}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <Separator />
        <div className="flex justify-between items-center pt-2 pb-2">
            <div className="flex items-center space-x-2">
                <Checkbox id="restock-items" checked={restockItems} onCheckedChange={(checked) => setRestockItems(checked as boolean)} />
                <Label htmlFor="restock-items" className="text-sm font-normal">
                    Return items to inventory
                </Label>
            </div>
            <div className="font-bold text-lg">
                Total Refund: ${refundTotal.toFixed(2)}
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={itemsToRefund.length === 0}>
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
