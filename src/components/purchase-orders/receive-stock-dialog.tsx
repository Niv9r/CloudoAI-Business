'use client';

import { useState, useMemo } from 'react';
import type { PurchaseOrder, Product } from '@/lib/types';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface ReceiveStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder;
  products: Product[];
  onConfirmReceive: (receivedItems: { productId: string; quantityReceived: number }[]) => void;
}

export default function ReceiveStockDialog({
  isOpen,
  onOpenChange,
  purchaseOrder,
  products,
  onConfirmReceive,
}: ReceiveStockDialogProps) {
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value, 10);
    setReceivedQuantities(prev => ({
      ...prev,
      [productId]: isNaN(quantity) ? 0 : quantity,
    }));
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  };

  const handleSubmit = () => {
    const receivedItems = Object.entries(receivedQuantities)
      .map(([productId, quantityReceived]) => ({
        productId,
        quantityReceived,
      }))
      .filter(item => item.quantityReceived > 0);
    
    if (receivedItems.length > 0) {
      onConfirmReceive(receivedItems);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Receive Stock for PO: {purchaseOrder.id}</DialogTitle>
          <DialogDescription>
            Enter the quantity of items received from the supplier. Any items left un-entered will be considered not received in this shipment.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Ordered</TableHead>
                <TableHead className="text-center">Received</TableHead>
                <TableHead className="w-[120px]">Receiving Now</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.lineItems.map(item => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{getProductName(item.productId)}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">{item.quantityReceived || 0}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={item.quantity - (item.quantityReceived || 0)}
                      placeholder="0"
                      value={receivedQuantities[item.productId] || ''}
                      onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                      disabled={(item.quantityReceived || 0) >= item.quantity}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm & Add to Stock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
