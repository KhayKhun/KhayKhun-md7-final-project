import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaSignOutAlt } from "react-icons/fa"; // Importing icons

const Header = () => {
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("user_id");
    navigate("/");
  }

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/dashboard"
          className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
        >
          <FaHome className="mr-2" />
          <span className="font-semibold">Dashboard</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow-md hover:shadow-lg transition-all"
        >
          <FaSignOutAlt className="mr-2" /> 
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;