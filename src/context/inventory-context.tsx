
'use client';

import { createContext, useContext, useState, useMemo, type ReactNode, useCallback } from 'react';
import type { Product, ProductFormValues, PurchaseOrder, PurchaseOrderFormValues, Vendor, VendorFormValues, StockAdjustment, StockAdjustmentFormValues, Expense, ExpenseFormValues, Sale, Shift, SaleLineItem, WholesaleOrder, WholesaleOrderFormValues, WholesaleOrderLineItem, DiscountCode, DiscountCodeFormValues, GeneralLedgerEntry, ChartOfAccount, ChartOfAccountFormValues, ShiftFormValues, PayrollRun, PayrollData } from '@/lib/types';
import { mockDb } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAudit } from './audit-context';
import { useEmployee } from './employee-context';

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
  getGeneralLedger: (businessId: string) => GeneralLedgerEntry[];
  getChartOfAccounts: (businessId: string) => ChartOfAccount[];
  getPayrollRuns: (businessId: string) => PayrollRun[];
  getEmployees: (businessId: string) => Employee[]; // Re-exposing from employee context for internal use
  
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
  
  addChartOfAccount: (businessId: string, data: ChartOfAccountFormValues) => void;
  updateChartOfAccount: (businessId: string, account: ChartOfAccount) => void;
  deleteChartOfAccount: (businessId: string, accountId: string) => void;

  addManualShift: (businessId: string, data: ShiftFormValues) => void;
  approveShift: (businessId: string, shiftId: string) => void;
  finalizePayroll: (businessId: string, periodStart: Date, periodEnd: Date, payrollData: PayrollData[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { logAction } = useAudit();
  const { currentEmployee, getEmployees } = useEmployee();
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
  const getChartOfAccounts = useCallback((businessId: string) => db.chartOfAccounts[businessId] || [], [db.chartOfAccounts]);
  const getGeneralLedger = useCallback((businessId: string) => db.generalLedger[businessId] || [], [db.generalLedger]);
  const getPayrollRuns = useCallback((businessId: string) => db.payrollRuns[businessId] || [], [db.payrollRuns]);
  
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
    logAction(businessId, currentEmployee, 'product.create', `Created product: ${data.name}`);
    toast({ title: "Success", description: "Product added successfully." });
  }, [toast, logAction, currentEmployee]);

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
    logAction(businessId, currentEmployee, 'product.update', `Updated product: ${updatedProductData.name}`);
    toast({ title: "Success", description: "Product updated successfully." });
  }, [toast, logAction, currentEmployee]);

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
        logAction(businessId, currentEmployee, 'product.delete', `Deleted product: ${productToDelete.name}`);
        toast({
            variant: "destructive",
            title: "Product Deleted",
            description: `"${productToDelete.name}" has been removed from inventory.`,
        });
    }
  }, [db.products, toast, logAction, currentEmployee]);
  
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
    logAction(businessId, currentEmployee, 'po.create', `Created draft PO for $${total.toFixed(2)}`);
    toast({ title: "Success", description: "Draft Purchase Order created." });
  }, [toast, logAction, currentEmployee]);

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
    logAction(businessId, currentEmployee, 'po.issue', `Issued PO: ${poId}`);
    toast({ title: "Purchase Order Issued", description: `PO ${poId} has been marked as Ordered.` });
  }, [toast, logAction, currentEmployee]);

  const cancelPurchaseOrder = useCallback((businessId: string, poId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        purchaseOrders: {
            ...prevDb.purchaseOrders,
            [businessId]: (prevDb.purchaseOrders[businessId] || []).map(po => po.id === poId ? { ...po, status: 'Cancelled' } : po)
        }
    }));
    logAction(businessId, currentEmployee, 'po.cancel', `Cancelled PO: ${poId}`);
    toast({ variant: 'destructive', title: "Purchase Order Cancelled", description: `PO ${poId} has been cancelled.` });
  }, [toast, logAction, currentEmployee]);
  
  const receiveStock = useCallback((businessId: string, poId: string, receivedItems: { productId: string, quantityReceived: number }[]) => {
    setDb(prevDb => {
        const newDb = {...prevDb};
        
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
    
    logAction(businessId, currentEmployee, 'po.receive', `Received stock for PO: ${poId}`);
    toast({ title: "Stock Updated", description: "Inventory has been updated with received items." });
  }, [toast, logAction, currentEmployee]);

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

    logAction(businessId, currentEmployee, 'stock.adjust', `Adjusted stock for ${productToUpdate.name} by ${data.quantity}`);
    toast({
        title: "Stock Adjusted",
        description: `Stock for ${productToUpdate.name} changed by ${data.quantity}. New total: ${newStock}.`
    });
  }, [db.products, toast, logAction, currentEmployee]);

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
    logAction(businessId, currentEmployee, 'sale.process', `Processed sale for $${newSale.total.toFixed(2)}`);
    return newSale;
  }, [logAction, currentEmployee]);

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
        
        logAction(businessId, currentEmployee, 'sale.refund', `Processed refund of $${totalRefundAmount.toFixed(2)} for sale ${saleId}`);
        return newDb;
    });

    toast({ title: "Refund Processed", description: `The refund has been successfully processed${restockItems ? ' and inventory has been updated' : ''}.` });
  }, [toast, logAction, currentEmployee]);

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
    logAction(businessId, currentEmployee, 'expense.create', `Created expense for $${total.toFixed(2)}`);
    toast({ title: "Success", description: "Expense added successfully." });
  }, [toast, logAction, currentEmployee]);

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
    logAction(businessId, currentEmployee, 'expense.update', `Updated expense ${updatedExpenseData.id}`);
    toast({ title: "Success", description: "Expense updated successfully." });
  }, [toast, logAction, currentEmployee]);

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
        logAction(businessId, currentEmployee, 'expense.delete', `Deleted expense ${expenseId} for $${expenseToDelete.total.toFixed(2)}`);
        toast({
            variant: "destructive",
            title: "Expense Deleted",
            description: `Expense record has been removed.`,
        });
    }
  }, [db.expenses, toast, logAction, currentEmployee]);

  const markExpenseAsPaid = useCallback((businessId: string, expenseId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        expenses: {
            ...prevDb.expenses,
            [businessId]: (prevDb.expenses[businessId] || []).map(e => e.id === expenseId ? { ...e, status: 'Paid' } : e)
        }
    }));
    logAction(businessId, currentEmployee, 'expense.paid', `Marked expense ${expenseId} as paid`);
    toast({ title: "Status Updated", description: "Expense marked as paid." });
  }, [toast, logAction, currentEmployee]);
  
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

        const cashSales = salesThisShift.flatMap(s => s.payments).reduce((acc, p) => p.method === 'Cash' ? acc + p.amount : acc, 0);
        const cardSales = salesThisShift.flatMap(s => s.payments).reduce((acc, p) => p.method === 'Card' ? acc + p.amount : acc, 0);
        const totalSales = cashSales + cardSales;
        const expectedDrawer = shiftToUpdate.startingCashFloat + cashSales;
        const discrepancy = actualCash - expectedDrawer;

        const updatedShift: Shift = {
            ...shiftToUpdate,
            endTime: new Date().toISOString(),
            status: 'pending_approval',
            endingCashFloat: actualCash,
            cashSales,
            cardSales,
            totalSales,
            discrepancy,
            notes,
        };
        
        const updatedShifts = businessShifts.map(s => s.id === shiftId ? updatedShift : s);
        logAction(businessId, currentEmployee, 'shift.end', `Ended shift ${shiftId} with discrepancy $${discrepancy.toFixed(2)}`);
        return { ...prevDb, shifts: { ...prevDb.shifts, [businessId]: updatedShifts }};
    });
  }, [logAction, currentEmployee]);

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
    logAction(businessId, currentEmployee, 'vendor.create', `Created vendor: ${data.name}`);
    toast({ title: "Success", description: "Vendor added successfully." });
  }, [toast, logAction, currentEmployee]);

  const updateVendor = useCallback((businessId: string, updatedVendor: Vendor) => {
      setDb(prevDb => ({
          ...prevDb,
          vendors: {
              ...prevDb.vendors,
              [businessId]: (prevDb.vendors[businessId] || []).map(v => v.id === updatedVendor.id ? updatedVendor : v)
          }
      }));
      logAction(businessId, currentEmployee, 'vendor.update', `Updated vendor: ${updatedVendor.name}`);
      toast({ title: "Success", description: "Vendor updated successfully." });
  }, [toast, logAction, currentEmployee]);

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
          logAction(businessId, currentEmployee, 'vendor.delete', `Deleted vendor: ${vendorToDelete.name}`);
          toast({
              variant: "destructive",
              title: "Vendor Deleted",
              description: `"${vendorToDelete.name}" has been removed.`,
          });
      }
  }, [db.vendors, toast, logAction, currentEmployee]);
  
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
    logAction(businessId, currentEmployee, 'wholesale.create', `Created draft WO-${newOrder.id} for $${total.toFixed(2)}`);
    toast({ title: "Success", description: "Draft Wholesale Order created." });
  }, [toast, logAction, currentEmployee]);

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
    logAction(businessId, currentEmployee, 'wholesale.confirm', `Confirmed order ${orderId}`);
    toast({ title: "Order Confirmed", description: `Order ${orderId} is now awaiting payment.` });
  }, [toast, logAction, currentEmployee]);

  const markWholesaleOrderPaid = useCallback((businessId: string, orderId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        wholesaleOrders: {
            ...prevDb.wholesaleOrders,
            [businessId]: (prevDb.wholesaleOrders[businessId] || []).map(o => o.id === orderId ? { ...o, status: 'Awaiting Fulfillment' } : o)
        }
    }));
    logAction(businessId, currentEmployee, 'wholesale.paid', `Marked order ${orderId} as paid`);
    toast({ title: "Payment Received", description: `Order ${orderId} is now awaiting fulfillment.` });
  }, [toast, logAction, currentEmployee]);

  const cancelWholesaleOrder = useCallback((businessId: string, orderId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        wholesaleOrders: {
            ...prevDb.wholesaleOrders,
            [businessId]: (prevDb.wholesaleOrders[businessId] || []).map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o)
        }
    }));
    logAction(businessId, currentEmployee, 'wholesale.cancel', `Cancelled order ${orderId}`);
    toast({ variant: 'destructive', title: "Order Cancelled", description: `Wholesale Order ${orderId} has been cancelled.` });
  }, [toast, logAction, currentEmployee]);

  const shipWholesaleOrder = useCallback((businessId: string, orderId: string, shippedItems: { productId: string; quantityShipped: number }[]) => {
    setDb(prevDb => {
        const newDb = {...prevDb};
        
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
                status: isFullyShipped ? 'Completed' : 'Shipped'
            };
            newDb.wholesaleOrders[businessId] = (newDb.wholesaleOrders[businessId] || []).map((o: WholesaleOrder) => o.id === orderId ? updatedOrder : o);
        }

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
        
        logAction(businessId, currentEmployee, 'wholesale.ship', `Shipped items for order ${orderId}`);
        return newDb;
    });
    
    toast({ title: "Items Shipped", description: "Inventory has been updated and order status changed." });
  }, [toast, logAction, currentEmployee]);

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
    logAction(businessId, currentEmployee, 'discount.create', `Created discount code: ${data.code}`);
    toast({ title: "Success", description: "Discount code added successfully." });
  }, [toast, logAction, currentEmployee]);
  
  const updateDiscountCode = useCallback((businessId: string, updatedDiscount: DiscountCode) => {
    setDb(prevDb => ({
        ...prevDb,
        discounts: {
            ...prevDb.discounts,
            [businessId]: (prevDb.discounts[businessId] || []).map(d => d.id === updatedDiscount.id ? {...updatedDiscount, code: updatedDiscount.code.toUpperCase()} : d)
        }
    }));
    logAction(businessId, currentEmployee, 'discount.update', `Updated discount code: ${updatedDiscount.code}`);
    toast({ title: "Success", description: "Discount code updated successfully." });
  }, [toast, logAction, currentEmployee]);
  
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
        logAction(businessId, currentEmployee, 'discount.delete', `Deleted discount code: ${discountToDelete.code}`);
        toast({
            variant: "destructive",
            title: "Discount Deleted",
            description: `Code "${discountToDelete.code}" has been removed.`,
        });
    }
  }, [db.discounts, toast, logAction, currentEmployee]);

  // Chart of Accounts
  const addChartOfAccount = useCallback((businessId: string, data: ChartOfAccountFormValues) => {
    const newAccount: ChartOfAccount = {
      id: `acct_${Date.now()}`,
      ...data,
    };
    setDb(prevDb => ({
      ...prevDb,
      chartOfAccounts: {
        ...prevDb.chartOfAccounts,
        [businessId]: [...(prevDb.chartOfAccounts[businessId] || []), newAccount],
      },
    }));
    logAction(businessId, currentEmployee, 'account.create', `Created account: ${data.accountName}`);
    toast({ title: 'Success', description: 'Account added successfully.' });
  }, [toast, logAction, currentEmployee]);

  const updateChartOfAccount = useCallback((businessId: string, updatedAccount: ChartOfAccount) => {
    setDb(prevDb => ({
      ...prevDb,
      chartOfAccounts: {
        ...prevDb.chartOfAccounts,
        [businessId]: (prevDb.chartOfAccounts[businessId] || []).map(a => a.id === updatedAccount.id ? updatedAccount : a),
      },
    }));
    logAction(businessId, currentEmployee, 'account.update', `Updated account: ${updatedAccount.accountName}`);
    toast({ title: 'Success', description: 'Account updated successfully.' });
  }, [toast, logAction, currentEmployee]);

  const deleteChartOfAccount = useCallback((businessId: string, accountId: string) => {
    const accountToDelete = (db.chartOfAccounts[businessId] || []).find(a => a.id === accountId);
    setDb(prevDb => ({
      ...prevDb,
      chartOfAccounts: {
        ...prevDb.chartOfAccounts,
        [businessId]: (prevDb.chartOfAccounts[businessId] || []).filter(a => a.id !== accountId),
      },
    }));
    if (accountToDelete) {
      logAction(businessId, currentEmployee, 'account.delete', `Deleted account: ${accountToDelete.accountName}`);
      toast({
        variant: 'destructive',
        title: 'Account Deleted',
        description: `"${accountToDelete.accountName}" has been removed.`,
      });
    }
  }, [db.chartOfAccounts, toast, logAction, currentEmployee]);

  // Timesheets & Payroll
  const addManualShift = useCallback((businessId: string, data: ShiftFormValues) => {
    const newShift: Shift = {
        id: `SHIFT-MANUAL-${Date.now()}`,
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        startingCashFloat: 0,
        status: 'pending_approval',
    };
    setDb(prevDb => ({
        ...prevDb,
        shifts: {
            ...prevDb.shifts,
            [businessId]: [newShift, ...(prevDb.shifts[businessId] || [])],
        },
    }));
    logAction(businessId, currentEmployee, 'shift.manual_create', `Manually created shift for employee ${data.employeeId}`);
    toast({ title: 'Success', description: 'Manual shift entry added for approval.' });
  }, [toast, logAction, currentEmployee]);
  
  const approveShift = useCallback((businessId: string, shiftId: string) => {
    setDb(prevDb => ({
        ...prevDb,
        shifts: {
            ...prevDb.shifts,
            [businessId]: (prevDb.shifts[businessId] || []).map(s => s.id === shiftId ? { ...s, status: 'approved' } : s),
        },
    }));
    logAction(businessId, currentEmployee, 'shift.approve', `Approved shift ${shiftId}`);
  }, [logAction, currentEmployee]);

  const finalizePayroll = useCallback((businessId: string, periodStart: Date, periodEnd: Date, payrollData: PayrollData[]) => {
    const newPayrollRun: PayrollRun = {
        id: `PAYROLL-${Date.now()}`,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        finalizedDate: new Date().toISOString(),
        payrollData,
    };
    setDb(prevDb => ({
        ...prevDb,
        payrollRuns: {
            ...prevDb.payrollRuns,
            [businessId]: [newPayrollRun, ...(prevDb.payrollRuns[businessId] || [])],
        },
    }));
    logAction(businessId, currentEmployee, 'payroll.finalize', `Finalized payroll for period ${format(periodStart, 'P')} - ${format(periodEnd, 'P')}`);
    toast({ title: "Payroll Finalized", description: "The payroll run has been recorded." });
  }, [toast, logAction, currentEmployee]);


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
    getGeneralLedger,
    getChartOfAccounts,
    getPayrollRuns,
    getEmployees,
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
    addChartOfAccount,
    updateChartOfAccount,
    deleteChartOfAccount,
    addManualShift,
    approveShift,
    finalizePayroll
  }), [
    db, 
    getProducts, getPurchaseOrders, getVendors, getStockAdjustments, getSales, getExpenses, getShifts, getWholesaleOrders, getDiscountCodes, getDiscountByCode, getGeneralLedger, getChartOfAccounts, getPayrollRuns, getEmployees,
    addProduct, updateProduct, deleteProduct, addPurchaseOrder, updatePurchaseOrder, issuePurchaseOrder, cancelPurchaseOrder, receiveStock, adjustStock,
    addSale, processRefund, addExpense, updateExpense, deleteExpense, markExpenseAsPaid, addShift, endShift,
    addVendor, updateVendor, deleteVendor,
    addWholesaleOrder, updateWholesaleOrder, confirmWholesaleOrder, markWholesaleOrderPaid, shipWholesaleOrder, cancelWholesaleOrder,
    addDiscountCode, updateDiscountCode, deleteDiscountCode,
    addChartOfAccount, updateChartOfAccount, deleteChartOfAccount,
    addManualShift, approveShift, finalizePayroll
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
