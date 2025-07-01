
'use client';

import { useMemo } from 'react';
import { useInventory } from '@/context/inventory-context';
import { useBusiness } from '@/context/business-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, ArrowRight, Package, CreditCard, Truck } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '../ui/button';

type AlertItem = {
    id: string;
    type: 'inventory' | 'expense' | 'wholesale';
    message: string;
    link: string;
    icon: React.ReactNode;
};

export default function AlertsPanel() {
    const { selectedBusiness } = useBusiness();
    const { getProducts, getExpenses, getWholesaleOrders } = useInventory();

    const alerts = useMemo(() => {
        const productAlerts = getProducts(selectedBusiness.id)
            .filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock')
            .slice(0, 3) // Limit to 3 to avoid clutter
            .map(p => ({
                id: `prod-${p.id}`,
                type: 'inventory' as const,
                message: `${p.name} is ${p.status.toLowerCase()}.`,
                link: '/inventory',
                icon: <Package className="h-4 w-4" />,
            }));
            
        const expenseAlerts = getExpenses(selectedBusiness.id)
            .filter(e => e.status === 'Overdue')
            .slice(0, 3)
            .map(e => ({
                id: `exp-${e.id}`,
                type: 'expense' as const,
                message: `Expense #${e.invoiceNumber || e.id} is overdue.`,
                link: '/expenses',
                icon: <CreditCard className="h-4 w-4" />,
            }));

        const wholesaleAlerts = getWholesaleOrders(selectedBusiness.id)
            .filter(o => o.status === 'Awaiting Fulfillment' || o.status === 'Awaiting Payment')
            .slice(0, 3)
            .map(o => ({
                id: `wo-${o.id}`,
                type: 'wholesale' as const,
                message: `Wholesale Order ${o.id} is ${o.status.toLowerCase()}.`,
                link: '/wholesale',
                icon: <Truck className="h-4 w-4" />,
            }));
        
        return [...productAlerts, ...expenseAlerts, ...wholesaleAlerts];

    }, [selectedBusiness.id, getProducts, getExpenses, getWholesaleOrders]);

    if (alerts.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Needs Attention</CardTitle>
                <CardDescription>A summary of critical items that may require action.</CardDescription>
            </CardHeader>
            <CardContent>
                {alerts.length > 0 ? (
                    <div className="space-y-4">
                        {alerts.map(alert => (
                             <Alert key={alert.id}>
                                {alert.icon}
                                <AlertTitle>{alert.message}</AlertTitle>
                                <AlertDescription>
                                   <Link href={alert.link} passHref>
                                     <Button variant="link" className="p-0 h-auto">
                                        Go to {alert.link.replace('/', '')} page <ArrowRight className="ml-2 h-4 w-4" />
                                     </Button>
                                   </Link>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-center text-muted-foreground">
                        <p className="font-semibold">All caught up!</p>
                        <p>There are no critical alerts at this time.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
