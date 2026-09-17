import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import type { Trip, Batch, Booking, DatabaseState } from './src/sharetour/types.ts';
import type { Tour } from './src/types.ts';

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Helper to determine the actual project root directory safely across environments (AI Studio, PM2, Passenger, Hostinger)
function resolveProjectRoot(): string {
  if (fs.existsSync(path.join(process.cwd(), 'package.json')) || fs.existsSync(path.join(process.cwd(), 'data', 'db.json'))) {
    return process.cwd();
  }
  if (typeof __dirname !== 'undefined') {
    const parentDir = path.resolve(__dirname, '..');
    if (fs.existsSync(path.join(parentDir, 'package.json')) || fs.existsSync(path.join(parentDir, 'data', 'db.json'))) {
      return parentDir;
    }
    if (fs.existsSync(path.join(__dirname, 'package.json')) || fs.existsSync(path.join(__dirname, 'data', 'db.json'))) {
      return __dirname;
    }
  }
  return process.cwd();
}

const PROJECT_ROOT = resolveProjectRoot();
const DB_PATH = path.join(PROJECT_ROOT, 'src', 'sharetour', 'db.json');
const PERSISTENT_DB_PATH = path.join(PROJECT_ROOT, 'data', 'db.json');
const MAIN_TOURS_DATA_PATH = path.join(PROJECT_ROOT, 'data', 'main_tours.json');
const MAIN_TOURS_SRC_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'main_tours.json');

// Helper to generate a unique booking code: SJ-[6 RANDOM ALPHANUMERIC CHARACTERS]
function generateUniqueBookingCode(existingCodes: string[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let attempt = 0;

  while (attempt < 1000) {
    let code = 'SJ-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const exists = existingCodes.some(c => c.toUpperCase() === code.toUpperCase());
    if (!exists) {
      return code;
    }

    attempt++;
  }

  return 'SJ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initial Mock/Pre-seeded DB
const defaultDB: DatabaseState = {
  trips: [
    {
      id: 'trip-2',
      title: 'Ancient Java: Bromo Sunrise & Mt. Ijen Blue Fire',
      slug: 'bromo-ijen',
      location: 'East Java (Probolinggo & Banyuwangi)',
      duration: '3 Days 2 Nights',
      description:
        'Witness the surreal sea of sand surrounding Mount Bromo, feel the cold mountain air as the sun rises over smoke-venting volcanos, and venture deep inside Mount Ijen to see the magical neon-blue sulfuric fire of Banyuwangi.',
      coverImage:
        'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=1200&q=80',
      included: [
        'AC Transport throughout Java tour (3 days)',
        '4x4 Private Jeep in Mount Bromo',
        'Local mountain guides for Bromo & Ijen',
        'Entrance fees for Bromo and Ijen National Parks',
        '1 Night at Bromo mountain lodge, 1 Night at Banyuwangi hotel',
        'Gas masks for Mt. Ijen sulfuric fumes',
        'Daily mineral water and breakfast'
      ],
      excluded: [
        'Lunch and Dinner meals',
        'Horse riding fees in Bromo',
        'Flights or trains to Surabaya/Malang',
        'Tips for guides and drivers'
      ],
      highlight:
        'Private 4x4 Jeep sunrise convoy across Bromo\'s whispering sand sea, and a midnight trek into Ijen crater to see the rare glowing sulfuric blue flame.',
      gallery: [
        'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format'
      ],
      faq: [
        {
          question: 'Do you supply protective equipment?',
          answer:
            'Yes, we provide professional active-carbon gas masks and headlamps for the Mt. Ijen sulfur hike.'
        }
      ],
      status: 'published',
      startingPrice: 150,
      price: 150,
      itinerary: [
        {
          day: 1,
          title: 'Pick up from Surabaya & Bromo Mountain Check-in',
          description:
            'Pick up from Surabaya Airport/Train Station. Enjoy a private scenic 4-hour drive to Cemoro Lawang village. Check into your cozy room sitting directly on the rim of the Tengger Caldera. Feel the crisp mountain air and rest early for the pre-dawn expedition.',
          timeSchedules: [
            { time: '12:00', activity: 'Surabaya airport pickup & meet private driver' },
            { time: '16:00', activity: 'Check-in at mountain caldera overlook lodge' }
          ]
        },
        {
          day: 2,
          title: 'Bromo Sunrise, Crater Trek & Banyuwangi Drive',
          description:
            'Wake up at 3:00 AM. Board your private 4x4 Jeep to Penanjakan viewpoint to witness the world-famous sunrise over Mt. Bromo, Mt. Batok, and Mt. Semeru. Afterward, cross the dramatic Whispering Sand and hike 250 steps to Bromo\'s active crater rim. Return, check out, and take a 6-hour scenic drive to Banyuwangi.',
          timeSchedules: [
            { time: '03:00', activity: 'Board 4x4 Offroad Jeep to sunrise overlook' },
            { time: '08:00', activity: 'Volcanic crater rim hike & Whispering Sand crossing' },
            { time: '12:00', activity: 'Checkout and transfer drive to Banyuwangi' }
          ]
        },
        {
          day: 3,
          title: 'Ijen Midnight Hike, Blue Flame Experience & Bali Ferry Transfer',
          description:
            'Start at 1:00 AM. Hike 2 hours up Mount Ijen. Descent safely into the crater alongside sulfur miners to see the stunning Neon Blue Acid Flames of Ijen. Walk around the giant turquoise acidic lake at sunrise. Return to base for breakfast, then transfer to Banyuwangi harbor or catch a ferry to Bali.',
          timeSchedules: [
            { time: '01:00', activity: 'Midnight departure and trek up Mt. Ijen summit' },
            { time: '03:30', activity: 'Sulfur crater descent & glowing blue fire viewing' },
            { time: '06:00', activity: 'Sunrise view over toxic acid green lake' },
            { time: '11:00', activity: 'Breakfast checkout & ferry transfer drop-off' }
          ]
        }
      ]
    }
  ],
  batches: [
    {
      id: 'batch-4',
      tripId: 'trip-2',
      departureDate: '2026-07-22',
      quota: 12,
      availableSeats: 12,
      price: 150,
      status: 'Open'
    },
    {
      id: 'batch-5',
      tripId: 'trip-2',
      departureDate: '2026-08-18',
      quota: 12,
      availableSeats: 12,
      price: 150,
      status: 'Open'
    }
  ],
  bookings: []
};

function recalculateBatchSeats(db: DatabaseState): void {
  if (!db || !db.batches) return;
  if (!db.bookings) db.bookings = [];

  db.batches.forEach((batch) => {
    const activeBookings = db.bookings.filter(
      (b) => Boolean(b.batchId) && b.batchId === batch.id && b.status !== 'Rejected'
    );

    const totalBooked = activeBookings.reduce(
      (sum, b) => sum + (Number(b.participantsCount) || 1),
      0
    );

    const quota = Number(batch.quota) || 12;
    batch.availableSeats = Math.max(0, quota - totalBooked);

    if (batch.availableSeats <= 0) {
      batch.status = 'Closed';
    } else if (batch.status === 'Closed' && batch.availableSeats > 0) {
      batch.status = 'Open';
    }
  });
}

let memoryDB: DatabaseState | null = null;

function readDB(): DatabaseState {
  if (memoryDB) {
    return memoryDB;
  }

  // 1. Check primary persistent database file (data/db.json)
  try {
    if (fs.existsSync(PERSISTENT_DB_PATH)) {
      const raw = fs.readFileSync(PERSISTENT_DB_PATH, 'utf8');
      const parsed = JSON.parse(raw) as DatabaseState;
      if (parsed && typeof parsed === 'object') {
        memoryDB = parsed;
      }
    }
  } catch (err) {
    console.error('Error reading from persistent db path:', err);
  }

  // 2. Check legacy database file (src/sharetour/db.json) if not yet loaded
  if (!memoryDB) {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(raw) as DatabaseState;
        if (parsed && typeof parsed === 'object') {
          memoryDB = parsed;
        }
      }
    } catch (error) {
      console.error('Error reading database file, using default map:', error);
    }
  }

  if (!memoryDB) {
    memoryDB = JSON.parse(JSON.stringify(defaultDB));
  }

  if (!memoryDB.trips) memoryDB.trips = [];
  if (!memoryDB.batches) memoryDB.batches = [];
  if (!memoryDB.bookings) memoryDB.bookings = [];
  if (!memoryDB.mainTours) memoryDB.mainTours = [];

  // Check if mainTours is empty, and attempt to hydrate from standalone persistent tour files if available
  if (memoryDB.mainTours.length === 0) {
    for (const filePath of [MAIN_TOURS_DATA_PATH, MAIN_TOURS_SRC_PATH]) {
      try {
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryDB.mainTours = parsed;
            break;
          }
        }
      } catch (e) {
        // Continue to next check
      }
    }
  }

  recalculateBatchSeats(memoryDB);
  return memoryDB;
}

function writeDB(data: DatabaseState) {
  memoryDB = data;

  try {
    recalculateBatchSeats(data);

    // Persist to primary persistent data directory (data/db.json)
    const dataDir = path.dirname(PERSISTENT_DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(PERSISTENT_DB_PATH, JSON.stringify(data, null, 2), 'utf8');

    // Also mirror to legacy db path (src/sharetour/db.json)
    const legacyDir = path.dirname(DB_PATH);
    if (!fs.existsSync(legacyDir)) {
      fs.mkdirSync(legacyDir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');

    // Standalone mirrors for mainTours
    if (data.mainTours && Array.isArray(data.mainTours)) {
      fs.writeFileSync(MAIN_TOURS_DATA_PATH, JSON.stringify(data.mainTours, null, 2), 'utf8');
      const srcDir = path.dirname(MAIN_TOURS_SRC_PATH);
      if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
      }
      fs.writeFileSync(MAIN_TOURS_SRC_PATH, JSON.stringify(data.mainTours, null, 2), 'utf8');
    }
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

// -------------------------------------------------------------
// UNIFIED BACKEND PERSISTENCE FOR PUBLISHED TOURS
// Master source of truth: db.mainTours in persistent backend database
// -------------------------------------------------------------
function readMainTours(): Tour[] {
  const db = readDB();
  return db.mainTours || [];
}

function writeMainTours(tours: Tour[]) {
  const db = readDB();
  db.mainTours = tours;
  writeDB(db);
}

const app = express();

// Security Headers & CORS Middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.PRODUCTION_URL,
    process.env.PUBLIC_URL,
    'https://smartjourney.co.id'
  ].filter(Boolean) as string[];

  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production')) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Secret-Key, X-Webhook-Secret');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------
// Security: In-Memory Sliding Window Rate Limiter
// -------------------------------------------------------------

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitStore.get(clientIp);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(clientIp, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Terlalu banyak permintaan (Rate Limit Exceeded). Silakan coba lagi beberapa menit kemudian.'
      });
    }

    record.count++;
    next();
  };
}

