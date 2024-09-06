import { getServerSession } from "next-auth";

import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/clients";
import { getMerchantBalance } from "../dashboard/page";
import { TransferMoneyCard } from "../../../components/TransferMoney";
import { OffRampTransactions } from "../../../components/OffRampTxn";



async function getOffRampTransactions() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.offRampTransaction.findMany({
    where: {
      merchantId: Number(session?.user?.id),
    },
  });
  return txns.map((t: any) => ({
    time: t.startTime,
    amount: t.amount,
    status: t.status,
    provider: t.provider,
  }));
}

export default async function () {
  const balance = await getMerchantBalance();
  const transactions = await getOffRampTransactions();

  return (
    <div className="w-screen">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
        Transfer
      </div>
      <h1>
       balance :  {balance/100}
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
        <div>
          <TransferMoneyCard />
        </div>
        <div>
          
          <div className="pt-4">
            <OffRampTransactions transactions={transactions} />
          </div>
        </div>
       
      </div>
    </div>
  );
}
