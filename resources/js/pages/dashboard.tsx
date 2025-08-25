import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Banknote,
    BarChart3,
    Calendar,
    Clock,
    Coffee,
    CreditCard,
    DollarSign,
    PieChart,
    ShoppingBag,
    Smartphone,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Dashboard {
    onBack: () => void;
}

export default function Dashboard() {
    const { mockTodayOrders } = usePage<{ mockTodayOrders: Order[] }>().props;
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const today = new Date();

    // Convert createdAt -> Date
    const orders = useMemo(
        () => mockTodayOrders.map((o) => ({ ...o, createdAt: new Date(o.createdAt) })),
        [mockTodayOrders]
    );

    // Filtered Orders (by period)
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const orderDate = order.createdAt;
            switch (selectedPeriod) {
                case 'today':
                    return orderDate.toDateString() === today.toDateString();
                case 'week': {
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - 7);
                    return orderDate >= startOfWeek && orderDate <= today;
                }
                case 'month': {
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    return orderDate >= startOfMonth && orderDate <= today;
                }
                default:
                    return false;
            }
        });
    }, [orders, selectedPeriod, today]);

    // Previous Orders (untuk comparison)
    const previousOrders = useMemo(() => {
        return orders.filter((order) => {
            const orderDate = order.createdAt;
            switch (selectedPeriod) {
                case 'today': {
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    return orderDate.toDateString() === yesterday.toDateString();
                }
                case 'week': {
                    const startOfThisWeek = new Date(today);
                    startOfThisWeek.setDate(today.getDate() - 7);
                    const startOfLastWeek = new Date(startOfThisWeek);
                    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
                    return orderDate >= startOfLastWeek && orderDate < startOfThisWeek;
                }
                case 'month': {
                    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                    return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
                }
                default:
                    return false;
            }
        });
    }, [orders, selectedPeriod, today]);

    // === Metrics ===
    const totalRevenue = useMemo(
        () => filteredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
        [filteredOrders]
    );
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const previousRevenue = previousOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const previousOrdersCount = previousOrders.length;

    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersChange = previousOrdersCount > 0 ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100 : 0;

    // Payment Breakdown
    const paymentBreakdown = useMemo(() => {
        return filteredOrders.reduce((acc, o) => {
            const method = o.paymentMethod;
            if (!acc[method]) acc[method] = { count: 0, revenue: 0 };
            acc[method].count += 1;
            acc[method].revenue += Number(o.total || 0);
            return acc;
        }, {} as Record<string, { count: number; revenue: number }>);
    }, [filteredOrders]);

    // Popular Items
    const popularItems = useMemo(() => {
        const itemSales = filteredOrders.flatMap((o) =>
            o.items.map((i) => ({
                name: i.menuItem.name,
                quantity: i.quantity,
                revenue: i.finalPrice * i.quantity,
            }))
        );

        return itemSales
            .reduce((acc, item) => {
                const existing = acc.find((i) => i.name === item.name);
                if (existing) {
                    existing.quantity += item.quantity;
                    existing.revenue += item.revenue;
                } else {
                    acc.push({ ...item });
                }
                return acc;
            }, [] as Array<{ name: string; quantity: number; revenue: number }>)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 3);
    }, [filteredOrders]);

    // Hourly Sales
    const hourlySales = useMemo(() => {
        return filteredOrders.reduce((acc, o) => {
            const hour = o.createdAt.getHours();
            acc[hour] = (acc[hour] || 0) + Number(o.total || 0);
            return acc;
        }, {} as Record<number, number>);
    }, [filteredOrders]);

    const hours = Object.keys(hourlySales).map(Number);
    const activeHours = hours.length > 0 ? `${Math.min(...hours)}h - ${Math.max(...hours)}h` : "0h";

    // Helpers
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'cash': return <Banknote className="h-4 w-4" />;
            case 'card': return <CreditCard className="h-4 w-4" />;
            case 'qris': return <Smartphone className="h-4 w-4" />;
            default: return <DollarSign className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="min-h-screen p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Dashboard</h1>
                            <p className="mt-1 flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                {new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex rounded-lg p-1 shadow-sm">
                                <Button
                                    variant={selectedPeriod === 'today' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedPeriod('today')}
                                >
                                    Today
                                </Button>
                                <Button variant={selectedPeriod === 'week' ? 'default' : 'ghost'} size="sm" onClick={() => setSelectedPeriod('week')}>
                                    Week
                                </Button>
                                <Button
                                    variant={selectedPeriod === 'month' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedPeriod('month')}
                                >
                                    Month
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                                <div className="mt-1 flex items-center text-xs">
                                    {revenueChange >= 0 ? (
                                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                                    ) : (
                                        <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                                    )}
                                    <span className={revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {Math.abs(revenueChange).toFixed(1)}%
                                    </span>
                                    <span className="ml-1 text-gray-500">
                                        from {selectedPeriod === 'month' ? 'last month' : selectedPeriod === 'week' ? 'last week' : 'yesterday'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalOrders}</div>
                                <div className="mt-1 flex items-center text-xs">
                                    {ordersChange >= 0 ? (
                                        <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                                    ) : (
                                        <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                                    )}
                                    <span className={ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {Math.abs(ordersChange).toFixed(1)}%
                                    </span>
                                    <span className="ml-1 text-gray-500">
                                        from {selectedPeriod === 'month' ? 'last month' : selectedPeriod === 'week' ? 'last week' : 'yesterday'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Average Order</CardTitle>
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
                                <p className="mt-1 text-xs text-gray-500">Per transaction</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Active Hours</CardTitle>
                                <Clock className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Object.keys(hourlySales).length > 0 ? `${Math.min(...Object.keys(hourlySales).map(Number))}h` : activeHours}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Business hours today</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts and Analytics Row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Sales Chart */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    Hourly Sales
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.keys(hourlySales).length > 0 ? (
                                        Object.entries(hourlySales)
                                            .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                                            .map(([hour, revenue]) => (
                                                <div key={hour} className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{hour.padStart(2, '0')}:00</span>
                                                    <div className="ml-4 flex flex-1 items-center gap-3">
                                                        <div className="h-2 flex-1 rounded-full">
                                                            <div
                                                                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                                                                style={{ width: `${(revenue / Math.max(...Object.values(hourlySales))) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-20 text-right text-sm font-medium">{formatCurrency(revenue)}</span>
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <BarChart3 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>No sales data yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Methods */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-green-600" />
                                    Payment Methods
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.keys(paymentBreakdown).length > 0 ? (
                                        Object.entries(paymentBreakdown).map(([method, data]) => (
                                            <div key={method} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getPaymentIcon(method)}
                                                    <span className="font-medium capitalize">{method.replace('-', ' ')}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="font-medium">{formatCurrency(data.revenue)}</p>
                                                        <p className="text-xs text-gray-500">{data.count} orders</p>
                                                    </div>
                                                    <Badge variant="outline" className="ml-2">
                                                        {Math.round((data.revenue / totalRevenue) * 100)}%
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <CreditCard className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>No payment data yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Popular Items */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Coffee className="h-5 w-5 text-amber-600" />
                                    Top Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {popularItems.length > 0 ? (
                                        popularItems.map((item, index) => (
                                            <div key={item.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant="secondary"
                                                        className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
                                                    >
                                                        {index + 1}
                                                    </Badge>
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{item.quantity} sold</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(item.revenue)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <Coffee className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>No items sold yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="shadow-sm lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                    Recent Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.slice(0, 5).map((order) => (
                                            <div key={order.id} className="flex items-center justify-between rounded-lg p-3">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="font-medium">{order.id}</p>
                                                        <p className="text-sm text-gray-500">{order.customerName}</p>
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
                                                    <p className="text-sm text-gray-500">
                                                        {order.createdAt.toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <ShoppingBag className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>No recent orders</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
