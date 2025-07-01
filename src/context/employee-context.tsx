
'use client';

import { createContext, useContext, useState, useMemo, type ReactNode, useCallback, useEffect } from 'react';
import type { Employee, Role, Permission, EmployeeFormValues, RoleFormValues } from '@/lib/types';
import { mockDb } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from './business-context';

interface EmployeeContextType {
  employees: Employee[];
  roles: Role[];
  currentEmployee: Employee | null;
  permissions: Set<Permission>;
  getEmployees: (businessId: string) => Employee[];
  getRoles: (businessId: string) => Role[];
  addEmployee: (businessId: string, data: EmployeeFormValues) => void;
  updateEmployee: (businessId: string, employee: Employee) => void;
  deleteEmployee: (businessId: string, employeeId: string) => void;
  setCurrentEmployee: (employee: Employee | null) => void;
  addRole: (businessId: string, data: RoleFormValues) => void;
  updateRole: (businessId: string, role: Role) => void;
  deleteRole: (businessId: string, roleId: string) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { selectedBusiness } = useBusiness();
  const [allEmployees, setAllEmployees] = useState<Record<string, Employee[]>>(mockDb.employees);
  const [allRoles, setAllRoles] = useState<Record<string, Role[]>>(mockDb.roles);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // Set initial employee when business changes
  useEffect(() => {
    const businessEmployees = allEmployees[selectedBusiness.id] || [];
    setCurrentEmployee(businessEmployees.length > 0 ? businessEmployees[0] : null);
  }, [selectedBusiness, allEmployees]);


  const getEmployees = useCallback((businessId: string) => {
    return allEmployees[businessId] || [];
  }, [allEmployees]);

  const getRoles = useCallback((businessId: string) => {
    return allRoles[businessId] || [];
  }, [allRoles]);

  const addEmployee = useCallback((businessId: string, data: EmployeeFormValues) => {
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      ...data,
    };
    setAllEmployees(prev => ({
        ...prev,
        [businessId]: [...(prev[businessId] || []), newEmployee]
    }));
    toast({ title: "Success", description: "Employee added successfully." });
  }, [toast]);

  const updateEmployee = useCallback((businessId: string, updatedEmployee: Employee) => {
    setAllEmployees(prev => ({
        ...prev,
        [businessId]: (prev[businessId] || []).map(e => e.id === updatedEmployee.id ? updatedEmployee : e)
    }));
    if (currentEmployee?.id === updatedEmployee.id) {
        setCurrentEmployee(updatedEmployee);
    }
    toast({ title: "Success", description: "Employee updated successfully." });
  }, [currentEmployee, toast]);

  const deleteEmployee = useCallback((businessId: string, employeeId: string) => {
    const businessEmployees = allEmployees[businessId] || [];
    if(businessEmployees.length <= 1){
        toast({ variant: 'destructive', title: "Error", description: "Cannot delete the only employee." });
        return;
    }

    const employeeToDelete = businessEmployees.find(e => e.id === employeeId);
    setAllEmployees(prev => ({
        ...prev,
        [businessId]: (prev[businessId] || []).filter(e => e.id !== employeeId)
    }));

    if (currentEmployee?.id === employeeId) {
        setCurrentEmployee(businessEmployees.filter(e => e.id !== employeeId)[0] || null);
    }

    if (employeeToDelete) {
        toast({
            variant: "destructive",
            title: "Employee Deleted",
            description: `"${employeeToDelete.name}" has been removed.`,
        });
    }
  }, [allEmployees, currentEmployee, toast]);

  const addRole = useCallback((businessId: string, data: RoleFormValues) => {
    const newRole: Role = {
      id: `role_${Date.now()}`,
      ...data,
    };
    setAllRoles(prev => ({
      ...prev,
      [businessId]: [...(prev[businessId] || []), newRole],
    }));
    toast({ title: "Success", description: `Role "${data.name}" created.`});
  }, [toast]);

  const updateRole = useCallback((businessId: string, updatedRole: Role) => {
    setAllRoles(prev => ({
      ...prev,
      [businessId]: (prev[businessId] || []).map(r => r.id === updatedRole.id ? updatedRole : r),
    }));
    toast({ title: "Success", description: `Role "${updatedRole.name}" updated.`});
  }, [toast]);

  const deleteRole = useCallback((businessId: string, roleId: string) => {
    const employeesInRole = (allEmployees[businessId] || []).filter(e => e.roleId === roleId);
    if (employeesInRole.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Delete Role',
        description: `This role is currently assigned to ${employeesInRole.length} employee(s). Please reassign them first.`
      });
      return;
    }
    
    const roleToDelete = (allRoles[businessId] || []).find(r => r.id === roleId);
    setAllRoles(prev => ({
      ...prev,
      [businessId]: (prev[businessId] || []).filter(r => r.id !== roleId),
    }));
    if (roleToDelete) {
      toast({
        variant: 'destructive',
        title: 'Role Deleted',
        description: `Role "${roleToDelete.name}" has been removed.`,
      });
    }
  }, [allRoles, allEmployees, toast]);


  const permissions = useMemo(() => {
    if (!currentEmployee) return new Set<Permission>();
    const roles = getRoles(selectedBusiness.id);
    const employeeRole = roles.find(r => r.id === currentEmployee.roleId);
    return employeeRole ? employeeRole.permissions : new Set<Permission>();
  }, [currentEmployee, getRoles, selectedBusiness.id]);

  const employees = getEmployees(selectedBusiness.id);
  const roles = getRoles(selectedBusiness.id);

  const value = useMemo(() => ({
    employees,
    roles,
    currentEmployee,
    permissions,
    getEmployees,
    getRoles,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    setCurrentEmployee,
    addRole,
    updateRole,
    deleteRole,
  }), [employees, roles, currentEmployee, permissions, getEmployees, getRoles, addEmployee, updateEmployee, deleteEmployee, addRole, updateRole, deleteRole]);

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
}
