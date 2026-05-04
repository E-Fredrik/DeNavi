import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";

// Create Snap API instance
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true" || process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-placeholder"
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizer = await prisma.organizer.findUnique({
      where: { authUserId: session.user.id },
    });

    if (!organizer) {
      return NextResponse.json({ error: "No organizer profile" }, { status: 400 });
    }

    const body = await request.json();
    const amountTokens = Math.max(1, Number(body.amount) || 1);
    const tokenPriceRp = 10000; // Rp 10,000 per token
    const totalRp = amountTokens * tokenPriceRp;

    // Create a transaction in DB
    const transaction = await prisma.transaction.create({
      data: {
        organizerId: organizer.id,
        amountTokens,
        amountRp: totalRp,
        status: "PENDING",
      }
    });

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: transaction.id,
        gross_amount: totalRp
      },
      customer_details: {
        first_name: organizer.name,
        email: organizer.email || session.user.email,
        phone: organizer.whatsapp || ""
      },
      item_details: [{
        id: "TOKEN",
        price: tokenPriceRp,
        quantity: amountTokens,
        name: "Navi Event Token"
      }]
    };

    const midtransTransaction = await snap.createTransaction(parameter);

    // Update transaction with midtrans token/url (optional, since frontend will use the token)
    return NextResponse.json({ 
      token: midtransTransaction.token, 
      redirect_url: midtransTransaction.redirect_url,
      transactionId: transaction.id
    });
  } catch (error: any) {
    console.error("Midtrans Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create transaction" }, { status: 500 });
  }
}
