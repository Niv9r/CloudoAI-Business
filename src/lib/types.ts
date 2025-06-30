export type Business = {
    id: string;
    name: string;
    legalName: string;
    address: string;
    phone: string;
    email: string;
    timezone: string;
};

export type Product = {
    id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    price: number;
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
