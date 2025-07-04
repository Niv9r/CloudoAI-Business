
'use client';

import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';
import { useEmployee } from '@/context/employee-context';

interface EmployeeSalesReportProps {
  dateRange: DateRange | undefined;
}

const chartConfig = {
  total: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function EmployeeSalesReport({ dateRange }: EmployeeSalesReportProps) {
  const { selectedBusiness } = useBusiness();
  const { getSales } = useInventory();
  const { getEmployees } = useEmployee();
  
  const allSales = getSales(selectedBusiness.id);
  const allEmployees = getEmployees(selectedBusiness.id);

  const chartData = useMemo(() => {
    const filteredSales = allSales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return !dateRange || (
        (!dateRange.from || saleDate >= startOfDay(dateRange.from)) &&
        (!dateRange.to || saleDate <= endOfDay(dateRange.to))
      );
    });

    const salesByEmployee = filteredSales.reduce((acc, sale) => {
        const employeeName = allEmployees.find(e => e.id === sale.employeeId)?.name || 'Unknown';
        if(!acc[employeeName]) {
            acc[employeeName] = { name: employeeName, total: 0 };
        }
        acc[employeeName].total += sale.total;
        return acc;
    }, {} as Record<string, {name: string, total: number}>);
    
    return Object.values(salesByEmployee).sort((a,b) => b.total - a.total);

  }, [dateRange, allSales, allEmployees]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Employee</CardTitle>
        <CardDescription>A summary of total sales revenue generated by each employee.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="pl-2 h-[350px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart accessibilityLayer data={chartData} layout="vertical">
                <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
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
          <div className="flex items-center justify-center h-[350px] text-muted-foreground bg-muted/50 rounded-md">
            <p>No sales data to display for this period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    