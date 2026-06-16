import { useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import { mockCategories, mockTags } from '../data/mock';

const CategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = mockCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page">
      <Header />

      <section className="section">
        <div className="page-header">
          <h1 className="page-title">Browse Categories</h1>
        </div>

        {/* Search/Filter Input */}
        <div className="filter-bar">
          <div className="filter-search">
            <Search className="filter-search-icon" size={18} />
            <input
              type="text"
              className="filter-search-input"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="category-grid">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
        {filteredCategories.length === 0 && (
          <div className="empty-state">
            <p>No categories match your search.</p>
          </div>
        )}
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

export default CategoriesPage;
