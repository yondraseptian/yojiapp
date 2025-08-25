import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MenuItem, OrderItem } from '@/types';
import { Input } from '@headlessui/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { MenuItemCard } from './menu-item-card';

interface MenuGridProps {
    items: MenuItem[];
    categories: { id: number; name: string }[];
    orderItems: OrderItem[];
    onAddItem: (item: MenuItem) => void;
    onRemoveItem: (item: MenuItem) => void;
    onQuantityChange: (item: MenuItem, quantity: number) => void;
}

export function MenuGrid({ items, orderItems, categories, onAddItem, onRemoveItem, onQuantityChange }: MenuGridProps) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = items.filter((item) => {
        const matchCategory = selectedCategory === 'all' || item.category_id.toString() === selectedCategory;

        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchCategory && matchSearch;
    });

    const getOrderItem = (menuItem: MenuItem) => orderItems.find((orderItem) => orderItem.menuItem?.id === menuItem.id);

    return (
        <div className="space-y-4">
            {/* search bar */}
            <div className="relative mb-4 flex h-10 w-fit items-center rounded-xl border-1 shadow-sm">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-full rounded-xl pl-10"
                />
            </div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                {/* Select All Button */}
                <Button
                    key="all"
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="text-sm"
                >
                    All
                    <Badge variant="secondary" className="ml-2">
                        {items.length}
                    </Badge>
                </Button>

                {/* Category Buttons */}
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.id.toString() ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id.toString())}
                        className="text-sm"
                    >
                        {category.name}
                        <Badge variant="secondary" className="ml-2">
                            {items.filter((item) => item.category_id === category.id).length}
                        </Badge>
                    </Button>
                ))}
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            orderItem={getOrderItem(item)}
                            onAdd={onAddItem}
                            onRemove={onRemoveItem}
                            onQuantityChange={onQuantityChange}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center text-muted-foreground">No items found in this category.</div>
            )}
        </div>
    );
}
