'use client';

import type { Shift } from '@/lib/types';
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
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface ShiftDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
}

export default function ShiftDetailsDialog({ isOpen, onOpenChange, shift }: ShiftDetailsDialogProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClient(true);
    }
  }, [isOpen]);
  
  const expectedDrawer = (shift.startingCashFloat ?? 0) + (shift.cashSales ?? 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Shift Report: {shift.id}</DialogTitle>
          <DialogDescription>
            Report for {shift.employeeId} on {isClient ? format(new Date(shift.startTime), 'PPP') : ''}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Start Time</p>
                    <p className="font-medium">{isClient ? format(new Date(shift.startTime), 'p') : ''}</p>
                </div>
                 <div className="text-right">
                    <p className="text-muted-foreground">End Time</p>
                    <p className="font-medium">{isClient && shift.endTime ? format(new Date(shift.endTime), 'p') : 'N/A'}</p>
                </div>
            </div>

            <Separator />
            <h4 className="font-semibold">Sales Summary</h4>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Card Sales</span>
                    <span>${(shift.cardSales ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash Sales</span>
                    <span>${(shift.cashSales ?? 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                    <span>Total Sales</span>
                    <span>${(shift.totalSales ?? 0).toFixed(2)}</span>
                </div>
            </div>

            <Separator />
            <h4 className="font-semibold">Cash Reconciliation</h4>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Starting Float</span>
                    <span>${(shift.startingCashFloat ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash Payments Received</span>
                    <span>+ ${(shift.cashSales ?? 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                    <span>Expected in Drawer</span>
                    <span>${expectedDrawer.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Actual Cash Counted</span>
                    <span>${(shift.endingCashFloat ?? 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className={`flex justify-between font-bold text-lg ${shift.discrepancy !== 0 ? 'text-destructive' : ''}`}>
                    <span>Discrepancy</span>
                    <span>${(shift.discrepancy ?? 0).toFixed(2)}</span>
                </div>
            </div>

            {shift.notes && (
                <>
                    <Separator />
                     <div>
                        <h4 className="font-semibold">Notes</h4>
                        <p className="text-sm text-muted-foreground mt-2">{shift.notes}</p>
                    </div>
                </>
            )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
