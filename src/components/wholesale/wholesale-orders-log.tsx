
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
import { MoreHorizontal, Truck, Paperclip, CreditCard, XCircle, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { format } from 'date-fns';
import type { WholesaleOrder, Customer } from "@/lib/types";

interface WholesaleOrdersLogProps {
  orders: WholesaleOrder[];
  customers: Customer[];
  onEdit: (order: WholesaleOrder) => void;
  onConfirm: (order: WholesaleOrder) => void;
  onMarkAsPaid: (order: WholesaleOrder) => void;
  onShip: (order: WholesaleOrder) => void;
  onCancel: (order: WholesaleOrder) => void;
}

export default function WholesaleOrdersLog({ orders, customers, onEdit, onConfirm, onMarkAsPaid, onShip, onCancel }: WholesaleOrdersLogProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.companyName || 'Unknown Customer';
  }
  
  const getBadgeVariant = (status: WholesaleOrder['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'Completed': return 'default';
        case 'Shipped': return 'default';
        case 'Awaiting Fulfillment': return 'secondary';
        case 'Awaiting Payment': return 'secondary';
        case 'Draft': return 'outline';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle>Wholesale Orders</CardTitle>
        <CardDescription>A log of all B2B orders and their fulfillment status.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{getCustomerName(order.customerId)}</TableCell>
                <TableCell>{isClient ? format(new Date(order.orderDate), 'PPP') : ''}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
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
                      {order.status === 'Draft' && (
                        <>
                          <DropdownMenuItem onClick={() => onConfirm(order)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(order)}>Edit Draft</DropdownMenuItem>
                        </>
                      )}
                      
                      {order.status === 'Awaiting Payment' && (
                        <DropdownMenuItem onClick={() => onMarkAsPaid(order)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Mark as Paid
                        </DropdownMenuItem>
                      )}

                      {order.status === 'Awaiting Fulfillment' && (
                        <DropdownMenuItem onClick={() => onShip(order)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Ship Items
                        </DropdownMenuItem>
                      )}
                      
                      {(order.status === 'Draft' || order.status === 'Awaiting Payment') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onCancel(order)} className="text-destructive focus:text-destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No wholesale orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
