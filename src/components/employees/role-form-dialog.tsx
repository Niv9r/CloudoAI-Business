
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { roleFormSchema, type RoleFormValues, type Role, PERMISSIONS, Permission } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

interface RoleFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: RoleFormValues) => void;
  role: Role | null;
}

export default function RoleFormDialog({ isOpen, onOpenChange, onSave, role }: RoleFormDialogProps) {
  const isEditMode = !!role;

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      permissions: new Set(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (role) {
        form.reset({
          name: role.name,
          permissions: role.permissions,
        });
      } else {
        form.reset({
          name: '',
          permissions: new Set(),
        });
      }
    }
  }, [isOpen, role, form]);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }
  
  const formatPermission = (permission: string) => {
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details and permissions for this role.' : 'Create a new role and assign permissions.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 py-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cashier, Inventory Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
                <FormLabel>Permissions</FormLabel>
                <ScrollArea className="h-64 rounded-md border p-4">
                    <FormField
                        control={form.control}
                        name="permissions"
                        render={() => (
                            <div className="space-y-2">
                                {PERMISSIONS.map((permission) => (
                                <FormItem key={permission} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                    <Checkbox
                                        checked={form.watch('permissions').has(permission)}
                                        onCheckedChange={(checked) => {
                                        const currentPermissions = new Set(form.watch('permissions'));
                                        if (checked) {
                                            currentPermissions.add(permission);
                                        } else {
                                            currentPermissions.delete(permission);
                                        }
                                        form.setValue('permissions', currentPermissions, { shouldDirty: true });
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {formatPermission(permission)}
                                    </FormLabel>
                                </FormItem>
                                ))}
                            </div>
                        )}
                    />
                </ScrollArea>
                <FormMessage />
            </FormItem>

            <DialogFooter className='pt-4'>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Role'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
