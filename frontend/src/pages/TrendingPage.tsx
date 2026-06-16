import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoCard from '../components/VideoCard';
import { mockVideos } from '../data/mock';

const tabs = ['Today', 'This Week', 'This Month'];
const sortOptions = ['Most Viewed', 'Most Liked', 'Newest'];

const TrendingPage = () => {
  const [activeTab, setActiveTab] = useState('Today');
  const [sortBy, setSortBy] = useState('Most Viewed');
  const [currentPage, setCurrentPage] = useState(1);

  const videosPerPage = 8;
  const totalPages = Math.ceil(mockVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const displayedVideos = mockVideos.slice(startIndex, startIndex + videosPerPage);

  return (
    <div className="page">
      <Header />

      <section className="section">
        <div className="page-header">
          <h1 className="page-title">Trending Videos</h1>
          <p className="page-subtitle">
            See what's popular right now across all sources
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="tabs-bar">
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? 'tab tab-active' : 'tab'}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="sort-dropdown">
            <label htmlFor="sort-select" className="sort-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Video Grid */}
        <div className="video-grid">
          {displayedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="btn btn-outline pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrendingPage;
