
'use client';

import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import type { Product, Category } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/PageWrapper';
import { Input } from '@/components/ui/input';
import { Search, Filter, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryIdFromUrl = searchParams.get('category');
    if (categoryIdFromUrl) {
      setSelectedCategory(categoryIdFromUrl);
    }
    const searchQueryFromUrl = searchParams.get('q');
    if (searchQueryFromUrl) {
      setSearchQuery(searchQueryFromUrl);
    }

    const fetchInitialData = async () => {
      try {
        const [productsFromDb, categoriesFromDb] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsFromDb);
        setCategories(categoriesFromDb);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [searchParams]);
  
  const filteredProducts = useMemo(() => {
    let prods = products;
    if (searchQuery) {
        prods = prods.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    if (selectedCategory) {
      prods = prods.filter(p => p.categoryId === selectedCategory);
    }
    return prods;
  }, [products, selectedCategory, searchQuery]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return 'All Categories';
    return categories.find(c => c.id === selectedCategory)?.name || 'All Categories';
  }, [selectedCategory, categories]);

  return (
    <div className="space-y-12">
      <div className="bg-card py-12">
        <PageWrapper>
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
              All Products
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
              Instantly top up your favorite games. Fast, secure, and reliable service.
            </p>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper>
         <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search products by name..."
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
                                <span>All Categories</span>
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
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
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
            {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-16 col-span-full">
                    <p className="text-xl font-semibold">No products found</p>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
         </div>
      </PageWrapper>
    </div>
  );
}
