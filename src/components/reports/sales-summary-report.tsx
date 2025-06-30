
'use client';

import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';
import { sales } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DollarSign, Hash, ShoppingCart, Receipt } from 'lucide-react';
import KpiCard from '../dashboard/kpi-card';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface SalesSummaryReportProps {
  dateRange: DateRange | undefined;
}

const chartConfig = {
  total: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function SalesSummaryReport({ dateRange }: SalesSummaryReportProps) {
  const { summary, chartData } = useMemo(() => {
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return !dateRange || (
        (!dateRange.from || saleDate >= startOfDay(dateRange.from)) &&
        (!dateRange.to || saleDate <= endOfDay(dateRange.to))
      );
    });

    if (filteredSales.length === 0) {
      return {
        summary: {
          grossSales: 0,
          netSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        },
        chartData: [],
      };
    }

    const grossSales = filteredSales.reduce((acc, sale) => acc + sale.subtotal, 0);
    const totalDiscounts = filteredSales.reduce((acc, sale) => acc + sale.discount, 0);
    const netSales = grossSales - totalDiscounts;
    const totalOrders = filteredSales.length;
    const averageOrderValue = netSales / totalOrders;

    const summary = {
      grossSales,
      netSales,
      totalOrders,
      averageOrderValue,
    };
    
    const dailySales = filteredSales.reduce((acc, sale) => {
        const day = format(new Date(sale.timestamp), 'yyyy-MM-dd');
        if (!acc[day]) {
            acc[day] = 0;
        }
        acc[day] += sale.total;
        return acc;
    }, {} as Record<string, number>);

    const chartData = dateRange?.from && dateRange.to ? eachDayOfInterval({ start: dateRange.from, end: dateRange.to }).map(day => {
        const formattedDay = format(day, 'yyyy-MM-dd');
        return {
            date: format(day, 'MMM d'),
            total: dailySales[formattedDay] || 0,
        };
    }) : [];


    return { summary, chartData };
  }, [dateRange]);

  const kpis = [
    { title: "Gross Sales", value: `$${summary.grossSales.toFixed(2)}`, change: "Total revenue before discounts", icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { title: "Net Sales", value: `$${summary.netSales.toFixed(2)}`, change: "Revenue after discounts", icon: <Receipt className="h-6 w-6 text-primary" /> },
    { title: "Total Orders", value: summary.totalOrders.toString(), change: "Total number of transactions", icon: <ShoppingCart className="h-6 w-6 text-primary" /> },
    { title: "Avg. Order Value", value: `$${summary.averageOrderValue.toFixed(2)}`, change: "Average net sales per order", icon: <Hash className="h-6 w-6 text-primary" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Summary</CardTitle>
        <CardDescription>A high-level overview and daily trend of sales activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map(kpi => (
                <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} icon={kpi.icon} />
            ))}
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-4">Sales Over Time</h3>
             {chartData.length > 0 ? (
                <div className="pl-2 h-[250px]">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            />
                            <YAxis
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
                            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>
            ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground bg-muted/50 rounded-md">
                    <p>No sales data to display for this period.</p>
                </div>
             )}
        </div>
      </CardContent>
    </Card>
  );
}
