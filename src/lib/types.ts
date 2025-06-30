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
