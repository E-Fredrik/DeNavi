import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import nodemailer from "nodemailer";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; guestId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, guestId } = await params;
    
    // Authorization check
    const organizer = await prisma.organizer.findUnique({
      where: { authUserId: session.user.id },
    });
    if (!organizer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId: organizer.id },
    });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const guest = await prisma.guest.findFirst({
      where: { id: guestId, eventId },
    });
    if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

    const body = await request.json();
    const email = body.email;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate Check-In URL
    const host = request.headers.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const checkInUrl = `${baseUrl}/check-in/${guest.id}`;

    // Generate QR Code as Data URI containing the URL, so it can be scanned by any camera App
    const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      margin: 2
    });

    // Try to parse custom template or use default
    let config = {
      bgColor: "#f9fafb",
      cardColor: "#ffffff",
      textColor: "#111827",
      accentColor: "#6366f1",
      title: "You're Invited!",
      bodyText: "We would be honored to have you at our special event. Please present the QR code below at the check-in desk.",
      textAlign: "center"
    };

    if (event.emailTemplate) {
      try {
        const parsed = JSON.parse(event.emailTemplate);
        config = { ...config, ...parsed };
      } catch(e) {
        // Fallback if not valid JSON
      }
    }

    const htmlContent = `
      <div style="background-color: ${config.bgColor}; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-w-md; margin: 0 auto; background-color: ${config.cardColor}; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: ${config.textAlign};">
          <div style="background-color: ${config.accentColor}; color: white; padding: 30px 20px; font-size: 20px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; text-align: center;">
            ${event.name}
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: ${config.textColor}; margin-top: 0; font-size: 24px; font-weight: bold;">${config.title}</h2>
            <p style="color: ${config.textColor}; opacity: 0.9; line-height: 1.6; margin-bottom: 30px;">
              Hi ${guest.name},<br><br>
              ${config.bodyText.replace(/\\n/g, '<br>')}
            </p>
            
            <div style="margin: 0 auto; width: 200px; height: 200px; padding: 10px; background: white; border: 4px solid ${config.accentColor}; border-radius: 12px;">
              <img src="cid:qrcode" alt="Check-in QR Code" style="width: 100%; height: 100%; display: block;" />
            </div>
            
            <p style="color: ${config.textColor}; opacity: 0.6; font-size: 12px; margin-top: 24px; font-weight: 500;">
              Scan to check in securely at the venue.
            </p>
            <p style="color: ${config.textColor}; opacity: 0.5; font-size: 11px; margin-top: 10px;">
              Staff Check-in Link: <a href="${checkInUrl}" style="color: ${config.accentColor};">${checkInUrl}</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // Setup Nodemailer
    // In production, configure SMTP server. Using ethereal or generic test for demo
    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Create a test account if no SMTP info is provided
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: `"Navi Guestbook" <no-reply@navi.example.com>`,
      to: email,
      subject: `Invitation to ${event.name}`,
      html: htmlContent,
      attachments: [
        {
          filename: 'qrcode.png',
          path: qrDataUrl,
          cid: 'qrcode'
        }
      ]
    });
    
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Invitation error:", error);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
