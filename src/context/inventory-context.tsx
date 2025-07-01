
'use client';

import { createContext, useContext, useState, useMemo, type ReactNode, useCallback } from 'react';
import type { Product, ProductFormValues, PurchaseOrder, PurchaseOrderFormValues, Vendor, VendorFormValues, StockAdjustment, StockAdjustmentFormValues, Expense, ExpenseFormValues, Sale, Shift, SaleLineItem, WholesaleOrder, WholesaleOrderFormValues, WholesaleOrderLineItem, DiscountCode, DiscountCodeFormValues } from '@/lib/types';
import { mockDb } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface InventoryContextType {
  getProducts: (businessId: string) => Product[];
  getPurchaseOrders: (businessId: string) => PurchaseOrder[];
  getVendors: (businessId: string) => Vendor[];
  getStockAdjustments: (businessId: string) => StockAdjustment[];
  getSales: (businessId: string) => Sale[];
  getExpenses: (businessId: string) => Expense[];
  getShifts: (businessId: string) => Shift[];
  getWholesaleOrders: (businessId: string) => WholesaleOrder[];
  getDiscountCodes: (businessId: string) => DiscountCode[];
  getDiscountByCode: (businessId: string, code: string) => DiscountCode | undefined;
  
  addProduct: (businessId: string, data: ProductFormValues) => void;
  updateProduct: (businessId: string, product: Product) => void;
  deleteProduct: (businessId: string, productId: string) => void;
  
  addPurchaseOrder: (businessId: string, data: PurchaseOrderFormValues) => void;
  updatePurchaseOrder: (businessId: string, po: PurchaseOrder) => void;
  issuePurchaseOrder: (businessId: string, poId: string) => void;
  cancelPurchaseOrder: (businessId: string, poId: string) => void;
  receiveStock: (businessId: string, poId: string, receivedItems: { productId: string; quantityReceived: number }[]) => void;
  
  adjustStock: (businessId: string, data: StockAdjustmentFormValues, employeeId: string) => void;

  addSale: (businessId: string, saleData: Omit<Sale, 'id' | 'employeeId'>, employeeId: string) => Sale;
  processRefund: (businessId: string, saleId: string, itemsToRefund: { productId: string, quantity: number }[], restockItems: boolean) => void;
  
  addExpense: (businessId: string, data: ExpenseFormValues) => void;
  updateExpense: (businessId: string, expense: Expense) => void;
  deleteExpense: (businessId: string, expenseId: string) => void;
  markExpenseAsPaid: (businessId: string, expenseId: string) => void;

  addShift: (businessId: string, startingFloat: number, employeeId: string) => Shift;
  endShift: (businessId: string, shiftId: string, actualCash: number, salesThisShift: Sale[], notes?: string) => void;

  addVendor: (businessId: string, data: VendorFormValues) => void;
  updateVendor: (businessId: string, vendor: Vendor) => void;
  deleteVendor: (businessId: string, vendorId: string) => void;

  addWholesaleOrder: (businessId: string, data: WholesaleOrderFormValues) => void;
  updateWholesaleOrder: (businessId: string, order: WholesaleOrder) => void;
  confirmWholesaleOrder: (businessId: string, orderId: string) => void;
  markWholesaleOrderPaid: (businessId: string, orderId: string) => void;
  shipWholesaleOrder: (businessId: string, orderId: string, shippedItems: { productId: string; quantityShipped: number }[]) => void;
  cancelWholesaleOrder: (businessId: string, orderId: string) => void;

  addDiscountCode: (businessId: string, data: DiscountCodeFormValues) => void;
  updateDiscountCode: (businessId: string, discount: DiscountCode) => void;
  deleteDiscountCode: (businessId: string, discountId: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [db, setDb] = useState(mockDb);

  const getStatusFromStock = (stock: number): Product['status'] => {
    if (stock <= 0) return "Out of Stock";
    if (stock > 0 && stock <= 25) return "Low Stock";
    return "In Stock";
  }

  const getProducts = useCallback((businessId: string) => db.products[businessId] || [], [db.products]);
  const getPurchaseOrders = useCallback((businessId: string) => db.purchaseOrders[businessId] || [], [db.purchaseOrders]);
  const getVendors = useCallback((businessId: string) => db.vendors[businessId] || [], [db.vendors]);
  const getStockAdjustments = useCallback((businessId: string) => db.stockAdjustments[businessId] || [], [db.stockAdjustments]);
  const getSales = useCallback((businessId: string) => db.sales[businessId] || [], [db.sales]);
  const getExpenses = useCallback((businessId: string) => db.expenses[businessId] || [], [db.expenses]);
  const getShifts = useCallback((businessId: string) => db.shifts[businessId] || [], [db.shifts]);
  const getWholesaleOrders = useCallback((businessId: string) => db.wholesaleOrders[businessId] || [], [db.wholesaleOrders]);
  const getDiscountCodes = useCallback((businessId: string) => db.discounts[businessId] || [], [db.discounts]);
  
  const getDiscountByCode = useCallback((businessId: string, code: string) => {
    const businessDiscounts = db.discounts[businessId] || [];
    return businessDiscounts.find(d => d.code.toUpperCase() === code.toUpperCase() && d.isActive);
  }, [db.discounts]);

  const addProduct = useCallback((businessId: string, data: ProductFormValues) => {
    const newProduct: Product = {
      id: `PROD${Date.now()}`,
      ...data,
      status: getStatusFromStock(data.stock),
    };
    setDb(prevDb => ({
        ...prevDb,
        products: {
            ...prevDb.products,
            [businessId]: [...(prevDb.products[businessId] || []), newProduct]
        }
    }));
    toast({ title: "Success", description: "Product added successfully." });
  }, [toast]);

  const updateProduct = useCallback((businessId: string, updatedProductData: Product) => {
    setDb(prevDb => ({
        ...prevDb,
        products: {
            ...prevDb.products,
            [businessId]: (prevDb.products[businessId] || []).map(p => 
                p.id === updatedProductData.id 
                ? { ...p, ...updatedProductData, status: getStatusFromStock(updatedProductData.stock) } 
                : p
            )
        }
    }));
    toast({ title: "Success", description: "Product updated successfully." });
  }, [toast]);

  const deleteProduct = useCallback((businessId: string, productId: string) => {
    const productToDelete = (db.products[businessId] || []).find(p => p.id === productId);
    setDb(prevDb => ({
        ...prevDb,
        products: {
            ...prevDb.products,
            [businessId]: (prevDb.products[businessId] || []).filter(p => p.id !== productId)
        }
    }));
    if (productToDelete) {
        toast({
            variant: "destructive",
            title: "Product Deleted",
            description: `"${productToDelete.name}" has been removed from inventory.`,
        });
    }
  }, [db.products, toast]);
  
  const addPurchaseOrder = useCallback((businessId: string, data: PurchaseOrderFormValues) => {
    const total = data.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    const newPO: PurchaseOrder = {
        id: `PO-${Date.now()}`,
        ...data,
        issueDate: data.issueDate.toISOString(),
        expectedDate: data.expectedDate.toISOString(),
        lineItems: data.lineItems.map(li => ({...li, quantityReceived: 0 })),
        total,
        status: 'Draft',
    };
    setDb(prevDb => ({
        ...prevDb,
        purchaseOrders: {
            ...prevDb.purchaseOrders,
            [businessId]: [newPO, ...(prevDb.purchaseOrders[businessId] || [])]
        }
    }));
    toast({ title: "Success", description: "Draft Purchase Order created." });
  }, [toast]);

  const updatePurchaseOrder = useCallback((businessId: string, updatedPO: PurchaseOrder) => {
    const total = updatedPO.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    setDb(prevDb => ({
        ...prevDb,
        purchaseOrders: {
            ...prevDb.purchaseOrders,
            [businessId]: (prevDb.purchaseOrders[businessId] || []).map(po => po.id === updatedPO.id ? {...updatedPO, total} : po)
        }
    }));
    toast({ title: "Success", description: `Draft PO ${updatedPO.id} updated.` });
  }, [toast]);

  const issuePurchaseOrder = useCallback((businessId: string, poId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        purchaseOrders: {
            ...prevDb.purchaseOrders,
            [businessId]: (prevDb.purchaseOrders[businessId] || []).map(po => po.id === poId ? { ...po, status: 'Ordered' } : po)
        }
    }));
    toast({ title: "Purchase Order Issued", description: `PO ${poId} has been marked as Ordered.` });
  }, [toast]);

  const cancelPurchaseOrder = useCallback((businessId: string, poId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        purchaseOrders: {
            ...prevDb.purchaseOrders,
            [businessId]: (prevDb.purchaseOrders[businessId] || []).map(po => po.id === poId ? { ...po, status: 'Cancelled' } : po)
        }
    }));
    toast({ variant: 'destructive', title: "Purchase Order Cancelled", description: `PO ${poId} has been cancelled.` });
  }, [toast]);
  
  const receiveStock = useCallback((businessId: string, poId: string, receivedItems: { productId: string, quantityReceived: number }[]) => {
    setDb(prevDb => {
        const newDb = {...prevDb};
        
        // Update PO
        const poToUpdate = (newDb.purchaseOrders[businessId] || []).find(p => p.id === poId);
        if (poToUpdate) {
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
            newDb.purchaseOrders[businessId] = (newDb.purchaseOrders[businessId] || []).map(p => p.id === poId ? updatedPO : p);
        }

        // Update Products
        const businessProducts = newDb.products[businessId] || [];
        newDb.products[businessId] = businessProducts.map(prod => {
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
        
        return newDb;
    });
    
    toast({ title: "Stock Updated", description: "Inventory has been updated with received items." });
  }, [toast]);

  const adjustStock = useCallback((businessId: string, data: StockAdjustmentFormValues, employeeId: string) => {
    const productToUpdate = (db.products[businessId] || []).find(p => p.id === data.productId);
    if (!productToUpdate) {
        toast({ variant: "destructive", title: "Error", description: "Product not found." });
        return;
    };

    const newStock = productToUpdate.stock + data.quantity;
    const newAdjustment: StockAdjustment = {
        id: `ADJ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        employeeId: employeeId,
        ...data
    };

    setDb(prevDb => {
        const newDb = {...prevDb};
        newDb.stockAdjustments[businessId] = [newAdjustment, ...(newDb.stockAdjustments[businessId] || [])];
        newDb.products[businessId] = (newDb.products[businessId] || []).map(p => p.id === data.productId ? {
            ...p,
            stock: newStock,
            status: getStatusFromStock(newStock)
        } : p);
        return newDb;
    });

    toast({
        title: "Stock Adjusted",
        description: `Stock for ${productToUpdate.name} changed by ${data.quantity}. New total: ${newStock}.`
    });
  }, [db.products, toast]);

  const addSale = useCallback((businessId: string, saleData: Omit<Sale, 'id' | 'employeeId'>, employeeId: string) => {
    const newSale: Sale = {
      id: `SALE-${Date.now()}`,
      employeeId: employeeId,
      ...saleData
    };
     setDb(prevDb => ({
        ...prevDb,
        sales: {
            ...prevDb.sales,
            [businessId]: [newSale, ...(prevDb.sales[businessId] || [])]
        }
    }));
    return newSale;
  }, []);

  const processRefund = useCallback((businessId: string, saleId: string, itemsToRefund: { productId: string; quantity: number }[], restockItems: boolean) => {
    setDb(prevDb => {
        const newDb = JSON.parse(JSON.stringify(prevDb)); // Deep copy to avoid mutation issues
        const businessSales = newDb.sales[businessId] || [];
        const saleToUpdate = businessSales.find((s: Sale) => s.id === saleId);

        if (!saleToUpdate) {
            toast({ variant: 'destructive', title: 'Error', description: 'Sale not found.' });
            return prevDb;
        }

        let refundSubtotal = 0;
        const updatedLineItems = saleToUpdate.lineItems.map((li: SaleLineItem) => {
            const itemToRefund = itemsToRefund.find(itr => itr.productId === li.productId);
            if (itemToRefund) {
                // Ensure we don't refund more than what was bought.
                const alreadyRefunded = li.refundedQuantity || 0;
                const maxRefundable = li.quantity - alreadyRefunded;
                const quantityToRefund = Math.min(itemToRefund.quantity, maxRefundable);

                if (quantityToRefund > 0) {
                    refundSubtotal += quantityToRefund * li.unitPrice;
                    return {
                        ...li,
                        refundedQuantity: alreadyRefunded + quantityToRefund
                    };
                }
            }
            return li;
        });
        
        // This is a simplified tax refund calculation. 
        // A real system would need to handle tax rules more carefully.
        const effectiveSubtotal = saleToUpdate.subtotal - saleToUpdate.discount;
        const taxRate = effectiveSubtotal > 0 ? saleToUpdate.tax / effectiveSubtotal : 0;
        const totalRefundAmount = refundSubtotal * (1 + taxRate);


        const isFullyRefunded = updatedLineItems.every((li: SaleLineItem) => (li.refundedQuantity || 0) >= li.quantity);
        const newStatus: Sale['status'] = isFullyRefunded ? 'Refunded' : 'Partially Refunded';
        
        const updatedSale: Sale = {
            ...saleToUpdate,
            lineItems: updatedLineItems,
            status: newStatus,
            refundedAmount: (saleToUpdate.refundedAmount || 0) + totalRefundAmount,
        };

        newDb.sales[businessId] = businessSales.map((s: Sale) => s.id === saleId ? updatedSale : s);

        // Update product stock only if specified
        if (restockItems) {
            const businessProducts = newDb.products[businessId] || [];
            newDb.products[businessId] = businessProducts.map((prod: Product) => {
                const refundedItem = itemsToRefund.find(ri => ri.productId === prod.id);
                if (refundedItem) {
                    const newStock = prod.stock + refundedItem.quantity;
                    return {
                        ...prod,
                        stock: newStock,
                        status: getStatusFromStock(newStock)
                    };
                }
                return prod;
            });
        }

        return newDb;
    });

    toast({ title: "Refund Processed", description: `The refund has been successfully processed${restockItems ? ' and inventory has been updated' : ''}.` });
  }, [toast]);

  const getStatusFromDueDate = (dueDate: Date): Expense['status'] => {
      if (new Date(dueDate) < new Date()) return 'Overdue';
      return 'Pending';
  }

  const addExpense = useCallback((businessId: string, data: ExpenseFormValues) => {
    const total = data.lineItems.reduce((acc, item) => acc + item.amount, 0);
    const newExpense: Expense = {
      id: `EXP${Date.now()}`,
      vendorId: data.vendorId,
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate.toISOString(),
      dueDate: data.dueDate.toISOString(),
      lineItems: data.lineItems.map(li => ({ ...li, id: `LI-${Date.now()}-${Math.random()}`})),
      total,
      status: getStatusFromDueDate(data.dueDate),
      notes: data.notes
    };
    setDb(prevDb => ({
        ...prevDb,
        expenses: {
            ...prevDb.expenses,
            [businessId]: [newExpense, ...(prevDb.expenses[businessId] || [])]
        }
    }));
    toast({ title: "Success", description: "Expense added successfully." });
  }, [toast]);

  const updateExpense = useCallback((businessId: string, updatedExpenseData: Expense) => {
    const total = updatedExpenseData.lineItems.reduce((acc, item) => acc + item.amount, 0);
    setDb(prevDb => {
        const businessExpenses = prevDb.expenses[businessId] || [];
        const updatedExpenses = businessExpenses.map(e => {
            if (e.id === updatedExpenseData.id) {
                const updatedExpense: Expense = {
                    ...e,
                    ...updatedExpenseData,
                    issueDate: updatedExpenseData.issueDate,
                    dueDate: updatedExpenseData.dueDate,
                    lineItems: updatedExpenseData.lineItems.map((li, index) => ({ ...li, id: e.lineItems[index]?.id || `LI-${Date.now()}`})),
                    total,
                };
                if(updatedExpense.status !== 'Paid'){
                  updatedExpense.status = getStatusFromDueDate(new Date(updatedExpense.dueDate));
                }
                return updatedExpense;
            }
            return e;
        });
        return {
            ...prevDb,
            expenses: { ...prevDb.expenses, [businessId]: updatedExpenses }
        };
    });
    toast({ title: "Success", description: "Expense updated successfully." });
  }, [toast]);

  const deleteExpense = useCallback((businessId: string, expenseId: string) => {
    const expenseToDelete = (db.expenses[businessId] || []).find(e => e.id === expenseId);
    setDb(prevDb => ({
        ...prevDb,
        expenses: {
            ...prevDb.expenses,
            [businessId]: (prevDb.expenses[businessId] || []).filter(e => e.id !== expenseId)
        }
    }));
    if (expenseToDelete) {
        toast({
            variant: "destructive",
            title: "Expense Deleted",
            description: `Expense record has been removed.`,
        });
    }
  }, [db.expenses, toast]);

  const markExpenseAsPaid = useCallback((businessId: string, expenseId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        expenses: {
            ...prevDb.expenses,
            [businessId]: (prevDb.expenses[businessId] || []).map(e => e.id === expenseId ? { ...e, status: 'Paid' } : e)
        }
    }));
    toast({ title: "Status Updated", description: "Expense marked as paid." });
  }, [toast]);
  
  const addShift = useCallback((businessId: string, startingFloat: number, employeeId: string) => {
    const newShift: Shift = {
      id: `SHIFT-${format(new Date(), 'yyyyMMdd-HHmmss')}`,
      employeeId: employeeId,
      startTime: new Date().toISOString(),
      startingCashFloat: startingFloat,
      status: 'open',
    };
    setDb(prevDb => ({
        ...prevDb,
        shifts: {
            ...prevDb.shifts,
            [businessId]: [...(prevDb.shifts[businessId] || []), newShift]
        }
    }));
    return newShift;
  }, []);

  const endShift = useCallback((businessId: string, shiftId: string, actualCash: number, salesThisShift: Sale[], notes?: string) => {
    setDb(prevDb => {
        const businessShifts = prevDb.shifts[businessId] || [];
        const shiftToUpdate = businessShifts.find(s => s.id === shiftId);

        if (!shiftToUpdate) return prevDb;

        const cashSales = salesThisShift.reduce((acc, sale) => (sale.payment === 'Cash' ? acc + sale.total : acc), 0);
        const cardSales = salesThisShift.reduce((acc, sale) => (sale.payment === 'Card' || sale.payment === 'Split' ? acc + sale.total : acc), 0);
        const totalSales = cashSales + cardSales;
        const expectedDrawer = shiftToUpdate.startingCashFloat + cashSales;
        const discrepancy = actualCash - expectedDrawer;

        const updatedShift: Shift = {
            ...shiftToUpdate,
            endTime: new Date().toISOString(),
            status: 'reconciled',
            endingCashFloat: actualCash,
            cashSales,
            cardSales,
            totalSales,
            discrepancy,
            notes,
        };
        
        const updatedShifts = businessShifts.map(s => s.id === shiftId ? updatedShift : s);
        return { ...prevDb, shifts: { ...prevDb.shifts, [businessId]: updatedShifts }};
    });
  }, []);

  const addVendor = useCallback((businessId: string, data: VendorFormValues) => {
    const newVendor: Vendor = {
        id: `VEND${Date.now()}`,
        ...data,
    };
    setDb(prevDb => ({
        ...prevDb,
        vendors: {
            ...prevDb.vendors,
            [businessId]: [...(prevDb.vendors[businessId] || []), newVendor]
        }
    }));
    toast({ title: "Success", description: "Vendor added successfully." });
  }, [toast]);

  const updateVendor = useCallback((businessId: string, updatedVendor: Vendor) => {
      setDb(prevDb => ({
          ...prevDb,
          vendors: {
              ...prevDb.vendors,
              [businessId]: (prevDb.vendors[businessId] || []).map(v => v.id === updatedVendor.id ? updatedVendor : v)
          }
      }));
      toast({ title: "Success", description: "Vendor updated successfully." });
  }, [toast]);

  const deleteVendor = useCallback((businessId: string, vendorId: string) => {
      const vendorToDelete = (db.vendors[businessId] || []).find(v => v.id === vendorId);
      setDb(prevDb => ({
          ...prevDb,
          vendors: {
              ...prevDb.vendors,
              [businessId]: (prevDb.vendors[businessId] || []).filter(v => v.id !== vendorId)
          }
      }));
      if (vendorToDelete) {
          toast({
              variant: "destructive",
              title: "Vendor Deleted",
              description: `"${vendorToDelete.name}" has been removed.`,
          });
      }
  }, [db.vendors, toast]);
  
  // Wholesale Order Management
  const addWholesaleOrder = useCallback((businessId: string, data: WholesaleOrderFormValues) => {
    const subtotal = data.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const total = subtotal + data.shippingCost;
    const newOrder: WholesaleOrder = {
        id: `WO-${Date.now()}`,
        ...data,
        orderDate: data.orderDate.toISOString(),
        lineItems: data.lineItems.map(li => ({...li, quantityShipped: 0 })),
        subtotal,
        total,
        status: 'Draft',
    };
    setDb(prevDb => ({
        ...prevDb,
        wholesaleOrders: {
            ...prevDb.wholesaleOrders,
            [businessId]: [newOrder, ...(prevDb.wholesaleOrders[businessId] || [])]
        }
    }));
    toast({ title: "Success", description: "Draft Wholesale Order created." });
  }, [toast]);

  const updateWholesaleOrder = useCallback((businessId: string, updatedOrder: WholesaleOrder) => {
    const subtotal = updatedOrder.lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const total = subtotal + updatedOrder.shippingCost;
    setDb(prevDb => ({
        ...prevDb,
        wholesaleOrders: {
            ...prevDb.wholesaleOrders,
            [businessId]: (prevDb.wholesaleOrders[businessId] || []).map(o => o.id === updatedOrder.id ? {...updatedOrder, subtotal, total} : o)
        }
    }));
    toast({ title: "Success", description: `Draft Order ${updatedOrder.id} updated.` });
  }, [toast]);

  const confirmWholesaleOrder = useCallback((businessId: string, orderId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        wholesaleOrders: {
            ...prevDb.wholesaleOrders,
            [businessId]: (prevDb.wholesaleOrders[businessId] || []).map(o => o.id === orderId ? { ...o, status: 'Awaiting Payment' } : o)
        }
    }));
    toast({ title: "Order Confirmed", description: `Order ${orderId} is now awaiting payment.` });
  }, [toast]);

  const markWholesaleOrderPaid = useCallback((businessId: string, orderId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        wholesaleOrders: {
            ...prevDb.wholesaleOrders,
            [businessId]: (prevDb.wholesaleOrders[businessId] || []).map(o => o.id === orderId ? { ...o, status: 'Awaiting Fulfillment' } : o)
        }
    }));
    toast({ title: "Payment Received", description: `Order ${orderId} is now awaiting fulfillment.` });
  }, [toast]);

  const cancelWholesaleOrder = useCallback((businessId: string, orderId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        wholesaleOrders: {
            ...prevDb.wholesaleOrders,
            [businessId]: (prevDb.wholesaleOrders[businessId] || []).map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o)
        }
    }));
    toast({ variant: 'destructive', title: "Order Cancelled", description: `Wholesale Order ${orderId} has been cancelled.` });
  }, [toast]);

  const shipWholesaleOrder = useCallback((businessId: string, orderId: string, shippedItems: { productId: string; quantityShipped: number }[]) => {
    setDb(prevDb => {
        const newDb = {...prevDb};
        
        // Update Order
        const orderToUpdate = (newDb.wholesaleOrders[businessId] || []).find(o => o.id === orderId);
        if (orderToUpdate) {
            const updatedLineItems = orderToUpdate.lineItems.map((li: WholesaleOrderLineItem) => {
                const shippedItem = shippedItems.find(si => si.productId === li.productId);
                return shippedItem ? { ...li, quantityShipped: (li.quantityShipped || 0) + shippedItem.quantityShipped } : li;
            });

            const isFullyShipped = updatedLineItems.every((li: WholesaleOrderLineItem) => (li.quantityShipped || 0) >= li.quantity);
            
            const updatedOrder: WholesaleOrder = {
                ...orderToUpdate,
                lineItems: updatedLineItems,
                status: isFullyShipped ? 'Completed' : 'Shipped' // Could also be 'Partially Shipped'
            };
            newDb.wholesaleOrders[businessId] = (newDb.wholesaleOrders[businessId] || []).map((o: WholesaleOrder) => o.id === orderId ? updatedOrder : o);
        }

        // Update Product Stock
        const businessProducts = newDb.products[businessId] || [];
        newDb.products[businessId] = businessProducts.map((prod: Product) => {
            const shippedItem = shippedItems.find(si => si.productId === prod.id);
            if (shippedItem) {
                const newStock = prod.stock - shippedItem.quantityShipped;
                return {
                    ...prod,
                    stock: newStock,
                    status: getStatusFromStock(newStock)
                };
            }
            return prod;
        });
        
        return newDb;
    });
    
    toast({ title: "Items Shipped", description: "Inventory has been updated and order status changed." });
  }, [toast]);

  const addDiscountCode = useCallback((businessId: string, data: DiscountCodeFormValues) => {
    const newDiscount: DiscountCode = {
        id: `DISC${Date.now()}`,
        code: data.code.toUpperCase(),
        ...data,
    };
    setDb(prevDb => ({
        ...prevDb,
        discounts: {
            ...prevDb.discounts,
            [businessId]: [...(prevDb.discounts[businessId] || []), newDiscount]
        }
    }));
    toast({ title: "Success", description: "Discount code added successfully." });
  }, [toast]);
  
  const updateDiscountCode = useCallback((businessId: string, updatedDiscount: DiscountCode) => {
    setDb(prevDb => ({
        ...prevDb,
        discounts: {
            ...prevDb.discounts,
            [businessId]: (prevDb.discounts[businessId] || []).map(d => d.id === updatedDiscount.id ? {...updatedDiscount, code: updatedDiscount.code.toUpperCase()} : d)
        }
    }));
    toast({ title: "Success", description: "Discount code updated successfully." });
  }, [toast]);
  
  const deleteDiscountCode = useCallback((businessId: string, discountId: string) => {
    const discountToDelete = (db.discounts[businessId] || []).find(d => d.id === discountId);
    setDb(prevDb => ({
        ...prevDb,
        discounts: {
            ...prevDb.discounts,
            [businessId]: (prevDb.discounts[businessId] || []).filter(d => d.id !== discountId)
        }
    }));
    if (discountToDelete) {
        toast({
            variant: "destructive",
            title: "Discount Deleted",
            description: `Code "${discountToDelete.code}" has been removed.`,
        });
    }
  }, [db.discounts, toast]);


  const value = useMemo(() => ({
    getProducts,
    getPurchaseOrders,
    getVendors,
    getStockAdjustments,
    getSales,
    getExpenses,
    getShifts,
    getWholesaleOrders,
    getDiscountCodes,
    getDiscountByCode,
    addProduct,
    updateProduct,
    deleteProduct,
    addPurchaseOrder,
    updatePurchaseOrder,
    issuePurchaseOrder,
    cancelPurchaseOrder,
    receiveStock,
    adjustStock,
    addSale,
    processRefund,
    addExpense,
    updateExpense,
    deleteExpense,
    markExpenseAsPaid,
    addShift,
    endShift,
    addVendor,
    updateVendor,
    deleteVendor,
    addWholesaleOrder,
    updateWholesaleOrder,
    confirmWholesaleOrder,
    markWholesaleOrderPaid,
    shipWholesaleOrder,
    cancelWholesaleOrder,
    addDiscountCode,
    updateDiscountCode,
    deleteDiscountCode,
  }), [
    db, // Add db to dependencies to reflect state changes
    getProducts, getPurchaseOrders, getVendors, getStockAdjustments, getSales, getExpenses, getShifts, getWholesaleOrders, getDiscountCodes, getDiscountByCode,
    addProduct, updateProduct, deleteProduct, addPurchaseOrder, updatePurchaseOrder, issuePurchaseOrder, cancelPurchaseOrder, receiveStock, adjustStock,
    addSale, processRefund, addExpense, updateExpense, deleteExpense, markExpenseAsPaid, addShift, endShift,
    addVendor, updateVendor, deleteVendor,
    addWholesaleOrder, updateWholesaleOrder, confirmWholesaleOrder, markWholesaleOrderPaid, shipWholesaleOrder, cancelWholesaleOrder,
    addDiscountCode, updateDiscountCode, deleteDiscountCode,
  ]);

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
