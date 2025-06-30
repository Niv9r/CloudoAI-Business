'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, startOfDay, endOfDay } from 'date-fns';
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
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/context/inventory-context';
import type { Product } from '@/lib/types';
import { useBusiness } from '@/context/business-context';


export default function ReportsPage() {
    const today = new Date();
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(today, 29),
        to: today,
    });
    const [activeTab, setActiveTab] = useState('sales');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    const { selectedBusiness } = useBusiness();
    const { getProducts, getSales, getExpenses, getVendors } = useInventory();

    const products = getProducts(selectedBusiness.id);
    const allSales = getSales(selectedBusiness.id);
    const allExpenses = getExpenses(selectedBusiness.id);
    const vendors = getVendors(selectedBusiness.id);

    const handleGeneratePdf = () => {
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
        const dateString = `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`;

        // --- Report Header ---
        doc.setFontSize(22);
        doc.text("Business Analytics Report", 15, 20);
        doc.setFontSize(12);
        doc.text(`For: ${selectedBusiness.name}`, 15, 28)
        doc.text(`Period: ${dateString}`, 15, 36);
        doc.setFontSize(10);
        doc.text(`Generated on: ${format(new Date(), "PPP p")}`, 15, 42);

        // --- Sales Summary ---
        const filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.timestamp);
            return (saleDate >= startOfDay(date.from as Date)) && (saleDate <= endOfDay(date.to as Date));
        });

        const grossSales = filteredSales.reduce((acc, sale) => acc + sale.subtotal, 0);
        const totalDiscounts = filteredSales.reduce((acc, sale) => acc + sale.discount, 0);
        const netSales = grossSales - totalDiscounts;
        const totalOrders = filteredSales.length;
        const averageOrderValue = totalOrders > 0 ? netSales / totalOrders : 0;
        
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Sales Summary", 15, 20);
        doc.autoTable({
            startY: 25,
            body: [
                ['Gross Sales', `$${grossSales.toFixed(2)}`],
                ['Net Sales', `$${netSales.toFixed(2)}`],
                ['Total Orders', `${totalOrders}`],
                ['Average Order Value', `$${averageOrderValue.toFixed(2)}`],
            ],
            theme: 'striped'
        });

        // --- Top Selling Products ---
        const allLineItems = filteredSales.flatMap(s => s.lineItems);
        const productSalesMap = allLineItems.reduce<Record<string, { name: string; unitsSold: number; grossRevenue: number }>>((acc, item) => {
            if (!acc[item.productId]) {
                acc[item.productId] = { name: item.name, unitsSold: 0, grossRevenue: 0 };
            }
            acc[item.productId].unitsSold += item.quantity;
            acc[item.productId].grossRevenue += item.subtotal;
            return acc;
        }, {});
        const topProductsData = Object.values(productSalesMap).sort((a, b) => b.unitsSold - a.unitsSold);

        doc.addPage();
        doc.setFontSize(16);
        doc.text("Top Selling Products", 15, 20);
        doc.autoTable({
            startY: 25,
            head: [['Product', 'Units Sold', 'Gross Revenue']],
            body: topProductsData.map(p => [p.name, p.unitsSold, `$${p.grossRevenue.toFixed(2)}`]),
            theme: 'grid'
        });

        // --- Sales by Payment Method ---
        const paymentData = filteredSales.reduce((acc, sale) => {
            if (!acc[sale.payment]) acc[sale.payment] = 0;
            acc[sale.payment] += sale.total;
            return acc;
        }, {} as Record<string, number>);

        doc.addPage();
        doc.setFontSize(16);
        doc.text("Sales by Payment Method", 15, 20);
        doc.autoTable({
            startY: 25,
            head: [['Payment Method', 'Total Sales']],
            body: Object.entries(paymentData).map(([method, total]) => [method, `$${total.toFixed(2)}`]),
            theme: 'grid'
        });

        // --- Inventory Valuation ---
        const invSummary = products.reduce((acc, p) => {
            acc.totalUnits += p.stock;
            acc.totalCostValue += p.stock * p.cost;
            acc.totalRetailValue += p.stock * p.price;
            return acc;
        }, { totalUnits: 0, totalCostValue: 0, totalRetailValue: 0, potentialProfit: 0 });
        invSummary.potentialProfit = invSummary.totalRetailValue - invSummary.totalCostValue;

        doc.addPage();
        doc.setFontSize(16);
        doc.text("Inventory Valuation (as of today)", 15, 20);
        doc.autoTable({
            startY: 25,
            body: [
                ['Total Units', invSummary.totalUnits.toLocaleString()],
                ['Total Cost Value', `$${invSummary.totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ['Total Retail Value', `$${invSummary.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ['Potential Profit', `$${invSummary.potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
            ],
            theme: 'striped'
        });
        doc.autoTable({
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Product', 'Stock', 'Cost/Unit', 'Total Cost', 'Price/Unit', 'Total Retail']],
            body: products.map(p => [
                p.name, p.stock, `$${p.cost.toFixed(2)}`, `$${(p.stock * p.cost).toFixed(2)}`, `$${p.price.toFixed(2)}`, `$${(p.stock * p.price).toFixed(2)}`
            ]),
            theme: 'grid'
        });

        // --- Inventory Status ---
        const statusCounts = products.reduce((acc, product) => {
            if(!acc[product.status]) acc[product.status] = 0;
            acc[product.status]++;
            return acc;
        }, {} as Record<Product['status'], number>);
        
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Inventory Status", 15, 20);
        doc.autoTable({
            startY: 25,
            head: [['Status', 'Number of Products']],
            body: Object.entries(statusCounts).map(([status, count]) => [status, count]),
            theme: 'grid'
        });


        // --- Expense Breakdown ---
        const filteredExpenses = allExpenses.filter(expense => {
            const expenseDate = new Date(expense.issueDate);
            return (expenseDate >= startOfDay(date.from as Date)) && (expenseDate <= endOfDay(date.to as Date));
        });
        const totalSpent = filteredExpenses.reduce((acc, exp) => acc + exp.total, 0);
        const expensesByVendor = filteredExpenses.reduce((acc, exp) => {
            const vendorName = vendors.find(v => v.id === exp.vendorId)?.name || 'Unknown Vendor';
            if (!acc[vendorName]) acc[vendorName] = 0;
            acc[vendorName] += exp.total;
            return acc;
        }, {} as Record<string, number>);

        doc.addPage();
        doc.setFontSize(16);
        doc.text("Expense Breakdown", 15, 20);
        doc.autoTable({
            startY: 25,
            body: [
                ['Total Spent', `$${totalSpent.toFixed(2)}`],
                ['Expense Count', `${filteredExpenses.length}`],
            ],
            theme: 'striped'
        });
         doc.autoTable({
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Vendor', 'Total Expenses']],
            body: Object.entries(expensesByVendor).map(([vendor, total]) => [vendor, `$${total.toFixed(2)}`]),
            theme: 'grid'
        });


        // --- Finalize and Save ---
        doc.deletePage(1); // Remove the initial blank page
        doc.save(`Cloudo-Report-${selectedBusiness.name.replace(/\s/g, '_')}-${dateString}.pdf`);
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
                        {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        <span className="hidden sm:inline">Generate PDF</span>
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
                 <TabsContent value="sales" className="space-y-8 mt-4">
                    <SalesSummaryReport key={`${selectedBusiness.id}-sales-summary`} dateRange={date} />
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <TopSellingProductsReport key={`${selectedBusiness.id}-top-products`} dateRange={date} />
                        <PaymentMethodsReport key={`${selectedBusiness.id}-payments`} dateRange={date} />
                    </div>
                </TabsContent>
                <TabsContent value="inventory" className="space-y-8 mt-4">
                    <InventoryValuationReport key={`${selectedBusiness.id}-inv-valuation`} />
                    <InventoryStatusReport key={`${selectedBusiness.id}-inv-status`} />
                </TabsContent>
                <TabsContent value="expenses" className="space-y-8 mt-4">
                    <ExpenseBreakdownReport key={`${selectedBusiness.id}-expenses`} dateRange={date} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
