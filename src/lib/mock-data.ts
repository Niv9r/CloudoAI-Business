import type { Product, Customer, Sale, Vendor, Expense, PurchaseOrder, StockAdjustment } from './types';

export const products: Product[] = [
  {
    id: "PROD001",
    name: "Artisan Coffee Beans",
    sku: "ACB-250G",
    category: "Coffee",
    stock: 120,
    price: 15.99,
    status: "In Stock",
  },
  {
    id: "PROD002",
    name: "Classic Leather Wallet",
    sku: "CLW-BLK-01",
    category: "Accessories",
    stock: 75,
    price: 49.99,
    status: "In Stock",
  },
  {
    id: "PROD003",
    name: "Silk Scarf",
    sku: "SS-RED-LG",
    category: "Apparel",
    stock: 0,
    price: 29.99,
    status: "Out of Stock",
  },
  {
    id: "PROD004",
    name: "Canvas Tote Bag",
    sku: "CTB-NAT-MD",
    category: "Bags",
    stock: 25,
    price: 24.99,
    status: "Low Stock",
  },
  {
    id: "PROD005",
    name: "Designer Sunglasses",
    sku: "DS-TOR-55",
    category: "Accessories",
    stock: 40,
    price: 149.99,
    status: "In Stock",
  },
   {
    id: "PROD006",
    name: "Gourmet Chocolate Bar",
    sku: "GCB-DK-70",
    category: "Confectionery",
    stock: 200,
    price: 5.99,
    status: "In Stock",
  },
  {
    id: "PROD007",
    name: "Handcrafted Ceramic Mug",
    sku: "HCM-BLU-12",
    category: "Homeware",
    stock: 50,
    price: 19.99,
    status: "In Stock",
  },
  {
    id: "PROD008",
    name: "Organic Green Tea",
    sku: "OGT-CN-50",
    category: "Tea",
    stock: 80,
    price: 12.50,
    status: "In Stock",
  },
  {
    id: "PROD009",
    name: "Modern Desk Lamp",
    sku: "MDL-WHT-LED",
    category: "Lighting",
    stock: 15,
    price: 79.99,
    status: "Low Stock",
  },
  {
    id: "PROD010",
    name: "Wireless Bluetooth Speaker",
    sku: "WBS-GRY-V5",
    category: "Electronics",
    stock: 60,
    price: 89.99,
    status: "In Stock",
  },
];

export const customers: Customer[] = [
    {
        id: "CUST001",
        type: "individual",
        firstName: "Alice",
        lastName: "Johnson",
        companyName: null,
        email: "alice.j@email.com",
        phone: "555-0101",
        loyaltyPoints: 150,
    },
    {
        id: "CUST002",
        type: "individual",
        firstName: "Bob",
        lastName: "Williams",
        companyName: null,
        email: "bob.w@email.com",
        phone: "555-0102",
        loyaltyPoints: 75,
    },
    {
        id: "CUST003",
        type: "company",
        firstName: "Charlie",
        lastName: "Brown",
        companyName: "Brown Enterprises",
        email: "charlie@brownenterprises.com",
        phone: "555-0103",
    },
    {
        id: "CUST004",
        type: "individual",
        firstName: "Diana",
        lastName: "Miller",
        companyName: null,
        email: "diana.m@email.com",
        phone: "555-0104",
        loyaltyPoints: 230,
    },
    {
        id: "CUST005",
        type: "company",
        firstName: "Eva",
        lastName: "Green",
        companyName: "Green Goods Co.",
        email: "eva@greengoods.co",
        phone: "555-0105",
    },
];


