// merchant-app/dashboard/ClientDashboard.tsx
"use client"; // Ensure this is a client component

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import io from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';

// Establish a connection to the WebSocket server
const socket = io('http://localhost:8001');

export default function ClientDashboard({ merchantId }: { merchantId: number }) {


  useEffect(() => {
    socket.emit('merchant_login', merchantId); // Replace with actual merchant ID

    // Listen for payment notifications
    socket.on('payment_notification', (data) => {
      const { userId, amount, product } = data;
      console.log("data received for merchant ", data )
      toast.info(`Received INR${amount} for ${product} from user ${userId}`, {
        position: "top-right",
        autoClose: 5000, // Automatically close after 5 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    })
  
    return () => {
      socket.off('payment_notification');
    };
  }, [merchantId]);
  

  return (
    <div className="mt-6">
      
      <ToastContainer/>
    </div>
  );
}
