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
import { MoreHorizontal, Truck } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { format } from 'date-fns';
import type { PurchaseOrder, Vendor } from "@/lib/types";

interface PurchaseOrdersLogProps {
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  onEdit: (po: PurchaseOrder) => void;
  onReceive: (po: PurchaseOrder) => void;
}

export default function PurchaseOrdersLog({ purchaseOrders, vendors, onEdit, onReceive }: PurchaseOrdersLogProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  }
  
  const getBadgeVariant = (status: PurchaseOrder['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'Received': return 'default';
        case 'Partially Received': return 'secondary';
        case 'Ordered': return 'outline';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>PO History</CardTitle>
        <CardDescription>A log of all your purchase orders.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expected Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders.length > 0 ? purchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-medium">{po.id}</TableCell>
                <TableCell>{getVendorName(po.vendorId)}</TableCell>
                <TableCell>{isClient ? format(new Date(po.issueDate), 'PPP') : ''}</TableCell>
                <TableCell>{isClient ? format(new Date(po.expectedDate), 'PPP') : ''}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(po.status)}>
                    {po.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${po.total.toFixed(2)}</TableCell>
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
                      <DropdownMenuItem onClick={() => onEdit(po)}>Edit</DropdownMenuItem>
                      {po.status !== 'Received' && po.status !== 'Cancelled' && (
                        <DropdownMenuItem onClick={() => onReceive(po)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Receive Stock
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">Cancel PO</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No purchase orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
