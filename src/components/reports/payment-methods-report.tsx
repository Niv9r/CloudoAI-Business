
'use client';

import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';

interface PaymentMethodsReportProps {
  dateRange: DateRange | undefined;
}

const chartConfig = {
  total: {
    label: 'Sales',
  },
  Card: {
    label: 'Card',
    color: 'hsl(var(--chart-1))',
  },
  Cash: {
    label: 'Cash',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function PaymentMethodsReport({ dateRange }: PaymentMethodsReportProps) {
  const { selectedBusiness } = useBusiness();
  const { getSales } = useInventory();
  const allSales = getSales(selectedBusiness.id);

  const chartData = useMemo(() => {
    const filteredSales = allSales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return !dateRange || (
        (!dateRange.from || saleDate >= startOfDay(dateRange.from)) &&
        (!dateRange.to || saleDate <= endOfDay(dateRange.to))
      );
    });

    const paymentData = filteredSales.flatMap(s => s.payments).reduce((acc, payment) => {
      const paymentMethod = payment.method;
      if (!acc[paymentMethod]) {
        acc[paymentMethod] = { name: paymentMethod, total: 0, fill: `var(--color-${paymentMethod})` };
      }
      acc[paymentMethod].total += payment.amount;
      return acc;
    }, {} as Record<string, { name: string; total: number; fill: string }>);

    return Object.values(paymentData).sort((a,b) => b.total - a.total);

  }, [dateRange, allSales]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Payment Method</CardTitle>
        <CardDescription>A breakdown of total sales revenue by each payment type.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="mx-auto flex justify-center">
            <ChartContainer
              config={chartConfig}
              className="aspect-square max-h-[250px]"
            >
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={50}
                  strokeWidth={5}
                >
                  {chartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                />
              </PieChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground bg-muted/50 rounded-md">
            <p>No sales data to display for this period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    