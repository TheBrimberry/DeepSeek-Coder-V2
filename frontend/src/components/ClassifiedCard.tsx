import { MapPin, Clock } from 'lucide-react';
import { timeAgo } from '../data/mock';

interface Classified {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  age: number;
  posted_at: string;
  author: string;
  avatar_url: string;
}

interface ClassifiedCardProps {
  classified: Classified;
}

const ClassifiedCard = ({ classified }: ClassifiedCardProps) => {
  return (
    <div className="classified-card">
      <div className="classified-card-header">
        <img
          src={classified.avatar_url}
          alt={classified.author}
          className="classified-card-avatar"
        />
        <div className="classified-card-author-info">
          <span className="classified-card-author">{classified.author}</span>
          <span className="classified-card-time">
            <Clock size={12} />
            {timeAgo(classified.posted_at)}
          </span>
        </div>
        <span className="classified-card-category">{classified.category}</span>
      </div>
      <h3 className="classified-card-title">{classified.title}</h3>
      <p className="classified-card-description">{classified.description}</p>
      <div className="classified-card-footer">
        <span className="classified-card-location">
          <MapPin size={14} />
          {classified.location}
        </span>
        <span className="classified-card-age">Age: {classified.age}</span>
      </div>
    </div>
  );
};

export default ClassifiedCard;
