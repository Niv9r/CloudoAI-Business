'use client';

import { createContext, useContext, useState, useMemo, type ReactNode, useCallback } from 'react';
import type { Customer, CustomerFormValues } from '@/lib/types';
import { customers as mockCustomers } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (data: CustomerFormValues) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const addCustomer = useCallback((data: CustomerFormValues) => {
    const newCustomer: Customer = {
      id: `CUST${Date.now()}`,
      ...data,
      loyaltyPoints: data.loyaltyPoints || 0,
    };
    setCustomers(prev => [...prev, newCustomer]);
    toast({ title: "Success", description: "Customer added successfully." });
  }, [toast]);

  const updateCustomer = useCallback((updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    toast({ title: "Success", description: "Customer updated successfully." });
  }, [toast]);

  const deleteCustomer = useCallback((customerId: string) => {
    const customerToDelete = customers.find(c => c.id === customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    if (customerToDelete) {
        toast({
            variant: "destructive",
            title: "Customer Deleted",
            description: `"${customerToDelete.firstName} ${customerToDelete.lastName}" has been removed.`,
        });
    }
  }, [customers, toast]);

  const value = useMemo(() => ({
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  }), [customers, addCustomer, updateCustomer, deleteCustomer]);

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
