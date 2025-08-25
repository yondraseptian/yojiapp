<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_closings', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique(); // tanggal yang di-closing (unik supaya 1x per hari)
            $table->timestamp('closed_at')->nullable(); // kapan closing dilakukan
            $table->decimal('total_sales', 15, 2)->default(0);
            $table->integer('total_transactions')->default(0);
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // siapa yg closing
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_closings');
    }
};

