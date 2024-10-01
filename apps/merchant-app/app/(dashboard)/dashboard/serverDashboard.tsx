// merchant-app/dashboard/ServerDashboard.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/clients";

// A server-side function to fetch the merchant's balance
export async function getMerchantBalance() {
  const session = await getServerSession(authOptions);
  const merchantId = Number(session?.user?.id);

  const merchantBalance = await prisma.merchantBalance.findUnique({
    where: { merchantId },
    select: { balance: true },
  });

  return merchantBalance?.balance || 0;
}

// This server component will render the basic information like balance
export default async function ServerDashboard() {
  const balance = await getMerchantBalance();

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden p-6 border border-gray-200">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <span className="text-gray-700 font-semibold">Balance:</span>
          <span className="text-gray-900">{balance / 100} INR</span> {/* Assuming balance is stored in cents */}
        </div>
      </div>
    </div>
  );
}
