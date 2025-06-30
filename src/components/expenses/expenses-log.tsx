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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MoreHorizontal, CreditCard } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { format } from 'date-fns';
import type { Expense, Vendor } from "@/lib/types";

interface ExpensesLogProps {
  expenses: Expense[];
  vendors: Vendor[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onMarkAsPaid: (expenseId: string) => void;
}

export default function ExpensesLog({ expenses, vendors, onEdit, onDelete, onMarkAsPaid }: ExpensesLogProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  }
  
  const getBadgeVariant = (status: Expense['status']) => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Pending': return 'secondary';
        case 'Overdue': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense History</CardTitle>
        <CardDescription>A log of all your recorded business expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{getVendorName(expense.vendorId)}</TableCell>
                <TableCell>{isClient ? format(new Date(expense.issueDate), 'PPP') : ''}</TableCell>
                <TableCell>{isClient ? format(new Date(expense.dueDate), 'PPP') : ''}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(expense.status)}>
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${expense.total.toFixed(2)}</TableCell>
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
                      <DropdownMenuItem onClick={() => onEdit(expense)}>Edit</DropdownMenuItem>
                      {expense.status !== 'Paid' && (
                        <DropdownMenuItem onClick={() => onMarkAsPaid(expense.id)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Mark as Paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(expense)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
