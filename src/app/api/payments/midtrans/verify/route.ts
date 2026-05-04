import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true" || process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "dummy",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "dummy"
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: orderId }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Don't do anything if it's already successful and tokens were given
    if (transaction.status === "SUCCESS") {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // Verify transaction status with Midtrans
    const statusResponse = await snap.transaction.status(orderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let newStatus = "PENDING";
    if (transactionStatus == 'capture'){
      if (fraudStatus == 'challenge'){
        newStatus = "PENDING";
      } else if (fraudStatus == 'accept'){
        newStatus = "SUCCESS";
      }
    } else if (transactionStatus == 'settlement'){
      newStatus = "SUCCESS";
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire'){
      newStatus = "FAILED";
    } else if (transactionStatus == 'pending'){
      newStatus = "PENDING";
    }

    if (newStatus !== transaction.status) {
      await prisma.transaction.update({
        where: { id: orderId },
        data: { 
          status: newStatus,
          midtransId: statusResponse.transaction_id,
          paymentType: statusResponse.payment_type
        }
      });

      if (newStatus === "SUCCESS") {
        await prisma.organizer.update({
          where: { id: transaction.organizerId },
          data: { tokenBalance: { increment: transaction.amountTokens } }
        });
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Failed to verify transaction" }, { status: 500 });
  }
}
