import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function Test() {
  const [socketResponse, setSocketResponse] = useState("");

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL); 

    socket.on("pongEvent", (data) => {
      console.log("Received pongEvent:", data);
      setSocketResponse(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const pingSocket = () => {
    const socket = io(`${import.meta.env.VITE_BACKEND_URL}`);
    socket.emit("pingEvent", { testData: "Hello server" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5 space-y-4">
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

export default Test;