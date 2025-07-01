
'use client';

import { useEffect, useActionState, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleDetectAnomalies } from '@/ai/flows/detect-anomalies-flow';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2, AlertCircle, TrendingUp, TrendingDown, ShieldAlert, ArrowRight } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';
import Link from 'next/link';

const initialState = {
  anomalies: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Scanning...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-4 w-4" />
          Scan for Anomalies
        </>
      )}
    </Button>
  );
}

const severityIcons: Record<string, React.ReactNode> = {
    High: <ShieldAlert className="h-4 w-4 text-destructive" />,
    Medium: <TrendingDown className="h-4 w-4 text-orange-500" />,
    Low: <TrendingUp className="h-4 w-4 text-blue-500" />,
}

export default function AnomalyAlerts() {
  const { selectedBusiness } = useBusiness();
  const { getProducts, getSales } = useInventory();
  const [state, formAction] = useActionState(handleDetectAnomalies, initialState);
  const { toast } = useToast();

  const businessContext = JSON.stringify({
    businessProfile: selectedBusiness,
    products: getProducts(selectedBusiness.id),
    sales: getSales(selectedBusiness.id).slice(0, 50), // Use recent sales for anomaly detection
  });

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Anomaly Detection Failed',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
                <CardTitle className="font-headline">AI Anomaly Detection</CardTitle>
                <CardDescription>Proactively scan your business data for unusual patterns.</CardDescription>
            </div>
            <form action={formAction}>
                <input type="hidden" name="businessContext" value={businessContext} />
                <SubmitButton />
            </form>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.anomalies === undefined && (
             <div className="flex flex-col items-center justify-center h-24 text-center text-muted-foreground">
                <p className="font-semibold">Ready to scan for insights</p>
                <p>Click the button to have our AI analyze your data for anomalies.</p>
            </div>
        )}
        {state.anomalies && state.anomalies.length === 0 && (
            <div className="flex flex-col items-center justify-center h-24 text-center text-muted-foreground">
                <p className="font-semibold">All Clear!</p>
                <p>Our AI scanned your data and found no significant anomalies.</p>
            </div>
        )}
        {state.anomalies && state.anomalies.length > 0 && (
             <div className="space-y-3">
                {state.anomalies.map((anomaly, index) => (
                    <Alert key={index} variant={anomaly.severity === 'High' ? 'destructive' : 'default'}>
                        {severityIcons[anomaly.severity]}
                        <AlertTitle>{anomaly.title}</AlertTitle>
                        <AlertDescription>
                            {anomaly.description}
                            {anomaly.relevantLink && (
                                <Link href={anomaly.relevantLink} passHref>
                                    <Button variant="link" className="p-0 h-auto ml-2">
                                        Investigate <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </Link>
                            )}
                        </AlertDescription>
                    </Alert>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}

    