<?php

use App\Http\Controllers\CashierController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::resource('cashier', CashierController::class);

    Route::post('/closings/close-day', [CashierController::class, 'closeDay'])
        ->name('closings.close-day');

    Route::resource('transactions', TransactionController::class);
    Route::middleware('role:admin')->group(function () {
        Route::resource('products', ProductController::class);
        Route::resource('users', UserController::class);
    });

    Route::middleware('role:admin')->group(function () {
        Route::patch('/transactions/{transaction}/refund', [TransactionController::class, 'refund'])
            ->name('transactions.refund');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
