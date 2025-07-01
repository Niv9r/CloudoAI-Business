
'use client';

import { useMemo, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { DateRange } from 'react-day-picker';
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

interface BalanceSheetReportProps {
  dateRange: DateRange | undefined;
}

export default function BalanceSheetReport({ dateRange }: BalanceSheetReportProps) {
  const { selectedBusiness } = useBusiness();
  const { getProducts, getWholesaleOrders, getExpenses } = useInventory();
  
  const [state, formAction] = useActionState(handleExplainFinancials, { explanation: undefined, error: undefined });

  const allProducts = getProducts(selectedBusiness.id);
  const allWholesaleOrders = getWholesaleOrders(selectedBusiness.id);
  const allExpenses = getExpenses(selectedBusiness.id);

  const reportData = useMemo(() => {
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

  const { assets, liabilities, equity } = reportData;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>Balance Sheet (Simplified)</CardTitle>
            <CardDescription>A snapshot of your business's financial position.</CardDescription>
        </div>
        <form action={formAction}>
            <input type="hidden" name="reportName" value="Balance Sheet" />
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
