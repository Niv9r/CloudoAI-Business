'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useBusiness } from '@/context/business-context';
import type { Business } from '@/lib/types';

const businessSchema = z.object({
  name: z.string().min(2, { message: 'Business name must be at least 2 characters.' }),
  legalName: z.string().min(2, { message: 'Legal name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  address: z.string().min(5, { message: 'Please enter a valid address.' }),
  timezone: z.string().min(2, { message: 'Timezone is required.' }),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

interface BusinessFormDialogProps {
  business?: Business;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export default function BusinessFormDialog({ business, children, onOpenChange }: BusinessFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { addBusiness, updateBusiness } = useBusiness();
  const isEditMode = !!business;

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      legalName: '',
      email: '',
      phone: '',
      address: '',
      timezone: 'America/New_York',
    },
  });

  useEffect(() => {
    if (business) {
      form.reset(business);
    } else {
      form.reset({
        name: '',
        legalName: '',
        email: '',
        phone: '',
        address: '',
        timezone: 'America/New_York',
      });
    }
  }, [business, form, isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if(onOpenChange) {
        onOpenChange(open);
    }
    if (!open) {
      form.reset();
    }
  };

  const onSubmit = (data: BusinessFormValues) => {
    if (isEditMode) {
      updateBusiness({ id: business.id, ...data });
    } else {
      addBusiness(data);
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Business' : 'Add New Business'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this business.' : 'Fill out the form to create a new business profile.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Artisan Goods Co." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Artisan Goods LLC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., contact@business.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                    {isEditMode ? 'Save Changes' : 'Create Business'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
