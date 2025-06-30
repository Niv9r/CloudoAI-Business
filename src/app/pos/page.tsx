'use client';

import { useState } from 'react';
import type { CartItem, Product } from '@/lib/types';
import ProductGrid from '@/components/pos/product-grid';
import Cart from '@/components/pos/cart';
import { products as allProducts } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import ChargeDialog from '@/components/pos/charge-dialog';

export default function PosPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);

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
      // Remove item if quantity is 0 or less
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

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCharge = () => {
    if (cart.length > 0) {
      setIsChargeModalOpen(true);
    }
  };

  return (
    <>
      <div className="h-[calc(100vh-4rem-1px)] -m-4 sm:-m-6 md:-m-8">
          <div className="grid grid-cols-12 gap-6 h-full p-6">
              <div className="col-span-12 lg:col-span-7 xl:col-span-8 h-full">
                  <Card className='h-full flex flex-col'>
                      <CardContent className='p-4 flex-1'>
                          <ProductGrid products={allProducts} onAddToCart={handleAddToCart} />
                      </CardContent>
                  </Card>
              </div>
              <div className="col-span-12 lg:col-span-5 xl:col-span-4 h-full">
                  <Cart 
                      cart={cart} 
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveFromCart}
                      onClearCart={handleClearCart}
                      onCharge={handleCharge}
                  />
              </div>
          </div>
      </div>
      <ChargeDialog
        isOpen={isChargeModalOpen}
        onOpenChange={setIsChargeModalOpen}
        cart={cart}
        onClearCart={handleClearCart}
      />
    </>
  );
}
