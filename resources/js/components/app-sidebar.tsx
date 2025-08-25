import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeDollarSign, LayoutGrid, Package, ShoppingBag, User } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: (NavItem & { roles?: string[] })[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        roles: ['admin', 'cashier'], // semua bisa lihat
    },
    {
        title: 'Products',
        href: '/products',
        icon: Package,
        roles: ['admin'],
    },
    {
        title: 'Cashier',
        href: '/cashier',
        icon: ShoppingBag,
        roles: ['cashier', 'admin'],
    },
    {
        title: 'Transactions',
        href: '/transactions',
        icon: BadgeDollarSign,
        roles: ['admin'],
    },
    {
        title: 'Users',
        href: '/users',
        icon: User,
        roles: ['admin'],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as unknown as { auth: { user: { role: string } } };
    const role = auth.user.role;

    // filter sesuai role
    const items = mainNavItems.filter((item) => !item.roles || item.roles.includes(role));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
