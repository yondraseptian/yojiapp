<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'username' => 'admin',
            'fullName' => 'Administrator',
            'email' => 'admin@coffeeshop.com',
            'phone' => '+62812345678',
            'role' => 'admin',
            'status' => 'active',
            'last_login' => '2024-01-15 09:30:00',
            'password' => Hash::make('password'),
        ]);

        $this->call(CategorySeeder::class);
        $this->call(ProductSeeder::class);
    }
}
