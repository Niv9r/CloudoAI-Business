
import type { Product, Customer, Sale, Vendor, Expense, PurchaseOrder, StockAdjustment, Shift, WholesaleOrder, Role, Employee, Permission, DiscountCode } from './types';
import { PERMISSIONS } from './types';

const allPermissions = new Set(PERMISSIONS);
const managerPermissions = new Set<Permission>(['view_reports', 'manage_inventory', 'process_sales', 'process_refunds', 'manage_expenses', 'manage_discounts']);
const cashierPermissions = new Set<Permission>(['process_sales']);

export const mockRoles: Record<string, Role[]> = {
    biz_1: [
        { id: 'role_admin', name: 'Admin', permissions: allPermissions },
        { id: 'role_manager', name: 'Manager', permissions: managerPermissions },
        { id: 'role_cashier', name: 'Cashier', permissions: cashierPermissions },
    ],
    biz_2: [
        { id: 'role_admin_b2', name: 'Admin', permissions: allPermissions },
    ],
    biz_3: [
        { id: 'role_admin_b3', name: 'Admin', permissions: allPermissions },
    ]
}


type MockDb = {
  products: Record<string, Product[]>;
  customers: Record<string, Customer[]>;
  sales: Record<string, Sale[]>;
  vendors: Record<string, Vendor[]>;
  expenses: Record<string, Expense[]>;
  purchaseOrders: Record<string, PurchaseOrder[]>;
  stockAdjustments: Record<string, StockAdjustment[]>;
  shifts: Record<string, Shift[]>;
  wholesaleOrders: Record<string, WholesaleOrder[]>;
  employees: Record<string, Employee[]>;
  roles: Record<string, Role[]>;
  discounts: Record<string, DiscountCode[]>;
}

