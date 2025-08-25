<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Inertia::share([
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error'   => session('error'),
                ];
            },
        ]);

        // Paksa HTTPS di production (opsional, tapi jangan paksa kalau pakai ngrok)
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
