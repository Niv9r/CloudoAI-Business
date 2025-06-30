'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { expenses as mockExpenses, vendors as mockVendors } from "@/lib/mock-data";
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

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [vendors] = useState<Vendor[]>(mockVendors);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const getStatus = (expense: Omit<Expense, 'status' | 'id' | 'total' | 'lineItems'> & {dueDate: string}): Expense['status'] => {
      if (new Date(expense.dueDate) < new Date()) return 'Overdue';
      return 'Pending';
  }

  const handleSaveExpense = (data: ExpenseFormValues) => {
    const total = data.lineItems.reduce((acc, item) => acc + item.amount, 0);

    if (expenseToEdit) {
      // Update existing expense
      const updatedExpense: Expense = {
        ...expenseToEdit,
        ...data,
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        lineItems: data.lineItems.map((li, index) => ({ ...li, id: expenseToEdit.lineItems[index]?.id || `LI-${Date.now()}`})),
        total,
      };
      if(updatedExpense.status !== 'Paid'){
        updatedExpense.status = getStatus(updatedExpense);
      }
      setExpenses(expenses.map(e => e.id === expenseToEdit.id ? updatedExpense : e));
      toast({ title: "Success", description: "Expense updated successfully." });
    } else {
      // Add new expense
      const newExpenseData = {
        ...data,
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
      }
      const newExpense: Expense = {
        id: `EXP${Date.now()}`,
        ...newExpenseData,
        lineItems: data.lineItems.map(li => ({ ...li, id: `LI-${Date.now()}`})),
        total,
        status: getStatus(newExpenseData)
      };
      
      setExpenses([newExpense, ...expenses]);
      toast({ title: "Success", description: "Expense added successfully." });
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
    setExpenses(expenses.map(e => e.id === expenseId ? { ...e, status: 'Paid' } : e));
    toast({ title: "Status Updated", description: "Expense marked as paid." });
  }

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
        setExpenses(expenses.filter(e => e.id !== expenseToDelete.id));
        toast({
            variant: "destructive",
            title: "Expense Deleted",
            description: `Expense from "${vendors.find(v => v.id === expenseToDelete.vendorId)?.name}" has been removed.`,
        });
    }
    setIsAlertOpen(false);
    setExpenseToDelete(null);
  }

  return (
    <>
      <div className="flex flex-col gap-8">
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
        <ExpensesLog
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
    </>
  );
}
