'use client';

import { useFormStatus } from 'react-dom';
import { handleSuggestReorderAlgorithm, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Terminal } from 'lucide-react';
import { useEffect, useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState: FormState = {
  message: '',
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Analyzing...' : 'Get Suggestion'}
    </Button>
  );
}

export default function SmartReorder() {
  const [state, formAction] = useActionState(handleSuggestReorderAlgorithm, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if(state.message && !state.error && state.data){
        toast({
            title: "Analysis Complete",
            description: state.message,
        })
    }
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: state.error,
      })
    }
  }, [state, toast]);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Lightbulb className="text-primary"/>Smart Reorder</CardTitle>
          <CardDescription>
            Let AI suggest the best reordering algorithm for your product based on its sales history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input id="productName" name="productName" placeholder="e.g., Artisan Coffee Beans" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="historicalSalesData">Historical Sales Data</Label>
            <Textarea
              id="historicalSalesData"
              name="historicalSalesData"
              placeholder="Enter sales data, e.g., 'Jan: 50, Feb: 55, Mar: 60' or paste CSV data."
              className="min-h-[100px]"
              required
            />
          </div>
          {state.data && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>{state.data.algorithmSuggestion}</AlertTitle>
              <AlertDescription>
                {state.data.justification}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
