import { Link } from "react-router-dom";
import { FaUserPlus, FaSignInAlt } from "react-icons/fa";

const Header = () => {
  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-end space-x-4">
        <Link
          to="/register"
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-md hover:shadow-lg transition-all flex items-center"
        >
          <FaUserPlus className="mr-2" /> Register
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md hover:shadow-lg transition-all flex items-center"
        >
          <FaSignInAlt className="mr-2" /> Login
        </Link>
      </div>
    </header>
  );
};

export default Header;