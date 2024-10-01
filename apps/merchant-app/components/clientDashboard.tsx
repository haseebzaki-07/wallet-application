// merchant-app/dashboard/ClientDashboard.tsx
"use client"; // Ensure this is a client component

import { useEffect, useState } from "react";
import io from 'socket.io-client';

// Establish a connection to the WebSocket server
const socket = io('http://localhost:8001');

export default function ClientDashboard({ merchantId }: { merchantId: number }) {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    socket.emit('merchant_login', merchantId); // Replace with actual merchant ID

    // Listen for payment notifications
    socket.on('payment_notification', (data) => {
      const { userId, amount } = data;
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        `Received $${amount} from user ${userId}`,
      ]);
    })
  
    return () => {
      socket.off('payment_notification');
    };
  }, [merchantId]);
  

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Notifications</h3>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index} className="bg-gray-100 p-2 my-2 rounded">
            {notification}
          </li>
        ))}
      </ul>
    </div>
  );
}
