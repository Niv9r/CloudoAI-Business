'use client';

import type { Business } from '@/lib/types';
import { createContext, useContext, useState, useMemo, type ReactNode, useCallback } from 'react';

const mockBusinesses: Business[] = [
  { id: 'biz_1', name: 'Artisan Goods Co.', legalName: 'Artisan Goods LLC', address: '123 Craft Lane, New York, NY', phone: '555-0101', email: 'contact@artisangoods.com', timezone: 'America/New_York' },
  { id: 'biz_2', name: 'Downtown Cafe', legalName: 'The Cafe Inc.', address: '456 Main St, Los Angeles, CA', phone: '555-0102', email: 'manager@downtowncafe.com', timezone: 'America/Los_Angeles' },
  { id: 'biz_3', name: 'The Book Nook', legalName: 'The Book Nook Ltd.', address: '789 Reading Rd, London, UK', phone: '555-0103', email: 'info@thebooknook.co.uk', timezone: 'Europe/London' },
];

interface BusinessContextType {
  businesses: Business[];
  selectedBusiness: Business;
  setSelectedBusiness: (business: Business) => void;
  addBusiness: (business: Omit<Business, 'id' | 'timezone'> & { timezone?: string }) => void;
  updateBusiness: (business: Business) => void;
  deleteBusiness: (businessId: string) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [selectedBusiness, setSelectedBusiness] = useState<Business>(mockBusinesses[0]);

  const addBusiness = useCallback((businessData: Omit<Business, 'id' | 'timezone'> & { timezone?: string }) => {
    const newBusiness = { 
        ...businessData, 
        id: `biz_${Date.now()}`,
        timezone: businessData.timezone || 'America/New_York'
    };
    setBusinesses(prev => [...prev, newBusiness]);
    setSelectedBusiness(newBusiness);
  }, []);

  const updateBusiness = useCallback((updatedBusiness: Business) => {
    setBusinesses(prev => prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b));
    if (selectedBusiness.id === updatedBusiness.id) {
        setSelectedBusiness(updatedBusiness);
    }
  }, [selectedBusiness.id]);

  const deleteBusiness = useCallback((businessId: string) => {
    setBusinesses(prev => {
        if (prev.length <= 1) {
            alert("You cannot delete your only business.");
            return prev;
        }
        const newBusinesses = prev.filter(b => b.id !== businessId);
        if (selectedBusiness.id === businessId && newBusinesses.length > 0) {
            setSelectedBusiness(newBusinesses[0]);
        }
        return newBusinesses;
    });
  }, [selectedBusiness.id]);

  const value = useMemo(() => ({
    businesses,
    selectedBusiness,
    setSelectedBusiness,
    addBusiness,
    updateBusiness,
    deleteBusiness
  }), [businesses, selectedBusiness, addBusiness, updateBusiness, deleteBusiness, setSelectedBusiness]);

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
