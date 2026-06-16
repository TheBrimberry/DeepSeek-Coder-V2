import { useState } from 'react';
import { Search, Play, Grid } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoCard from '../components/VideoCard';
import CategoryCard from '../components/CategoryCard';
import { mockVideos, mockCategories, mockTrendingVideos, mockTags } from '../data/mock';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="page">
      <Header />

      {/* Hero Section */}
      <section
        className="hero"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f0f 100%)',
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">Discover & Watch</h1>
          <p className="hero-subtitle">
            Aggregating the best video content from across the web. Find tutorials,
            entertainment, and everything in between — all in one place.
          </p>
          <div className="hero-search">
            <Search className="hero-search-icon" size={20} />
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search for videos, categories, or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="hero-actions">
            <Link to="/trending" className="btn btn-primary">
              <Play size={18} />
              Browse Videos
            </Link>
            <Link to="/categories" className="btn btn-outline">
              <Grid size={18} />
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Featured Videos</h2>
          <Link to="/trending" className="section-link">
            View All
          </Link>
        </div>
        <div className="video-grid">
          {mockVideos.slice(0, 8).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Trending Now</h2>
          <Link to="/trending" className="section-link">
            View All
          </Link>
        </div>
        <div className="video-grid">
          {mockTrendingVideos.slice(0, 4).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Browse Categories */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Browse Categories</h2>
          <Link to="/categories" className="section-link">
            View All
          </Link>
        </div>
        <div className="category-grid">
          {mockCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Popular Tags */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Popular Tags</h2>
        </div>
        <div className="tag-cloud">
          {mockTags.map((tag) => (
            <Link key={tag.id} to={`/tag/${tag.slug}`} className="tag-pill">
              {tag.name}
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
