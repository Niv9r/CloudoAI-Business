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
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { format } from 'date-fns';
import type { Shift } from "@/lib/types";

interface ShiftsLogProps {
  shifts: Shift[];
  onViewDetails: (shift: Shift) => void;
}

export default function ShiftsLog({ shifts, onViewDetails }: ShiftsLogProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Shift History</CardTitle>
        <CardDescription>A log of all reconciled shifts.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shift ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Sales</TableHead>
              <TableHead className="text-right">Discrepancy</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.length > 0 ? shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell className="font-medium">{shift.id}</TableCell>
                <TableCell>{isClient ? format(new Date(shift.startTime), 'PPP') : ''}</TableCell>
                <TableCell>{shift.employeeId}</TableCell>
                <TableCell>
                  <Badge variant={shift.status === 'reconciled' ? 'default' : 'secondary'}>
                    {shift.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${(shift.totalSales ?? 0).toFixed(2)}</TableCell>
                <TableCell className={`text-right font-medium ${shift.discrepancy && shift.discrepancy !== 0 ? 'text-destructive' : ''}`}>
                    ${(shift.discrepancy ?? 0).toFixed(2)}
                </TableCell>
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
                      <DropdownMenuItem onClick={() => onViewDetails(shift)}>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No shifts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
