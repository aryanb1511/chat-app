import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);

  const chatEndRef = useRef(null);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", { message, username });
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("online_users", (usersList) => {
      setUsers(usersList);
    });

    return () => {
      socket.off("receive_message");
      socket.off("online_users");
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  if (!joined) {
    return (
      <div className="joinPage">
        <div className="joinBox">
          <h2>💬 Chat App</h2>
          <input
            placeholder="Enter your name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={() => {
              socket.emit("join", username);
              setJoined(true);
            }}
          >
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mainContainer">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>🟢 Online Users</h3>

        {users.map((user, index) => (
          <div key={index} className="userItem">
            <div className="avatar small">
              {user.username[0].toUpperCase()}
            </div>
            <span>{user.username}</span>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="chatArea">
        <div className="chatHeader">
          <div className="headerLeft">
            <div className="avatar">
              {username[0].toUpperCase()}
            </div>
            <span>{username}</span>
          </div>
        </div>

        <div className="chatMessages">
          {chat.map((msg, index) => (
            <div
              key={index}
              className={
                msg.username === username
                  ? "messageRow own"
                  : "messageRow"
              }
            >
              <div className="messageBubble">
                <span className="sender">{msg.username}</span>
                <p>{msg.message}</p>
                <span className="time">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <div className="chatInput">
          <input
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
}

export default App;