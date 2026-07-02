export type User = {
  id: string;
  username: string;
  password?: string;
  avatar: string;
  streaks: number;
  birthDate?: string;
  email?: string;
  gender?: string;
  hasSeenWalkthrough?: boolean;
  achievements?: string[];
};

export type Post = {
  id: string;
  author: User;
  type: "reel" | "video" | "live";
  url: string;
  likes: number;
  comments: number;
  description: string;
};

export const MOCK_USER: User = {
  id: "u1",
  username: "social_star",
  avatar: "https://i.pravatar.cc/150?u=social_star",
  streaks: 42,
  birthDate: "2000-05-03"
};

export const MOCK_FRIENDS: User[] = [
  { id: "f1", username: "alex_snap", avatar: "https://i.pravatar.cc/150?u=f1", streaks: 15 },
  { id: "f2", username: "emma_live", avatar: "https://i.pravatar.cc/150?u=f2", streaks: 112 },
  { id: "f3", username: "lucas_filter", avatar: "https://i.pravatar.cc/150?u=f3", streaks: 4, birthDate: "1999-06-18" },
  { id: "f4", username: "chloe_reels", avatar: "https://i.pravatar.cc/150?u=f4", streaks: 88 }
];

export const MOCK_REELS: Post[] = [
  {
    id: "r1",
    author: MOCK_FRIENDS[0],
    type: "reel",
    url: "https://images.unsplash.com/photo-1616428678601-3b567b57c66d?auto=format&fit=crop&q=80&w=600&h=1000",
    likes: 1243,
    comments: 89,
    description: "Sunset vibes 🌅 #chilling"
  },
  {
    id: "r2",
    author: MOCK_FRIENDS[3],
    type: "reel",
    url: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600&h=1000",
    likes: 955,
    comments: 12,
    description: "City walks in Tokyo 🇯🇵"
  }
];

export const MOCK_USER_POSTS: Post[] = [
  {
    id: "p1",
    author: MOCK_USER,
    type: "reel",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600&h=1000",
    likes: 432,
    comments: 21,
    description: "Office day!"
  },
  {
    id: "p2",
    author: MOCK_USER,
    type: "video",
    url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800&h=450",
    likes: 1024,
    comments: 54,
    description: "Lunch time 🥗"
  },
  {
    id: "p3",
    author: MOCK_USER,
    type: "reel",
    url: "https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&q=80&w=600&h=1000",
    likes: 850,
    comments: 32,
    description: "Weekend hike 🏔️"
  }
];

export const MOCK_VIDEOS: Post[] = [
  {
    id: "v1",
    author: MOCK_FRIENDS[1],
    type: "live",
    url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800&h=450",
    likes: 4500,
    comments: 1200,
    description: "LIVE: Unboxing the new tech!"
  },
  {
    id: "v2",
    author: MOCK_FRIENDS[2],
    type: "video",
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800&h=450",
    likes: 852,
    comments: 63,
    description: "My coding setup tour 2026 💻"
  }
];
