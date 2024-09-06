import { Card } from "@repo/ui/card";
import { DateTime } from "next-auth/providers/kakao";

export default function P2PTransactions({
  p2ptransactions,
}: {
  p2ptransactions: {
    time: DateTime;
    amount: number;
    fromUserId: string;
    toUserId: string;
    type: string;
  }[];
}) {
  if (!p2ptransactions || p2ptransactions.length === 0) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center pb-8 pt-8">No Recent transactions</div>
      </Card>
    );
  }
  
  return (
    <div className="h-[60vh] overflow-y-scroll border-2"> 
      <Card title="Recent P2P Transactions ">
      {p2ptransactions.map((txn, index) => (
        <div key={index} className="pt-2">
          <div className="flex justify-between">
            <div>
              <div className="flex gap-2 ">
                <div className="text-sm">
                  {txn.type === "received" ? "Received INR" : "Sent INR"}
                </div>
              </div>
              <div className="text-slate-600 text-xs">
                {new Date(txn.time).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className={txn.type === "received" ? "text-green-500" : "text-red-500"}>
                {txn.type === "received" ? "+" : "-"} Rs {txn.amount / 100}
              </span>
            </div>
          </div>
        </div>
      ))}
    </Card>
    </div>
  );
}

