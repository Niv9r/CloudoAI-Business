
'use client';

import { useState, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/inventory-context';
import { useEmployee } from '@/context/employee-context';
import { useBusiness } from '@/context/business-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X, FileText, Download } from 'lucide-react';
import type { PayrollRun, PayrollData } from '@/lib/types';
import PayslipDialog from '@/components/payroll/payslip-dialog';

export default function PayrollPage() {
    const { selectedBusiness } = useBusiness();
    const { getShifts, getSales, finalizePayroll, getPayrollRuns } = useInventory();
    const { employees, roles } = useEmployee();

    const shifts = getShifts(selectedBusiness.id);
    const sales = getSales(selectedBusiness.id);
    const payrollRuns = getPayrollRuns(selectedBusiness.id);
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: subDays(new Date(), 30), to: new Date() });
    const [selectedPayrollRun, setSelectedPayrollRun] = useState<PayrollRun | null>(null);

    const payrollData = useMemo(() => {
        const results: PayrollData[] = [];
        
        employees.forEach(employee => {
            const employeeRole = roles.find(r => r.id === employee.roleId);
            const hourlyRate = employeeRole?.hourlyRate || 0;
            const commissionRate = employeeRole?.commissionRate || 0;

            const employeeShifts = shifts.filter(s => s.employeeId === employee.id && s.status === 'approved' && s.endTime && (!dateRange || (new Date(s.startTime) >= (dateRange.from as Date) && new Date(s.startTime) <= (dateRange.to as Date))));
            const employeeSales = sales.filter(s => s.employeeId === employee.id && (!dateRange || (new Date(s.timestamp) >= (dateRange.from as Date) && new Date(s.timestamp) <= (dateRange.to as Date))));

            const totalSeconds = employeeShifts.reduce((acc, shift) => {
                const duration = new Date(shift.endTime!).getTime() - new Date(shift.startTime).getTime();
                const breakSeconds = ((shift.unpaidBreakMinutes || 0) * 60);
                return acc + (duration / 1000) - breakSeconds;
            }, 0);
            const totalHours = totalSeconds / 3600;
            
            const totalSales = employeeSales.reduce((acc, sale) => acc + (sale.subtotal - sale.discount), 0);
            const basePay = totalHours * hourlyRate;
            const commissionPay = totalSales * (commissionRate / 100);
            const totalPay = basePay + commissionPay;

            if (totalPay > 0) {
                 results.push({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    totalHours,
                    hourlyRate,
                    basePay,
                    totalSales,
                    commissionRate,
                    commissionPay,
                    totalPay,
                });
            }
        });
        
        return results;

    }, [employees, roles, shifts, sales, dateRange]);

    const handleFinalize = () => {
        if (dateRange?.from && dateRange?.to && payrollData.length > 0) {
            finalizePayroll(selectedBusiness.id, dateRange.from, dateRange.to, payrollData);
        }
    };
    
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

    return (
        <div className="flex h-full w-full flex-col gap-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Payroll</h1>
                    <p className="text-muted-foreground">Calculate employee pay and finalize payroll runs.</p>
                </div>
                <Button onClick={handleFinalize} disabled={!dateRange?.from || !dateRange?.to || payrollData.length === 0}>
                    <FileText className="mr-2 h-4 w-4" />
                    Finalize Payroll for Period
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Current Payroll Calculation</CardTitle>
                    <CardDescription>Select a date range to calculate payroll for approved timesheets.</CardDescription>
                    <div className="flex flex-col items-center gap-4 pt-4 md:flex-row">
                        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                         {dateRange && (
                            <Button variant="ghost" onClick={() => setDateRange(undefined)}>
                                <X className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead className="text-right">Hours</TableHead>
                                <TableHead className="text-right">Base Pay</TableHead>
                                <TableHead className="text-right">Sales</TableHead>
                                <TableHead className="text-right">Commission</TableHead>
                                <TableHead className="text-right font-bold">Total Pay</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payrollData.length > 0 ? payrollData.map(data => (
                                <TableRow key={data.employeeId}>
                                    <TableCell className="font-medium">{data.employeeName}</TableCell>
                                    <TableCell className="text-right">{data.totalHours.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.basePay)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.totalSales)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.commissionPay)}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(data.totalPay)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No approved timesheets found for the selected period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payroll History</CardTitle>
                    <CardDescription>Review finalized payroll runs and view payslips.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead>Finalized On</TableHead>
                                <TableHead className="text-right">Total Payroll</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payrollRuns.length > 0 ? payrollRuns.map(run => (
                                <TableRow key={run.id}>
                                    <TableCell>{`${subDays(new Date(run.periodStart),1).toLocaleDateString()} - ${subDays(new Date(run.periodEnd),1).toLocaleDateString()}`}</TableCell>
                                    <TableCell>{new Date(run.finalizedDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(run.payrollData.reduce((acc, d) => acc + d.totalPay, 0))}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => setSelectedPayrollRun(run)}>
                                            <Download className="mr-2 h-4 w-4" /> View Payslips
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                 <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No finalized payroll runs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
            {selectedPayrollRun && (
                <PayslipDialog 
                    isOpen={!!selectedPayrollRun}
                    onOpenChange={() => setSelectedPayrollRun(null)}
                    payrollRun={selectedPayrollRun}
                />
            )}
        </div>
    );
}
