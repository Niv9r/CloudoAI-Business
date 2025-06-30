'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useBusiness } from '@/context/business-context';
import { useInventory } from '@/context/inventory-context';
import { format } from 'date-fns';

const chartConfig = {
  total: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function SalesChart() {
  const { selectedBusiness } = useBusiness();
  const { getSales } = useInventory();

  const data = useMemo(() => {
    const sales = getSales(selectedBusiness.id);
    const monthlySales = sales.reduce((acc, sale) => {
      const month = format(new Date(sale.timestamp), 'MMM');
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += sale.total;
      return acc;
    }, {} as Record<string, number>);

    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return allMonths.map(month => ({
      name: month,
      total: monthlySales[month] || 0
    }));
  }, [selectedBusiness.id, getSales]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Sales Overview</CardTitle>
        <CardDescription>A summary of your monthly sales revenue.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey="name"
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
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              cursorClassName="fill-primary/10"
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
