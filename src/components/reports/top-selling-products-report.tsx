
'use client';

import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';
import type { SaleLineItem } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';

interface TopSellingProductsReportProps {
  dateRange: DateRange | undefined;
}

interface ProductSalesInfo {
    productId: string;
    name: string;
    unitsSold: number;
    grossRevenue: number;
}

export default function TopSellingProductsReport({ dateRange }: TopSellingProductsReportProps) {
    const { selectedBusiness } = useBusiness();
    const { getSales } = useInventory();
    const sales = getSales(selectedBusiness.id);

    const productSales = useMemo(() => {
        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.timestamp);
            return !dateRange || (
                (!dateRange.from || saleDate >= startOfDay(dateRange.from)) &&
                (!dateRange.to || saleDate <= endOfDay(dateRange.to))
            );
        });

        const allLineItems = filteredSales.flatMap(s => s.lineItems);

        const productMap = allLineItems.reduce<Record<string, ProductSalesInfo>>((acc, item) => {
            if (!acc[item.productId]) {
                acc[item.productId] = {
                    productId: item.productId,
                    name: item.name,
                    unitsSold: 0,
                    grossRevenue: 0,
                };
            }

            acc[item.productId].unitsSold += item.quantity;
            acc[item.productId].grossRevenue += item.subtotal;

            return acc;
        }, {});
        
        return Object.values(productMap).sort((a, b) => b.unitsSold - a.unitsSold);

    }, [dateRange, sales]);

    return (
        <Card className="h-full w-full flex flex-col">
            <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products ranked by units sold in the selected period.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                 <div className="border rounded-md">
                    <ScrollArea className="h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Units Sold</TableHead>
                                    <TableHead className="text-right">Gross Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productSales.length > 0 ? productSales.map(product => (
                                    <TableRow key={product.productId}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="text-right">{product.unitsSold}</TableCell>
                                        <TableCell className="text-right">${product.grossRevenue.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No sales data for this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
