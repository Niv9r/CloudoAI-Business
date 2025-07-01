
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from 'date-fns';
import type { GeneralLedgerEntry, ChartOfAccount } from "@/lib/types";

interface GeneralLedgerLogProps {
  ledgerEntries: GeneralLedgerEntry[];
  accounts: ChartOfAccount[];
}

export default function GeneralLedgerLog({ ledgerEntries, accounts }: GeneralLedgerLogProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.accountName || 'Unknown';
  };

  return (
    <Card className="h-full w-full flex flex-col">
      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Timestamp</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerEntries.length > 0 ? ledgerEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{isClient ? format(new Date(entry.date), 'PPp') : ''}</TableCell>
                <TableCell className="font-medium">{getAccountName(entry.accountId)}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-right font-mono">{entry.debit ? `$${entry.debit.toFixed(2)}` : '-'}</TableCell>
                <TableCell className="text-right font-mono">{entry.credit ? `$${entry.credit.toFixed(2)}` : '-'}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No general ledger entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

