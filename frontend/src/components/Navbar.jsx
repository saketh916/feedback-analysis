import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Home', id: 'home' },
  { name: 'Features', id: 'features' },
  { name: 'How It Works', id: 'how-it-works' },
  { name: 'Testimonials', id: 'testimonials' },
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

  // Update email on login
  useEffect(() => setUserEmail(localStorage.getItem('userEmail')), [isLoggedIn]);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isLoggedIn) return null;

  // Smooth scroll to section
  const handleScrollTo = (id) => {
    if (window.location.pathname !== '/home') {
      navigate('/home');
      // Scroll after navigation delay
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false); // Close mobile menu
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleScrollTo('home')}>
            <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
            <span className="ml-2 text-xl font-bold text-gray-800">Feedback Analysis</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-6">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleScrollTo(item.id)}
                className="text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {item.name}
              </button>
            ))}
            <button onClick={() => navigate('/history')} className="text-gray-500 hover:text-indigo-600 transition-colors">
              Search History
            </button>
          </nav>

          {/* Desktop user info */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-600 truncate max-w-xs">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Log out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleScrollTo(item.id)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => { navigate('/history'); setIsOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Search History
            </button>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <button
              onClick={() => { handleLogout(); setIsOpen(false); }}
              className="block w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
