
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

// --- Employee & Role Management ---

export const PERMISSIONS = [
    'access_settings',
    'view_reports',
    'manage_inventory',
    'manage_employees',
    'process_sales',
    'process_refunds',
    'manage_expenses',
    'manage_purchase_orders',
    'manage_wholesale_orders',
    'manage_discounts',
    'view_timesheets',
    'approve_timesheets',
    'view_payroll',
    'view_audit_log',
    'build_custom_reports',
    'manage_chart_of_accounts',
] as const;
export type Permission = typeof PERMISSIONS[number];

export const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters.'),
  permissions: z.set(z.enum(PERMISSIONS)),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate must be a positive number.').optional(),
  commissionRate: z.coerce.number().min(0).max(100, 'Commission must be between 0 and 100.').optional(),
});
export type RoleFormValues = z.infer<typeof roleFormSchema>;

export type Role = RoleFormValues & {
    id: string;
};

export const employeeFormSchema = z.object({
  name: z.string().min(2, 'Employee name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  pin: z.string().length(4, 'PIN must be exactly 4 digits.').regex(/^\d{4}$/, 'PIN must be numeric.'),
  roleId: z.string().min(1, 'A role must be selected.'),
});
export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export type Employee = EmployeeFormValues & {
    id: string;
};

// --- Product & Inventory ---

export const productFormSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters.' }),
  category: z.string().min(2, { message: 'Category is required.' }),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number.' }),
  cost: z.coerce.number().min(0, { message: 'Cost must be a positive number.' }).default(0),
  stock: z.coerce.number().int({ message: 'Stock must be a whole number.' }).min(0, { message: 'Stock cannot be negative.' }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export type Product = ProductFormValues & {
    id: string;
    status: "In Stock" | "Out of Stock" | "Low Stock";
};

// --- POS & Sales ---

export type CartItem = Product & {
    quantity: number;
};

export const discountCodeSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters.').regex(/^[A-Z0-9]+$/, 'Code can only contain uppercase letters and numbers.'),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0.01, 'Value must be greater than zero.'),
  isActive: z.boolean().default(true),
});
export type DiscountCodeFormValues = z.infer<typeof discountCodeSchema>;
export type DiscountCode = DiscountCodeFormValues & {
    id: string;
};

export type Discount = {
    code?: string;
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
  costAtTimeOfSale: number;
  subtotal: number;
  refundedQuantity?: number;
};

export type SalePayment = {
  method: 'Card' | 'Cash';
  amount: number;
};

export type Sale = {
  id: string;
  timestamp: string;
  customerId: string | null;
  customerName: string;
  employeeId: string;
  total: number;
  status: "Completed" | "Refunded" | "Partially Refunded";
  payments: SalePayment[];
  lineItems: SaleLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  refundedAmount?: number;
};

export type Shift = {
    id: string;
    employeeId: string;
    startTime: string;
    endTime?: string;
    startingCashFloat: number;
    endingCashFloat?: number;
    status: 'open' | 'reconciled' | 'pending_approval' | 'approved';
    notes?: string;
    cashSales?: number;
    cardSales?: number;
    totalSales?: number;
    discrepancy?: number;
    paidBreakMinutes?: number;
    unpaidBreakMinutes?: number;
};

// --- Customer Management ---

