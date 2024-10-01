// server/index.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, specify your apps' URLs here
  },
});

const PORT = 8001; // This is the central server port

// Store connected merchant sockets to notify them
const merchants = {};

// WebSocket connection event
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle merchant login and store their socket
  socket.on('merchant_login', (merchantId) => {
    merchants[merchantId] = socket.id;
    console.log(`Merchant ${merchantId} logged in with socket id ${socket.id}`);
  });

  // Handle payment notification from user app
  socket.on('payment_made', (data) => {
    const { merchantId, amount, userId } = data;
    console.log(JSON.stringify(data));

    // Send payment notification to the merchant
    if (merchants[merchantId]) {
      io.to(merchants[merchantId]).emit('payment_notification', {
        userId,
        amount,
      });
      console.log(`Payment notification sent to merchant ${merchantId}`);
    } else {
      console.log(`Merchant ${merchantId} not connected.`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // You can also remove disconnected merchants from the merchants object if necessary
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
