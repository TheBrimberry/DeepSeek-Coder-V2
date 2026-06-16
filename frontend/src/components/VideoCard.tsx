import { Link } from 'react-router-dom';
import { Eye, Clock } from 'lucide-react';
import { formatDuration, formatViewCount, timeAgo } from '../data/mock';

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  view_count: number;
  source_name: string;
  created_at: string;
  slug: string;
}

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <Link to={`/video/${video.slug}`} className="video-card">
      <div className="video-card-thumbnail">
        <img src={video.thumbnail_url} alt={video.title} />
        <span className="video-card-duration">
          {formatDuration(video.duration)}
        </span>
      </div>
      <div className="video-card-info">
        <h3 className="video-card-title">{video.title}</h3>
        <div className="video-card-meta">
          <span className="video-card-views">
            <Eye size={14} />
            {formatViewCount(video.view_count)}
          </span>
          <span className="video-card-time">
            <Clock size={14} />
            {timeAgo(video.created_at)}
          </span>
          <span className="video-card-source">{video.source_name}</span>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
