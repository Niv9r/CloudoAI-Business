'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart';
import { useBusiness } from '@/context/business-context';
import { useInventory } from '@/context/inventory-context';

const chartConfigBase = {
  sales: { label: 'Sales' },
  color1: { label: 'Color1', color: 'hsl(var(--chart-1))' },
  color2: { label: 'Color2', color: 'hsl(var(--chart-2))' },
  color3: { label: 'Color3', color: 'hsl(var(--chart-3))' },
  color4: { label: 'Color4', color: 'hsl(var(--chart-4))' },
  color5: { label: 'Other', color: 'hsl(var(--chart-5))' },
};

export default function TopProductsChart() {
  const { selectedBusiness } = useBusiness();
  const { getSales } = useInventory();
  
  const { chartData, chartConfig } = React.useMemo(() => {
    const sales = getSales(selectedBusiness.id);
    const productSales: { [key: string]: number } = {};

    sales.forEach(sale => {
      sale.lineItems.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.subtotal;
      });
    });

    const sortedProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a);

    const top4 = sortedProducts.slice(0, 4);
    const otherSales = sortedProducts.slice(4).reduce((acc, [, sales]) => acc + sales, 0);

    const chartData = top4.map(([product, sales], index) => ({
      product,
      sales,
      fill: `var(--color-color${index + 1})`
    }));

    if (otherSales > 0) {
      chartData.push({
        product: 'Other',
        sales: otherSales,
        fill: 'var(--color-color5)'
      });
    }

    const newChartConfig: ChartConfig = { sales: { label: 'Sales' } };
    chartData.forEach((item, index) => {
        const key = `color${index + 1}`;
        newChartConfig[item.product] = {
            label: item.product,
            color: `hsl(var(--chart-${index + 1}))`
        }
    });


    return { chartData, chartConfig: newChartConfig };

  }, [selectedBusiness.id, getSales]);

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
