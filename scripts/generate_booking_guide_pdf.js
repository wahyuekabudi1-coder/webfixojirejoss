import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching browser to capture screenshots...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2, // HiDPI retina capture
  });

  const page = await context.newPage();
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ==========================================
  // FLOW 1: KATALOG TUR (TOUR CATALOG)
  // ==========================================
  console.log('1. Capturing Flow 1: Tours Catalog...');
  await page.goto('http://localhost:3000/tours', { waitUntil: 'networkidle' });
  await wait(1200);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_1_katalog_tur.png'),
    clip: { x: 0, y: 80, width: 1440, height: 860 }
  });

  await page.evaluate(() => window.scrollBy(0, 500));
  await wait(800);
  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_1b_daftar_paket_wisata.png'),
    clip: { x: 0, y: 0, width: 1440, height: 860 }
  });

  // ==========================================
  // FLOW 2: DETAIL TUR & ITINERARY
  // ==========================================
  console.log('2. Opening Tour Detail for Mount Bromo...');
  const bromoBtn = page.locator('button:has-text("Detail & Pesan"), button:has-text("Detail Lengkap")').first();
  if (await bromoBtn.count() > 0) {
    await bromoBtn.click();
  } else {
    await page.locator('#tour-card-bromo').first().click();
  }
  await wait(1800);

  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(600);
  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_2_detail_tur_dan_itinerary.png'),
    clip: { x: 0, y: 80, width: 1440, height: 860 }
  });

  // Scroll to Itinerary & Inclusions
  await page.evaluate(() => window.scrollBy(0, 750));
  await wait(600);
  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_2b_itinerary_dan_fasilitas.png'),
    clip: { x: 0, y: 0, width: 1440, height: 860 }
  });

  // ==========================================
  // FLOW 3: BOOKING WIDGET (CALENDAR & GUEST CATEGORY)
  // ==========================================
  console.log('3. Navigating to Booking Widget...');
  const bookingBox = page.locator('#booking-section');
  if (await bookingBox.count() > 0) {
    await bookingBox.scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(() => {
      const el = document.getElementById('booking-section') || document.querySelector('.aspect-square');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  await wait(800);

  // Pick calendar day
  const days = page.locator('.aspect-square:not([disabled])');
  const countDays = await days.count();
  if (countDays > 5) {
    await days.nth(5).click();
  } else if (countDays > 0) {
    await days.first().click();
  }
  await wait(600);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_3_pemilihan_tanggal_dan_kategori.png'),
    clip: { x: 0, y: 80, width: 1440, height: 860 }
  });

  // ==========================================
  // FLOW 4: FORMULIR PENDAFTARAN & DATA TAMU
  // ==========================================
  console.log('4. Proceeding to Booking Form...');
  const proceedBtn = page.locator('button#btn-proceed-to-checkout, button:has-text("LANJUT KE PEMBAYARAN"), button#btn-sticky-proceed');
  if (await proceedBtn.count() > 0) {
    await proceedBtn.first().click();
  }
  await wait(1800);

  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(600);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_4_formulir_data_tamu.png'),
    clip: { x: 0, y: 80, width: 1440, height: 860 }
  });

  // Fill in form fields safely using precise selectors
  console.log('Filling in form fields...');
  const fullNameInput = page.locator('#book-fullName');
  if (await fullNameInput.count() > 0) {
    await fullNameInput.fill('Budi Santoso');
  }

  const englishNameInput = page.locator('#book-englishName');
  if (await englishNameInput.count() > 0) {
    await englishNameInput.fill('BUDI SANTOSO');
  }

  const cityInput = page.locator('#book-city');
  if (await cityInput.count() > 0) {
    await cityInput.fill('Surabaya, Jawa Timur');
  }

  const whatsappInput = page.locator('#book-whatsapp');
  if (await whatsappInput.count() > 0) {
    await whatsappInput.fill('081234567890');
  }

  const emailInput = page.locator('#book-email');
  if (await emailInput.count() > 0) {
    await emailInput.fill('budi.santoso@example.com');
  }

  const pickupInput = page.locator('#book-pickupLocation, input[placeholder*="Hotel"], textarea');
  if (await pickupInput.count() > 0) {
    await pickupInput.first().fill('Hotel Santika Premiere Malang (Lobby Utama)');
  }

  await wait(600);

  // ==========================================
  // FLOW 5: REVIEW PESANAN & RINCIAN BIAYA
  // ==========================================
  console.log('5. Capturing Review Biaya & Opsi Pembayaran...');
  await page.evaluate(() => window.scrollBy(0, 580));
  await wait(800);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_5_review_biaya_dan_opsi_bayar.png'),
    clip: { x: 0, y: 0, width: 1440, height: 860 }
  });

  // ==========================================
  // FLOW 6: MODAL CHECKOUT & GERBANG PEMBAYARAN ARTOPAY
  // ==========================================
  console.log('6. Demonstrating Checkout Modal Flow...');
  await page.goto('http://localhost:3000/airport', { waitUntil: 'networkidle' });
  await wait(1200);

  const bookTransferBtn = page.locator('button:has-text("Pesan Antar Jemput"), button:has-text("Pesan Sekarang"), button:has-text("Booking")').first();
  if (await bookTransferBtn.count() > 0) {
    await bookTransferBtn.click();
    await wait(800);

    // Fill in modal
    const modalName = page.locator('input[placeholder*="Nama"], input#customer-name').first();
    if (await modalName.count() > 0) {
      await modalName.fill('Budi Santoso');
    }
    const modalPhone = page.locator('input[type="tel"]').first();
    if (await modalPhone.count() > 0) {
      await modalPhone.fill('081234567890');
    }
    const modalEmail = page.locator('input[type="email"]').first();
    if (await modalEmail.count() > 0) {
      await modalEmail.fill('budi.santoso@example.com');
    }
    await wait(500);

    await page.screenshot({
      path: path.join(screenshotsDir, 'flow_6_checkout_modal_gateway.png'),
      clip: { x: 0, y: 0, width: 1440, height: 920 }
    });
  }

  // ==========================================
  // FLOW 7: STATUS BOOKING, E-TICKET & INVOICE
  // ==========================================
  console.log('7. Capturing Booking Status & E-Ticket...');
  await page.goto('http://localhost:3000/bookings', { waitUntil: 'networkidle' });
  await wait(1200);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_7_cek_status_tiket_dan_invoice.png'),
    clip: { x: 0, y: 80, width: 1440, height: 860 }
  });

  // ==========================================
  // FLOW 8: SMART SHARE TOUR / OPEN TRIP
  // ==========================================
  console.log('8. Capturing Open Trip Catalog...');
  await page.goto('http://localhost:3000/share-tour', { waitUntil: 'networkidle' });
  await wait(1200);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_8_share_tour_open_trip.png'),
    clip: { x: 0, y: 80, width: 1440, height: 860 }
  });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
