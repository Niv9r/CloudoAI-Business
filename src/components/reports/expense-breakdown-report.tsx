
'use client';

import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay, format } from 'date-fns';
import { expenses as allExpenses, vendors } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DollarSign, Hash } from 'lucide-react';
import KpiCard from '../dashboard/kpi-card';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ExpenseBreakdownReportProps {
  dateRange: DateRange | undefined;
}

const chartConfig = {
  total: {
    label: 'Expenses',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function ExpenseBreakdownReport({ dateRange }: ExpenseBreakdownReportProps) {
  const { summary, chartData } = useMemo(() => {
    const filteredExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.issueDate);
      return !dateRange || (
        (!dateRange.from || expenseDate >= startOfDay(dateRange.from)) &&
        (!dateRange.to || expenseDate <= endOfDay(dateRange.to))
      );
    });

    const totalSpent = filteredExpenses.reduce((acc, exp) => acc + exp.total, 0);
    const expenseCount = filteredExpenses.length;
    
    const expensesByVendor = filteredExpenses.reduce((acc, exp) => {
        const vendorName = vendors.find(v => v.id === exp.vendorId)?.name || 'Unknown Vendor';
        if (!acc[vendorName]) {
            acc[vendorName] = 0;
        }
        acc[vendorName] += exp.total;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(expensesByVendor)
        .map(([name, total]) => ({ name, total }))
        .sort((a,b) => b.total - a.total);

    return { 
        summary: { 
            totalSpent, 
            expenseCount 
        }, 
        chartData 
    };
  }, [dateRange]);

  const kpis = [
    { title: "Total Spent", value: `$${summary.totalSpent.toFixed(2)}`, change: "Total expenses in this period", icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { title: "Expense Count", value: summary.expenseCount.toString(), change: "Total number of expense transactions", icon: <Hash className="h-6 w-6 text-primary" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>An overview of your expenses and spending by vendor.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map(kpi => (
                <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} icon={kpi.icon} />
            ))}
        </div>
         <div>
            <h3 className="text-lg font-semibold mb-4">Expenses by Vendor</h3>
             {chartData.length > 0 ? (
                <div className="pl-2 h-[300px]">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart accessibilityLayer data={chartData} layout="vertical">
                             <YAxis
                                dataKey="name"
                                type="category"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={120}
                            />
                            <XAxis
                                type="number"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                cursorClassName="fill-primary/10"
                                content={<ChartTooltipContent />}
                            />
                            <Bar dataKey="total" layout="vertical" fill="var(--color-total)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </div>
            ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground bg-muted/50 rounded-md">
                    <p>No expense data to display for this period.</p>
                </div>
             )}
        </div>
      </CardContent>
    </Card>
  );
}
