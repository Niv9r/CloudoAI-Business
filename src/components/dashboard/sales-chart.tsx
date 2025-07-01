
'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useBusiness } from '@/context/business-context';
import { useInventory } from '@/context/inventory-context';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

const chartConfig = {
  total: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function SalesChart() {
  const { selectedBusiness } = useBusiness();
  const { getSales } = useInventory();
  
  const [view, setView] = useState<'monthly' | 'daily'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const salesData = useMemo(() => getSales(selectedBusiness.id), [selectedBusiness.id, getSales]);

  const data = useMemo(() => {
    if (view === 'monthly') {
      const monthlySales = salesData.reduce((acc, sale) => {
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
    } else if (view === 'daily' && selectedMonth) {
        const monthDate = parse(selectedMonth, 'MMM', new Date());
        const startDate = startOfMonth(monthDate);
        const endDate = endOfMonth(monthDate);

        const salesForMonth = salesData.filter(sale => {
            const saleDate = new Date(sale.timestamp);
            return saleDate >= startDate && saleDate <= endDate;
        });
        
        const dailySales = salesForMonth.reduce((acc, sale) => {
            const day = format(new Date(sale.timestamp), 'd');
            if(!acc[day]) {
                acc[day] = 0;
            }
            acc[day] += sale.total;
            return acc;
        }, {} as Record<string, number>);
        
        return eachDayOfInterval({start: startDate, end: endDate}).map(day => {
            const dayOfMonth = format(day, 'd');
            return {
                name: dayOfMonth,
                total: dailySales[dayOfMonth] || 0
            }
        });
    }
    return [];
  }, [salesData, view, selectedMonth]);

  const handleBarClick = (payload: any) => {
    if (view === 'monthly' && payload && payload.activePayload) {
      const monthName = payload.activePayload[0].payload.name;
      setSelectedMonth(monthName);
      setView('daily');
    }
  };

  const handleBackClick = () => {
    setView('monthly');
    setSelectedMonth(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="font-headline">
                    {view === 'monthly' ? 'Sales Overview' : `Daily Sales for ${selectedMonth}`}
                </CardTitle>
                <CardDescription>
                    {view === 'monthly' ? 'A summary of your monthly sales revenue. Click a bar to drill down.' : 'A summary of your daily sales revenue.'}
                </CardDescription>
            </div>
            {view === 'daily' && (
                <Button variant="outline" size="sm" onClick={handleBackClick}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Monthly
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart accessibilityLayer data={data} onClick={handleBarClick}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value > 1000 ? `${value / 1000}k` : value}`}
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
