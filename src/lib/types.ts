// Mirrors the Prisma schema exactly

export type AccountType = "INDIVIDUAL" | "ORGANIZER";
export type GuestCategory = "GENERAL" | "VIP" | "KIDS" | "ADULTS";
export type SeatingMode = "ASSIGNED" | "SELF_SELECT";
export type AngpaoStatus = "PENDING" | "SUCCESS" | "NO_GIFT";

export interface Organizer {
  id: string;
  name: string;
  whatsapp: string | null;
  accessCode: string | null;
  tokenBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  organizerId: string;
  name: string;
  date: Date;
  tokenCost: number;
  dresscode: string | null;
  additionalInfo: string | null;
  seatingMode: SeatingMode;
  venueLayoutConfig: VenueLayoutConfig | null;
  createdAt: Date;
}

export interface Guest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  qrTicket: string;
  partySize: number;
  tableNumber: string | null;
  seatNumber: string | null;
  phone: string | null;
  hasCheckedIn: boolean;
  isPlusOne: boolean;
  checkInTime: Date | null;
  actualAttendees: number | null;
  category: GuestCategory;
  angpaoStatus: AngpaoStatus;
}

// Extended types with relations
export interface EventWithGuests extends Event {
  guests: Guest[];
}

export interface OrganizerWithEvents extends Organizer {
  events: EventWithGuests[];
}

// User type matching the schema
export interface NaviUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: AccountType;
  organizerName: string | null;
  accessCode: string | null;
}

// ─── Venue Layout Types ───────────────────────────────────────────────────────

export interface VenueTable {
  id: string;
  label: string;
  type: "round" | "long" | "vip";
  row: number;
  col: number;
  seats: number;      // how many seats at this table
  width: number;      // grid cells wide
  height: number;     // grid cells tall
}

export interface VenueLayoutConfig {
  gridRows: number;
  gridCols: number;
  stagePosition: "top" | "bottom" | "left" | "right";
  tables: VenueTable[];
}

// Helper to get full display name
export function getGuestDisplayName(guest: { firstName: string; lastName: string }): string {
  return `${guest.firstName} ${guest.lastName}`.trim();
}
