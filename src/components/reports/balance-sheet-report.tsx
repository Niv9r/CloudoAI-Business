
'use client';

import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';

interface BalanceSheetReportProps {
  dateRange: DateRange | undefined;
}

export default function BalanceSheetReport({ dateRange }: BalanceSheetReportProps) {
  const { selectedBusiness } = useBusiness();
  const { getProducts, getWholesaleOrders, getExpenses } = useInventory();
  
  const allProducts = getProducts(selectedBusiness.id);
  const allWholesaleOrders = getWholesaleOrders(selectedBusiness.id);
  const allExpenses = getExpenses(selectedBusiness.id);

  const { assets, liabilities, equity } = useMemo(() => {
    // This is a simplified, non-GAAP balance sheet for demonstration purposes.
    // A real balance sheet would require a much more complex data model.

    // Assets
    const inventoryValue = allProducts.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const accountsReceivable = allWholesaleOrders
        .filter(o => o.status === 'Awaiting Payment' || o.status === 'Awaiting Fulfillment' || o.status === 'Shipped')
        .reduce((acc, o) => acc + o.total, 0);
    const cash = 5000; // Mock cash on hand
    const totalAssets = inventoryValue + accountsReceivable + cash;

    // Liabilities
    const accountsPayable = allExpenses
        .filter(e => e.status === 'Pending' || e.status === 'Overdue')
        .reduce((acc, e) => acc + e.total, 0);
    const totalLiabilities = accountsPayable;

    // Equity
    const totalEquity = totalAssets - totalLiabilities;
    
    return {
        assets: {
            cash,
            inventoryValue,
            accountsReceivable,
            total: totalAssets
        },
        liabilities: {
            accountsPayable,
            total: totalLiabilities,
        },
        equity: totalEquity
    };
  }, [allProducts, allWholesaleOrders, allExpenses]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet (Simplified)</CardTitle>
        <CardDescription>A snapshot of your business's financial position.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
            <TableBody>
                {/* Assets */}
                <TableRow>
                    <TableCell className="font-bold text-lg">Assets</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Cash</TableCell>
                    <TableCell className="text-right">{formatCurrency(assets.cash)}</TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Accounts Receivable</TableCell>
                    <TableCell className="text-right">{formatCurrency(assets.accountsReceivable)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Inventory</TableCell>
                    <TableCell className="text-right">{formatCurrency(assets.inventoryValue)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="pl-4 font-semibold">Total Assets</TableCell>
                    <TableCell className="text-right font-semibold border-t">{formatCurrency(assets.total)}</TableCell>
                </TableRow>

                {/* Liabilities */}
                <TableRow>
                    <TableCell className="pt-6 font-bold text-lg">Liabilities</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Accounts Payable</TableCell>
                    <TableCell className="text-right">{formatCurrency(liabilities.accountsPayable)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="pl-4 font-semibold">Total Liabilities</TableCell>
                    <TableCell className="text-right font-semibold border-t">{formatCurrency(liabilities.total)}</TableCell>
                </TableRow>

                 {/* Equity */}
                 <TableRow>
                    <TableCell className="pt-6 font-bold text-lg">Equity</TableCell>
                     <TableCell></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="pl-4 font-semibold">Total Equity</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(equity)}</TableCell>
                </TableRow>

                {/* Total Liabilities + Equity */}
                <TableRow>
                    <TableCell className="font-bold text-lg border-t-2 border-primary pt-4">Total Liabilities & Equity</TableCell>
                    <TableCell className="text-right font-bold text-lg border-t-2 border-primary pt-4">{formatCurrency(liabilities.total + equity)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    