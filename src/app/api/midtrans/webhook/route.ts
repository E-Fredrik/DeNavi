import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";
import crypto from "crypto";

const apiClient = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-placeholder"
});

export async function POST(request: NextRequest) {
  try {
    const notificationJson = await request.json();
    
    // Validate signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder";
    const signatureKey = crypto.createHash("sha512")
      .update(notificationJson.order_id + notificationJson.status_code + notificationJson.gross_amount + serverKey)
      .digest("hex");

    if (signatureKey !== notificationJson.signature_key) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const transactionStatus = notificationJson.transaction_status;
    const fraudStatus = notificationJson.fraud_status;
    const orderId = notificationJson.order_id;

    // Fetch transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: orderId }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status === "SUCCESS") {
      // Already processed
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    let status = "PENDING";

    if (transactionStatus == 'capture'){
      if (fraudStatus == 'challenge'){
        status = "PENDING";
      } else if (fraudStatus == 'accept'){
        status = "SUCCESS";
      }
    } else if (transactionStatus == 'settlement'){
      status = "SUCCESS";
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire'){
      status = "FAILED";
    } else if (transactionStatus == 'pending'){
      status = "PENDING";
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id: orderId },
      data: { 
        status,
        midtransId: notificationJson.transaction_id,
        paymentType: notificationJson.payment_type
      }
    });

    if (status === "SUCCESS") {
      // Add tokens to organizer
      await prisma.organizer.update({
        where: { id: transaction.organizerId },
        data: { tokenBalance: { increment: transaction.amountTokens } }
      });
    }

    return NextResponse.json({ status: "OK" });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
