import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Percent, Plus,ShoppingCart, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { CustomerForm } from '@/components/customer-form';
import { DailyReport } from '@/components/daily-report';
import { MenuGrid } from '@/components/menu-grid';
import { OrderConfirmation } from '@/components/order-confirmation';
import { OrderSummary } from '@/components/order-summary';
import { PaymentForm } from '@/components/payment-form';
import { VariantSelector } from '@/components/variant-selector';
import type { Customer, MenuItem, Order, OrderItem, SelectedVariant } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Textarea } from '@headlessui/react';

type CashierStep = 'create-bill' | 'customer-info' | 'menu-selection' | 'payment' | 'confirmation' | 'daily-report';

export default function CashierInterface() {
    const {
        menuItems,
        categories = [],
        dailySales,
    } = usePage().props as unknown as {
        menuItems: MenuItem[];
        categories: { id: number; name: string; label?: string }[];
        dailySales: Order[];
    };
    const [currentStep, setCurrentStep] = useState<CashierStep>('create-bill');
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [salesMethod, setSalesMethod] = useState<'dine-in' | 'takeaway' | 'delivery-gojek' | 'delivery-grab' | 'delivery-shopee' | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [, setPaymentMethod] = useState<'cash' | 'card' | 'qris' | null>(null);
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const [showVariantSelector, setShowVariantSelector] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [notes, setNotes] = useState<string>('');

    const subtotal = orderItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    const discountAmount = subtotal * (discountPercentage / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.1;
    const total = discountedSubtotal + tax;

    const handleCreateBill = () => {
        setCurrentStep('customer-info');
    };

    const handleCustomerSubmit = (customerData: Customer, method: 'dine-in' | 'takeaway' | 'delivery-gojek' | 'delivery-grab' | 'delivery-shopee') => {
        setCustomer(customerData);
        setSalesMethod(method);
        setCurrentStep('menu-selection');
    };

    const handleAddItem = (item: MenuItem) => {
        if (item.variants && item.variants.length > 0) {
            setSelectedMenuItem(item);
            setShowVariantSelector(true);
        } else {
            // No variants, add directly
            addItemToOrder(item, [], item.basePrice);
        }
    };

    const addItemToOrder = (item: MenuItem, selectedVariants: SelectedVariant[], finalPrice: number) => {
        setOrderItems((prev) => {
            // Create a unique key for items with same menu item but different variants
            const itemKey = `${item.id}-${selectedVariants
                .map((v) => v.variantId)
                .sort()
                .join('-')}`;
            const existingItem = prev.find((orderItem) => {
                const existingKey = `${orderItem.menuItem.id}-${orderItem.selectedVariants
                    .map((v: { variantId: unknown }) => v.variantId)
                    .sort()
                    .join('-')}`;
                return existingKey === itemKey;
            });

            if (existingItem) {
                return prev.map((orderItem) => {
                    const existingKey = `${orderItem.menuItem.id}-${orderItem.selectedVariants
                        .map((v: { variantId: unknown }) => v.variantId)
                        .sort()
                        .join('-')}`;
                    return existingKey === itemKey ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem;
                });
            }

            return [
                ...prev,
                {
                    menuItem: item,
                    quantity: 1,
                    selectedVariants,
                    finalPrice,
                    uniqueId: itemKey,
                },
            ];
        });
        setShowVariantSelector(false);
        setSelectedMenuItem(null);
    };

    const handleRemoveItem = (item: MenuItem) => {
        setOrderItems((prev) => prev.filter((orderItem) => orderItem.menuItem.id !== item.id));
    };

    const handleQuantityChange = (item: MenuItem, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(item);
            return;
        }
        setOrderItems((prev) => prev.map((orderItem) => (orderItem.menuItem.id === item.id ? { ...orderItem, quantity } : orderItem)));
    };

    const handleRemoveOrderItem = (uniqueId: string) => {
        setOrderItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
    };

    const handleClearOrder = () => {
        setOrderItems([]);
    };

    const handleProceedToPayment = () => {
        if (orderItems.length > 0) {
            setCurrentStep('payment');
        }
    };

    const handleBackToMenu = () => {
        setCurrentStep('menu-selection');
    };

    const handleBackToCustomerInfo = () => {
        setCurrentStep('customer-info');
    };

    const handlePaymentComplete = (method: 'cash' | 'card' | 'qris', paidAmount?: number, orderId?: string) => {
        setPaymentMethod(method);
        setAmountPaid(paidAmount || total);

        const order: Order = {
            id: orderId,
            customerName: customer?.name || '',
            salesMethod: salesMethod || 'dine-in',
            items: orderItems,
            subtotal,
            discountPercentage,
            discountAmount,
            tax,
            total,
            paymentMethod: method,
            status: 'confirmed',
            createdAt: new Date(),
            notes: notes,
        };

        setCurrentOrder(order);
        setCurrentStep('confirmation');
    };

    const handleStartNewOrder = () => {
        setCurrentStep('create-bill');
        setCustomer(null);
        setSalesMethod(null);
        setOrderItems([]);
        setCurrentOrder(null);
        setPaymentMethod(null);
        setAmountPaid(0);
        setShowVariantSelector(false);
        setSelectedMenuItem(null);
        setDiscountPercentage(0);
    };

    const handlePrintReceipt = () => {
        // Simulate printing - in a real app, this would integrate with a receipt printer
        window.print();
    };

    const handleVariantConfirm = (item: MenuItem, selectedVariants: SelectedVariant[], finalPrice: number) => {
        addItemToOrder(item, selectedVariants, finalPrice);
    };

    const handleVariantCancel = () => {
        setShowVariantSelector(false);
        setSelectedMenuItem(null);
    };

    const handleViewDailyReport = () => {
        setCurrentStep('daily-report');
    };

    const handleBackFromReport = () => {
        setCurrentStep('create-bill');
    };

    const handleApplyDiscount = (percentage: number) => {
        setDiscountPercentage(percentage);
    };

    const handleRemoveDiscount = () => {
        setDiscountPercentage(0);
    };

    const renderStepIndicator = () => {
        const steps = [
            { id: 'create-bill', label: 'Create Bill' },
            { id: 'customer-info', label: 'Customer Info' },
            { id: 'menu-selection', label: 'Menu Selection' },
            { id: 'payment', label: 'Payment' },
            { id: 'confirmation', label: 'Confirmation' },
        ];

        const currentIndex = steps.findIndex((step) => step.id === currentStep);

        return (
            <div className="mb-6 flex items-center justify-center gap-2">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <Badge variant={index <= currentIndex ? 'default' : 'secondary'} className="px-3 py-1">
                            {index + 1}. {step.label}
                        </Badge>
                        {index < steps.length - 1 && <div className={`mx-2 h-px w-8 ${index < currentIndex ? 'bg-primary' : 'bg-border'}`} />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-background p-4">
            <Head title="Cashier" />
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6">{currentStep !== 'daily-report' && renderStepIndicator()}</div>

                {/* Create Bill Step */}
                {currentStep === 'create-bill' && (
                    <div className="flex justify-center">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle className="text-center">Welcome to Coffee Shop POS</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <p className="mb-6 text-muted-foreground">Ready to create a new order?</p>
                                <Button onClick={handleCreateBill} size="lg" className="w-full">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create New Bill
                                </Button>
                                <Button onClick={handleViewDailyReport} variant="outline" size="lg" className="w-full bg-transparent">
                                    <TrendingUp className="mr-2 h-5 w-5" />
                                    End Day Report
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Customer Info Step */}
                {currentStep === 'customer-info' && (
                    <div className="flex justify-center">
                        <CustomerForm onSubmit={handleCustomerSubmit} onCancel={handleStartNewOrder} />
                    </div>
                )}

                {/* Menu Selection Step */}
                {currentStep === 'menu-selection' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold">Select Menu Items</h2>
                                    <p className="text-muted-foreground">
                                        Customer: {customer?.name} • Method: {salesMethod}
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handleBackToCustomerInfo}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </div>
                            <MenuGrid
                                items={menuItems}
                                categories={categories}
                                orderItems={orderItems}
                                onAddItem={handleAddItem}
                                onRemoveItem={handleRemoveItem}
                                onQuantityChange={handleQuantityChange}
                            />
                        </div>
                        <div className="space-y-4">
                            <OrderSummary orderItems={orderItems} onRemoveItem={handleRemoveOrderItem} onClearOrder={handleClearOrder} />
                            {orderItems.length > 0 && (
                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Percent className="h-5 w-5" />
                                                Apply Discount
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-3 gap-2">
                                                <Button
                                                    variant={discountPercentage === 10 ? 'default' : 'outline'}
                                                    onClick={() => handleApplyDiscount(10)}
                                                    className="text-sm"
                                                >
                                                    10%
                                                </Button>
                                                <Button
                                                    variant={discountPercentage === 20 ? 'default' : 'outline'}
                                                    onClick={() => handleApplyDiscount(20)}
                                                    className="text-sm"
                                                >
                                                    20%
                                                </Button>
                                                <Button
                                                    variant={discountPercentage === 50 ? 'default' : 'outline'}
                                                    onClick={() => handleApplyDiscount(50)}
                                                    className="text-sm"
                                                >
                                                    50%
                                                </Button>
                                            </div>
                                            {discountPercentage > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-green-600">Discount ({discountPercentage}%):</span>
                                                        <span className="font-medium text-green-600">-Rp {discountAmount.toLocaleString()}</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={handleRemoveDiscount} className="w-full text-xs">
                                                        Remove Discount
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Notes</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Textarea
                                                className="w-full resize-none"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Add a notes to the order"
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                            {orderItems.length > 0 && (
                                <Button onClick={handleProceedToPayment} size="lg" className="w-full">
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Proceed to Payment
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Payment Step */}
                {currentStep === 'payment' && customer && salesMethod && (
                    <PaymentForm
                        orderItems={orderItems}
                        customerName={customer.name}
                        salesMethod={salesMethod}
                        subtotal={subtotal}
                        discountPercentage={discountPercentage}
                        discountAmount={discountAmount}
                        tax={tax}
                        total={total}
                        onBack={handleBackToMenu}
                        onPaymentComplete={handlePaymentComplete}
                        notes={notes}
                    />
                )}

                {currentStep === 'confirmation' && currentOrder && (
                    <OrderConfirmation
                        order={currentOrder}
                        amountPaid={amountPaid}
                        onNewOrder={handleStartNewOrder}
                        onPrintReceipt={handlePrintReceipt}
                    />
                )}

                {currentStep === 'daily-report' && <DailyReport dailyReports={dailySales} onBack={handleBackFromReport} />}

                {showVariantSelector && selectedMenuItem && (
                    <VariantSelector item={selectedMenuItem} onConfirm={handleVariantConfirm} onCancel={handleVariantCancel} />
                )}
            </div>
        </div>
    );
}
