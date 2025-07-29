
'use client';

import type { Category } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';

export function CategoryCard({ category }: { category: Category }) {
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
               {category.featured && (
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground shadow-lg">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                </Badge>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-xl font-bold text-white text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {category.name}
                  </h3>
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
                <div className="absolute inset-0 bg-black/80"></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-sm mt-2">{category.description}</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
