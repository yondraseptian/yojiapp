"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import type { OrderItem } from "@/types"
import { formatCurrency } from "@/lib/data"
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react"

interface OrderSummaryProps {
  orderItems: OrderItem[]
  onRemoveItem: (itemId: string) => void
  onClearOrder: () => void
}

export function OrderSummary({ orderItems, onRemoveItem, onClearOrder }: OrderSummaryProps) {
  const subtotal = orderItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  if (orderItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Order</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No items in order</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Current Order</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearOrder}
          className="text-destructive hover:text-destructive bg-transparent"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          {orderItems.map((item) => (
            <div
              key={`${item.menuItem.id}-${item.selectedVariants.map((v: { variantId: unknown }) => v.variantId).join("-")}`}
              className="flex items-start justify-between"
            >
              <div className="flex-1">
                <p className="font-medium">{item.menuItem.name}</p>
                {item.selectedVariants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.selectedVariants.map((variant: { variantId: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<unknown>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<unknown>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => (
                      <Badge key={variant.variantId} variant="outline" className="text-xs">
                        {variant.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.finalPrice)} × {item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatCurrency(item.finalPrice * item.quantity)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.uniqueId)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (10%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
