import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaSignInAlt, FaChalkboard, FaUser } from "react-icons/fa"; // Importing icons

type TWhiteBoard = {
  _id: string;
  board_code: string;
  owner_id: string;
};

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
    const storedId = sessionStorage.getItem("user_id");
    if (!storedId) {
      navigate("/");
    }
    fetchWhiteBoards();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 p-6 flex flex-col items-center">
      {/* Dashboard Header */}
      <h2 className="text-3xl font-bold text-primary-600 mb-8 flex items-center">
        <FaChalkboard className="mr-2" /> My Whiteboards
      </h2>

      {/* Create Whiteboard Button */}
      <button
        onClick={createWhiteboard}
        className="mb-8 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition duration-300 flex items-center shadow-md hover:shadow-lg"
      >
        <FaPlus className="mr-2" /> Create Whiteboard
      </button>

      {/* Join Whiteboard Section */}
      <div className="w-full max-w-md mb-8">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter Whiteboard Code"
            className="flex-1 p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            value={boardCode}
            onChange={(e) => setBoardCode(e.target.value)}
          />
          <button
            onClick={joinWhiteboard}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 flex items-center shadow-md hover:shadow-lg"
          >
            <FaSignInAlt className="mr-2" /> Join
          </button>
        </div>
      </div>

      {/* List of Whiteboards */}
      <div className="w-full max-w-4xl">
        <h3 className="text-xl font-semibold text-neutral-900 mb-6">
          Your Whiteboards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whiteBoards?.map((w) => (
            <div
              key={w._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h4 className="text-lg font-medium text-primary-800 mb-2">
                Code: {w.board_code}
              </h4>
              <div className="flex items-center text-primary-800 mb-4">
                <FaUser className="mr-2" /> Owner: {w.owner_id}
              </div>
              <a
                href={`/whiteboard/${w.board_code}`}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <FaSignInAlt className="mr-2" /> Open
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
