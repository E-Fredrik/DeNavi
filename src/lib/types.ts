// Mirrors the Prisma schema exactly
export interface Organizer {
  id: string;
  name: string;
  whatsapp: string | null;
  accessCode: string; // NAVI-XXXX-XXXX
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
