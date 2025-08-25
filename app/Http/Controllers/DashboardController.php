<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        

        $todayOrders = Transaction::with('items.product')
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

        return inertia('dashboard', [
            'mockTodayOrders' => $todayOrders,
        ]);
    }
}
