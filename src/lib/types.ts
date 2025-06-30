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
    id: string;
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
