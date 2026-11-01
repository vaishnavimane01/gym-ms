import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  LogOut,
  Dumbbell,
  User,
  Flame,
  Utensils
} from 'lucide-react';

const navItems = [
  { to: '/member/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/member/attendance', label: 'Attendance', icon: Flame },
  { to: '/member/routine', label: 'Routine', icon: Utensils },
  { to: '/member/book', label: 'Book PT', icon: Calendar },
  { to: '/member/bookings', label: 'Bookings', icon: CalendarCheck },
];

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Dumbbell className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 leading-tight">Gym Management System II</h1>
          <p className="text-[10px] text-gray-500">Member Portal</p>
        </div>
        <div className="flex-1" />
        <span className="text-sm text-gray-600 hidden sm:inline">{user?.username}</span>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 max-w-2xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-2 py-2 flex justify-around items-center z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-emerald-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
