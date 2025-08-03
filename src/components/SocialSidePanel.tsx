
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
    <div className="social-panel">
      <ul>
        {socialLinks.map((link) => (
          <li key={link.id}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
              <div className="social-link-text">{link.name}</div>
              <Image
                src={link.iconUrl}
                alt={link.name}
                width={32}
                height={32}
                className="social-icon"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
