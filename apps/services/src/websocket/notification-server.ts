// // /services/notification-service/websocket-server.js

// import { WebSocketServer } from 'ws';

// // Create a WebSocket server
// const wss = new WebSocketServer({ port: 8080 }); // Adjust the port if necessary
// const clients = new Map(); // Stores connected clients, mapped by merchantId

// wss.on('connection', (ws, req) => {
//   // Extract merchantId from the connection URL

//   const url = req.url || '';
//   const urlParams = new URLSearchParams(url.split('?')[1]);
//   const merchantId = urlParams.get('merchantId');

//   if (merchantId) {
//     clients.set(merchantId, ws); // Store the WebSocket connection for the merchant in the
//     console.log(`Merchant ${merchantId} connected`);

//     ws.on('close', () => {
//       clients.delete(merchantId);
//       console.log(`Merchant ${merchantId} disconnected`);
//     });

//     ws.on('error', (error) => {
//       console.error(`WebSocket error: ${error}`);
//     });
//   }
// });

// // Function to send a notification to a specific merchant
// export function sendNotificationToMerchant(merchantId : number, notification : any) {
//   const client = clients.get(merchantId);
//   if (client && client.readyState === client.OPEN) {
//     client.send(JSON.stringify(notification)); // Send the notification to the connected merchant
//   }
// }

// // Export the WebSocket server to be started in the main entry point
// console.log('WebSocket server is running on ws://localhost:8080');
