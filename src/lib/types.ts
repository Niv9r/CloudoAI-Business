import { z } from 'zod';

export type Business = {
    id: string;
    name: string;
    legalName: string;
    address: string;
    phone: string;
    email: string;
    timezone: string;
};

export const productFormSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  stock: z.coerce.number().int({ message: 'Stock must be a whole number.' }).min(0, { message: 'Stock cannot be negative.' }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export type Product = ProductFormValues & {
    id: string;
    status: "In Stock" | "Out of Stock" | "Low Stock";
};

export type CartItem = Product & {
    quantity: number;
};

export type Customer = {
    id:string;
    type: 'individual' | 'company';
    firstName: string;
    lastName: string;
    companyName: string | null;
    email: string;
    phone: string;
    loyaltyPoints?: number;
};

export type Discount = {
    type: 'percentage' | 'fixed';
    value: number;
};

export type HeldOrder = {
  id: string;
  timestamp: string;
  cart: CartItem[];
  customer: Customer | null;
  discount: Discount | null;
  total: number;
};

export type SaleLineItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Sale = {
  id: string;
  timestamp: string;
  customer: string;
  employee: string;
  total: number;
  status: "Completed" | "Refunded" | "Partially Refunded";
  payment: "Card" | "Cash" | "Split";
  lineItems: SaleLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
};