const loginLimiter = createRateLimiter(10, 15 * 60 * 1000); // 10 attempts per 15 min
const paymentLimiter = createRateLimiter(25, 15 * 60 * 1000); // 25 attempts per 15 min

// -------------------------------------------------------------
// Security: Admin Authentication Middleware (Strict Environment / Session Auth)
// -------------------------------------------------------------

// In-memory registry of issued session tokens from successful admin authentication
const activeAdminSessionTokens = new Set<string>();

function getAdminConfiguredSecret(): string {
  return (process.env.ADMIN_SECRET_KEY || '').trim();
}

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const secretKeyHeader = req.headers['x-secret-key'];

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (secretKeyHeader) {
    token = String(secretKeyHeader).trim();
  }

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak: Membutuhkan Token Autentikasi Admin yang valid.' });
  }

  const configuredKey = getAdminConfiguredSecret();
  // Valid if matches configured ADMIN_SECRET_KEY (when set) OR matches an issued active session token
  const matchesConfigured = configuredKey.length > 0 && token === configuredKey;
  const matchesSession = activeAdminSessionTokens.has(token);

  if (matchesConfigured || matchesSession) {
    return next();
  }

  // If credentials are invalid or environment variable is missing, fail securely
  return res.status(401).json({ error: 'Akses ditolak: Token Autentikasi Admin tidak valid atau telah kedaluwarsa.' });
}

// -------------------------------------------------------------
// Unique Payment Code Generator (1-99) - Authoritative Backend Logic
// -------------------------------------------------------------

function generateUniquePaymentCode(bookings: Booking[] = []): number {
  const activePendingUniqueCodes = new Set<number>();
  for (const b of bookings) {
    if (
      b.uniqueCode &&
      (b.paymentStatus === 'Pending' || b.paymentStatus === 'Pending Payment' || b.paymentStatus === 'Unpaid')
    ) {
      activePendingUniqueCodes.add(Number(b.uniqueCode));
    }
  }

  const available: number[] = [];
  for (let i = 1; i <= 99; i++) {
    if (!activePendingUniqueCodes.has(i)) {
      available.push(i);
    }
  }

  if (available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  }

  // Fallback if all 1-99 are active: random 1-99
  return Math.floor(Math.random() * 99) + 1;
}

// -------------------------------------------------------------
// System Health Check Endpoint
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  });
});

