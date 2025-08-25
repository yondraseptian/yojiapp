import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/data';
import type { MenuItem, Variant } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Coffee, DollarSign, Edit, Filter, Package, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

export default function Products() {
    const { menuItems } = usePage().props as unknown as { menuItems: MenuItem[] };
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const { data, setData, post, put, reset } = useForm({
        name: '',
        category_name: '',
        new_category_name: '',
        description: '',
        base_price: 0,
        available: 1,
        variants: [{ type: '', name: '', additional_price: '' }],
    });


    // Get unique categories
    const categories = Array.from(new Set(menuItems.map((item) => item.category_name)));

    // Filter items
    const filteredItems = menuItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category_name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Reset form
    const resetForm = () => {
        setData({
            name: '',
            category_name: '',
            new_category_name: '',
            description: '',
            base_price: 0,
            available: 1,
            variants: [],
        });
    };
    

    // Add new item
    const handleAddItem = () => {
        post(route('products.store'), {
            onSuccess: () => {
                setShowAddDialog(false);
                resetForm();
            },
        });
    };

    // Edit item
    const handleEditItem = () => {
        if (!selectedItem) return;

        put(route('products.update', selectedItem.id), {
            onSuccess: () => {
                setShowEditDialog(false);
                setSelectedItem(null);
                reset();
            },
        });
    };

    // Delete item
    const handleDeleteItem = () => {
        if (!selectedItem) return;

        // setMenuItems(updatedItems); // Uncomment this if you have a state for menuItems
        router.delete(route('products.destroy', { id: selectedItem.id }), {
            onSuccess: () => {
                console.log(`Produk ${selectedItem.name} berhasil dihapus`);
            },
            onError: (errors) => {
                console.error(errors);
            },
        });
        setShowDeleteDialog(false);
        setSelectedItem(null);
    };

    // Open edit dialog
    const openEditDialog = (item: MenuItem) => {
        setSelectedItem(item);
        setData({
            name: item.name,
            category_name: item.category_name,
            new_category_name: '',
            description: item.description,
            base_price: item.basePrice,
            available: item.available ? 1 : 0,
            variants: item.variants.map((v) => ({
                type: String(v.type),
                name: v.name,
                additional_price: String(v.additional_price ?? 0),
            })),
        });
        setShowEditDialog(true);
    };

    // Open delete dialog
    const openDeleteDialog = (item: MenuItem) => {
        setSelectedItem(item);
        setShowDeleteDialog(true);
    };

    // Add variant to form
    const addVariant = () => {
        setData('variants', [...data.variants, { type: '', name: '', additional_price: '' }]);
    };

    // Update variant in form
    const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
        const updated = data.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v));
        setData('variants', updated);
    };

    // Remove variant from form
    const removeVariant = (index: number) => {
        setData(
            'variants',
            data.variants.filter((_, i) => i !== index),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="min-h-screen p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Product Management</h1>
                            <p className="mt-1">Manage your menu items and variants</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                                <Package className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{menuItems.length}</div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                                <Tag className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{categories.length}</div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
                                <Coffee className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{menuItems.reduce((sum, item) => sum + (item.variants?.length || 0), 0)}</div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(
                                        menuItems.reduce(
                                            (sum, item) => sum + (item.variants?.reduce((vSum, v) => vSum + (v.price || 0), 0) || 0),
                                            0,
                                        ) / (menuItems.reduce((sum, item) => sum + (item.variants?.length || 0), 0) || 1), // biar ga division by zero
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 md:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Filter by category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.map((item) => (
                            <Card key={item.id} className="shadow-sm transition-shadow hover:shadow-md">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{item.name}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{item.category_name}</Badge>
                                            <Badge className={item.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                                                {item.available ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardTitle className="text-sm">{formatCurrency(item.basePrice)}</CardTitle>
                                    <CardDescription>{item.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="mb-2 text-sm">Variants ({item.variants?.length || 0})</p>
                                        <div className="space-y-2">
                                            {item.variants && item.variants.length > 0 ? (
                                                item.variants.map((variant) => (
                                                    <div
                                                        key={variant.id}
                                                        className="flex items-center justify-between rounded p-2 text-sm"
                                                    >
                                                        <div>
                                                            <span className="font-medium">{variant.type}</span>
                                                            <span className="ml-2 text-gray-500">({variant.name})</span>
                                                        </div>
                                                        <span className="font-medium">
                                                            {formatCurrency(variant.price ?? variant.additional_price ?? 0)}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No variants available</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(item)} className="flex-1">
                                            <Edit className="mr-1 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openDeleteDialog(item)}
                                            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <Card className="shadow-sm">
                            <CardContent className="py-12 text-center">
                                <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium">No products found</h3>
                                <p className="mb-4 text-gray-500">Try adjusting your search or filter criteria</p>
                                <Button onClick={() => setShowAddDialog(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Product
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Add Product Dialog */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                            <DialogDescription>Create a new menu item with variants</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Americano"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="e.g., A cup of coffee"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="basePrice">Base Price</Label>
                                    <Input
                                        id="basePrice"
                                        type="number"
                                        value={data.base_price}
                                        onChange={(e) => setData('base_price', Number(e.target.value))}
                                        placeholder="e.g., 3.50"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={data.category_name} onValueChange={(value) => setData('category_name', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="new">+ Add New Category</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {data.category_name === 'new' && (
                                <div>
                                    <Label htmlFor="newCategory">New Category Name</Label>
                                    <Input
                                        id="newCategory"
                                        placeholder="Enter new category name"
                                        value={data.new_category_name}
                                        onChange={(e) => setData('new_category_name', e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <Label>Variants</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                                        <Plus className="mr-1 h-4 w-4" />
                                        Add Variant
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {data.variants.map((variant, index) => (
                                        <div key={index} className="grid grid-cols-4 gap-2 rounded-lg border p-3">
                                            <div>
                                                <Label className="text-xs">Type</Label>
                                                <Select value={variant.type} onValueChange={(value) => updateVariant(index, 'type', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="size">Size</SelectItem>
                                                        <SelectItem value="temperature">Temperature</SelectItem>
                                                        <SelectItem value="milk">Milk</SelectItem>
                                                        <SelectItem value="syrup">Syrup</SelectItem>
                                                        <SelectItem value="extra">Extra</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Name</Label>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g., Regular"
                                                    value={variant.name || ''}
                                                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Additional Price</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 2000"
                                                    value={variant.additional_price || ''}
                                                    onChange={(e) => updateVariant(index, 'additional_price', Number(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeVariant(index)}
                                                    className="w-full text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {data.variants.length === 0 && (
                                    <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
                                        <p className="text-gray-500">No variants added yet</p>
                                        <Button type="button" variant="outline" size="sm" onClick={addVariant} className="mt-2 bg-transparent">
                                            <Plus className="mr-1 h-4 w-4" />
                                            Add First Variant
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddItem}>Add Product</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                            <DialogDescription>Update menu item details and variants</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editName">Product Name</Label>
                                    <Input id="editName" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="editDescription">Description</Label>
                                    <Input id="editDescription" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="editPrice">Base Price</Label>
                                    <Input id="editPrice" value={data.base_price} onChange={(e) => setData('base_price', Number(e.target.value))} />
                                </div>
                                <div>
                                    <Label htmlFor="editStatus">Status</Label>
                                    <Select
                                        value={data.available ? '1' : '0'} 
                                        onValueChange={(value) => setData('available', value === '1' ? 1 : 0)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Active</SelectItem>
                                            <SelectItem value="0">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="editCategory">Category</Label>
                                    <Select value={data.category_name} onValueChange={(value) => setData('category_name', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <Label>Variants</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                                        <Plus className="mr-1 h-4 w-4" />
                                        Add Variant
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {data.variants.map((variant, index) => (
                                        <div key={index} className="grid grid-cols-4 gap-2 rounded-lg border p-3">
                                            <div>
                                                <Label className="text-xs">Type</Label>
                                                <Select value={variant.type} onValueChange={(value) => updateVariant(index, 'type', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="size">Size</SelectItem>
                                                        <SelectItem value="temperature">Temperature</SelectItem>
                                                        <SelectItem value="milk">Milk</SelectItem>
                                                        <SelectItem value="syrup">Syrup</SelectItem>
                                                        <SelectItem value="extra">Extra</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Name</Label>
                                                <Input value={variant.name} onChange={(e) => updateVariant(index, 'name', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Additional Price</Label>
                                                <Input
                                                    type="number"
                                                    value={variant.additional_price || 0}
                                                    onChange={(e) => updateVariant(index, 'additional_price', Number(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeVariant(index)}
                                                    className="w-full text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditItem}>Update Product</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone and will remove all variants of
                                this product.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
                                Delete Product
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
