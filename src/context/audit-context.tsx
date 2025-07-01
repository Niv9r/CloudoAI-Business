
'use client';

import { createContext, useContext, useState, useMemo, type ReactNode, useCallback } from 'react';
import type { AuditLog, Employee } from '@/lib/types';
import { mockDb } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from './business-context';

interface AuditContextType {
  getAuditLog: (businessId: string) => AuditLog[];
  logAction: (businessId: string, employee: Employee | null, action: string, details: string) => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [allLogs, setAllLogs] = useState<Record<string, AuditLog[]>>(mockDb.auditLog);

  const getAuditLog = useCallback((businessId: string) => {
    return (allLogs[businessId] || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allLogs]);

  const logAction = useCallback((businessId: string, employee: Employee | null, action: string, details: string) => {
    if (!employee) {
        console.warn("Audit action triggered without an employee.", { action, details });
        return;
    }
    const newLog: AuditLog = {
      id: `LOG${Date.now()}`,
      timestamp: new Date().toISOString(),
      employeeId: employee.id,
      employeeName: employee.name,
      action,
      details,
    };
    setAllLogs(prev => ({
        ...prev,
        [businessId]: [newLog, ...(prev[businessId] || [])]
    }));
  }, []);

  const value = useMemo(() => ({
    getAuditLog,
    logAction,
  }), [getAuditLog, logAction]);

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}

    