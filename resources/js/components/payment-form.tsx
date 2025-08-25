'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/data';
import type { OrderItem } from '@/types';
import { router } from '@inertiajs/react';
import { ArrowLeft, Banknote, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface PaymentFormProps {
    orderItems: OrderItem[];
    customerName: string;
    salesMethod: string;
    subtotal: number;
    discountPercentage?: number;
    discountAmount?: number;
    tax: number;
    total: number;
    onBack: () => void;
    onPaymentComplete: (paymentMethod: 'cash' | 'card' | 'qris', amountPaid?: number, orderId?: string) => void;
    notes?: string;
}

interface PaymentFormData {
    id: string;
    customerName: string;
    salesMethod: string;
    items: PaymentFormItem[];
    subtotal: number;
    discountPercentage: number;
    discountAmount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    status: 'pending' | 'completed';
    createdAt: Date;
    notes?: string;
}

type PaymentFormItem = {
    menuItemId: number;
    quantity: number;
    selectedVariants: { id: number; name: string; priceModifier: number }[];
    finalPrice: number;
};

export function PaymentForm({
    orderItems,
    customerName,
    salesMethod,
    subtotal,
    discountPercentage = 0,
    discountAmount = 0,
    tax,
    total,
    onBack,
    onPaymentComplete,
    notes,
}: PaymentFormProps) {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'qris' | null>(null);
    const [cashAmount, setCashAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const cashAmountNum = Number.parseFloat(cashAmount) || 0;
    const change = cashAmountNum - total;

    function generateTransactionId(): string {
        const now = new Date();

        const pad = (num: number, size: number) => num.toString().padStart(size, '0');

        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1, 2);
        const day = pad(now.getDate(), 2);
        const hours = pad(now.getHours(), 2);
        const minutes = pad(now.getMinutes(), 2);
        const seconds = pad(now.getSeconds(), 2);

        const milliseconds = pad(now.getMilliseconds(), 3);
        return `TRX-${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}`;
    }

    const handlePayment = () => {
        if (!selectedPaymentMethod) return;

        const paymentItems: PaymentFormItem[] = orderItems.map((item) => ({
            menuItemId: item.menuItem.id,
            menuItemName: item.menuItem.name,
            quantity: item.quantity,
            selectedVariants: item.selectedVariants.map(item => ({
                id: item.variantId,
                name: item.name,
                priceModifier: item.priceModifier,
            })),
            finalPrice: item.finalPrice,
        }));

        const formData: PaymentFormData = {
            id: generateTransactionId(),
            customerName,
            salesMethod,
            items: paymentItems,
            subtotal,
            discountPercentage,
            discountAmount,
            tax,
            total,
            paymentMethod: selectedPaymentMethod,
            status: 'completed',
            createdAt: new Date(),
            notes,
        };


        setIsProcessing(true);

        router.post(route('cashier.store'), {...formData}, {
            onSuccess: () => {
                setIsProcessing(false);
                onPaymentComplete(selectedPaymentMethod, selectedPaymentMethod === 'cash' ? cashAmountNum : total, formData.id);
            },
            onError: (errors) => {
                setIsProcessing(false);
                console.error('Payment failed.', errors);
            },
        });
    };

    const canProcessPayment = () => {
        if (!selectedPaymentMethod) return false;
        if (selectedPaymentMethod === 'cash') {
            return cashAmountNum >= total;
        }
        return true;
    };

    return (
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Order Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Customer: {customerName} • Method: {salesMethod}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="max-h-60 space-y-3 overflow-y-auto">
                        {orderItems.map((item) => {
                            const variantKey = item.selectedVariants.map((v: { name: string }) => v.name).join('-');
                            return (
                                <div key={`${item.menuItem.id}-${variantKey}`} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{item.menuItem.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(item.finalPrice)} × {item.quantity}
                                            {item.selectedVariants.length > 0 && (
                                                <span className="block text-xs">
                                                    {item.selectedVariants.map((v: { name: string }) => v.name).join(', ')}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="font-medium">{formatCurrency(item.finalPrice * item.quantity)}</span>
                                </div>
                            );
                        })}
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discountPercentage > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount ({discountPercentage}%):</span>
                                <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Tax (10%):</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-primary">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-1 gap-3">
                        <Button
                            variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                            className="h-16 justify-start"
                            onClick={() => setSelectedPaymentMethod('cash')}
                        >
                            <Banknote className="mr-3 h-6 w-6" />
                            <div className="text-left">
                                <div className="font-medium">Cash</div>
                                <div className="text-sm opacity-70">Pay with cash</div>
                            </div>
                        </Button>

                        <Button
                            variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                            className="h-16 justify-start"
                            onClick={() => setSelectedPaymentMethod('card')}
                        >
                            <CreditCard className="mr-3 h-6 w-6" />
                            <div className="text-left">
                                <div className="font-medium">Card</div>
                                <div className="text-sm opacity-70">Credit/Debit card</div>
                            </div>
                        </Button>

                        <Button
                            variant={selectedPaymentMethod === 'qris' ? 'default' : 'outline'}
                            className="h-16 justify-start"
                            onClick={() => setSelectedPaymentMethod('qris')}
                        >
                            <Smartphone className="mr-3 h-6 w-6" />
                            <div className="text-left">
                                <div className="font-medium">QRIS</div>
                                <div className="text-sm opacity-70">Pay with QRIS</div>
                            </div>
                        </Button>
                    </div>

                    {/* Cash Payment Details */}
                    {selectedPaymentMethod === 'cash' && (
                        <div className="space-y-4 rounded-lg bg-muted p-4">
                            <div className="space-y-2">
                                <Label htmlFor="cashAmount">Cash Amount</Label>
                                <Input
                                    id="cashAmount"
                                    type="number"
                                    placeholder="Enter cash amount"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                    min={total}
                                    step="1000"
                                />
                            </div>

                            {cashAmountNum > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total:</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Cash Received:</span>
                                        <span>{formatCurrency(cashAmountNum)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold">
                                        <span>Change:</span>
                                        <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(Math.max(0, change))}</span>
                                    </div>
                                    {change < 0 && (
                                        <Badge variant="destructive" className="w-full justify-center">
                                            Insufficient cash amount
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Card/Digital Wallet Processing */}
                    {(selectedPaymentMethod === 'card' || selectedPaymentMethod === 'qris') && (
                        <div className="rounded-lg bg-muted p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                {selectedPaymentMethod === 'card'
                                    ? 'Please insert or tap your card on the card reader'
                                    : 'Please scan the QR code or tap your phone'}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button onClick={handlePayment} disabled={!canProcessPayment() || isProcessing} className="flex-1">
                            {isProcessing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Process Payment
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
