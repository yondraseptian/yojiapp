'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/data';
import type { Order } from '@/types';
import { CheckCircle, Clock, CreditCard, MapPin, Plus, Printer, User } from 'lucide-react';

interface OrderConfirmationProps {
    order: Order;
    amountPaid: number;
    onNewOrder: () => void;
    onPrintReceipt?: () => void;
}

export function OrderConfirmation({ order, amountPaid, onNewOrder, onPrintReceipt }: OrderConfirmationProps) {
    const change = amountPaid - order.total;
    const currentTime = new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    const getPaymentMethodIcon = () => {
        switch (order.paymentMethod) {
            case 'cash':
                return '💵';
            case 'card':
                return '💳';
            case 'qris':
                return '📱';
            default:
                return '💰';
        }
    };

    const getPaymentMethodLabel = () => {
        switch (order.paymentMethod) {
            case 'cash':
                return 'Cash';
            case 'card':
                return 'Card';
            case 'qris':
                return 'QRIS';
            default:
                return 'Unknown';
        }
    };

    const getSalesMethodLabel = () => {
        switch (order.salesMethod) {
            case 'dine-in':
                return 'Dine In';
            case 'takeaway':
                return 'Takeaway';
            case 'delivery':
                return 'Delivery';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            <Card>
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-green-600">Order Confirmed!</CardTitle>
                    <p className="text-muted-foreground">Thank you for your order</p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Order Info */}
                    <div className="rounded-lg bg-muted p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                    {order.id}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{currentTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{order.customerName}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{getSalesMethodLabel()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="mb-3 font-semibold">Order Items</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => {
                                // Hitung harga item + semua variant
                                const itemPrice =
                                    item.menuItem.basePrice +
                                    item.selectedVariants.reduce((sum: number, v: { priceModifier: number }) => sum + v.priceModifier, 0);
                                const totalItemPrice = itemPrice * item.quantity;

                                // Gabungkan nama variant
                                const selectedVariantNames = item.selectedVariants.map((v: { name: string }) => v.name).join(', ');

                                return (
                                    <div
                                        key={item.menuItem.id + '-' + item.selectedVariants.map((v: { variantId: number }) => v.variantId).join('-')}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{item.menuItem.name}</p>

                                            {selectedVariantNames && <p className="text-sm text-muted-foreground">{selectedVariantNames}</p>}

                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(itemPrice)} × {item.quantity}
                                            </p>
                                            {item.notes && <p className="text-sm text-muted-foreground italic">Note: {item.notes}</p>}
                                        </div>
                                        <span className="font-medium">{formatCurrency(totalItemPrice)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Separator />

                    {/* Order Totals */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between">
                                <span>discount({order.discountPercentage}%):</span>
                                <span>- {formatCurrency(order.discountAmount)}</span>
                            </div>
                        ) }
                        <div className="flex justify-between">
                            <span>Tax (10%):</span>
                            <span>+ {formatCurrency(order.tax)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-primary">{formatCurrency(order.total)}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Payment Information */}
                    <div className="rounded-lg bg-muted p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold">
                            <CreditCard className="h-4 w-4" />
                            Payment Information
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Payment Method:</span>
                                <span className="flex items-center gap-2">
                                    {getPaymentMethodIcon()} {getPaymentMethodLabel()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Amount Paid:</span>
                                <span>{formatCurrency(amountPaid)}</span>
                            </div>
                            {order.paymentMethod === 'cash' && change > 0 && (
                                <div className="flex justify-between font-medium text-green-600">
                                    <span>Change:</span>
                                    <span>{formatCurrency(change)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <Badge variant="default" className="bg-green-600">
                                    {order.status === 'confirmed' ? 'Paid' : 'Pending'}
                                </Badge>
                            </div>
                            {order.notes &&
                            <div className="flex justify-between">
                                <span>Notes:</span>
                                <span>{order.notes}</span>
                            </div>
                            }
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        {onPrintReceipt && (
                            <Button variant="outline" onClick={onPrintReceipt} className="flex-1 bg-transparent">
                                <Printer className="mr-2 h-4 w-4" />
                                Print Receipt
                            </Button>
                        )}
                        <Button onClick={onNewOrder} size="lg" className="flex-1">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Bill
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-4 text-center text-sm text-muted-foreground">
                        <p>Thank you for visiting our coffee shop!</p>
                        <p>Have a great day!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