export const customerFormSchema = z.object({
    type: z.enum(['individual', 'company']),
    firstName: z.string().min(1, 'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
    companyName: z.string().optional().nullable(),
    email: z.string().email('Invalid email address.'),
    phone: z.string().min(1, 'Phone number is required.'),
    loyaltyPoints: z.coerce.number().int().optional(),
});
export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export type Customer = CustomerFormValues & {
    id:string;
};

// --- Vendor & Expenses ---

export type Vendor = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export const vendorFormSchema = z.object({
    name: z.string().min(2, { message: 'Vendor name must be at least 2 characters.' }),
    contactPerson: z.string().min(2, { message: 'Contact person name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});
export type VendorFormValues = z.infer<typeof vendorFormSchema>;


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
  status: 'Pending' | 'Paid' | 'Overdue';
  notes?: string;
};

// --- Purchasing ---

export const poLineItemSchema = z.object({
  productId: z.string().min(1, 'Product is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  unitCost: z.coerce.number().min(0, 'Cost must be a positive number.'),
});

export const purchaseOrderFormSchema = z.object({
  vendorId: z.string().min(1, 'Please select a vendor.'),
  issueDate: z.date({ required_error: 'Issue date is required.'}),
  expectedDate: z.date({ required_error: 'Expected date is required.'}),
  lineItems: z.array(poLineItemSchema).min(1, 'At least one line item is required.'),
  notes: z.string().optional(),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;

export type PurchaseOrderLineItem = {
    productId: string;
    quantity: number;
    unitCost: number;
    quantityReceived: number;
};

export type PurchaseOrder = {
    id: string;
    vendorId: string;
    issueDate: string; // ISO String
    expectedDate: string; // ISO String
    lineItems: PurchaseOrderLineItem[];
    total: number;
    status: 'Draft' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled';
    notes?: string;
};

// --- Stock Adjustments ---

export const stockAdjustmentTypes = ['Stock Count', 'Damage', 'Theft', 'Return', 'Promotion', 'Other'] as const;
const stockAdjustmentTypeEnum = z.enum(stockAdjustmentTypes);
export type StockAdjustmentType = z.infer<typeof stockAdjustmentTypeEnum>;


export const stockAdjustmentFormSchema = z.object({
  productId: z.string().min(1, 'Please select a product.'),
  type: stockAdjustmentTypeEnum,
  quantity: z.coerce.number().int('Quantity must be a whole number.').refine(val => val !== 0, 'Quantity cannot be zero.'),
  notes: z.string().min(3, 'A reason/note for the adjustment is required.'),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentFormSchema>;

export type StockAdjustment = {
    id: string;
    productId: string;
    timestamp: string; // ISO String
    type: StockAdjustmentType;
    quantity: number; // can be positive or negative
    notes: string;
    employeeId: string; // User who made the adjustment
};

// --- B2B/Wholesale ---

export const paymentTermsTypes = ['Due on receipt', 'Net 15', 'Net 30', 'Net 60'] as const;
const paymentTermsEnum = z.enum(paymentTermsTypes);
export type PaymentTerms = z.infer<typeof paymentTermsEnum>;

export const wholesaleOrderLineItemSchema = z.object({
  productId: z.string().min(1, 'Product is required.'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
  unitPrice: z.coerce.number().min(0, 'Price must be a positive number.'),
});

export const wholesaleOrderFormSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer.'),
  orderDate: z.date({ required_error: 'Order date is required.' }),
  paymentTerms: paymentTermsEnum,
  shippingAddress: z.string().min(10, 'Shipping address is required.'),
  shippingCost: z.coerce.number().min(0, 'Shipping cost must be a positive number.').default(0),
  lineItems: z.array(wholesaleOrderLineItemSchema).min(1, 'At least one line item is required.'),
  notes: z.string().optional(),
});
export type WholesaleOrderFormValues = z.infer<typeof wholesaleOrderFormSchema>;

export type WholesaleOrderLineItem = {
    productId: string;
    quantity: number;
    unitPrice: number;
    quantityShipped?: number;
};

export type WholesaleOrder = {
    id: string;
    customerId: string;
    orderDate: string; // ISO String
    paymentTerms: PaymentTerms;
    shippingAddress: string;
    shippingCost: number;
    lineItems: WholesaleOrderLineItem[];
    subtotal: number;
    total: number;
    status: 'Draft' | 'Awaiting Payment' | 'Awaiting Fulfillment' | 'Shipped' | 'Completed' | 'Cancelled';
    notes?: string;
};


// --- Audit & Professional Features ---

export type AuditLog = {
    id: string;
    timestamp: string; // ISO String
    employeeId: string;
    employeeName: string;
    action: string;
    details: string; 
};

// --- Timesheets & Payroll ---
export const shiftFormSchema = z.object({
    employeeId: z.string().min(1, 'Employee is required.'),
    startTime: z.string().min(1, 'Start time is required.'),
    endTime: z.string().min(1, 'End time is required.'),
    paidBreakMinutes: z.coerce.number().int().min(0).default(0),
    unpaidBreakMinutes: z.coerce.number().int().min(0).default(0),
    notes: z.string().min(1, 'Notes are required for manual entries.'),
});
export type ShiftFormValues = z.infer<typeof shiftFormSchema>;

export type PayrollData = {
    employeeId: string;
    employeeName: string;
    totalHours: number;
    hourlyRate: number;
    basePay: number;
    totalSales: number;
    commissionRate: number;
    commissionPay: number;
    totalPay: number;
}
export type PayrollRun = {
    id: string;
    periodStart: string; // ISO
    periodEnd: string; // ISO
    finalizedDate: string; // ISO
    payrollData: PayrollData[];
}

// --- Accounting & Financials ---
export const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'] as const;
export type AccountType = (typeof accountTypes)[number];

export const chartOfAccountFormSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required.'),
  accountName: z.string().min(2, 'Account name must be at least 2 characters.'),
  accountType: z.enum(accountTypes),
});
export type ChartOfAccountFormValues = z.infer<typeof chartOfAccountFormSchema>;

export type ChartOfAccount = ChartOfAccountFormValues & {
    id: string;
};

export type GeneralLedgerEntry = {
    id: string;
    date: string; // ISO String
    accountId: string;
    description: string;
    debit?: number;
    credit?: number;
};

// New Types for AI Features

export type WebsitePageComponent = {
    componentType: 'hero' | 'productList' | 'callToAction' | 'contentBlock';
    contentSnippet: string;
    linkedProductId?: string;
    linkedCategoryId?: string;
};

export type WebsiteStructure = {
    id: string; // pageId
    businessId: string;
    urlPath: string;
    pageTitle: string;
    contentSummary: string; // AI-generated summary
    keywords: string[]; // AI-extracted keywords
    lastUpdated: string; // ISO String
    pageType: 'productPage' | 'homepage' | 'blogPost' | 'categoryPage';
    components: WebsitePageComponent[];
};

export type BusinessKnowledgeBase = {
    id:string;
    businessId: string;
    documentType: 'policy' | 'faq' | 'guide' | 'note';
    title: string;
    content: string;
    embedding?: number[]; // Vector embedding for semantic search
};

    