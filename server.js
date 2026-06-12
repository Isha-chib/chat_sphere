const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();

// CREATE SERVER
const server = http.createServer(app);

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// SOCKET CONNECTION
io.on("connection", (socket) => {

  console.log("✅ USER CONNECTED:", socket.id);

  // JOIN ROOM
  socket.on("join_room", (room) => {

    socket.join(room);

    console.log(`🚪 User joined room: ${room}`);

  });

  // SEND MESSAGE
  socket.on("send_message", (data) => {

    console.log("📤 MESSAGE:", data);

    io.to(data.room).emit("receive_message", data);

  });

  // SEND FILE
  socket.on("send_file", (data) => {

    console.log("📁 FILE:", data);

    io.to(data.room).emit("receive_file", data);

  });

  // TYPING
  socket.on("typing", (data) => {

    socket.to(data.room).emit("typing", data);

  });

  // STOP TYPING
  socket.on("stop_typing", (room) => {

    socket.to(room).emit("stop_typing");

  });

  // DISCONNECT
  socket.on("disconnect", () => {

    console.log("❌ USER DISCONNECTED");

  });

});

const buildPath = path.resolve(__dirname, "client", "build");

app.use(express.static(buildPath));

app.use((req, res) => {

  res.sendFile(path.join(buildPath, "index.html"));

});

console.log(__dirname);
// START SERVER
server.listen(3001, "0.0.0.0", () => {

  console.log("🚀 SERVER RUNNING ON PORT 3001");

});