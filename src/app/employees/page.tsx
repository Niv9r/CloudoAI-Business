
'use client';

import { useState } from 'react';
import EmployeeTable from '@/components/employees/employee-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useEmployee } from '@/context/employee-context';
import type { Employee, EmployeeFormValues } from '@/lib/types';
import EmployeeFormDialog from '@/components/employees/employee-form-dialog';
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

export default function EmployeesPage() {
  const { selectedBusiness } = useBusiness();
  const { employees, roles, addEmployee, updateEmployee, deleteEmployee, permissions } = useEmployee();
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const handleSaveEmployee = (data: EmployeeFormValues) => {
    if (employeeToEdit) {
      updateEmployee(selectedBusiness.id, { ...employeeToEdit, ...data });
    } else {
      addEmployee(selectedBusiness.id, data);
    }
    setEmployeeToEdit(null);
    setIsFormDialogOpen(false);
  };

  const handleOpenEditDialog = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsFormDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setEmployeeToEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(selectedBusiness.id, employeeToDelete.id);
    }
    setIsAlertOpen(false);
    setEmployeeToDelete(null);
  };

  if (!permissions.has('manage_employees')) {
      return (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to manage employees.</p>
          </div>
      )
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage employee accounts and permissions.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <EmployeeTable
          key={selectedBusiness.id}
          employees={employees}
          roles={roles}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
        />
      </div>

      <EmployeeFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSave={handleSaveEmployee}
        employee={employeeToEdit}
        roles={roles}
      />

      {employeeToDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the employee "{employeeToDelete.name}".
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
