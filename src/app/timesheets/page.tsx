
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
import { subDays, format, intervalToDuration } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function TimesheetsPage() {
    const { selectedBusiness } = useBusiness();
    const { getShifts } = useInventory();
    const { getEmployees } = useEmployee();

    const employees = getEmployees(selectedBusiness.id);
    const shifts = getShifts(selectedBusiness.id);
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: subDays(new Date(), 7), to: new Date() });
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    
    const filteredShifts = useMemo(() => {
        return shifts
            .filter(shift => shift.status === 'reconciled' && shift.endTime)
            .filter(shift => {
                const shiftDate = new Date(shift.startTime);
                return !dateRange || (
                    (!dateRange.from || shiftDate >= dateRange.from) &&
                    (!dateRange.to || shiftDate <= dateRange.to)
                );
            })
            .filter(shift => selectedEmployee === 'all' || shift.employeeId === selectedEmployee)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [shifts, dateRange, selectedEmployee]);

    const totalHours = useMemo(() => {
        const totalSeconds = filteredShifts.reduce((acc, shift) => {
            if (!shift.endTime) return acc;
            const duration = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
            return acc + (duration / 1000);
        }, 0);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return { hours, minutes };
    }, [filteredShifts]);
    
    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';
    
    const formatDuration = (start: string, end: string) => {
        const duration = intervalToDuration({ start: new Date(start), end: new Date(end) });
        return `${duration.hours || 0}h ${duration.minutes || 0}m`;
    };

    const hasActiveFilters = dateRange !== undefined || selectedEmployee !== 'all';
    
    return (
        <div className="flex h-full w-full flex-col gap-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Timesheets</h1>
                    <p className="text-muted-foreground">Review employee hours from reconciled shifts.</p>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col items-center gap-4 md:flex-row">
                        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger className="w-full md:w-[240px]">
                                <SelectValue placeholder="Filter by employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Employees</SelectItem>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={() => { setDateRange(undefined); setSelectedEmployee('all'); }}>
                                <X className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                        <div className="md:ml-auto text-center md:text-right">
                            <p className="text-sm text-muted-foreground">Total Hours</p>
                            <p className="text-2xl font-bold">{totalHours.hours}h {totalHours.minutes}m</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Clock Out</TableHead>
                                <TableHead className="text-right">Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredShifts.length > 0 ? filteredShifts.map(shift => (
                                <TableRow key={shift.id}>
                                    <TableCell className="font-medium">{getEmployeeName(shift.employeeId)}</TableCell>
                                    <TableCell>{format(new Date(shift.startTime), 'PPP')}</TableCell>
                                    <TableCell>{format(new Date(shift.startTime), 'p')}</TableCell>
                                    <TableCell>{shift.endTime ? format(new Date(shift.endTime), 'p') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">{shift.endTime ? formatDuration(shift.startTime, shift.endTime) : 'N/A'}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No reconciled shifts found for the selected criteria.
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

