// merchant-app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import ServerDashboard from "./serverDashboard";
import ClientDashboard from "../../../components/clientDashboard";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const { name, id } = session?.user || {}; // Get the merchant name and id from the session

  return (
    <div>
      <p className="text-5xl text-[#6a51a6] font-bold mb-2 mt-10">
        Hi {name?.toUpperCase()}!
      </p>

      <div className="text-center mb-4">
        <p className="text-gray-600">Welcome back!</p>
      </div>

      {/* Server-side rendering of the merchant's balance */}
      <ServerDashboard />

      {/* Client-side WebSocket handling for real-time notifications */}
      <ClientDashboard merchantId={Number(id)} />
    </div>
  );
}
