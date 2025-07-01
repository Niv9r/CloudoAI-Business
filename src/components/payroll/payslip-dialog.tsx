
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PayrollRun } from '@/lib/types';
import { Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayslipDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRun: PayrollRun;
}

export default function PayslipDialog({ isOpen, onOpenChange, payrollRun }: PayslipDialogProps) {
    const { toast } = useToast();

    const handlePrint = () => {
        toast({
            title: 'Printing Payslips...',
            description: 'All payslips for this period have been sent to the printer.',
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Payroll Details</DialogTitle>
                    <DialogDescription>
                        Payslips for the period: {new Date(payrollRun.periodStart).toLocaleDateString()} - {new Date(payrollRun.periodEnd).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[70vh] overflow-y-auto">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead className="text-right">Hours</TableHead>
                                <TableHead className="text-right">Rate</TableHead>
                                <TableHead className="text-right">Base Pay</TableHead>
                                <TableHead className="text-right">Sales</TableHead>
                                <TableHead className="text-right">Commission</TableHead>
                                <TableHead className="text-right font-bold">Total Pay</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payrollRun.payrollData.map(data => (
                                <TableRow key={data.employeeId}>
                                    <TableCell className="font-medium">{data.employeeName}</TableCell>
                                    <TableCell className="text-right">{data.totalHours.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${data.hourlyRate.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${data.basePay.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${data.totalSales.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${data.commissionPay.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold">${data.totalPay.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print All
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

