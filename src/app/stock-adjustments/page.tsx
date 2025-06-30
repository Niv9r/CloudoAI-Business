'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { StockAdjustmentFormValues } from '@/lib/types';
import { useInventory } from '@/context/inventory-context';
import AdjustmentsLog from '@/components/stock-adjustments/adjustments-log';
import AdjustmentFormDialog from '@/components/stock-adjustments/adjustment-form-dialog';
import { useBusiness } from '@/context/business-context';

export default function StockAdjustmentsPage() {
  const { selectedBusiness } = useBusiness();
  const { getProducts, getStockAdjustments, adjustStock } = useInventory();
  
  const products = getProducts(selectedBusiness.id);
  const stockAdjustments = getStockAdjustments(selectedBusiness.id);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenAddDialog = () => {
    setIsFormOpen(true);
  };

  const handleSaveAdjustment = (data: StockAdjustmentFormValues) => {
    adjustStock(selectedBusiness.id, data);
    setIsFormOpen(false);
  };
  
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Stock Adjustments</h1>
          <p className="text-muted-foreground">Manually adjust stock levels and view history.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Adjustment
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <AdjustmentsLog
          key={selectedBusiness.id}
          adjustments={stockAdjustments}
          products={products}
        />
      </div>

      <AdjustmentFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveAdjustment}
        products={products}
      />
    </div>
  );
}