export const sales: Sale[] = [
  {
    id: "SALE-00123",
    timestamp: "2024-05-28T10:00:00Z",
    customer: "Olivia Martin",
    employee: "Admin User",
    subtotal: 1749.85,
    tax: 174.99,
    discount: 0,
    total: 1924.84,
    status: "Completed",
    payment: "Card",
    lineItems: [
      { productId: "PROD005", name: "Designer Sunglasses", quantity: 10, unitPrice: 149.99, subtotal: 1499.90 },
      { productId: "PROD002", name: "Classic Leather Wallet", quantity: 5, unitPrice: 49.99, subtotal: 249.95 },
    ],
  },
  {
    id: "SALE-00122",
    timestamp: "2024-05-27T14:30:00Z",
    customer: "Jackson Lee",
    employee: "Admin User",
    subtotal: 37.49,
    tax: 3.75,
    discount: 0,
    total: 41.24,
    status: "Completed",
    payment: "Cash",
    lineItems: [
        { productId: "PROD004", name: "Canvas Tote Bag", quantity: 1, unitPrice: 24.99, subtotal: 24.99 },
        { productId: "PROD008", name: "Organic Green Tea", quantity: 1, unitPrice: 12.50, subtotal: 12.50 },
    ],
  },
  {
    id: "SALE-00121",
    timestamp: "2024-05-27T11:15:00Z",
    customer: "Isabella Nguyen",
    employee: "Admin User",
    subtotal: 269.97,
    tax: 27.00,
    discount: 0,
    total: 296.97,
    status: "Refunded",
    payment: "Card",
    lineItems: [
        { productId: "PROD010", name: "Wireless Bluetooth Speaker", quantity: 3, unitPrice: 89.99, subtotal: 269.97 }
    ],
  },
  {
    id: "SALE-00120",
    timestamp: "2024-05-26T18:45:00Z",
    customer: "William Kim",
    employee: "Admin User",
    subtotal: 99.98,
    tax: 10.00,
    discount: 0,
    total: 109.98,
    status: "Completed",
    payment: "Card",
    lineItems: [
        { productId: "PROD009", name: "Modern Desk Lamp", quantity: 1, unitPrice: 79.99, subtotal: 79.99 },
        { productId: "PROD007", name: "Handcrafted Ceramic Mug", quantity: 1, unitPrice: 19.99, subtotal: 19.99 },
    ],
  },
  {
    id: "SALE-00119",
    timestamp: "2024-05-26T09:05:00Z",
    customer: "Sofia Davis",
    employee: "Admin User",
    subtotal: 31.98,
    tax: 3.20,
    discount: 0,
    total: 35.18,
    status: "Partially Refunded",
    payment: "Split",
    lineItems: [
        { productId: "PROD001", name: "Artisan Coffee Beans", quantity: 2, unitPrice: 15.99, subtotal: 31.98 }
    ],
  },
];

export const vendors: Vendor[] = [
  { id: 'VEND001', name: 'Office Supplies Inc.', contactPerson: 'John Smith', email: 'sales@officesupplies.com', phone: '555-0201' },
  { id: 'VEND002', name: 'Digital Services LLC', contactPerson: 'Jane Doe', email: 'accounts@digitalservices.com', phone: '555-0202' },
  { id: 'VEND003', name: 'Creative Marketing Agency', contactPerson: 'Mike Ross', email: 'billing@creative.co', phone: '555-0203' },
  { id: 'VEND004', name: 'Bean Roasters United', contactPerson: 'Sarah Jenkins', email: 'orders@beanroasters.com', phone: '555-0204' },
];

