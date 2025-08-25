<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyClosing extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'closed_at',
        'total_sales',
        'total_transactions',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
