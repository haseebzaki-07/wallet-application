"use client"

import { useEffect } from 'react';

export default function NotificationClient( {merchantId}) {
  useEffect(() => {
    // Connect to the WebSocket server
    const ws = new WebSocket(`ws://localhost:8080?merchantId=${merchantId}`);

    ws.onopen = () => {
      console.log('Connected to WebSocket server.');
    };

    ws.onmessage = (event) => {
      // Handle incoming notifications
      const notification = JSON.parse(event.data);
      alert(`${notification.title}: ${notification.message}`);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server.');
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, [merchantId]);

  return null; // Component is purely for handling WebSocket connection
};


