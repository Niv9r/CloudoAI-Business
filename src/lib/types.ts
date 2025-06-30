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

export type Shift = {
    id: string;
    employeeId: string;
    startTime: string;
    endTime?: string;
    startingCashFloat: number;
    endingCashFloat?: number;
    actualCashTotal?: number;
    status: 'open' | 'closed' | 'reconciled';
};

export type Vendor = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export const expenseLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
});

export const expenseFormSchema = z.object({
  vendorId: z.string().min(1, 'Please select a vendor.'),
  invoiceNumber: z.string().optional(),
  issueDate: z.date({ required_error: 'Issue date is required.'}),
  dueDate: z.date({ required_error: 'Due date is required.'}),
  lineItems: z.array(expenseLineItemSchema).min(1, { message: 'At least one line item is required.'}),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export type ExpenseLineItem = {
  id: string;
  description: string;
  amount: number;
}

export type Expense = {
  id: string;
  vendorId: string;
  invoiceNumber?: string;
  issueDate: string; // ISO string
  dueDate: string; // ISO string
  lineItems: ExpenseLineItem[];
  total: number;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue';
  notes?: string;
};
