import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { SocialMediaItem, getStoredSocialMedia } from '../data/socialMediaData';

interface SocialMediaButtonsProps {
  variant?: 'compact' | 'footer' | 'cards' | 'pills';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SocialMediaButtons({
  variant = 'compact',
  className = '',
  size = 'md'
}: SocialMediaButtonsProps) {
  const [socials, setSocials] = useState<SocialMediaItem[]>(getStoredSocialMedia());

  useEffect(() => {
    const handleUpdate = () => {
      setSocials(getStoredSocialMedia());
    };
    window.addEventListener('smartjourney_social_updated', handleUpdate);
    return () => window.removeEventListener('smartjourney_social_updated', handleUpdate);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-9 h-9 rounded-xl text-sm',
    lg: 'w-10 h-10 rounded-xl text-base'
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5 h-5'
  }[size];

  const renderIcon = (id: string, iconClass: string) => {
    switch (id) {
      case 'instagram':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.63c.31 0 .61.05.9.15V9.39a6.34 6.34 0 0 0-.9-.07A6.34 6.34 0 0 0 3 15.66 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.34V8.72a8.18 8.18 0 0 0 3.91.97V6.69z" />
          </svg>
        );
      case 'rednote':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5.5" fill="#FF2442" />
            <text 
              x="12" 
              y="16" 
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
              fontSize="10" 
              fontWeight="900" 
              fill="#FFFFFF" 
              textAnchor="middle" 
              letterSpacing="0.4"
            >
              RED
            </text>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
          </svg>
        );
      default:
        return <ExternalLink className={iconClass} strokeWidth={2} />;
    }
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {socials.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${item.name} (${item.handle})`}
          title={`${item.name}: ${item.handle}`}
          className={`group ${sizeClasses} flex items-center justify-center bg-white border border-neutral-200/90 text-neutral-700 ${item.hoverBg} transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer shrink-0`}
        >
          <span 
            className="transition-transform duration-200 group-hover:scale-110 flex items-center justify-center"
            style={{ color: item.id === 'rednote' ? undefined : item.color }}
          >
            {renderIcon(item.id, iconSizes)}
          </span>
        </a>
      ))}
    </div>
  );
}

