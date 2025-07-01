
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
import { X } from 'lucide-react';

interface PayrollData {
    employeeId: string;
    employeeName: string;
    totalHours: number;
    hourlyRate: number;
    basePay: number;
    totalSales: number;
    commissionRate: number;
    commissionPay: number;
    totalPay: number;
}

export default function PayrollPage() {
    const { selectedBusiness } = useBusiness();
    const { getShifts, getSales } = useInventory();
    const { getEmployees, getRoles } = useEmployee();

    const employees = getEmployees(selectedBusiness.id);
    const roles = getRoles(selectedBusiness.id);
    const shifts = getShifts(selectedBusiness.id);
    const sales = getSales(selectedBusiness.id);
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: subDays(new Date(), 30), to: new Date() });
    
    const payrollData = useMemo(() => {
        const results: PayrollData[] = [];
        
        employees.forEach(employee => {
            const employeeRole = roles.find(r => r.id === employee.roleId);
            const hourlyRate = employeeRole?.hourlyRate || 0;
            const commissionRate = employeeRole?.commissionRate || 0;

            // Filter shifts and sales for this employee and date range
            const employeeShifts = shifts.filter(s => s.employeeId === employee.id && s.status === 'reconciled' && s.endTime && (!dateRange || (new Date(s.startTime) >= (dateRange.from as Date) && new Date(s.startTime) <= (dateRange.to as Date))));
            const employeeSales = sales.filter(s => s.employeeId === employee.id && (!dateRange || (new Date(s.timestamp) >= (dateRange.from as Date) && new Date(s.timestamp) <= (dateRange.to as Date))));

            // Calculate total hours
            const totalSeconds = employeeShifts.reduce((acc, shift) => {
                const duration = new Date(shift.endTime!).getTime() - new Date(shift.startTime).getTime();
                return acc + (duration / 1000);
            }, 0);
            const totalHours = totalSeconds / 3600;

            // Calculate total sales for commission
            const totalSales = employeeSales.reduce((acc, sale) => acc + (sale.subtotal - sale.discount), 0);

            // Calculate pay
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
    
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

    return (
        <div className="flex h-full w-full flex-col gap-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Payroll</h1>
                    <p className="text-muted-foreground">Calculate employee pay based on hours and commissions.</p>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col items-center gap-4 md:flex-row">
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
                                        No payroll data found for the selected period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
