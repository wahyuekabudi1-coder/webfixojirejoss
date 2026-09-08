// Utility to download the 1-file booking guide PDF safely across all environments and iframes

export async function downloadBookingGuidePdf() {
  const fileName = 'Panduan_Alur_Pemesanan_Wisata_Smart_Journey.pdf';
  
  try {
    // 1. Fetch as Blob so download is triggered programmatically without iframe restriction
    const response = await fetch('/panduan_booking_smart_journey.pdf');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (error) {
    console.warn('Blob download failed, falling back to direct location:', error);
    // 2. Direct browser navigation fallback
    const link = document.createElement('a');
    link.href = '/download/booking-flow-pdf';
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);
  }
}
