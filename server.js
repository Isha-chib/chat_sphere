const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// ✅ FIXED CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://awesome-reconstructively-phyllis.ngrok-free.dev"
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.get("/", (req, res) => {
  res.send("SERVER RUNNING");
});

const server = http.createServer(app);

// ✅ FIX SOCKET.IO CONFIG (IMPORTANT FIX)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

// SOCKET LOGIC (UNCHANGED FIXED ONLY CLEANED)
io.on("connection", (socket) => {

  console.log("CONNECTED:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log("USER JOINED ROOM:", room);
  });

  socket.on("send_message", (data) => {
    console.log("MESSAGE:", data);

    io.to(data.room).emit("receive_message", data);
  });

  socket.on("send_file", (data) => {
    io.to(data.room).emit("receive_file", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("typing", data);
  });

  socket.on("stop_typing", (room) => {
    socket.to(room).emit("stop_typing");
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", socket.id);
  });

});

server.listen(3001, "0.0.0.0", () => {
  console.log("SERVER RUNNING ON 3001");
});