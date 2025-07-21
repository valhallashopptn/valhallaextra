
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { getDigitalAssets, addDigitalAsset, updateDigitalAsset, deleteDigitalAsset } from '@/services/digitalAssetService';
import { getProducts } from '@/services/productService';
import type { DigitalAsset, Product } from '@/lib/types';
import { PlusCircle, Edit, Trash2, KeySquare, User, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


const assetFormSchema = z.object({
  productId: z.string().min(1, { message: 'Please select a product.' }),
  type: z.enum(['key', 'account']),
  data: z.object({
    key: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    extraInfo: z.string().optional(),
  }),
}).refine(data => {
    if (data.type === 'key') return !!data.data.key;
    if (data.type === 'account') return !!data.data.username && !!data.data.password;
    return false;
}, {
    message: "Please provide the required fields for the selected asset type.",
    path: ['data'],
});

type AssetFormData = z.infer<typeof assetFormSchema>;

function AssetForm({ onSubmit, initialData, onCancel, products }: { onSubmit: any, initialData?: DigitalAsset | null, onCancel: () => void, products: Product[] }) {
    const form = useForm<AssetFormData>({
        resolver: zodResolver(assetFormSchema),
        defaultValues: initialData ? {
            productId: initialData.productId,
            type: initialData.type,
            data: {
                key: initialData.data.key || '',
                username: initialData.data.username || '',
                password: initialData.data.password || '',
                extraInfo: initialData.data.extraInfo || '',
            }
        } : {
            productId: '',
            type: 'key',
            data: { key: '', username: '', password: '', extraInfo: '' }
        },
    });

    const assetType = form.watch('type');

    const handleFormSubmit = (data: AssetFormData) => {
        const product = products.find(p => p.id === data.productId);
        if (product) {
            onSubmit({ ...data, productName: product.name });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {products.filter(p => p.deliveryType === 'digital_asset').map(product => (
                                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Asset Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an asset type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="key">License Key</SelectItem>
                                <SelectItem value="account">Account Credentials</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                {assetType === 'key' && (
                     <FormField
                        control={form.control}
                        name="data.key"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Key</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter the license key..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                 {assetType === 'account' && (
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="data.username"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Username / Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter username or email" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="data.password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter password" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                 <FormField
                    control={form.control}
                    name="data.extraInfo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Extra Information (Optional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., recovery codes, special instructions" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Asset'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

function DigitalAssetsContent() {
    const searchParams = useSearchParams();
    const productIdFilter = searchParams.get('productId');
  
    const { toast } = useToast();
    const [assets, setAssets] = useState<DigitalAsset[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<DigitalAsset | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    const filteredProductName = useMemo(() => {
        if (!productIdFilter) return null;
        return products.find(p => p.id === productIdFilter)?.name;
    }, [productIdFilter, products]);

    const fetchData = async () => {
        setLoading(true);
        try {
        const [assetsFromDb, productsFromDb] = await Promise.all([
            getDigitalAssets(productIdFilter || undefined),
            getProducts()
        ]);
        setAssets(assetsFromDb);
        setProducts(productsFromDb);
        } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: 'Error', description: 'Could not load data.', variant: 'destructive' });
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [productIdFilter]);

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
    
    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteDigitalAsset(deletingId);
            toast({ title: 'Success', description: 'Asset deleted successfully.' });
            setDeletingId(null);
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete asset.', variant: 'destructive' });
        }
    }

    const handleEdit = (asset: DigitalAsset) => {
        setEditingAsset(asset);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingAsset(null);
        setIsDialogOpen(true);
    };

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    }

    return (
        <>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) setEditingAsset(null);
        }}>
            <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Digital Asset Management</h1>
                <p className="text-muted-foreground">Manage your inventory of keys and accounts.</p>
            </div>

            {filteredProductName && (
                <Alert>
                    <KeySquare className="h-4 w-4" />
                    <AlertTitle>Filtering by Product</AlertTitle>
                    <AlertDescription>
                        Showing assets for <strong className="text-primary">{filteredProductName}</strong>. <Link href="/admin/digital-assets" className="underline">Clear filter</Link>
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between p-6">
                <div>
                    <CardTitle>Asset Inventory</CardTitle>
                    <CardDescription>A list of all digital assets in your store.</CardDescription>
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
                        <TableHead>Type</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Claimed By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                        <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                        </TableRow>
                    ) : assets.map(asset => (
                        <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.productName}</TableCell>
                        <TableCell>
                            <Badge variant="secondary" className="capitalize">
                                {asset.type === 'key' ? <KeySquare className="mr-2 h-3 w-3" /> : <User className="mr-2 h-3 w-3" />}
                                {asset.type}
                            </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs font-mono text-xs">
                           <div className="flex items-center gap-2">
                            <span className="truncate">
                                {asset.type === 'key' ? asset.data.key : `${asset.data.username} / ${visiblePasswords[asset.id] ? asset.data.password : '••••••'}`}
                            </span>
                             {asset.type === 'account' && (
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePasswordVisibility(asset.id)}>
                                    {visiblePasswords[asset.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                             )}
                           </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={asset.status === 'available' ? 'default' : 'destructive'}>{asset.status}</Badge>
                        </TableCell>
                        <TableCell>
                            {asset.orderId ? (
                                <Link href={`/admin/orders`} className="underline text-primary text-xs">Order #{asset.orderId.substring(0,8)}</Link>
                            ) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)} disabled={asset.status === 'claimed'}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" onClick={() => setDeletingId(asset.id)} disabled={asset.status === 'claimed'}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            </div>
            
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                    <DialogDescription>
                        {editingAsset ? 'Update the details for this asset.' : 'Add a new key or account to your inventory.'}
                    </DialogDescription>
                </DialogHeader>
                <AssetForm
                    onSubmit={handleFormSubmit}
                    initialData={editingAsset}
                    onCancel={() => setIsDialogOpen(false)}
                    products={products}
                />
            </DialogContent>
        </Dialog>
        <Dialog open={!!deletingId} onOpenChange={(isOpen) => !isOpen && setDeletingId(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>This action cannot be undone. This will permanently delete the asset.</DialogDescription>
                </DialogHeader>
                 <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}

export default function DigitalAssetsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DigitalAssetsContent />
        </Suspense>
    )
}
