'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { PurchaseOrder, PurchaseOrderFormValues, Product } from '@/lib/types';
import { useInventory } from '@/context/inventory-context';
import PurchaseOrdersLog from '@/components/purchase-orders/purchase-orders-log';
import PoFormDialog from '@/components/purchase-orders/po-form-dialog';
import ReceiveStockDialog from '@/components/purchase-orders/receive-stock-dialog';

export default function PurchaseOrdersPage() {
  const { purchaseOrders, vendors, products, addPurchaseOrder, updatePurchaseOrder, receiveStock } = useInventory();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [poToEdit, setPoToEdit] = useState<PurchaseOrder | null>(null);

  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [poToReceive, setPoToReceive] = useState<PurchaseOrder | null>(null);

  const handleOpenAddDialog = () => {
    setPoToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (po: PurchaseOrder) => {
    setPoToEdit(po);
    setIsFormOpen(true);
  };

  const handleSavePo = (data: PurchaseOrderFormValues) => {
    if (poToEdit) {
      const updatedPO: PurchaseOrder = {
        ...poToEdit,
        ...data,
        issueDate: data.issueDate.toISOString(),
        expectedDate: data.expectedDate.toISOString(),
      };
      updatePurchaseOrder(updatedPO);
    } else {
      addPurchaseOrder(data);
    }
    setIsFormOpen(false);
    setPoToEdit(null);
  };
  
  const handleOpenReceiveDialog = (po: PurchaseOrder) => {
    setPoToReceive(po);
    setIsReceiveOpen(true);
  }

  const handleConfirmReceive = (receivedItems: { productId: string; quantityReceived: number }[]) => {
    if (poToReceive) {
      receiveStock(poToReceive.id, receivedItems);
    }
    setIsReceiveOpen(false);
    setPoToReceive(null);
  };

  return (
    <>
      <div className="w-full flex flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">Create and manage your supplier orders.</p>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create PO
          </Button>
        </div>
        <PurchaseOrdersLog
          purchaseOrders={purchaseOrders}
          vendors={vendors}
          onEdit={handleOpenEditDialog}
          onReceive={handleOpenReceiveDialog}
        />
      </div>

      <PoFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSavePo}
        purchaseOrder={poToEdit}
        vendors={vendors}
        products={products}
      />
      
      {poToReceive && (
        <ReceiveStockDialog
            isOpen={isReceiveOpen}
            onOpenChange={setIsReceiveOpen}
            purchaseOrder={poToReceive}
            products={products}
            onConfirmReceive={handleConfirmReceive}
        />
      )}
    </>
  );
}
