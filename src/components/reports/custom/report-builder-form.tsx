
'use client';

import { Dispatch, SetStateAction } from 'react';
import type { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import type { Metric, Dimension } from '@/app/reports/custom/page';

interface ReportBuilderFormProps {
    metrics: Set<Metric>;
    setMetrics: Dispatch<SetStateAction<Set<Metric>>>;
    dimension: Dimension;
    setDimension: Dispatch<SetStateAction<Dimension>>;
    dateRange: DateRange | undefined;
    setDateRange: Dispatch<SetStateAction<DateRange | undefined>>;
    onSubmit: () => void;
}

const metricOptions: { id: Metric; label: string }[] = [
    { id: 'netSales', label: 'Net Sales' },
    { id: 'grossProfit', label: 'Gross Profit' },
    { id: 'totalOrders', label: 'Total Orders' },
    { id: 'unitsSold', label: 'Units Sold' },
];

const dimensionOptions: { id: Dimension; label: string }[] = [
    { id: 'product', label: 'Product' },
    { id: 'employee', label: 'Employee' },
    { id: 'day', label: 'Day' },
    { id: 'month', label: 'Month' },
];

export default function ReportBuilderForm({
    metrics,
    setMetrics,
    dimension,
    setDimension,
    dateRange,
    setDateRange,
    onSubmit
}: ReportBuilderFormProps) {
    const handleMetricChange = (metric: Metric, checked: boolean) => {
        setMetrics(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(metric);
            } else {
                newSet.delete(metric);
            }
            return newSet;
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Report Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="font-semibold">1. Select Metrics</Label>
                    <div className="space-y-2 mt-2">
                        {metricOptions.map(option => (
                            <div key={option.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`metric-${option.id}`}
                                    checked={metrics.has(option.id)}
                                    onCheckedChange={(checked) => handleMetricChange(option.id, !!checked)}
                                />
                                <Label htmlFor={`metric-${option.id}`} className="font-normal">{option.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>
                <Separator />
                 <div>
                    <Label className="font-semibold">2. Group By</Label>
                     <RadioGroup value={dimension} onValueChange={(value) => setDimension(value as Dimension)} className="mt-2 space-y-1">
                         {dimensionOptions.map(option => (
                            <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.id} id={`dim-${option.id}`} />
                                <Label htmlFor={`dim-${option.id}`} className="font-normal">{option.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                <Separator />
                <div>
                    <Label className="font-semibold">3. Select Date Range</Label>
                    <div className="mt-2">
                         <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={onSubmit}>Generate Report</Button>
            </CardFooter>
        </Card>
    );
}

    