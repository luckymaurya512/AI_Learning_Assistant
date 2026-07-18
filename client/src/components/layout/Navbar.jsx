import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import logo from '../../assets/StudyBuddy_logo.png';
import { Sparkles, Menu, X, User, LogOut, Layers, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/documents', label: 'Library' },
    { path: '/flashcards', label: 'Flashcards' }
  ];

  if (!user) return null;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-white group">
              <img 
                src={logo} 
                alt="StudyBuddy Logo" 
                className="h-9 w-9 object-contain rounded-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform" 
              />
              <span className="font-extrabold text-lg tracking-tight flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                StudyBuddy
                <Sparkles size={14} className="text-yellow-400 animate-pulse" />
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive 
                      ? 'text-indigo-400' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Profile Dropdown / Logged In User */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/profile" 
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 transition-all text-xs font-medium text-slate-300"
            >
              <User size={14} className="text-slate-500" />
              <span>{user.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-950 border border-transparent hover:border-slate-800 transition-all"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-850 bg-slate-900 p-4 space-y-4 animate-slideDown">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-950 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-950 transition-all"
            >
              Profile
            </Link>
          </div>

          <div className="border-t border-slate-850 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <User size={14} className="text-slate-500" />
              <span>{user.username}</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