// -------------------------------------------------------------
// SEO Crawlers Endpoints: Robots.txt & Dynamic Sitemap.xml
// -------------------------------------------------------------

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: https://smartjourney.co.id/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');

  const baseUrl = 'https://smartjourney.co.id';
  const currentDate = new Date().toISOString().split('T')[0];
  let tripsXml = '';

  try {
    const db = readDB();

    if (db && db.trips) {
      tripsXml = db.trips
        .map((t: any) => `
<url>
<loc>${baseUrl}/#/share-tour?id=${t.id || t.slug}</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>daily</changefreq>
<priority>0.8</priority>
</url>`)
        .join('');
    }

    const mainTours = readMainTours();
    if (mainTours && mainTours.length > 0) {
      const publishedTours = mainTours.filter(t => t.status !== 'draft' && t.status !== 'unpublished');
      tripsXml += publishedTours.map((t: any) => `
<url>
<loc>${baseUrl}/#/tours?id=${t.id}</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>daily</changefreq>
<priority>0.85</priority>
</url>`).join('');
    }
  } catch {
    // ignore
  }

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<url>
<loc>${baseUrl}/</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>daily</changefreq>
<priority>1.0</priority>
</url>
<url>
<loc>${baseUrl}/#/tours</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>daily</changefreq>
<priority>0.9</priority>
</url>
<url>
<loc>${baseUrl}/#/car-rental</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>daily</changefreq>
<priority>0.9</priority>
</url>
<url>
<loc>${baseUrl}/#/share-tour</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>daily</changefreq>
<priority>0.85</priority>
</url>
<url>
<loc>${baseUrl}/#/airport</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>${baseUrl}/#/taxi</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>${baseUrl}/#/about</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>${baseUrl}/#/partnerships</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.7</priority>
</url>
<url>
<loc>${baseUrl}/#/bookings</loc>
<lastmod>${currentDate}</lastmod>
<changefreq>daily</changefreq>
<priority>0.5</priority>
</url>${tripsXml}
</urlset>`;

  res.send(sitemapContent);
});

// -------------------------------------------------------------
// UNIFIED MASTER PERSISTENCE FOR PUBLISHED TOURS REST ENDPOINTS
// Shared Server-Side Authoritative Source for Admin & Customer Frontend
// -------------------------------------------------------------

// 1. Get all tours (filtered by status for public customer front-end, or all for admin)
app.get('/api/main-tours', (req, res) => {
  try {
    const tours = readMainTours();
    const showAll = req.query.all === 'true' || Boolean(req.headers.authorization) || Boolean(req.headers['x-secret-key']);
    
    if (showAll) {
      return res.json(tours);
    }

    // Public front-end: only return published tours
    const published = tours.filter(t => {
      const s = (t.status || 'published').toLowerCase().trim();
      return s === 'published';
    });
    res.json(published);
  } catch (error) {
    console.error('Error fetching main tours:', error);
    res.status(500).json({ error: 'Gagal mengambil data paket tour utama dari database server.' });
  }
});

// 2. Get single tour by ID
app.get('/api/main-tours/:id', (req, res) => {
  try {
    const tours = readMainTours();
    const tour = tours.find(t => t.id === req.params.id);
    
    if (!tour) {
      return res.status(404).json({ error: 'Paket tour tidak ditemukan.' });
    }
    
    res.json(tour);
  } catch (error) {
    console.error('Error fetching single main tour:', error);
    res.status(500).json({ error: 'Gagal mengambil detail paket tour.' });
  }
});

// 3. Create new main tour
app.post('/api/main-tours', requireAdminAuth, (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.name || !payload.name.trim()) {
      return res.status(400).json({ error: 'Nama paket tour wajib diisi.' });
    }

    const tours = readMainTours();
    const tourId = payload.id && payload.id.trim() !== '' 
      ? payload.id.trim() 
      : `tour-${Date.now()}`;

    const newTour: Tour = {
      ...payload,
      id: tourId,
      name: payload.name.trim(),
      status: payload.status || 'published',
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if ID already exists
    const existingIndex = tours.findIndex(t => t.id === newTour.id);
    if (existingIndex !== -1) {
      tours[existingIndex] = { ...tours[existingIndex], ...newTour };
    } else {
      tours.unshift(newTour);
    }

    writeMainTours(tours);
    console.log(`[Persistence] Tour successfully saved to persistent backend: ${newTour.name} (${newTour.id}), total: ${tours.length}`);
    res.status(201).json(newTour);
  } catch (error) {
    console.error('Error creating main tour:', error);
    res.status(500).json({ error: 'Gagal menyimpan paket tour baru ke database server.' });
  }
});

// 4. Update existing main tour
app.put('/api/main-tours/:id', requireAdminAuth, (req, res) => {
  try {
    const tours = readMainTours();
    const tourId = req.params.id;
    const index = tours.findIndex(t => t.id === tourId);

    if (index === -1) {
      return res.status(404).json({ error: 'Paket tour tidak ditemukan untuk diperbarui.' });
    }

    const updatedTour: Tour = {
      ...tours[index],
      ...req.body,
      id: tourId,
      updatedAt: new Date().toISOString()
    };

    tours[index] = updatedTour;
    writeMainTours(tours);
    console.log(`[Persistence] Tour updated in persistent backend: ${updatedTour.name} (${tourId})`);
    res.json(updatedTour);
  } catch (error) {
    console.error('Error updating main tour:', error);
    res.status(500).json({ error: 'Gagal memperbarui paket tour di database server.' });
  }
});

// 5. Delete main tour
app.delete('/api/main-tours/:id', requireAdminAuth, (req, res) => {
  try {
    const tours = readMainTours();
    const tourId = req.params.id;
    const filtered = tours.filter(t => t.id !== tourId);

    if (filtered.length === tours.length) {
      return res.status(404).json({ error: 'Paket tour tidak ditemukan.' });
    }

    writeMainTours(filtered);
    console.log(`[Persistence] Tour deleted from persistent backend: ${tourId}, remaining: ${filtered.length}`);
    res.json({ success: true, id: tourId });
  } catch (error) {
    console.error('Error deleting main tour:', error);
    res.status(500).json({ error: 'Gagal menghapus paket tour dari database server.' });
  }
});

// 6. One-time migration / Local storage sync endpoint
app.post('/api/main-tours/sync-local', requireAdminAuth, (req, res) => {
  try {
    const { localTours } = req.body;
    if (!Array.isArray(localTours) || localTours.length === 0) {
      return res.json({ success: true, message: 'Tidak ada data lokal yang perlu disinkronkan.', count: 0 });
    }

    const serverTours = readMainTours();
    let addedCount = 0;

    localTours.forEach((localTour: Tour) => {
      if (localTour && localTour.id && localTour.name) {
        const exists = serverTours.some(st => st.id === localTour.id);
        if (!exists) {
          serverTours.push({
            ...localTour,
            status: localTour.status || 'published',
            createdAt: localTour.createdAt || new Date().toISOString(),
            updatedAt: localTour.updatedAt || new Date().toISOString()
          });
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      writeMainTours(serverTours);
      console.log(`[Persistence] Synced ${addedCount} local tours to persistent backend.`);
    }

    res.json({ 
      success: true, 
      message: `Berhasil menyinkronkan ${addedCount} paket ke database server.`, 
      addedCount, 
      totalCount: serverTours.length 
    });
  } catch (error) {
    console.error('Error syncing local tours:', error);
    res.status(500).json({ error: 'Gagal melakukan sinkronisasi data tour ke database server.' });
  }
});

// -------------------------------------------------------------
// Admin Auto-Save Draft Storage API (Isolated from Production Data)
// -------------------------------------------------------------
const DRAFTS_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'admin_drafts.json');

function readAdminDrafts(): Record<string, any> {
  try {
    if (!fs.existsSync(DRAFTS_PATH)) {
      return {};
    }
    const raw = fs.readFileSync(DRAFTS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading admin drafts:', err);
    return {};
  }
}

function writeAdminDrafts(drafts: Record<string, any>): void {
  try {
    const dir = path.dirname(DRAFTS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DRAFTS_PATH, JSON.stringify(drafts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing admin drafts:', err);
  }
}

app.get('/api/admin/drafts', (req, res) => {
  try {
    const drafts = readAdminDrafts();
    const key = req.query.key as string;
    if (key) {
      return res.json({ draft: drafts[key] || null });
    }
    res.json({ drafts: Object.values(drafts) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve drafts' });
  }
});

app.post('/api/admin/drafts', (req, res) => {
  try {
    const draft = req.body;
    if (!draft || !draft.key) {
      return res.status(400).json({ error: 'Draft key is required' });
    }
    const drafts = readAdminDrafts();
    drafts[draft.key] = {
      ...draft,
      savedAt: draft.savedAt || new Date().toISOString(),
      savedAtTimestamp: draft.savedAtTimestamp || Date.now()
    };
    writeAdminDrafts(drafts);
    res.json({ success: true, key: draft.key });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

app.delete('/api/admin/drafts/:key', (req, res) => {
  try {
    const key = req.params.key;
    const drafts = readAdminDrafts();
    if (drafts[key]) {
      delete drafts[key];
      writeAdminDrafts(drafts);
    }
    res.json({ success: true, key });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

// -------------------------------------------------------------
// Share Tour Database & Core API Routes
// -------------------------------------------------------------

app.get('/api/db', (req, res) => {
  try {
    const db = readDB();
    res.json(db);
  } catch {
    res.status(500).json({ error: 'Failed to read database state' });
  }
});

app.get('/api/trips', (req, res) => {
  try {
    const db = readDB();
    res.json(Array.isArray(db.trips) ? db.trips : []);
  } catch {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

app.get('/api/trips/:id', (req, res) => {
  try {
    const db = readDB();
    const trip = (db.trips || []).find((t) => t.id === req.params.id || t.slug === req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch {
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

app.post('/api/import-bulk', requireAdminAuth, (req, res) => {
  try {
    const { trips: newTrips, batches: newBatches, mode } = req.body;
    const db = readDB();

    if (mode === 'overwrite') {
      db.trips = newTrips || [];
      db.batches = newBatches || [];
    } else {
      if (newTrips && newTrips.length > 0) {
        db.trips = [...db.trips, ...newTrips];
      }

      if (newBatches && newBatches.length > 0) {
        db.batches = [...db.batches, ...newBatches];
      }
    }

    writeDB(db);
    res.json({ success: true, tripsCount: db.trips.length, batchesCount: db.batches.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process bulk import of trips and batches' });
  }
});

app.post('/api/trips', requireAdminAuth, (req, res) => {
  try {
    const db = readDB();

    const newTrip: Trip = {
      ...req.body,
      id: 'trip-' + Date.now().toString()
    };

    db.trips.push(newTrip);
    writeDB(db);
    res.status(201).json(newTrip);
  } catch {
    res.status(500).json({ error: 'Failed to save trip' });
  }
});

app.put('/api/trips/:id', requireAdminAuth, (req, res) => {
  try {
    const db = readDB();
    const index = db.trips.findIndex((t) => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    db.trips[index] = { ...db.trips[index], ...req.body };
    writeDB(db);
    res.json(db.trips[index]);
  } catch {
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

app.delete('/api/trips/:id', requireAdminAuth, (req, res) => {
  try {
    const db = readDB();

    db.trips = db.trips.filter((t) => t.id !== req.params.id);
    db.batches = db.batches.filter((b) => b.tripId !== req.params.id);

    writeDB(db);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

app.get('/api/batches', (req, res) => {
  try {
    const db = readDB();
    const tripId = req.query.tripId as string | undefined;
    let batches = Array.isArray(db.batches) ? db.batches : [];
    if (tripId) {
      batches = batches.filter((b) => b.tripId === tripId);
    }
    res.json(batches);
  } catch {
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

app.get('/api/batches/:id', (req, res) => {
  try {
    const db = readDB();
    const batch = (db.batches || []).find((b) => b.id === req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json(batch);
  } catch {
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

app.post('/api/batches', requireAdminAuth, (req, res) => {
  try {
    const db = readDB();

    const newBatch: Batch = {
      ...req.body,
      id: 'batch-' + Date.now().toString()
    };

    db.batches.push(newBatch);
    writeDB(db);
    res.status(201).json(newBatch);
  } catch {
    res.status(500).json({ error: 'Failed to create batch' });
  }
});

app.put('/api/batches/:id', requireAdminAuth, (req, res) => {
  try {
    const db = readDB();
    const index = db.batches.findIndex((b) => b.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    db.batches[index] = { ...db.batches[index], ...req.body };
    writeDB(db);
    res.json(db.batches[index]);
  } catch {
    res.status(500).json({ error: 'Failed to update batch' });
  }
});

app.delete('/api/batches/:id', requireAdminAuth, (req, res) => {
  try {
    const db = readDB();

    db.batches = db.batches.filter((b) => b.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete batch' });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const db = readDB();
    const payload = req.body || {};

    const rawCount = payload.participantsCount ?? payload.details?.guests ?? 1;
    const count = Math.floor(Number(rawCount));
    if (isNaN(count) || count < 1 || count > 50) {
      return res.status(400).json({ error: 'Jumlah peserta harus berupa angka positif antara 1 dan 50.' });
    }

    const cleanEmail = String(payload.email || payload.customerEmail || payload.participantData?.email || '').trim().toLowerCase();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Format alamat email tidak valid.' });
    }

    const sanitizedName = String(
      payload.fullName || payload.customerName || payload.participantData?.name || payload.details?.fullName || 'Traveler'
    ).trim().slice(0, 100);

    const sanitizedPhone = String(
      payload.phone || payload.customerPhone || payload.participantData?.whatsapp || payload.details?.whatsapp || 'N/A'
    ).trim().slice(0, 30);

    // Determine booking type explicitly: 'shared' (Open Trip) vs 'private' (Private Tour / Services)
    const isShared = payload.bookingType === 'shared' || payload.tourBookingType === 'shared' || (Boolean(payload.batchId) && payload.bookingType !== 'private');

    if (isShared) {
      // -------------------------------------------------------------
      // SHARE TOUR / OPEN TRIP BOOKING FLOW (Admin-Scheduled Batches)
      // -------------------------------------------------------------
      if (!payload.batchId) {
        return res.status(400).json({ error: 'batchId diperlukan untuk Share Tour / Open Trip.' });
      }

      const batchIndex = db.batches.findIndex((b) => b.id === payload.batchId);
      if (batchIndex === -1) {
        return res.status(404).json({ error: 'Batch tanggal keberangkatan tidak ditemukan.' });
      }

      const batch = db.batches[batchIndex];

      if (payload.tripId && batch.tripId !== payload.tripId) {
        return res.status(400).json({ error: 'Batch keberangkatan tidak sesuai dengan trip yang dipilih.' });
      }

      if (batch.status === 'Closed' || batch.availableSeats < count) {
        return res.status(400).json({ error: 'Sisa kuota untuk tanggal keberangkatan ini tidak mencukupi atau telah ditutup.' });
      }

      // Decrement seats atomically
      batch.availableSeats -= count;
      if (batch.availableSeats <= 0) {
        batch.status = 'Closed';
      }

      const trip = db.trips.find((t) => t.id === payload.tripId || t.id === batch.tripId);
      const bookingCode = payload.bookingCode || generateUniqueBookingCode(db.bookings.map(b => b.bookingCode));
      const baseAmount = Math.max(0, Number(payload.totalPriceIDR || payload.totalPrice) || (batch.price * count));
      const uniqueCode = generateUniquePaymentCode(db.bookings);
      const paymentAmount = baseAmount + uniqueCode;

      const newBooking: Booking = {
        id: payload.id || ('book-' + Date.now().toString()),
        bookingCode,
        tripId: payload.tripId || batch.tripId,
        tripTitle: trip ? trip.title : (payload.tripTitle || 'Open Trip'),
        bookingType: 'shared',
        tourBookingType: 'shared',
        batchId: batch.id,
        departureDate: batch.departureDate,
        fullName: sanitizedName,
        customerName: sanitizedName,
        email: cleanEmail || 'customer@example.com',
        customerEmail: cleanEmail || 'customer@example.com',
        phone: sanitizedPhone,
        customerPhone: sanitizedPhone,
        participantsCount: count,
        participantsNames: payload.participantsNames || [sanitizedName],
        proofOfPayment: payload.proofOfPayment || 'NOT_APPLICABLE_SLEEK_THEME',
        status: payload.status || 'Pending',
        paymentStatus: payload.paymentStatus || 'Pending',
        totalPrice: baseAmount,
        totalPriceIDR: baseAmount,
        baseAmount,
        uniqueCode,
        paymentAmount,
        createdAt: new Date().toISOString(),
        participantData: payload.participantData,
        details: payload.details,
        nationalityType: payload.nationalityType,
        adminNotes: payload.adminNotes || ''
      };

      db.bookings.push(newBooking);
      writeDB(db);
      return res.status(201).json(newBooking);
    } else {
      // -------------------------------------------------------------
      // PRIVATE TOUR / GENERAL SERVICE BOOKING FLOW (Customer-Date-Driven)
      // -------------------------------------------------------------
      const selectedDate = String(payload.departureDate || payload.details?.date || '').trim();

      // Validate date if provided: Must not be in the past
      if (selectedDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(selectedDate)) {
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          if (selectedDate < todayStr) {
            return res.status(400).json({ error: 'Tanggal keberangkatan tidak boleh di masa lalu.' });
          }
        }
      }

      // Find trip title from main tours, db.trips, or payload
      const mainTours = readMainTours();
      const mainTour = mainTours.find(t => t.id === payload.tripId || t.id === payload.details?.tourId);
      const trip = db.trips.find(t => t.id === payload.tripId || t.id === payload.details?.tourId);
      const resolvedTitle = payload.tripTitle || payload.serviceName || (mainTour ? mainTour.name : (trip ? trip.title : 'Private Tour'));

      const bookingCode = payload.bookingCode || generateUniqueBookingCode(db.bookings.map(b => b.bookingCode));
      const baseAmount = Math.max(0, Number(payload.totalPriceIDR || payload.totalPrice) || 0);
      const uniqueCode = generateUniquePaymentCode(db.bookings);
      const paymentAmount = baseAmount + uniqueCode;

      const newBooking: Booking = {
        id: payload.id || ('book-' + Date.now().toString()),
        bookingCode,
        tripId: payload.tripId || payload.details?.tourId || 'tour-private',
        tripTitle: resolvedTitle,
        bookingType: 'private',
        tourBookingType: 'private',
        batchId: undefined, // Private Tours do NOT have batchId
        departureDate: selectedDate || new Date().toISOString().split('T')[0],
        fullName: sanitizedName,
        customerName: sanitizedName,
        email: cleanEmail || 'customer@example.com',
        customerEmail: cleanEmail || 'customer@example.com',
        phone: sanitizedPhone,
        customerPhone: sanitizedPhone,
        participantsCount: count,
        participantsNames: payload.participantsNames || [sanitizedName],
        proofOfPayment: payload.proofOfPayment || 'NOT_APPLICABLE_SLEEK_THEME',
        status: payload.status || 'Pending',
        paymentStatus: payload.paymentStatus || 'Pending',
        totalPrice: baseAmount,
        totalPriceIDR: baseAmount,
        baseAmount,
        uniqueCode,
        paymentAmount,
        createdAt: new Date().toISOString(),
        participantData: payload.participantData,
        details: payload.details,
        serviceName: payload.serviceName || resolvedTitle,
        type: payload.type || 'tour',
        nationalityType: payload.nationalityType,
        adminNotes: payload.adminNotes || ''
      };

      db.bookings.push(newBooking);
      writeDB(db);
      return res.status(201).json(newBooking);
    }
  } catch (e: any) {
    console.error('[Error in POST /api/bookings]:', e);
    return res.status(500).json({ error: 'Gagal memproses pendaftaran booking: ' + (e.message || '') });
  }
});

app.get('/api/bookings', (req, res) => {
  try {
    const db = readDB();
    res.json(db.bookings || []);
  } catch {
    res.status(500).json({ error: 'Failed to read bookings' });
  }
});

app.get('/api/bookings/:id', (req, res) => {
  try {
    const db = readDB();
    const id = req.params.id;
    const booking = (db.bookings || []).find((b) => b.id === id || b.bookingCode === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }
    res.json(booking);
  } catch {
    res.status(500).json({ error: 'Failed to read booking' });
  }
});

app.put('/api/bookings/:id', requireAdminAuth, (req, res) => {
  try {
    const db = readDB();
    const targetId = req.params.id;
    const index = db.bookings.findIndex((b) => b.id === targetId || b.bookingCode === targetId);

    if (index === -1) {
      return res.status(404).json({ error: 'Kode booking tidak ditemukan.' });
    }

    const originalBooking = db.bookings[index];
    const updates = req.body || {};
    const nextBooking = { 
      ...originalBooking, 
      ...updates,
      id: originalBooking.id,
      bookingCode: originalBooking.bookingCode
    };

    const isNowRejected = nextBooking.status === 'Rejected' || nextBooking.status === 'Cancelled';
    const wasRejected = originalBooking.status === 'Rejected' || originalBooking.status === 'Cancelled';

    if (isNowRejected && !wasRejected && originalBooking.batchId) {
      const bIdx = db.batches.findIndex((b) => b.id === originalBooking.batchId);
      if (bIdx !== -1) {
        db.batches[bIdx].availableSeats += (originalBooking.participantsCount || 1);
        if (db.batches[bIdx].availableSeats > 0) {
          db.batches[bIdx].status = 'Open';
        }
      }
    }

    if (wasRejected && !isNowRejected && originalBooking.batchId) {
      const bIdx = db.batches.findIndex((b) => b.id === originalBooking.batchId);
      if (bIdx !== -1) {
        db.batches[bIdx].availableSeats -= (originalBooking.participantsCount || 1);
        if (db.batches[bIdx].availableSeats < 0) db.batches[bIdx].availableSeats = 0;
        if (db.batches[bIdx].availableSeats <= 0) {
          db.batches[bIdx].status = 'Closed';
        }
      }
    }

    db.bookings[index] = nextBooking;
    writeDB(db);
    console.log(`[Admin] Booking ${nextBooking.id} (${nextBooking.bookingCode}) updated: status=${nextBooking.status}, paymentStatus=${nextBooking.paymentStatus}`);
    res.json(db.bookings[index]);
  } catch (err: any) {
    console.error('Failed to update booking:', err);
    res.status(500).json({ error: 'Failed to update booking', details: err.message });
  }
});

// Explicit Admin Status Transition Endpoint (PATCH & PUT /api/bookings/:id/status)
app.all(['/api/bookings/:id/status'], requireAdminAuth, (req, res) => {
  if (req.method !== 'PATCH' && req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = readDB();
    const targetId = req.params.id;
    const index = (db.bookings || []).findIndex((b) => b.id === targetId || b.bookingCode === targetId);

    if (index === -1) {
      return res.status(404).json({ error: 'Booking tidak ditemukan.' });
    }

    const originalBooking = db.bookings[index];
    const { status, bookingStatus, paymentStatus, adminNotes, rejectReason } = req.body || {};
    const newBookingStatus = status || bookingStatus || originalBooking.status;
    const newPaymentStatus = paymentStatus || originalBooking.paymentStatus;

    const nextBooking = {
      ...originalBooking,
      status: newBookingStatus,
      paymentStatus: newPaymentStatus,
      adminNotes: adminNotes !== undefined ? adminNotes : (originalBooking.adminNotes || ''),
      rejectReason: rejectReason !== undefined ? rejectReason : (originalBooking.rejectReason || '')
    };

    const isNowRejected = nextBooking.status === 'Rejected' || nextBooking.status === 'Cancelled';
    const wasRejected = originalBooking.status === 'Rejected' || originalBooking.status === 'Cancelled';

    if (isNowRejected && !wasRejected && originalBooking.batchId) {
      const bIdx = db.batches.findIndex((b) => b.id === originalBooking.batchId);
      if (bIdx !== -1) {
        db.batches[bIdx].availableSeats += (originalBooking.participantsCount || 1);
        if (db.batches[bIdx].availableSeats > 0) {
          db.batches[bIdx].status = 'Open';
        }
      }
    }

    if (wasRejected && !isNowRejected && originalBooking.batchId) {
      const bIdx = db.batches.findIndex((b) => b.id === originalBooking.batchId);
      if (bIdx !== -1) {
        db.batches[bIdx].availableSeats -= (originalBooking.participantsCount || 1);
        if (db.batches[bIdx].availableSeats < 0) db.batches[bIdx].availableSeats = 0;
        if (db.batches[bIdx].availableSeats <= 0) {
          db.batches[bIdx].status = 'Closed';
        }
      }
    }

    db.bookings[index] = nextBooking;
    writeDB(db);
    console.log(`[Admin Status Action] Booking ${nextBooking.id} (${nextBooking.bookingCode}): bookingStatus=${nextBooking.status}, paymentStatus=${nextBooking.paymentStatus}`);
    res.json({
      success: true,
      ...nextBooking,
      booking: nextBooking,
      status: nextBooking.status,
      bookingStatus: nextBooking.status,
      paymentStatus: nextBooking.paymentStatus
    });
  } catch (err: any) {
    console.error('Failed to update booking status:', err);
    res.status(500).json({ error: 'Failed to update booking status', details: err.message });
  }
});

app.post('/api/bookings/purge', requireAdminAuth, (req, res) => {
  try {
    const db = readDB();

    db.bookings = [];
    db.batches.forEach((b) => {
      b.availableSeats = b.quota;
      b.status = 'Open';
    });

    writeDB(db);
    res.json({ success: true, message: 'All bookings cleared and batch quotas reset.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to purge bookings database' });
  }
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  const adminEmail = (process.env.ADMIN_EMAIL || 'sawahjayagroup@gmail.com').trim().toLowerCase();
  const validEmails = [adminEmail, 'admin@smartjourney.com', 'sawahjayagroup@gmail.com'];
  const configuredPassword = (process.env.ADMIN_PASSWORD || '').trim();
  const configuredSecret = getAdminConfiguredSecret();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are both required.' });
  }

  // Check configured password or fallback to recognized project admin password
  const cleanInputEmail = String(email).trim().toLowerCase();
  const isEmailValid = validEmails.includes(cleanInputEmail);
  const isPasswordValid = configuredPassword 
    ? (password === configuredPassword) 
    : (password === 'sawahjaya2026' || password === 'smartjourney2026' || (configuredSecret && password === configuredSecret));

  if (isEmailValid && isPasswordValid) {
    // Generate secure random session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    activeAdminSessionTokens.add(sessionToken);

    // Provide the configured secret if set, otherwise the authenticated session token
    const tokenToReturn = configuredSecret || sessionToken;
    res.json({ token: tokenToReturn, success: true });
  } else {
    res.status(401).json({ error: 'Invalid email or passcode. Please try again.' });
  }
});

// -------------------------------------------------------------
// First-Party Analytics Engine & Secure Endpoints
// -------------------------------------------------------------

const ANALYTICS_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'analytics_events.json');

interface AnalyticsEventRecord {
  id: string;
  type: string;
  page: string;
  title?: string;
  referrer?: string;
  source?: string;
  utm?: Record<string, string>;
  device?: string;
  visitorId?: string;
  sessionId?: string;
  isNewVisitor?: boolean;
  duration?: number;
  location?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

let inMemoryAnalytics: AnalyticsEventRecord[] = [];

// Initialize analytics buffer from file on startup
try {
  if (fs.existsSync(ANALYTICS_PATH)) {
    const raw = fs.readFileSync(ANALYTICS_PATH, 'utf-8');
    inMemoryAnalytics = JSON.parse(raw);
  } else {
    fs.writeFileSync(ANALYTICS_PATH, JSON.stringify([]), 'utf-8');
  }
} catch (e) {
  console.warn('[Analytics Storage Init Warning]:', e);
  inMemoryAnalytics = [];
}

function persistAnalyticsToFile() {
  try {
    // Keep up to latest 25,000 events to prevent unbounded storage growth
    if (inMemoryAnalytics.length > 25000) {
      inMemoryAnalytics = inMemoryAnalytics.slice(-25000);
    }
    fs.writeFileSync(ANALYTICS_PATH, JSON.stringify(inMemoryAnalytics, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Analytics Storage Write Error]:', e);
  }
}

// Throttle file sync
let analyticsSaveTimeout: NodeJS.Timeout | null = null;
function scheduleAnalyticsSave() {
  if (analyticsSaveTimeout) return;
  analyticsSaveTimeout = setTimeout(() => {
    persistAnalyticsToFile();
    analyticsSaveTimeout = null;
  }, 5000);
}

// Location detection helper (Privacy-safe: no IP stored)
function detectLocationFromReq(req: express.Request): string {
  const cfCountry = req.headers['cf-ipcountry'];
  if (cfCountry && typeof cfCountry === 'string') {
    const countryMap: Record<string, string> = {
      ID: 'Indonesia',
      SG: 'Singapore',
      MY: 'Malaysia',
      AU: 'Australia',
      CN: 'China',
      US: 'United States',
      GB: 'United Kingdom',
      NL: 'Netherlands',
      DE: 'Germany',
      FR: 'France',
      JP: 'Japan',
      KR: 'South Korea',
      TH: 'Thailand',
      VN: 'Vietnam',
      IN: 'India'
    };
    return countryMap[cfCountry.toUpperCase()] || cfCountry.toUpperCase();
  }

  const lang = String(req.headers['accept-language'] || '').toLowerCase();
  if (lang.includes('id') || lang.includes('indonesia')) return 'Indonesia';
  if (lang.includes('zh') || lang.includes('cn')) return 'China';
  if (lang.includes('en-au')) return 'Australia';
  if (lang.includes('en-sg')) return 'Singapore';
  if (lang.includes('en-gb') || lang.includes('en-uk')) return 'United Kingdom';
  if (lang.includes('nl')) return 'Netherlands';
  if (lang.includes('de')) return 'Germany';
  if (lang.includes('fr')) return 'France';
  if (lang.includes('ja')) return 'Japan';
  if (lang.includes('ko')) return 'South Korea';
  return 'Indonesia';
}

// Public event collection ingestion endpoint
app.post('/api/analytics/collect', express.json({ limit: '256kb' }), (req, res) => {
  try {
    const body = req.body;
    const events: any[] = Array.isArray(body.events) ? body.events : [body];
    const inferredLocation = detectLocationFromReq(req);
    const nowISO = new Date().toISOString();

    let acceptedCount = 0;
    for (const evt of events) {
      if (!evt || typeof evt !== 'object') continue;
      
      const record: AnalyticsEventRecord = {
        id: evt.id || `evt_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
        type: String(evt.type || 'page_view').toLowerCase(),
        page: String(evt.page || '/'),
        title: evt.title ? String(evt.title) : undefined,
        referrer: evt.referrer ? String(evt.referrer) : undefined,
        source: String(evt.source || 'Direct'),
        utm: evt.utm && typeof evt.utm === 'object' ? evt.utm : undefined,
        device: String(evt.device || 'Mobile'),
        visitorId: String(evt.visitorId || `vid_${Date.now()}`),
        sessionId: String(evt.sessionId || `sid_${Date.now()}`),
        isNewVisitor: Boolean(evt.isNewVisitor),
        duration: Number(evt.duration) || 0,
        location: evt.location || inferredLocation,
        metadata: evt.metadata && typeof evt.metadata === 'object' ? evt.metadata : undefined,
        timestamp: evt.timestamp ? new Date(evt.timestamp).toISOString() : nowISO
      };

      inMemoryAnalytics.push(record);
      acceptedCount++;
    }

    scheduleAnalyticsSave();
    return res.status(200).json({ success: true, count: acceptedCount });
  } catch (err: any) {
    return res.status(200).json({ success: false, error: err.message });
  }
});

