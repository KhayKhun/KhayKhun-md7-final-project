import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type TWhiteBoard = {
  _id : string
  board_code : string
  owner_id : string
}

function Dashboard() {
  const [boardCode, setBoardCode] = useState("");
  const [whiteBoards, setWhiteBoards] = useState<TWhiteBoard[]>([]);
  const navigate = useNavigate();

  const createWhiteboard = async () => {
    const user_id = sessionStorage.getItem("user_id");
    if (!user_id) return;

    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/whiteboards`,
      { owner_id: user_id }
    );
    navigate(`/whiteboard/${res.data.board_code}`);
  };

  const joinWhiteboard = () => {
    if (boardCode) navigate(`/whiteboard/${boardCode}`);
  };

  async function fetchWhiteBoards() {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/whiteboards`
    );
    setWhiteBoards(res.data);
  }

  useEffect(() => {
    fetchWhiteBoards();
  }, []);

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <button
        onClick={createWhiteboard}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Create Whiteboard
      </button>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Enter Whiteboard Code"
          className="p-2 border rounded"
          value={boardCode}
          onChange={(e) => setBoardCode(e.target.value)}
        />
        <button
          onClick={joinWhiteboard}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Join Whiteboard
        </button>
      </div>
      {whiteBoards?.map((w) => {
        console.log(w)
        return (
        <div key={w._id}>
          <h3>{w?.board_code}</h3>
          <a
            className="px-4 py-2 bg-green-500 text-white rounded"
            href={`/whiteboard/${w.board_code}`}
          >
            Join Whiteboard
          </a>
        </div>
      )})}
    </div>
  );
}

export default Dashboard;
