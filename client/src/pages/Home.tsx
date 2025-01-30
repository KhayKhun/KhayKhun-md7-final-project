import { Link } from "react-router-dom";
import { FaChalkboard, FaUserPlus, FaSignInAlt } from "react-icons/fa";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4 flex items-center justify-center">
          <FaChalkboard className="mr-2" /> Welcome to Realtime Whiteboard
        </h1>
        <p className="text-neutral-500 mb-8">
          Collaborate and draw in real-time with others.
        </p>
        <div className="flex space-x-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-md hover:shadow-lg transition-all flex items-center"
          >
            <FaUserPlus className="mr-2" /> Register
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md hover:shadow-lg transition-all flex items-center"
          >
            <FaSignInAlt className="mr-2" /> Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;