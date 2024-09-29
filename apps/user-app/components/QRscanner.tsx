"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import axios from "axios";
import { useSession } from "next-auth/react";
import { user2MerchantTransfer } from "../app/lib/actions/user2Merchant";


// Dynamically import QrScanner using named export to avoid SSR issues
const QrScanner = dynamic(() => import("react-qr-scanner"), { ssr: false });

export default function QRScanner() {
  const { data: session } = useSession();

  const [commodity, setCommodity] = useState("");
  const [amount, setAmount] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(false);

  const handleScan = (data: { text: string } | null) => {
    if (data?.text) {
      setScanResult(data.text);

      // Updated regex to capture merchant ID along with commodity and amount
      const regex =
        /Commodity:\s*(.*),\s*Amount:\s*INR\s*(.*),\s*MerchantId:\s*(.*)/i;
      const match = data.text.match(regex);

      if (match) {
        setCommodity(match[1] || "");
        setAmount(match[2] || "");
        setMerchantId(match[3] || "");
        setIsScannerActive(false); // Deactivate scanner after successful scan
      } else {
        alert("Invalid QR Code format");
      }
    }
  };

  const handleError = (err: Error) => {
    console.error("QR Code Scan Error:", err);
    alert("Error scanning QR Code. Please try again.");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        // Convert the image to a base64 string
        const imageDataUrl = reader.result as string;

        // Dynamically import the library used to read QR codes from images
        import("jsqr")
          .then((jsQR) => {
            const img = new Image();
            img.src = imageDataUrl;

            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;

              const ctx = canvas.getContext("2d");
              if (!ctx) return;

              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

              const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );

              const code = jsQR.default(
                imageData.data,
                canvas.width,
                canvas.height
              );
              if (code) {
                handleScan({ text: code.data });
              } else {
                alert("No QR code found in the image.");
              }
            };
          })
          .catch((err) => {
            console.error("Failed to load jsQR library", err);
            alert("Error scanning the image.");
          });
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl text-[#6a51a6] font-bold mb-8 ">Scan QR Code</h1>
      <div className=" p-6 rounded-lg shadow-lg border-grey-200">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          onClick={() => setIsScannerActive(true)}
        >
          Scan QR
        </button>

        {/* Display QrScanner only when isScannerActive is true */}
        {isScannerActive && (
          <div className="mt-6">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "300px" }}
            />
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={() => setIsScannerActive(false)}
            >
              Close Scanner
            </button>
          </div>
        )}

        {/* File input for scanning QR codes from images */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Scan using an image</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2 block"
          />
        </div>

        <div className="mt-6 flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Product"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />
          <input
            type="text"
            placeholder="Merchant ID"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />
  
          <button
            onClick={async () => {
              try {
        
                const response = await user2MerchantTransfer(
                  Number(merchantId),
                  Number(amount),
                  commodity
                );

            
                if (response.success) {
                  alert("Payment successful!");
                } else {
                  alert(response.message || "Payment failed.");
                }
              } catch (error) {
                alert("An unexpected error occurred. Please try again.");
                console.error(error);
              }
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Pay
          </button>
        </div>

        {scanResult && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Scan Result</h3>
            <p>{scanResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
