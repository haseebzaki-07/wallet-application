"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/clients";
import { io } from "socket.io-client";
const socket = io('http://localhost:8001');

export async function user2MerchantTransfer(
  merchantId: number,
  amount: number,
  product: string
) {
  try {
    // Get the session and validate the user
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);

    if (!userId) {
      return { success: false, message: "User not found." };
    }

    // Validate input parameters
    if (!product || amount <= 0) {
      return { success: false, message: "Invalid product or amount." };
    }

    const userBalance = await prisma.balance.findUnique({
      where: { userId: userId },
    });

    if (!userBalance?.amount || userBalance.amount < amount) {
      return { success: false, message: "Insufficient funds." };
    }

    // Deduct from user's balance
    await prisma.balance.update({
      where: { userId: userId },
      data: { amount: { decrement: amount * 100 } },
    });

    // Find or initialize the merchant balance
    let merchantBalance = await prisma.merchantBalance.findUnique({
      where: { merchantId: merchantId },
    });

    if (!merchantBalance) {
      merchantBalance = await prisma.merchantBalance.create({
        data: { merchantId: merchantId, balance: 0 },
      });
    }

    // Update merchant's balance
    const newBalance = merchantBalance.balance + amount * 100;
    await prisma.merchantBalance.update({
      where: { merchantId: merchantId },
      data: { balance: newBalance },
    });

    // Record the transfer in user-to-merchant transfers
    await prisma.usertoMerchantTransfer.create({
      data: {
        amount,
        datetime: new Date(),
        userId,
        merchantId,
        product,
      },
    });

    // Send WebSocket notification to the merchant

    socket.emit('payment_made', {
      merchantId, // The merchant receiving the payment
      amount, // The payment amount
      
      userId: 'user-123', // Some user ID
    });

    console.log(`Payment of $${amount} made to merchant ${merchantId}`);
    

    return { success: true, message: "Payment successful." };
  } catch (error) {
    console.error("Transaction Error:", error);
    return { success: false, message: "Transaction failed. Please try again." };
  }
}
