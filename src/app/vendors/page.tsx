'use client';

import { useState } from 'react';
import VendorTable from '@/components/vendors/vendor-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import type { Vendor, VendorFormValues } from '@/lib/types';
import VendorFormDialog from '@/components/vendors/vendor-form-dialog';
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

export default function VendorsPage() {
  const { selectedBusiness } = useBusiness();
  const { getVendors, addVendor, updateVendor, deleteVendor } = useInventory();
  const vendors = getVendors(selectedBusiness.id);
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const handleSaveVendor = (data: VendorFormValues) => {
    if (vendorToEdit) {
      updateVendor(selectedBusiness.id, { ...vendorToEdit, ...data });
    } else {
      addVendor(selectedBusiness.id, data);
    }
    setVendorToEdit(null);
    setIsFormDialogOpen(false);
  };

  const handleOpenEditDialog = (vendor: Vendor) => {
    setVendorToEdit(vendor);
    setIsFormDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setVendorToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (vendorToDelete) {
      deleteVendor(selectedBusiness.id, vendorToDelete.id);
    }
    setIsAlertOpen(false);
    setVendorToDelete(null);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage your suppliers and vendors.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <VendorTable
          key={selectedBusiness.id}
          vendors={vendors}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
        />
      </div>

      <VendorFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSave={handleSaveVendor}
        vendor={vendorToEdit}
      />

      {vendorToDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the vendor "{vendorToDelete.name}".
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
