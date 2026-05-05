const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 💥 MEMORY DATABASE (history store)
const chatHistory = {}; 
// format: { roomId: [messages] }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN ROOM
  socket.on("join_room", (room) => {
    socket.join(room);

    // 🔥 SEND OLD HISTORY TO LATE JOIN USER
    if (chatHistory[room]) {
      socket.emit("load_history", chatHistory[room]);
    } else {
      chatHistory[room] = [];
    }

    console.log(`User joined room: ${room}`);
  });

  // MESSAGE
  socket.on("send_message", (data) => {
    const { room } = data;

    // save in history
    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(data);

    // broadcast to room
    io.to(room).emit("receive_message", data);
  });

  // FILE
  socket.on("send_file", (data) => {
    const { room } = data;

    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(data);

    io.to(room).emit("receive_file", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});