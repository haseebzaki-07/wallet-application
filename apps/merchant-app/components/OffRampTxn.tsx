import { Card } from "@repo/ui/card"

export const OffRampTransactions = ({
    transactions
}: {
    transactions: {
        time: Date,
        amount: number,
        // TODO: Can the type of `status` be more specific?
        status: string,
        provider: string
    }[]
}) => {
    if (!transactions.length) {
        return <Card title="Recent Transactions">
            <div className="text-center pb-8 pt-8">
                No Recent transactions
            </div>
        </Card>
    }
    return <div className="h-[40vh] border-1 overflow-y-scroll" >
        <Card title="Recent OffRamp Transactions">
        <div className="pt-2">
            {transactions.map(t => <div className="flex justify-between">
                <div>
                    <div className="flex gap-2 ">
                    <div className="text-sm">
                        OffRamped INR
                    </div>
                    <div className={`text-xs ${t.status == "suceess" ? "text-green-500" : "text-red-500"} ? text-sm : text-md`}>
                        {t.status}
                    </div>
                    </div>
                    <div className="text-slate-600 text-xs">
                        {t.time.toDateString()}
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    + Rs {t.amount / 100}
                </div>

            </div>)}
        </div>
    </Card>
    </div>
}