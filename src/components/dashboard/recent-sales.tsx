
'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useBusiness } from "@/context/business-context";
import { useInventory } from "@/context/inventory-context";
import { useMemo } from "react";

export default function RecentSales() {
  const { selectedBusiness } = useBusiness();
  const { getSales } = useInventory();
  
  const salesData = useMemo(() => {
    const sales = getSales(selectedBusiness.id);
    return sales.slice(0, 5).map(sale => ({
      name: sale.customerName,
      email: `${sale.customerName.split(' ').join('.').toLowerCase()}@email.com`,
      amount: `+$${sale.total.toFixed(2)}`,
      avatarSrc: 'https://placehold.co/100x100.png',
      fallback: sale.customerName.split(' ').map(n => n[0]).join('')
    }));
  }, [selectedBusiness.id, getSales]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Recent Sales</CardTitle>
        <CardDescription>
          You made {getSales(selectedBusiness.id).length} sales this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {salesData.map((sale, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={sale.avatarSrc} alt="Avatar" data-ai-hint="person avatar"/>
                <AvatarFallback>{sale.fallback}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{sale.name}</p>
                <p className="text-sm text-muted-foreground">{sale.email}</p>
              </div>
              <div className="ml-auto font-medium">{sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
