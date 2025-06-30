import { Button } from "@/components/ui/button";
import ProductTable from "@/components/inventory/product-table";
import { PlusCircle } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your products and stock levels.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <ProductTable />
    </div>
  );
}
