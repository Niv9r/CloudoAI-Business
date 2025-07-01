
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Badge } from "@/components/ui/badge";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
  import { MoreHorizontal } from "lucide-react";
  import { Button } from "../ui/button";
  import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "../ui/dropdown-menu";
  import type { Employee, Role } from "@/lib/types";

  interface EmployeeTableProps {
    employees: Employee[];
    roles: Role[];
    onEdit: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
  }
  
  export default function EmployeeTable({ employees, roles, onEdit, onDelete }: EmployeeTableProps) {
    const getRoleName = (roleId: string) => {
        return roles.find(r => r.id === roleId)?.name || 'Unknown Role';
    }
    
    return (
      <Card className="h-full w-full flex flex-col">
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>A list of all employees for this business.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length > 0 ? employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getRoleName(employee.roleId)}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => onEdit(employee)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(employee)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  
