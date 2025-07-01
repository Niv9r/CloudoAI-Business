
'use client';

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { useAudit } from "@/context/audit-context";
import { useBusiness } from "@/context/business-context";

export default function AuditLogTable() {
  const [isClient, setIsClient] = useState(false);
  const { selectedBusiness } = useBusiness();
  const { getAuditLog } = useAudit();
  const auditLog = getAuditLog(selectedBusiness.id);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <Card className="h-full w-full flex flex-col">
      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Timestamp</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLog.length > 0 ? auditLog.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{isClient ? format(new Date(log.timestamp), 'PPpp') : ''}</TableCell>
                <TableCell className="font-medium">{log.employeeName}</TableCell>
                <TableCell className="font-mono">{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No audit records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    