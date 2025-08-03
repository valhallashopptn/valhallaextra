
'use client';

import type { SocialLink } from '@/lib/types';
import Image from 'next/image';

interface SocialSidePanelProps {
  socialLinks: SocialLink[];
}

export function SocialSidePanel({ socialLinks }: SocialSidePanelProps) {
  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="social-side-panel">
      {socialLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn"
          aria-label={link.name}
        >
          <Image
            src={link.iconUrl}
            alt={link.name}
            width={24}
            height={24}
            className="social-icon"
          />
          <span className="social-text">{link.name}</span>
        </a>
      ))}
    </div>
  );
}
