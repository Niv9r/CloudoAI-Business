'use client';

import { useState, useEffect } from 'react';
import KpiCard from "@/components/dashboard/kpi-card";
import RecentSales from "@/components/dashboard/recent-sales";
import SalesChart from "@/components/dashboard/sales-chart";
import SmartReorder from "@/components/dashboard/smart-reorder";
import TopProductsChart from "@/components/dashboard/top-products-chart";
import { useBusiness } from '@/context/business-context';
import type { Business } from '@/lib/types';
import { DollarSign, ShoppingCart, Users, Wallet } from "lucide-react";

const kpiData: Record<string, { title: string; value: string; change: string; icon: JSX.Element }[]> = {
  biz_1: [
    { title: "Gross Revenue", value: "$45,231.89", change: "+20.1% from last month", icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { title: "Net Profit", value: "$12,873.21", change: "+15.2% from last month", icon: <Wallet className="h-6 w-6 text-primary" /> },
    { title: "Sales Count", value: "+12,234", change: "+19% from last month", icon: <ShoppingCart className="h-6 w-6 text-primary" /> },
    { title: "Customer Count", value: "+972", change: "+11.4% from last month", icon: <Users className="h-6 w-6 text-primary" /> },
  ],
  biz_2: [
    { title: "Gross Revenue", value: "$89,120.50", change: "+5.5% from last month", icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { title: "Net Profit", value: "$25,400.75", change: "+2.1% from last month", icon: <Wallet className="h-6 w-6 text-primary" /> },
    { title: "Sales Count", value: "+25,812", change: "+8% from last month", icon: <ShoppingCart className="h-6 w-6 text-primary" /> },
    { title: "Customer Count", value: "+1,504", change: "+3.2% from last month", icon: <Users className="h-6 w-6 text-primary" /> },
  ],
  biz_3: [
    { title: "Gross Revenue", value: "£22,450.10", change: "-2.3% from last month", icon: <DollarSign className="h-6 w-6 text-primary" /> },
    { title: "Net Profit", value: "£5,190.40", change: "-8.9% from last month", icon: <Wallet className="h-6 w-6 text-primary" /> },
    { title: "Sales Count", value: "+4,109", change: "+1.5% from last month", icon: <ShoppingCart className="h-6 w-6 text-primary" /> },
    { title: "Customer Count", value: "+315", change: "+0.8% from last month", icon: <Users className="h-6 w-6 text-primary" /> },
  ],
};


export default function Home() {
  const { selectedBusiness } = useBusiness();
  const [currentKpis, setCurrentKpis] = useState(kpiData[selectedBusiness.id] || kpiData.biz_1);

  useEffect(() => {
    setCurrentKpis(kpiData[selectedBusiness.id] || kpiData.biz_1);
  }, [selectedBusiness]);

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{selectedBusiness.name} Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {currentKpis.map(kpi => (
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
          <RecentSales key={`sales-${selectedBusiness.id}`} />
        </div>
        <div className="lg:col-span-2">
          <SmartReorder />
        </div>
      </div>
    </>
  );
}
