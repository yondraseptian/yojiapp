<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\DailyClosing;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashierController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'variants'])->where('status', 1)->get();
        $categories = Category::all();

        $menuItems = $products->map(function ($product) {
            // Variants
            $variants = $product->variants->map(function ($variant) {
                return [
                    'id' => (string)$variant->id,
                    'type' => $variant->type,
                    'name' => $variant->name,
                    'priceModifier' => (float)$variant->additional_price,
                ];
            });

            // Hitung basePrice: jika ada variant dengan type 'size', ambil harga terendah, kalau tidak ada, pakai base_price produk
            $sizeVariants = $product->variants->where('type', 'size');
            $basePrice = $sizeVariants->isNotEmpty()
                ? (float)$sizeVariants->min('additional_price') + (float)$product->base_price
                : (float)$product->base_price;

            return [
                'id' => (string)$product->id,
                'name' => $product->name,
                'category_id' => $product->category_id,
                'category_name' => $product->category->name ?? null,
                'basePrice' => $basePrice,
                'description' => $product->description,
                'available' => true,
                'variants' => $variants->isEmpty() ? null : $variants,
            ];
        });

        $todayOrders = Transaction::with('items.product')
            ->whereDate('created_at', Carbon::today())
            ->whereNull('closed_at')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->transaction_code,
                    'customerName' => $order->customer_name,
                    'salesMethod' => $order->sales_method,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'menuItem' => [
                                'id' => $item->product_id,
                                'name' => $item->product?->name,
                                'basePrice' => $item->price,
                                'category_name' => $item->product?->category?->name ?? null,
                            ],
                            'quantity' => $item->quantity,
                            'selectedVariants' => $item->variants ?? [],
                            'finalPrice' => $item->price,
                        ];
                    }),
                    'subtotal' => $order->subtotal,
                    'tax' => $order->tax,
                    'total' => $order->total,
                    'paymentMethod' => $order->payment_method,
                    'status' => $order->status,
                    'createdAt' => $order->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('cashier', [
            'menuItems' => $menuItems,
            'categories' => $categories,
            'dailySales' => $todayOrders
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'customerName' => 'nullable|string|max:255',
            'salesMethod' => 'required|string',
            'items' => 'required|array',
            'items.*.menuItemId' => 'required|integer',
            'items.*.menuItemName' => 'required|string',
            'items.*.finalPrice' => 'required|numeric',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.selectedVariants' => 'array',
            'subtotal' => 'required|numeric',
            'discountPercentage' => 'nullable|numeric',
            'discountAmount' => 'nullable|numeric',
            'tax' => 'required|numeric',
            'total' => 'required|numeric',
            'paymentMethod' => 'required|string',
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        // generate kode transaksi

        $transaction = \App\Models\Transaction::create([
            'transaction_code' => $validated['id'],
            'customer_name' => $validated['customerName'],
            'transaction_date' => now(),
            'sales_method' => $validated['salesMethod'],
            'payment_method' => $validated['paymentMethod'],
            'status' => $validated['status'],
            'subtotal' => $validated['subtotal'],
            'discount' => $validated['discountAmount'] ?? 0,
            'tax' => $validated['tax'],
            'total' => $validated['total'],
            'notes' => $validated['notes']
        ]);

        foreach ($validated['items'] as $item) {
            $transaction->items()->create([
                'product_id' => $item['menuItemId'],
                'price' => $item['finalPrice'],
                'quantity' => $item['quantity'],
                'subtotal' => $item['finalPrice'] * $item['quantity'],
                'variants' => $item['selectedVariants'] ?? [],
            ]);
        }

        return redirect()->back()->with('success', 'Transaction saved!');
    }

    public function closeDay()
    {
        $today = Carbon::today();

        // Cek kalau sudah pernah closing hari ini
        if (DailyClosing::whereDate('date', $today)->exists()) {
            return redirect()->back()->with('error', 'Closing day already saved!');
        }

        $transactions = Transaction::whereDate('created_at', $today)->get();

        $totalSales = $transactions->sum('total');
        $totalTransactions = $transactions->count();

        $closing = DailyClosing::create([
            'date' => $today,
            'closed_at' => now(),
            'total_sales' => $totalSales,
            'total_transactions' => $totalTransactions,
            'user_id' => Auth::id(),
        ]);

        Transaction::whereDate('created_at', now())
            ->update(['closed_at' => now()]);

        return redirect()->back()->with('success', 'Closing day saved!');
    }
}
