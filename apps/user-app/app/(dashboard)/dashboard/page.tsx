import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { getBalance } from "../transfer/page";

const InfoItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
    <span className="text-gray-700 font-semibold">{label}:</span>
    <span className="text-gray-900">{value || "N/A"}</span>
  </div>
);
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const userName = await session?.user?.name;
  const email = await session?.user?.email;
  const accountId = await session?.user?.id;
  const number = await session?.user?.number;
  const balance = await getBalance();
  return (
    <div>
      <p className="text-5xl text-[#6a51a6] font-bold mb-2 mt-10">
        Hi {userName?.toUpperCase()}!
      </p>

      <div className="text-center mb-4">
        <p className="text-gray-600">Welcome back!</p>
      </div>
      <div className="min-w-[20vw] mx-auto bg-white shadow-lg rounded-xl overflow-hidden p-6 border border-gray-200">
        <div className="flex flex-col gap-4">
          <InfoItem label="Email" value={email} />
          <InfoItem label="Account ID" value={Number(accountId)} />
          <InfoItem label="Phone Number" value={number } />
          <InfoItem
            label="Balance"
            value={`${balance?.amount / 100 + balance.locked / 100} INR`}
          />
        </div>
      </div>
    </div>
  );
}
