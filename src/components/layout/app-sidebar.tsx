'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Users,
  Tablet
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pos', label: 'POS', icon: Tablet },
    { href: '/sales', label: 'Sales', icon: ShoppingCart },
    { href: '/inventory', label: 'Inventory', icon: Package },
    { href: '#', label: 'Reports', icon: BarChart3 },
    { href: '#', label: 'Customers', icon: Users },
    { href: '/expenses', label: 'Expenses', icon: CreditCard },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Palette className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold font-headline">CLOUDO</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person portrait" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-semibold truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">
              admin@cloudo.pro
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
