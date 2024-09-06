"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/clients";
// import {sendNotificationToMerchant} from "../../../../services/src/websocket/notification-server"

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
    console.log("user id: " + userId);
    // Validate input parameters
    if (!product || amount <= 0) {
      return { success: false, message: "Invalid product or amount." };
    }
    const userBalanace = await prisma.balance.findUnique({
      where : {
        userId : userId,
      }
    })
    console.log("user balanace: " + userBalanace.amount);

    if(!userBalanace.amount || amount <= 0) {
      return { success: false, message: "Insufficient funds." };
    }
    await prisma.balance.update({
      where: { userId: userId },
      data: { amount: { decrement: amount * 100 } }, 
    })
    // Find or initialize the merchant balance
    let merchantBalance = await prisma.merchantBalance.findUnique({
      where: { merchantId: merchantId },
    });

    // If the merchant balance doesn't exist, create it
    if (!merchantBalance) {
      merchantBalance = await prisma.merchantBalance.create({
        data: {
          merchantId: merchantId,
          balance: 0,
        },
      });
    }
    console.log("merchabt balancve : " + merchantBalance.balance);
    // Calculate the new balance and update it
    const newBalance = merchantBalance.balance + amount * 100; // Assuming amount is in cents

    console.log("new balance : " + newBalance);
    await prisma.merchantBalance.update({
      where: { merchantId: merchantId },
      data: { balance: newBalance },
    });

    await prisma.usertoMerchantTransfer.create({
      data: {
        amount,
        datetime: new Date(),
        userId,
        merchantId,
        product,
      },
    });


    console.log("after u2m transfer");
    // sendNotificationToMerchant(merchantId, {
    //   title: 'New Payment Received',
    //   message: `Payment of ${amount} for ${product}.`,
    //   datetime: new Date(),
    // });

    return { success: true, message: "Payment successful." };
  } catch (error) {
    // Log the detailed error
    console.error("Transaction Error:", error);
    // Return an error response in case of failure
    return { success: false, message: "Transaction failed. Please try again." };
  }
}
