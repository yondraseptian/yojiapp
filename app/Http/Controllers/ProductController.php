<?php

// app/Http/Controllers/ProductController.php
namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'variants'])->get();

        $menuItems = $products->map(function ($product) {
            $variants = $product->variants->map(function ($variant) {
                return [
                    'id' => (string)$variant->id,
                    'type' => $variant->type,
                    'name' => $variant->name,
                    'additional_price' => (float)$variant->additional_price,
                ];
            });

            $sizeVariants = $product->variants->where('type', 'size');
            $basePrice = $sizeVariants->isNotEmpty()
                ? (float)$product->base_price + (float)$sizeVariants->min('additional_price')
                : (float)$product->base_price;

            return [
                'id' => (string)$product->id,
                'name' => $product->name,
                'category_id' => $product->category_id,
                'category_name' => $product->category->name ?? null,
                'basePrice' => $basePrice,
                'description' => $product->description,
                'available' => $product->status ,
                'variants' => $variants->isEmpty() ? null : $variants,
            ];
        });

        return Inertia::render('products', [
            'menuItems' => $menuItems,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([

            'name' => 'required|string|max:255',
            'category_name' => 'required|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'variants' => 'nullable|array',
            'variants.*.type' => 'required_with:variants|string',
            'variants.*.name' => 'required_with:variants|string',
            'variants.*.additional_price' => 'nullable|required_with:variants|numeric|min:0',
        ]);

        $categoryName = $request->input('category_name') === 'new'
            ? $request->input('new_category_name')
            : $request->input('category_name');

        $category = Category::firstOrCreate(['name' => $categoryName]);

        $latest = Product::latest('id')->first();
        $nextId = $latest ? $latest->id + 1 : 1;
        $productCode = 'PRD' . str_pad($nextId, 4, '0', STR_PAD_LEFT);


        $product = $category->products()->create([
            'product_code' => $productCode,
            'name' => $data['name'],
            'base_price' => $data['base_price'],
            'description' => $data['description'],
        ]);

        if (isset($data['variants'])) {
            foreach ($data['variants'] as $variant) {
                $product->variants()->create($variant);
            }
        }

        return back()->with('success', "Product {$product->name} created");
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_name' => 'required|string|max:255',
            'base_price' => 'required|numeric|min:0',
            'available' => 'required|boolean',
            'description' => 'nullable|string',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id',
            'variants.*.type' => 'required_with:variants|string',
            'variants.*.name' => 'required_with:variants|string',
            'variants.*.additional_price' => 'required_with:variants|numeric|min:0',
        ]);

        $category = Category::firstOrCreate(['name' => $data['category_name']]);
        $product->update([
            'name' => $data['name'],
            'category_id' => $category->id,
            'base_price' => $data['base_price'],
            'status' => $data['available'], 
            'description' => $data['description'],
        ]);

        $existing = $product->variants()->pluck('id')->toArray();
        $submitted = collect($data['variants'] ?? [])->pluck('id')->filter()->toArray();
        $toDelete = array_diff($existing, $submitted);
        ProductVariant::destroy($toDelete);

        if (isset($data['variants'])) {
            foreach ($data['variants'] as $variant) {
                if (isset($variant['id'])) {
                    ProductVariant::find($variant['id'])->update($variant);
                } else {
                    $product->variants()->create($variant);
                }
            }
        }

        return back()->with('success', 'Product updated');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return back()->with('success', 'Product deleted');
    }
}
