
'use client';

import { useState } from 'react';
import AccountsTable from '@/components/settings/accounts-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import type { ChartOfAccount, ChartOfAccountFormValues } from '@/lib/types';
import AccountFormDialog from '@/components/settings/accounts-form-dialog';
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

export default function AccountsPage() {
  const { selectedBusiness } = useBusiness();
  const { getChartOfAccounts, addChartOfAccount, updateChartOfAccount, deleteChartOfAccount } = useInventory();
  const accounts = getChartOfAccounts(selectedBusiness.id);
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<ChartOfAccount | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<ChartOfAccount | null>(null);

  const handleSaveAccount = (data: ChartOfAccountFormValues) => {
    if (accountToEdit) {
      updateChartOfAccount(selectedBusiness.id, { ...accountToEdit, ...data });
    } else {
      addChartOfAccount(selectedBusiness.id, data);
    }
    setAccountToEdit(null);
    setIsFormDialogOpen(false);
  };

  const handleOpenEditDialog = (account: ChartOfAccount) => {
    setAccountToEdit(account);
    setIsFormDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setAccountToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (account: ChartOfAccount) => {
    setAccountToDelete(account);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      deleteChartOfAccount(selectedBusiness.id, accountToDelete.id);
    }
    setIsAlertOpen(false);
    setAccountToDelete(null);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts for transaction categorization.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <AccountsTable
          key={selectedBusiness.id}
          accounts={accounts}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
        />
      </div>

      <AccountFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSave={handleSaveAccount}
        account={accountToEdit}
      />

      {accountToDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the account "{accountToDelete.accountName}".
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
