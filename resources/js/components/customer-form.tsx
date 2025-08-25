"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, MapPin } from "lucide-react"
import type { Customer } from "@/types"

interface CustomerFormProps {
  onSubmit: (customer: Customer, salesMethod: "dine-in" | "takeaway" | "delivery-gojek" | "delivery-grab" | "delivery-shopee") => void
  onCancel: () => void
}

export function CustomerForm({ onSubmit, onCancel }: CustomerFormProps) {
  const [customerName, setCustomerName] = useState("")
  const [salesMethod, setSalesMethod] = useState<"dine-in" | "takeaway" | "delivery-gojek" | "delivery-grab" | "delivery-shopee" | "">("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customerName.trim() && salesMethod) {
      onSubmit({ name: customerName.trim() }, salesMethod as "dine-in" | "takeaway" | "delivery-gojek" | "delivery-grab" | "delivery-shopee")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salesMethod">Sales Method</Label>
            <Select value={salesMethod} onValueChange={setSalesMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select sales method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dine-in">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dine In
                  </div>
                </SelectItem>
                <SelectItem value="takeaway">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Takeaway
                  </div>
                </SelectItem>
                <SelectItem value="delivery-gojek">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Gojek
                  </div>
                </SelectItem>
                <SelectItem value="delivery-grab">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Grab
                  </div>
                </SelectItem>
                <SelectItem value="delivery-shopee">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Shopee
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!customerName.trim() || !salesMethod}>
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
