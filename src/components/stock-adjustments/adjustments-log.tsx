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
import type { StockAdjustment, Product } from "@/lib/types";
import { Badge } from "../ui/badge";

interface AdjustmentsLogProps {
  adjustments: StockAdjustment[];
  products: Product[];
}

export default function AdjustmentsLog({ adjustments, products }: AdjustmentsLogProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Adjustment History</CardTitle>
        <CardDescription>A log of all manual stock adjustments.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Employee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.length > 0 ? adjustments.map((adj) => (
              <TableRow key={adj.id}>
                <TableCell>{isClient ? format(new Date(adj.timestamp), 'PPpp') : ''}</TableCell>
                <TableCell className="font-medium">{getProductName(adj.productId)}</TableCell>
                <TableCell><Badge variant="outline">{adj.type}</Badge></TableCell>
                <TableCell className={`text-center font-bold ${adj.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {adj.quantity > 0 ? `+${adj.quantity}`: adj.quantity}
                </TableCell>
                <TableCell>{adj.notes}</TableCell>
                <TableCell>{adj.employee}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No stock adjustments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
