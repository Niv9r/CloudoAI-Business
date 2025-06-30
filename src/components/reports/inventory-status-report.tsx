
'use client';

import { useMemo } from 'react';
import { useInventory } from '@/context/inventory-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart';
import type { Product } from '@/lib/types';

const chartConfig = {
  count: {
    label: 'Products',
  },
  'in-stock': {
    label: 'In Stock',
    color: 'hsl(var(--chart-2))',
  },
  'low-stock': {
    label: 'Low Stock',
    color: 'hsl(var(--chart-3))',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;


export default function InventoryStatusReport() {
    const { products } = useInventory();

    const chartData = useMemo(() => {
        const statusMap: Record<Product['status'], { key: string, label: string }> = {
            'In Stock': { key: 'in-stock', label: 'In Stock'},
            'Low Stock': { key: 'low-stock', label: 'Low Stock'},
            'Out of Stock': { key: 'out-of-stock', label: 'Out of Stock'},
        };

        const statusCounts = products.reduce((acc, product) => {
            const { status } = product;
            if(!acc[status]) {
                acc[status] = { name: statusMap[status].label, count: 0, fill: `var(--color-${statusMap[status].key})` };
            }
            acc[status].count += 1;
            return acc;
        }, {} as Record<string, { name: string; count: number; fill: string }>);

        return Object.values(statusCounts);
    }, [products]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory Status Overview</CardTitle>
                <CardDescription>A summary of product stock levels across your inventory.</CardDescription>
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
                          dataKey="count"
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
                    <p>No inventory data to display.</p>
                  </div>
                )}
            </CardContent>
        </Card>
    );
}
