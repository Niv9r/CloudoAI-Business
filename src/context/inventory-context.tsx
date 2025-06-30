'use client';

import { createContext, useContext, useState, useMemo, type ReactNode, useCallback } from 'react';
import type { Product, ProductFormValues, PurchaseOrder, PurchaseOrderFormValues, Vendor, StockAdjustment, StockAdjustmentFormValues } from '@/lib/types';
import { products as mockProducts, purchaseOrders as mockPurchaseOrders, vendors as mockVendors, stockAdjustments as mockStockAdjustments } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

interface InventoryContextType {
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  stockAdjustments: StockAdjustment[];
  addProduct: (data: ProductFormValues) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addPurchaseOrder: (data: PurchaseOrderFormValues) => void;
  updatePurchaseOrder: (po: PurchaseOrder) => void;
  receiveStock: (poId: string, receivedItems: { productId: string; quantityReceived: number }[]) => void;
  adjustStock: (data: StockAdjustmentFormValues) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(mockStockAdjustments);
  const [vendors] = useState<Vendor[]>(mockVendors);

  const getStatusFromStock = (stock: number): Product['status'] => {
    if (stock <= 0) return "Out of Stock";
    if (stock > 0 && stock <= 25) return "Low Stock";
    return "In Stock";
  }

  const addProduct = useCallback((data: ProductFormValues) => {
    const newProduct: Product = {
      id: `PROD${Date.now()}`,
      ...data,
      status: getStatusFromStock(data.stock),
    };
    setProducts(prev => [...prev, newProduct]);
    toast({ title: "Success", description: "Product added successfully." });
  }, [toast]);

  const updateProduct = useCallback((updatedProductData: ProductFormValues & {id: string}) => {
    setProducts(prev => prev.map(p => p.id === updatedProductData.id ? { ...p, ...updatedProductData, status: getStatusFromStock(updatedProductData.stock) } : p));
    toast({ title: "Success", description: "Product updated successfully." });
  }, [toast]);

  const deleteProduct = useCallback((productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (productToDelete) {
        toast({
            variant: "destructive",
            title: "Product Deleted",
            description: `"${productToDelete.name}" has been removed from inventory.`,
        });
    }
  }, [products, toast]);
  
  const addPurchaseOrder = useCallback((data: PurchaseOrderFormValues) => {
    const total = data.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    const newPO: PurchaseOrder = {
        id: `PO-${Date.now()}`,
        ...data,
        issueDate: data.issueDate.toISOString(),
        expectedDate: data.expectedDate.toISOString(),
        lineItems: data.lineItems.map(li => ({...li, quantityReceived: 0 })),
        total,
        status: 'Ordered',
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    toast({ title: "Success", description: "Purchase Order created." });
  }, [toast]);

  const updatePurchaseOrder = useCallback((updatedPO: PurchaseOrder) => {
    const total = updatedPO.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    setPurchaseOrders(prev => prev.map(po => po.id === updatedPO.id ? {...updatedPO, total} : po));
    toast({ title: "Success", description: `PO ${updatedPO.id} updated.` });
  }, [toast]);
  
  const receiveStock = useCallback((poId: string, receivedItems: { productId: string, quantityReceived: number }[]) => {
    setPurchaseOrders(prevPOs => {
        const poToUpdate = prevPOs.find(p => p.id === poId);
        if (!poToUpdate) return prevPOs;

        const updatedLineItems = poToUpdate.lineItems.map(li => {
            const receivedItem = receivedItems.find(ri => ri.productId === li.productId);
            return receivedItem ? { ...li, quantityReceived: (li.quantityReceived || 0) + receivedItem.quantityReceived } : li;
        });

        const isFullyReceived = updatedLineItems.every(li => (li.quantityReceived || 0) >= li.quantity);
        
        const updatedPO: PurchaseOrder = {
            ...poToUpdate,
            lineItems: updatedLineItems,
            status: isFullyReceived ? 'Received' : 'Partially Received'
        };

        return prevPOs.map(p => p.id === poId ? updatedPO : p);
    });

    setProducts(prevProducts => {
        return prevProducts.map(prod => {
            const receivedItem = receivedItems.find(ri => ri.productId === prod.id);
            if (receivedItem) {
                const newStock = prod.stock + receivedItem.quantityReceived;
                return {
                    ...prod,
                    stock: newStock,
                    status: getStatusFromStock(newStock)
                };
            }
            return prod;
        });
    });
    
    toast({ title: "Stock Updated", description: "Inventory has been updated with received items." });

  }, [toast]);

  const adjustStock = useCallback((data: StockAdjustmentFormValues) => {
    const productToUpdate = products.find(p => p.id === data.productId);
    if (!productToUpdate) {
        toast({ variant: "destructive", title: "Error", description: "Product not found." });
        return;
    };

    const newStock = productToUpdate.stock + data.quantity;

    const newAdjustment: StockAdjustment = {
        id: `ADJ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        employee: 'Admin User', // Hardcoded for now
        ...data
    };
    setStockAdjustments(prev => [newAdjustment, ...prev]);

    setProducts(prevProducts => prevProducts.map(p => p.id === data.productId ? {
        ...p,
        stock: newStock,
        status: getStatusFromStock(newStock)
    } : p));

    toast({
        title: "Stock Adjusted",
        description: `Stock for ${productToUpdate.name} changed by ${data.quantity}. New total: ${newStock}.`
    });
  }, [products, toast]);


  const value = useMemo(() => ({
    products,
    purchaseOrders,
    vendors,
    stockAdjustments,
    addProduct,
    updateProduct,
    deleteProduct,
    addPurchaseOrder,
    updatePurchaseOrder,
    receiveStock,
    adjustStock,
  }), [products, purchaseOrders, vendors, stockAdjustments, addProduct, updateProduct, deleteProduct, addPurchaseOrder, updatePurchaseOrder, receiveStock, adjustStock]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
