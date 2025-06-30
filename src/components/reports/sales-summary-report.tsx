
'use client';

import { useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';
import { sales } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Hash, ShoppingCart, Receipt } from 'lucide-react';
import KpiCard from '../dashboard/kpi-card';

interface SalesSummaryReportProps {
  dateRange: DateRange | undefined;
}

export default function SalesSummaryReport({ dateRange }: SalesSummaryReportProps) {
  const summary = useMemo(() => {
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return !dateRange || (
        (!dateRange.from || saleDate >= startOfDay(dateRange.from)) &&
        (!dateRange.to || saleDate <= endOfDay(dateRange.to))
      );
    });

    if (filteredSales.length === 0) {
      return {
        grossSales: 0,
        netSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
      };
    }

    const grossSales = filteredSales.reduce((acc, sale) => acc + sale.subtotal, 0);
    const totalDiscounts = filteredSales.reduce((acc, sale) => acc + sale.discount, 0);
    const netSales = grossSales - totalDiscounts;
    const totalOrders = filteredSales.length;
    const averageOrderValue = netSales / totalOrders;

    return {
      grossSales,
      netSales,
      totalOrders,
      averageOrderValue,
    };
  }, [dateRange]);

  const kpis = [
    { title: "Gross Sales", value: `$${summary.grossSales.toFixed(2)}`, change: "Total revenue before discounts", icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { title: "Net Sales", value: `$${summary.netSales.toFixed(2)}`, change: "Revenue after discounts", icon: <Receipt className="h-6 w-6 text-primary" /> },
    { title: "Total Orders", value: summary.totalOrders.toString(), change: "Total number of transactions", icon: <ShoppingCart className="h-6 w-6 text-primary" /> },
    { title: "Avg. Order Value", value: `$${summary.averageOrderValue.toFixed(2)}`, change: "Average net sales per order", icon: <Hash className="h-6 w-6 text-primary" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map(kpi => (
                <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} icon={kpi.icon} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
