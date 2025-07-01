'use client';

import KpiCard from "@/components/dashboard/kpi-card";
import RecentSales from "@/components/dashboard/recent-sales";
import SalesChart from "@/components/dashboard/sales-chart";
import SmartReorder from "@/components/dashboard/smart-reorder";
import TopProductsChart from "@/components/dashboard/top-products-chart";
import AiCopilot from '@/components/dashboard/ai-copilot';
import AnomalyAlerts from "@/components/dashboard/anomaly-alerts";
import AlertsPanel from "@/components/dashboard/alerts-panel";
import { useBusiness } from '@/context/business-context';
import { useInventory } from "@/context/inventory-context";
import { useCustomer } from "@/context/customer-context";
import { DollarSign, ShoppingCart, Users, Wallet } from "lucide-react";
import { useMemo } from "react";

export default function Home() {
  const { selectedBusiness } = useBusiness();
  const { getSales, getProducts, getExpenses } = useInventory();
  const { getCustomers } = useCustomer();

  const sales = useMemo(() => getSales(selectedBusiness.id), [selectedBusiness.id, getSales]);
  const customers = useMemo(() => getCustomers(selectedBusiness.id), [selectedBusiness.id, getCustomers]);
  const products = useMemo(() => getProducts(selectedBusiness.id), [selectedBusiness.id, getProducts]);
  const expenses = useMemo(() => getExpenses(selectedBusiness.id), [selectedBusiness.id, getExpenses]);


  const kpis = useMemo(() => {
    const grossRevenue = sales.reduce((acc, sale) => acc + sale.subtotal, 0);
    
    const cogs = sales.flatMap(s => s.lineItems).reduce((acc, item) => acc + (item.costAtTimeOfSale * item.quantity), 0);
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.total, 0);
    const netProfit = grossRevenue - cogs - totalExpenses;
    
    const salesCount = sales.length;
    const customerCount = customers.length;
    
    return [
      { title: "Gross Revenue", value: `$${grossRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: "+20.1% from last month", icon: <DollarSign className="h-6 w-6 text-primary" /> },
      { title: "Net Profit", value: `$${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: "+15.2% from last month", icon: <Wallet className="h-6 w-6 text-primary" /> },
      { title: "Sales Count", value: `+${salesCount.toLocaleString()}`, change: "+19% from last month", icon: <ShoppingCart className="h-6 w-6 text-primary" /> },
      { title: "Customer Count", value: `+${customerCount.toLocaleString()}`, change: "+11.4% from last month", icon: <Users className="h-6 w-6 text-primary" /> },
    ];

  }, [sales, customers, products, expenses]);


  return (
    <div className="flex h-full w-full flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{selectedBusiness.name} Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your business.</p>
      </div>
      
      <div className="w-full space-y-8">
        <AlertsPanel key={`${selectedBusiness.id}-alerts`} />
        <AnomalyAlerts key={`${selectedBusiness.id}-anomalies`} />
      </div>

      <div className="w-full">
        <AiCopilot key={selectedBusiness.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(kpi => (
           <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} icon={kpi.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart key={selectedBusiness.id} />
        </div>
        <div className="lg:col-span-1">
          <TopProductsChart key={selectedBusiness.id} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentSales key={selectedBusiness.id} />
        </div>
        <div className="lg:col-span-2">
          <SmartReorder key={selectedBusiness.id} />
        </div>
      </div>
    </div>
  );
}
