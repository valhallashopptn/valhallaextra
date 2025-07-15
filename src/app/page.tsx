
'use client';

import { useEffect, useState } from 'react';
import { getCategories } from '@/services/categoryService';
import type { Category } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href="/products" className="group block [perspective:1000px]">
      <div className="relative h-full rounded-xl shadow-md transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <div className="absolute inset-0">
          <Image
            src={category.imageUrl || 'https://placehold.co/600x400.png'}
            alt={category.name}
            fill
            className="rounded-xl object-cover"
            data-ai-hint="game category"
          />
           <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
             <h3 className="text-2xl font-bold text-white">{category.name}</h3>
           </div>
        </div>
        <div className="absolute inset-0 h-full w-full rounded-xl bg-card text-center text-slate-200 [transform:rotateY(180deg)] [backface-visibility:hidden]">
           <Card className="h-full flex flex-col justify-center items-center bg-secondary">
             <CardHeader>
                <CardTitle>{category.name}</CardTitle>
             </CardHeader>
             <CardContent>
                <p>Browse all {category.name} products.</p>
             </CardContent>
           </Card>
        </div>
      </div>
    </Link>
  );
}


export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoriesFromDb = await getCategories();
        setCategories(categoriesFromDb);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
          Welcome to TopUp Hub
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
          Your one-stop shop for instant game top-ups. Fast, secure, and reliable.
        </p>
      </div>

       <div className="space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">Browse by Category</h2>
            <p className="text-muted-foreground mt-2">Select a category to find your favorite game top-ups.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-[250px]">
            {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-full w-full rounded-xl" />
            ))
            ) : (
            categories.map((category: Category) => (
                <CategoryCard key={category.id} category={category} />
            ))
            )}
        </div>
       </div>
    </div>
  );
}
