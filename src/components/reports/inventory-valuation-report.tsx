
'use client';

import { useMemo } from 'react';
import { useInventory } from '@/context/inventory-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBusiness } from '@/context/business-context';

export default function InventoryValuationReport() {
    const { selectedBusiness } = useBusiness();
    const { getProducts } = useInventory();
    const products = getProducts(selectedBusiness.id);

    const summary = useMemo(() => {
        const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
        const totalCostValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
        const totalRetailValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
        const potentialProfit = totalRetailValue - totalCostValue;

        return {
            totalUnits,
            totalCostValue,
            totalRetailValue,
            potentialProfit,
        };
    }, [products]);

    return (
        <Card className="h-full w-full flex flex-col">
            <CardHeader>
                <CardTitle>Inventory Valuation</CardTitle>
                <CardDescription>A snapshot of your current inventory's value.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-8">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Total Units</p>
                        <p className="text-2xl font-bold">{summary.totalUnits.toLocaleString()}</p>
                    </div>
                     <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Total Cost Value</p>
                        <p className="text-2xl font-bold">${summary.totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                     <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Total Retail Value</p>
                        <p className="text-2xl font-bold">${summary.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                     <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Potential Profit</p>
                        <p className="text-2xl font-bold">${summary.potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold mb-4">Breakdown by Product</h3>
                     <div className="border rounded-md flex-1">
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                        <TableHead className="text-right">Cost/Unit</TableHead>
                                        <TableHead className="text-right">Total Cost Value</TableHead>
                                        <TableHead className="text-right">Price/Unit</TableHead>
                                        <TableHead className="text-right">Total Retail Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="text-right">{product.stock}</TableCell>
                                            <TableCell className="text-right">${product.cost.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">${(product.stock * product.cost).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">${(product.stock * product.price).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
