import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock, FaUserPlus } from "react-icons/fa";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`, {
        username,
        password,
      });
      setMessage(res.data.message);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        username,
        password,
      });
      sessionStorage.setItem("user_id", res.data.user_id);
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-primary-600 mb-6 flex items-center">
        <FaUserPlus className="mr-2" /> Register
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
          onClick={handleRegister}
          className="w-full bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 shadow-md hover:shadow-lg transition-all"
        >
          Register
        </button>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        <p className="text-center text-neutral-500">
          Already have an account?{" "}
          <Link to="/login" className="text-green-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;