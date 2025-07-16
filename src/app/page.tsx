
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCategories } from '@/services/categoryService';
import type { Category, Product, Review } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Package, ShoppingCart, LifeBuoy, Star, MessageSquare } from 'lucide-react';
import { getProducts } from '@/services/productService';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSetting } from '@/services/settingsService';
import { Separator } from '@/components/ui/separator';
import { getAllReviews } from '@/services/reviewService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/context/TranslationContext';


function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/products?category=${category.id}`}>
      <div className="flip-card aspect-[3/4] rounded-lg">
        <div className="flip-card-inner rounded-lg">
          <div className="flip-card-front overflow-hidden rounded-lg">
            <div className="relative h-full w-full">
              <Image
                src={category.imageUrl || 'https://placehold.co/300x400.png'}
                alt={category.name}
                fill
                className="object-cover"
                data-ai-hint="game category"
              />
              <div className="absolute inset-0 bg-black/60"></div>
              <div className="absolute inset-0 flex items-end p-4">
                <h3 className="text-xl font-bold text-white">{category.name}</h3>
              </div>
            </div>
          </div>
          <div className="flip-card-back overflow-hidden rounded-lg">
             <div className="relative h-full w-full">
                <Image
                    src={category.backImageUrl || 'https://placehold.co/300x400.png'}
                    alt={`${category.name} (back)`}
                    fill
                    className="object-cover"
                    data-ai-hint="game category alternative"
                />
                <div className="absolute inset-0 bg-black/60"></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-sm mt-2 flex-grow">{category.description}</p>
                    <p className="text-xs font-semibold mt-auto self-end">View Products &rarr;</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ icon, title, value, animationClass }: { icon: React.ReactNode, title: string, value: string, animationClass?: string }) {
  return (
    <Card className="bg-background/30 backdrop-blur-sm border-primary/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/20">
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className={cn("text-primary", animationClass)}>
          <div className="p-2 rounded-full">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-primary mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StarRating({ rating, size = 'sm' }: { rating: number, size?: 'sm' | 'md' }) {
  const starClasses = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-1 justify-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(starClasses, i < Math.round(rating) ? 'text-accent fill-current' : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  );
}


function ReviewCard({ review }: { review: Review }) {
    return (
        <Card className="flex flex-col text-center h-full">
            <CardContent className="p-8 flex flex-col flex-grow items-center">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${review.userId}`} />
                    <AvatarFallback>{review.userEmail.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h4 className="text-xl font-bold font-headline">{review.userEmail.split('@')[0]}</h4>
                <div className="my-2">
                    <StarRating rating={review.rating} size="md" />
                </div>
                <blockquote className="mt-4 text-muted-foreground flex-grow text-center max-w-sm mx-auto">
                    &quot;{review.comment}&quot;
                </blockquote>
                <div className="mt-6">
                    <Badge variant="secondary">For: {review.productName}</Badge>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesFromDb, productsFromDb, reviewsFromDb, heroUrl] = await Promise.all([
            getCategories(),
            getProducts(),
            getAllReviews(),
            getSetting('heroImageUrl', 'https://placehold.co/1920x1080.png?text=TopUp+Hub')
        ]);
        setCategories(categoriesFromDb);
        setProducts(productsFromDb);
        setReviews(reviewsFromDb);
        setHeroImageUrl(heroUrl);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const featuredCategories = useMemo(() => categories.slice(0, 5), [categories]);

  const filteredProducts = useMemo(() => {
    let prods = products;
    if (searchQuery) {
        prods = prods.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.game.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedCategory) {
        prods = prods.filter(p => p.categoryId === selectedCategory);
    }
    return prods.slice(0, 4); // Show only 4 products on homepage
  }, [products, searchQuery, selectedCategory]);


  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden" style={{ marginTop: '-60px' }}>
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <>
            <Image 
              src={heroImageUrl}
              alt="Digital Marketplace"
              fill
              className="object-cover"
              data-ai-hint="dark abstract background"
              priority
            />
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl font-headline">
                  {t('HomePage.title')}
              </h1>
              <p className="mt-3 text-lg text-white/80 sm:text-xl max-w-2xl mx-auto">
                  {t('HomePage.subtitle')}
              </p>
              <Button asChild size="lg" className="mt-8">
                  <Link href="/products">{t('HomePage.browseProducts')}</Link>
              </Button>
            </div>
          </>
        )}
      </section>
      
      <div className="space-y-16">
        {/* Browse by Category Section */}
        <section className="bg-background pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="relative text-center md:text-left">
              <h2 className="text-3xl font-bold font-headline text-center">{t('HomePage.browseByCategory')}</h2>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 hidden md:block">
                <Button variant="outline" asChild>
                    <Link href="/products">
                        {t('HomePage.viewAllCategories')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
                ))
                ) : (
                featuredCategories.map((category: Category) => (
                    <CategoryCard key={category.id} category={category} />
                ))
                )}
            </div>
              <div className="text-center md:hidden">
                <Button asChild>
                    <Link href="/products">
                        {t('HomePage.viewAllCategories')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
          </div>
        </section>

        {/* Our Products Section */}
        <section className="bg-background py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center">
                  <h2 className="text-3xl font-bold font-headline">{t('HomePage.ourProducts')}</h2>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                          placeholder={t('Header.search')}
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                    <div className="flex items-center gap-2 pb-2 justify-center">
                      <Button
                          variant={!selectedCategory ? 'default' : 'outline'}
                          onClick={() => setSelectedCategory(null)}
                          className={cn("flex-shrink-0", !selectedCategory && "bg-primary text-primary-foreground")}
                      >
                          {t('HomePage.all')}
                      </Button>
                      {featuredCategories.map((category, index) => (
                          <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? 'default' : 'outline'}
                          onClick={() => setSelectedCategory(category.id)}
                          className={cn("flex-shrink-0", selectedCategory === category.id && (index % 2 === 0 ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"))}
                          >
                          {category.name}
                          </Button>
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-[175px] w-full rounded-xl" />
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                      </div>
                      </div>
                  ))
                  ) : (
                  filteredProducts.map((product: Product) => (
                      <ProductCard key={product.id} product={product} />
                  ))
                  )}
              </div>
              <div className="text-center pt-4">
                  <Button asChild variant="outline">
                      <Link href="/products">
                          {t('HomePage.viewAllProducts')} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                  </Button>
              </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="bg-card py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard icon={<Package size={32} />} title={t('HomePage.productsLive')} value="120+" animationClass="animate-spin-slow" />
                <FeatureCard icon={<ShoppingCart size={32} />} title={t('HomePage.transactionsCompleted')} value="15k+" animationClass="animate-spin-slow" />
                <FeatureCard icon={<LifeBuoy size={32} />} title={t('HomePage.dedicatedSupport')} value="24/7" animationClass="animate-spin-slow" />
            </div>
          </div>
        </section>
        
        {/* Reviews Section */}
        <section className="bg-background py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-headline">{t('HomePage.customerReviewsTitle')}</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{t('HomePage.customerReviewsSubtitle')}</p>
            </div>
            
            {loading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-80 w-full rounded-xl" />
                    ))}
                  </div>
            ) : (
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-5xl mx-auto"
                >
                    <CarouselContent>
                        {reviews.map((review) => (
                        <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                                <ReviewCard review={review} />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden lg:flex" />
                    <CarouselNext className="hidden lg:flex" />
                </Carousel>
            )}

            <div className="text-center pt-4">
                <Button asChild>
                    <Link href="/reviews">
                        <MessageSquare className="mr-2" />
                        {t('HomePage.leaveReview')}
                    </Link>
                </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
