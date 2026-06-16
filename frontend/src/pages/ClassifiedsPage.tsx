import { useState } from 'react';
import { Search, MapPin, Plus, AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClassifiedCard from '../components/ClassifiedCard';
import { mockClassifiedCategories, mockClassifieds } from '../data/mock';

const ClassifiedsPage = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('');

  const filteredClassifieds = mockClassifieds.filter((classified) => {
    const matchesCategory = !activeCategory || classified.category === activeCategory;
    const matchesLocation =
      !locationQuery ||
      classified.location.toLowerCase().includes(locationQuery.toLowerCase());
    return matchesCategory && matchesLocation;
  });

  return (
    <div className="page">
      <Header />

      {/* Age Verification Banner */}
      <div className="age-verification-banner">
        <AlertTriangle size={18} />
        <span>You must be 18+ to view classifieds</span>
      </div>

      <section className="section">
        <div className="page-header">
          <h1 className="page-title">Classifieds</h1>
          <p className="page-subtitle">Personal ads and connections</p>
        </div>

        <div className="classifieds-layout">
          {/* Sidebar */}
          <aside className="classifieds-sidebar">
            <h3 className="sidebar-title">Categories</h3>
            <ul className="sidebar-list">
              <li
                className={`sidebar-item ${activeCategory === null ? 'sidebar-item-active' : ''}`}
                onClick={() => setActiveCategory(null)}
              >
                <span>All Categories</span>
                <span className="sidebar-count">
                  {mockClassifieds.length}
                </span>
              </li>
              {mockClassifiedCategories.map((cat) => (
                <li
                  key={cat.id}
                  className={`sidebar-item ${activeCategory === cat.name ? 'sidebar-item-active' : ''}`}
                  onClick={() => setActiveCategory(cat.name)}
                >
                  <span>{cat.name}</span>
                  <span className="sidebar-count">{cat.count}</span>
                </li>
              ))}
            </ul>

            <div className="sidebar-divider" />

            <h3 className="sidebar-title">Location</h3>
            <div className="sidebar-search">
              <MapPin size={16} className="sidebar-search-icon" />
              <input
                type="text"
                className="sidebar-search-input"
                placeholder="Search by location..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="classifieds-main">
            <div className="classified-list">
              {filteredClassifieds.map((classified) => (
                <ClassifiedCard key={classified.id} classified={classified} />
              ))}
            </div>
            {filteredClassifieds.length === 0 && (
              <div className="empty-state">
                <p>No classifieds match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Post an Ad Floating Button */}
      <button className="btn btn-primary floating-btn">
        <Plus size={20} />
        Post an Ad
      </button>

      <Footer />
    </div>
  );
};

export default ClassifiedsPage;
