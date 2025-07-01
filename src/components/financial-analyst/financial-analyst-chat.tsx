
'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleFinancialQuery } from '@/ai/flows/financial-analyst-flow';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { BrainCircuit, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const initialState = {
  response: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <BrainCircuit className="mr-2 h-4 w-4" />
      )}
      Ask Analyst
    </Button>
  );
}

export default function FinancialAnalystChat() {
  const { selectedBusiness } = useBusiness();
  const { getSales, getExpenses, getProducts, getWholesaleOrders } = useInventory();

  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(handleFinancialQuery, initialState);

  // --- Start of Financial Reports Calculation ---
  const { pnl, balanceSheet, cashFlow } = useMemo(() => {
    const allSales = getSales(selectedBusiness.id);
    const allExpenses = getExpenses(selectedBusiness.id);
    const allProducts = getProducts(selectedBusiness.id);
    const allWholesaleOrders = getWholesaleOrders(selectedBusiness.id);

    // P&L
    const revenue = allSales.reduce((acc, sale) => acc + (sale.subtotal - sale.discount), 0);
    const cogs = allSales.flatMap(s => s.lineItems).reduce((acc, item) => acc + (item.costAtTimeOfSale * item.quantity), 0);
    const grossProfit = revenue - cogs;
    const expensesTotal = allExpenses.reduce((acc, expense) => acc + expense.total, 0);
    const netProfit = grossProfit - expensesTotal;
    const pnl = { revenue, cogs, grossProfit, expenses: expensesTotal, netProfit };

    // Balance Sheet
    const inventoryValue = allProducts.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const accountsReceivable = allWholesaleOrders.filter(o => o.status === 'Awaiting Payment' || o.status === 'Shipped').reduce((acc, o) => acc + o.total, 0);
    const cash = 5000; // Mock
    const totalAssets = inventoryValue + accountsReceivable + cash;
    const accountsPayable = allExpenses.filter(e => e.status === 'Pending' || e.status === 'Overdue').reduce((acc, e) => acc + e.total, 0);
    const totalLiabilities = accountsPayable;
    const totalEquity = totalAssets - totalLiabilities;
    const balanceSheet = { assets: { total: totalAssets, inventory: inventoryValue, accountsReceivable }, liabilities: { total: totalLiabilities, accountsPayable }, equity: { total: totalEquity } };

    // Cash Flow
    const cashFromSales = allSales.flatMap(s => s.payments).reduce((acc, p) => p.method === 'Cash' ? acc + p.amount : acc, 0);
    const cardFromSales = allSales.flatMap(s => s.payments).reduce((acc, p) => p.method === 'Card' ? acc + p.amount : acc, 0);
    const totalInflows = cashFromSales + cardFromSales;
    const paidExpenses = allExpenses.filter(e => e.status === 'Paid').reduce((acc, e) => acc + e.total, 0);
    const totalOutflows = paidExpenses;
    const netCashFlow = totalInflows - totalOutflows;
    const cashFlow = { inflows: { total: totalInflows, fromSales: cashFromSales + cardFromSales }, outflows: { total: totalOutflows, forExpenses: paidExpenses }, netCashFlow };
    
    return { pnl, balanceSheet, cashFlow };

  }, [selectedBusiness.id, getSales, getExpenses, getProducts, getWholesaleOrders]);
  // --- End of Financial Reports Calculation ---

  const financialContext = JSON.stringify({ pnl, balanceSheet, cashFlow });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'AI Analyst Error',
        description: state.error,
      });
    }
  }, [state.error, toast]);
  
  useEffect(() => {
    if(state.response) {
        formRef.current?.reset();
    }
  }, [state.response]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-end">
        {state.response ? (
             <Alert className="flex-1 overflow-y-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analyst Response</AlertTitle>
                <AlertDescription className="prose prose-sm prose-p:leading-normal max-w-none">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.response}</ReactMarkdown>
                </AlertDescription>
            </Alert>
        ) : (
             <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <BrainCircuit className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Your AI Financial Analyst is ready.</h3>
                <p className="text-muted-foreground mb-6 max-w-lg">
                    Ask questions like "What was my biggest expense category?" or "Why did my net profit margin decrease last month?"
                </p>
            </div>
        )}

        <form ref={formRef} action={formAction} className="flex items-center gap-2">
          <Input name="query" placeholder="e.g., Give me a summary of my financial health this quarter." required />
          <input type="hidden" name="financialContext" value={financialContext} />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

