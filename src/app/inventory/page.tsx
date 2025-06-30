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
import { useBusiness } from "@/context/business-context";


export default function InventoryPage() {
  const { selectedBusiness } = useBusiness();
  const { getProducts, addProduct, updateProduct, deleteProduct } = useInventory();
  const products = getProducts(selectedBusiness.id);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleSaveProduct = (data: ProductFormValues) => {
    if (productToEdit) {
      updateProduct(selectedBusiness.id, { ...productToEdit, ...data });
    } else {
      addProduct(selectedBusiness.id, data);
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
        deleteProduct(selectedBusiness.id, productToDelete.id);
    }
    setIsAlertOpen(false);
    setProductToDelete(null);
  }

  return (
    <div className="flex h-full flex-col gap-4">
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
      <div className="flex-1 overflow-hidden">
        <ProductTable 
            key={selectedBusiness.id} 
            products={products} 
            onEdit={handleOpenEditDialog} 
            onDelete={handleOpenDeleteDialog} 
        />
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
    </div>
  );
}
