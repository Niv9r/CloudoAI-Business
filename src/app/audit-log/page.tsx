
'use client';

import AuditLogTable from "@/components/audit-log/audit-log-table";
import { useEmployee } from "@/context/employee-context";

export default function AuditLogPage() {
    const { permissions } = useEmployee();
    
    if (!permissions.has('view_audit_log')) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view the audit log.</p>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col gap-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Audit Log</h1>
                <p className="text-muted-foreground">A record of all significant actions taken in the system.</p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <AuditLogTable />
            </div>
        </div>
    );
}

    