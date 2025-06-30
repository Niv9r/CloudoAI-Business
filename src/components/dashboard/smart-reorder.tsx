'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleSuggestReorder } from '@/ai/flows/suggest-reorder-flow';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Package, AlertCircle } from 'lucide-react';
import { Separator } from '../ui/separator';

const initialState = {
  suggestions: [],
  summary: '',
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Lightbulb className="mr-2 h-4 w-4" />
      )}
      Suggest Reorder
    </Button>
  );
}

export default function SmartReorder() {
  const [state, formAction] = useActionState(handleSuggestReorder, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Smart Reorder Suggestions</CardTitle>
        <CardDescription>
          Use AI to get recommendations on what to reorder based on current stock.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {state.suggestions.length === 0 && !state.summary && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Lightbulb className="h-12 w-12 mb-4 text-primary/20" />
            <p className="font-semibold">Ready for suggestions</p>
            <p className="text-sm">Click the button below to get AI-powered reorder recommendations.</p>
          </div>
        )}

        {state.summary && (
             <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Inventory Summary</AlertTitle>
                <AlertDescription>{state.summary}</AlertDescription>
            </Alert>
        )}
        
        {state.suggestions.length > 0 && (
          <div className="space-y-4">
            {state.suggestions.map((item) => (
              <div key={item.productId}>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <form action={formAction} className="w-full">
          <SubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}
