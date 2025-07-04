
'use client';

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
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Printer, CreditCard, Undo2, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import RefundDialog from './refund-dialog';
import { useEmployee } from '@/context/employee-context';

interface SaleDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale;
  onProcessRefund: (saleId: string, itemsToRefund: { productId: string; quantity: number }[], restockItems: boolean) => void;
}

export default function SaleDetailsDialog({ isOpen, onOpenChange, sale, onProcessRefund }: SaleDetailsDialogProps) {
  const { toast } = useToast();
  const { getEmployees, permissions } = useEmployee();

  const [isClient, setIsClient] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClient(true);
      setIsRefundDialogOpen(false); // Reset when main dialog opens
    }
  }, [isOpen]);

  const getEmployeeName = (employeeId: string) => {
      // In a real app, you might fetch this from a context or a hook
      const employee = getEmployees(sale.id.split('-')[0]).find(e => e.id === employeeId);
      return employee ? employee.name : 'Unknown';
  }


  const handlePrintReceipt = () => {
    toast({
      title: 'Printing Receipt',
      description: `Receipt for sale ${sale.id} has been sent to the printer.`,
    });
  };

  const isRefundable = (sale.status === 'Completed' || sale.status === 'Partially Refunded') && permissions.has('process_refunds');

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sale Details: {sale.id}</DialogTitle>
          <DialogDescription>
            {isClient ? format(new Date(sale.timestamp), 'PPpp') : <>&nbsp;</>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Customer</h4>
              <p className="text-sm text-muted-foreground">{sale.customerName}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Employee</h4>
              <p className="text-sm text-muted-foreground">{getEmployeeName(sale.employeeId)}</p>
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2">Items Sold</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-center">Refunded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.lineItems.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{item.refundedQuantity || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className='space-y-2'>
                <h4 className="font-semibold">Payment Summary</h4>
                 {sale.payments.map((p, i) => (
                    <div key={i} className="flex items-center text-sm">
                        {p.method === 'Card' ? <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" /> : <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />}
                        <span>Paid ${p.amount.toFixed(2)} with {p.method}</span>
                    </div>
                 ))}
                <div className="flex items-center text-sm">
                    <Badge variant={sale.status === 'Completed' ? 'default' : sale.status.includes('Refunded') ? 'destructive' : 'secondary'}>
                        {sale.status}
                    </Badge>
                </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${sale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-${sale.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${sale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${sale.total.toFixed(2)}</span>
              </div>
               {sale.refundedAmount && sale.refundedAmount > 0 && (
                 <div className="flex justify-between text-destructive">
                    <span className="font-semibold">Refunded</span>
                    <span className="font-semibold">-${sale.refundedAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handlePrintReceipt}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
           {isRefundable && (
            <Button variant="destructive" onClick={() => setIsRefundDialogOpen(true)}>
                <Undo2 className="mr-2 h-4 w-4" />
                Process Refund
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     {isRefundDialogOpen && (
        <RefundDialog
            isOpen={isRefundDialogOpen}
            onOpenChange={setIsRefundDialogOpen}
            sale={sale}
            onConfirmRefund={onProcessRefund}
        />
    )}
    </>
  );
}

    