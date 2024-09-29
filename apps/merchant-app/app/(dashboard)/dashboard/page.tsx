import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/clients";

const InfoItem = ({ label, value }: any) => (
  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
    <span className="text-gray-700 font-semibold">{label}:</span>
    <span className="text-gray-900">{value || "N/A"}</span>
  </div>
);

export async function getMerchantBalance() {
  const session = await getServerSession(authOptions);
  const merchantId = Number(session?.user?.id);
  console.log("merchantId: " + merchantId);
  const merchantBalance = await prisma.merchantBalance.findUnique({
      where : {
        merchantId : merchantId,
      },
      select: {
        balance: true, 
      },
      
  })

  return merchantBalance.balance ;
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const { name, email, id } = session.user; // assuming user object has these fields
  // const balance = await getMerchantBalance();

  return (
    <div>
      <p className="text-5xl text-[#6a51a6] font-bold mb-2 mt-10">
        Hi {name?.toUpperCase()}!
      </p>

      <div className="text-center mb-4">
        <p className="text-gray-600">Welcome back!</p>
      </div>
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden p-6 border border-gray-200">
        <div className="flex flex-col gap-4">
          <InfoItem label="Email" value={email} />
          <InfoItem label="Account ID" value={id} />

          {/* <InfoItem label="Balance" value={${balance / 100} INR} /> */}
        </div>
      </div>
      
    </div>
  );
}
