import KpiCard from "@/components/dashboard/kpi-card";
import RecentSales from "@/components/dashboard/recent-sales";
import SalesChart from "@/components/dashboard/sales-chart";
import TopProductsChart from "@/components/dashboard/top-products-chart";
import { DollarSign, ShoppingCart, Users, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Gross Revenue" value="$45,231.89" change="+20.1% from last month" icon={<DollarSign className="h-6 w-6 text-primary" />} />
        <KpiCard title="Net Profit" value="$12,873.21" change="+15.2% from last month" icon={<Wallet className="h-6 w-6 text-primary" />} />
        <KpiCard title="Sales Count" value="+12,234" change="+19% from last month" icon={<ShoppingCart className="h-6 w-6 text-primary" />} />
        <KpiCard title="Customer Count" value="+972" change="+11.4% from last month" icon={<Users className="h-6 w-6 text-primary" />} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <TopProductsChart />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <RecentSales />
      </div>
    </div>
  );
}
