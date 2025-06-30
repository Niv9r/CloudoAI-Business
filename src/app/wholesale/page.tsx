
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { WholesaleOrder, WholesaleOrderFormValues } from '@/lib/types';
import { useInventory } from '@/context/inventory-context';
import { useCustomer } from '@/context/customer-context';
import { useBusiness } from '@/context/business-context';
import WholesaleOrdersLog from '@/components/wholesale/wholesale-orders-log';
import WholesaleOrderFormDialog from '@/components/wholesale/wholesale-order-form-dialog';
import MarkAsShippedDialog from '@/components/wholesale/mark-as-shipped-dialog';
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

export default function WholesalePage() {
  const { selectedBusiness } = useBusiness();
  const { 
    getWholesaleOrders, 
    getProducts, 
    addWholesaleOrder,
    updateWholesaleOrder,
    confirmWholesaleOrder,
    markWholesaleOrderPaid,
    shipWholesaleOrder,
    cancelWholesaleOrder,
  } = useInventory();
  const { getCustomers } = useCustomer();

  const wholesaleOrders = getWholesaleOrders(selectedBusiness.id);
  const products = getProducts(selectedBusiness.id);
  const customers = getCustomers(selectedBusiness.id).filter(c => c.type === 'company');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<WholesaleOrder | null>(null);

  const [isShipOpen, setIsShipOpen] = useState(false);
  const [orderToShip, setOrderToShip] = useState<WholesaleOrder | null>(null);
  
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<WholesaleOrder | null>(null);

  const handleOpenAddDialog = () => {
    setOrderToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (order: WholesaleOrder) => {
    setOrderToEdit(order);
    setIsFormOpen(true);
  };

  const handleSaveOrder = (data: WholesaleOrderFormValues) => {
    if (orderToEdit) {
      updateWholesaleOrder(selectedBusiness.id, { ...orderToEdit, ...data });
    } else {
      addWholesaleOrder(selectedBusiness.id, data);
    }
    setIsFormOpen(false);
    setOrderToEdit(null);
  };
  
  const handleOpenShipDialog = (order: WholesaleOrder) => {
    setOrderToShip(order);
    setIsShipOpen(true);
  }
  
  const handleConfirmOrder = (order: WholesaleOrder) => {
    confirmWholesaleOrder(selectedBusiness.id, order.id);
  }

  const handleMarkAsPaid = (order: WholesaleOrder) => {
    markWholesaleOrderPaid(selectedBusiness.id, order.id);
  }

  const handleOpenCancelDialog = (order: WholesaleOrder) => {
    setOrderToCancel(order);
    setIsCancelAlertOpen(true);
  };
  
  const handleConfirmCancel = () => {
    if (orderToCancel) {
      cancelWholesaleOrder(selectedBusiness.id, orderToCancel.id);
    }
    setIsCancelAlertOpen(false);
    setOrderToCancel(null);
  };

  const handleConfirmShipment = (shippedItems: { productId: string; quantityShipped: number }[]) => {
    if (orderToShip) {
      shipWholesaleOrder(selectedBusiness.id, orderToShip.id, shippedItems);
    }
    setIsShipOpen(false);
    setOrderToShip(null);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Wholesale Orders</h1>
          <p className="text-muted-foreground">Manage your bulk sales to B2B customers.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Wholesale Order
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <WholesaleOrdersLog
          key={selectedBusiness.id}
          orders={wholesaleOrders}
          customers={customers}
          onEdit={handleOpenEditDialog}
          onConfirm={handleConfirmOrder}
          onMarkAsPaid={handleMarkAsPaid}
          onShip={handleOpenShipDialog}
          onCancel={handleOpenCancelDialog}
        />
      </div>

      <WholesaleOrderFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveOrder}
        order={orderToEdit}
        customers={customers}
        products={products}
      />
      
      {orderToShip && (
        <MarkAsShippedDialog
            isOpen={isShipOpen}
            onOpenChange={setIsShipOpen}
            order={orderToShip}
            products={products}
            onConfirmShipment={handleConfirmShipment}
        />
      )}

      {orderToCancel && (
        <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will cancel Wholesale Order {orderToCancel.id}. This cannot be undone.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction
                    className='bg-destructive hover:bg-destructive/90'
                    onClick={handleConfirmCancel}
                >
                    Yes, Cancel Order
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
       )}
    </div>
  );
}
