import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Bell,
  Bookmark,
  User,
  ChevronDown,
  TrendingUp,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { Container } from './Container';
import { useUser } from '../../hooks/UserContext';

const TICKER_ITEMS = [
  'SENSEX  +312.40  ▲  0.82%',
  'NIFTY 50  +96.15  ▲  0.43%',
  'USD/INR  ₹82.34  ▼  0.12%',
  'GOLD  ₹65,420/10g  ▲  0.31%',
  'BRENT CRUDE  $84.20  ▼  0.54%',
  'BITCOIN  $67,840  ▲  2.18%',
  'HDFC BANK  ₹1,624  ▲  1.2%',
  'RELIANCE  ₹2,940  ▲  0.7%',
  'INFOSYS  ₹1,486  ▼  0.3%',
];



export function Navbar() {
  const { selectedField, setSelectedField } = useUser();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((i) => (i + 1) % TICKER_ITEMS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* ── Live Ticker bar ── */}
      <div className="bg-[#1a1a2e] text-white overflow-hidden">
        <div className="flex items-center gap-0">
          <div className="flex items-center gap-2 bg-[#c0392b] px-3 sm:px-4 py-1.5 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs tracking-widest uppercase font-semibold hidden sm:inline">Live Markets</span>
            <span className="text-xs tracking-widest uppercase font-semibold sm:hidden">Live</span>
          </div>
          <div className="flex-1 overflow-hidden px-3 sm:px-6 py-1.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={tickerIndex}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.32, ease: 'easeInOut' }}
                className="text-xs tracking-wide font-mono text-gray-200 truncate"
              >
                {TICKER_ITEMS[tickerIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="hidden md:flex items-center gap-1 px-4 py-1.5 text-xs text-gray-400 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <div
        className={`bg-white border-b border-gray-200 transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-12 sm:h-14 gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 bg-[#c0392b] rounded flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                <span
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-lg sm:text-xl text-gray-900 tracking-tight select-none"
                >
                  My<span className="text-[#c0392b]">ET</span>
                </span>
              </div>
            </Link>

            {/* Dynamic Editorial Categories - Replacing old static NAV_LINKS */}
            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center ml-4">
              {['General', 'Markets', 'Business', 'Startups', 'Banking', 'Technology', 'Economy'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedField(cat)}
                  className={`text-[11px] uppercase tracking-[0.15em] font-black transition-colors ${
                    selectedField === cat ? 'text-[#c0392b]' : 'text-gray-400 hover:text-gray-900'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {cat}
                </button>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Search — expandable on mobile */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 160, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search news…"
                      className="w-full text-sm px-3 py-1.5 bg-gray-100 rounded-lg outline-none border border-gray-200 focus:border-[#c0392b]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      onBlur={() => setSearchOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#c0392b] rounded-full" />
              </button>

              <button className="hidden sm:block p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Profile link */}
              <Link
                to="/profile"
                className={`hidden sm:flex items-center gap-2 ml-1 px-2.5 sm:px-3 py-1.5 rounded-full transition-colors ${
                  location.pathname === '/profile'
                    ? 'bg-[#1a1a2e] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs">R</span>
                </div>
                <span className="text-sm hidden md:inline">Rahul</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 hidden md:inline" />
              </Link>

              {/* Hamburger — mobile / tablet */}
              <button
                className="lg:hidden ml-0.5 p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </Container>

        {/* ── Mobile / tablet nav drawer ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="p-4 space-y-4">
                {/* Category Sections */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Editorial Focus
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['General', 'Markets', 'Business', 'Startups', 'Banking', 'Technology', 'Economy'].map((link) => (
                      <button
                        key={link}
                        onClick={() => setSelectedField(link)}
                        className={`px-3.5 py-1.5 text-sm rounded-full border transition-all ${
                          selectedField === link
                            ? 'bg-[#c0392b] text-white border-[#c0392b]'
                            : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile row */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs">R</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Rahul Sharma</p>
                      <p className="text-xs text-gray-400">View Profile</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                      <User className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </header>
  );
}