// merchant-app/dashboard/ClientDashboard.tsx
"use client"; // Ensure this is a client component

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import io from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';

// Establish a connection to the WebSocket server
const socket = io('http://localhost:8001');
const speakNotification = (message: string) => {
  if ('speechSynthesis' in window) {
    try {
      const speech = new SpeechSynthesisUtterance(message);
      speech.lang = "en-US"; // You can set this to other locales if needed
      speech.pitch = 1;      // Set pitch (0 to 2, default is 1)
      speech.rate = 1;       // Set rate of speech (0.1 to 10, default is 1)
      speech.volume = 1;     // Set volume (0 to 1)

      window.speechSynthesis.speak(speech);  // Speak the message
    } catch (error) {
      console.log("Error with speech synthesis:", error);
    }
  } else {
    console.log("Speech synthesis not supported in this browser.");
  }
};
export default function ClientDashboard({ merchantId }: { merchantId: number }) {

  useEffect(() => {
    socket.emit('merchant_login', merchantId); // Replace with actual merchant ID

    

    // Listen for payment notifications
    socket.on('payment_notification', (data) => {
      const { userId, amount, product } = data;
      console.log("data received for merchant ", data )
      
      const message = `You received INR ${amount} for ${product} from user ${userId}`;
      

      toast.info(`Received INR ${amount} for ${product} from user ${userId}`, {
        position: "top-right", 
        autoClose: 5000, // Automatically close after 5 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onOpen : ()=> {
          speakNotification(message)
        }
      
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
