
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_ORDERS } from '@/lib/mock-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProducts, addProduct, updateProduct } from '@/services/productService';
import type { Product } from '@/lib/types';
import { PlusCircle, Edit } from 'lucide-react';
import { ProductForm } from './ProductForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';


const ADMIN_EMAIL = 'admin@example.com';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    const productsFromDb = await getProducts();
    setProducts(productsFromDb);
  };

  const handleFormSubmit = async (productData: Omit<Product, 'id'>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({ title: 'Success', description: 'Product updated successfully.' });
      } else {
        await addProduct(productData);
        toast({ title: 'Success', description: 'Product added successfully.' });
      }
      await fetchProducts();
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
  }

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return <div className="text-center">Loading and verifying admin access...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage products and view all customer orders.</p>
      </div>

      {/* Product Management Section */}
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) setEditingProduct(null);
      }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Add, edit, or view your products.</CardDescription>
            </div>
             <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.game}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-right">
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
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the details of your product.' : 'Fill in the details for the new product.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={handleFormSubmit}
            initialData={editingProduct}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>


      {/* Order Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>A list of all orders placed on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ORDERS.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {order.items.map(item => (
                        <Badge key={item.id} variant="secondary">
                          {item.name} (x{item.quantity})
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">${order.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

