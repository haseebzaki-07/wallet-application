import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/clients";
import P2PTransactions from "../../../components/P2PTransactions";

async function getp2pTransactions() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  // Fetch both sent and received transactions
  const sentTxns = await prisma.p2pTransfer.findMany({
    where: {
      fromUserId: userId,
    },
  });

  const receivedTxns = await prisma.p2pTransfer.findMany({
    where: {
      toUserId: userId,
    },
  });

  // Combine and mark the transactions as sent or received
  const txns = [
    ...sentTxns.map((t: any) => ({
      time: t.transferTime,
      amount: t.amount,
      fromUserId: t.fromUserId,
      toUserId: t.toUserId,
      type: "sent",
    })),
    ...receivedTxns.map((t : any) => ({
      time: t.transferTime,
      amount: t.amount,
      fromUserId: t.fromUserId,
      toUserId: t.toUserId,
      type: "received",
    })),
  ];

  // Sort transactions by time (most recent first)
  txns.sort((a, b) => b.time - a.time);

  return txns;
}

export default async function Transactions() {
  const p2ptransactions : any= await getp2pTransactions();
  return (
    <div className="w-screen">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
        P2P Transactions
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
        <div className="pt-4">
          <P2PTransactions p2ptransactions={p2ptransactions} />
        </div>
      </div>
    </div>
  );
}
