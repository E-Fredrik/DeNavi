import type { Organizer, Event, Guest, EventWithGuests } from "./types";

// ── Utility ──
function uuid(): string {
  return crypto.randomUUID();
}

function generateAccessCode(): string {
  const seg = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NAVI-${seg()}-${seg()}`;
}

function generateQR(): string {
  return `QR-${uuid().substring(0, 8).toUpperCase()}`;
}

// ── Seed Data ──
const SEED_ORGANIZER: Organizer = {
  id: "org-001",
  name: "Bebe",
  whatsapp: "+6281234567890",
  accessCode: "NAVI-DEMO-2026",
  tokenBalance: 12,
  createdAt: new Date("2026-03-01"),
  updatedAt: new Date("2026-04-10"),
};

const SEED_GUESTS_E1: Guest[] = [
  { id: "g-001", eventId: "evt-001", firstName: "Budi", lastName: "Hartono", qrTicket: "QR-BH001AAA", partySize: 2, tableNumber: "Meja 1", seatNumber: null, phone: "+6281200000001", hasCheckedIn: true, isPlusOne: false, checkInTime: new Date("2026-04-12T18:05:00"), actualAttendees: 2, category: "GENERAL", angpaoStatus: "SUCCESS" },
  { id: "g-002", eventId: "evt-001", firstName: "Siti", lastName: "Nurhaliza", qrTicket: "QR-SN002BBB", partySize: 1, tableNumber: "Meja 2", seatNumber: null, phone: "+6281200000002", hasCheckedIn: true, isPlusOne: false, checkInTime: new Date("2026-04-12T18:12:00"), actualAttendees: 1, category: "VIP", angpaoStatus: "SUCCESS" },
  { id: "g-003", eventId: "evt-001", firstName: "Ahmad", lastName: "Dhani", qrTicket: "QR-AD003CCC", partySize: 2, tableNumber: "Meja 1", seatNumber: null, phone: "+6281200000003", hasCheckedIn: true, isPlusOne: false, checkInTime: new Date("2026-04-12T18:20:00"), actualAttendees: 2, category: "GENERAL", angpaoStatus: "NO_GIFT" },
  { id: "g-004", eventId: "evt-001", firstName: "Raisa", lastName: "Andriana", qrTicket: "QR-RA004DDD", partySize: 1, tableNumber: null, seatNumber: null, phone: "+6281200000004", hasCheckedIn: false, isPlusOne: false, checkInTime: null, actualAttendees: null, category: "VIP", angpaoStatus: "PENDING" },
  { id: "g-005", eventId: "evt-001", firstName: "Tulus", lastName: "Triawan", qrTicket: "QR-TT005EEE", partySize: 1, tableNumber: null, seatNumber: null, phone: "+6281200000005", hasCheckedIn: false, isPlusOne: false, checkInTime: null, actualAttendees: null, category: "GENERAL", angpaoStatus: "PENDING" },
  { id: "g-006", eventId: "evt-001", firstName: "Dewi", lastName: "Lestari", qrTicket: "QR-DL006FFF", partySize: 1, tableNumber: "Meja 3", seatNumber: null, phone: "+6281200000006", hasCheckedIn: true, isPlusOne: false, checkInTime: new Date("2026-04-12T18:30:00"), actualAttendees: 1, category: "ADULTS", angpaoStatus: "SUCCESS" },
  { id: "g-007", eventId: "evt-001", firstName: "Reza", lastName: "Rahadian", qrTicket: "QR-RR007GGG", partySize: 1, tableNumber: null, seatNumber: null, phone: null, hasCheckedIn: false, isPlusOne: false, checkInTime: null, actualAttendees: null, category: "GENERAL", angpaoStatus: "PENDING" },
  { id: "g-008", eventId: "evt-001", firstName: "Isyana", lastName: "Sarasvati", qrTicket: "QR-IS008HHH", partySize: 1, tableNumber: "Meja 2", seatNumber: null, phone: "+6281200000008", hasCheckedIn: true, isPlusOne: false, checkInTime: new Date("2026-04-12T18:35:00"), actualAttendees: 1, category: "VIP", angpaoStatus: "SUCCESS" },
  { id: "g-009", eventId: "evt-001", firstName: "Budi", lastName: "Hartono +1", qrTicket: "QR-BH009III", partySize: 1, tableNumber: "Meja 1", seatNumber: null, phone: null, hasCheckedIn: true, isPlusOne: true, checkInTime: new Date("2026-04-12T18:05:00"), actualAttendees: 1, category: "GENERAL", angpaoStatus: "PENDING" },
  { id: "g-010", eventId: "evt-001", firstName: "Ahmad", lastName: "Dhani +1", qrTicket: "QR-AD010JJJ", partySize: 1, tableNumber: "Meja 1", seatNumber: null, phone: null, hasCheckedIn: true, isPlusOne: true, checkInTime: new Date("2026-04-12T18:20:00"), actualAttendees: 1, category: "KIDS", angpaoStatus: "PENDING" },
];

const SEED_GUESTS_E2: Guest[] = [
  { id: "g-011", eventId: "evt-002", firstName: "Joko", lastName: "Widodo", qrTicket: "QR-JW011KKK", partySize: 2, tableNumber: null, seatNumber: null, phone: "+6281200000011", hasCheckedIn: false, isPlusOne: false, checkInTime: null, actualAttendees: null, category: "VIP", angpaoStatus: "PENDING" },
  { id: "g-012", eventId: "evt-002", firstName: "Megawati", lastName: "Sukarnoputri", qrTicket: "QR-MS012LLL", partySize: 1, tableNumber: null, seatNumber: null, phone: "+6281200000012", hasCheckedIn: false, isPlusOne: false, checkInTime: null, actualAttendees: null, category: "VIP", angpaoStatus: "PENDING" },
  { id: "g-013", eventId: "evt-002", firstName: "Anies", lastName: "Baswedan", qrTicket: "QR-AB013MMM", partySize: 1, tableNumber: null, seatNumber: null, phone: "+6281200000013", hasCheckedIn: false, isPlusOne: false, checkInTime: null, actualAttendees: null, category: "GENERAL", angpaoStatus: "PENDING" },
];

const SEED_EVENTS: Event[] = [
  { id: "evt-001", organizerId: "org-001", name: "Hartono–Wijaya Wedding Reception", date: new Date("2026-04-12"), tokenCost: 5, dresscode: "Formal / Batik", additionalInfo: "Parkir gratis di basement gedung", seatingMode: "ASSIGNED", venueLayoutConfig: null, createdAt: new Date("2026-03-15") },
  { id: "evt-002", organizerId: "org-001", name: "Annual Gala Dinner 2026", date: new Date("2026-06-20"), tokenCost: 4, dresscode: "Black Tie", additionalInfo: "Cocktail hour dimulai pukul 18:00", seatingMode: "SELF_SELECT", venueLayoutConfig: null, createdAt: new Date("2026-04-01") },
];

// ── In-Memory Store ──
class NaviDB {
  private readonly organizers: Organizer[] = [{ ...SEED_ORGANIZER }];
  private readonly events: Event[] = SEED_EVENTS.map((e) => ({ ...e }));
  private readonly guests: Guest[] = [...SEED_GUESTS_E1, ...SEED_GUESTS_E2].map((g) => ({ ...g }));

  // ── Organizer ──
  findOrganizerByAccessCode(code: string): Organizer | null {
    return this.organizers.find((o) => o.accessCode === code) ?? null;
  }

  getOrganizer(id: string): Organizer | null {
    return this.organizers.find((o) => o.id === id) ?? null;
  }

  updateOrganizerTokens(id: string, delta: number): Organizer | null {
    const org = this.organizers.find((o) => o.id === id);
    if (!org) return null;
    org.tokenBalance = Math.max(0, org.tokenBalance + delta);
    org.updatedAt = new Date();
    return { ...org };
  }

  // ── Events ──
  getEventsByOrganizer(organizerId: string): EventWithGuests[] {
    return this.events
      .filter((e) => e.organizerId === organizerId)
      .map((e) => ({
        ...e,
        guests: this.guests.filter((g) => g.eventId === e.id),
      }));
  }

  getEvent(id: string): EventWithGuests | null {
    const evt = this.events.find((e) => e.id === id);
    if (!evt) return null;
    return { ...evt, guests: this.guests.filter((g) => g.eventId === id) };
  }

  createEvent(data: { organizerId: string; name: string; date: Date; tokenCost: number }): Event {
    const evt: Event = {
      id: uuid(),
      ...data,
      dresscode: null,
      additionalInfo: null,
      seatingMode: "ASSIGNED",
      venueLayoutConfig: null,
      createdAt: new Date(),
    };
    this.events.push(evt);
    // Deduct tokens
    this.updateOrganizerTokens(data.organizerId, -data.tokenCost);
    return evt;
  }

  // ── Guests ──
  getGuest(id: string): Guest | null {
    return this.guests.find((g) => g.id === id) ?? null;
  }

  getGuestByQR(qr: string): Guest | null {
    return this.guests.find((g) => g.qrTicket === qr) ?? null;
  }

  addGuest(data: { eventId: string; firstName: string; lastName: string; isPlusOne?: boolean }): Guest {
    const guest: Guest = {
      id: uuid(),
      eventId: data.eventId,
      firstName: data.firstName,
      lastName: data.lastName,
      qrTicket: generateQR(),
      partySize: 1,
      tableNumber: null,
      seatNumber: null,
      phone: null,
      hasCheckedIn: false,
      isPlusOne: data.isPlusOne ?? false,
      checkInTime: null,
      actualAttendees: null,
      category: "GENERAL",
      angpaoStatus: "PENDING",
    };
    this.guests.push(guest);
    return guest;
  }

  checkInGuest(guestId: string): Guest | null {
    const guest = this.guests.find((g) => g.id === guestId);
    if (!guest || guest.hasCheckedIn) return null;
    guest.hasCheckedIn = true;
    guest.checkInTime = new Date();
    return { ...guest };
  }

  searchGuests(eventId: string, query: string): Guest[] {
    const q = query.toLowerCase();
    return this.guests.filter(
      (g) =>
        g.eventId === eventId &&
        (`${g.firstName} ${g.lastName}`).toLowerCase().includes(q)
    );
  }
}

// Singleton
export const db = new NaviDB();
export { generateAccessCode, generateQR };
