
'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        variant: 'destructive',
        title: 'Out of Stock',
        description: `${product.name} cannot be added to the cart as it is out of stock.`,
      });
      return;
    }
    onAddToCart(product);
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              onClick={() => handleProductClick(product)}
              className={cn(
                "cursor-pointer hover:border-primary transition-colors overflow-hidden relative",
                product.stock <= 0 && "cursor-not-allowed opacity-60 hover:border-muted-foreground"
              )}
            >
              {product.stock <= 0 && (
                <Badge variant="destructive" className="absolute top-2 right-2 z-10">Out of Stock</Badge>
              )}
               {product.stock > 0 && product.stock <= 25 && (
                <Badge variant="secondary" className="absolute top-2 right-2 z-10">Low Stock</Badge>
              )}
              <div className="relative w-full aspect-square">
                  <Image src="https://placehold.co/300x300.png" alt={product.name} layout='fill' objectFit='cover' data-ai-hint="product photo" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

    