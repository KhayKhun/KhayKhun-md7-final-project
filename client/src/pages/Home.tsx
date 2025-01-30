import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Realtime Whiteboard</h1>
      <p className="mb-6">Collaborate and draw in real-time with others.</p>
      <div className="space-x-4">
        <Link to="/register" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Register
        </Link>
        <Link to="/login" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Home;