
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getProductById } from '@/services/productService';
import { getCategoryById } from '@/services/categoryService';
import { getReviewsForProduct, addReview } from '@/services/reviewService';
import type { Product, Review, Category } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { CheckCircle, ShoppingCart, Star, PackageCheck, Minus, Plus, Zap, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReviewForm } from './ReviewForm';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageWrapper } from '@/components/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function StarRating({ rating, size = 'md' }: { rating: number, size?: 'sm' | 'md' }) {
  const starClasses = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(starClasses, i < Math.round(rating) ? 'text-accent fill-current' : 'text-muted-foreground/50')}
        />
      ))}
    </div>
  );
}


export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductData = async () => {
      if (typeof id !== 'string') return;
      try {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);

        if (productData) {
            const [categoryData, reviewsData] = await Promise.all([
                getCategoryById(productData.categoryId),
                getReviewsForProduct(id)
            ]);
            setCategory(categoryData);
            setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Failed to fetch product or reviews:', error);
        toast({ title: 'Error', description: 'Could not load product details.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, toast]);
  

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addToCart({ ...product, category }, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  
  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!user || !product) {
      toast({ title: 'Error', description: 'You must be logged in to leave a review.', variant: 'destructive' });
      return;
    }
    
    try {
        await addReview({
            userId: user.uid,
            userEmail: user.email || 'Anonymous',
            rating,
            comment,
            productId: product.id,
            productName: product.name,
            productImage: product.imageUrl,
        });
        const updatedReviews = await getReviewsForProduct(product.id);
        setReviews(updatedReviews);
        toast({ title: 'Success', description: 'Your review has been submitted!' });
    } catch (error) {
        console.error('Failed to submit review:', error);
        toast({ title: 'Error', description: 'Failed to submit your review.', variant: 'destructive' });
    }
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  }, [reviews]);
  
  const StockDisplay = ({ stock }: { stock: number }) => {
    let text = "In Stock";
    let iconColor = "text-primary";

    if (stock === 0) {
        text = "Out of Stock";
        iconColor = "text-destructive";
    } else if (stock < 10) {
        text = "Low Stock";
        iconColor = "text-yellow-500";
    }

    return (
        <div className="flex items-center gap-3">
            <PackageCheck className={cn("h-6 w-6", iconColor)} />
            <div>
                <p className="font-semibold">{text}</p>
                <p className="text-sm text-muted-foreground">{stock} available</p>
            </div>
        </div>
    );
  }


  if (loading) {
    return (
      <PageWrapper>
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Skeleton className="aspect-square md:aspect-video rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Product not found</h2>
          <p className="mt-2 text-muted-foreground">The product you are looking for does not exist.</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to Shop</Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }
  
  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => {
        const newQuantity = prev + amount;
        if (newQuantity < 1) return 1;
        if (newQuantity > product.stock) return product.stock;
        return newQuantity;
    })
  }

  const defaultTab = product.tabs && product.tabs.length > 0 ? product.tabs[0].id : "description";

  return (
    <PageWrapper>
      <div className="space-y-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
                <div className="aspect-video relative rounded-lg overflow-hidden border">
                    <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint={product.categoryName}
                    />
                </div>
            </div>

            <div className="space-y-6">
                <Badge variant="secondary">{product.categoryName}</Badge>
                <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
                
                <div className="flex items-center gap-2 text-sm">
                    <StarRating rating={averageRating} />
                    <span className="text-muted-foreground">({averageRating.toFixed(1)})</span>
                    <Separator orientation="vertical" className="h-4" />
                    <a href="#reviews" className="text-muted-foreground hover:underline">{reviews.length} reviews</a>
                </div>

                <div>
                    <span
                        className="text-3xl font-bold text-primary"
                        style={{ textShadow: '0 0 15px hsl(var(--primary) / 0.5)' }}
                    >
                        {formatPrice(product.price)}
                    </span>
                </div>

                <p className="text-muted-foreground">{product.description}</p>

                <div className="rounded-lg border bg-card/50 p-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <Zap className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-semibold">Delivery Method</p>
                            <p className="text-sm text-muted-foreground">Instant Delivery</p>
                        </div>
                    </div>
                     <StockDisplay stock={product.stock} />
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-bold">{quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={handleAddToCart}
                        disabled={isAdded || product.stock === 0}
                        size="lg"
                        className={cn("w-full flex-grow transition-all", { 'bg-green-600': isAdded })}
                    >
                        {product.stock === 0 ? 'Out of Stock' : isAdded ? (
                            <>
                            <CheckCircle className="mr-2 h-5 w-5 animate-in fade-in" />
                            Added to Cart
                            </>
                        ) : (
                            <>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>

        {product.tabs && product.tabs.length > 0 && (
          <>
            <div className="animated-separator"></div>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList>
                {product.tabs?.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>{tab.title}</TabsTrigger>
                ))}
              </TabsList>
              {product.tabs?.map(tab => (
                <TabsContent key={tab.id} value={tab.id}>
                  <p className="text-muted-foreground">{tab.content}</p>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}

        <div className="animated-separator"></div>

        <Card id="reviews">
          <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>Customer Reviews</CardTitle>
                      <div className="mt-2 flex items-center gap-2">
                          <StarRating rating={averageRating} />
                          <p className="text-muted-foreground">Based on {reviews.length} reviews</p>
                      </div>
                  </div>
                  <ReviewForm onSubmit={handleReviewSubmit} />
              </div>
          </CardHeader>
          <CardContent>
              {reviews.length > 0 ? (
                  <div className="space-y-6">
                      {reviews.map(review => (
                          <div key={review.id} className="flex gap-4">
                            <Avatar>
                                  <AvatarFallback>{review.userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                      <p className="font-semibold">{review.userEmail}</p>
                                      <span className="text-xs text-muted-foreground">{new Date(review.createdAt.toDate()).toLocaleDateString()}</span>
                                  </div>
                                  <StarRating rating={review.rating} size="sm" />
                                  <p className="mt-2 text-muted-foreground">{review.comment}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center text-muted-foreground py-8">
                      <p>No reviews yet.</p>
                      <p className="text-sm">Be the first to share your thoughts!</p>
                  </div>
              )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