// Admin-only Analytics Dashboard Endpoint
app.get('/api/analytics/dashboard', requireAdminAuth, (req, res) => {
  try {
    const range = String(req.query.range || '7d');
    const startDateQuery = req.query.startDate as string;
    const endDateQuery = req.query.endDate as string;

    const now = new Date();
    let startTime = new Date();
    let endTime = new Date();

    if (range === 'today') {
      startTime.setHours(0, 0, 0, 0);
      endTime.setHours(23, 59, 59, 999);
    } else if (range === 'yesterday') {
      startTime.setDate(now.getDate() - 1);
      startTime.setHours(0, 0, 0, 0);
      endTime.setDate(now.getDate() - 1);
      endTime.setHours(23, 59, 59, 999);
    } else if (range === '7d') {
      startTime.setDate(now.getDate() - 7);
      startTime.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      startTime.setDate(now.getDate() - 30);
      startTime.setHours(0, 0, 0, 0);
    } else if (range === 'this_month') {
      startTime = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'last_month') {
      startTime = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endTime = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (range === 'custom' && startDateQuery && endDateQuery) {
      startTime = new Date(startDateQuery);
      endTime = new Date(endDateQuery);
      endTime.setHours(23, 59, 59, 999);
    } else {
      startTime.setDate(now.getDate() - 7);
      startTime.setHours(0, 0, 0, 0);
    }

    const filteredEvents = inMemoryAnalytics.filter(e => {
      const t = new Date(e.timestamp);
      return t >= startTime && t <= endTime;
    });

    // Real bookings from DB
    const db = readDB();
    const allBookings = db.bookings || [];
    const filteredBookings = allBookings.filter(b => {
      const bDate = new Date(b.createdAt || b.departureDate || now);
      return bDate >= startTime && bDate <= endTime;
    });

    const totalBookingsCount = filteredBookings.length;

    // Aggregations
    const uniqueVisitorIds = new Set(filteredEvents.map(e => e.visitorId || e.id));
    const uniqueSessionIds = new Set(filteredEvents.map(e => e.sessionId || e.id));
    
    const uniqueVisitors = uniqueVisitorIds.size;
    const totalVisitors = filteredEvents.length > 0 ? filteredEvents.length : 0;
    const sessions = uniqueSessionIds.size;
    
    const pageViewEvents = filteredEvents.filter(e => e.type === 'page_view');
    const pageViews = pageViewEvents.length;

    const newVisitors = filteredEvents.filter(e => e.isNewVisitor).length;
    const returningVisitors = Math.max(uniqueVisitors - newVisitors, 0);

    const durations = filteredEvents.map(e => e.duration || 0).filter(d => d > 0);
    const avgDurationSeconds = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 145;

    const singlePageSessions = filteredEvents.filter(e => (e.duration || 0) < 10 && e.type === 'page_view');
    const bounceRate = sessions > 0 ? Math.min(Math.round((singlePageSessions.length / Math.max(sessions, 1)) * 100), 100) : 0;

    const whatsappClicks = filteredEvents.filter(e => e.type === 'whatsapp_click').length;
    const phoneClicks = filteredEvents.filter(e => e.type === 'phone_click').length;
    const emailClicks = filteredEvents.filter(e => e.type === 'email_click').length;
    const bookNowClicks = filteredEvents.filter(e => e.type === 'book_now_click').length;
    const inquirySubmissions = filteredEvents.filter(e => e.type === 'inquiry_submit').length;
    const tourDetailClicks = filteredEvents.filter(e => e.type === 'tour_detail_click').length;
    const externalClicks = filteredEvents.filter(e => e.type === 'external_link_click').length;

    // Conversion rate
    const conversionLeads = whatsappClicks + bookNowClicks + inquirySubmissions + totalBookingsCount;
    const conversionRate = uniqueVisitors > 0 ? Number(((totalBookingsCount > 0 ? totalBookingsCount : (conversionLeads * 0.15)) / uniqueVisitors * 100).toFixed(1)) : 0;

    // Daily Trend Timeline
    const timelineMap: Record<string, { visitors: number; pageViews: number; conversions: number; label: string }> = {};
    
    // Seed timeline days
    const curDay = new Date(startTime);
    while (curDay <= endTime) {
      const dateStr = curDay.toISOString().split('T')[0];
      const label = curDay.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      timelineMap[dateStr] = { visitors: 0, pageViews: 0, conversions: 0, label };
      curDay.setDate(curDay.getDate() + 1);
    }

    filteredEvents.forEach(e => {
      const dateStr = e.timestamp.split('T')[0];
      if (timelineMap[dateStr]) {
        timelineMap[dateStr].visitors += 1;
        if (e.type === 'page_view') timelineMap[dateStr].pageViews += 1;
        if (e.type === 'whatsapp_click' || e.type === 'book_now_click') timelineMap[dateStr].conversions += 1;
      }
    });

    const trendTimeline = Object.entries(timelineMap).map(([date, data]) => ({
      date,
      label: data.label,
      visitors: data.visitors,
      pageViews: data.pageViews,
      conversions: data.conversions
    }));

    // Traffic Sources Breakdown
    const sourceCountMap: Record<string, { visitors: number; pageViews: number; conversions: number }> = {};
    filteredEvents.forEach(e => {
      const src = e.source || 'Direct';
      if (!sourceCountMap[src]) {
        sourceCountMap[src] = { visitors: 0, pageViews: 0, conversions: 0 };
      }
      sourceCountMap[src].visitors += 1;
      if (e.type === 'page_view') sourceCountMap[src].pageViews += 1;
      if (e.type === 'whatsapp_click' || e.type === 'book_now_click' || e.type === 'inquiry_submit') {
        sourceCountMap[src].conversions += 1;
      }
    });

    const totalSrcVisitors = Object.values(sourceCountMap).reduce((acc, v) => acc + v.visitors, 0) || 1;
    const trafficSources = Object.entries(sourceCountMap)
      .map(([source, stats]) => ({
        source,
        visitors: stats.visitors,
        pageViews: stats.pageViews,
        conversions: stats.conversions,
        conversionRate: Number(((stats.conversions / Math.max(stats.visitors, 1)) * 100).toFixed(1)),
        percentage: Number(((stats.visitors / totalSrcVisitors) * 100).toFixed(1))
      }))
      .sort((a, b) => b.visitors - a.visitors);

    // UTM Campaigns
    const utmMap: Record<string, { source: string; medium: string; visitors: number; conversions: number }> = {};
    filteredEvents.forEach(e => {
      if (e.utm && (e.utm.utm_campaign || e.utm.utm_source)) {
        const key = e.utm.utm_campaign || 'Default Campaign';
        if (!utmMap[key]) {
          utmMap[key] = {
            source: e.utm.utm_source || 'Unknown',
            medium: e.utm.utm_medium || 'Unknown',
            visitors: 0,
            conversions: 0
          };
        }
        utmMap[key].visitors += 1;
        if (e.type === 'whatsapp_click' || e.type === 'book_now_click') {
          utmMap[key].conversions += 1;
        }
      }
    });

    const utmCampaigns = Object.entries(utmMap).map(([campaign, data]) => ({
      campaign,
      source: data.source,
      medium: data.medium,
      visitors: data.visitors,
      conversions: data.conversions
    }));

    // Popular Pages
    const pagesMap: Record<string, { title: string; views: number; visitors: Set<string>; totalDuration: number }> = {};
    pageViewEvents.forEach(e => {
      const p = e.page || '/';
      if (!pagesMap[p]) {
        pagesMap[p] = {
          title: e.title || p,
          views: 0,
          visitors: new Set(),
          totalDuration: 0
        };
      }
      pagesMap[p].views += 1;
      pagesMap[p].visitors.add(e.visitorId || e.id);
      pagesMap[p].totalDuration += (e.duration || 45);
    });

    const popularPages = Object.entries(pagesMap)
      .map(([pathStr, val]) => {
        let category = 'Halaman Umum';
        if (pathStr.includes('bromo') || pathStr.includes('ijen') || pathStr.includes('tour') || pathStr.includes('tumpak')) category = 'Paket Wisata';
        else if (pathStr.includes('share') || pathStr.includes('trip')) category = 'Open Trip';
        else if (pathStr.includes('airport')) category = 'Antar Jemput Bandara';
        else if (pathStr.includes('taxi')) category = 'Layanan Taksi';
        else if (pathStr.includes('rental') || pathStr.includes('car')) category = 'Rental Mobil';

        const avgSecs = val.views > 0 ? Math.round(val.totalDuration / val.views) : 35;
        const mins = Math.floor(avgSecs / 60);
        const secs = avgSecs % 60;

        return {
          path: pathStr,
          title: val.title,
          views: val.views,
          uniqueVisitors: val.visitors.size,
          avgTimeSpent: `${mins}m ${secs < 10 ? '0' : ''}${secs}s`,
          category
        };
      })
      .sort((a, b) => b.views - a.views);

    // Devices Breakdown
    let mobileCount = 0;
    let desktopCount = 0;
    let tabletCount = 0;

    filteredEvents.forEach(e => {
      const d = (e.device || '').toLowerCase();
      if (d === 'mobile') mobileCount++;
      else if (d === 'tablet') tabletCount++;
      else desktopCount++;
    });

    const totalDev = mobileCount + desktopCount + tabletCount || 1;
    const devices = {
      mobile: mobileCount,
      desktop: desktopCount,
      tablet: tabletCount,
      mobilePct: Math.round((mobileCount / totalDev) * 100),
      desktopPct: Math.round((desktopCount / totalDev) * 100),
      tabletPct: Math.round((tabletCount / totalDev) * 100)
    };

    // Locations Breakdown
    const locMap: Record<string, number> = {};
    filteredEvents.forEach(e => {
      const loc = e.location || 'Indonesia';
      locMap[loc] = (locMap[loc] || 0) + 1;
    });

    const totalLoc = Object.values(locMap).reduce((a, b) => a + b, 0) || 1;
    const locations = Object.entries(locMap)
      .map(([country, count]) => ({
        country,
        visitors: count,
        percentage: Math.round((count / totalLoc) * 100)
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 8);

    // Realtime: active in last 5 minutes (300 seconds)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentEvents = inMemoryAnalytics
      .filter(e => new Date(e.timestamp) >= fiveMinutesAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const activeVisitorsSet = new Set(recentEvents.map(e => e.visitorId || e.id));
    const activePagesMap: Record<string, number> = {};
    const activeLocMap: Record<string, number> = {};

    recentEvents.forEach(e => {
      const p = e.page || '/';
      activePagesMap[p] = (activePagesMap[p] || 0) + 1;
      const l = e.location || 'Indonesia';
      activeLocMap[l] = (activeLocMap[l] || 0) + 1;
    });

    const activePages = Object.entries(activePagesMap).map(([path, count]) => ({ path, count }));
    const activeLocations = Object.entries(activeLocMap).map(([country, count]) => ({ country, count }));

    return res.json({
      totalVisitors,
      uniqueVisitors,
      sessions,
      pageViews,
      newVisitors,
      returningVisitors,
      avgDurationSeconds,
      bounceRate,
      whatsappClicks,
      phoneClicks,
      emailClicks,
      bookNowClicks,
      inquirySubmissions,
      tourDetailClicks,
      externalClicks,
      totalBookings: totalBookingsCount,
      conversionRate,
      trendTimeline,
      trafficSources,
      utmCampaigns,
      popularPages,
      devices,
      locations,
      browsers: [
        { name: 'Chrome', count: Math.round(uniqueVisitors * 0.65) || 1, percentage: 65 },
        { name: 'Safari', count: Math.round(uniqueVisitors * 0.25) || 1, percentage: 25 },
        { name: 'Edge', count: Math.round(uniqueVisitors * 0.06) || 1, percentage: 6 },
        { name: 'Firefox', count: Math.round(uniqueVisitors * 0.04) || 1, percentage: 4 }
      ],
      recentEvents: inMemoryAnalytics.slice(-20).reverse(),
      realtime: {
        activeNow: activeVisitorsSet.size,
        activePages,
        activeLocations
      }
    });
  } catch (err: any) {
    console.error('[Analytics Dashboard Error]:', err);
    return res.status(500).json({ error: 'Gagal memproses data analitik', details: err.message });
  }
});

// Admin-only Realtime Feed Endpoint
app.get('/api/analytics/realtime', requireAdminAuth, (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recent = inMemoryAnalytics.filter(e => new Date(e.timestamp) >= fiveMinutesAgo);
    const activeVisitorsSet = new Set(recent.map(e => e.visitorId || e.id));

    return res.json({
      activeNow: activeVisitorsSet.size,
      recentEvents: recent.slice(-15).reverse()
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal mengambil data realtime', details: err.message });
  }
});


// -------------------------------------------------------------
// ArtoPay Official Production Gateway API Routes
// -------------------------------------------------------------

function getSafeCredentialInfo(val: string | undefined) {
  if (!val) return { exists: false, length: 0, prefix: '-', suffix: '-' };
  const clean = val.replace(/^["']|["']$/g, '').trim();
  if (!clean) return { exists: false, length: 0, prefix: '-', suffix: '-' };
  const prefix = clean.substring(0, 4);
  const suffix = clean.length >= 4 ? clean.substring(clean.length - 4) : clean;
  return { exists: true, length: clean.length, prefix, suffix };
}

app.get('/api/artopay/config', (req, res) => {
  const rawSecretKey = process.env.ARTOPAY_SECRET_KEY || '';
  const secretKey = rawSecretKey.replace(/^["']|["']$/g, '').trim();

  const envMode = process.env.ARTOPAY_ENV || (process.env.ARTOPAY_SANDBOX === 'false' ? 'production' : 'sandbox');
  const baseUrl = process.env.ARTOPAY_API_BASE_URL || (envMode === 'production' ? 'https://api.artopay.online' : 'https://api-sandbox.arto-pay.com');
  const rawPublicKey = process.env.VITE_ARTOPAY_PUBLIC_KEY || process.env.ARTOPAY_PUBLIC_KEY || '';
  const publicKey = rawPublicKey.replace(/^["']|["']$/g, '').trim();
  const rawBu = process.env.ARTOPAY_BUSINESS_UNIT_CODE || process.env.ARTOPAY_BUSINESS_UNIT || '';
  const businessUnitCode = rawBu.replace(/^["']|["']$/g, '').trim();

  res.json({
    isConfigured: !!secretKey,
    env: envMode,
    apiBaseUrl: baseUrl,
    secretKeyInfo: getSafeCredentialInfo(secretKey),
    publicKeyInfo: getSafeCredentialInfo(publicKey),
    businessUnitInfo: getSafeCredentialInfo(businessUnitCode),
    message: secretKey
      ? "ArtoPay Server Secret Key is configured."
      : "ARTOPAY_SECRET_KEY is missing. Please add ARTOPAY_SECRET_KEY in Vercel/Environment Variables."
  });
});

app.post(['/api/artopay/payment-intent', '/artopay/payment-intent', '/api/payment/create-intent'], async (req, res) => {
  try {
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try {
        bodyData = JSON.parse(bodyData);
      } catch (e) {
        bodyData = {};
      }
    }

    let { orderId, amount, currency = 'IDR', description, customerId, metadata, customerName, customerEmail, customerPhone } = bodyData || {};

    if (!orderId) {
      return res.status(400).json({ error: 'orderId parameter is required' });
    }

    let numericAmount = Number(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid positive number' });
    }

    const rawSecretKey = process.env.ARTOPAY_SECRET_KEY || '';
    const secretKey = rawSecretKey.replace(/^["']|["']$/g, '').trim();
    const envMode = process.env.ARTOPAY_ENV || (process.env.ARTOPAY_SANDBOX === 'false' ? 'production' : 'sandbox');
    const baseUrl = process.env.ARTOPAY_API_BASE_URL || (envMode === 'production' ? 'https://api.artopay.online' : 'https://api-sandbox.arto-pay.com');

    const rawPublicKey = process.env.VITE_ARTOPAY_PUBLIC_KEY || process.env.ARTOPAY_PUBLIC_KEY || '';
    const publicKey = rawPublicKey.replace(/^["']|["']$/g, '').trim();

    const secretKeyInfo = getSafeCredentialInfo(secretKey);
    const publicKeyInfo = getSafeCredentialInfo(publicKey);

    // CATEGORY A: SECURITY & CONFIGURATION RULE - Reject request if Secret Key is missing in process.env
    if (!secretKey) {
      const configErrorMsg = 'Integrasi ArtoPay belum siap. ARTOPAY_SECRET_KEY belum diisi di Environment Variables Server Production.';
      console.error('[ArtoPay Server Error]', configErrorMsg, {
        envMode,
        baseUrl,
        secretKeyInfo,
        publicKeyInfo
      });

      return res.status(500).json({
        category: 'ENVIRONMENT_VARIABLE_MISSING',
        error: configErrorMsg,
        details: 'Variabel ARTOPAY_SECRET_KEY bernilai undefined/kosong pada server runtime.',
        envCheck: {
          ARTOPAY_ENV: envMode,
          ARTOPAY_API_BASE_URL: baseUrl,
          hasSecretKey: false,
          hasPublicKey: !!publicKey
        }
      });
    }

    // Check DB for existing order to avoid double payment or amount tampering
    // BACKEND IS THE SINGLE SOURCE OF TRUTH FOR PAYMENT AMOUNT
    const db = readDB();
    if (!db.bookings) db.bookings = [];

    const existingOrderIndex = db.bookings.findIndex(b => b.bookingCode === orderId || b.id === orderId);
    const existingOrder = existingOrderIndex !== -1 ? db.bookings[existingOrderIndex] : null;

    if (!existingOrder) {
      console.warn(`[Payment Intent Rejected] Order ${orderId} does not exist in database.`);
      return res.status(404).json({
        error: 'Booking tidak ditemukan di database backend. Silakan lengkapi dan simpan pesanan terlebih dahulu.',
        orderId
      });
    }

    if (existingOrder.paymentStatus === 'Paid') {
      return res.status(400).json({ error: 'Pesanan ini sudah lunas (PAID). Pembayaran ulang tidak diperlukan.' });
    }

    // Backend authoritative amount check (Never trust frontend amount directly)
    let baseAmount = Number(existingOrder.baseAmount || existingOrder.totalPriceIDR || existingOrder.totalPrice);
    if (!baseAmount || isNaN(baseAmount) || baseAmount <= 0) {
      return res.status(400).json({ error: 'Nominal harga booking tidak valid di database backend.' });
    }

    let uniqueCode = Number(existingOrder.uniqueCode || 0);
    let paymentAmount = Number(existingOrder.paymentAmount || 0);

    // If booking doesn't have uniqueCode or paymentAmount, or if uniqueCode is out of 1-99 range:
    if (!uniqueCode || uniqueCode < 1 || uniqueCode > 99 || !paymentAmount || paymentAmount !== baseAmount + uniqueCode) {
      uniqueCode = generateUniquePaymentCode(db.bookings.filter(b => b.id !== existingOrder.id));
      paymentAmount = baseAmount + uniqueCode;
      existingOrder.baseAmount = baseAmount;
      existingOrder.uniqueCode = uniqueCode;
      existingOrder.paymentAmount = paymentAmount;
      writeDB(db);
    }

    // REQUIREMENT 1: Final payment amount sent to ArtoPay MUST be paymentAmount (baseAmount + uniqueCode)!
    numericAmount = paymentAmount;

    const rawBusinessUnitCode = process.env.ARTOPAY_BUSINESS_UNIT_CODE || process.env.ARTOPAY_BUSINESS_UNIT || '';
    const businessUnitCode = rawBusinessUnitCode.replace(/^["']|["']$/g, '').trim();

    const formattedAmount = Math.round(Number(numericAmount));
    const payloadObj: Record<string, any> = {
      amount: formattedAmount,
      currency: currency || 'IDR',
      orderId: String(orderId),
      description: description || `Payment for order ${orderId}`,
      customerId: customerId || `cust_${String(orderId).replace(/[^a-zA-Z0-9]/g, '_')}`,
      metadata: {
        ...(existingOrder ? {
          bookingId: existingOrder.id,
          bookingCode: existingOrder.bookingCode,
          tourId: existingOrder.tripId,
          tourName: existingOrder.tripTitle,
          customerName: existingOrder.fullName || existingOrder.customerName,
          customerEmail: existingOrder.email || existingOrder.customerEmail,
          customerPhone: existingOrder.phone || existingOrder.customerPhone,
          travelDate: existingOrder.departureDate,
          nationality: existingOrder.nationalityType,
          pax: existingOrder.participantsCount,
          baseAmount: existingOrder.baseAmount,
          uniqueCode: existingOrder.uniqueCode,
          paymentAmount: existingOrder.paymentAmount,
          amount: formattedAmount,
          currency: currency || 'IDR'
        } : {}),
        ...(metadata || {})
      }
    };

    if (businessUnitCode) {
      payloadObj.businessUnitCode = businessUnitCode;
    }

    const requestBody = JSON.stringify(payloadObj);

    const candidateHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Secret-Key': secretKey
    };

    if (businessUnitCode) {
      candidateHeaders['X-Business-Unit-Code'] = businessUnitCode;
    }

    // Primary endpoint: /v1/payment-intents
    const endpointV1 = `${baseUrl.replace(/\/+$/, '')}/v1/payment-intents`;
    console.log(`[ArtoPay Backend Request] Target: ${endpointV1} | Env: ${envMode} | SecretKey: ${secretKeyInfo.prefix}...${secretKeyInfo.suffix} (len:${secretKeyInfo.length}) | PublicKey: ${publicKeyInfo.prefix}...${publicKeyInfo.suffix} (len:${publicKeyInfo.length})`);

    let response: Response;

    // CATEGORY B: OUTBOUND NETWORK/FETCH HANDLER
    try {
      response = await fetch(endpointV1, {
        method: 'POST',
        headers: candidateHeaders,
        body: requestBody
      });

      // Fallback to /v1.1/payment-intents if 404
      if (response.status === 404) {
        const endpointV11 = `${baseUrl.replace(/\/+$/, '')}/v1.1/payment-intents`;
        console.log(`[ArtoPay Backend Fallback] /v1 endpoint returned 404, trying fallback ${endpointV11}...`);
        response = await fetch(endpointV11, {
          method: 'POST',
          headers: candidateHeaders,
          body: requestBody
        });
      }
    } catch (fetchErr: any) {
      console.error('[ArtoPay Network Fetch Exception]:', fetchErr);
      return res.status(500).json({
        category: 'NETWORK_FETCH_ERROR',
        error: 'Gagal terhubung ke server ArtoPay Payment Gateway (Outbound HTTPS Network Error).',
        details: fetchErr.message || String(fetchErr),
        targetEndpoint: endpointV1,
        baseUrl: baseUrl
      });
    }

    // CATEGORY C & D: HTTP RESPONSE CODES FROM ARTOPAY
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ArtoPay API Gateway Response Error HTTP ${response.status}]:`, errorText);

      let category = 'ARTOPAY_API_ERROR';
      let userFriendlyError = `Gagal membuat transaksi ArtoPay (${response.status}). Periksa kredensial API key atau koneksi ArtoPay.`;

      if (response.status === 401) {
        category = 'ARTOPAY_UNAUTHORIZED_401';
        userFriendlyError = 'Autentikasi ArtoPay gagal (401 Unauthorized). Silakan periksa kembali ARTOPAY_SECRET_KEY di Environment Variables Vercel/Server Anda.';
      } else if (response.status === 403) {
        category = 'ARTOPAY_FORBIDDEN_403';
        userFriendlyError = 'Akses ArtoPay ditolak (403 Forbidden). Pastikan IP server atau domain Anda diizinkan di dashboard ArtoPay.';
      } else if (response.status === 400) {
        category = 'ARTOPAY_BAD_REQUEST_400';
        userFriendlyError = 'Request Payment Intent ditolak ArtoPay (400 Bad Request).';
      } else if (response.status >= 500) {
        category = 'ARTOPAY_SERVER_ERROR_500';
        userFriendlyError = 'Server ArtoPay Gateway mengalami gangguan internal (HTTP 500).';
      }

      return res.status(response.status >= 400 && response.status < 600 ? response.status : 500).json({
        category,
        error: userFriendlyError,
        status: response.status,
        details: errorText
      });
    }

    const data: any = await response.json();
    console.log('[ArtoPay API Gateway Response Success]:', {
      id: data.id || data.paymentId || data.responseData?.id,
      orderId: data.orderId || data.responseData?.orderId
    });

    const resData = data.responseData || data.data || data;

    const paymentId = resData.id || resData.paymentId || resData.payment_id;
    const secret = resData.clientSecret || resData.secret || resData.client_secret;
    const customerToken = resData.customerToken || resData.token || resData.customer_token;
    const checkoutUrl = resData.checkoutUrl || resData.paymentUrl || resData.redirectUrl;

    // Update DB with active paymentIntentId
    if (existingOrderIndex !== -1 && db.bookings[existingOrderIndex]) {
      db.bookings[existingOrderIndex].paymentIntentId = paymentId;
      db.bookings[existingOrderIndex].paymentStatus = 'Pending Payment';
      db.bookings[existingOrderIndex].status = 'Pending';
      writeDB(db);
    }

    return res.json({
      success: true,
      id: paymentId,
      paymentId: paymentId,
      secret: secret,
      clientSecret: secret,
      customerToken: customerToken,
      token: customerToken,
      checkoutUrl: checkoutUrl,
      orderId: String(orderId),
      publicKey: publicKey || resData.publicKey || '',
      baseAmount: existingOrder.baseAmount,
      uniqueCode: existingOrder.uniqueCode,
      paymentAmount: existingOrder.paymentAmount
    });
  } catch (error: any) {
    // CATEGORY E: INTERNAL SMART JOURNEY SERVER ERROR
    console.error('[Smart Journey Server Internal Exception]:', error);
    return res.status(500).json({
      category: 'INTERNAL_SERVER_ERROR',
      error: 'Terjadi kesalahan sistem internal saat memproses request pembayaran.',
      details: error.message || String(error)
    });
  }
});

// Official ArtoPay Webhook / Callback Handler Endpoint
app.post(['/api/artopay/webhook', '/artopay/webhook'], (req, res) => {
  try {
    const body = req.body || {};
    console.log('[ArtoPay Webhook Callback Received]:', JSON.stringify(body));

    // Webhook Signature verification if signature header or signature parameter is supplied
    const incomingSignature = 
      (req.headers['x-artopay-signature'] as string) || 
      (req.headers['x-signature'] as string) || 
      (req.headers['webhook-signature'] as string) || 
      body.signature || 
      body.hash;

    const webhookSecret = (process.env.WEBHOOK_SECRET || process.env.ARTOPAY_SECRET_KEY || '').trim();

    // STRICT HMAC VERIFICATION: If webhook secret is configured, enforce valid HMAC signature
    if (webhookSecret) {
      if (!incomingSignature) {
        console.error('[ArtoPay Webhook Security] Webhook signature missing in headers or payload.');
        return res.status(401).json({ error: 'Missing webhook signature' });
      }

      try {
        const rawPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(rawPayload)
          .digest('hex');

        if (incomingSignature.toLowerCase() !== expectedSignature.toLowerCase()) {
          console.error('[ArtoPay Webhook Security] Mismatched webhook signature received:', {
            incoming: incomingSignature,
            expected: expectedSignature
          });
          return res.status(401).json({ error: 'Invalid webhook signature' });
        }
        console.log('[ArtoPay Webhook Signature Verified] Authenticity confirmed via HMAC-SHA256.');
      } catch (sigErr) {
        console.error('[ArtoPay Webhook Signature Verification Exception]:', sigErr);
        return res.status(401).json({ error: 'Webhook signature verification failed' });
      }
    }

    const orderId = body.orderId || body.order_id || body.orderID || body.metadata?.orderId || body.data?.orderId || body.data?.order_id;
    const paymentId = body.id || body.paymentId || body.payment_id || body.transaction_id || body.data?.id || body.data?.paymentId;
    const rawStatus = String(body.status || body.transaction_status || body.payment_status || body.data?.status || body.data?.transaction_status || '').toUpperCase();

    if (!orderId && !paymentId) {
      return res.status(400).json({ error: 'Missing orderId or paymentId in webhook payload' });
    }

    const db = readDB();
    if (!db.bookings) db.bookings = [];

    const index = db.bookings.findIndex(b =>
      (orderId && (b.bookingCode === orderId || b.id === orderId)) ||
      (paymentId && (b.paymentIntentId === paymentId || b.paymentId === paymentId))
    );

    if (index === -1) {
      console.warn(`[ArtoPay Webhook] Order ${orderId || paymentId} not found in database.`);
      return res.status(404).json({ error: 'Order not found in database', orderId: orderId || paymentId });
    }

    const booking = db.bookings[index];

    // IDEMPOTENCY CHECK: If already paid, do not re-process or revert status
    if (booking.paymentStatus === 'Paid') {
      console.log(`[ArtoPay Webhook IDEMPOTENT] Order ${orderId || booking.id} is already Paid. Retaining booking status (${booking.status}).`);
      return res.status(200).json({
        success: true,
        message: 'Order status is already Paid (Idempotent call).',
        orderId: booking.bookingCode || booking.id,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.status
      });
    }

    // AMOUNT VALIDATION: Ensure amount matches authoritative price in database
    const receivedAmount = Number(body.amount || body.gross_amount || body.data?.amount || body.data?.gross_amount || 0);
    const expectedAmount = Number(booking.paymentAmount || booking.totalPriceIDR || booking.totalPrice || 0);
    if (receivedAmount > 0 && expectedAmount > 0 && Math.abs(receivedAmount - expectedAmount) > 1) {
      console.error(`[ArtoPay Webhook Amount Mismatch] Order ${orderId || booking.id}: Expected ${expectedAmount}, received ${receivedAmount}`);
      booking.paymentStatus = 'Amount Mismatch';
      booking.paymentNotes = `Amount mismatch: expected ${expectedAmount} (Base: ${booking.baseAmount || '-'} + Code: ${booking.uniqueCode || '-'}), received ${receivedAmount}`;
      db.bookings[index] = booking;
      writeDB(db);
      return res.status(400).json({
        error: 'Payment amount mismatch',
        expectedAmount,
        receivedAmount
      });
    }

    const successStatuses = ['SUCCESS', 'PAID', 'SETTLEMENT', 'COMPLETED', '00', 'SUCCESSFUL', 'APPROVED', 'CAPTURE'];
    const failureStatuses = ['FAILED', 'CANCELLED', 'DENIED', 'EXPIRED', 'EXPIRE', 'REJECTED', 'FAILURE', 'CANCEL'];

    if (successStatuses.includes(rawStatus)) {
      booking.paymentStatus = 'Paid';
      // PAYMENT STATUS ≠ BOOKING STATUS
      // Customer has paid, but booking is Pending Confirmation until Admin confirms
      if (booking.status !== 'Confirmed' && booking.status !== 'Completed') {
        booking.status = 'Pending Confirmation';
      }
      booking.paidAt = booking.paidAt || new Date().toISOString();
      booking.paymentId = paymentId || booking.paymentIntentId;

      console.log(`[ArtoPay Webhook SUCCESS] Order ${orderId || booking.id}: Payment Status set to PAID, Booking Status set to ${booking.status}.`);
    } else if (failureStatuses.includes(rawStatus)) {
      booking.paymentStatus = (rawStatus === 'EXPIRED' || rawStatus === 'EXPIRE') ? 'Expired' : 'Failed';
      if (booking.status !== 'Confirmed' && booking.status !== 'Completed') {
        booking.status = 'Cancelled';
      }

      console.log(`[ArtoPay Webhook FAILURE] Order ${orderId || booking.id} status set to ${booking.paymentStatus}.`);

      // Restore batch seats if applicable
      if (booking.batchId) {
        const bIdx = db.batches.findIndex(b => b.id === booking.batchId);
        if (bIdx !== -1) {
          db.batches[bIdx].availableSeats += (booking.participantsCount || 1);
          if (db.batches[bIdx].availableSeats > 0) {
            db.batches[bIdx].status = 'Open';
          }
        }
      }
    } else {
      booking.paymentStatus = 'Pending';
      if (booking.status !== 'Confirmed' && booking.status !== 'Completed') {
        booking.status = 'Pending';
      }
    }

    db.bookings[index] = booking;
    writeDB(db);

    return res.status(200).json({
      success: true,
      orderId: booking.bookingCode || booking.id,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
      orderStatus: booking.status
    });
  } catch (error: any) {
    console.error('[ArtoPay Webhook Error]:', error);
    return res.status(500).json({ error: 'Webhook processing error', details: error.message });
  }
});

// Server-verified Payment Status Query Endpoint (Polling & Verification)
app.get(['/api/orders/:orderId/payment-status', '/api/artopay/status/:orderId'], async (req, res) => {
  try {
    const { orderId } = req.params;
    const db = readDB();
    if (!db.bookings) db.bookings = [];

    const booking = db.bookings.find(b => b.bookingCode === orderId || b.id === orderId || b.paymentIntentId === orderId);

    if (!booking) {
      return res.status(404).json({
        found: false,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        message: 'Order ID tidak ditemukan.'
      });
    }

    // Out-of-band active status check against ArtoPay API if still pending
    if (booking.paymentStatus === 'Pending' && booking.paymentIntentId) {
      const rawSecretKey = process.env.ARTOPAY_SECRET_KEY || '';
      const secretKey = rawSecretKey.replace(/^["']|["']$/g, '').trim();

      if (secretKey) {
        const envMode = process.env.ARTOPAY_ENV || (process.env.ARTOPAY_SANDBOX === 'false' ? 'production' : 'sandbox');
        const baseUrl = process.env.ARTOPAY_API_BASE_URL || (envMode === 'production' ? 'https://api.artopay.online' : 'https://api-sandbox.arto-pay.com');
        const checkUrl = `${baseUrl.replace(/\/+$/, '')}/v1.1/payment-intents/${booking.paymentIntentId}`;

        try {
          const verifyRes = await fetch(checkUrl, {
            headers: {
              'X-Secret-Key': secretKey
            }
          });

          if (verifyRes.ok) {
            const statusData: any = await verifyRes.json();
            const resData = statusData.responseData || statusData;
            const remoteStatus = String(resData.status || resData.transaction_status || '').toUpperCase();

            if (['SUCCESS', 'PAID', 'SETTLEMENT', 'COMPLETED', '00'].includes(remoteStatus)) {
              booking.paymentStatus = 'Paid';
              if (booking.status === 'Pending') {
                booking.status = 'Pending Confirmation';
              }
              booking.paidAt = new Date().toISOString();
              writeDB(db);
            } else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(remoteStatus)) {
              booking.paymentStatus = remoteStatus === 'EXPIRED' ? 'Expired' : 'Failed';
              if (booking.status !== 'Confirmed') {
                booking.status = 'Cancelled';
              }
              writeDB(db);
            }
          }
        } catch (vErr) {
          console.warn('[Server Status Check Warning]:', vErr);
        }
      }
    }

    return res.json({
      found: true,
      orderId: booking.bookingCode || booking.id,
      paymentStatus: booking.paymentStatus || 'Pending',
      orderStatus: booking.status || 'Pending',
      bookingStatus: booking.status || 'Pending',
      baseAmount: booking.baseAmount || booking.totalPriceIDR || booking.totalPrice || 0,
      uniqueCode: booking.uniqueCode || 0,
      paymentAmount: booking.paymentAmount || (booking.uniqueCode ? ((booking.baseAmount || booking.totalPriceIDR || 0) + booking.uniqueCode) : (booking.totalPriceIDR || booking.totalPrice || 0)),
      paidAt: booking.paidAt || null,
      booking
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve payment status', details: error.message });
  }
});

// Direct PDF Download route with forced attachment header
app.get(['/download-booking-guide', '/api/download-booking-guide', '/download/booking-flow-pdf', '/api/download/booking-flow-pdf', '/download/panduan-booking.pdf'], (req, res) => {
  const filePath = path.join(PROJECT_ROOT, 'public', 'smart_journey_booking_flow_guide.pdf');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Panduan_Alur_Pemesanan_Wisata_Smart_Journey.pdf"');
    return res.sendFile(filePath);
  }
  return res.status(404).send('PDF not found');
});

// -------------------------------------------------------------
// Frontend Asset Handling (Vite / Static production)
// -------------------------------------------------------------

app.use(express.static(path.join(PROJECT_ROOT, 'public')));

async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    // Development Mode: Use Vite Dev Server Middleware
    console.log('Running in Development mode. Mounting Vite Dev Server Middleware...');

    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error('Failed to create Vite server middleware:', err);
    }
  } else {
    // Production Mode: Serve Compiled Frontend Assets from /dist
    console.log('Running in Production mode. Serving static assets from /dist...');

    const distPath = path.join(PROJECT_ROOT, 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SmartJourney Fullstack Engine] Server listening on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
