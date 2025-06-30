'use client';

import type { Business } from '@/lib/types';
import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

const mockBusinesses: Business[] = [
  { id: 'biz_1', name: 'Artisan Goods Co.', timezone: 'America/New_York' },
  { id: 'biz_2', name: 'Downtown Cafe', timezone: 'America/Los_Angeles' },
  { id: 'biz_3', name: 'The Book Nook', timezone: 'Europe/London' },
];

interface BusinessContextType {
  businesses: Business[];
  selectedBusiness: Business;
  setSelectedBusiness: (business: Business) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses] = useState<Business[]>(mockBusinesses);
  const [selectedBusiness, setSelectedBusiness] = useState<Business>(mockBusinesses[0]);

  const value = useMemo(() => ({
    businesses,
    selectedBusiness,
    setSelectedBusiness,
  }), [businesses, selectedBusiness]);

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
