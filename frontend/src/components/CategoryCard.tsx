import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  video_count: number;
  thumbnail_url: string;
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link to={`/category/${category.slug}`} className="category-card">
      <div className="category-card-thumbnail">
        <img src={category.thumbnail_url} alt={category.name} />
        <div className="category-card-overlay">
          <span className="category-card-count">{category.video_count} videos</span>
        </div>
      </div>
      <div className="category-card-info">
        <h3 className="category-card-name">{category.name}</h3>
        <p className="category-card-description">{category.description}</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
