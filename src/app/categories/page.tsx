

'use client';

import { getCategories } from '@/services/categoryService';
import type { Category } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageWrapper } from '@/components/PageWrapper';
import { CategoryCard } from '@/components/CategoryCard';
import { PageHeader } from '@/components/PageHeader';

export default function CategoriesPage() {
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
      <PageHeader pageKey="categories" />

      <PageWrapper>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
            ))
          ) : (
            categories.map((category: Category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
        {!loading && categories.length === 0 && (
          <div className="text-center py-16 col-span-full">
            <p className="text-xl font-semibold">No categories found</p>
            <p className="text-muted-foreground mt-2">Check back later for more categories.</p>
          </div>
        )}
      </PageWrapper>
    </div>
  );
}
