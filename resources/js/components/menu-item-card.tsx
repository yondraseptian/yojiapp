import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/data';
import type { MenuItem, OrderItem } from '@/types';
import { Plus } from 'lucide-react';

interface MenuItemCardProps {
    item: MenuItem;
    orderItem?: OrderItem;
    onAdd: (item: MenuItem) => void;
    onRemove: (item: MenuItem) => void;
    onQuantityChange: (item: MenuItem, quantity: number) => void;
}

export function MenuItemCard({ item, onAdd, }: MenuItemCardProps) {
    return (
        <Card className={`transition-all ${!item.available ? 'pointer-events-none opacity-50' : 'hover:shadow-md'}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {item.description && <CardDescription className="mt-1 text-sm">{item.description}</CardDescription>}
                        {item.variants?.length ? (
                            <Badge variant="outline" className="mt-2 text-xs">
                                Customizable
                            </Badge>
                        ) : null}
                    </div>
                    <Badge variant="secondary" className="ml-2">
                        {item.category_name}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary">
                        {item.variants?.length ? (
                            <>
                                <span className="text-sm text-muted-foreground">from </span>
                                {formatCurrency(item.basePrice ?? 0)}
                            </>
                        ) : (
                            formatCurrency(item.basePrice ?? 0)
                        )}
                    </span>

                    <Button onClick={() => onAdd(item)} size="sm">
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
