
'use client';

import { Button } from "@/components/ui/button";
import SalesLog from "@/components/sales/sales-log";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useBusiness } from "@/context/business-context";
import { useEmployee } from "@/context/employee-context";

export default function SalesPage() {
  const { selectedBusiness } = useBusiness();
  const { permissions } = useEmployee();
  
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Review your recent sales transactions.</p>
        </div>
        {permissions.has('process_sales') && (
            <Link href="/pos" passHref>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Sale (POS)
                </Button>
            </Link>
        )}
      </div>
      <SalesLog key={selectedBusiness.id}/>
    </div>
  );
}
