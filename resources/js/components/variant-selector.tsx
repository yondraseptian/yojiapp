'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/data';
import type { MenuItem, MenuVariant, SelectedVariant } from '@/types';
import { X } from 'lucide-react';
import { useState } from 'react';

interface VariantSelectorProps {
    item: MenuItem;
    onConfirm: (item: MenuItem, selectedVariants: SelectedVariant[], finalPrice: number) => void;
    onCancel: () => void;
}

export function VariantSelector({ item, onConfirm, onCancel }: VariantSelectorProps) {
    const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);

    if (!item.variants || item.variants.length === 0) {
        // No variants, add item directly
        onConfirm(item, [], item.basePrice);
        return null;
    }

    const handleVariantToggle = (variant: MenuVariant) => {
        setSelectedVariants((prev) => {
            const existing = prev.find((v) => v.variantId === variant.id);
            if (existing) {
                // Remove variant
                return prev.filter((v) => v.variantId !== variant.id);
            } else {
                // Add variant, but remove other variants of the same type first
                const filtered = prev.filter((v) => {
                    const existingVariant = item.variants?.find((iv) => iv.id === v.variantId);
                    return existingVariant?.type !== variant.type;
                });
                return [
                    ...filtered,
                    {
                        variantId: variant.id,
                        name: variant.name,
                        priceModifier: variant.priceModifier,
                    },
                ];
            }
        });
    };

    const finalPrice = item.basePrice + selectedVariants.reduce((sum, v) => sum + v.priceModifier, 0);

    const groupedVariants = item.variants.reduce(
        (acc, variant) => {
            const type = String(variant.type);
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(variant);
            return acc;
        },
        {} as Record<string, MenuVariant[]>,
    );

    const handleConfirm = () => {
        onConfirm(item, selectedVariants, finalPrice);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-h-[80vh] w-full max-w-md overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Customize {item.name}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-lg font-semibold">Base Price: {formatCurrency(item.basePrice)}</p>
                    </div>

                    <Separator />

                    {Object.entries(groupedVariants).map(([type, variants]) => (
                        <div key={type} className="space-y-2">
                            <h4 className="font-medium capitalize">{type.replace('-', ' ')}</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {variants.map((variant) => {
                                    const isSelected = selectedVariants.some((v) => v.variantId === variant.id);
                                    return (
                                        <Button
                                            key={variant.id}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className="h-auto justify-between p-3"
                                            onClick={() => handleVariantToggle(variant)}
                                        >
                                            <span>{variant.name}</span>
                                            <span className="text-sm">
                                                {variant.priceModifier > 0 && '+'}
                                                {variant.priceModifier !== 0 && formatCurrency(variant.priceModifier)}
                                            </span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {selectedVariants.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="font-medium">Selected Options</h4>
                                {selectedVariants.map((variant) => (
                                    <div key={variant.variantId} className="flex justify-between text-sm">
                                        <span>{variant.name}</span>
                                        <span>
                                            {variant.priceModifier > 0 && '+'}
                                            {variant.priceModifier !== 0 && formatCurrency(variant.priceModifier)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Final Price:</span>
                        <span className="text-lg font-semibold text-primary">{formatCurrency(finalPrice)}</span>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} className="flex-1">
                            Add to Order
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
