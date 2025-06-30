'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/inventory/product-table";
import { PlusCircle } from "lucide-react";
import type { Product, ProductFormValues } from "@/lib/types";
import ProductFormDialog from "@/components/inventory/product-form-dialog";
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
import { useInventory } from "@/context/inventory-context";


export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleSaveProduct = (data: ProductFormValues) => {
    if (productToEdit) {
      updateProduct({ ...productToEdit, ...data });
    } else {
      addProduct(data);
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
        deleteProduct(productToDelete.id);
    }
    setIsAlertOpen(false);
    setProductToDelete(null);
  }

  return (
    <>
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
