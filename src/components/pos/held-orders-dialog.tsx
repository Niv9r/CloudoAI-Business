'use client';

import type { HeldOrder } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArchiveRestore, Trash2, Box, User, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '../ui/separator';

interface HeldOrdersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  heldOrders: HeldOrder[];
  onRetrieveOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function HeldOrdersDialog({
  isOpen,
  onOpenChange,
  heldOrders,
  onRetrieveOrder,
  onDeleteOrder,
}: HeldOrdersDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Held Sales</DialogTitle>
          <DialogDescription>
            Select a sale to retrieve it to the cart or delete it permanently.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <ScrollArea className="h-[400px] border rounded-md">
            <div className="p-2">
              {heldOrders.length > 0 ? (
                heldOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 p-3 rounded-md mb-2 border"
                  >
                    <div className="flex justify-between items-start">
                        <div className='space-y-1'>
                            <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                                Held {formatDistanceToNow(new Date(order.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={() => onRetrieveOrder(order.id)}
                            >
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                Retrieve
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className='h-9 w-9'
                                onClick={() => onDeleteOrder(order.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Box className="h-4 w-4" />
                            <span>{order.cart.reduce((acc, item) => acc + item.quantity, 0)} items</span>
                        </div>
                        {order.customer && (
                             <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{order.customer.firstName} {order.customer.lastName}</span>
                            </div>
                        )}
                        {order.discount && (
                            <div className="flex items-center gap-1">
                                <Tag className="h-4 w-4" />
                                <span>{order.discount.type === 'percentage' ? `${order.discount.value}%` : `$${order.discount.value.toFixed(2)}`} discount</span>
                            </div>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground p-8 h-full flex flex-col justify-center items-center">
                  <ArchiveRestore className="h-16 w-16 text-primary/20 mb-4" />
                  <p className="font-semibold">No sales are currently on hold.</p>
                  <p>Use the "Hold Sale" button in the cart to save a sale for later.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
