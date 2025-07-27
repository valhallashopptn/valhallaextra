

'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, AdminPermission } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getAllUserProfiles, updateUserPermissions } from '@/services/walletService';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminForm } from './AdminForm';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';


export default function AdminsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersFromDb = await getAllUserProfiles();
      setAllUsers(usersFromDb);
      setAdmins(usersFromDb.filter(u => u.role === 'admin'));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ title: 'Error', description: 'Could not load users.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: { userId: string, role: 'user' | 'admin', permissions?: AdminPermission[] }) => {
    try {
      await updateUserPermissions(data.userId, data.role, data.permissions || []);
      toast({ title: 'Success', description: 'Admin permissions updated successfully.' });
      await fetchData();
      setIsDialogOpen(false);
      setEditingAdmin(null);
    } catch (error: any) {
       toast({ title: 'Error', description: error.message || 'Failed to save permissions.', variant: 'destructive' });
       console.error("Failed to save permissions", error);
    }
  };
  
  const handleEdit = (admin: UserProfile) => {
    setEditingAdmin(admin);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingAdmin(null);
    setIsDialogOpen(true);
  };
  
  const formatPermissionName = (permission: string) => {
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const isSuperAdmin = (email?: string) => {
    return email === 'admin@example.com';
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
      setIsDialogOpen(isOpen);
      if (!isOpen) setEditingAdmin(null);
    }}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Management</h1>
          <p className="text-muted-foreground">Manage roles and permissions for administrators.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>A list of all users with admin privileges.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add or Edit Admin
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : admins.map(admin => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{admin.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{admin.username}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {isSuperAdmin(admin.email) ? (
                            <Badge variant="default"><ShieldCheck className="h-3 w-3 mr-1" /> Super Admin</Badge>
                        ) : admin.permissions && admin.permissions.length > 0 ? (
                           admin.permissions.map(p => <Badge key={p} variant="secondary">{formatPermissionName(p)}</Badge>)
                        ) : (
                          <Badge variant="outline">No Permissions</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(admin)} disabled={isSuperAdmin(admin.email) && user?.email !== admin.email}>
                          <Edit className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {!loading && admins.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No administrators found.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingAdmin ? `Edit Admin: ${editingAdmin.username}` : 'Add / Edit Admin'}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
          <AdminForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
            users={allUsers}
            editingAdmin={editingAdmin}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
