
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
  import { MoreHorizontal } from "lucide-react";
  import { Button } from "../ui/button";
  import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "../ui/dropdown-menu";
  import type { Role } from "@/lib/types";
  import { ScrollArea } from "../ui/scroll-area";

  interface RoleTableProps {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
  }
  
  export default function RoleTable({ roles, onEdit, onDelete }: RoleTableProps) {
    
    return (
      <Card className="h-full w-full flex flex-col">
        <CardHeader>
          <CardTitle>Role List</CardTitle>
          <CardDescription>A list of all roles configured for this business.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead className="text-right">Permissions Granted</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length > 0 ? roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-right">{role.permissions.size}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(role)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(role)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        </CardContent>
      </Card>
    );
  }
  
