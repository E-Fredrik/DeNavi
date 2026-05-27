"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlastResult {
  guestId: string;
  guestName: string;
  status: "sent" | "failed" | "skipped";
  message?: string;
}

interface BlastResponse {
  success: boolean;
  eventName: string;
  totalGuests: number;
  sent: number;
  failed: number;
  skipped: number;
  results: BlastResult[];
}

// ─── Mock WhatsApp API ────────────────────────────────────────────────────────

async function mockSendWhatsApp(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string }> {
  // Simulate network delay (200-800ms)
  await new Promise((resolve) =>
    setTimeout(resolve, 200 + Math.random() * 600)
  );

  // 95% success rate simulation
  const success = Math.random() > 0.05;

  if (success) {
    return {
      success: true,
      messageId: `wa_${crypto.randomUUID().substring(0, 12)}`,
    };
  }
  return { success: false };
}

// ─── Send WhatsApp Blast ──────────────────────────────────────────────────────

export async function sendWhatsAppBlast(
  eventId: string,
  messageTemplate: string
): Promise<BlastResponse> {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer) {
    throw new Error("Organizer not found");
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId: organizer.id },
    include: {
      guests: true,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const results: BlastResult[] = [];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  // Iterate through all guests
  for (const guest of event.guests) {
    // Skip guests who have already checked in
    if (guest.hasCheckedIn) {
      results.push({
        guestId: guest.id,
        guestName: guest.name,
        status: "skipped",
        message: "Already checked in",
      });
      skipped++;
      continue;
    }

    // Build personalized message
    const personalizedMessage = messageTemplate
      .replace(/\{guestName\}/g, guest.name)
      .replace(/\{eventName\}/g, event.name)
      .replace(
        /\{eventDate\}/g,
        new Date(event.date).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      )
      .replace(/\{qrTicket\}/g, guest.qrTicket)
      .replace(/\{partySize\}/g, guest.partySize.toString())
      .replace(/\{tableNumber\}/g, guest.tableNumber || "-")
      .replace(/\{seatNumber\}/g, guest.seatNumber || "-");

    // Use actual phone number if available, otherwise fallback to mock for testing
    const targetPhone = (guest as any).phone || `+62812${Math.floor(Math.random() * 90000000 + 10000000)}`;

    try {
      const result = await mockSendWhatsApp(targetPhone, personalizedMessage);
      if (result.success) {
        results.push({
          guestId: guest.id,
          guestName: guest.name,
          status: "sent",
          message: `Message ID: ${result.messageId}`,
        });
        sent++;
      } else {
        results.push({
          guestId: guest.id,
          guestName: guest.name,
          status: "failed",
          message: "WhatsApp API returned failure",
        });
        failed++;
      }
    } catch {
      results.push({
        guestId: guest.id,
        guestName: guest.name,
        status: "failed",
        message: "Network error",
      });
      failed++;
    }
  }

  return {
    success: true,
    eventName: event.name,
    totalGuests: event.guests.length,
    sent,
    failed,
    skipped,
    results,
  };
}
