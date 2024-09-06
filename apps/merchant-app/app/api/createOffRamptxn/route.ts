
import { getServerSession } from "next-auth";

import prisma from "@repo/db/clients";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../lib/auth";

export async function POST(req: NextRequest, res: NextResponse) {
   
    if (req.method !== "POST") {
        return NextResponse.json({ message: "Method not allowed" });
    }
  

    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user?.id) {
        return NextResponse.json({ message: "Invalid session" });
    }

    const { provider, amount } = await req.json();
    const token = (Math.random() * 1000).toString();

    try {
        await prisma.offRampTransaction.create({
            data: {
                provider,
                status: "Success",
                token,
                startTime: new Date(),
                merchantId: Number(session.user.id),
                amount: amount * 100,
            },
        });

        return NextResponse.json({ message: "Transaction created successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to create transaction" });
    }
}
