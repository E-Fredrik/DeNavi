// Mirrors the Prisma schema exactly

export type AccountType = "INDIVIDUAL" | "ORGANIZER";

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
  createdAt: Date;
}

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  qrTicket: string;
  hasCheckedIn: boolean;
  isPlusOne: boolean;
  checkInTime: Date | null;
}

// Extended types with relations
export interface EventWithGuests extends Event {
  guests: Guest[];
}

export interface OrganizerWithEvents extends Organizer {
  events: EventWithGuests[];
}

// User type matching the new schema
export interface NaviUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: AccountType;
  organizerName: string | null;
  accessCode: string | null;
}
