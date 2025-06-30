'use client';

import { useEffect, useRef } from 'react';
import { useFormStatus, useActionState } from 'react-dom';
import { handleBusinessCopilotQuery } from '@/ai/flows/business-copilot-flow';
import { useInventory } from '@/context/inventory-context';
import { sales, expenses } from '@/lib/mock-data'; // Using mock data for now
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

const initialState = {
  response: undefined,
  suggestedActionLink: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Ask Co-Pilot
    </Button>
  );
}

export default function AiCopilot() {
  const { products } = useInventory();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(handleBusinessCopilotQuery, initialState);

  const businessContext = JSON.stringify({
    products: products.slice(0, 10), // Limit context size for now
    sales: sales.slice(0, 10),
    expenses: expenses.slice(0, 10),
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'AI Co-Pilot Error',
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-headline">AI Co-Pilot</CardTitle>
            <CardDescription>Ask anything about your business.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={formRef} action={formAction} className="flex items-center gap-2">
          <Input name="query" placeholder="e.g., What were my total expenses last month?" required />
          <input type="hidden" name="businessContext" value={businessContext} />
          <SubmitButton />
        </form>

        {state.response && (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Co-Pilot Response</AlertTitle>
                <AlertDescription className="prose prose-sm prose-p:leading-normal max-w-none">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.response}</ReactMarkdown>
                </AlertDescription>
                {state.suggestedActionLink && (
                    <div className='mt-4'>
                        <Link href={state.suggestedActionLink} passHref>
                           <Button variant="outline" size="sm">
                                Go to suggested page <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        </Link>
                    </div>
                )}
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
