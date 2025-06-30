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
import { type PurchaseOrder, type PurchaseOrderFormValues, purchaseOrderFormSchema, type Vendor, type Product } from '@/lib/types';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';

interface PoFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PurchaseOrderFormValues) => void;
  purchaseOrder: PurchaseOrder | null;
  vendors: Vendor[];
  products: Product[];
}

export default function PoFormDialog({ isOpen, onOpenChange, onSave, purchaseOrder, vendors, products }: PoFormDialogProps) {
  const isEditMode = !!purchaseOrder;

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      vendorId: '',
      lineItems: [{ productId: '', quantity: 1, unitCost: 0 }],
      notes: '',
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  useEffect(() => {
    if (isOpen) {
      if (purchaseOrder) {
        form.reset({
          ...purchaseOrder,
          issueDate: new Date(purchaseOrder.issueDate),
          expectedDate: new Date(purchaseOrder.expectedDate),
          lineItems: purchaseOrder.lineItems.map(li => ({ productId: li.productId, quantity: li.quantity, unitCost: li.unitCost }))
        });
      } else {
        form.reset({
          vendorId: '',
          issueDate: new Date(),
          expectedDate: new Date(),
          lineItems: [{ productId: '', quantity: 1, unitCost: 0 }],
          notes: '',
        });
      }
    }
  }, [isOpen, purchaseOrder, form]);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }
  
  const totalAmount = form.watch('lineItems').reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Purchase Order' : 'Create New Purchase Order'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this PO.' : 'Fill out the form to create a new PO.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
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
              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
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

            <div>
              <Label>Line Items</Label>
              <div className="space-y-3 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="w-full sm:flex-1">
                      <FormField
                          control={form.control}
                          name={`lineItems.${index}.productId`}
                          render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
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
                          )}
                      />
                    </div>
                     <div className="w-full sm:w-24">
                        <FormField
                            control={form.control}
                            name={`lineItems.${index}.quantity`}
                            render={({ field }) => <Input type="number" placeholder="Qty" {...field} />}
                        />
                    </div>
                     <div className="w-full sm:w-32">
                        <FormField
                            control={form.control}
                            name={`lineItems.${index}.unitCost`}
                            render={({ field }) => <Input type="number" step="0.01" placeholder="Unit Cost" {...field} />}
                        />
                    </div>
                    <div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, unitCost: 0 })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
               <FormMessage>{form.formState.errors.lineItems?.root?.message}</FormMessage>
            </div>

            <Separator />
            <div className="flex justify-end font-bold text-lg">
                Total: ${totalAmount.toFixed(2)}
            </div>
            <Separator />

             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any relevant notes for the supplier or for internal records..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='pt-4'>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Create PO'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
