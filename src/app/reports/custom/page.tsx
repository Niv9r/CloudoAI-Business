
'use client';

import { useState, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { Card } from '@/components/ui/card';
import { useBusiness } from '@/context/business-context';
import { useEmployee } from '@/context/employee-context';
import ReportBuilderForm from '@/components/reports/custom/report-builder-form';
import CustomReportDisplay from '@/components/reports/custom/custom-report-display';
import { useInventory } from '@/context/inventory-context';
import { startOfDay, endOfDay } from 'date-fns';

export type Metric = 'netSales' | 'grossProfit' | 'totalOrders' | 'unitsSold';
export type Dimension = 'product' | 'employee' | 'day' | 'month';
export type ReportRow = Record<string, string | number>;

export default function CustomReportsPage() {
    const { selectedBusiness } = useBusiness();
    const { permissions } = useEmployee();
    const { getSales, getProducts, getEmployees } = useInventory();
    
    const [metrics, setMetrics] = useState<Set<Metric>>(new Set(['netSales']));
    const [dimension, setDimension] = useState<Dimension>('product');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [generatedReport, setGeneratedReport] = useState<ReportRow[] | null>(null);

    const handleSubmit = () => {
        const sales = getSales(selectedBusiness.id);
        const products = getProducts(selectedBusiness.id);
        const employees = getEmployees(selectedBusiness.id);

        const filteredSales = sales.filter(sale => {
            if (!dateRange?.from || !dateRange?.to) return true;
            const saleDate = new Date(sale.timestamp);
            return saleDate >= startOfDay(dateRange.from) && saleDate <= endOfDay(dateRange.to);
        });

        const reportData: Record<string, any> = {};

        filteredSales.forEach(sale => {
            sale.lineItems.forEach(item => {
                let key: string;
                switch (dimension) {
                    case 'product':
                        key = item.productId;
                        break;
                    case 'employee':
                        key = sale.employeeId;
                        break;
                    case 'day':
                        key = sale.timestamp.split('T')[0];
                        break;
                    case 'month':
                        key = sale.timestamp.substring(0, 7);
                        break;
                    default:
                        key = 'all';
                }

                if (!reportData[key]) {
                    reportData[key] = {
                        netSales: 0,
                        grossProfit: 0,
                        totalOrders: new Set(),
                        unitsSold: 0,
                    };

                    switch (dimension) {
                        case 'product':
                            reportData[key].Dimension = products.find(p => p.id === key)?.name || 'Unknown';
                            break;
                        case 'employee':
                            reportData[key].Dimension = employees.find(e => e.id === key)?.name || 'Unknown';
                            break;
                        default:
                            reportData[key].Dimension = key;
                    }
                }

                const netSale = item.subtotal - (item.subtotal / sale.subtotal) * sale.discount;
                reportData[key].netSales += netSale;
                reportData[key].grossProfit += netSale - (item.costAtTimeOfSale * item.quantity);
                reportData[key].totalOrders.add(sale.id);
                reportData[key].unitsSold += item.quantity;
            });
        });

        const finalReport = Object.values(reportData).map(row => {
            const newRow: ReportRow = { Dimension: row.Dimension };
            if (metrics.has('netSales')) newRow['Net Sales'] = row.netSales;
            if (metrics.has('grossProfit')) newRow['Gross Profit'] = row.grossProfit;
            if (metrics.has('totalOrders')) newRow['Total Orders'] = row.totalOrders.size;
            if (metrics.has('unitsSold')) newRow['Units Sold'] = row.unitsSold;
            return newRow;
        });

        setGeneratedReport(finalReport);
    };

    if (!permissions.has('build_custom_reports')) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to build custom reports.</p>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col gap-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Custom Report Builder</h1>
                    <p className="text-muted-foreground">Build your own report by selecting metrics and dimensions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-3">
                    <ReportBuilderForm 
                        metrics={metrics}
                        setMetrics={setMetrics}
                        dimension={dimension}
                        setDimension={setDimension}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        onSubmit={handleSubmit}
                    />
                </div>
                <div className="lg:col-span-9">
                    <CustomReportDisplay reportData={generatedReport} />
                </div>
            </div>
        </div>
    );
}

    