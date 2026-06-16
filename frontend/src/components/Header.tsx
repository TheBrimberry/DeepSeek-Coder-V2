import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, User } from 'lucide-react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          VidHub
        </Link>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/trending" className="nav-link" onClick={closeMenu}>
            Trending
          </Link>
          <Link to="/categories" className="nav-link" onClick={closeMenu}>
            Categories
          </Link>
          <Link to="/classifieds" className="nav-link" onClick={closeMenu}>
            Classifieds
          </Link>
          <Link to="/profiles" className="nav-link" onClick={closeMenu}>
            Profiles
          </Link>
          <Link to="/chat" className="nav-link" onClick={closeMenu}>
            Chat
          </Link>
        </nav>

        <div className="header-search">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search videos..."
          />
        </div>

        <div className="header-actions">
          <Link to="/login" className="btn btn-outline">
            <User size={16} />
            Login
          </Link>
          <Link to="/signup" className="btn btn-primary">
            Sign Up
          </Link>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
