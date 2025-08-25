export interface MenuItem {
  id: number // changed from string to number to match JSON format
  name: string
  category_name: string // changed from category to category_name to match JSON format
  basePrice: number // renamed from price to basePrice
  description?: string
  available: boolean
  variants: MenuVariant[] // made required instead of optional
}

export interface MenuVariant {
  id: number // changed from string to number to match JSON format
  size: string // simplified to just size, temperature, and price
  temperature: string
  price: number // direct price instead of priceModifier
}

export interface SelectedVariant {
  variantId: number // changed from string to number
  size: string // updated to match new variant structure
  temperature: string
  price: number
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
  selectedVariant: SelectedVariant // changed from array to single variant
  finalPrice: number
  notes?: string
}

export interface Order {
  id: string
  customerName: string
  salesMethod: "dine-in" | "takeaway" | "delivery"
  items: OrderItem[]
  subtotal: number
  discountPercentage?: number
  discountAmount?: number
  tax: number
  total: number
  paymentMethod?: "cash" | "card" | "digital-wallet"
  status: "pending" | "confirmed" | "completed"
  createdAt: Date
}

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
