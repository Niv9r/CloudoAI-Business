'use client';

import { useState, useRef } from 'react';
import type { DateRange } from 'react-day-picker';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesSummaryReport from '@/components/reports/sales-summary-report';
import InventoryValuationReport from '@/components/reports/inventory-valuation-report';
import TopSellingProductsReport from '@/components/reports/top-selling-products-report';
import ExpenseBreakdownReport from '@/components/reports/expense-breakdown-report';
import PaymentMethodsReport from '@/components/reports/payment-methods-report';
import InventoryStatusReport from '@/components/reports/inventory-status-report';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


export default function ReportsPage() {
    const today = new Date();
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(today, 29),
        to: today,
    });
    const [activeTab, setActiveTab] = useState('sales');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const salesSummaryRef = useRef<HTMLDivElement>(null);
    const topSellingRef = useRef<HTMLDivElement>(null);
    const paymentMethodsRef = useRef<HTMLDivElement>(null);
    const inventoryValuationRef = useRef<HTMLDivElement>(null);
    const inventoryStatusRef = useRef<HTMLDivElement>(null);
    const expenseBreakdownRef = useRef<HTMLDivElement>(null);

    const handleGeneratePdf = async () => {
        if (!date?.from || !date?.to) {
            toast({
                variant: 'destructive',
                title: 'Date Range Required',
                description: 'Please select a valid date range to generate a report.'
            });
            return;
        }

        setIsGenerating(true);
        
        const doc = new jsPDF('p', 'mm', 'a4');
        const margin = 15;
        let yPos = 20;

        doc.setFontSize(22);
        doc.text("Business Analytics Report", margin, yPos);
        yPos += 10;
        doc.setFontSize(12);
        const dateString = `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`;
        doc.text(`Period: ${dateString}`, margin, yPos);
        
        const reportElements = [
            { ref: salesSummaryRef, title: "Sales Summary" },
            { ref: topSellingRef, title: "Top Selling Products" },
            { ref: paymentMethodsRef, title: "Sales by Payment Method" },
            { ref: inventoryValuationRef, title: "Inventory Valuation" },
            { ref: inventoryStatusRef, title: "Inventory Status" },
            { ref: expenseBreakdownRef, title: "Expense Breakdown" },
        ];
        
        for (let i = 0; i < reportElements.length; i++) {
            const { ref, title } = reportElements[i];
            if (ref.current) {
                const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const imgProps = doc.getImageProperties(imgData);
                const pdfWidth = doc.internal.pageSize.getWidth() - 2 * margin;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                
                doc.addPage();
                yPos = margin;
                
                doc.setFontSize(16);
                doc.text(title, margin, yPos);
                yPos += 10;
                doc.addImage(imgData, 'PNG', margin, yPos, pdfWidth, pdfHeight);
            }
        }
        
        // remove the first blank page
        doc.deletePage(1);

        doc.save(`Cloudo-Report-${dateString}.pdf`);

        setIsGenerating(false);
    };

    const setDatePreset = (preset: 'today' | 'week' | 'month' | 'year') => {
        const today = new Date();
        switch (preset) {
            case 'today':
                setDate({ from: today, to: today });
                break;
            case 'week':
                setDate({ from: startOfWeek(today), to: endOfWeek(today) });
                break;
            case 'month':
                setDate({ from: startOfMonth(today), to: endOfMonth(today) });
                break;
            case 'year':
                setDate({ from: startOfYear(today), to: endOfYear(today) });
                break;
        }
    };


    return (
        <div className="h-full w-full flex-col space-y-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Analyze your business performance.</p>
                </div>
                 <div className="flex flex-wrap items-center gap-2">
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <Button onClick={handleGeneratePdf} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="animate-spin" /> : <FileDown />}
                        <span className="ml-2 hidden sm:inline">Generate PDF</span>
                    </Button>
                 </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Presets:</span>
                <Button variant="outline" size="sm" onClick={() => setDatePreset('today')}>Today</Button>
                <Button variant="outline" size="sm" onClick={() => setDatePreset('week')}>This Week</Button>
                <Button variant="outline" size="sm" onClick={() => setDatePreset('month')}>This Month</Button>
                <Button variant="outline" size="sm" onClick={() => setDatePreset('year')}>This Year</Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 flex-1">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="sales">Sales Reports</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
                    <TabsTrigger value="expenses">Expense Reports</TabsTrigger>
                </TabsList>
            </Tabs>
            
            <div className="reports-container space-y-8 mt-4">
                <div className={cn("space-y-8", activeTab !== 'sales' && 'hidden')}>
                    <div ref={salesSummaryRef}>
                        <SalesSummaryReport dateRange={date} />
                    </div>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div ref={topSellingRef}>
                            <TopSellingProductsReport dateRange={date} />
                        </div>
                        <div ref={paymentMethodsRef}>
                            <PaymentMethodsReport dateRange={date} />
                        </div>
                    </div>
                </div>
                <div className={cn("space-y-8", activeTab !== 'inventory' && 'hidden')}>
                    <div ref={inventoryValuationRef}>
                       <InventoryValuationReport />
                    </div>
                    <div ref={inventoryStatusRef}>
                       <InventoryStatusReport />
                    </div>
                </div>
                 <div className={cn("space-y-8", activeTab !== 'expenses' && 'hidden')}>
                    <div ref={expenseBreakdownRef}>
                       <ExpenseBreakdownReport dateRange={date} />
                    </div>
                </div>
            </div>
            {/* Hidden container for PDF generation, ensures all elements are in the DOM */}
            <div className="absolute -left-[9999px] -top-[9999px] w-[1000px] opacity-0" aria-hidden="true">
                <div className="space-y-8">
                     <div ref={salesSummaryRef}>
                        <SalesSummaryReport dateRange={date} />
                    </div>
                    <div ref={topSellingRef}>
                        <TopSellingProductsReport dateRange={date} />
                    </div>
                    <div ref={paymentMethodsRef}>
                        <PaymentMethodsReport dateRange={date} />
                    </div>
                     <div ref={inventoryValuationRef}>
                       <InventoryValuationReport />
                    </div>
                    <div ref={inventoryStatusRef}>
                       <InventoryStatusReport />
                    </div>
                     <div ref={expenseBreakdownRef}>
                       <ExpenseBreakdownReport dateRange={date} />
                    </div>
                </div>
            </div>

        </div>
    );
}