/**
 * Smart Journey Analytics Tracking Engine
 * Privacy-conscious, first-party event collection & Google Analytics 4 integration.
 */

export interface AnalyticsEventPayload {
  type: 
    | 'page_view'
    | 'whatsapp_click'
    | 'phone_click'
    | 'email_click'
    | 'book_now_click'
    | 'inquiry_submit'
    | 'tour_detail_click'
    | 'external_link_click'
    | 'cta_click'
    | 'custom_interaction';
  page?: string;
  title?: string;
  referrer?: string;
  source?: string;
  utm?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  metadata?: Record<string, any>;
  duration?: number;
}

// Generate or retrieve persistent anonymous visitor ID (Local Storage)
function getOrCreateVisitorId(): { visitorId: string; isNew: boolean } {
  if (typeof window === 'undefined') return { visitorId: 'server', isNew: false };
  try {
    let vid = localStorage.getItem('sj_analytics_vid');
    if (!vid) {
      vid = 'vid_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('sj_analytics_vid', vid);
      return { visitorId: vid, isNew: true };
    }
    return { visitorId: vid, isNew: false };
  } catch {
    return { visitorId: 'anon_' + Date.now(), isNew: false };
  }
}

// Generate or retrieve session ID (Session Storage - expires on browser close)
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    let sid = sessionStorage.getItem('sj_analytics_sid');
    const lastActive = Number(sessionStorage.getItem('sj_analytics_last_active') || 0);
    const now = Date.now();

    // 30-minute session expiry window
    if (!sid || (now - lastActive > 30 * 60 * 1000)) {
      sid = 'sid_' + Math.random().toString(36).substring(2, 9) + '_' + now.toString(36);
      sessionStorage.setItem('sj_analytics_sid', sid);
    }
    sessionStorage.setItem('sj_analytics_last_active', String(now));
    return sid;
  } catch {
    return 'session_' + Date.now();
  }
}

// Parse UTM parameters from current URL
function parseUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
    const val = params.get(key);
    if (val) utm[key] = val;
  });
  return utm;
}

// Determine high-level marketing traffic source
function detectTrafficSource(referrer: string, utmSource?: string): string {
  if (utmSource) {
    const s = utmSource.toLowerCase();
    if (s.includes('google')) return 'Google';
    if (s.includes('instagram') || s.includes('ig')) return 'Instagram';
    if (s.includes('whatsapp') || s.includes('wa')) return 'WhatsApp';
    if (s.includes('facebook') || s.includes('fb')) return 'Facebook';
    if (s.includes('12go')) return '12Go';
    if (s.includes('tiktok')) return 'TikTok';
    return utmSource;
  }

  if (!referrer || referrer === '') return 'Direct';
  
  const ref = referrer.toLowerCase();
  if (ref.includes('google.')) return 'Google';
  if (ref.includes('instagram.com')) return 'Instagram';
  if (ref.includes('whatsapp.com') || ref.includes('api.whatsapp')) return 'WhatsApp';
  if (ref.includes('facebook.com') || ref.includes('fb.com')) return 'Facebook';
  if (ref.includes('12go.asia') || ref.includes('12go.co')) return '12Go';
  if (ref.includes('tiktok.com')) return 'TikTok';
  if (ref.includes('tripadvisor')) return 'TripAdvisor';
  if (ref.includes('klook')) return 'Klook';
  if (ref.includes('getyourguide')) return 'GetYourGuide';
  if (ref.includes('bing.com') || ref.includes('yahoo.com')) return 'Search Engine';

  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Referral';
  }
}

// Detect simple device category
function detectDeviceCategory(): 'Mobile' | 'Tablet' | 'Desktop' {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Core queue dispatcher with debounce and sendBeacon fallback
let eventQueue: any[] = [];
let flushTimeout: any = null;

function flushQueue() {
  if (eventQueue.length === 0) return;
  const batch = [...eventQueue];
  eventQueue = [];

  const payload = JSON.stringify({ events: batch });

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const sent = navigator.sendBeacon('/api/analytics/collect', new Blob([payload], { type: 'application/json' }));
    if (sent) return;
  }

  fetch('/api/analytics/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true
  }).catch(() => {
    // Non-blocking silent catch: analytics should never break user interactions
  });
}

