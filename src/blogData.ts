export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEORequirements {
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaDescription: string;
  seoTitle: string;
  slug: string;
  h1: string;
  h2: string[];
  h3: string[];
  imageAlt: string;
  internalLinkingSuggestions: string[];
  externalLinkingSuggestions: string[];
  schemaMarkupRecommendation: string;
  focusKeywordDensity?: string;
  keywordDensity?: string;
  relatedKeywords: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  category: string;
  destination: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
  author: string;
  keywords: string[];
  featured: boolean;
  heroImagePrompt: string;
  featuredImageAltText: string;
  
  // Detailed Content Sections
  introduction: string; // Min 250 words
  history: string;      // Min 250 words
  whyVisit: string;
  bestTimeToVisit: string;
  topAttractions: string;
  bestActivities: string;
  travelTips: string;
  weather: string;
  transportation: string;
  nearbyAttractions: string;
  foodToTry: string;
  localCulture: string;
  suggestedItinerary: string;
  faq: FAQItem[]; // 10 SEO Q&As
  conclusion: string;
  callToAction: string;
  gallery: string[]; // 8 image prompts starting with the destination name
  seoRequirements: SEORequirements;
  
  // Backwards compatibility for basic content array if any component uses it
  content: {
    sectionTitle: string;
    text: string;
  }[];
}

// Lazy loading / importing individual blog posts to prevent memory & token limit issues
import { bromoPost } from './blog/bromo';
import { tumpakSewuPost } from './blog/tumpaksewu';
import { ijenPost } from './blog/ijen';
import { surabayaPost } from './blog/surabaya';
import { malangPost } from './blog/malang';
import { banyuwangiPost } from './blog/banyuwangi';
import { baliPost } from './blog/bali';
import { ubudPost } from './blog/ubud';
import { uluwatuPost } from './blog/uluwatu';
import { lovinaPost } from './blog/lovina';
import { nusaPenidaPost } from './blog/nusapenida';
import { karangasemPost } from './blog/karangasem';

export const BLOG_POSTS: BlogPost[] = [
  bromoPost,
  tumpakSewuPost,
  ijenPost,
  surabayaPost,
  malangPost,
  banyuwangiPost,
  baliPost,
  ubudPost,
  uluwatuPost,
  lovinaPost,
  nusaPenidaPost,
  karangasemPost
];
