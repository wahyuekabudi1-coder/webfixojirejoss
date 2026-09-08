import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const outputDir = path.join(process.cwd(), 'public', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching browser for flow capture...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2, // HiDPI 2x
  });

  const page = await context.newPage();
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ==========================================
  // FLOW 1: KATALOG & EKSPLORASI TUR WISATA
  // ==========================================
  console.log('1. Navigating to Tours Catalog...');
  await page.goto('http://localhost:3000/tours', { waitUntil: 'networkidle' });
  await wait(1500);

  console.log('Capturing Flow 1: Katalog Tur...');
  await page.screenshot({
    path: path.join(outputDir, 'flow_1_katalog_tur.png'),
    fullPage: false
  });

  // Scroll to show tour cards clearly
  await page.evaluate(() => window.scrollBy(0, 520));
  await wait(800);
  await page.screenshot({
    path: path.join(outputDir, 'flow_1b_daftar_paket_wisata.png'),
    fullPage: false
  });

  // ==========================================
  // FLOW 2: DETAIL TUR & ITINERARY LENGKAP
  // ==========================================
  console.log('2. Opening Tour Detail for Mount Bromo Sunrise...');
  // Click on the Bromo tour card or detail button
  const bromoCard = page.locator('#tour-card-bromo, button:has-text("Detail & Pesan"), button:has-text("Detail Lengkap")').first();
  if (await bromoCard.count() > 0) {
    await bromoCard.click();
  } else {
    // If not found, click any tour card
    await page.locator('.group.cursor-pointer').first().click();
  }
  await wait(2000);

  // Scroll to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(800);

  console.log('Capturing Flow 2: Detail Tur & Hero Overview...');
  await page.screenshot({
    path: path.join(outputDir, 'flow_2_detail_tur_dan_itinerary.png'),
    fullPage: false
  });

  // Scroll down to itinerary & inclusions
  await page.evaluate(() => window.scrollBy(0, 700));
  await wait(800);
  await page.screenshot({
    path: path.join(outputDir, 'flow_2b_itinerary_dan_fasilitas.png'),
    fullPage: false
  });

  // ==========================================
  // FLOW 3: KALENDER, KATEGORI TAMU & KALKULASI HARGA
  // ==========================================
  console.log('3. Navigating to Booking Widget (Calendar & Guest Category)...');
  const bookingBox = page.locator('#booking-section');
  if (await bookingBox.count() > 0) {
    await bookingBox.scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(() => {
      const el = document.getElementById('booking-section') || document.querySelector('.aspect-square');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  await wait(1000);

  // Pick an available date in calendar
  const calendarDays = page.locator('.aspect-square:not([disabled])');
  const dayCount = await calendarDays.count();
  if (dayCount > 5) {
    await calendarDays.nth(5).click();
  } else if (dayCount > 0) {
    await calendarDays.first().click();
  }
  await wait(800);

  console.log('Capturing Flow 3: Pemilihan Tanggal & Kategori Tamu (Domestic / Foreigner)...');
  await page.screenshot({
    path: path.join(outputDir, 'flow_3_pemilihan_tanggal_dan_kategori.png'),
    fullPage: false
  });

  // ==========================================
  // FLOW 4: FORMULIR PEMESANAN & DATA TAMU
  // ==========================================
  console.log('4. Clicking Proceed to Checkout button...');
  const proceedBtn = page.locator('button#btn-proceed-to-checkout, button:has-text("LANJUT KE PEMBAYARAN"), button#btn-sticky-proceed');
  if (await proceedBtn.count() > 0) {
    await proceedBtn.first().click();
  }
  await wait(2000);

  // We are now on the Booking Registration Form
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(800);

  console.log('Capturing Flow 4: Formulir Pendaftaran Data Tamu...');
  await page.screenshot({
    path: path.join(outputDir, 'flow_4_formulir_data_tamu.png'),
    fullPage: false
  });

  // Fill in customer data
  console.log('Filling form fields with sample customer data...');
  const inputs = page.locator('input');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    const placeholder = (await input.getAttribute('placeholder')) || '';
    const type = (await input.getAttribute('type')) || '';
    const name = (await input.getAttribute('name')) || '';

    if (placeholder.toLowerCase().includes('nama') || name.toLowerCase().includes('name') || i === 0) {
      await input.fill('Budi Santoso');
    } else if (type === 'tel' || placeholder.includes('WhatsApp') || placeholder.includes('812')) {
      await input.fill('081234567890');
    } else if (type === 'email' || placeholder.includes('email')) {
      await input.fill('budi.santoso@example.com');
    } else if (placeholder.toLowerCase().includes('hotel') || placeholder.toLowerCase().includes('lokasi')) {
      await input.fill('Hotel Santika Premiere Malang, Lobby Utama');
    } else if (placeholder.toLowerCase().includes('kota') || placeholder.toLowerCase().includes('city')) {
      await input.fill('Malang, Jawa Timur');
    }
  }

  // Check for textarea
  const textareas = page.locator('textarea');
  if (await textareas.count() > 0) {
    await textareas.first().fill('Mohon siapkan jaket hangat tambahan untuk 2 peserta. Terima kasih.');
  }

  await wait(600);

  // ==========================================
  // FLOW 5: REVIEW PESANAN, RINCIAN BIAYA & OPSI BAYAR
  // ==========================================
  console.log('Capturing Flow 5: Review Pesanan & Rincian Pembayaran...');
  // Scroll to payment options & breakdown
  await page.evaluate(() => window.scrollBy(0, 550));
  await wait(800);

  await page.screenshot({
    path: path.join(outputDir, 'flow_5_review_biaya_dan_opsi_bayar.png'),
    fullPage: false
  });

  // ==========================================
  // FLOW 6: MODAL CHECKOUT & GERBANG PEMBAYARAN ARTOPAY
  // ==========================================
  console.log('6. Capturing Checkout Modal & Payment Gateway...');
  // Open /tours and click Quick Book on another tour to show CheckoutModal dialog
  await page.goto('http://localhost:3000/tours', { waitUntil: 'networkidle' });
  await wait(1500);

  // Look for quick book buttons
  const quickBookBtn = page.locator('button:has-text("Pesan Sekarang"), button:has-text("Quick Book"), button:has-text("Book Now")').first();
  if (await quickBookBtn.count() > 0) {
    await quickBookBtn.click();
    await wait(1000);
    console.log('Capturing Flow 6: Modal Checkout Dialog...');
    await page.screenshot({
      path: path.join(outputDir, 'flow_6_checkout_modal_gateway.png'),
      fullPage: false
    });
  }

  // ==========================================
  // FLOW 7: INVOICE RESMI, QRIS & STATUS RESERVASI
  // ==========================================
  console.log('7. Capturing Booking Status & E-Ticket View...');
  await page.goto('http://localhost:3000/bookings', { waitUntil: 'networkidle' });
  await wait(1500);

  console.log('Capturing Flow 7: Booking Status & Ticket Management...');
  await page.screenshot({
    path: path.join(outputDir, 'flow_7_cek_status_tiket_dan_invoice.png'),
    fullPage: false
  });

  // ==========================================
  // BONUS FLOW: SHARE TOUR / OPEN TRIP BOOKING
  // ==========================================
  console.log('8. Capturing Open Trip / Share Tour Booking Flow...');
  await page.goto('http://localhost:3000/share-tour', { waitUntil: 'networkidle' });
  await wait(1500);

  console.log('Capturing Flow 8: Smart Share Tour & Open Trip Catalog...');
  await page.screenshot({
    path: path.join(outputDir, 'flow_8_share_tour_open_trip.png'),
    fullPage: false
  });

  console.log('All flow screenshots successfully captured!');
  await browser.close();
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
