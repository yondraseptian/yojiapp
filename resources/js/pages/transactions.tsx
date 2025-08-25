import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/data';
import type { MenuItem, SelectedVariant, SharedData } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Eye,
    FileText,
    Receipt,
    ReceiptText,
    RefreshCw,
    Search,
    ShoppingBag,
    Smartphone,
    TrendingUp,
    User,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];
interface OrderItem {
    uniqueId: string;
    selectedVariant: SelectedVariant;
    menuItem: MenuItem;
    quantity: number;
    finalPrice: number;
    notes?: string;
}

type Order = {
    discountAmount: number;
    discountPercentage: number;
    id: string;
    customerName: string;
    salesMethod: 'dine-in' | 'takeaway' | 'delivery-gojek' | 'delivery-grab' | 'delivery-shopee';
    items: OrderItem[];
    subtotal: number;
    discount?: number;
    tax: number;
    total: number;
    paymentMethod: string;
    status: 'pending' | 'confirmed' | 'completed' | 'refunded'; // ✅ tambahkan
    createdAt: Date;
    notes: string;
};

export default function Transactions() {
    const { auth } = usePage<SharedData>().props;
    const { data } = usePage().props;
    const [transactions, setTransactions] = useState<Order[]>(data as Order[]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedSalesMethod, setSelectedSalesMethod] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showRefundDialog, setShowRefundDialog] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Order | null>(null);

    // Filter transactions
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPayment = selectedPaymentMethod === 'all' || transaction.paymentMethod === selectedPaymentMethod;
        const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
        const matchesSalesMethod = selectedSalesMethod === 'all' || transaction.salesMethod === selectedSalesMethod;

        let matchesDate = true;
        if (dateFilter !== 'all') {
            const today = new Date();
            const transactionDate = new Date(transaction.createdAt); // <- pastikan diubah ke Date
            switch (dateFilter) {
                case 'today':
                    matchesDate = transactionDate.toDateString() === today.toDateString();
                    break;
                case 'week': {
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDate = transactionDate >= weekAgo;
                    break;
                }
                case 'month': {
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    matchesDate = transactionDate >= monthAgo;
                    break;
                }
            }
        }

        return matchesSearch && matchesPayment && matchesStatus && matchesSalesMethod && matchesDate;
    });

    // Calculate statistics
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const completedTransactions = filteredTransactions.filter((t) => t.status === 'completed').length;

    // Payment method breakdown
    const paymentBreakdown = filteredTransactions.reduce(
        (acc, transaction) => {
            if (!transaction.paymentMethod) return acc;
            if (!acc[transaction.paymentMethod]) {
                acc[transaction.paymentMethod] = { count: 0, revenue: 0 };
            }
            acc[transaction.paymentMethod].count += 1;
            acc[transaction.paymentMethod].revenue += transaction.total;
            return acc;
        },
        {} as Record<string, { count: number; revenue: number }>,
    );

    // Open transaction details
    const openDetailsDialog = (transaction: Order) => {
        setSelectedTransaction(transaction);
        setShowDetailsDialog(true);
    };

    // Open refund dialog
    const openRefundDialog = (transaction: Order) => {
        setSelectedTransaction(transaction);
        setShowRefundDialog(true);
    };

    // Process refund
    const handleRefund = () => {
        if (!selectedTransaction) return;

        router.patch(
            route('transactions.refund', selectedTransaction.id),
            {},
            {
                onSuccess: () => {
                    // update state biar langsung kelihatan
                    setTransactions((prev) => prev.map((t) => (t.id === selectedTransaction.id ? { ...t, status: 'refunded' } : t)));

                    setShowRefundDialog(false);
                    setSelectedTransaction(null);
                },
            },
        );
    };

    // Export transactions
    const handleExport = () => {
        const csvContent = [
            ['Transaction ID', 'Customer', 'Date', 'Total', 'Payment Method', 'Status', 'Sales Method'].join(','),
            ...filteredTransactions.map((t) =>
                [t.id, t.customerName, t.createdAt.toLocaleDateString(), t.total, t.paymentMethod || '', t.status, t.salesMethod].join(','),
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handlePrintReceipt = (data, isThermalPrinter = false) => {
        const receiptContent = `
        <div style="font-family: 'Courier New', monospace; padding: 20px; text-align: center;">
            <h2>Receipt</h2>
            <p><strong>Transaction ID:</strong> ${data.id}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Sales Method:</strong> ${data.salesMethod}</p>
            <p><strong>Date:</strong> ${data.createdAt}</p>
            <hr />
            <div style="text-align: left;">
                <h3>Items:</h3>
                ${data.items
                    .map(
                        (item) => `
                    <p>${item.menuItem.name} - ${item.quantity} x ${item.finalPrice.toFixed(2)}</p>
                `,
                    )
                    .join('')}
            </div>
            <hr />
            <p><strong>Subtotal:</strong> ${data.subtotal.toFixed(2)}</p>
            <p><strong>Discount:</strong> ${data.discountAmount.toFixed(2)} (${data.discountPercentage.toFixed(2)}%)</p>
            <p><strong>Tax:</strong> ${data.tax.toFixed(2)}</p>
            <p><strong>Total:</strong> ${data.total.toFixed(2)}</p>
            <hr />
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <hr />
            <p>Thank you for your purchase!</p>
        </div>
    `;

        if (isThermalPrinter) {
            // Gunakan esc-pos-printer atau JSPrintManager untuk printer termal
            const printer = new JSPM.Printer();
            printer
                .setText('Receipt')
                .setText(`Transaction ID: ${data.id}`)
                .setText(`Customer: ${data.customerName}`)
                .setText(`Sales Method: ${data.salesMethod}`)
                .setText(`Date: ${data.createdAt}`)
                .setText('Items:');

            data.items.forEach((item) => {
                printer.setText(`${item.menuItem.name} x${item.quantity} - ${item.finalPrice.toFixed(2)}`);
            });

            printer
                .setText(`Subtotal: ${data.subtotal.toFixed(2)}`)
                .setText(`Discount: ${data.discountAmount.toFixed(2)} (${data.discountPercentage.toFixed(2)}%)`)
                .setText(`Tax: ${data.tax.toFixed(2)}`)
                .setText(`Total: ${data.total.toFixed(2)}`)
                .cut()
                .send(); // Kirim perintah cetak langsung ke printer termal
        } else {
            // Gunakan window.print() untuk printer biasa
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
            <html>
                <head>
                    <title>Print Receipt</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            margin: 0;
                            padding: 20px;
                        }
                        .receipt {
                            padding: 20px;
                            text-align: center;
                        }
                        .items {
                            text-align: left;
                        }
                        .items p {
                            margin: 5px 0;
                        }
                        hr {
                            border: 1px solid #000;
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        ${receiptContent}
                    </div>
                </body>
            </html>
        `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    // Get payment icon
    const getPaymentIcon = (method?: string) => {
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

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'refunded':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 ';
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />
            <div className="min-h-screen p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Transaction History</h1>
                            <p className="mt-1 text-gray-600">View and manage all transactions</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleExport} variant="outline" className="bg-green-50 hover:bg-green-100">
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                                <p className="mt-1 text-xs">From {totalTransactions} transactions</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
                                <Receipt className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalTransactions}</div>
                                <p className="mt-1 text-xs">{completedTransactions} completed</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Average Transaction</CardTitle>
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(averageTransaction)}</div>
                                <p className="mt-1 text-xs">Per transaction</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {totalTransactions > 0 ? Math.round((completedTransactions / totalTransactions) * 100) : 0}%
                                </div>
                                <p className="mt-1 text-xs">Completion rate</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="shadow-sm">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                                <div className="lg:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search transactions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Select value={dateFilter} onValueChange={setDateFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Date range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">Last 7 Days</SelectItem>
                                            <SelectItem value="month">Last 30 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Payments</SelectItem>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="qris">QRIS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="refunded">Refunded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Select value={selectedSalesMethod} onValueChange={setSelectedSalesMethod}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sales method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Methods</SelectItem>
                                            <SelectItem value="dine-in">Dine In</SelectItem>
                                            <SelectItem value="takeaway">Takeaway</SelectItem>
                                            <SelectItem value="delivery-gojek">Gojek</SelectItem>
                                            <SelectItem value="delivery-grab">Grab</SelectItem>
                                            <SelectItem value="delivery-shopee">Shopee</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method Summary */}
                    {Object.keys(paymentBreakdown).length > 0 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {Object.entries(paymentBreakdown).map(([method, data]) => (
                                <Card key={method} className="shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600 capitalize">
                                            {getPaymentIcon(method)}
                                            {method.replace('-', ' ')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold">{formatCurrency(data.revenue)}</div>
                                        <p className="mt-1 text-xs">{data.count} transactions</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Transactions Table */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Transactions ({filteredTransactions.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between rounded-lg border p-4 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="font-medium">{transaction.id}</p>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-3 w-3" />
                                                        <span>{transaction.customerName}</span>
                                                        <Clock className="ml-2 h-3 w-3" />
                                                        <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="capitalize">
                                                        {transaction.salesMethod.replace('-', ' ')}
                                                    </Badge>
                                                    <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                                                    {transaction.discountPercentage > 0 && (
                                                        <Badge variant="outline" className="text-green-600">
                                                            -{transaction.discountPercentage}%
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(transaction.total)}</p>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        {getPaymentIcon(transaction.paymentMethod)}
                                                        <span className="capitalize">{transaction.paymentMethod?.replace('-', ' ')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openDetailsDialog(transaction)}>
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        View
                                                    </Button>
                                                    {transaction.status === 'completed' && (
                                                        <Button
                                                            disabled={auth.user?.role === 'cashier'}
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openRefundDialog(transaction)}
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <RefreshCw className="mr-1 h-4 w-4" />
                                                            Refund
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <Receipt className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-medium text-gray-600">No transactions found</h3>
                                        <p className="">Try adjusting your search or filter criteria</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction Details Dialog */}
                <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Transaction Details</DialogTitle>
                            <DialogDescription>Complete information for {selectedTransaction?.id}</DialogDescription>
                        </DialogHeader>

                        {selectedTransaction && (
                            <div className="space-y-6">
                                {/* Transaction Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Transaction ID</Label>
                                        <p className="font-medium">{selectedTransaction.id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Customer</Label>
                                        <p className="font-medium">{selectedTransaction.customerName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Date & Time</Label>
                                        <p className="font-medium">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <Label className="text-sm font-medium text-gray-600">Sales Method</Label>
                                        <Badge variant="outline" className="capitalize">
                                            {selectedTransaction.salesMethod.replace('-', ' ')}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Payment Method</Label>
                                        <div className="flex items-center gap-2">
                                            {getPaymentIcon(selectedTransaction.paymentMethod)}
                                            <span className="capitalize">{selectedTransaction.paymentMethod?.replace('-', ' ')}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                                        <Badge className={getStatusColor(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <Label className="mb-3 block text-sm font-medium text-gray-600">Items Ordered</Label>
                                    <div className="space-y-3">
                                        {selectedTransaction.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                <div>
                                                    <p className="font-medium">{item.menuItem.name}</p>
                                                    <p className="text-sm">
                                                        {Array.isArray(item.selectedVariant)
                                                            ? item.selectedVariant.map((v) => v.name).join(' • ')
                                                            : item.selectedVariant?.name}
                                                        • Qty: {item.quantity}
                                                    </p>
                                                    {item.notes && <p className="text-sm">Note: {item.notes}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(item.finalPrice * item.quantity)}</p>
                                                    <p className="text-sm">{formatCurrency(item.finalPrice)} each</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="border-t pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                                        </div>
                                        {selectedTransaction.discountPercentage > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount ({selectedTransaction.discountPercentage}%)</span>
                                                <span>-{formatCurrency(selectedTransaction.discountAmount || 0)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span>Tax</span>
                                            <span>{formatCurrency(selectedTransaction.tax)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                            <span>Total</span>
                                            <span>{formatCurrency(selectedTransaction.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={() => handlePrintReceipt(selectedTransaction)}>
                                {' '}
                                <ReceiptText className="mr-2 h-4 w-4" /> Print
                            </Button>
                            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Refund Confirmation Dialog */}
                <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                Process Refund
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to process a refund for transaction "{selectedTransaction?.id}"? This will refund{' '}
                                {selectedTransaction && formatCurrency(selectedTransaction.total)} to the customer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRefund} className="bg-red-600 hover:bg-red-700">
                                Process Refund
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
