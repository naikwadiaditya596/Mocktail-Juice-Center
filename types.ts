export type UserRole = 'admin' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface MenuItem {
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  threshold: number;
}

export interface Promotion {
  id: number;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableItems: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface OrderItem extends MenuItem {
    quantity: number;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';

export interface Order {
    id: string;
    customerName: string;
    date: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    promotionApplied?: Promotion;
}
