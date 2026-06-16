import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-section">
          <h4 className="footer-title">VidHub</h4>
          <p className="footer-text">
            Your go-to video aggregator for discovering the best content across the web.
          </p>
        </div>
        <div className="footer-section">
          <h4 className="footer-title">Browse</h4>
          <Link to="/trending" className="footer-link">Trending</Link>
          <Link to="/categories" className="footer-link">Categories</Link>
          <Link to="/classifieds" className="footer-link">Classifieds</Link>
          <Link to="/profiles" className="footer-link">Profiles</Link>
        </div>
        <div className="footer-section">
          <h4 className="footer-title">Company</h4>
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <Link to="/terms" className="footer-link">Terms of Service</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 VidHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
