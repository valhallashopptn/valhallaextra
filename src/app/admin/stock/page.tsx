
'use client';

import { useState, useEffect } from 'react';
import type { DigitalAsset, Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getDigitalAssets, addDigitalAsset, updateDigitalAsset, deleteDigitalAsset } from '@/services/digitalAssetService';
import { getProducts } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssetForm } from './AssetForm';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function StockPage() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DigitalAsset | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsFromDb, productsFromDb] = await Promise.all([
        getDigitalAssets(),
        getProducts()
      ]);
      const productMap = new Map(productsFromDb.map(p => [p.id, p.name]));
      const assetsWithProductNames = assetsFromDb.map(asset => ({
        ...asset,
        productName: productMap.get(asset.productId) || 'Unknown Product'
      }));
      setAssets(assetsWithProductNames);
      setProducts(productsFromDb);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ title: 'Error', description: 'Could not load digital assets or products.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: Omit<DigitalAsset, 'id' | 'createdAt' | 'status'>) => {
    try {
      if (editingAsset) {
        await updateDigitalAsset(editingAsset.id, data);
        toast({ title: 'Success', description: 'Asset updated successfully.' });
      } else {
        await addDigitalAsset(data);
        toast({ title: 'Success', description: 'Asset added successfully.' });
      }
      await fetchData();
      setIsDialogOpen(false);
      setEditingAsset(null);
    } catch (error) {
       toast({ title: 'Error', description: 'Failed to save asset.', variant: 'destructive' });
       console.error("Failed to save asset", error);
    }
  };
  
  const handleEdit = (asset: DigitalAsset) => {
    setEditingAsset(asset);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingAsset(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (assetId: string) => {
    try {
        await deleteDigitalAsset(assetId);
        toast({ title: 'Success', description: 'Asset deleted successfully.' });
        fetchData();
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete asset.', variant: 'destructive' });
        console.error("Failed to delete asset", error);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
      setIsDialogOpen(isOpen);
      if (!isOpen) setEditingAsset(null);
    }}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Digital Stock Management</h1>
          <p className="text-muted-foreground">Manage your inventory for automatic delivery.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <div>
              <CardTitle>Asset Stock</CardTitle>
              <CardDescription>A list of all digital assets available for automatic delivery.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : assets.map(asset => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.productName}</TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">{asset.data}</TableCell>
                    <TableCell>
                        <Badge variant={asset.status === 'available' ? 'default' : 'secondary'} className={asset.status === 'available' ? 'bg-green-600' : 'bg-gray-500'}>
                            {asset.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{new Date(asset.createdAt.toDate()).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)} disabled={asset.status === 'delivered'}>
                          <Edit className="h-4 w-4" />
                       </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the asset.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(asset.id)} className="bg-destructive hover:bg-destructive/90">
                                Yes, delete it
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
        </DialogHeader>
        <AssetForm
          onSubmit={handleFormSubmit}
          initialData={editingAsset}
          onCancel={() => setIsDialogOpen(false)}
          products={products}
        />
      </DialogContent>
    </Dialog>
  );
}
