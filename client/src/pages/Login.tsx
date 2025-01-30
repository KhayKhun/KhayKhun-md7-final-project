import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock, FaSignInAlt } from "react-icons/fa";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        username,
        password,
      });
      sessionStorage.setItem("user_id", res.data.user_id);
      setMessage(res.data.message);
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-primary-600 mb-6 flex items-center">
        <FaSignInAlt className="mr-2" /> Login
      </h2>
      <div className="space-y-4">
        <div className="flex items-center border border-neutral-300 rounded-lg p-2">
          <FaUser className="text-neutral-500 mr-2" />
          <input
            type="text"
            placeholder="Username"
            className="w-full outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="flex items-center border border-neutral-300 rounded-lg p-2">
          <FaLock className="text-neutral-500 mr-2" />
          <input
            type="password"
            placeholder="Password"
            className="w-full outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 shadow-md hover:shadow-lg transition-all"
        >
          Login
        </button>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        <p className="text-center text-neutral-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;