'use client';

import { useState, useMemo, useEffect } from 'react';
import type { CartItem, Product, Customer, Discount, HeldOrder, Shift, Sale } from '@/lib/types';
import ProductGrid from '@/components/pos/product-grid';
import Cart from '@/components/pos/cart';
import { products as allProducts, sales as mockSales } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive, LogOut } from 'lucide-react';
import ChargeDialog from '@/components/pos/charge-dialog';
import CustomerSearchDialog from '@/components/pos/customer-search-dialog';
import HeldOrdersDialog from '@/components/pos/held-orders-dialog';
import ShiftManagementDialog from '@/components/pos/shift-management-dialog';

export default function PosPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [isHeldOrdersOpen, setIsHeldOrdersOpen] = useState(false);

  // --- Shift Management State ---
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [salesThisShift, setSalesThisShift] = useState<Sale[]>([]);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(true);

  // Mock previous sales to show in shift summary
  useEffect(() => {
    if(currentShift) {
        setSalesThisShift(mockSales.slice(0, 2));
    }
  }, [currentShift]);


  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: quantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleClearSale = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(null);
  };

  const handleCharge = () => {
    if (cart.length > 0) {
      setIsChargeModalOpen(true);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerSearchOpen(false);
  };

  const handleApplyDiscount = (appliedDiscount: Discount) => {
    setDiscount(appliedDiscount);
  }
  
  const handleRemoveDiscount = () => {
      setDiscount(null);
  }

  const handleSaleComplete = (newSale: Sale) => {
    setSalesThisShift(prev => [...prev, newSale]);
    handleClearSale();
    setIsChargeModalOpen(false);
  }

  const { total } = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = (() => {
        if (!discount) return 0;
        if (discount.type === 'fixed') {
            return Math.min(discount.value, subtotal);
        }
        if (discount.type === 'percentage') {
            return subtotal * (discount.value / 100);
        }
        return 0;
    })();
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxRate = 0.1;
    const taxAmount = subtotalAfterDiscount * taxRate;
    const total = subtotalAfterDiscount + taxAmount;
    return { total };
  }, [cart, discount]);
  
  const handleHoldSale = () => {
    if (cart.length === 0) return;

    const newHeldOrder: HeldOrder = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      cart,
      customer: selectedCustomer,
      discount,
      total,
    };

    setHeldOrders(prev => [...prev, newHeldOrder]);
    handleClearSale();
  };

  const handleRetrieveOrder = (orderId: string) => {
    const orderToRetrieve = heldOrders.find(order => order.id === orderId);
    if (orderToRetrieve) {
      setCart(orderToRetrieve.cart);
      setSelectedCustomer(orderToRetrieve.customer);
      setDiscount(orderToRetrieve.discount);
      setHeldOrders(prev => prev.filter(order => order.id !== orderId));
      setIsHeldOrdersOpen(false);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setHeldOrders(prev => prev.filter(order => order.id !== orderId));
  };
  
  // --- Shift Management Handlers ---
  const handleStartShift = (startingFloat: number) => {
    const newShift: Shift = {
      id: `SHIFT-${Date.now()}`,
      employeeId: 'Admin User', // Hardcoded for now
      startTime: new Date().toISOString(),
      startingCashFloat: startingFloat,
      status: 'open',
    };
    setCurrentShift(newShift);
    setIsShiftDialogOpen(false);
  };

  const handleEndShift = (actualCash: number) => {
    if(currentShift) {
        const updatedShift = {
            ...currentShift,
            endTime: new Date().toISOString(),
            status: 'closed' as Shift['status'],
            actualCashTotal: actualCash,
        }
        // In a real app, you would save this to the database
        console.log("Shift Ended:", updatedShift);
        setCurrentShift(null);
        setSalesThisShift([]);
        setIsShiftDialogOpen(true);
    }
  };


  if (!currentShift) {
    return (
        <ShiftManagementDialog
            mode="start"
            onStartShift={handleStartShift}
            isOpen={isShiftDialogOpen}
            onOpenChange={setIsShiftDialogOpen}
        />
    )
  }


  return (
    <>
      <div className="h-[calc(100vh-4rem-1px)] -m-4 sm:-m-6 md:-m-8">
          <div className="grid grid-cols-12 gap-6 h-full p-6">
              <div className="col-span-12 lg:col-span-7 xl:col-span-8 h-full">
                  <Card className='h-full flex flex-col'>
                      <CardHeader className="flex-row items-center justify-between pb-4">
                        <CardTitle>Products</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setIsHeldOrdersOpen(true)}>
                              <Archive className="mr-2 h-4 w-4" />
                              View Held Sales ({heldOrders.length})
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setIsShiftDialogOpen(true)}>
                              <LogOut className="mr-2 h-4 w-4" />
                              End Shift
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className='p-4 pt-0 flex-1'>
                          <ProductGrid products={allProducts} onAddToCart={handleAddToCart} />
                      </CardContent>
                  </Card>
              </div>
              <div className="col-span-12 lg:col-span-5 xl:col-span-4 h-full">
                  <Cart 
                      cart={cart}
                      customer={selectedCustomer}
                      discount={discount}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveFromCart}
                      onClearCart={handleClearSale}
                      onCharge={handleCharge}
                      onSelectCustomerClick={() => setIsCustomerSearchOpen(true)}
                      onApplyDiscount={handleApplyDiscount}
                      onRemoveDiscount={handleRemoveDiscount}
                      onHoldSale={handleHoldSale}
                  />
              </div>
          </div>
      </div>
      <ChargeDialog
        isOpen={isChargeModalOpen}
        onOpenChange={setIsChargeModalOpen}
        cart={cart}
        customer={selectedCustomer}
        discount={discount}
        onSaleComplete={handleSaleComplete}
      />
      <CustomerSearchDialog
        isOpen={isCustomerSearchOpen}
        onOpenChange={setIsCustomerSearchOpen}
        onSelectCustomer={handleSelectCustomer}
      />
      <HeldOrdersDialog
        isOpen={isHeldOrdersOpen}
        onOpenChange={setIsHeldOrdersOpen}
        heldOrders={heldOrders}
        onRetrieveOrder={handleRetrieveOrder}
        onDeleteOrder={handleDeleteOrder}
      />
      {currentShift && (
        <ShiftManagementDialog
            mode="end"
            isOpen={isShiftDialogOpen}
            onOpenChange={setIsShiftDialogOpen}
            shift={currentShift}
            sales={salesThisShift}
            onEndShift={handleEndShift}
        />
      )}
    </>
  );
}
