'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/inventory/product-table";
import { PlusCircle } from "lucide-react";
import { products as mockProducts } from "@/lib/mock-data";
import type { Product, ProductFormValues } from "@/lib/types";
import ProductFormDialog from "@/components/inventory/product-form-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function InventoryPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const getStatusFromStock = (stock: number): Product['status'] => {
    if (stock === 0) return "Out of Stock";
    if (stock > 0 && stock <= 25) return "Low Stock";
    return "In Stock";
  }

  const handleSaveProduct = (data: ProductFormValues) => {
    if (productToEdit) {
      // Update existing product
      setProducts(products.map(p => p.id === productToEdit.id ? { ...p, ...data, status: getStatusFromStock(data.stock) } : p));
      toast({ title: "Success", description: "Product updated successfully." });
    } else {
      // Add new product
      const newProduct: Product = {
        id: `PROD${Date.now()}`,
        ...data,
        status: getStatusFromStock(data.stock),
      };
      setProducts([...products, newProduct]);
      toast({ title: "Success", description: "Product added successfully." });
    }
    setProductToEdit(null);
    setIsFormDialogOpen(false);
  };

  const handleOpenEditDialog = (product: Product) => {
    setProductToEdit(product);
    setIsFormDialogOpen(true);
  }
  
  const handleOpenAddDialog = () => {
    setProductToEdit(null);
    setIsFormDialogOpen(true);
  }

  const handleOpenDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsAlertOpen(true);
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
        setProducts(products.filter(p => p.id !== productToDelete.id));
        toast({
            variant: "destructive",
            title: "Product Deleted",
            description: `"${productToDelete.name}" has been removed from inventory.`,
        });
    }
    setIsAlertOpen(false);
    setProductToDelete(null);
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Manage your products and stock levels.</p>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        <ProductTable products={products} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} />
      </div>

      <ProductFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSave={handleSaveProduct}
        product={productToEdit}
      />
       {productToDelete && (
         <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    product "{productToDelete.name}".
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className='bg-destructive hover:bg-destructive/90'
                    onClick={handleConfirmDelete}
                >
                    Continue
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
       )}
    </>
  );
}
