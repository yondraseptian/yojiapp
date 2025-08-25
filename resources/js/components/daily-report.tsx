'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/data';
import type { Order } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Banknote,
    Calendar,
    Clock,
    CreditCard,
    DollarSign,
    Power,
    ShoppingBag,
    Smartphone,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface DailyReportProps {
    dailyReports: Order[];
    onBack: () => void;
}
export function DailyReport({ onBack, dailyReports }: DailyReportProps) {
    const { flash } = usePage().props as unknown as { flash: { error?: string; success?: string } };
    const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailySales, setDailySales] = useState<Order[]>(dailyReports);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [isClosingDay, setIsClosingDay] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    // Convert createdAt -> Date
    const orders = useMemo(() => dailySales.map((o) => ({ ...o, createdAt: new Date(o.createdAt) })), [dailySales]);

    const totalOrders = orders.length;
    const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + Number(o.total || 0), 0), [orders]);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const paymentBreakdown = orders.reduce(
        (acc, order) => {
            if (!acc[order.paymentMethod]) {
                acc[order.paymentMethod] = {
                    count: 0,
                    revenue: 0,
                    orders: [],
                };
            }

            acc[order.paymentMethod].count += 1;
            acc[order.paymentMethod].revenue += Number(order.total) || 0;
            acc[order.paymentMethod].orders.push(order);

            return acc;
        },
        {} as Record<string, { count: number; revenue: number; orders: Order[] }>,
    );

    const salesMethodBreakdown = orders.reduce(
        (acc, order) => {
            acc[order.salesMethod] = (acc[order.salesMethod] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const itemSales = orders.flatMap((order) =>
        order.items.map((item) => ({
            name: item.menuItem.name,
            quantity: item.quantity,
            revenue: item.finalPrice * item.quantity,
        })),
    );

    const popularItems = itemSales
        .reduce(
            (acc, item) => {
                const existing = acc.find((i) => i.name === item.name);
                if (existing) {
                    existing.quantity += item.quantity;
                    existing.revenue += item.revenue;
                } else {
                    acc.push({ name: item.name, quantity: item.quantity, revenue: item.revenue });
                }
                return acc;
            },
            [] as Array<{ name: string; quantity: number; revenue: number }>,
        )
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const hourlySales = orders.reduce(
        (acc, order) => {
            const hour = new Date(order.createdAt).getHours(); // pastikan Date valid
            const total = Number(order.total) || 0; // cast ke number aman

            acc[hour] = (acc[hour] || 0) + total;
            return acc;
        },
        {} as Record<number, number>,
    );

    const handleCloseDay = async () => {
        setIsClosingDay(true);

        router.post(
            '/closings/close-day',
            {},
            {
                onSuccess: () => {
                    // kalau sukses dari backend
                    setDailySales([]);
                    setShowCloseDialog(false);

                    // kalau sukses dari frontend
                    setShowSuccessDialog(true);
                },
                onError: () => {
                    setShowErrorDialog(true);
                    console.error('Closing gagal.');
                },
                onFinish: () => {
                    setIsClosingDay(false);
                },
            },
        );
    };

    const handleBack = () => {
        setShowErrorDialog(false);
        setShowSuccessDialog(false);
        onBack(); // kembali ke kasir
    };

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'cash':
                return <Banknote className="h-4 w-4" />;
            case 'card':
                return <CreditCard className="h-4 w-4" />;
            case 'qris':
                return <Smartphone className="h-4 w-4" />;
            default:
                return <DollarSign className="h-4 w-4" />;
        }
    };
    useEffect(() => {
        if (flash?.error) {
            setShowErrorDialog(true);
        }
    }, [flash?.error]);

    if (orders.length === 0) {
        return (
            <div className="space-y-6">
                {flash.error && (
                    <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Error
                                </DialogTitle>
                                <DialogDescription>
                                    <p>{flash.error}</p>
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowErrorDialog(false)} disabled={isClosingDay}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleCloseDay}
                                    disabled={isClosingDay}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {isClosingDay ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                            Closing Day...
                                        </>
                                    ) : (
                                        <>
                                            <Power className="mr-2 h-4 w-4" />
                                            Close Day
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">Daily Sales Report</h2>
                        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Day Closed - Ready for New Day
                        </p>
                    </div>
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cashier
                    </Button>
                </div>

                <Card className="py-12 text-center">
                    <CardContent>
                        <Power className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                        <h3 className="mb-2 text-xl font-semibold">Day Successfully Closed</h3>
                        <p className="mb-6 text-muted-foreground">All daily data has been reset. Ready to start a new business day.</p>
                        <Button onClick={onBack}>Start New Day</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Daily Sales Report</h2>
                    <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedDate).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => setShowCloseDialog(true)} className="bg-red-600 hover:bg-red-700">
                        <Power className="mr-2 h-4 w-4" />
                        Close the Day
                    </Button>
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cashier
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        {/* <p className="text-xs text-muted-foreground">+12% from yesterday</p> */}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        {/* <p className="text-xs text-muted-foreground">+8% from yesterday</p> */}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
                        {/* <p className="text-xs text-muted-foreground">+5% from yesterday</p> */}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14:00</div>
                        <p className="text-xs text-muted-foreground">Highest sales period</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales by Payment Method */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Sales by Payment Method</h3>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {Object.entries(paymentBreakdown).map(([method, data]) => (
                        <Card key={method} className="border-l-4 border-l-primary">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 capitalize">
                                    {getPaymentIcon(method)}
                                    {method.replace('-', ' ')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Payment Method Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Orders</p>
                                        <p className="text-2xl font-bold">{data.count}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Revenue</p>
                                        <p className="text-2xl font-bold">{formatCurrency(data.revenue)}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-2">
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        {Math.round((data.revenue / totalRevenue) * 100)}% of total revenue
                                    </p>
                                    <div className="h-2 w-full rounded-full bg-secondary">
                                        <div className="h-2 rounded-full bg-primary" style={{ width: `${(data.revenue / totalRevenue) * 100}%` }} />
                                    </div>
                                </div>

                                {/* Recent Orders for this Payment Method */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Recent Orders:</p>
                                    <div className="max-h-32 space-y-2 overflow-y-auto">
                                        {data.orders.slice(0, 3).map((order) => (
                                            <div key={order.id} className="flex items-center justify-between rounded bg-muted p-2 text-sm">
                                                <div>
                                                    <p className="font-medium">{order.id}</p>
                                                    <p className="text-muted-foreground">{order.customerName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(order.total)}</p>
                                                    <p className="text-muted-foreground">
                                                        {order.createdAt.toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {data.orders.length > 3 && (
                                            <p className="text-center text-xs text-muted-foreground">+{data.orders.length - 3} more orders</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Popular Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {popularItems.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs">
                                            {index + 1}
                                        </Badge>
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.quantity} sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(item.revenue)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Methods Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(paymentBreakdown).map(([method, data]) => (
                                <div key={method} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getPaymentIcon(method)}
                                        <div>
                                            <span className="font-medium capitalize">{method.replace('-', ' ')}</span>
                                            <p className="text-sm text-muted-foreground">{formatCurrency(data.revenue)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{data.count} orders</Badge>
                                        <span className="text-sm text-muted-foreground">{Math.round((data.count / totalOrders) * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(salesMethodBreakdown).map(([method, count]) => (
                                <div key={method} className="flex items-center justify-between">
                                    <span className="capitalize">{method.replace('-', ' ')}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{count} orders</Badge>
                                        <span className="text-sm text-muted-foreground">{Math.round((count / totalOrders) * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Hourly Sales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hourly Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(hourlySales)
                                .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                                .map(([hour, revenue]) => (
                                    <div key={hour} className="flex items-center justify-between">
                                        <span className="text-sm">{hour.padStart(2, '0')}:00</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-24 rounded-full bg-secondary">
                                                <div
                                                    className="h-2 rounded-full bg-primary"
                                                    style={{ width: `${(revenue / Math.max(...Object.values(hourlySales))) * 100}%` }}
                                                />
                                            </div>
                                            <span className="w-20 text-right text-sm font-medium">{formatCurrency(revenue)}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {orders.slice(0, 10).map((order) => (
                            <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-medium">{order.id}</p>
                                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {order.salesMethod.replace('-', ' ')}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        {getPaymentIcon(order.paymentMethod)}
                                        <span className="text-sm capitalize">{order.paymentMethod.replace('-', ' ')}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{formatCurrency(order.total)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.createdAt.toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Close Day Confirmation Dialog */}
            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Close the Day
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to close the day? This will permanently reset all daily sales data and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg bg-muted p-4">
                        <h4 className="mb-2 font-medium">Today's Summary:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Total Revenue:</span>
                                <p className="font-medium">{formatCurrency(totalRevenue)}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Total Orders:</span>
                                <p className="font-medium">{totalOrders}</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCloseDialog(false)} disabled={isClosingDay}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleCloseDay} disabled={isClosingDay} className="bg-red-600 hover:bg-red-700">
                            {isClosingDay ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                    Closing Day...
                                </>
                            ) : (
                                <>
                                    <Power className="mr-2 h-4 w-4" />
                                    Close Day
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {flash.error && (
                <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Error
                            </DialogTitle>
                            <DialogDescription>{flash.error}</DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => handleBack()} disabled={isClosingDay}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Success
                            </DialogTitle>
                            <DialogDescription>{flash.success}</DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => handleBack()} disabled={isClosingDay}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
        </div>
    );
}
