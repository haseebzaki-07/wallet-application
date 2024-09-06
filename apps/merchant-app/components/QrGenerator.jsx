"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { useSession } from "next-auth/react";

export default function QrGenerator() {
  const [commodity, setCommodity] = useState("");
  const [amount, setAmount] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { data: session } = useSession();
  const merchantId = session?.user?.id;

  const generateQRCode = async () => {
    if (!commodity || !amount) {
      alert("Please enter both commodity and amount.");
      return;
    }

    if (!merchantId) {
      alert("Unable to retrieve merchant ID. Please log in.");
      return;
    }

    // Creating the data to encode in the QR code, including the merchant ID
    const data = `Commodity: ${commodity}, Amount: INR ${amount}, MerchantId: ${merchantId}`;

    try {
      // Generate QR code URL
      const url = await QRCode.toDataURL(data);
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR Code", error);
    }
  };

  return (
    <div>
      <h2 className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">QR Code Generator</h2>
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md max-w-md mx-auto">
      

      <div className="w-full mb-4">
        <input
          type="text"
          placeholder="Enter commodity"
          value={commodity}
          onChange={(e) => setCommodity(e.target.value)}
          className="w-full p-2 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <p className="text-gray-600 text-sm mb-4">
        <span className="font-semibold">Merchant ID:</span> {merchantId || "N/A"}
      </p>

      <button
        onClick={generateQRCode}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
      >
        Generate QR Code
      </button>

      {qrCodeUrl && (
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Scan to Pay:</h3>
          <img className="h-40 mx-auto" src={qrCodeUrl} alt="QR Code" />
        </div>
      )}
    </div>
    </div>
  );
}
