"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPromoCode(data: {
  code: string;
  rewardAmount: number;
  usageLimit?: number | null;
  expiryDate?: string | null;
}) {
  await prisma.promoCode.create({
    data: {
      code: data.code.toUpperCase(),
      rewardAmount: data.rewardAmount,
      usageLimit: data.usageLimit || null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    },
  });
  revalidatePath("/super-admin/dashboard/promo-codes");
}

export async function togglePromoCode(id: string, isActive: boolean) {
  await prisma.promoCode.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/super-admin/dashboard/promo-codes");
}

export async function deletePromoCode(id: string) {
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/super-admin/dashboard/promo-codes");
}