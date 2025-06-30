'use client';

import { useState } from 'react';
import CustomerTable from '@/components/customers/customer-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';
import type { Customer, CustomerFormValues } from '@/lib/types';
import CustomerFormDialog from '@/components/customers/customer-form-dialog';
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

export default function CustomersPage() {
  const { selectedBusiness } = useBusiness();
  const { getCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomer();
  const customers = getCustomers(selectedBusiness.id);
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const handleSaveCustomer = (data: CustomerFormValues) => {
    if (customerToEdit) {
      updateCustomer(selectedBusiness.id, { ...customerToEdit, ...data });
    } else {
      addCustomer(selectedBusiness.id, data);
    }
    setCustomerToEdit(null);
    setIsFormDialogOpen(false);
  };

  const handleOpenEditDialog = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsFormDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setCustomerToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer(selectedBusiness.id, customerToDelete.id);
    }
    setIsAlertOpen(false);
    setCustomerToDelete(null);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <CustomerTable
          key={selectedBusiness.id}
          customers={customers}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
        />
      </div>

      <CustomerFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSave={handleSaveCustomer}
        customer={customerToEdit}
      />

      {customerToDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the customer "{customerToDelete.firstName} {customerToDelete.lastName}".
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
