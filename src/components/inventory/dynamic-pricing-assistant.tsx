
'use client';

import { useActionState, useTransition } from 'react';
import type { Product } from '@/lib/types';
import { handleDynamicPricing } from '@/ai/flows/dynamic-pricing-flow';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WandSparkles, Loader2, BarChart, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const initialState = {
  result: undefined,
  error: undefined,
};

export default function DynamicPricingAssistant({ product }: { product: Product }) {
  const [state, formAction] = useActionState(handleDynamicPricing, initialState);
  const [isPending, startTransition] = useTransition();

  const runAction = () => {
    const formData = new FormData();
    formData.append('product', JSON.stringify(product));
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Dynamic Pricing Assistant</h3>
      <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
        <p className="text-sm text-muted-foreground">
          Use AI to analyze competitor pricing in the UK market and get a suggested selling price for this product.
        </p>
        
        <Button onClick={runAction} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Market...
            </>
          ) : (
            <>
              <WandSparkles className="mr-2 h-4 w-4" />
              Suggest Optimal Price
            </>
          )}
        </Button>
        
        {state.error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}

        {state.result && (
          <div className="space-y-4 pt-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Pricing Suggestion</CardTitle>
                    <CardDescription>Based on UK market analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-4xl font-bold text-primary">£{state.result.suggestedPrice.toFixed(2)}</p>
                    <Alert>
                        <BarChart className="h-4 w-4" />
                        <AlertTitle>Analyst's Reasoning</AlertTitle>
                        <AlertDescription>{state.result.reasoning}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Competitor Snapshot</CardTitle>
                    <CardDescription>Top competitors found during analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {state.result.competitors.map((c, i) => (
                            <li key={i} className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="font-medium">{c.productName}</p>
                                    <p className="text-lg font-semibold">£{c.price.toFixed(2)}</p>
                                </div>
                                <a href={c.url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        View <LinkIcon className="ml-2 h-3 w-3" />
                                    </Button>
                                </a>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
