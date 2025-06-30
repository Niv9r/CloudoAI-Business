'use client';

import { createContext, useContext, useState, useMemo, type ReactNode, useCallback } from 'react';
import type { Customer, CustomerFormValues } from '@/lib/types';
import { mockDb } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

interface CustomerContextType {
  getCustomers: (businessId: string) => Customer[];
  addCustomer: (businessId: string, data: CustomerFormValues) => void;
  updateCustomer: (businessId: string, customer: Customer) => void;
  deleteCustomer: (businessId: string, customerId: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [allCustomers, setAllCustomers] = useState<Record<string, Customer[]>>(mockDb.customers);

  const getCustomers = useCallback((businessId: string) => {
    return allCustomers[businessId] || [];
  }, [allCustomers]);

  const addCustomer = useCallback((businessId: string, data: CustomerFormValues) => {
    const newCustomer: Customer = {
      id: `CUST${Date.now()}`,
      ...data,
      loyaltyPoints: data.loyaltyPoints || 0,
    };
    setAllCustomers(prev => ({
        ...prev,
        [businessId]: [...(prev[businessId] || []), newCustomer]
    }));
    toast({ title: "Success", description: "Customer added successfully." });
  }, [toast]);

  const updateCustomer = useCallback((businessId: string, updatedCustomer: Customer) => {
    setAllCustomers(prev => ({
        ...prev,
        [businessId]: (prev[businessId] || []).map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
    }));
    toast({ title: "Success", description: "Customer updated successfully." });
  }, [toast]);

  const deleteCustomer = useCallback((businessId: string, customerId: string) => {
    const customerToDelete = (allCustomers[businessId] || []).find(c => c.id === customerId);
    setAllCustomers(prev => ({
        ...prev,
        [businessId]: (prev[businessId] || []).filter(c => c.id !== customerId)
    }));
    if (customerToDelete) {
        toast({
            variant: "destructive",
            title: "Customer Deleted",
            description: `"${customerToDelete.firstName} ${customerToDelete.lastName}" has been removed.`,
        });
    }
  }, [allCustomers, toast]);

  const value = useMemo(() => ({
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  }), [getCustomers, addCustomer, updateCustomer, deleteCustomer]);

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
