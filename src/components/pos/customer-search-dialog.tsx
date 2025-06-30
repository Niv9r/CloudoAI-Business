'use client';

import { useState } from 'react';
import { customers } from '@/lib/mock-data';
import type { Customer } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';

interface CustomerSearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCustomer: (customer: Customer) => void;
}

export default function CustomerSearchDialog({
  isOpen,
  onOpenChange,
  onSelectCustomer,
}: CustomerSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
          <DialogDescription>
            Search for an existing customer or add a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, company, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                />
            </div>
            <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-2">
                {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                    <div
                        key={customer.id}
                        onClick={() => onSelectCustomer(customer)}
                        className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent"
                    >
                        <Avatar>
                            <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person avatar" />
                            <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-medium">
                                {customer.type === 'individual' ? `${customer.firstName} ${customer.lastName}` : customer.companyName}
                            </p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center text-sm text-muted-foreground p-4">
                        No customers found.
                    </div>
                )}
                </div>
            </ScrollArea>
             <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Customer
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
