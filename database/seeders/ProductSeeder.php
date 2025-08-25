<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $products = [
            [
                'product_code' => 'PRD-001',
                'category_id' => 1, // pastikan kategori dengan id 1 sudah ada
                'description' => 'Kopi susu hangat',
                'base_price' => 20000,
                'name' => 'Cappuccino',
                'variants' => [
                    ['type' => 'size', 'name' => 'Small', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Medium', 'additional_price' => 5000],
                    ['type' => 'size', 'name' => 'Large', 'additional_price' => 10000],
                    ['type' => 'milk', 'name' => 'Almond', 'additional_price' => 7000],
                    ['type' => 'syrup', 'name' => 'Vanilla', 'additional_price' => 3000],
                ],
            ],
            [
                'product_code' => 'PRD-002',
                'category_id' => 1,
                'name' => 'Latte',
                'base_price' => 25000,
                'description' => 'Kopi susu hangat',
                'variants' => [
                    ['type' => 'size', 'name' => 'Small', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Medium', 'additional_price' => 5000],
                    ['type' => 'size', 'name' => 'Large', 'additional_price' => 8000],
                    ['type' => 'milk', 'name' => 'Soy', 'additional_price' => 5000],
                    ['type' => 'syrup', 'name' => 'Caramel', 'additional_price' => 3000],
                ],
            ],
            [
                'product_code' => 'PRD-003',
                'category_id' => 2,
                'name' => 'Teh Tarik',
                'base_price' => 15000,
                'description' => 'Teh hangat',
                'variants' => [
                    ['type' => 'size', 'name' => 'Small', 'additional_price' => 0],
                    ['type' => 'size', 'name' => 'Large', 'additional_price' => 2000],

                ],
            ],
        ];

        foreach ($products as $product) {
            $productId = DB::table('products')->insertGetId([
                'product_code' => $product['product_code'],
                'category_id' => $product['category_id'],
                'name' => $product['name'],
                'description' => $product['description'],
                'base_price' => $product['base_price'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            foreach ($product['variants'] as $variant) {
                DB::table('product_variants')->insert([
                    'product_id' => $productId,
                    'type' => $variant['type'],
                    'name' => $variant['name'],
                    'additional_price' => $variant['additional_price'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }
}
