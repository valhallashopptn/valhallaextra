
'use client';

import { useState, useEffect, useMemo } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { Star, MessageSquare, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getProducts } from '@/services/productService';
import { addReview } from '@/services/reviewService';
import type { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

const reviewSchema = z.object({
  productId: z.string().min(1, 'Please select a product.'),
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters.').max(500, 'Review must be 500 characters or less.'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface LeaveReviewDialogProps {
    onReviewSubmitted: () => void;
}

export function LeaveReviewDialog({ onReviewSubmitted }: LeaveReviewDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isDialogOpen) {
      const fetchProducts = async () => {
        const productList = await getProducts();
        setProducts(productList);
      };
      fetchProducts();
    }
  }, [isDialogOpen]);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      productId: '',
      rating: 0,
      comment: '',
    },
  });
  
  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
        return products;
    }
    return products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleTriggerClick = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You need to be logged in to leave a review.',
        variant: 'destructive',
        action: (
            <Button onClick={() => router.push('/login')}>Login</Button>
        )
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (data: ReviewFormData) => {
    if (!user) return;
    
    const product = products.find(p => p.id === data.productId);
    if (!product) return;
    
    try {
      await addReview({
        userId: user.uid,
        userEmail: user.email || 'Anonymous',
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        rating: data.rating,
        comment: data.comment,
      });
      toast({ title: 'Success', description: 'Your review has been submitted!' });
      form.reset();
      setSearchQuery('');
      setIsDialogOpen(false);
      onReviewSubmitted();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit your review.', variant: 'destructive' });
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleTriggerClick}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Leave Your Own Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Select a product you've purchased and share your experience.
          </DialogDescription>
        </DialogHeader>
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
                        <SelectValue placeholder="Select a product to review" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <div className="p-2">
                           <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input 
                                   placeholder="Search for a product..."
                                   className="pl-8"
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}
                               />
                           </div>
                        </div>
                      {filteredProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="py-2 px-4 text-center text-sm text-muted-foreground">No products found.</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                  <FormControl>
                    <div
                      className="flex items-center gap-2"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[...Array(5)].map((_, i) => {
                        const ratingValue = i + 1;
                        return (
                          <Star
                            key={ratingValue}
                            className={cn(
                              'h-8 w-8 cursor-pointer transition-colors',
                              ratingValue <= (hoverRating || field.value)
                                ? 'text-primary fill-current'
                                : 'text-muted-foreground/50'
                            )}
                            onClick={() => field.onChange(ratingValue)}
                            onMouseEnter={() => setHoverRating(ratingValue)}
                          />
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts on this product..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setSearchQuery('')}}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
