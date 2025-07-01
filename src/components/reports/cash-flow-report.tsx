
'use client';

import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';

interface CashFlowReportProps {
  dateRange: DateRange | undefined;
}

export default function CashFlowReport({ dateRange }: CashFlowReportProps) {
  const { selectedBusiness } = useBusiness();
  const { getSales, getExpenses } = useInventory();
  
  const allSales = getSales(selectedBusiness.id);
  const allExpenses = getExpenses(selectedBusiness.id);

  const { cashInflows, cashOutflows, netCashFlow } = useMemo(() => {
    // This is a simplified, non-GAAP cash flow statement for demonstration purposes.

    const filteredSales = allSales.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        return !dateRange || (
            (!dateRange.from || saleDate >= startOfDay(dateRange.from)) &&
            (!dateRange.to || saleDate <= endOfDay(dateRange.to))
        );
    });

    const filteredExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.issueDate);
        return !dateRange || (
            (!dateRange.from || expenseDate >= startOfDay(dateRange.from)) &&
            (!dateRange.to || expenseDate <= endOfDay(dateRange.to))
        );
    });

    // Cash Inflows
    const cashFromSales = filteredSales.flatMap(s => s.payments).reduce((acc, p) => p.method === 'Cash' ? acc + p.amount : acc, 0);
    const cardFromSales = filteredSales.flatMap(s => s.payments).reduce((acc, p) => p.method === 'Card' ? acc + p.amount : acc, 0);
    const totalInflows = cashFromSales + cardFromSales;

    // Cash Outflows
    const paidExpenses = filteredExpenses.filter(e => e.status === 'Paid').reduce((acc, e) => acc + e.total, 0);
    const totalOutflows = paidExpenses;

    const netCashFlow = totalInflows - totalOutflows;

    return {
        cashInflows: {
            cashSales: cashFromSales,
            cardSales: cardFromSales,
            total: totalInflows
        },
        cashOutflows: {
            paidExpenses: paidExpenses,
            total: totalOutflows
        },
        netCashFlow
    };

  }, [dateRange, allSales, allExpenses]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Statement (Simplified)</CardTitle>
        <CardDescription>An overview of cash moving in and out of your business.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
            <TableBody>
                {/* Cash Inflows */}
                <TableRow>
                    <TableCell className="font-semibold">Cash from Operations</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Cash Sales</TableCell>
                    <TableCell className="text-right">{formatCurrency(cashInflows.cashSales)}</TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Card Sales</TableCell>
                    <TableCell className="text-right">{formatCurrency(cashInflows.cardSales)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="pl-4 font-semibold">Net Cash Inflows</TableCell>
                    <TableCell className="text-right font-semibold border-t">{formatCurrency(cashInflows.total)}</TableCell>
                </TableRow>

                {/* Cash Outflows */}
                <TableRow>
                    <TableCell className="pt-6 font-semibold">Cash Outflows</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Operating Expenses Paid</TableCell>
                    <TableCell className="text-right">({formatCurrency(cashOutflows.paidExpenses)})</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="pl-4 font-semibold">Net Cash Outflows</TableCell>
                    <TableCell className="text-right font-semibold border-t">({formatCurrency(cashOutflows.total)})</TableCell>
                </TableRow>

                {/* Net Cash Flow */}
                <TableRow>
                    <TableCell className="font-bold text-lg border-t-2 border-primary pt-4">Net Cash Flow</TableCell>
                    <TableCell className="text-right font-bold text-lg border-t-2 border-primary pt-4">{formatCurrency(netCashFlow)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    