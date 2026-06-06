"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { batchSendMessages, sendTextMessage } from "./waController";

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

  // Prepare messages for guests who haven't checked in and have a phone number
  const messagesToSend: {
    guestId: string;
    guestName: string;
    phone: string;
    message: string;
  }[] = [];

  for (const guest of event.guests) {
    const fullName = `${guest.firstName} ${guest.lastName}`.trim();

    // Skip guests who have already checked in
    if (guest.hasCheckedIn) {
      results.push({
        guestId: guest.id,
        guestName: fullName,
        status: "skipped",
        message: "Sudah check-in",
      });
      skipped++;
      continue;
    }

    // Skip guests without a phone number
    if (!guest.phone) {
      results.push({
        guestId: guest.id,
        guestName: fullName,
        status: "skipped",
        message: "Tidak ada nomor telepon",
      });
      skipped++;
      continue;
    }

    // Build personalized message with all template variables
    const personalizedMessage = messageTemplate
      .replace(/\{guestName\}/g, fullName)
      .replace(/\{firstName\}/g, guest.firstName)
      .replace(/\{lastName\}/g, guest.lastName)
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
      .replace(/\{seatNumber\}/g, guest.seatNumber || "-")
      .replace(/\{dresscode\}/g, event.dresscode || "-")
      .replace(/\{additionalInfo\}/g, event.additionalInfo || "-")
      .replace(/\{rsvpLink\}/g, `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/rsvp/${guest.id}`);

    messagesToSend.push({
      guestId: guest.id,
      guestName: fullName,
      phone: guest.phone,
      message: personalizedMessage,
    });
  }

  // Use the batched sender from waController for rate-limit safety
  if (messagesToSend.length > 0) {
    const batchItems = messagesToSend.map((m) => ({
      phone: m.phone,
      message: m.message,
    }));

    const batchResult = await batchSendMessages(batchItems, 50, 1000);

    // Map batch results back to guest info
    for (let i = 0; i < messagesToSend.length; i++) {
      const guestInfo = messagesToSend[i];
      const sendResult = batchResult.results[i];

      if (sendResult.success) {
        results.push({
          guestId: guestInfo.guestId,
          guestName: guestInfo.guestName,
          status: "sent",
          message: `ID Pesan: ${sendResult.messageId}`,
        });
        sent++;
      } else {
        results.push({
          guestId: guestInfo.guestId,
          guestName: guestInfo.guestName,
          status: "failed",
          message: sendResult.error || "Gagal mengirim",
        });
        failed++;
      }
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
