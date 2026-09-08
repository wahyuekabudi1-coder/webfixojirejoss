import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  const screenshotsDir = path.join(publicDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('--- STEP 1: LAUNCHING PLAYWRIGHT BROWSER ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2, // 2x retina clarity
  });

  const page = await context.newPage();
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ========================================================
  // 1. FLOW 1: TOUR CATALOG
  // ========================================================
  console.log('Capturing Flow 1: Tours Catalog...');
  await page.goto('http://localhost:3000/tours', { waitUntil: 'networkidle' });
  await wait(1500);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_1_katalog_tur.png'),
    clip: { x: 0, y: 75, width: 1440, height: 860 }
  });

  // ========================================================
  // 2. FLOW 2: TOUR DETAIL & ITINERARY
  // ========================================================
  console.log('Capturing Flow 2: Tour Detail & Itinerary...');
  // Click on the first tour card
  const tourCard = page.locator('[id^="tour-card-"], button:has-text("Detail & Pesan"), button:has-text("Detail Lengkap")').first();
  if (await tourCard.count() > 0) {
    await tourCard.click();
  } else {
    await page.locator('.group.cursor-pointer').first().click();
  }
  await wait(2000);

  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(600);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_2_detail_tur.png'),
    clip: { x: 0, y: 75, width: 1440, height: 860 }
  });

  // ========================================================
  // 3. FLOW 3: CALENDAR & GUEST CATEGORY (DOMESTIC / FOREIGNER)
  // ========================================================
  console.log('Capturing Flow 3: Calendar & Guest Category Selection...');
  const bookingWidget = page.locator('#booking-section');
  if (await bookingWidget.count() > 0) {
    await bookingWidget.scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(() => {
      const el = document.getElementById('booking-section') || document.querySelector('.aspect-square');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  await wait(800);

  // Select day in calendar
  const dayButtons = page.locator('.aspect-square:not([disabled])');
  if (await dayButtons.count() > 4) {
    await dayButtons.nth(4).click();
  } else if (await dayButtons.count() > 0) {
    await dayButtons.first().click();
  }
  await wait(600);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_3_kalender_dan_kategori.png'),
    clip: { x: 0, y: 75, width: 1440, height: 860 }
  });

  // ========================================================
  // 4. FLOW 4: GUEST REGISTRATION FORM
  // ========================================================
  console.log('Capturing Flow 4: Guest Registration Form...');
  const proceedBtn = page.locator('button#btn-proceed-to-checkout, button:has-text("LANJUT KE PEMBAYARAN"), button#btn-sticky-proceed');
  if (await proceedBtn.count() > 0) {
    await proceedBtn.first().click();
  }
  await wait(2000);

  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(600);

  // Fill in traveler details for a complete realistic look
  const fullNameField = page.locator('#book-fullName');
  if (await fullNameField.count() > 0) {
    await fullNameField.fill('Budi Santoso');
  }
  const englishNameField = page.locator('#book-englishName');
  if (await englishNameField.count() > 0) {
    await englishNameField.fill('BUDI SANTOSO');
  }
  const cityField = page.locator('#book-city');
  if (await cityField.count() > 0) {
    await cityField.fill('Surabaya, Jawa Timur');
  }
  const whatsappField = page.locator('#book-whatsapp');
  if (await whatsappField.count() > 0) {
    await whatsappField.fill('081234567890');
  }
  const emailField = page.locator('#book-email');
  if (await emailField.count() > 0) {
    await emailField.fill('budi.santoso@example.com');
  }
  const pickupField = page.locator('#book-pickupLocation');
  if (await pickupField.count() > 0) {
    await pickupField.fill('Hotel Santika Premiere Malang, Lobby Utama');
  }
  await wait(500);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_4_formulir_data_tamu.png'),
    clip: { x: 0, y: 75, width: 1440, height: 860 }
  });

  // ========================================================
  // 5. FLOW 5: ORDER REVIEW & PAYMENT SCHEME
  // ========================================================
  console.log('Capturing Flow 5: Order Review & Down Payment Options...');
  await page.evaluate(() => window.scrollBy(0, 580));
  await wait(800);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_5_review_pesanan_dan_opsi_bayar.png'),
    clip: { x: 0, y: 0, width: 1440, height: 860 }
  });

  // ========================================================
  // 6. FLOW 6: CHECKOUT MODAL & ARTOPAY GATEWAY
  // ========================================================
  console.log('Capturing Flow 6: Checkout Modal & Payment Gateway Selector...');
  await page.goto('http://localhost:3000/airport', { waitUntil: 'networkidle' });
  await wait(1500);

  const bookTransferBtn = page.locator('button:has-text("Pesan Antar Jemput"), button:has-text("Pesan Sekarang"), button:has-text("Booking")').first();
  if (await bookTransferBtn.count() > 0) {
    await bookTransferBtn.click();
    await wait(1000);

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
    await wait(600);

    await page.screenshot({
      path: path.join(screenshotsDir, 'flow_6_checkout_modal_gateway.png'),
      clip: { x: 0, y: 0, width: 1440, height: 900 }
    });
  }

  // ========================================================
  // 7. FLOW 7: E-TICKET & INVOICE MANAGEMENT
  // ========================================================
  console.log('Capturing Flow 7: Booking Status & E-Ticket...');
  await page.goto('http://localhost:3000/bookings', { waitUntil: 'networkidle' });
  await wait(1500);

  await page.screenshot({
    path: path.join(screenshotsDir, 'flow_7_cek_status_dan_tiket.png'),
    clip: { x: 0, y: 75, width: 1440, height: 860 }
  });

  // Convert all images to Base64 to ensure self-contained, lightning-fast rendering in PDF
  console.log('--- STEP 2: PREPARING EMBEDDED IMAGES FOR PDF ---');
  const toBase64 = (filename) => {
    const fullPath = path.join(screenshotsDir, filename);
    if (fs.existsSync(fullPath)) {
      const bitmap = fs.readFileSync(fullPath);
      return `data:image/png;base64,${bitmap.toString('base64')}`;
    }
    return '';
  };

  const imgFlow1 = toBase64('flow_1_katalog_tur.png');
  const imgFlow2 = toBase64('flow_2_detail_tur.png');
  const imgFlow3 = toBase64('flow_3_kalender_dan_kategori.png');
  const imgFlow4 = toBase64('flow_4_formulir_data_tamu.png');
  const imgFlow5 = toBase64('flow_5_review_pesanan_dan_opsi_bayar.png');
  const imgFlow6 = toBase64('flow_6_checkout_modal_gateway.png');
  const imgFlow7 = toBase64('flow_7_cek_status_dan_tiket.png');

  console.log('--- STEP 3: CREATING HTML DOCUMENT FOR PDF ---');
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Panduan Alur Pemesanan & Pembayaran Wisata - PT Sawah Jaya Trans</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #1e293b;
      background-color: #f8fafc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      position: relative;
      background: #ffffff;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16mm 18mm 14mm 18mm;
    }

    /* COVER PAGE */
    .cover-page {
      background: linear-gradient(135deg, #182e28 0%, #203c34 50%, #315B4F 100%);
      color: #ffffff;
      padding: 22mm 20mm;
    }

    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 12px;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #D6B16D;
    }

    .brand-sub {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-family: 'JetBrains Mono', monospace;
    }

    .badge-pill {
      background: rgba(214, 177, 109, 0.15);
      border: 1px solid #D6B16D;
      color: #D6B16D;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }

    .cover-body {
      margin: auto 0;
    }

    .cover-h1 {
      font-family: 'Playfair Display', serif;
      font-size: 38px;
      line-height: 1.18;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 16px;
    }

    .cover-h1 span {
      color: #D6B16D;
    }

    .cover-desc {
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.85);
      max-width: 540px;
      margin-bottom: 30px;
    }

    .meta-card {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      padding: 16px 20px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .meta-item-label {
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 4px;
    }

    .meta-item-value {
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
    }

    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 12px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      font-family: 'JetBrains Mono', monospace;
    }

    /* INNER PAGES */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }

    .page-step-num {
      display: inline-flex;
      align-items: center;
      background: #315B4F;
      color: #ffffff;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      font-family: 'JetBrains Mono', monospace;
    }

    .page-app-name {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .step-title-block {
      margin-bottom: 12px;
    }

    .step-title {
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
    }

    .step-subtitle {
      font-size: 11.5px;
      color: #475569;
      margin-top: 4px;
      line-height: 1.45;
    }

    /* SCREENSHOT FRAME */
    .screenshot-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #f1f5f9;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      position: relative;
    }

    .browser-bar {
      height: 22px;
      background: #e2e8f0;
      border-bottom: 1px solid #cbd5e1;
      display: flex;
      align-items: center;
      padding: 0 10px;
      gap: 6px;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #eab308; }
    .dot-green { background: #22c55e; }

    .browser-url {
      margin-left: 8px;
      background: #ffffff;
      border-radius: 4px;
      padding: 1px 12px;
      font-size: 9px;
      font-family: 'JetBrains Mono', monospace;
      color: #475569;
      flex: 1;
      max-width: 320px;
      border: 1px solid #cbd5e1;
    }

    .screenshot-img {
      width: 100%;
      height: auto;
      max-height: 165mm;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    /* DETAILS CARD */
    .flow-details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 12px;
    }

    .detail-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 9px 12px;
    }

    .detail-card-title {
      font-size: 10px;
      font-weight: 700;
      color: #315B4F;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .detail-card-text {
      font-size: 10px;
      line-height: 1.4;
      color: #334155;
    }

    /* PAGE FOOTER */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 10px;
      font-size: 9.5px;
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
    }

    /* FLOW OVERVIEW TABLE */
    .flow-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }

    .flow-table th {
      background: #315B4F;
      color: #ffffff;
      font-size: 10.5px;
      text-align: left;
      padding: 10px 14px;
      font-weight: 700;
    }

    .flow-table td {
      font-size: 10px;
      padding: 10px 14px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      line-height: 1.45;
    }

    .flow-table tr:nth-child(even) {
      background: #f8fafc;
    }

    .tag-green {
      display: inline-block;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
    }
  </style>
