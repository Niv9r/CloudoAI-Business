
'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Landmark,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Tablet,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navConfig = [
  { type: 'link' as const, href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'link' as const, href: '/insights', label: 'Insights', icon: Lightbulb },
  { type: 'link' as const, href: '/pos', label: 'POS', icon: Tablet },
  {
    type: 'group' as const,
    label: 'Sales',
    icon: ShoppingCart,
    subItems: [
      { href: '/sales', label: 'Sales Log' },
      { href: '/wholesale', label: 'Wholesale' },
      { href: '/shifts', label: 'Shifts' },
      { href: '/customers', label: 'Customers' },
    ],
  },
  {
    type: 'group' as const,
    label: 'Inventory',
    icon: Package,
    subItems: [
      { href: '/inventory', label: 'Products' },
      { href: '/purchase-orders', label: 'Purchase Orders' },
      { href: '/stock-adjustments', label: 'Stock Adjustments' },
      { href: '/vendors', label: 'Vendors' },
    ],
  },
   {
    type: 'group' as const,
    label: 'Finance',
    icon: Landmark,
    subItems: [
      { href: '/expenses', label: 'Expenses' },
      { href: '/reports', label: 'Reports' },
    ],
  },
  { type: 'link' as const, href: '/settings', label: 'Settings', icon: Settings },
];


export default function AppSidebar() {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    navConfig.forEach(item => {
        if (item.type === 'group') {
            if (item.subItems.some(sub => pathname.startsWith(sub.href))) {
                initialState[item.label] = true;
            }
        }
    });
    return initialState;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

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
          {navConfig.map((item) => (
            item.type === 'link' ? (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} asChild>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem key={item.label} className='group/collapsible'>
                <Collapsible open={openGroups[item.label] || false} onOpenChange={() => toggleGroup(item.label)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.label} className="justify-between w-full">
                      <div className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${openGroups[item.label] ? 'rotate-90' : ''}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                      <SidebarMenuSub>
                          {item.subItems.map(subItem => (
                              <SidebarMenuSubItem key={subItem.href}>
                                  <Link href={subItem.href} asChild>
                                      <SidebarMenuSubButton isActive={pathname.startsWith(subItem.href)}>
                                          {subItem.label}
                                      </SidebarMenuSubButton>
                                  </Link>
                              </SidebarMenuSubItem>
                          ))}
                      </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )
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
