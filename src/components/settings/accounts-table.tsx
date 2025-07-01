
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Card, CardContent } from "@/components/ui/card";
  import { MoreHorizontal } from "lucide-react";
  import { Button } from "../ui/button";
  import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "../ui/dropdown-menu";
  import type { ChartOfAccount } from "@/lib/types";
  import { Badge } from "../ui/badge";

  interface AccountsTableProps {
    accounts: ChartOfAccount[];
    onEdit: (account: ChartOfAccount) => void;
    onDelete: (account: ChartOfAccount) => void;
  }
  
  export default function AccountsTable({ accounts, onEdit, onDelete }: AccountsTableProps) {
    return (
      <Card className="h-full w-full flex flex-col">
        <CardContent className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length > 0 ? accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono">{account.accountNumber}</TableCell>
                  <TableCell className="font-medium">{account.accountName}</TableCell>
                  <TableCell><Badge variant="outline">{account.accountType}</Badge></TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(account)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(account)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No accounts found. Start by adding one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  
