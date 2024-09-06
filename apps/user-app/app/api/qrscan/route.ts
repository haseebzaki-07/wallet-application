


import prisma from '@repo/db/clients'; 
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../lib/auth';

export async function POST(req : NextRequest, res :NextResponse) {


 

  try {

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
  
    const userId = session.user.id;
    // Parse the request body
    const {  merchantId, amount, product } = await req.json();

    // Input validation
    if (!userId || !merchantId || !amount || !product || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid input' });
    }

    // Convert merchantId to an integer
    const merchantIdInt = Number(merchantId);

    // Fetch or create the merchant's balance record
    let merchantBalance = await prisma.merchantBalance.findUnique({
      where: { merchantId: merchantIdInt },
    });

    // If the merchant balance doesn't exist, create a new balance of 0
    if (!merchantBalance) {
      merchantBalance = await prisma.merchantBalance.upsert({
        data: {
          merchantId: merchantIdInt,
          balance: 0,
        },
      });
    }

    // Calculate the new balance by adding the amount
    const newBalance = merchantBalance.balance + amount*100;

    // Update the merchant's balance in the database
    await prisma.merchantBalance.upsert({
      where: { merchantId: merchantIdInt },
      data: { balance: newBalance },
    });

    // Create a new transaction record
    await prisma.usertoMerchantTransfer.upsert({
      data: {
        amount,
        datetime: new Date(),
        userId: parseInt(userId, 10),
        merchantId: merchantIdInt,
        product,
      },
    });

    // Return success response
    return NextResponse.json({ success: true, newBalance }, {status: 200});
  } catch (error) {
    console.error('Transaction Error:', error);
    // Return an error response in case of failure
    return NextResponse.json({ error: 'Transaction failed. Please try again.' });
  }
}
