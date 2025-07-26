
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getProducts, addProduct, updateProduct } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import type { Product, Category } from '@/lib/types';
import { PlusCircle, Edit } from 'lucide-react';
import { ProductForm } from '../ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsFromDb, categoriesFromDb] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsFromDb);
      setCategories(categoriesFromDb);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ title: 'Error', description: 'Could not load products or categories.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: Omit<Product, 'id'>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast({ title: 'Success', description: 'Product updated successfully.' });
      } else {
        await addProduct(data);
        toast({ title: 'Success', description: 'Product added successfully.' });
      }
      await fetchData();
      setIsDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
       toast({ title: 'Error', description: 'Failed to save product.', variant: 'destructive' });
       console.error("Failed to save product", error);
    }
  };
  
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
      setIsDialogOpen(isOpen);
      if (!isOpen) setEditingProduct(null);
    }}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Product Management</h1>
          <p className="text-muted-foreground">Add, edit, or view your products.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div>
              <CardTitle>Products List</CardTitle>
              <CardDescription>A list of all products in your store.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ))
                ) : products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.categoryName}</Badge>
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
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
      
      <DialogContent className="sm:max-w-xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
          <ProductForm
            onSubmit={handleFormSubmit}
            initialData={editingProduct}
            onCancel={() => setIsDialogOpen(false)}
            categories={categories}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
