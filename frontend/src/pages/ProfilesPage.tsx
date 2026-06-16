import { useState } from 'react';
import { Search, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileCard from '../components/ProfileCard';
import { mockProfiles } from '../data/mock';

const ProfilesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const featuredProfiles = mockProfiles.slice(0, 3);

  const filteredProfiles = mockProfiles.filter(
    (profile) =>
      profile.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page">
      <Header />

      <section className="section">
        <div className="page-header">
          <h1 className="page-title">Community Profiles</h1>
        </div>

        {/* Search Bar */}
        <div className="filter-bar">
          <div className="filter-search">
            <Search className="filter-search-icon" size={18} />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search profiles by name, username, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Featured Members */}
        <div className="featured-section">
          <div className="section-header">
            <h2 className="section-title">
              <Star size={20} className="section-title-icon" />
              Featured Members
            </h2>
          </div>
          <div className="profile-grid">
            {featuredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} featured />
            ))}
          </div>
        </div>

        {/* All Profiles */}
        <div className="section-header">
          <h2 className="section-title">All Members</h2>
        </div>
        <div className="profile-grid">
          {filteredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
        {filteredProfiles.length === 0 && (
          <div className="empty-state">
            <p>No profiles match your search.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ProfilesPage;
