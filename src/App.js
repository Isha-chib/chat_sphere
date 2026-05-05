import "./App.css";
import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket", "polling"],
});

export default function App() {
  const [showJoin, setShowJoin] = useState(false);
  const [joined, setJoined] = useState(false);

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  // connect
  useEffect(() => {
    socket.on("connect", () => {
      console.log("CONNECTED:", socket.id);
    });

    // receive message
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    //  receive file
    socket.on("receive_file", (data) => {
      setChat((prev) => [...prev, data]);
    });

    // load history (IMPORTANT FOR LATE JOIN)
    socket.on("load_history", (history) => {
      setChat(history);
    });

    // typing
    socket.on("typing", (data) => {
      setTypingUser(`${data.user} is typing...`);
    });

    socket.on("stop_typing", () => {
      setTypingUser("");
    });

    return () => socket.off();
  }, []);

  // join room
  const joinRoom = () => {
    if (!username || !room) return;

    socket.emit("join_room", room);
    setJoined(true);
  };

  // send msg
  const sendMessage = () => {
    if (!message.trim()) return;

    const data = {
      room,
      author: username,
      message,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("send_message", data);
    setChat((prev) => [...prev, data]);
    setMessage("");
  };

  // send file
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const data = {
        room,
        author: username,
        file: reader.result,
        time: new Date().toLocaleTimeString(),
      };

      socket.emit("send_file", data);
      setChat((prev) => [...prev, data]);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="App">

      {/* LANDING */}
      {!showJoin && !joined ? (
        <div className="landing">
          <h1>💬 ChatSphere</h1>
          <p>Real-time Chat Application</p>

          <button onClick={() => setShowJoin(true)}>
            Start Chat 🚀
          </button>
        </div>

      ) : !joined ? (

        /* JOIN PAGE */
        <div className="join-page">
          <div className="join-card">

            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              placeholder="Room ID"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />

            <button onClick={joinRoom}>
              Enter Chat
            </button>

          </div>
        </div>

      ) : (

        /* CHAT PAGE */
        <div className="chat-page">

          {/* CHAT BOX */}
          <div className="chat-box">
            {chat.map((msg, i) => (
              <div key={i} className="msg">
                <b>{msg.author}</b>: {msg.message}

                {msg.file && (
                  <img src={msg.file} width="150" alt="file" />
                )}

                <span>{msg.time}</span>
              </div>
            ))}
          </div>

          {/* typing */}
          {typingUser && <p>{typingUser}</p>}

          {/* INPUT AREA */}
          <div className="input-box">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
            />

            <input type="file" onChange={handleFile} />

          </div>

          <button onClick={sendMessage}>
            Send 🚀
          </button>

        </div>
      )}

    </div>
  );
};

