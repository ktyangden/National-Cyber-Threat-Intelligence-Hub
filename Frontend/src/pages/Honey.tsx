import { useState, useEffect, useRef } from "react";

export default function Honey() {
  const [logs, setLogs] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("connecting");
  const [totalReceived, setTotalReceived] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds
  const maxLogs = 1000; // Maximum number of logs to keep in memory

  const connectWebSocket = () => {
    try {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.close();
      }

      setConnectionStatus("connecting");
      const socket = new WebSocket("ws://localhost:8001/ws/logs/");
      socketRef.current = socket;

      socket.onopen = async () => {
        console.log("Connected to Log WebSocket");
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0; // Reset on successful connection
        
        // Fetch recent logs that were sent before we connected
        try {
          const response = await fetch("http://localhost:8001/recent-logs?limit=100");
          if (response.ok) {
            const data = await response.json();
            if (data.logs && data.logs.length > 0) {
              // Add recent logs in reverse order (oldest first) so newest appear at top
              setLogs((prev) => {
                const combined = [...data.logs.reverse(), ...prev];
                return combined.slice(0, maxLogs);
              });
              setTotalReceived((prev) => prev + data.logs.length);
            }
          }
        } catch (err) {
          console.error("Error fetching recent logs:", err);
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.event === "newLog") {
            // Only add log if data is not null/undefined
            if (message.data) {
              setTotalReceived((prev) => prev + 1);
              
              // Use functional update to ensure we always get the latest state
              setLogs((prev) => {
                // Prepend new log to the beginning
                const newLogs = [message.data, ...prev];
                // Keep only the most recent maxLogs
                return newLogs.slice(0, maxLogs);
              });
            } else {
              console.warn("Received log message with null/undefined data");
            }
          } else {
            // Log unexpected message types for debugging
            console.warn("Unexpected WebSocket message event:", message.event, message);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err, event.data);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setConnectionStatus("error");
      };

      socket.onclose = (event) => {
        console.log("Disconnected from Log WebSocket", event.code, event.reason);
        setConnectionStatus("disconnected");

        // Attempt to reconnect if not a normal closure and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, reconnectDelay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error("Max reconnection attempts reached. Please check if the WebSocket server is running.");
          setConnectionStatus("error");
        }
      };
    } catch (err) {
      console.error("Error creating WebSocket connection:", err);
      setConnectionStatus("error");
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      // Cleanup
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting");
      }
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500";
      case "connecting":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return reconnectAttemptsRef.current >= maxReconnectAttempts
          ? "Connection failed - Max retries reached"
          : "Connection error";
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          connectionStatus === "connected" ? "bg-green-500" :
          connectionStatus === "connecting" ? "bg-yellow-500" :
          connectionStatus === "error" ? "bg-red-500" : "bg-gray-500"
        }`} />
        <span className={getStatusColor()}>
          WebSocket: {getStatusText()}
        </span>
        {connectionStatus === "error" && reconnectAttemptsRef.current < maxReconnectAttempts && (
          <span className="text-sm text-gray-500">
            (Retrying {reconnectAttemptsRef.current}/{maxReconnectAttempts}...)
          </span>
        )}
      </div>
      <div className="mb-2 text-sm text-gray-600">
        Total received: {totalReceived} | Displayed: {logs.length}
        {logs.length >= maxLogs && (
          <span className="text-yellow-600 ml-2">(Showing most recent {maxLogs} logs)</span>
        )}
      </div>
      {logs.length === 0 && connectionStatus === "connected" && (
        <p className="text-gray-500 text-sm">Waiting for logs...</p>
      )}
      {logs.map((log, idx) => (
        <pre key={idx} className="mb-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(log, null, 2)}
        </pre>
      ))}
    </div>
  );
}
