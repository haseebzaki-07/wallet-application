import { WebSocketServer, WebSocket } from "ws";

// Create a WebSocket server on port 8000
const wss = new WebSocketServer({ port: 8000 });
const clients = new Map<string, WebSocket>(); // Stores connected clients, mapped by clientId

// Handling new connections
wss.on("connection", (ws: WebSocket, req) => {
  // Extract clientId from the URL query parameters
  const urlParams = new URL(req.url as string, `http://${req.headers.host}`).searchParams;
  const clientId = urlParams.get("clientId"); // Expecting the clientId as a query parameter

  if (!clientId) {
    console.error("Client ID is missing");
    ws.close(); // Close connection if clientId is not provided
    return;
  }

  clients.set(clientId, ws);
  console.log(`Client ${clientId} connected`);

  // Emit connection confirmation to the client
  ws.send(JSON.stringify({ message: `Client ${clientId} connected` }));

  // Handle incoming messages (e.g., payment notifications)
  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString()); // Parse the incoming message
      console.log(`Received message from Client ${clientId}:`, message);

      // Example: Send a notification to the intended client
      sendNotificationToMerchant(clientId, {
        title: 'New Payment Received',
        message: message.notificationMessage,
        datetime: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to process message:", error);
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    clients.delete(clientId); // Remove the clientId from the map
    console.log(`Client ${clientId} disconnected`);
  });
});

// Function to send a notification to a specific merchant
export function sendNotificationToMerchant(
  merchantId: string,
  notification: any
) {
  if (!merchantId || !notification) {
    console.error("Invalid parameters for sendNotificationToMerchant");
    return;
  }

 clients.forEach((client , id) =>{
  if (id != merchantId && client.readyState === client.OPEN) {
    client.send(JSON.stringify(notification)); // Send the notification as JSON
  } 
 })
  
}

// Log server start
console.log("WebSocket server is running on ws://localhost:8000");
