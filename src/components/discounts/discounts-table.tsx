
'use client';

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
  import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "../ui/dropdown-menu";
  import type { DiscountCode } from "@/lib/types";
  import { Switch } from "../ui/switch";
  import { useInventory } from "@/context/inventory-context";
  import { useBusiness } from "@/context/business-context";

  interface DiscountsTableProps {
    discounts: DiscountCode[];
    onEdit: (discount: DiscountCode) => void;
    onDelete: (discount: DiscountCode) => void;
  }
  
  export default function DiscountsTable({ discounts, onEdit, onDelete }: DiscountsTableProps) {
    const { selectedBusiness } = useBusiness();
    const { updateDiscountCode } = useInventory();
    
    const handleToggleActive = (discount: DiscountCode, isActive: boolean) => {
        updateDiscountCode(selectedBusiness.id, {...discount, isActive});
    }

    return (
      <Card className="h-full w-full flex flex-col">
        <CardHeader>
          <CardTitle>Discount Code List</CardTitle>
          <CardDescription>All available discount codes for your business.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.length > 0 ? discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-mono font-medium">{discount.code}</TableCell>
                  <TableCell>{discount.type}</TableCell>
                  <TableCell>{discount.type === 'fixed' ? `$${discount.value.toFixed(2)}` : `${discount.value}%`}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Switch
                            id={`active-switch-${discount.id}`}
                            checked={discount.isActive}
                            onCheckedChange={(checked) => handleToggleActive(discount, checked)}
                        />
                         <Badge variant={discount.isActive ? 'default' : 'outline'}>
                            {discount.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
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
                        <DropdownMenuItem onClick={() => onEdit(discount)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(discount)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No discounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

    