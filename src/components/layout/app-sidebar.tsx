
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
  Users,
  Ticket,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEmployee } from '@/context/employee-context';

const navConfig = [
  { type: 'link' as const, href: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'view_reports' },
  { type: 'link' as const, href: '/insights', label: 'Insights', icon: Lightbulb, permission: 'view_reports' },
  { type: 'link' as const, href: '/pos', label: 'POS', icon: Tablet, permission: 'process_sales' },
  {
    type: 'group' as const,
    label: 'Sales',
    icon: ShoppingCart,
    permission: 'process_sales',
    subItems: [
      { href: '/sales', label: 'Sales Log', permission: 'process_sales' },
      { href: '/wholesale', label: 'Wholesale', permission: 'manage_wholesale_orders' },
      { href: '/shifts', label: 'Shifts', permission: 'process_sales' },
      { href: '/customers', label: 'Customers', permission: 'process_sales' },
      { href: '/discounts', label: 'Discounts', permission: 'manage_discounts' },
    ],
  },
  {
    type: 'group' as const,
    label: 'Inventory',
    icon: Package,
    permission: 'manage_inventory',
    subItems: [
      { href: '/inventory', label: 'Products', permission: 'manage_inventory' },
      { href: '/purchase-orders', label: 'Purchase Orders', permission: 'manage_purchase_orders' },
      { href: '/stock-adjustments', label: 'Stock Adjustments', permission: 'manage_inventory' },
      { href: '/vendors', label: 'Vendors', permission: 'manage_inventory' },
    ],
  },
   {
    type: 'group' as const,
    label: 'Finance',
    icon: Landmark,
    permission: 'manage_expenses', // or a new finance permission
    subItems: [
      { href: '/expenses', label: 'Expenses', permission: 'manage_expenses' },
      { href: '/reports', label: 'Reports', permission: 'view_reports' },
    ],
  },
  {
    type: 'group' as const,
    label: 'Management',
    icon: Users,
    permission: 'access_settings',
    subItems: [
      { href: '/employees', label: 'Employees & Roles', permission: 'manage_employees' },
      { href: '/timesheets', label: 'Timesheets', permission: 'view_timesheets' },
      { href: '/payroll', label: 'Payroll', permission: 'view_payroll' },
      { href: '/settings', label: 'Business Settings', permission: 'access_settings' },
    ],
  }
];


export default function AppSidebar() {
  const pathname = usePathname();
  const { employees, currentEmployee, setCurrentEmployee, permissions } = useEmployee();

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

  const handleEmployeeChange = (employeeId: string) => {
      const employee = employees.find(e => e.id === employeeId);
      if(employee) {
        setCurrentEmployee(employee);
      }
  }

  const visibleNavConfig = navConfig.filter(item => permissions.has(item.permission));

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
          {visibleNavConfig.map((item) => (
            item.type === 'link' ? (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    as="a"
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ) : (
              permissions.has(item.permission) &&
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
                          {item.subItems
                            .filter(subItem => permissions.has(subItem.permission))
                            .map(subItem => (
                              <SidebarMenuSubItem key={subItem.href}>
                                <Link href={subItem.href} passHref>
                                  <SidebarMenuSubButton as="a" isActive={pathname.startsWith(subItem.href)}>
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
         <div className="flex flex-col gap-2 p-2">
            <label className="text-xs text-sidebar-foreground/70 px-2 group-data-[collapsible=icon]:hidden">
                Current User
            </label>
            <Select value={currentEmployee?.id} onValueChange={handleEmployeeChange}>
              <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-2">
                <SelectValue placeholder="Select Employee">
                  <span className="group-data-[collapsible=icon]:hidden">{currentEmployee?.name}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
