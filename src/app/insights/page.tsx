'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';
import { handleGenerateInsights } from '@/ai/flows/generate-business-insights-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, Sparkles, ShoppingCart, Package, Users, CreditCard, BrainCircuit } from 'lucide-react';
import InsightCard from '@/components/insights/insight-card';

const initialState = {
  insights: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="lg" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Analyzing Your Business...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          Generate Business Insights
        </>
      )}
    </Button>
  );
}

export default function InsightsPage() {
  const { selectedBusiness } = useBusiness();
  const { getProducts, getSales, getExpenses, getVendors } = useInventory();
  const [state, formAction] = useActionState(handleGenerateInsights, initialState);

  const products = getProducts(selectedBusiness.id);
  const sales = getSales(selectedBusiness.id);
  const expenses = getExpenses(selectedBusiness.id);
  const vendors = getVendors(selectedBusiness.id);

  const businessContext = JSON.stringify({
    businessProfile: selectedBusiness,
    products: products,
    sales: sales,
    expenses: expenses,
    vendors: vendors,
  });

  return (
    <div className="flex h-full w-full flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">AI Business Insights</h1>
          <p className="text-muted-foreground">
            Get a comprehensive, AI-powered analysis of your entire business operation.
          </p>
        </div>
      </div>

      {!state.insights && (
         <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Lightbulb className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold">Ready for Deep Insights?</h3>
            <p className="text-muted-foreground mb-6 max-w-lg">
                Click the button below and our AI will perform a holistic analysis of your sales, inventory, expenses, and more to uncover actionable insights and strategic recommendations.
            </p>
            <form action={formAction}>
              <input type="hidden" name="businessContext" value={businessContext} />
              <SubmitButton />
            </form>
        </div>
      )}

      {state.error && (
        <Alert variant="destructive">
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      
      {state.insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <InsightCard 
                title="Revenue & Profit Analysis"
                icon={<ShoppingCart />}
                markdownContent={state.insights.revenueAndProfit}
            />
             <InsightCard 
                title="Inventory Analysis"
                icon={<Package />}
                markdownContent={state.insights.inventory}
            />
             <InsightCard 
                title="Employee Performance"
                icon={<Users />}
                markdownContent={state.insights.employeePerformance}
            />
             <InsightCard 
                title="Expense Breakdown"
                icon={<CreditCard />}
                markdownContent={state.insights.expenseAnalysis}
            />
             <div className="lg:col-span-2">
                <InsightCard 
                    title="Strategic Suggestions"
                    icon={<BrainCircuit />}
                    markdownContent={state.insights.strategicSuggestions}
                />
            </div>
             <div className="lg:col-span-2 text-center">
                <form action={formAction}>
                    <input type="hidden" name="businessContext" value={businessContext} />
                    <SubmitButton />
                </form>
            </div>
        </div>
      )}

    </div>
  );
}
