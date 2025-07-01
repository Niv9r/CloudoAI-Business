
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';
import type { Customer, Sale } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface CustomerHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
}

export default function CustomerHistoryDialog({ isOpen, onOpenChange, customer }: CustomerHistoryDialogProps) {
  const { selectedBusiness } = useBusiness();
  const { getSales } = useInventory();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const customerSales = useMemo(() => {
    if (!customer) return [];
    return getSales(selectedBusiness.id)
      .filter(sale => sale.customerId === customer.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [customer, selectedBusiness.id, getSales]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Purchase History for {customer.firstName} {customer.lastName}</DialogTitle>
          <DialogDescription>
            A complete log of all transactions for this customer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ScrollArea className="h-[400px] border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Sale ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customerSales.length > 0 ? customerSales.map(sale => (
                            <TableRow key={sale.id}>
                                <TableCell>{isClient ? format(new Date(sale.timestamp), 'PPp') : ''}</TableCell>
                                <TableCell className="font-medium">{sale.id}</TableCell>
                                <TableCell>
                                    <Badge variant={sale.status === 'Completed' ? 'default' : 'destructive'}>
                                        {sale.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No purchase history found for this customer.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    