</head>
<body>

  <!-- ========================================================= -->
  <!-- PAGE 1: COVER PAGE -->
  <!-- ========================================================= -->
  <div class="page cover-page">
    <div class="cover-header">
      <div>
        <div class="brand-title">SMART JOURNEY</div>
        <div class="brand-sub">PT SAWAH JAYA TRANS • INDONESIA</div>
      </div>
      <div class="badge-pill">DOKUMEN RESMI SOP 2026</div>
    </div>

    <div class="cover-body">
      <h1 class="cover-h1">
        Dokumen Alur Pemesanan &amp;<br />
        <span>Checkout Pembayaran</span><br />
        Layanan Wisata
      </h1>
      <p class="cover-desc">
        Panduan komprehensif visual langkah demi langkah (flow-by-flow) proses reservasi tur wisata privat dan antar jemput, mulai dari kurasi destinasi, pemilihan tanggal kalender, kategori tamu domestik &amp; mancanegara, hingga konfirmasi pembayaran terverifikasi melalui ArtoPay Gateway.
      </p>

      <div class="meta-card">
        <div>
          <div class="meta-item-label">Platform &amp; Versi</div>
          <div class="meta-item-value">Smart Journey Web v3.4</div>
        </div>
        <div>
          <div class="meta-item-label">Payment Gateway</div>
          <div class="meta-item-value">ArtoPay (QRIS &amp; VA)</div>
        </div>
        <div>
          <div class="meta-item-label">Tanggal Rilis</div>
          <div class="meta-item-value">September 2026</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <span>PT SAWAH JAYA TRANS — ALL RIGHTS RESERVED</span>
      <span>HALAMAN 1 DARI 9</span>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- PAGE 2: EXECUTIVE SUMMARY & WORKFLOW ARCHITECTURE -->
  <!-- ========================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="page-step-num">ARSITEKTUR ALUR</span>
      <span class="page-app-name">SMART JOURNEY • BOOKING ENGINE</span>
    </div>

    <div class="step-title-block">
      <h2 class="step-title">Ringkasan Eksekutif &amp; Peta Alur Transaksi</h2>
      <p class="step-subtitle">
        Gambaran menyeluruh tahapan reservasi yang dirancang dengan prinsip single-flow, responsif, bebas redundansi, serta mematuhi standar keamanan transaksi perbankan.
      </p>
    </div>

    <table class="flow-table">
      <thead>
        <tr>
          <th style="width: 14%;">Langkah</th>
          <th style="width: 28%;">Fungsi &amp; Antarmuka</th>
          <th style="width: 38%;">Aktivitas Pengguna &amp; Logika Sistem</th>
          <th style="width: 20%;">Indikator Keberhasilan</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Langkah 1</strong></td>
          <td><strong>Katalog Pilihan Tur</strong><br /><span style="color:#64748b; font-size:9px;">Route: /tours</span></td>
          <td>Wisatawan mengeksplorasi pilihan paket (Bromo Sunrise, Ijen Crater, Tumpak Sewu, Bali Overland) dengan filter durasi dan harga transparan.</td>
          <td><span class="tag-green">Kartu Tur Terpilih</span></td>
        </tr>
        <tr>
          <td><strong>Langkah 2</strong></td>
          <td><strong>Detail &amp; Itinerary</strong><br /><span style="color:#64748b; font-size:9px;">Route: /tours?selectedTourId=...</span></td>
          <td>Memeriksa fasilitas paket (Jeep 4x4, Driver, Tiket TNBTS), rute jam demi jam, foto resolusi tinggi, dan kebijakan pembatalan.</td>
          <td><span class="tag-green">Informasi Terverifikasi</span></td>
        </tr>
        <tr>
          <td><strong>Langkah 3</strong></td>
          <td><strong>Kalender &amp; Kategori Tamu</strong><br /><span style="color:#64748b; font-size:9px;">Interactive Booking Widget</span></td>
          <td>Memilih tanggal keberangkatan pada kalender interaktif, memilih kategori tamu (🇮🇩 Domestic / 🌐 Foreigner), dan jumlah pax. Harga dihitung otomatis tanpa biaya tersembunyi.</td>
          <td><span class="tag-green">Slot Terkunci &amp; Tarif Siap</span></td>
        </tr>
        <tr>
          <td><strong>Langkah 4</strong></td>
          <td><strong>Formulir Data Tamu</strong><br /><span style="color:#64748b; font-size:9px;">Booking Registration Form</span></td>
          <td>Mengisi identitas pemesan utama (Nama Sesuai KTP/Paspor, WhatsApp/WeChat, Email) serta alamat penjemputan (Hotel/Bandara/Stasiun).</td>
          <td><span class="tag-green">Data Lengkap &amp; Tervalidasi</span></td>
        </tr>
        <tr>
          <td><strong>Langkah 5</strong></td>
          <td><strong>Review Pesanan &amp; Opsi Bayar</strong><br /><span style="color:#64748b; font-size:9px;">Payment Scheme Selector</span></td>
          <td>Memilih skema pembayaran: Lunas (100%) atau Bayar DP (50% pelunasan di lokasi). Sistem menampilkan rincian biaya resmi dan garansi bebas risiko.</td>
          <td><span class="tag-green">Skema Pembayaran Dipilih</span></td>
        </tr>
        <tr>
          <td><strong>Langkah 6</strong></td>
          <td><strong>Checkout ArtoPay Gateway</strong><br /><span style="color:#64748b; font-size:9px;">Secure Payment Window</span></td>
          <td>Jendela resmi ArtoPay memproses transaksi via QRIS Nasional instan, Transfer Virtual Account (BCA, Mandiri, BRI, BNI), Kartu Kredit, atau WeChat Pay.</td>
          <td><span class="tag-green">Payment Intent Created</span></td>
        </tr>
        <tr>
          <td><strong>Langkah 7</strong></td>
          <td><strong>Konfirmasi &amp; E-Ticket</strong><br /><span style="color:#64748b; font-size:9px;">Route: /bookings</span></td>
          <td>Menerima Kode Booking resmi (SJ-XXXXXX), e-voucher tiket dengan QR barcode, rincian kontak driver, dan notifikasi konfirmasi instan via WhatsApp.</td>
          <td><span class="tag-green">Booking Confirmed</span></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 14px; padding: 12px 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 10.5px; color: #065f46; line-height: 1.5;">
      <strong>Catatan Kepatuhan Sistem:</strong> Seluruh alur telah dioptimalkan untuk pengunjung internasional maupun domestik. Istilah singkatan ambigu seperti "WNI" atau "WNA" telah distandarkan menjadi <strong>Domestic</strong> dan <strong>Foreigner (China / International)</strong> untuk mencegah kekeliruan pemesanan tiket masuk taman nasional.
    </div>

    <div class="page-footer">
      <span>PT SAWAH JAYA TRANS • RINGKASAN ALUR</span>
      <span>HALAMAN 2 DARI 9</span>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- PAGE 3: FLOW 1 - KATALOG PILIHAN TUR -->
  <!-- ========================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="page-step-num">LANGKAH 01</span>
      <span class="page-app-name">KATALOG &amp; EKSPLORASI TUR WISATA</span>
    </div>

    <div class="step-title-block">
      <h2 class="step-title">Katalog &amp; Kurasi Paket Wisata</h2>
      <p class="step-subtitle">
        Wisatawan menjelajahi beragam pilihan destinasi gunung berapi, air terjun, dan paket overland dengan informasi tarif awal, estimasi durasi, dan rating ulasan terverifikasi.
      </p>
    </div>

    <div class="screenshot-container">
      <div class="browser-bar">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
        <div class="browser-url">https://smartjourney.co.id/tours</div>
      </div>
      <img src="${imgFlow1}" class="screenshot-img" alt="Katalog Tur" />
    </div>

    <div class="flow-details-grid">
      <div class="detail-card">
        <div class="detail-card-title">🔍 Filter &amp; Pencarian</div>
        <div class="detail-card-text">Pencarian cerdas berdasarkan durasi (1 Hari, 2 Hari 1 Malam, 3 Hari 2 Malam) serta tipe pengalaman wisata.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">🏷️ Kategori Terstandar</div>
        <div class="detail-card-text">Badge kategori memperjelas jenis tur: Private Volcano Tour, Overland Expedition, atau Open Trip Sharing.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">⚡ Tindakan Pengguna</div>
        <div class="detail-card-text">Mengklik tombol <strong>"Detail &amp; Pesan"</strong> untuk membuka lembar informasi komprehensif destinasi terkait.</div>
      </div>
    </div>

    <div class="page-footer">
      <span>SMART JOURNEY BOOKING FLOW • FLOW 1</span>
      <span>HALAMAN 3 DARI 9</span>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- PAGE 4: FLOW 2 - DETAIL TUR & ITINERARY -->
  <!-- ========================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="page-step-num">LANGKAH 02</span>
      <span class="page-app-name">INFORMASI DETAIL, FASILITAS &amp; RUTE</span>
    </div>

    <div class="step-title-block">
      <h2 class="step-title">Detail Tur, Fasilitas &amp; Itinerary Perjalanan</h2>
      <p class="step-subtitle">
        Halaman detail menyajikan galeri foto autentik, fasilitas armada (Jeep 4x4 &amp; MPV Executive), rute perjalanan jam demi jam, serta daftar fasilitas yang termasuk dan tidak termasuk.
      </p>
    </div>

    <div class="screenshot-container">
      <div class="browser-bar">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
        <div class="browser-url">https://smartjourney.co.id/tours?selectedTourId=tour-sj870002</div>
      </div>
      <img src="${imgFlow2}" class="screenshot-img" alt="Detail Tur" />
    </div>

    <div class="flow-details-grid">
      <div class="detail-card">
        <div class="detail-card-title">📸 Galeri Visual Asli</div>
        <div class="detail-card-text">Menampilkan dokumentasi riil titik sunrise Penanjakan, kawah Bromo, Pasir Berbisik, dan padang savana.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">🕒 Jadwal Lengkap</div>
        <div class="detail-card-text">Itinerary detail mulai dari penjemputan tengah malam (00:00) hingga kepulangan kembali ke hotel (12:00 siang).</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">🛡️ Kepastian Fasilitas</div>
        <div class="detail-card-text">Daftar item transparan: Tiket Masuk TNBTS, Masker Gas, Driver merangkap Fotografer, dan Asuransi Jasa Raharja.</div>
      </div>
    </div>

    <div class="page-footer">
      <span>SMART JOURNEY BOOKING FLOW • FLOW 2</span>
      <span>HALAMAN 4 DARI 9</span>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- PAGE 5: FLOW 3 - KALENDER & KATEGORI TAMU -->
  <!-- ========================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="page-step-num">LANGKAH 03</span>
      <span class="page-app-name">KALENDER &amp; KATEGORI TAMU (DOMESTIC / FOREIGNER)</span>
    </div>

    <div class="step-title-block">
      <h2 class="step-title">Pemilihan Tanggal, Kategori Tamu &amp; Kalkulasi Harga</h2>
      <p class="step-subtitle">
        Widget pemesanan interaktif memungkinkan penentuan tanggal keberangkatan, pemilihan kategori tamu yang jelas (Domestic vs Foreigner), jumlah pax, dan transparansi kalkulasi tarif.
      </p>
    </div>

    <div class="screenshot-container">
      <div class="browser-bar">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
        <div class="browser-url">https://smartjourney.co.id/tours#booking-section</div>
      </div>
      <img src="${imgFlow3}" class="screenshot-img" alt="Kalender & Kategori Tamu" />
    </div>

    <div class="flow-details-grid">
      <div class="detail-card">
        <div class="detail-card-title">📅 Live Calendar</div>
        <div class="detail-card-text">Pilihan tanggal real-time dengan status slot tersedia setiap hari tanpa batas kuota kaku untuk private tour.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">🌐 Kategori Tamu Baru</div>
        <div class="detail-card-text">Pilihan intuitif <strong>🇮🇩 Domestic</strong> dan <strong>🌐 Foreigner</strong> (China / International) mempermudah regulasi tiket TNBTS.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">💰 Kalkulasi Instan</div>
        <div class="detail-card-text">Total harga dihitung otomatis sesuai jumlah pax, bebas biaya tersembunyi, dengan konversi mata uang (IDR / USD / CNY).</div>
      </div>
    </div>

    <div class="page-footer">
      <span>SMART JOURNEY BOOKING FLOW • FLOW 3</span>
      <span>HALAMAN 5 DARI 9</span>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- PAGE 6: FLOW 4 - FORMULIR DATA TAMU -->
  <!-- ========================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="page-step-num">LANGKAH 04</span>
      <span class="page-app-name">FORMULIR PENDAFTARAN &amp; DATA PENJEMPUTAN</span>
    </div>

    <div class="step-title-block">
      <h2 class="step-title">Formulir Registrasi Data Pemesan Utama</h2>
      <p class="step-subtitle">
        Formulir resmi untuk melengkapi data kontak penting, nomor kontak darurat, alamat penjemputan di hotel/stasiun/bandara, dan catatan kustom wisatawan.
      </p>
    </div>

    <div class="screenshot-container">
      <div class="browser-bar">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
        <div class="browser-url">https://smartjourney.co.id/tours/checkout#registration</div>
      </div>
      <img src="${imgFlow4}" class="screenshot-img" alt="Formulir Data Tamu" />
    </div>

    <div class="flow-details-grid">
      <div class="detail-card">
        <div class="detail-card-title">👤 Identitas Terverifikasi</div>
        <div class="detail-card-text">Pengisian Nama Lengkap (KTP / Paspor) dan English Name untuk penerbitan tiket resmi konservasi taman nasional.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">📍 Titik Penjemputan Tepat</div>
        <div class="detail-card-text">Kolom khusus alamat akurat (Nama Hotel &amp; Kota) agar armada operasional menjemput tepat waktu di lobby.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">📱 Kontak WhatsApp / WeChat</div>
        <div class="detail-card-text">Menyimpan nomor kontak aktif untuk koordinasi langsung dengan tim dispatch &amp; pengemudi lapangan H-1 keberangkatan.</div>
      </div>
    </div>

    <div class="page-footer">
      <span>SMART JOURNEY BOOKING FLOW • FLOW 4</span>
      <span>HALAMAN 6 DARI 9</span>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- PAGE 7: FLOW 5 - REVIEW PESANAN & OPSI BAYAR -->
  <!-- ========================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="page-step-num">LANGKAH 05</span>
      <span class="page-app-name">REVIEW BIAYA &amp; SKEMA PEMBAYARAN</span>
    </div>

    <div class="step-title-block">
      <h2 class="step-title">Review Rincian Pesanan &amp; Skema Pembayaran</h2>
      <p class="step-subtitle">
        Wisatawan meninjau kembali ringkasan pesanan dan dapat memilih fleksibilitas pembayaran: Pelunasan 100% atau Uang Muka (DP 50%) dengan pelunasan saat penjemputan.
      </p>
    </div>

    <div class="screenshot-container">
      <div class="browser-bar">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
        <div class="browser-url">https://smartjourney.co.id/tours/checkout#payment-options</div>
      </div>
      <img src="${imgFlow5}" class="screenshot-img" alt="Review Biaya & Opsi Bayar" />
    </div>

    <div class="flow-details-grid">
      <div class="detail-card">
        <div class="detail-card-title">💳 Opsi Pembayaran DP</div>
        <div class="detail-card-text">Kemudahan membayar deposit 50% untuk mengunci kursi &amp; Jeep, sisa biaya diselesaikan secara tunai saat hari-H.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">🛡️ Garansi Pembatalan</div>
        <div class="detail-card-text">Perlindungan garansi pembatalan gratis hingga 24 jam sebelum jadwal penjemputan dengan pengembalian dana mudah.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">🧾 Transparansi Pajak</div>
        <div class="detail-card-text">Tanpa biaya kartu tersembunyi (0% admin fee); nominal pada layar adalah jumlah persis yang ditagihkan.</div>
      </div>
    </div>

    <div class="page-footer">
      <span>SMART JOURNEY BOOKING FLOW • FLOW 5</span>
      <span>HALAMAN 7 DARI 9</span>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- PAGE 8: FLOW 6 - MODAL CHECKOUT & GERBANG ARTOPAY -->
  <!-- ========================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="page-step-num">LANGKAH 06</span>
      <span class="page-app-name">GERBANG PEMBAYARAN DIGITAL ARTOPAY</span>
    </div>

    <div class="step-title-block">
      <h2 class="step-title">Checkout Aman via Gerbang Pembayaran ArtoPay</h2>
      <p class="step-subtitle">
        Proses otorisasi pembayaran resmi berstandar Bank Indonesia dan PCI-DSS. Mendukung QRIS instan seluruh bank, Virtual Account, Kartu Kredit, dan e-Wallet internasional.
      </p>
    </div>

    <div class="screenshot-container">
      <div class="browser-bar">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
        <div class="browser-url">https://secure.artopay.online/checkout/pay</div>
      </div>
      <img src="${imgFlow6}" class="screenshot-img" alt="Checkout Modal Gateway" />
    </div>

    <div class="flow-details-grid">
      <div class="detail-card">
        <div class="detail-card-title">📱 QRIS Nasional Instan</div>
        <div class="detail-card-text">Mendukung BCA, GoPay, OVO, Dana, ShopeePay, LinkAja, dan seluruh aplikasi Mobile Banking dengan scan langsung.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">🏦 Virtual Account Bank</div>
        <div class="detail-card-text">Nomor rekening unik otomatis untuk nasabah BCA, Mandiri, BNI, BRI, dan Permata Bank dengan verifikasi otomatis detik itu juga.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">🌏 Wisatawan Asing</div>
        <div class="detail-card-text">Menerima Visa, Mastercard, JCB internasional, serta integrasi dompet digital WeChat Pay &amp; Alipay untuk turis mancanegara.</div>
      </div>
    </div>

    <div class="page-footer">
      <span>SMART JOURNEY BOOKING FLOW • FLOW 6</span>
      <span>HALAMAN 8 DARI 9</span>
    </div>
  </div>

  <!-- ========================================================= -->
  <!-- PAGE 9: FLOW 7 - KONFIRMASI RESERVASI & E-TICKET -->
  <!-- ========================================================= -->
  <div class="page">
    <div class="page-header">
      <span class="page-step-num">LANGKAH 07</span>
      <span class="page-app-name">INVOICE RESMI, E-TICKET &amp; CEK STATUS</span>
    </div>

    <div class="step-title-block">
      <h2 class="step-title">Konfirmasi Reservasi, E-Ticket &amp; Invoice Resmi</h2>
      <p class="step-subtitle">
        Setelah pembayaran berhasil diverifikasi, sistem menerbitkan Kode Booking unik resmi (SJ-XXXXXX), e-ticket digital, serta menyediakan portal pengecekan status kapan saja.
      </p>
    </div>

    <div class="screenshot-container">
      <div class="browser-bar">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
        <div class="browser-url">https://smartjourney.co.id/bookings</div>
      </div>
      <img src="${imgFlow7}" class="screenshot-img" alt="Status Booking & E-Ticket" />
    </div>

    <div class="flow-details-grid">
      <div class="detail-card">
        <div class="detail-card-title">🎟️ Kode Booking Unik</div>
        <div class="detail-card-text">Setiap transaksi mendapatkan kode alfanumerik resmi untuk memudahkan pelacakan status dan verifikasi di lapangan.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">🔍 Cek Status 24/7</div>
        <div class="detail-card-text">Wisatawan dapat memasukkan kode pemesanan dan email di menu <strong>"Cek Status Booking"</strong> untuk melihat detail tiket.</div>
      </div>
      <div class="detail-card">
        <div class="detail-card-title">💬 Dispatch Otomatis</div>
        <div class="detail-card-text">Informasi nama pengemudi, plat nomor kendaraan, dan estimasi waktu penjemputan dikirimkan secara otomatis via WhatsApp.</div>
      </div>
    </div>

    <div class="page-footer">
      <span>PT SAWAH JAYA TRANS • STATUS RESERVASI</span>
      <span>HALAMAN 9 DARI 9</span>
    </div>
  </div>