export const expenses: Expense[] = [
    {
        id: 'EXP001',
        vendorId: 'VEND001',
        invoiceNumber: 'INV-OS-5829',
        issueDate: '2024-05-15T00:00:00Z',
        dueDate: '2024-06-14T00:00:00Z',
        lineItems: [
            { id: 'LI-1', description: 'Printer Paper (5 reams)', amount: 25.00 },
            { id: 'LI-2', description: 'Toner Cartridge', amount: 75.50 },
        ],
        total: 100.50,
        status: 'Paid',
        notes: 'Paid via CC on 2024-05-20'
    },
    {
        id: 'EXP002',
        vendorId: 'VEND002',
        invoiceNumber: 'INV-DS-1050',
        issueDate: '2024-05-20T00:00:00Z',
        dueDate: '2024-06-19T00:00:00Z',
        lineItems: [
            { id: 'LI-3', description: 'Monthly Cloud Hosting', amount: 50.00 },
            { id: 'LI-4', description: 'Domain Renewal (.com)', amount: 15.00 },
        ],
        total: 65.00,
        status: 'Pending',
    },
    {
        id: 'EXP003',
        vendorId: 'VEND003',
        invoiceNumber: 'INV-CM-042',
        issueDate: '2024-04-30T00:00:00Z',
        dueDate: '2024-05-30T00:00:00Z',
        lineItems: [
            { id: 'LI-5', description: 'Q2 Social Media Campaign', amount: 500.00 },
        ],
        total: 500.00,
        status: 'Overdue',
    },
    {
        id: 'EXP004',
        vendorId: 'VEND004',
        invoiceNumber: 'INV-BRU-9821',
        issueDate: '2024-05-25T00:00:00Z',
        dueDate: '2024-06-09T00:00:00Z',
        lineItems: [
            { id: 'LI-6', description: 'Specialty Coffee Beans (10kg)', amount: 250.00 },
        ],
        total: 250.00,
        status: 'Pending',
    },
];

export const purchaseOrders: PurchaseOrder[] = [
    {
        id: 'PO-2024-001',
        vendorId: 'VEND004',
        issueDate: '2024-05-10T00:00:00.000Z',
        expectedDate: '2024-05-20T00:00:00.000Z',
        lineItems: [
            { productId: 'PROD001', quantity: 50, unitCost: 9.50, quantityReceived: 50 },
            { productId: 'PROD008', quantity: 30, unitCost: 7.00, quantityReceived: 30 },
        ],
        total: 685.00,
        status: 'Received',
        notes: 'Annual restock of core coffee and tea products.'
    },
    {
        id: 'PO-2024-002',
        vendorId: 'VEND001',
        issueDate: '2024-05-22T00:00:00.000Z',
        expectedDate: '2024-06-01T00:00:00.000Z',
        lineItems: [
            { productId: 'PROD009', quantity: 10, unitCost: 55.00, quantityReceived: 5 },
        ],
        total: 550.00,
        status: 'Partially Received',
        notes: 'Backordered items. Second shipment expected next week.'
    },
    {
        id: 'PO-2024-003',
        vendorId: 'VEND002',
        issueDate: '2024-05-28T00:00:00.000Z',
        expectedDate: '2024-06-05T00:00:00.000Z',
        lineItems: [
            { productId: 'PROD010', quantity: 20, unitCost: 65.00, quantityReceived: 0 },
            { productId: 'PROD002', quantity: 25, unitCost: 30.00, quantityReceived: 0 },
        ],
        total: 2050.00,
        status: 'Ordered',
    },
    {
        id: 'PO-2024-004',
        vendorId: 'VEND003',
        issueDate: '2024-05-30T00:00:00.000Z',
        expectedDate: '2024-06-10T00:00:00.000Z',
        lineItems: [
            { productId: 'PROD004', quantity: 100, unitCost: 15.00, quantityReceived: 0 },
        ],
        total: 1500.00,
        status: 'Draft',
        notes: 'Awaiting final approval from management.'
    }
];

export const stockAdjustments: StockAdjustment[] = [
    {
        id: 'ADJ-001',
        productId: 'PROD004',
        timestamp: '2024-05-29T09:00:00.000Z',
        type: 'Damage',
        quantity: -2,
        notes: 'Items found damaged in storage.',
        employee: 'Admin User'
    },
    {
        id: 'ADJ-002',
        productId: 'PROD003',
        timestamp: '2024-05-28T14:00:00.000Z',
        type: 'Stock Count',
        quantity: 5,
        notes: 'Found extra units during weekly stock count.',
        employee: 'Admin User'
    }
];
