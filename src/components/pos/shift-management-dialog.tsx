'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Shift, Sale } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface ShiftManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'start' | 'end';
  shift?: Shift;
  sales?: Sale[];
  onStartShift?: (startingFloat: number) => void;
  onEndShift?: (actualCash: number) => void;
}

export default function ShiftManagementDialog({
  isOpen,
  onOpenChange,
  mode,
  shift,
  sales = [],
  onStartShift,
  onEndShift,
}: ShiftManagementDialogProps) {
  const [startingFloat, setStartingFloat] = useState('');
  const [actualCash, setActualCash] = useState('');

  const shiftSummary = useMemo(() => {
    if (mode !== 'end' || !shift) return null;

    const expectedCash = sales.reduce((acc, sale) => (sale.payment === 'Cash' ? acc + sale.total : acc), 0);
    const expectedCard = sales.reduce((acc, sale) => (sale.payment === 'Card' ? acc + sale.total : acc), 0);
    const totalSales = expectedCash + expectedCard;
    const expectedDrawer = shift.startingCashFloat + expectedCash;
    const discrepancy = parseFloat(actualCash) - expectedDrawer;

    return {
      expectedCash,
      expectedCard,
      totalSales,
      expectedDrawer,
      discrepancy,
    };
  }, [mode, shift, sales, actualCash]);
  
  useEffect(() => {
    if (!isOpen) {
        setStartingFloat('');
        setActualCash('');
    }
  }, [isOpen])


  const handleStart = () => {
    const floatValue = parseFloat(startingFloat);
    if (!isNaN(floatValue) && onStartShift) {
      onStartShift(floatValue);
    }
  };

  const handleEnd = () => {
    const cashValue = parseFloat(actualCash);
    if (!isNaN(cashValue) && onEndShift) {
        onEndShift(cashValue);
    }
  }

  const isEndShiftButtonDisabled = useMemo(() => {
    const cashValue = parseFloat(actualCash);
    if (isNaN(cashValue)) return true;
    if (shiftSummary?.discrepancy !== 0) {
        // Here you could add a check for a required discrepancy reason
        return false;
    }
    return false;
  }, [actualCash, shiftSummary]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => mode === 'start' && e.preventDefault()}>
        {mode === 'start' ? (
          <>
            <DialogHeader>
              <DialogTitle>Start New Shift</DialogTitle>
              <DialogDescription>
                Enter the starting cash amount in your drawer to begin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="starting-float">Starting Cash Float ($)</Label>
                <Input
                  id="starting-float"
                  type="number"
                  placeholder="e.g., 150.00"
                  value={startingFloat}
                  onChange={(e) => setStartingFloat(e.target.value)}
                  className="text-lg h-12"
                />
              </div>
            </div>
            <DialogFooter>
              <Button size="lg" className="w-full" onClick={handleStart} disabled={!startingFloat}>
                Start Shift
              </Button>
            </DialogFooter>
          </>
        ) : shift && shiftSummary ? (
            <>
            <DialogHeader>
              <DialogTitle>End Shift & Reconcile</DialogTitle>
              <DialogDescription>
                Started at {format(new Date(shift.startTime), 'PPpp')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className='grid grid-cols-2 gap-4 text-center'>
                     <div className='rounded-lg border p-3'>
                        <p className='text-sm text-muted-foreground'>Total Sales</p>
                        <p className='text-2xl font-bold'>${shiftSummary.totalSales.toFixed(2)}</p>
                    </div>
                     <div className='rounded-lg border p-3'>
                        <p className='text-sm text-muted-foreground'>Transactions</p>
                        <p className='text-2xl font-bold'>{sales.length}</p>
                    </div>
                </div>
                <div className="space-y-2 rounded-lg border p-4">
                    <h4 className="font-semibold">Summary</h4>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Starting Float</span>
                        <span>${shift.startingCashFloat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cash Payments</span>
                        <span>+ ${shiftSummary.expectedCash.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Card Payments</span>
                        <span>${shiftSummary.expectedCard.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                        <span>Expected in Drawer</span>
                        <span>${shiftSummary.expectedDrawer.toFixed(2)}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="actual-cash">Actual Cash in Drawer ($)</Label>
                    <Input
                        id="actual-cash"
                        type="number"
                        placeholder="Count your cash..."
                        value={actualCash}
                        onChange={(e) => setActualCash(e.target.value)}
                        className="text-lg h-12"
                    />
                </div>
                
                {actualCash && (
                     <Alert variant={shiftSummary.discrepancy === 0 ? 'default' : 'destructive'} className='mt-4'>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Discrepancy</AlertTitle>
                        <AlertDescription>
                            <span className='text-2xl font-bold'>
                                {shiftSummary.discrepancy > 0 ? '+' : ''}${shiftSummary.discrepancy.toFixed(2)}
                            </span>
                        </AlertDescription>
                    </Alert>
                )}

                {shiftSummary.discrepancy !== 0 && actualCash && (
                    <div className='space-y-2'>
                        <Label htmlFor='discrepancy-reason'>Reason for Discrepancy (Required)</Label>
                        <Textarea id="discrepancy-reason" placeholder="e.g., Incorrect change given..." />
                    </div>
                )}
            </div>
             <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleEnd} disabled={isEndShiftButtonDisabled}>
                    Close Shift
                </Button>
            </DialogFooter>
            </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
