'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Expense, ExpenseFormValues, Vendor } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
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
import ExpensesLog from "@/components/expenses/expenses-log";
import ExpenseFormDialog from "@/components/expenses/expense-form-dialog";
import { useBusiness } from "@/context/business-context";
import { useInventory } from "@/context/inventory-context";

export default function ExpensesPage() {
  const { toast } = useToast();
  const { selectedBusiness } = useBusiness();
  const { getExpenses, getVendors, addExpense, updateExpense, deleteExpense, markExpenseAsPaid } = useInventory();
  
  const expenses = getExpenses(selectedBusiness.id);
  const vendors = getVendors(selectedBusiness.id);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const handleSaveExpense = (data: ExpenseFormValues) => {
    if (expenseToEdit) {
      updateExpense(selectedBusiness.id, { ...expenseToEdit, ...data });
    } else {
      addExpense(selectedBusiness.id, data);
    }
    setExpenseToEdit(null);
    setIsFormDialogOpen(false);
  };

  const handleOpenEditDialog = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsFormDialogOpen(true);
  }
  
  const handleOpenAddDialog = () => {
    setExpenseToEdit(null);
    setIsFormDialogOpen(true);
  }

  const handleOpenDeleteDialog = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsAlertOpen(true);
  }
  
  const handleMarkAsPaid = (expenseId: string) => {
    markExpenseAsPaid(selectedBusiness.id, expenseId);
  }

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
        deleteExpense(selectedBusiness.id, expenseToDelete.id);
    }
    setIsAlertOpen(false);
    setExpenseToDelete(null);
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your business expenses.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ExpensesLog
          key={selectedBusiness.id}
          expenses={expenses}
          vendors={vendors}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
          onMarkAsPaid={handleMarkAsPaid}
        />
      </div>

      <ExpenseFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSave={handleSaveExpense}
        expense={expenseToEdit}
        vendors={vendors}
      />
       {expenseToDelete && (
         <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this expense record.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className='bg-destructive hover:bg-destructive/90'
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
