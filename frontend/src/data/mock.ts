export interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  view_count: number;
  source_name: string;
  created_at: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  video_count: number;
  thumbnail_url: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface ClassifiedCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface Classified {
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

export interface Profile {
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

export interface Conversation {
  id: string;
  name: string;
  avatar_url: string;
  last_message: string;
  unread_count: number;
  time: string;
  online: boolean;
}

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatViewCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
};

export const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const titles = [
  'Building a REST API with Node.js',
  'React Hooks Deep Dive',
  'CSS Grid Layout Tutorial',
  'TypeScript Advanced Types',
  'Docker for Beginners',
  'GraphQL Fundamentals',
  'Next.js Full Stack App',
  'Python Machine Learning',
  'Rust Programming Basics',
  'Vue 3 Composition API',
  'Kubernetes in Production',
  'Tailwind CSS Crash Course',
  'MongoDB Aggregation Pipeline',
  'AWS Lambda Functions',
  'Flutter Mobile Development',
  'Go Concurrency Patterns',
  'Redis Caching Strategies',
  'PostgreSQL Performance',
  'WebSocket Real-time Apps',
  'CI/CD Pipeline Setup',
  'Microservices Architecture',
  'OAuth 2.0 Explained',
  'Svelte for Beginners',
  'Data Structures in Java',
];

const sources = ['TechTube', 'DevStream', 'CodeCast', 'LearnHub'];

const makeVideo = (i: number): Video => ({
  id: `v${i}`,
  title: titles[i % 24],
  thumbnail_url: `https://picsum.photos/seed/vid${i}/400/225`,
  duration: 300 + (i * 137) % 3600,
  view_count: 1000 + (i * 7919) % 2_000_000,
  source_name: sources[i % 4],
  created_at: new Date(Date.now() - (i * 86_400_000 + i * 3_600_000)).toISOString(),
  slug: `video-${i}`,
});

export const mockVideos: Video[] = Array.from({ length: 24 }, (_, i) => makeVideo(i));

export const mockTrendingVideos: Video[] = [mockVideos[2], mockVideos[5], mockVideos[9], mockVideos[14]];

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Web Development', slug: 'web-development', description: 'HTML, CSS, JavaScript and modern frameworks', video_count: 1240, thumbnail_url: 'https://picsum.photos/seed/cat1/400/225' },
  { id: 'c2', name: 'Mobile Development', slug: 'mobile-development', description: 'iOS, Android, React Native, Flutter', video_count: 890, thumbnail_url: 'https://picsum.photos/seed/cat2/400/225' },
  { id: 'c3', name: 'Data Science', slug: 'data-science', description: 'Machine learning, AI, and analytics', video_count: 760, thumbnail_url: 'https://picsum.photos/seed/cat3/400/225' },
  { id: 'c4', name: 'DevOps', slug: 'devops', description: 'CI/CD, containers, cloud infrastructure', video_count: 540, thumbnail_url: 'https://picsum.photos/seed/cat4/400/225' },
  { id: 'c5', name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security best practices and ethical hacking', video_count: 430, thumbnail_url: 'https://picsum.photos/seed/cat5/400/225' },
  { id: 'c6', name: 'Game Development', slug: 'game-development', description: 'Unity, Unreal Engine, and game design', video_count: 670, thumbnail_url: 'https://picsum.photos/seed/cat6/400/225' },
  { id: 'c7', name: 'Database', slug: 'database', description: 'SQL, NoSQL, and database management', video_count: 380, thumbnail_url: 'https://picsum.photos/seed/cat7/400/225' },
  { id: 'c8', name: 'Cloud Computing', slug: 'cloud-computing', description: 'AWS, Azure, GCP services and architecture', video_count: 510, thumbnail_url: 'https://picsum.photos/seed/cat8/400/225' },
];

export const mockTags: Tag[] = [
  { id: 't1', name: 'JavaScript', slug: 'javascript', count: 3200 },
  { id: 't2', name: 'Python', slug: 'python', count: 2800 },
  { id: 't3', name: 'React', slug: 'react', count: 2100 },
  { id: 't4', name: 'TypeScript', slug: 'typescript', count: 1900 },
  { id: 't5', name: 'Node.js', slug: 'nodejs', count: 1700 },
  { id: 't6', name: 'CSS', slug: 'css', count: 1500 },
  { id: 't7', name: 'Docker', slug: 'docker', count: 1200 },
  { id: 't8', name: 'AWS', slug: 'aws', count: 1100 },
  { id: 't9', name: 'GraphQL', slug: 'graphql', count: 950 },
  { id: 't10', name: 'Rust', slug: 'rust', count: 880 },
  { id: 't11', name: 'Go', slug: 'go', count: 820 },
  { id: 't12', name: 'Vue', slug: 'vue', count: 780 },
  { id: 't13', name: 'Kubernetes', slug: 'kubernetes', count: 720 },
  { id: 't14', name: 'Machine Learning', slug: 'machine-learning', count: 1600 },
  { id: 't15', name: 'SQL', slug: 'sql', count: 1400 },
];

export const mockClassifiedCategories: ClassifiedCategory[] = [
  { id: 'cc1', name: 'Casual Encounters', slug: 'casual-encounters', count: 120 },
  { id: 'cc2', name: 'Dating', slug: 'dating', count: 95 },
  { id: 'cc3', name: 'Friendships', slug: 'friendships', count: 80 },
  { id: 'cc4', name: 'Activity Partners', slug: 'activity-partners', count: 65 },
  { id: 'cc5', name: 'Missed Connections', slug: 'missed-connections', count: 45 },
  { id: 'cc6', name: 'Services', slug: 'services', count: 110 },
];

export const mockClassifieds: Classified[] = [
  { id: 'cl1', title: 'Looking for hiking buddy', description: 'Want someone to hike trails on weekends. Experience preferred.', category: 'Activity Partners', location: 'Denver, CO', age: 28, posted_at: new Date(Date.now() - 3_600_000).toISOString(), author: 'TrailBlazer', avatar_url: 'https://picsum.photos/seed/avatar1/80/80' },
  { id: 'cl2', title: 'Coffee meetup this weekend', description: 'Looking for interesting people to chat with over coffee.', category: 'Friendships', location: 'Portland, OR', age: 25, posted_at: new Date(Date.now() - 7_200_000).toISOString(), author: 'CoffeeFan', avatar_url: 'https://picsum.photos/seed/avatar2/80/80' },
  { id: 'cl3', title: 'Photography partner wanted', description: 'Amateur photographer looking for someone to explore urban photography.', category: 'Activity Partners', location: 'Seattle, WA', age: 32, posted_at: new Date(Date.now() - 14_400_000).toISOString(), author: 'SnapShooter', avatar_url: 'https://picsum.photos/seed/avatar3/80/80' },
  { id: 'cl4', title: 'New in town, looking for friends', description: 'Just moved here and want to meet new people. Into gaming and movies.', category: 'Friendships', location: 'Austin, TX', age: 24, posted_at: new Date(Date.now() - 28_800_000).toISOString(), author: 'NewInTown24', avatar_url: 'https://picsum.photos/seed/avatar4/80/80' },
  { id: 'cl5', title: 'Dance class partner', description: 'Looking for a partner for salsa dance classes starting next month.', category: 'Activity Partners', location: 'Miami, FL', age: 29, posted_at: new Date(Date.now() - 43_200_000).toISOString(), author: 'DancerMia', avatar_url: 'https://picsum.photos/seed/avatar5/80/80' },
  { id: 'cl6', title: 'Board game nights', description: 'Hosting weekly board game nights. All skill levels welcome!', category: 'Friendships', location: 'Chicago, IL', age: 30, posted_at: new Date(Date.now() - 86_400_000).toISOString(), author: 'GameMaster', avatar_url: 'https://picsum.photos/seed/avatar6/80/80' },
  { id: 'cl7', title: 'Running group forming', description: 'Starting a casual running group. 5K to half marathon distances.', category: 'Activity Partners', location: 'San Diego, CA', age: 27, posted_at: new Date(Date.now() - 100_000_000).toISOString(), author: 'RunFast', avatar_url: 'https://picsum.photos/seed/avatar7/80/80' },
  { id: 'cl8', title: 'Language exchange Spanish/English', description: 'Native Spanish speaker looking to practice English. Can teach Spanish in return.', category: 'Services', location: 'New York, NY', age: 26, posted_at: new Date(Date.now() - 172_800_000).toISOString(), author: 'LinguaFan', avatar_url: 'https://picsum.photos/seed/avatar8/80/80' },
];

export const mockProfiles: Profile[] = [
  { id: 'p1', username: 'techguru', display_name: 'Alex Chen', avatar_url: 'https://picsum.photos/seed/prof1/200/200', bio: 'Full-stack developer passionate about open source and teaching.', video_count: 142, follower_count: 25600, is_verified: true, joined_at: '2023-01-15' },
  { id: 'p2', username: 'codemaster', display_name: 'Sarah Johnson', avatar_url: 'https://picsum.photos/seed/prof2/200/200', bio: 'DevOps engineer by day, content creator by night.', video_count: 98, follower_count: 18200, is_verified: true, joined_at: '2023-03-22' },
  { id: 'p3', username: 'designdev', display_name: 'Marcus Lee', avatar_url: 'https://picsum.photos/seed/prof3/200/200', bio: 'UI/UX designer and front-end developer. Design systems enthusiast.', video_count: 76, follower_count: 12400, is_verified: true, joined_at: '2023-05-10' },
  { id: 'p4', username: 'datawhiz', display_name: 'Priya Patel', avatar_url: 'https://picsum.photos/seed/prof4/200/200', bio: 'Data scientist exploring ML and AI. Python lover.', video_count: 64, follower_count: 9800, is_verified: false, joined_at: '2023-07-01' },
  { id: 'p5', username: 'rustacean', display_name: 'Jake Morrison', avatar_url: 'https://picsum.photos/seed/prof5/200/200', bio: 'Systems programmer. Rust evangelist. Low-level is the way.', video_count: 53, follower_count: 7600, is_verified: false, joined_at: '2023-08-14' },
  { id: 'p6', username: 'cloudninja', display_name: 'Elena Volkov', avatar_url: 'https://picsum.photos/seed/prof6/200/200', bio: 'Cloud architect with a focus on scalable solutions and Kubernetes.', video_count: 41, follower_count: 6200, is_verified: false, joined_at: '2023-09-05' },
  { id: 'p7', username: 'mobileguru', display_name: 'Omar Hassan', avatar_url: 'https://picsum.photos/seed/prof7/200/200', bio: 'Mobile developer building beautiful cross-platform apps.', video_count: 87, follower_count: 14300, is_verified: true, joined_at: '2023-02-18' },
  { id: 'p8', username: 'securitypro', display_name: 'Lisa Wang', avatar_url: 'https://picsum.photos/seed/prof8/200/200', bio: 'Cybersecurity researcher and ethical hacker. CTF competitor.', video_count: 35, follower_count: 5100, is_verified: false, joined_at: '2023-10-20' },
];

export const mockConversations: Conversation[] = [
  { id: 'conv1', name: 'Alex Chen', avatar_url: 'https://picsum.photos/seed/prof1/80/80', last_message: 'Hey, did you see the new React update?', unread_count: 3, time: '2m ago', online: true },
  { id: 'conv2', name: 'Sarah Johnson', avatar_url: 'https://picsum.photos/seed/prof2/80/80', last_message: 'The deployment pipeline is fixed now', unread_count: 0, time: '15m ago', online: true },
  { id: 'conv3', name: 'Marcus Lee', avatar_url: 'https://picsum.photos/seed/prof3/80/80', last_message: 'I sent you the design mockups', unread_count: 1, time: '1h ago', online: false },
  { id: 'conv4', name: 'Priya Patel', avatar_url: 'https://picsum.photos/seed/prof4/80/80', last_message: 'Can you review my PR?', unread_count: 0, time: '3h ago', online: false },
  { id: 'conv5', name: 'Jake Morrison', avatar_url: 'https://picsum.photos/seed/prof5/80/80', last_message: 'Rust > everything else, change my mind', unread_count: 5, time: '5h ago', online: true },
  { id: 'conv6', name: 'Elena Volkov', avatar_url: 'https://picsum.photos/seed/prof6/80/80', last_message: 'The K8s cluster is ready for testing', unread_count: 0, time: '1d ago', online: false },
];
