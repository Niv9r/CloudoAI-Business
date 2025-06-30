'use client';

import { useState } from "react";
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
import { sales } from "@/lib/mock-data";
import type { Sale } from "@/lib/types";
import SaleDetailsDialog from "./sale-details-dialog";
import { useToast } from "@/hooks/use-toast";


export default function SalesLog() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { toast } = useToast();

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const handlePrintReceipt = (saleId: string) => {
    toast({
      title: "Printing Receipt",
      description: `Receipt for sale ${saleId} has been sent to the printer.`,
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A log of all sales and returns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{format(new Date(sale.timestamp), 'PPpp')}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.payment}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === 'Completed' ? 'default' : sale.status.includes('Refunded') ? 'destructive' : 'secondary'}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(sale)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrintReceipt(sale.id)}>Print Receipt</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedSale && (
        <SaleDetailsDialog
            isOpen={!!selectedSale}
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedSale(null);
                }
            }}
            sale={selectedSale}
        />
      )}
    </>
  );
}
