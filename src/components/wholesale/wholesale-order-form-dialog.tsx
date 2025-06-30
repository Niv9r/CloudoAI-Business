
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type WholesaleOrder, type WholesaleOrderFormValues, wholesaleOrderFormSchema, type Customer, type Product, paymentTermsTypes } from '@/lib/types';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';

interface WholesaleOrderFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: WholesaleOrderFormValues) => void;
  order: WholesaleOrder | null;
  customers: Customer[];
  products: Product[];
}

export default function WholesaleOrderFormDialog({ isOpen, onOpenChange, onSave, order, customers, products }: WholesaleOrderFormDialogProps) {
  const isEditMode = !!order;

  const form = useForm<WholesaleOrderFormValues>({
    resolver: zodResolver(wholesaleOrderFormSchema),
    defaultValues: {
      customerId: '',
      paymentTerms: 'Due on receipt',
      shippingAddress: '',
      shippingCost: 0,
      lineItems: [{ productId: '', quantity: 1, unitPrice: 0 }],
      notes: '',
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  useEffect(() => {
    if (isOpen) {
      if (order) {
        form.reset({
          ...order,
          orderDate: new Date(order.orderDate),
          lineItems: order.lineItems.map(li => ({ productId: li.productId, quantity: li.quantity, unitPrice: li.unitPrice }))
        });
      } else {
        form.reset({
          customerId: '',
          orderDate: new Date(),
          paymentTerms: 'Due on receipt',
          shippingAddress: '',
          shippingCost: 0,
          lineItems: [{ productId: '', quantity: 1, unitPrice: 0 }],
          notes: '',
        });
      }
    }
  }, [isOpen, order, form]);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }
  
  const lineItemsSubtotal = form.watch('lineItems').reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const shippingCost = Number(form.watch('shippingCost')) || 0;
  const totalAmount = lineItemsSubtotal + shippingCost;
  
  const customerId = form.watch('customerId');
  useEffect(() => {
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        // Assume customer has a default address, otherwise leave blank
        form.setValue('shippingAddress', ''); 
      }
    }
  }, [customerId, customers, form]);


  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Draft Order' : 'Create New Wholesale Order'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this draft order.' : 'Fill out the form to create a new draft order.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a B2B customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>{customer.companyName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                    control={form.control}
                    name="orderDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Order Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="shippingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the full shipping address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label>Line Items</Label>
              <div className="space-y-3 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                    <div className="sm:col-span-6">
                      <FormField
                          control={form.control}
                          name={`lineItems.${index}.productId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const product = products.find(p => p.id === value);
                                  if (product) {
                                      // Set default price, but it remains editable
                                      form.setValue(`lineItems.${index}.unitPrice`, product.price || 0);
                                  }
                                }} 
                                value={field.value}
                              >
                                  <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select a product" />
                                  </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                  {products.map(product => (
                                      <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                  ))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                      />
                    </div>
                     <div className="sm:col-span-2">
                        <FormField
                            control={form.control}
                            name={`lineItems.${index}.quantity`}
                            render={({ field }) => <FormItem><FormControl><Input type="number" placeholder="Qty" {...field} /></FormControl></FormItem>}
                        />
                    </div>
                     <div className="sm:col-span-2">
                        <FormField
                            control={form.control}
                            name={`lineItems.${index}.unitPrice`}
                            render={({ field }) => <FormItem><FormControl><Input type="number" step="0.01" placeholder="Unit Price" {...field} /></FormControl></FormItem>}
                        />
                    </div>
                    <div className="sm:col-span-1 text-right font-medium">
                       ${((form.watch(`lineItems.${index}.quantity`) || 0) * (form.watch(`lineItems.${index}.unitPrice`) || 0)).toFixed(2)}
                    </div>
                    <div className="sm:col-span-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
               <FormMessage>{form.formState.errors.lineItems?.root?.message}</FormMessage>
            </div>

            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className='space-y-4'>
                    <FormField
                        control={form.control}
                        name="paymentTerms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Terms</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment terms" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {paymentTermsTypes.map(term => (
                                        <SelectItem key={term} value={term}>{term}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Internal notes or instructions for the customer..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${lineItemsSubtotal.toFixed(2)}</span>
                    </div>
                     <FormField
                        control={form.control}
                        name="shippingCost"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                                <FormLabel className="text-muted-foreground">Shipping</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" className="w-24 h-8" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <DialogFooter className='pt-4'>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{isEditMode ? 'Save Draft' : 'Create Draft'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
