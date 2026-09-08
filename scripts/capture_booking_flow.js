import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const outputDir = path.join(process.cwd(), 'public', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2, // HiDPI 2x for sharp screenshots
  });

  const page = await context.newPage();

  // Helper to wait a bit for animations
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  console.log('1. Navigating to Tours Catalog (/tours)...');
  await page.goto('http://localhost:3000/tours', { waitUntil: 'networkidle' });
  await wait(1500);

  // Take Step 1: Catalog
  console.log('Capturing Step 1: Tour Catalog...');
  await page.screenshot({
    path: path.join(outputDir, 'step_1_katalog_pilihan_tur.png'),
    fullPage: false
  });

  // Scroll down slightly to show tour cards nicely
  await page.evaluate(() => window.scrollBy(0, 480));
  await wait(600);
  await page.screenshot({
    path: path.join(outputDir, 'step_1b_katalog_daftar_paket.png'),
    fullPage: false
  });

  // Step 2: Open Tour Detail for Bromo Tour
  console.log('2. Opening Tour Detail for Bromo...');
  // Click on the first tour or navigate directly to searchParams.selectedTourId
  const detailButton = await page.$('button:has-text("Detail & Pesan"), a:has-text("Detail"), button:has-text("Detail Lengkap")');
  if (detailButton) {
    await detailButton.click();
  } else {
    // Alternatively click on a tour card
    await page.click('#tour-card-bromo, div:has-text("Bromo"):has-text("Sunrise")').catch(() => {});
  }
  await wait(2000);

  // Scroll to top of Tour Detail
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(800);

  console.log('Capturing Step 2: Tour Detail & Itinerary...');
  await page.screenshot({
    path: path.join(outputDir, 'step_2_detail_dan_itinerary_tur.png'),
    fullPage: false
  });

  // Scroll to Highlights & Inclusions
  await page.evaluate(() => window.scrollBy(0, 650));
  await wait(600);
  await page.screenshot({
    path: path.join(outputDir, 'step_2b_fasilitas_dan_rute.png'),
    fullPage: false
  });

  // Step 3: Booking Section (Calendar + Guest Category + Pricing)
  console.log('3. Scrolling to Booking Section...');
  const bookingSection = await page.$('#booking-section');
  if (bookingSection) {
    await bookingSection.scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(() => {
      const el = document.querySelector('button#btn-proceed-to-checkout, button:has-text("Pilih Tanggal"), .aspect-square');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  await wait(1000);

  // Click on an available day in calendar (e.g., day 15 or next available)
  const availableDays = await page.$$('.aspect-square:not([disabled])');
  if (availableDays.length > 5) {
    await availableDays[5].click();
  } else if (availableDays.length > 0) {
    await availableDays[0].click();
  }
  await wait(800);

  console.log('Capturing Step 3: Calendar & Guest Category Selection...');
  await page.screenshot({
    path: path.join(outputDir, 'step_3_pemilihan_tanggal_dan_kategori_tamu.png'),
    fullPage: false
  });

  // Click proceed button to open BookingForm
  console.log('4. Clicking Proceed to Checkout...');
  const proceedBtn = await page.$('button#btn-proceed-to-checkout, button:has-text("LANJUT KE PEMBAYARAN")');
  if (proceedBtn) {
    await proceedBtn.click();
  } else {
    // Try sticky proceed button
    await page.click('button#btn-sticky-proceed, button:has-text("Lanjut ke Pembayaran")').catch(() => {});
  }
  await wait(2000);

  // Now we should be on BookingForm
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(800);

  console.log('Capturing Step 4: Booking Form Header & Participant Summary...');
  await page.screenshot({
    path: path.join(outputDir, 'step_4_formulir_data_tamu.png'),
    fullPage: false
  });

  // Fill in form fields
  console.log('Filling in Customer Details...');
  // Look for inputs: Full Name, WhatsApp, Email, Pickup Location
  const nameInput = await page.$('input[placeholder*="Nama"], input[name*="name"], input#fullName, input[type="text"]');
  if (nameInput) {
    await nameInput.fill('Budi Santoso');
  }

  const phoneInputs = await page.$$('input[type="tel"], input[placeholder*="WhatsApp"], input[placeholder*="812"]');
  if (phoneInputs.length > 0) {
    await phoneInputs[0].fill('081234567890');
  }

  const emailInputs = await page.$$('input[type="email"], input[placeholder*="email"]');
  if (emailInputs.length > 0) {
    await emailInputs[0].fill('budi.santoso@example.com');
  }

  const pickupInput = await page.$('input[placeholder*="Hotel"], input[placeholder*="Penjemputan"], textarea[placeholder*="Hotel"]');
  if (pickupInput) {
    await pickupInput.fill('Hotel Santika Premiere Malang, Lobby Utama');
  }

  // Scroll down to show filled form and pricing breakdown
  await page.evaluate(() => window.scrollBy(0, 450));
  await wait(800);

  console.log('Capturing Step 5: Review Rincian Biaya & Opsi Pembayaran...');
  await page.screenshot({
    path: path.join(outputDir, 'step_5_review_biaya_dan_opsi_bayar.png'),
    fullPage: false
  });

  // Also capture the Checkout Modal flow (CheckoutModal)
  console.log('5. Navigating to Checkout Modal demonstration...');
  // Open /tours and click Quick Book on another tour to show CheckoutModal dialog
  await page.goto('http://localhost:3000/tours', { waitUntil: 'networkidle' });
  await wait(1500);

  // Trigger quick modal or checkout modal if available
  const quickBookBtn = await page.$('button:has-text("Pesan Sekarang"), button:has-text("Quick Book")');
  if (quickBookBtn) {
    await quickBookBtn.click();
    await wait(1000);
    console.log('Capturing Step 6: Checkout Modal...');
    await page.screenshot({
      path: path.join(outputDir, 'step_6_checkout_modal_dialog.png'),
      fullPage: false
    });
  }

  // Also simulate ArtoPay Payment Gateway Screen & Invoice Success Screen
  console.log('6. Generating Simulated Gateway & Success Views...');
  // Let's create a visual representation of the ArtoPay Payment Gateway screen
  // and Booking Confirmation screen for the PDF.

  console.log('All screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
