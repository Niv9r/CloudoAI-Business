'use client';

import { useBusiness } from '@/context/business-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import BusinessFormDialog from './business-form-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ManageBusinessesCard() {
  const { businesses, selectedBusiness, setSelectedBusiness, deleteBusiness } = useBusiness();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Manage Businesses</CardTitle>
            <CardDescription>Add, edit, or remove your business profiles.</CardDescription>
        </div>
        <BusinessFormDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Business
            </Button>
        </BusinessFormDialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            {businesses.map((business) => (
                <div key={business.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border p-3">
                   <div className="flex-1">
                        <button className="text-left" onClick={() => setSelectedBusiness(business)}>
                            <p className={`font-semibold ${business.id === selectedBusiness.id ? 'text-primary' : ''}`}>{business.name}</p>
                            <p className="text-sm text-muted-foreground">{business.legalName}</p>
                        </button>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <BusinessFormDialog business={business}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            </BusinessFormDialog>
                            <DropdownMenuSeparator />
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    onSelect={(e) => e.preventDefault()}
                                    >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the
                                        business profile "{business.name}".
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className='bg-destructive hover:bg-destructive/90'
                                        onClick={() => deleteBusiness(business.id)}
                                    >
                                        Continue
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
