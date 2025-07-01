
'use client';

import { useActionState, useTransition } from 'react';
import type { Product } from '@/lib/types';
import { handleMarketResearch, type MarketResearchOutput } from '@/ai/flows/dynamic-pricing-flow';
import { Button, buttonVariants } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WandSparkles, Loader2, BarChart, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

const initialState: { result?: MarketResearchOutput; error?: string; } = {
  result: undefined,
  error: undefined,
};

export default function MarketResearchAssistant({ product }: { product: Product }) {
  const [state, formAction] = useActionState(handleMarketResearch, initialState);
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
      <h3 className="text-lg font-semibold mb-2">AI Market Research</h3>
      <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
        <p className="text-sm text-muted-foreground">
          Use AI to perform market research on this product, analyzing competitor pricing and positioning in the UK market.
        </p>
        
        <Button onClick={runAction} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Researching Market...
            </>
          ) : (
            <>
              <WandSparkles className="mr-2 h-4 w-4" />
              Research Market
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
                    <CardTitle>Market Summary</CardTitle>
                    <CardDescription>An AI-generated summary of your product's market position.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <BarChart className="h-4 w-4" />
                        <AlertTitle>Analyst's Summary</AlertTitle>
                        <AlertDescription className="prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.result.marketSummary}</ReactMarkdown>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Market Analysis</CardTitle>
                    <CardDescription>Relevant products found during research.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-48">
                      <ul className="space-y-3 pr-4">
                          {state.result.marketAnalysis.map((c, i) => (
                              <li key={i} className="flex items-center justify-between text-sm border-b pb-2">
                                  <div>
                                      <p className="font-medium">{c.productName}</p>
                                      <p className="text-lg font-semibold">£{c.price.toFixed(2)}</p>
                                  </div>
                                  <a 
                                    href={c.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                                  >
                                      View <LinkIcon className="ml-2 h-3 w-3" />
                                  </a>
                              </li>
                          ))}
                      </ul>
                    </ScrollArea>
                </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
