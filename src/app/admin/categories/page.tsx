
'use client';

import { useState, useEffect } from 'react';
import type { Category } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getCategories, addCategory, updateCategory } from '@/services/categoryService';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryForm } from './CategoryForm';

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoriesFromDb = await getCategories();
      setCategories(categoriesFromDb);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({ title: 'Error', description: 'Could not load categories.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        toast({ title: 'Success', description: 'Category updated successfully.' });
      } else {
        await addCategory(data);
        toast({ title: 'Success', description: 'Category added successfully.' });
      }
      await fetchData();
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
       toast({ title: 'Error', description: 'Failed to save category.', variant: 'destructive' });
       console.error("Failed to save category", error);
    }
  };
  
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
      setIsDialogOpen(isOpen);
      if (!isOpen) setEditingCategory(null);
    }}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Category Management</h1>
          <p className="text-muted-foreground">Manage your product categories.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>A list of all product categories in your store.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Image src={category.imageUrl || 'https://placehold.co/40x40.png'} alt={category.name} width={40} height={40} className="rounded-md object-cover" />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{new Date(category.createdAt.toDate()).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <CategoryForm
          onSubmit={handleFormSubmit}
          initialData={editingCategory}
          onCancel={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
