import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

function App() {
  const [message, setMessage] = useState("");
  const [dbTestResult, setDbTestResult] = useState("");
  const [socketResponse, setSocketResponse] = useState("");

  // Create socket connection once
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL); // Flask-SocketIO runs on 5000

    // Listen for "pongEvent"
    socket.on("pongEvent", (data) => {
      console.log("Received pongEvent:", data);
      setSocketResponse(data.message);
    });

    // Clean up socket on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const pingServer = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ping`);
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const testDB = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/testdb`);
      setDbTestResult(res.data.inserted_document);
    } catch (err) {
      console.error(err);
    }
  };

  const pingSocket = () => {
    // We'll send a "pingEvent" to the server
    const socket = io(`${import.meta.env.VITE_BACKEND_URL}`);
    socket.emit("pingEvent", { testData: "Hello server" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5 space-y-4">
      <h1 className="text-3xl font-bold">Vite + React + Flask-SocketIO Demo</h1>
      
      <button
        onClick={pingServer}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        HTTP Ping Flask
      </button>
      {message && <p>HTTP Response: {message}</p>}

      <button
        onClick={testDB}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Test DB Insert/Find
      </button>
      {dbTestResult && <p>DB Test Result: {dbTestResult}</p>}

      <button
        onClick={pingSocket}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Ping Socket
      </button>
      {socketResponse && <p>Socket Response: {socketResponse}</p>}
    </div>
  );
}

export default App;