function queueEvent(event: any) {
  eventQueue.push(event);
  if (flushTimeout) clearTimeout(flushTimeout);
  
  if (eventQueue.length >= 5) {
    flushQueue();
  } else {
    flushTimeout = setTimeout(flushQueue, 1500);
  }
}

// Flush queue on tab close or page hide
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushQueue();
    }
  });
  window.addEventListener('beforeunload', () => {
    flushQueue();
  });
}

/**
 * Primary Analytics Track Function
 */
export function trackEvent(payload: AnalyticsEventPayload) {
  if (typeof window === 'undefined') return;

  const { visitorId, isNew } = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();
  const utm = parseUTMParams();
  const referrer = document.referrer || '';
  const source = detectTrafficSource(referrer, utm.utm_source);
  const device = detectDeviceCategory();

  const enrichedEvent = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
    type: payload.type,
    page: payload.page || window.location.pathname || '/',
    title: payload.title || document.title || 'Smart Journey',
    referrer,
    source,
    utm: Object.keys(utm).length > 0 ? utm : undefined,
    device,
    visitorId,
    sessionId,
    isNewVisitor: isNew,
    metadata: payload.metadata || {},
    duration: payload.duration || 0,
    timestamp: new Date().toISOString()
  };

  queueEvent(enrichedEvent);

  // Optional Google Analytics 4 (GA4) dispatch if gtag is present
  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', payload.type, {
        page_path: enrichedEvent.page,
        page_title: enrichedEvent.title,
        traffic_source: source,
        ...payload.metadata
      });
    }
  } catch {
    // Graceful ignore
  }
}

/**
 * Page View Tracker
 */
let lastTrackedPage = '';
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (lastTrackedPage === pagePath) return; // Prevent duplicate immediate pings
  lastTrackedPage = pagePath;

  trackEvent({
    type: 'page_view',
    page: pagePath,
    title: pageTitle || document.title || 'Smart Journey'
  });
}

/**
 * WhatsApp Click Tracker
 */
export function trackWhatsAppClick(location: string, contactNumber?: string) {
  trackEvent({
    type: 'whatsapp_click',
    metadata: {
      location,
      contactNumber: contactNumber || '+6281234567890',
      action: 'WhatsApp Consultation Initiated'
    }
  });
}

/**
 * Phone / Call Click Tracker
 */
export function trackPhoneClick(phoneNumber: string, location: string) {
  trackEvent({
    type: 'phone_click',
    metadata: {
      phoneNumber,
      location,
      action: 'Phone Call Click'
    }
  });
}

/**
 * Email Click Tracker
 */
export function trackEmailClick(email: string, location: string) {
  trackEvent({
    type: 'email_click',
    metadata: {
      email,
      location,
      action: 'Email Contact Click'
    }
  });
}

/**
 * Book Now Click Tracker
 */
export function trackBookNowClick(productName: string, serviceType: string, productId?: string) {
  trackEvent({
    type: 'book_now_click',
    metadata: {
      productName,
      serviceType,
      productId: productId || productName,
      action: 'Book Now Initiated'
    }
  });
}

/**
 * Inquiry / Form Submission Tracker
 */
export function trackInquirySubmit(serviceName: string, details?: Record<string, any>) {
  trackEvent({
    type: 'inquiry_submit',
    metadata: {
      serviceName,
      ...details,
      action: 'Customer Inquiry Submitted'
    }
  });
}

/**
 * Tour Detail View Tracker
 */
export function trackTourDetailView(tourTitle: string, tourId: string, tourCategory?: string) {
  trackEvent({
    type: 'tour_detail_click',
    metadata: {
      tourTitle,
      tourId,
      tourCategory: tourCategory || 'Tour Package',
      action: 'Tour Detail Inspected'
    }
  });
}

/**
 * External Link Tracker (e.g. TripAdvisor, Partner platforms)
 */
export function trackExternalLink(url: string, label: string) {
  trackEvent({
    type: 'external_link_click',
    metadata: {
      url,
      label,
      action: 'External Partner / Booking Link Click'
    }
  });
}

/**
 * General CTA Button Click Tracker
 */
export function trackCtaClick(buttonName: string, sectionLocation: string) {
  trackEvent({
    type: 'cta_click',
    metadata: {
      buttonName,
      sectionLocation,
      action: 'General CTA Click'
    }
  });
}
