<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with('items.product')->latest()->get();



        $data = $transactions->map(function ($trx) {
            $subtotal = $trx->items->sum('subtotal');

            $discountAmount = (float) $trx->discount;
            $discountPercentage = $subtotal > 0 ? ($discountAmount / $subtotal) * 100 : 0;

            return [
                'id'               => $trx->transaction_code,
                'customerName'     => $trx->customer_name ?? 'Guest',
                'salesMethod'      => $trx->sales_method,
                'items'            => $trx->items->map(function ($item) {
                    return [
                        'menuItem' => [
                            'id'            => $item->product_id,
                            'name'          => $item->product_name ?? ($item->product->name ?? null),
                            'basePrice'     => $item->product->price ?? $item->price,
                            'category_name' => $item->product->category->name ?? null,
                            'available'     => true,
                            'variants'      => $item->variants ?? [],
                        ],
                        'quantity'       => $item->quantity,
                        'selectedVariant' => $item->variants ?? null,
                        'finalPrice'     => (float) $item->price,
                    ];
                }),
                'subtotal'         => (float) $trx->subtotal,
                'discountPercentage' => $discountPercentage,
                'discountAmount' => $discountAmount,
                'tax'              => (float) $trx->tax,
                'total'            => (float) $trx->total,
                'paymentMethod'    => $trx->payment_method,
                'status'           => $trx->status,
                'createdAt'        => $trx->created_at->toDateTimeString(),
            ];
        });

        return inertia('transactions', compact('data'));
        // dd($data);
    }

    public function refund(Transaction $transaction)
    {
        $transaction->update(['status' => 'refunded']);

        return redirect()->back()->with('success', 'Transaction refunded successfully.');
    }
}
