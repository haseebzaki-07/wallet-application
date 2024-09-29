import prisma from "@repo/db/clients"
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import U2MTransactions from "../../../components/U2MTransactions";

async  function getTransactions(){
    const session = await getServerSession(authOptions);
    const merchantId = Number(session?.user?.id);

    const transactions  = await prisma.usertoMerchantTransfer.findMany({
        where: {
            merchantId,
        },
    })
    const txns = [
        ...transactions.map((t: any) => ({
          time: t.datetime,
          amount: t.amount,
          fromUserId: t.userId,
          toMerchantId: t.merchantId,
          product: t.product,
          
        })),
        
      ];
    
      // Sort transactions by time (most recent first)
      txns.sort((a, b) => b.time - a.time);
    
      return txns;
    
}

export default async function Transactions(){
    const usertoMerchanttxns = await getTransactions();
    return (
        <div className="w-screen">
          <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
            User To Merchant Transactions
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
            <div className="pt-4">
              <U2MTransactions usertoMerchanttxns={usertoMerchanttxns} />
            </div>
          </div>
        </div>
      );


}