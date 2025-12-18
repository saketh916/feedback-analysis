import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, Sparkles, Clock, LogOut, User } from 'lucide-react';

const navigation = [
  { name: 'Home', id: 'home', icon: Home },
  { name: 'Features', id: 'features', icon: Sparkles },
  { name: 'Testimonials', id: 'testimonials', icon: Sparkles },
];

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    navigate('/login');
  };

  useEffect(() => setUserEmail(localStorage.getItem('userEmail')), [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isLoggedIn) return null;

  const handleScrollTo = (id) => {
    if (window.location.pathname !== '/home') {
      navigate('/home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer group" 
            onClick={() => navigate('/home')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <img className="h-6 w-6" src="/logo.png" alt="Logo" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FeedbackAI
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleScrollTo(item.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
            <button 
              onClick={() => navigate('/history')} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <Clock className="w-4 h-4" />
              History
            </button>
          </nav>

          {/* Desktop user info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <User className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{userEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-2xl border-t border-gray-200">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleScrollTo(item.id)}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            ))}
            <button
              onClick={() => { navigate('/history'); setIsOpen(false); }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            >
              <Clock className="w-5 h-5" />
              History
            </button>
          </div>
          <div className="pt-4 pb-4 px-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 mb-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700 truncate">{userEmail}</span>
            </div>
            <button
              onClick={() => { handleLogout(); setIsOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
