'use client';

import {
  Search,
  Store,
  ChevronsUpDown,
  Check,
  PlusCircle
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useBusiness } from '@/context/business-context';


export default function AppHeader() {
  const { businesses, selectedBusiness, setSelectedBusiness } = useBusiness();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden" />
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full max-w-[220px] justify-between sm:w-auto">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-semibold truncate">{selectedBusiness.name}</span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Select a Business</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {businesses.map((business) => (
                <DropdownMenuItem key={business.id} onSelect={() => setSelectedBusiness(business)}>
                  <Check className={`mr-2 h-4 w-4 ${selectedBusiness.id === business.id ? 'opacity-100' : 'opacity-0'}`} />
                  {business.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Create Business</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="https://placehold.co/100x100" alt="@shadcn" data-ai-hint="person portrait" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
