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

const products = [
  {
    id: "PROD001",
    name: "Artisan Coffee Beans",
    sku: "ACB-250G",
    category: "Coffee",
    stock: 120,
    price: 15.99,
    status: "In Stock",
  },
  {
    id: "PROD002",
    name: "Classic Leather Wallet",
    sku: "CLW-BLK-01",
    category: "Accessories",
    stock: 75,
    price: 49.99,
    status: "In Stock",
  },
  {
    id: "PROD003",
    name: "Silk Scarf",
    sku: "SS-RED-LG",
    category: "Apparel",
    stock: 0,
    price: 29.99,
    status: "Out of Stock",
  },
  {
    id: "PROD004",
    name: "Canvas Tote Bag",
    sku: "CTB-NAT-MD",
    category: "Bags",
    stock: 25,
    price: 24.99,
    status: "Low Stock",
  },
  {
    id: "PROD005",
    name: "Designer Sunglasses",
    sku: "DS-TOR-55",
    category: "Accessories",
    stock: 40,
    price: 149.99,
    status: "In Stock",
  },
];

export default function ProductTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>A list of all products in your inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.status === 'In Stock' ? 'default' : product.status === 'Low Stock' ? 'secondary' : 'destructive'}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
