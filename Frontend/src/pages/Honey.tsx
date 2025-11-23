import { useState, useEffect } from "react";

export default function Honey() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8001/ws/logs/");

    socket.onopen = () => {
      console.log("Connected to Log WebSocket");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === "newLog") {
          // Only add log if data is not null/undefined
          if (message.data) {
            console.log("Received log:", message.data);
            setLogs((prev) => [message.data, ...prev]);
          } else {
            console.warn("Received null/undefined log data");
          }
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("Disconnected from Log WebSocket");
    };

    return () => socket.close();
  }, []);

  return (
    <div>
      {logs.map((log, idx) => (
        <pre key={idx}>{JSON.stringify(log, null, 2)}</pre>
      ))}
    </div>
  );
}
