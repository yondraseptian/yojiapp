import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface MenuItem {
  base_price: number | undefined;
  basePrice: number;
  id: number
  name: string
  category_id: number
  category_name: string 
  description?: string
  available: boolean
  variants: MenuVariant[]
}

export interface MenuVariant {
  price: number;
  priceModifier: number;
  type: string;
  id: number 
  name: string
  additional_price: number
}

export interface SelectedVariant {
  priceModifier: number;
  name: string
  variantId: number 
}

export interface OrderItem {
  uniqueId: string
  selectedVariants: SelectedVariant[];
  menuItem: MenuItem
  quantity: number
  finalPrice: number
  notes?: string
}

type Order = {
  discountAmount: number;
  discountPercentage: number;
  id: string | undefined;
  customerName: string;
  salesMethod: "dine-in" | "takeaway" | "delivery-gojek" | "delivery-grab" | "delivery-shopee";
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: "pending" | "confirmed" | "completed" | "refunded"; // ✅ tambahkan
  createdAt: Date;
  notes: string;
};

export interface Customer {
  name: string
  phone?: string
  email?: string
}

export interface User {
  id: number
  username: string
  fullName: string
  email: string
  phone?: string
  role: "admin" | "manager" | "cashier"
  status: "active" | "inactive"
  permissions: Permission[]
  createdAt: Date
  lastLogin?: Date
}

export interface Permission {
  id: string
  name: string
  description: string
}

export interface Variant {
  id: number
  type: string
  name: string
  additional_price: number
}