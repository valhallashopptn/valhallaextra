

'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCategories } from '@/services/categoryService';
import type { Category, Product, Review, HomePageFeaturesContent, UserProfile, SocialLink } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Package, ShoppingCart, LifeBuoy, Star, MessageSquare, Trophy, Filter, Check } from 'lucide-react';
import { getProducts } from '@/services/productService';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSetting, getSettings } from '@/services/settingsService';
import { Separator } from '@/components/ui/separator';
import { getAllReviews } from '@/services/reviewService';
import { getTopUsers } from '@/services/walletService';
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
import { CategoryCard } from '@/components/CategoryCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SocialSidePanel } from '@/components/SocialSidePanel';


function FeatureCard({ icon, title, value, animationClass }: { icon: React.ReactNode, title: string, value: string, animationClass?: string }) {
  return (
    <Card className="bg-background/30 backdrop-blur-sm border-primary/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/20">
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className={cn("text-primary", animationClass)}>
          <div className="p-4 rounded-full bg-primary/10">
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
    const username = review.username || 'Anonymous';
    return (
        <Card className="flex flex-col text-center h-full">
            <CardContent className="p-8 flex flex-col flex-grow items-center">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={review.userAvatarUrl} />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h4 className="text-xl font-bold font-headline">{username}</h4>
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

const defaultFeaturesContent: HomePageFeaturesContent = {
    title: 'Why Choose TopUp Hub?',
    subtitle: 'We are committed to providing a fast, secure, and reliable service for all your digital needs.',
    features: [
        { id: 'feature_1', title: 'Products Live', value: '120+' },
        { id: 'feature_2', title: 'Transactions Completed', value: '15k+' },
        { id: 'feature_3', title: 'Dedicated Support', value: '24/7' },
    ],
};

const featureIcons: { [key: string]: React.ReactNode } = {
    feature_1: <Package size={32} />,
    feature_2: <ShoppingCart size={32} />,
    feature_3: <LifeBuoy size={32} />,
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [featuresContent, setFeaturesContent] = useState<HomePageFeaturesContent>(defaultFeaturesContent);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesFromDb, productsFromDb, reviewsFromDb, topUsersFromDb, settings] = await Promise.all([
            getCategories(),
            getProducts(),
            getAllReviews(),
            getTopUsers(3),
            getSettings(['heroImageUrl', 'homePageFeatures', 'socialLinks'])
        ]);
        setCategories(categoriesFromDb);
        setProducts(productsFromDb);
        setReviews(reviewsFromDb);
        setTopUsers(topUsersFromDb);
        setSocialLinks(settings.socialLinks || []);
        setHeroImageUrl(settings.heroImageUrl || 'https://placehold.co/1920x1080.png?text=TopUp+Hub');
        setFeaturesContent(settings.homePageFeatures || defaultFeaturesContent);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const featuredCategories = useMemo(() => categories.filter(c => c.featured), [categories]);
  const nonFeaturedCategories = useMemo(() => categories.filter(c => !c.featured), [categories]);

  const displayCategories = useMemo(() => {
    // Show featured first, then fill up to 5 with non-featured
    const cats = [...featuredCategories, ...nonFeaturedCategories];
    return cats.slice(0, 5);
  }, [featuredCategories, nonFeaturedCategories]);


  const filteredProducts = useMemo(() => {
    let prods = products;
    if (searchQuery) {
        prods = prods.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedCategory) {
        prods = prods.filter(p => p.categoryId === selectedCategory);
    }
    return prods;
  }, [products, searchQuery, selectedCategory]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return t('HomePage.all');
    return categories.find(c => c.id === selectedCategory)?.name || t('HomePage.all');
  }, [selectedCategory, categories, t]);


  return (
    <>
      <SocialSidePanel socialLinks={socialLinks} />
      <div className="space-y-16 pb-16">
        {/* Hero Section */}
        <section className="relative h-[400px] md:h-[500px] overflow-hidden -mt-16">
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
        
        {/* Browse by Category Section */}
        <section className="bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="relative text-center md:text-left">
              <h2 className="text-3xl font-bold font-headline text-center">{t('HomePage.browseByCategory')}</h2>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 hidden md:block">
                <Button variant="outline" asChild>
                    <Link href="/categories">
                        {t('HomePage.viewAllCategories')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
              </div>
            </div>
            
            {/* Desktop Category Grid */}
            <div className="hidden lg:grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
                ))
                ) : (
                displayCategories.map((category: Category) => (
                    <CategoryCard key={category.id} category={category} />
                ))
                )}
            </div>

            {/* Mobile Category Carousel */}
            <div className="lg:hidden">
              {loading ? (
                <div className="flex space-x-4 overflow-hidden">
                  {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[3/4] w-2/3 flex-shrink-0 rounded-xl" />
                  ))}
                </div>
              ) : (
                <Carousel opts={{ align: "start" }} className="w-full">
                  <CarouselContent className="-ml-2">
                    {categories.map((category) => (
                      <CarouselItem key={category.id} className="basis-2/3 pl-2">
                        <CategoryCard category={category} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              )}
            </div>

            <div className="text-center md:hidden">
                <Button asChild>
                    <Link href="/categories">
                        {t('HomePage.viewAllCategories')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animated-separator"></div>
        </div>
        
        {/* Our Products Section */}
        <section className="bg-background">
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
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full md:w-auto">
                              <Filter className="mr-2 h-4 w-4" />
                              <span>{selectedCategoryName}</span>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setSelectedCategory(null)}>
                            <div className="flex items-center justify-between w-full">
                                <span>{t('HomePage.all')}</span>
                                {!selectedCategory && <Check className="h-4 w-4" />}
                            </div>
                          </DropdownMenuItem>
                          {categories.map((category) => (
                            <DropdownMenuItem key={category.id} onSelect={() => setSelectedCategory(category.id)}>
                               <div className="flex items-center justify-between w-full">
                                <span>{category.name}</span>
                                {selectedCategory === category.id && <Check className="h-4 w-4" />}
                               </div>
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>

              {/* Desktop Product Grid */}
              <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  filteredProducts.slice(0, 8).map((product: Product) => (
                      <ProductCard key={product.id} product={product} />
                  ))
                  )}
              </div>
              
              {/* Mobile Product Carousel */}
               <div className="sm:hidden">
                  {loading ? (
                    <div className="flex space-x-4 overflow-hidden">
                      {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-80 w-5/6 flex-shrink-0 rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <Carousel opts={{ align: "start" }} className="w-full">
                      <CarouselContent className="-ml-4">
                        {filteredProducts.slice(0, 6).map((product) => (
                          <CarouselItem key={product.id} className="basis-5/6 pl-4">
                            <ProductCard product={product} />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animated-separator"></div>
        </div>

        {/* Features Section */}
        <section className="bg-card py-16 -my-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-headline">{featuresContent.title}</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{featuresContent.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuresContent.features.map(feature => (
                     <FeatureCard 
                        key={feature.id} 
                        icon={featureIcons[feature.id] || <Package size={32} />} 
                        title={feature.title} 
                        value={feature.value} 
                        animationClass="animate-spin-slow" />
                ))}
            </div>
          </div>
        </section>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animated-separator"></div>
        </div>

        {/* Reviews Section */}
        <section className="bg-background">
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
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animated-separator"></div>
        </div>

        {/* Leaderboard Section */}
        <section>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold font-headline">Join the Ranks</h2>
                <p className="text-muted-foreground mt-2 max-w-xl">Compete with other players, earn XP with every purchase, and climb to the top of the leaderboard!</p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center gap-4">
                 <div className="flex -space-x-4">
                    {topUsers.map((user, index) => (
                       <Avatar key={user.id} className={cn("h-16 w-16 border-4 border-card", index === 1 && "z-10 -translate-y-2 transform-gpu scale-110")}>
                           <AvatarImage src={user.avatarUrl} />
                           <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                       </Avatar>
                    ))}
                 </div>
                 <Button asChild size="lg">
                    <Link href="/leaderboard">
                        <Trophy className="mr-2" />
                        View Leaderboard
                    </Link>
                 </Button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
