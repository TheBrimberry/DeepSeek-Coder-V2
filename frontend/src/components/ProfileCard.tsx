import { Link } from 'react-router-dom';
import { CheckCircle, Users, Video } from 'lucide-react';
import { formatViewCount } from '../data/mock';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  video_count: number;
  follower_count: number;
  is_verified: boolean;
  joined_at: string;
}

interface ProfileCardProps {
  profile: Profile;
  featured?: boolean;
}

const ProfileCard = ({ profile, featured }: ProfileCardProps) => {
  return (
    <Link
      to={`/profile/${profile.username}`}
      className={`profile-card ${featured ? 'profile-card-featured' : ''}`}
    >
      <img
        src={profile.avatar_url}
        alt={profile.display_name}
        className="profile-card-avatar"
      />
      <div className="profile-card-info">
        <div className="profile-card-name-row">
          <h3 className="profile-card-name">{profile.display_name}</h3>
          {profile.is_verified && <CheckCircle size={16} className="profile-card-verified" />}
        </div>
        <span className="profile-card-username">@{profile.username}</span>
        <p className="profile-card-bio">{profile.bio}</p>
        <div className="profile-card-stats">
          <span className="profile-card-stat">
            <Video size={14} />
            {profile.video_count} videos
          </span>
          <span className="profile-card-stat">
            <Users size={14} />
            {formatViewCount(profile.follower_count).replace(' views', '')} followers
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProfileCard;
