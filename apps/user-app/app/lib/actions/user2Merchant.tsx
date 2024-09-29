"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/clients";
const session = await getServerSession(authOptions);
const clientId = Number(session?.user?.id);

const ws = new WebSocket(`ws://localhost:8000?clientId=${clientId}`);

ws.onopen = () => {
  console.log(`WebSocket connection established for ${clientId}`);
};

ws.onmessage = (event) => {
  // Handle messages received from the server
  console.log("Message from server:", event.data);
};

ws.onerror = (error) => {
  console.error("WebSocket Error:", error);
};

ws.onclose = () => {
  console.log("WebSocket connection closed.");
};

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
    const notificationMessage = {
      notificationMessage: `Payment received of INR  ${amount} for ${product}.`,
      
    };

    ws.send(JSON.stringify(notificationMessage)); 
 

    return { success: true, message: "Payment successful." };
  } catch (error) {
    // Log the detailed error
    console.error("Transaction Error:", error);
    // Return an error response in case of failure
    return { success: false, message: "Transaction failed. Please try again." };
  }
}