export const mockDb: MockDb = {
  products: {
    biz_1: [
      { id: "PROD001", name: "Artisan Coffee Beans", sku: "ACB-250G", category: "Coffee", stock: 120, price: 15.99, cost: 9.50, status: "In Stock" },
      { id: "PROD002", name: "Classic Leather Wallet", sku: "CLW-BLK-01", category: "Accessories", stock: 75, price: 49.99, cost: 22.50, status: "In Stock" },
      { id: "PROD003", name: "Silk Scarf", sku: "SS-RED-LG", category: "Apparel", stock: 0, price: 29.99, cost: 14.00, status: "Out of Stock" },
      { id: "PROD004", name: "Canvas Tote Bag", sku: "CTB-NAT-MD", category: "Bags", stock: 25, price: 24.99, cost: 11.00, status: "Low Stock" },
      { id: "PROD005", name: "Designer Sunglasses", sku: "DS-TOR-55", category: "Accessories", stock: 40, price: 149.99, cost: 65.00, status: "In Stock" },
    ],
    biz_2: [
      { id: "PROD101", name: "Espresso Machine", sku: "EM-PRO-S1", category: "Equipment", stock: 10, price: 799.99, cost: 450.00, status: "Low Stock" },
      { id: "PROD102", name: "Iced Latte", sku: "DR-LAT-IC", category: "Drinks", stock: 999, price: 5.50, cost: 1.20, status: "In Stock" },
      { id: "PROD103", name: "Croissant", sku: "PA-CRO-PL", category: "Pastries", stock: 30, price: 3.75, cost: 0.80, status: "In Stock" },
    ],
    biz_3: [
      { id: "PROD201", name: "Bestseller Novel", sku: "BK-FIC-POP", category: "Books", stock: 50, price: 18.99, cost: 8.50, status: "In Stock" },
      { id: "PROD202", name: "Reading Light", sku: "ACC-RL-CLIP", category: "Accessories", stock: 15, price: 12.50, cost: 4.00, status: "Low Stock" },
    ]
  },
  customers: {
    biz_1: [
      { id: "CUST001", type: "individual", firstName: "Alice", lastName: "Johnson", companyName: null, email: "alice.j@email.com", phone: "555-0101", loyaltyPoints: 150, },
      { id: "CUST002", type: "individual", firstName: "Bob", lastName: "Williams", companyName: null, email: "bob.w@email.com", phone: "555-0102", loyaltyPoints: 75, },
      { id: "CUST003", type: "company", firstName: "Corporate", lastName: "Client", companyName: "Innovate Inc.", email: "contact@innovate.com", phone: "555-0105", loyaltyPoints: 0, },
    ],
    biz_2: [
      { id: "CUST101", type: "company", firstName: "Charlie", lastName: "Brown", companyName: "Brown Enterprises", email: "charlie@brownenterprises.com", phone: "555-0103", },
    ],
    biz_3: [
      { id: "CUST201", type: "individual", firstName: "Diana", lastName: "Miller", companyName: null, email: "diana.m@email.com", phone: "555-0104", loyaltyPoints: 230, },
    ]
  },
  sales: {
    biz_1: [
      { id: "SALE-00123", timestamp: "2024-05-28T10:00:00Z", customerId: "CUST001", customerName: "Olivia Martin", employeeId: "emp_1", subtotal: 1749.85, tax: 174.99, discount: 0, total: 1924.84, status: "Completed", payment: "Card", lineItems: [{ productId: "PROD005", name: "Designer Sunglasses", quantity: 10, unitPrice: 149.99, costAtTimeOfSale: 65.00, subtotal: 1499.90 }, { productId: "PROD002", name: "Classic Leather Wallet", quantity: 5, unitPrice: 49.99, costAtTimeOfSale: 22.50, subtotal: 249.95 },], },
      { id: "SALE-00122", timestamp: "2024-05-28T14:30:00Z", customerId: "CUST002", customerName: "Jackson Lee", employeeId: "emp_2", subtotal: 37.49, tax: 3.75, discount: 0, total: 41.24, status: "Completed", payment: "Cash", lineItems: [{ productId: "PROD004", name: "Canvas Tote Bag", quantity: 1, unitPrice: 24.99, costAtTimeOfSale: 11.00, subtotal: 24.99 },], },
    ],
    biz_2: [
        { id: "SALE-10001", timestamp: "2024-05-29T12:00:00Z", customerId: null, customerName: "Guest", employeeId: "emp_b2_1", subtotal: 9.25, tax: 0.93, discount: 0, total: 10.18, status: "Completed", payment: "Card", lineItems: [{ productId: "PROD102", name: "Iced Latte", quantity: 1, unitPrice: 5.50, costAtTimeOfSale: 1.20, subtotal: 5.50}, { productId: "PROD103", name: "Croissant", quantity: 1, unitPrice: 3.75, costAtTimeOfSale: 0.80, subtotal: 3.75 }] }
    ],
    biz_3: []
  },
  vendors: {
    biz_1: [
      { id: 'VEND001', name: 'Leather Goods Supply', contactPerson: 'John Smith', email: 'sales@leather.com', phone: '555-0201' },
      { id: 'VEND002', name: 'Premium Fabrics Co.', contactPerson: 'Jane Doe', email: 'accounts@fabrics.com', phone: '555-0202' },
    ],
    biz_2: [
        { id: 'VEND101', name: 'Bean Roasters United', contactPerson: 'Sarah Jenkins', email: 'orders@beanroasters.com', phone: '555-0204' },
        { id: 'VEND102', name: 'Restaurant Equipment Inc', contactPerson: 'Tom Selleck', email: 'sales@restequip.com', phone: '555-0205' },
    ],
    biz_3: [
        { id: 'VEND201', name: 'Publishing House USA', contactPerson: 'Mark Twain', email: 'contact@pubhouse.com', phone: '555-0206' },
    ]
  },
  expenses: {
    biz_1: [
      { id: 'EXP001', vendorId: 'VEND001', invoiceNumber: 'INV-OS-5829', issueDate: '2024-05-15T00:00:00Z', dueDate: '2024-06-14T00:00:00Z', lineItems: [{ id: 'LI-1', description: 'Bulk Leather', amount: 2500.00 }], total: 2500.00, status: 'Paid', notes: 'Paid via CC on 2024-05-20' },
      { id: 'EXP002', vendorId: 'VEND002', invoiceNumber: 'INV-DS-1050', issueDate: '2024-04-20T00:00:00Z', dueDate: '2024-05-19T00:00:00Z', lineItems: [{ id: 'LI-3', description: 'Silk shipment', amount: 1500.00 }], total: 1500.00, status: 'Overdue', },
    ],
    biz_2: [],
    biz_3: []
  },
  purchaseOrders: {
    biz_1: [
        { id: 'PO-2024-001', vendorId: 'VEND001', issueDate: '2024-05-10T00:00:00.000Z', expectedDate: '2024-05-20T00:00:00.000Z', lineItems: [{ productId: 'PROD002', quantity: 50, unitCost: 22.50, quantityReceived: 50 }], total: 1125, status: 'Received', notes: 'Restock wallets' },
    ],
    biz_2: [],
    biz_3: []
  },
  stockAdjustments: {
    biz_1: [
      { id: 'ADJ-001', productId: 'PROD004', timestamp: '2024-05-29T09:00:00.000Z', type: 'Damage', quantity: -2, notes: 'Items found damaged in storage.', employeeId: 'emp_1' }
    ],
    biz_2: [],
    biz_3: []
  },
  shifts: {
    biz_1: [
      { id: 'SHIFT-2024-05-28', employeeId: 'emp_1', startTime: '2024-05-28T09:00:00Z', endTime: '2024-05-28T17:00:00Z', startingCashFloat: 150.00, endingCashFloat: 191.24, cashSales: 41.24, cardSales: 1749.85, totalSales: 1791.09, discrepancy: 0, status: 'reconciled' },
    ],
    biz_2: [
      { id: 'SHIFT-2024-05-29-B2', employeeId: 'emp_b2_1', startTime: '2024-05-29T08:00:00Z', endTime: '2024-05-29T16:00:00Z', startingCashFloat: 200.00, endingCashFloat: 200, cashSales: 0, cardSales: 10.18, totalSales: 10.18, discrepancy: 0, status: 'reconciled' },
    ],
    biz_3: []
  },
  wholesaleOrders: {
    biz_1: [
        { id: 'WO-2024-001', customerId: 'CUST003', orderDate: '2024-05-25T00:00:00Z', paymentTerms: 'Net 30', shippingAddress: '123 Innovation Dr, Tech City, USA', shippingCost: 50, subtotal: 900, total: 950, status: 'Awaiting Fulfillment', lineItems: [{ productId: 'PROD002', quantity: 20, unitPrice: 45.00, quantityShipped: 0 }], notes: 'Priority shipment requested' },
        { id: 'WO-2024-002', customerId: 'CUST003', orderDate: '2024-05-30T00:00:00Z', paymentTerms: 'Due on receipt', shippingAddress: '123 Innovation Dr, Tech City, USA', shippingCost: 20, subtotal: 300, total: 320, status: 'Draft', lineItems: [{ productId: 'PROD001', quantity: 20, unitPrice: 15.00, quantityShipped: 0 }], notes: '' },
    ],
    biz_2: [],
    biz_3: [],
  },
  roles: mockRoles,
  employees: {
      biz_1: [
        { id: 'emp_1', name: 'Admin User', email: 'admin@artisangoods.com', pin: '1234', roleId: 'role_admin' },
        { id: 'emp_2', name: 'John Manager', email: 'john@artisangoods.com', pin: '1111', roleId: 'role_manager' },
        { id: 'emp_3', name: 'Jane Cashier', email: 'jane@artisangoods.com', pin: '2222', roleId: 'role_cashier' },
      ],
      biz_2: [
        { id: 'emp_b2_1', name: 'Cafe Admin', email: 'admin@downtowncafe.com', pin: '0000', roleId: 'role_admin_b2' },
      ],
      biz_3: [
        { id: 'emp_b3_1', name: 'Book Nook Admin', email: 'admin@thebooknook.co.uk', pin: '9876', roleId: 'role_admin_b3' },
      ]
  },
  discounts: {
    biz_1: [
        { id: 'DISC001', code: 'SAVE15', type: 'percentage', value: 15, isActive: true },
        { id: 'DISC002', code: 'TENOFF', type: 'fixed', value: 10, isActive: true },
        { id: 'DISC003', code: 'SUMMERFUN', type: 'percentage', value: 20, isActive: false },
    ],
    biz_2: [],
    biz_3: []
  }
};

    