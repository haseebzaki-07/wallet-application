import { Card } from "@repo/ui/card";
import { DateTime } from "next-auth/providers/kakao";

export default function U2MTransactions({
    usertoMerchanttxns,
}: {
    usertoMerchanttxns: {
    time: DateTime;
    amount: number;
    fromUserId: string;
    toMerchantId: string;
    product: string,
  }[];
}) {
  if (!usertoMerchanttxns || usertoMerchanttxns.length === 0) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center pb-8 pt-8">No Recent transactions</div>
      </Card>
    );
  }
  
  return (
    <div className="h-[60vh] overflow-y-scroll shadow-lg border-grey-200"> 
      <Card title="Recent U2M Transactions ">
      {usertoMerchanttxns.map((txn, index) => (
        <div key={index} className="pt-2">
          <div className="flex justify-between">
            <div>
              <div className="flex gap-2 ">
                <div className="text-sm">
                  {"Received INR"}
                </div>
              </div>
              <div className="text-slate-600 text-xs">
                {new Date(txn.time).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className={"text-green-500" }>
                { "+" } Rs {txn.amount }
              </span>
            </div>
          </div>
        </div>
      ))}
    </Card>
    </div>
  );
}

