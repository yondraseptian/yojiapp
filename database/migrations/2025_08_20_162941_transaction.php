<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code')->unique();
            $table->string('customer_name')->nullable();
            $table->timestamp('transaction_date');
            $table->enum('sales_method', [
                'dine-in',
                'takeaway',
                'delivery-gojek',
                'delivery-grab',
                'delivery-shopee'
            ]);
            $table->enum('payment_method', ['cash', 'card', 'qris', 'transfer']);
            $table->enum('status', ['pending', 'completed', 'confirmed', 'canceled', 'refunded'])->default('pending');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('notes')->nullable();
            $table->timestamps();
            $table->timestamp('closed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions
        ');
    }
};
