import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-lg">Ethara PM</div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/dashboard" className="text-blue-600">
            Dashboard
          </Link>
          <span>
            {user?.name} ({user?.role})
          </span>
          <button onClick={onLogout} className="bg-slate-900 text-white px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
