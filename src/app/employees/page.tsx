
'use client';

import { useState } from 'react';
import EmployeeTable from '@/components/employees/employee-table';
import RoleTable from '@/components/employees/role-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useEmployee } from '@/context/employee-context';
import type { Employee, EmployeeFormValues, Role, RoleFormValues } from '@/lib/types';
import EmployeeFormDialog from '@/components/employees/employee-form-dialog';
import RoleFormDialog from '@/components/employees/role-form-dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EmployeesPage() {
  const { selectedBusiness } = useBusiness();
  const { 
    employees, 
    roles, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    permissions,
    addRole,
    updateRole,
    deleteRole,
  } = useEmployee();
  
  const [activeTab, setActiveTab] = useState('employees');

  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isEmployeeAlertOpen, setIsEmployeeAlertOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [isRoleAlertOpen, setIsRoleAlertOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);


  // --- Employee Handlers ---
  const handleSaveEmployee = (data: EmployeeFormValues) => {
    if (employeeToEdit) {
      updateEmployee(selectedBusiness.id, { ...employeeToEdit, ...data });
    } else {
      addEmployee(selectedBusiness.id, data);
    }
    setEmployeeToEdit(null);
    setIsEmployeeFormOpen(false);
  };

  const handleOpenEditEmployeeDialog = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsEmployeeFormOpen(true);
  };
  
  const handleOpenDeleteEmployeeDialog = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsEmployeeAlertOpen(true);
  };

  const handleConfirmDeleteEmployee = () => {
    if (employeeToDelete) {
      deleteEmployee(selectedBusiness.id, employeeToDelete.id);
    }
    setIsEmployeeAlertOpen(false);
    setEmployeeToDelete(null);
  };

  // --- Role Handlers ---
  const handleSaveRole = (data: RoleFormValues) => {
    if (roleToEdit) {
      updateRole(selectedBusiness.id, { ...roleToEdit, ...data });
    } else {
      addRole(selectedBusiness.id, data);
    }
    setRoleToEdit(null);
    setIsRoleFormOpen(false);
  };
  
  const handleOpenEditRoleDialog = (role: Role) => {
    setRoleToEdit(role);
    setIsRoleFormOpen(true);
  };

  const handleOpenDeleteRoleDialog = (role: Role) => {
    setRoleToDelete(role);
    setIsRoleAlertOpen(true);
  };

  const handleConfirmDeleteRole = () => {
    if (roleToDelete) {
      deleteRole(selectedBusiness.id, roleToDelete.id);
    }
    setIsRoleAlertOpen(false);
    setRoleToDelete(null);
  };

  // --- Main Button Handler ---
  const handleOpenAddDialog = () => {
    if (activeTab === 'employees') {
      setEmployeeToEdit(null);
      setIsEmployeeFormOpen(true);
    } else {
      setRoleToEdit(null);
      setIsRoleFormOpen(true);
    }
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
          <h1 className="text-3xl font-bold font-headline tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage employee accounts, roles, and permissions.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {activeTab === 'employees' ? 'Add Employee' : 'Add Role'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="flex-1 overflow-hidden mt-4">
          <EmployeeTable
            key={`${selectedBusiness.id}-employees`}
            employees={employees}
            roles={roles}
            onEdit={handleOpenEditEmployeeDialog}
            onDelete={handleOpenDeleteEmployeeDialog}
          />
        </TabsContent>
        <TabsContent value="roles" className="flex-1 overflow-hidden mt-4">
           <RoleTable
            key={`${selectedBusiness.id}-roles`}
            roles={roles}
            onEdit={handleOpenEditRoleDialog}
            onDelete={handleOpenDeleteRoleDialog}
          />
        </TabsContent>
      </Tabs>


      {/* Dialogs and Alerts */}
      <EmployeeFormDialog
        isOpen={isEmployeeFormOpen}
        onOpenChange={setIsEmployeeFormOpen}
        onSave={handleSaveEmployee}
        employee={employeeToEdit}
        roles={roles}
      />
      <RoleFormDialog
        isOpen={isRoleFormOpen}
        onOpenChange={setIsRoleFormOpen}
        onSave={handleSaveRole}
        role={roleToEdit}
      />

      {employeeToDelete && (
        <AlertDialog open={isEmployeeAlertOpen} onOpenChange={setIsEmployeeAlertOpen}>
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
                onClick={handleConfirmDeleteEmployee}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {roleToDelete && (
        <AlertDialog open={isRoleAlertOpen} onOpenChange={setIsRoleAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the role "{roleToDelete.name}".
                 If this role is assigned to any employees, you will need to reassign them.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={handleConfirmDeleteRole}
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
