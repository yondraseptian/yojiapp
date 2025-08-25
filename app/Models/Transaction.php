<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
     use HasFactory;

    protected $fillable = [
        'transaction_code',
        'customer_name',
        'transaction_date',
        'sales_method',
        'payment_method',
        'status',
        'subtotal',
        'discount',
        'tax',
        'total',
        'closed_at',
        'notes',
    ];

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

     public function getRouteKeyName()
    {
        return 'transaction_code'; 
    }
}
