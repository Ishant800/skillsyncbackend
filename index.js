// index.js
const express = require("express"); 
const database = require("./databases/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authroutes = require("./auth/auth");
const { Server } = require("socket.io");
const Chat = require("./models/chat");
const jwt = require("jsonwebtoken");


const app = express();
const port = 3000;

database();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // Frontend URL
  credentials: true,
}));

// Routes
app.use("/api", authroutes);

app.use(express.static('uploads'));
// Start HTTP server
const server = app.listen(port, () => {
  console.log("Server running on port", port);
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://postman-echo.com"], 
    credentials: true,
    allowEIO3: true,
  },
});

module.exports = io


const users = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('setuserId', (userId) => {
    if (!userId || users[userId]) return; // Prevent duplicates
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket: ${socket.id}`);
    io.emit('userList', Object.keys(users));
  });

  // Chat
  socket.on('sendmessage', ({ senderid, receiverid, msg }) => {
    const receiverSocketId = users[receiverid];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receivedmessage', { senderid, msg });
      console.log(`Chat: ${senderid} -> ${receiverid}: ${msg}`);
    }
  });

  // WebRTC Signaling
  socket.on('callUser', ({ from, to, offer }) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incomingCall', { from, offer });
      console.log(`Call from ${from} to ${to}`);
    }
  });

  socket.on('answerCall', ({ to, answer }) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('callAnswered', { answer });
      console.log(`Call answered to ${to}`);
    }
  });

  socket.on('rejectCall', ({ to }) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('callRejected');
      console.log(`Call rejected to ${to}`);
    }
  });

  socket.on('iceCandidate', ({ to, candidate }) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('iceCandidate', { candidate });
    }
  });

  socket.on('endCall', ({ to }) => {
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('callEnded');
      console.log(`Call ended with ${to}`);
    }
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(users).find((id) => users[id] === socket.id);
    if (userId) {
      delete users[userId];
      io.emit('userList', Object.keys(users));
      console.log(`User ${userId} disconnected`);
    }
  });
});