</body>
</html>`;

  const htmlDocPath = path.join(publicDir, 'booking_flow_guide.html');
  fs.writeFileSync(htmlDocPath, htmlContent, 'utf-8');
  console.log('HTML guide document successfully generated at:', htmlDocPath);

  // ========================================================
  // STEP 4: RENDER HTML TO HIGH-RESOLUTION VECTOR PDF
  // ========================================================
  console.log('--- STEP 4: RENDERING PDF WITH PLAYWRIGHT ---');
  const pdfPage = await context.newPage();
  await pdfPage.goto(`file://${htmlDocPath}`, { waitUntil: 'networkidle' });
  await wait(1000);

  const pdfOutputPath = path.join(publicDir, 'smart_journey_booking_flow_guide.pdf');
  await pdfPage.pdf({
    path: pdfOutputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm'
    }
  });

  const pdfStats = fs.statSync(pdfOutputPath);
  console.log(`\n======================================================`);
  console.log(`SUCCESS! PDF successfully compiled:`);
  console.log(`File: ${pdfOutputPath}`);
  console.log(`Size: ${(pdfStats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Accessible at URL: /smart_journey_booking_flow_guide.pdf`);
  console.log(`======================================================\n`);

  await browser.close();
}

main().catch(err => {
  console.error('Fatal execution error during PDF generation:', err);
  process.exit(1);
});
