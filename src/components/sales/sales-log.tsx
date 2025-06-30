'use client';

import { useState, useMemo, useEffect } from "react";
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
import { MoreHorizontal, Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { format, startOfDay, endOfDay } from 'date-fns';
import type { Sale } from "@/lib/types";
import SaleDetailsDialog from "./sale-details-dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DatePickerWithRange } from "../ui/date-picker";
import type { DateRange } from "react-day-picker";
import { useBusiness } from "@/context/business-context";
import { useInventory } from "@/context/inventory-context";

export default function SalesLog() {
  const { selectedBusiness } = useBusiness();
  const { getSales } = useInventory();
  const sales = getSales(selectedBusiness.id);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const handlePrintReceipt = (saleId: string) => {
    toast({
      title: "Printing Receipt",
      description: `Receipt for sale ${saleId} has been sent to the printer.`,
    });
  }

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange(undefined);
  };

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Search term filter
      const searchMatch = searchTerm.toLowerCase() === '' ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.employee.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === 'all' || sale.status === statusFilter;

      // Date range filter
      const saleDate = new Date(sale.timestamp);
      const dateMatch = !dateRange || (
        (!dateRange.from || saleDate >= startOfDay(dateRange.from)) &&
        (!dateRange.to || saleDate <= endOfDay(dateRange.to))
      );

      return searchMatch && statusMatch && dateMatch;
    });
  }, [sales, searchTerm, statusFilter, dateRange]);

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || dateRange !== undefined;

  return (
    <>
      <Card className="flex h-full w-full flex-col">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Search, filter, and review all sales and returns.</CardDescription>
        </CardHeader>
        <div className="flex flex-col items-center gap-4 px-6 pb-4 border-b md:flex-row">
          <div className="relative w-full flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by ID, customer..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
                <SelectItem value="Partially Refunded">Partially Refunded</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        <CardContent className="flex-1 overflow-auto p-0">
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
              {filteredSales.length > 0 ? filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{isClient ? format(new Date(sale.timestamp), 'PPpp') : ""}</TableCell>
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
              )) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No results found.
                    </TableCell>
                </TableRow>
              )}
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
