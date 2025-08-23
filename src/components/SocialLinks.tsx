
'use client';

import type { SocialLink } from '@/lib/types';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

interface SocialLinksProps {
  socialLinks?: SocialLink[] | null;
}

export function SocialLinks({ socialLinks }: SocialLinksProps) {
  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <TooltipProvider>
        {socialLinks.map((link) => (
          <Tooltip key={link.id}>
            <TooltipTrigger asChild>
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className="text-muted-foreground transition-transform hover:text-primary hover:scale-110"
              >
                <Image
                  src={link.iconUrl}
                  alt={link.name}
                  width={24}
                  height={24}
                />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{link.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
