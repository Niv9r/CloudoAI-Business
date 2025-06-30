import { Button } from "@/components/ui/button";
import SalesLog from "@/components/sales/sales-log";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function SalesPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Review your recent sales transactions.</p>
        </div>
        <Link href="/pos" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Sale (POS)
          </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <SalesLog />
      </div>
    </div>
  );
}
