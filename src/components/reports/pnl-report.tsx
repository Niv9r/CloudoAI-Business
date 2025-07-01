
'use client';

import { useMemo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';
import { handleExplainFinancials } from '@/ai/flows/explain-financials-flow';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { BrainCircuit, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="outline" size="sm" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <BrainCircuit className="mr-2 h-4 w-4" />
          Explain this Report
        </>
      )}
    </Button>
  );
}

interface PnlReportProps {
  dateRange: DateRange | undefined;
}

export default function PnlReport({ dateRange }: PnlReportProps) {
  const { selectedBusiness } = useBusiness();
  const { getSales, getExpenses } = useInventory();
  
  const [state, formAction] = useActionState(handleExplainFinancials, { explanation: undefined, error: undefined });

  const allSales = getSales(selectedBusiness.id);
  const allExpenses = getExpenses(selectedBusiness.id);

  const reportData = useMemo(() => {
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

    const revenue = filteredSales.reduce((acc, sale) => acc + (sale.subtotal - sale.discount), 0);
    const cogs = filteredSales.flatMap(s => s.lineItems).reduce((acc, item) => acc + (item.costAtTimeOfSale * item.quantity), 0);
    const grossProfit = revenue - cogs;
    const expenses = filteredExpenses.reduce((acc, expense) => acc + expense.total, 0);
    const netProfit = grossProfit - expenses;

    return { revenue, cogs, grossProfit, expenses, netProfit };

  }, [dateRange, allSales, allExpenses]);

  const { revenue, cogs, grossProfit, expenses, netProfit } = reportData;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>Profit &amp; Loss Statement</CardTitle>
            <CardDescription>An overview of your business's profitability for the selected period.</CardDescription>
        </div>
        <form action={formAction}>
            <input type="hidden" name="reportName" value="Profit & Loss" />
            <input type="hidden" name="reportData" value={JSON.stringify(reportData)} />
            <SubmitButton />
        </form>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.explanation && (
            <Alert>
                <BrainCircuit className="h-4 w-4" />
                <AlertTitle>AI Financial Analyst</AlertTitle>
                <AlertDescription className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.explanation}</ReactMarkdown>
                </AlertDescription>
            </Alert>
        )}
        {state.error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}
        <Table>
            <TableBody>
                <TableRow>
                    <TableCell className="font-semibold">Revenue</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(revenue)}</TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Cost of Goods Sold (COGS)</TableCell>
                    <TableCell className="text-right">({formatCurrency(cogs)})</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="font-bold border-t">Gross Profit</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold border-t">{formatCurrency(grossProfit)}</TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell className="pt-6 font-semibold">Operating Expenses</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Total Expenses</TableCell>
                    <TableCell className="text-right">({formatCurrency(expenses)})</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                 <TableRow>
                    <TableCell className="font-bold text-lg border-t-2 border-primary">Net Profit</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold text-lg border-t-2 border-primary">{formatCurrency(netProfit)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
