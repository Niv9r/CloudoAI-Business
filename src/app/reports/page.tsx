
'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesSummaryReport from '@/components/reports/sales-summary-report';
import InventoryValuationReport from '@/components/reports/inventory-valuation-report';
import TopSellingProductsReport from '@/components/reports/top-selling-products-report';
import ExpenseBreakdownReport from '@/components/reports/expense-breakdown-report';

export default function ReportsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    return (
        <div className="flex h-full w-full flex-col gap-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Analyze your business performance.</p>
                </div>
                 <DatePickerWithRange date={date} setDate={setDate} />
            </div>

            <Tabs defaultValue="sales" className="flex-1">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="sales">Sales Reports</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
                    <TabsTrigger value="expenses">Expense Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="sales" className="mt-4 flex flex-col gap-8">
                    <SalesSummaryReport dateRange={date} />
                    <TopSellingProductsReport dateRange={date} />
                </TabsContent>
                <TabsContent value="inventory" className="mt-4 flex flex-col gap-8">
                    <InventoryValuationReport />
                </TabsContent>
                 <TabsContent value="expenses" className="mt-4 flex flex-col gap-8">
                    <ExpenseBreakdownReport dateRange={date} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
