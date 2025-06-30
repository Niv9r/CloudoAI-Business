'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { PurchaseOrder, PurchaseOrderFormValues } from '@/lib/types';
import { useInventory } from '@/context/inventory-context';
import PurchaseOrdersLog from '@/components/purchase-orders/purchase-orders-log';
import PoFormDialog from '@/components/purchase-orders/po-form-dialog';
import ReceiveStockDialog from '@/components/purchase-orders/receive-stock-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBusiness } from '@/context/business-context';

export default function PurchaseOrdersPage() {
  const { selectedBusiness } = useBusiness();
  const { 
    getPurchaseOrders, 
    getVendors, 
    getProducts, 
    addPurchaseOrder, 
    updatePurchaseOrder, 
    receiveStock, 
    issuePurchaseOrder, 
    cancelPurchaseOrder 
  } = useInventory();

  const purchaseOrders = getPurchaseOrders(selectedBusiness.id);
  const vendors = getVendors(selectedBusiness.id);
  const products = getProducts(selectedBusiness.id);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [poToEdit, setPoToEdit] = useState<PurchaseOrder | null>(null);

  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [poToReceive, setPoToReceive] = useState<PurchaseOrder | null>(null);
  
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [poToCancel, setPoToCancel] = useState<PurchaseOrder | null>(null);

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
      updatePurchaseOrder(selectedBusiness.id, updatedPO);
    } else {
      addPurchaseOrder(selectedBusiness.id, data);
    }
    setIsFormOpen(false);
    setPoToEdit(null);
  };
  
  const handleOpenReceiveDialog = (po: PurchaseOrder) => {
    setPoToReceive(po);
    setIsReceiveOpen(true);
  }
  
  const handleIssuePo = (po: PurchaseOrder) => {
    issuePurchaseOrder(selectedBusiness.id, po.id);
  }

  const handleOpenCancelDialog = (po: PurchaseOrder) => {
    setPoToCancel(po);
    setIsCancelAlertOpen(true);
  };
  
  const handleConfirmCancel = () => {
    if (poToCancel) {
      cancelPurchaseOrder(selectedBusiness.id, poToCancel.id);
    }
    setIsCancelAlertOpen(false);
    setPoToCancel(null);
  };

  const handleConfirmReceive = (receivedItems: { productId: string; quantityReceived: number }[]) => {
    if (poToReceive) {
      receiveStock(selectedBusiness.id, poToReceive.id, receivedItems);
    }
    setIsReceiveOpen(false);
    setPoToReceive(null);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
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
      <div className="flex-1 overflow-hidden">
        <PurchaseOrdersLog
          key={selectedBusiness.id}
          purchaseOrders={purchaseOrders}
          vendors={vendors}
          onEdit={handleOpenEditDialog}
          onReceive={handleOpenReceiveDialog}
          onIssue={handleIssuePo}
          onCancel={handleOpenCancelDialog}
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

      {poToCancel && (
        <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will cancel the Purchase Order {poToCancel.id}. This cannot be undone.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction
                    className='bg-destructive hover:bg-destructive/90'
                    onClick={handleConfirmCancel}
                >
                    Yes, Cancel PO
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
       )}
    </div>
  );
}
