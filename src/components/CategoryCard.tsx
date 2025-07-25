
'use client';

import type { Category } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="bg-black/50 backdrop-blur-sm p-2 rounded-md">
                      <h3 className="text-xl font-bold text-white text-center">{category.name}</h3>
                  </div>
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
