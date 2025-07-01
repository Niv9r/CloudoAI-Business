
'use client';

import { useState } from 'react';
import DiscountsTable from '@/components/discounts/discounts-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import type { DiscountCode, DiscountCodeFormValues } from '@/lib/types';
import DiscountFormDialog from '@/components/discounts/discount-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBusiness } from '@/context/business-context';

export default function DiscountsPage() {
  const { selectedBusiness } = useBusiness();
  const { getDiscountCodes, addDiscountCode, updateDiscountCode, deleteDiscountCode } = useInventory();
  const discounts = getDiscountCodes(selectedBusiness.id);
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [discountToEdit, setDiscountToEdit] = useState<DiscountCode | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<DiscountCode | null>(null);

  const handleSaveDiscount = (data: DiscountCodeFormValues) => {
    if (discountToEdit) {
      updateDiscountCode(selectedBusiness.id, { ...discountToEdit, ...data });
    } else {
      addDiscountCode(selectedBusiness.id, data);
    }
    setDiscountToEdit(null);
    setIsFormDialogOpen(false);
  };

  const handleOpenEditDialog = (discount: DiscountCode) => {
    setDiscountToEdit(discount);
    setIsFormDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setDiscountToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (discount: DiscountCode) => {
    setDiscountToDelete(discount);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (discountToDelete) {
      deleteDiscountCode(selectedBusiness.id, discountToDelete.id);
    }
    setIsAlertOpen(false);
    setDiscountToDelete(null);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Discounts</h1>
          <p className="text-muted-foreground">Manage coupon codes and discounts.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Discount
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <DiscountsTable
          key={selectedBusiness.id}
          discounts={discounts}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
        />
      </div>

      <DiscountFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSave={handleSaveDiscount}
        discount={discountToEdit}
      />

      {discountToDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the discount code "{discountToDelete.code}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleConfirmDelete}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    