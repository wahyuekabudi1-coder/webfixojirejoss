import { DatabaseState, Trip, Batch, Booking } from "./types";

const API_BASE = "/api";

export function recalculateBatchSeats(db: DatabaseState): DatabaseState {
  if (!db || !db.batches) return db;
  if (!db.bookings) db.bookings = [];

  db.batches.forEach((batch) => {
    const activeBookings = db.bookings.filter(
      (b) => Boolean(b.batchId) && b.batchId === batch.id && b.status !== "Rejected"
    );
    const totalBooked = activeBookings.reduce(
      (sum, b) => sum + (Number(b.participantsCount) || 1),
      0
    );
    const quota = Number(batch.quota) || 12;
    batch.availableSeats = Math.max(0, quota - totalBooked);

    if (batch.availableSeats <= 0) {
      batch.status = "Closed";
    } else if (batch.status === "Closed" && batch.availableSeats > 0) {
      batch.status = "Open";
    }
  });

  return db;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("smart_journey_admin_token") || localStorage.getItem("smartjourney_admin_token") || "admin-smart-journey-token";
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function fetchDB(): Promise<DatabaseState> {
  const res = await fetch(`${API_BASE}/db`);
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Failed to load ShareTour database (${res.status}): ${errText || res.statusText}`);
  }
  const db: DatabaseState = await res.json();
  return db;
}

export async function createTrip(trip: Omit<Trip, "id">): Promise<Trip> {
  const res = await fetch(`${API_BASE}/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(trip),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || `Failed to create trip on server database (Status ${res.status})`);
  }
  const serverTrip: Trip = await res.json();
  return serverTrip;
}

export async function updateTrip(id: string, trip: Partial<Trip>): Promise<Trip> {
  const res = await fetch(`${API_BASE}/trips/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(trip),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || `Failed to update trip on server database (Status ${res.status})`);
  }
  const updated: Trip = await res.json();
  return updated;
}

export async function deleteTrip(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/trips/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || `Failed to delete trip from server database (Status ${res.status})`);
  }
}

export async function createBatch(batch: Omit<Batch, "id">): Promise<Batch> {
  const res = await fetch(`${API_BASE}/batches`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || `Failed to create batch on server database (Status ${res.status})`);
  }
  const serverBatch: Batch = await res.json();
  return serverBatch;
}

export async function updateBatch(id: string, batch: Partial<Batch>): Promise<Batch> {
  const res = await fetch(`${API_BASE}/batches/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || `Failed to update batch on server database (Status ${res.status})`);
  }
  const updated: Batch = await res.json();
  return updated;
}

export async function deleteBatch(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/batches/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || `Failed to delete batch from server database (Status ${res.status})`);
  }
}

export async function createBooking(
  booking: Omit<Booking, "id" | "bookingCode" | "status" | "createdAt" | "tripTitle" | "departureDate">
): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || `Failed to submit booking to server (Status ${res.status})`);
  }
  const serverBooking: Booking = await res.json();
  return serverBooking;
}

export async function updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || `Failed to update booking on server database (Status ${res.status})`);
  }
  const updated: Booking = await res.json();
  return updated;
}

export async function adminLogin(email: string, password: string): Promise<{ token: string; success: boolean }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: "Email atau password administrator tidak valid." }));
    throw new Error(errData.error || "Email atau password administrator tidak valid.");
  }
  return res.json();
}

export async function purgeAllBookings(): Promise<void> {
  const res = await fetch(`${API_BASE}/bookings/purge`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || `Failed to purge bookings database (Status ${res.status})`);
  }
}

export async function importBulk(data: { trips: Trip[]; batches: Batch[]; mode: "append" | "overwrite" }): Promise<{ success: boolean; tripsCount: number; batchesCount: number }> {
  const res = await fetch(`${API_BASE}/import-bulk`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
    throw new Error(errData.error || "Failed to bulk import data into server database.");
  }
  const result = await res.json();
  return result;
}
