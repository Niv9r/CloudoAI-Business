'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleBusinessCopilotQuery } from '@/ai/flows/business-copilot-flow';
import { useInventory } from '@/context/inventory-context';
import { useCustomer } from '@/context/customer-context';
import { useBusiness } from '@/context/business-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Message {
  role: 'user' | 'ai';
  content: string;
  link?: string;
}

const initialState = {
  messages: [] as Message[],
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
      Ask
    </Button>
  );
}

export default function AiCopilot() {
  const { selectedBusiness } = useBusiness();
  const { getProducts, getSales, getExpenses } = useInventory();
  const { getCustomers } = useCustomer();

  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [state, formAction] = useActionState(handleBusinessCopilotQuery, initialState);

  const businessContext = JSON.stringify({
    businessProfile: selectedBusiness,
    products: getProducts(selectedBusiness.id).slice(0, 10),
    sales: getSales(selectedBusiness.id).slice(0, 10),
    expenses: getExpenses(selectedBusiness.id).slice(0, 10),
    customers: getCustomers(selectedBusiness.id).slice(0,10),
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'AI Co-Pilot Error',
        description: state.error,
      });
    }
    if (state.messages.length > 0) {
      formRef.current?.reset();
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [state, toast]);

  return (
    <Card className="w-full flex flex-col h-[60vh] max-h-[700px]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-headline">AI Co-Pilot</CardTitle>
            <CardDescription>Ask anything about your business. Remembers conversation context.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
           <div className="space-y-4">
            {state.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <p className="font-semibold">Start a conversation!</p>
                <p className="text-sm">Try asking "Who is my top performing employee?" or "Which products are selling fastest?"</p>
              </div>
            ) : (
              state.messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3 text-sm", message.role === 'user' && 'justify-end')}>
                  {message.role === 'ai' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="AI" data-ai-hint="logo abstract"/>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    'rounded-lg px-4 py-2 max-w-[80%]', 
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    <div className="prose prose-sm prose-p:leading-normal max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                    {message.link && (
                        <div className='mt-2'>
                            <Link href={message.link} passHref>
                              <Button variant={message.role === 'user' ? 'secondary' : 'outline'} size="sm">
                                  Go to suggested page <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                        </div>
                    )}
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="person avatar"/>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <form ref={formRef} action={formAction} className="flex items-center gap-2 border-t pt-4">
          <Input name="query" placeholder="e.g., How did they compare to last month?" required />
          <input type="hidden" name="businessContext" value={businessContext} />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
