import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { searchMovies, getTMDBDetails, getTMDBDetailsByTitle } from "../api/api";
import "./Navbar.css";

const FALLBACK = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=50&q=80";

export default function Navbar({ onSearch }) {
  const [query, setQuery]       = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [results, setResults]   = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  
  const hideSearch = location.pathname === "/login" || location.pathname === "/register";

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || !open) {
      setResults([]);
      return;
    }
    const fetchLive = async () => {
      setIsTyping(true);
      try {
        const res = await searchMovies(query);
        const allMatches = Array.isArray(res.data) ? res.data : [];
        const strictMatches = allMatches.filter(m => 
          m.title?.toLowerCase().startsWith(query.toLowerCase())
        );
        const raw = strictMatches.slice(0, 5);
        
        const enhanced = await Promise.all(
          raw.map(async (m) => {
            try {
              const details = m.tmdbId 
                ? await getTMDBDetails(m.tmdbId) 
                : await getTMDBDetailsByTitle(m.title);
              return { ...m, thumb: details?.url || FALLBACK };
            } catch {
              return { ...m, thumb: FALLBACK };
            }
          })
        );
        setResults(enhanced);
      } catch (err) {
        setResults([]);
      } finally {
        setIsTyping(false);
      }
    };

    const timer = setTimeout(fetchLive, 350);
    return () => clearTimeout(timer);
  }, [query, open]);

  const submit = (e) => {
    e.preventDefault();
    setResults([]);
    onSearch?.(query.trim());
  };

  const handleTileClick = (title) => {
    setQuery(title);
    setResults([]);
    onSearch?.(title);
  };

  return (
    <nav className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      {/* Logo */}
      <Link to="/" className="nav__logo">
        <span className="logo-w">Cine</span><span className="logo-r">Match</span>
      </Link>

      {/* Search */}
      {!hideSearch && (
        <div className="nav__search-container" ref={dropdownRef}>
          <form className={`nav__search ${open ? "nav__search--open" : ""}`} onSubmit={submit}>
          <button
            type="button"
            className="nav__search-icon"
            onClick={() => setOpen((v) => !v)}
            aria-label="toggle search"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <input
            className="nav__input"
            type="text"
            placeholder="Search titles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
          />
          {query && (
            <button type="button" className="nav__clear" onClick={() => { setQuery(""); onSearch?.(""); setResults([]); }}>
              ✕
            </button>
          )}
        </form>

        {/* Dropdown Tiles */}
        {open && results.length > 0 && (
          <div className="nav__dropdown">
            {results.map((movie) => (
              <div 
                key={movie.id} 
                className="nav__tile" 
                onClick={() => handleTileClick(movie.title)}
              >
                <img src={movie.thumb} alt={movie.title} className="nav__tile-img" />
                <div className="nav__tile-info">
                  <p className="nav__tile-title">{movie.title}</p>
                  {movie.releaseYear && <p className="nav__tile-year">{movie.releaseYear}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Mobile Hamburger Icon */}
      <button 
        className="nav__hamburger" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {mobileMenuOpen 
            ? <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            : <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
          }
        </svg>
      </button>

      {/* Auth Controls */}
      <div className={`nav__auth ${mobileMenuOpen ? "nav__auth--open" : ""}`}>
        {token ? (
          <>
            <Link to="/" className="nav__auth-link">Home</Link>
            <Link to="/recommendations" className="nav__auth-link">Recommend</Link>
            <Link to="/dashboard" className="nav__auth-link">Dashboard</Link>
            <button onClick={handleLogoutClick} className="nav__auth-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/" className="nav__auth-link">Home</Link>
            <Link to="/login" className="nav__auth-link">Log In</Link>
            <Link to="/register" className="nav__auth-btn">Sign Up</Link>
          </>
        )}
      </div>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="nav__logout-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="nav__logout-card" onClick={(e) => e.stopPropagation()}>
            <div className="nav__logout-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <h3>Leaving so soon?</h3>
            <p>Do you want to logout of your device?</p>
            <div className="nav__logout-actions">
              <button className="nav__logout-btn cancel" onClick={() => setShowLogoutConfirm(false)}>Stay</button>
              <button className="nav__logout-btn confirm" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}