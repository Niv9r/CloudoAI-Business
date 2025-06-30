'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart';
import { useBusiness } from '@/context/business-context';

const chartDataSets: Record<string, { product: string; sales: number; fill: string }[]> = {
    biz_1: [
        { product: 'Classic Leather Wallet', sales: 275, fill: 'var(--color-wallet)' },
        { product: 'Silk Scarf', sales: 200, fill: 'var(--color-scarf)' },
        { product: 'Canvas Tote Bag', sales: 187, fill: 'var(--color-tote)' },
        { product: 'Sunglasses', sales: 173, fill: 'var(--color-sunglasses)' },
        { product: 'Other', sales: 90, fill: 'var(--color-other)' },
    ],
    biz_2: [
        { product: 'Espresso Machine', sales: 450, fill: 'var(--color-wallet)' },
        { product: 'Coffee Grinder', sales: 320, fill: 'var(--color-scarf)' },
        { product: 'Pastry Box', sales: 250, fill: 'var(--color-tote)' },
        { product: 'Iced Latte', sales: 210, fill: 'var(--color-sunglasses)' },
        { product: 'Other', sales: 150, fill: 'var(--color-other)' },
    ],
    biz_3: [
        { product: 'Bestseller Novel', sales: 600, fill: 'var(--color-wallet)' },
        { product: 'Bookmark Set', sales: 450, fill: 'var(--color-scarf)' },
        { product: 'Reading Light', sales: 300, fill: 'var(--color-tote)' },
        { product: 'Cookbook', sales: 250, fill: 'var(--color-sunglasses)' },
        { product: 'Other', sales: 120, fill: 'var(--color-other)' },
    ],
};


const chartConfig = {
  sales: {
    label: 'Sales',
  },
  wallet: {
    label: 'Wallet',
    color: 'hsl(var(--chart-1))',
  },
  scarf: {
    label: 'Scarf',
    color: 'hsl(var(--chart-2))',
  },
  tote: {
    label: 'Tote Bag',
    color: 'hsl(var(--chart-3))',
  },
  sunglasses: {
    label: 'Sunglasses',
    color: 'hsl(var(--chart-4))',
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export default function TopProductsChart() {
  const { selectedBusiness } = useBusiness();
  const chartData = chartDataSets[selectedBusiness.id] || chartDataSets.biz_1;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="font-headline">Top Selling Products</CardTitle>
        <CardDescription>An overview of your most popular items this month.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="sales"
              nameKey="product"
              innerRadius={60}
              strokeWidth={5}
            >
               {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="product" className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
