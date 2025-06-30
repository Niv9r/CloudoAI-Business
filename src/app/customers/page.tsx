'use client';

import CustomerTable from '@/components/customers/customer-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function CustomersPage() {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <CustomerTable />
      </div>
    </div>
  );
}
