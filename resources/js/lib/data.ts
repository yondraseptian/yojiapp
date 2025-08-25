import { MenuItem } from "@/types"

export const menuItems: MenuItem[] = [
  {
      id: 1,
      name: "Americano",
      category_name: "Coffee",
      variants: [
          { id: 1, size: "Small", temperature: "Hot", price: 15000 },
          { id: 2, size: "Large", temperature: "Hot", price: 20000 },
          { id: 3, size: "Small", temperature: "Iced", price: 18000 },
      ],
      basePrice: 0,
      available: false,
      category_id: 0
  },
  {
      id: 2,
      name: "Latte",
      category_name: "Coffee",
      variants: [
          { id: 4, size: "Regular", temperature: "Hot", price: 22000 },
          { id: 5, size: "Regular", temperature: "Iced", price: 24000 },
      ],
      basePrice: 0,
      available: false,
      category_id: 0
  },
  {
      id: 3,
      name: "Cappuccino",
      category_name: "Coffee",
      variants: [
          { id: 6, size: "Small", temperature: "Hot", price: 20000 },
          { id: 7, size: "Large", temperature: "Hot", price: 25000 },
          { id: 8, size: "Small", temperature: "Iced", price: 22000 },
          { id: 9, size: "Large", temperature: "Iced", price: 27000 },
      ],
      basePrice: 0,
      available: false,
      category_id: 0
  },
  {
      id: 4,
      name: "Espresso",
      category_name: "Coffee",
      variants: [
          { id: 10, size: "Single", temperature: "Hot", price: 12000 },
          { id: 11, size: "Double", temperature: "Hot", price: 18000 },
      ],
      basePrice: 0,
      available: false,
      category_id: 0
  },
  {
      id: 5,
      name: "Green Tea",
      category_name: "Tea",
      variants: [
          { id: 12, size: "Regular", temperature: "Hot", price: 15000 },
          { id: 13, size: "Regular", temperature: "Iced", price: 17000 },
      ],
      basePrice: 0,
      available: false,
      category_id: 0
  },
  {
      id: 6,
      name: "Croissant",
      category_name: "Pastry",
      variants: [{ id: 14, size: "Regular", temperature: "Room", price: 15000 }],
      basePrice: 0,
      available: false,
      category_id: 0
  },
  {
      id: 7,
      name: "Club Sandwich",
      category_name: "Sandwich",
      variants: [{ id: 15, size: "Regular", temperature: "Hot", price: 35000 }],
      basePrice: 0,
      available: false,
      category_id: 0
  },
]

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

