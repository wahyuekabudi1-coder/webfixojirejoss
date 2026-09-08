export interface SocialMediaItem {
  id: 'instagram' | 'tiktok' | 'rednote' | 'linkedin';
  name: string;
  shortName: string;
  handle: string;
  url: string;
  category: string;
  color: string;
  hoverBg: string;
  borderColor: string;
  description: string;
}

export const DEFAULT_SOCIAL_MEDIA: SocialMediaItem[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'IG',
    handle: '@smartjourney.id',
    url: 'https://www.instagram.com/smartjourney.id',
    category: 'Visual & Story',
    color: '#E4405F',
    hoverBg: 'hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300',
    borderColor: 'border-pink-200',
    description: 'Follow our daily tour stories, travel inspirations, and customer moments in Bali & East Java.'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    shortName: 'TikTok',
    handle: '@smartjourney.id',
    url: 'https://www.tiktok.com/@smartjourney.id',
    category: 'Short Videos & Reels',
    color: '#000000',
    hoverBg: 'hover:bg-neutral-100 hover:text-neutral-950 hover:border-neutral-400',
    borderColor: 'border-neutral-200',
    description: 'Watch viral travel tips, scenic drone shots, volcano sunrise clips, and road trip guides.'
  },
  {
    id: 'rednote',
    name: 'Rednote (小红书)',
    shortName: 'Rednote',
    handle: 'Red ID: smartjourney.id',
    url: 'https://www.xiaohongshu.com/user/profile/smartjourney.id',
    category: 'Travel Guides & Lifestyle',
    color: '#FF2442',
    hoverBg: 'hover:bg-red-50 hover:text-red-600 hover:border-red-300',
    borderColor: 'border-red-200',
    description: 'Official Rednote (Xiaohongshu) travel guides, itinerary tips, and mainland traveler manifest services.'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    shortName: 'LinkedIn',
    handle: 'smartjourney.id',
    url: 'https://www.linkedin.com/company/smartjourney-id',
    category: 'B2B & Corporate',
    color: '#0A66C2',
    hoverBg: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300',
    borderColor: 'border-blue-200',
    description: 'Connect for corporate fleet leasing, agency partnerships, and business travel inquiries.'
  }
];

export function getStoredSocialMedia(): SocialMediaItem[] {
  if (typeof window === 'undefined') return DEFAULT_SOCIAL_MEDIA;
  try {
    const stored = localStorage.getItem('smartjourney_social_media');
    if (stored) {
      const parsed: SocialMediaItem[] = JSON.parse(stored);
      // Ensure all 4 platforms exist
      const ids = ['instagram', 'tiktok', 'rednote', 'linkedin'];
      const hasAll = ids.every(id => parsed.some((p: any) => p.id === id));
      if (hasAll && parsed.length >= 4) {
        // Upgrade legacy sawahjayatrans URLs if present
        const upgraded = parsed.map(item => {
          const matchDefault = DEFAULT_SOCIAL_MEDIA.find(d => d.id === item.id);
          if (matchDefault && (item.url.includes('sawahjayatrans') || item.handle.includes('sawahjayatrans'))) {
            return {
              ...item,
              url: matchDefault.url,
              handle: matchDefault.handle
            };
          }
          return item;
        });
        localStorage.setItem('smartjourney_social_media', JSON.stringify(upgraded));
        return upgraded;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored social media', e);
  }
  localStorage.setItem('smartjourney_social_media', JSON.stringify(DEFAULT_SOCIAL_MEDIA));
  return DEFAULT_SOCIAL_MEDIA;
}

export function saveStoredSocialMedia(items: SocialMediaItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('smartjourney_social_media', JSON.stringify(items));
    window.dispatchEvent(new Event('smartjourney_social_updated'));
  } catch (e) {
    console.error('Failed to save social media', e);
  }
}
