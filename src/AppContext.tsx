import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Post, MOCK_USER, MOCK_FRIENDS, MOCK_REELS, MOCK_VIDEOS, MOCK_USER_POSTS } from "./data";
import { toast } from "./lib/toast";

interface AppState {
  user: User | null;
  users: User[];
  reels: Post[];
  videos: Post[];
  userPosts: Post[];
  friends: User[];
  messages: Record<string, any[]>;
  accountsCount: number;
  hasSeenDemo: boolean;
  login: (username: string, isRegister: boolean) => void;
  logout: () => void;
  likePost: (postId: string, type: 'reel' | 'video' | 'post') => void;
  createPost: (post: Post) => void;
  sendMessage: (friendId: string, text: string) => void;
}

export const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([...MOCK_FRIENDS, MOCK_USER]); // all users
  const [friends, setFriends] = useState<User[]>(MOCK_FRIENDS);
  const [reels, setReels] = useState<Post[]>(MOCK_REELS);
  const [videos, setVideos] = useState<Post[]>(MOCK_VIDEOS);
  const [userPosts, setUserPosts] = useState<Post[]>(MOCK_USER_POSTS);
  const [messages, setMessages] = useState<Record<string, any[]>>({});
  
  const [accountsCount, setAccountsCount] = useState(0);
  const [hasSeenDemo, setHasSeenDemo] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('zocialyse-db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || null);
        setUsers(parsed.users || [...MOCK_FRIENDS, MOCK_USER]);
        setFriends(parsed.friends || MOCK_FRIENDS);
        setReels(parsed.reels || MOCK_REELS);
        setVideos(parsed.videos || MOCK_VIDEOS);
        setUserPosts(parsed.userPosts || MOCK_USER_POSTS);
        setMessages(parsed.messages || {});
        setAccountsCount(parsed.accountsCount || 0);
        setHasSeenDemo(parsed.hasSeenDemo || false);
      } catch (e) {}
    }
  }, []);

  const saveState = (newState: Partial<AppState>) => {
    localStorage.setItem('zocialyse-db', JSON.stringify({
      user: newState.user !== undefined ? newState.user : user,
      users: newState.users || users,
      friends: newState.friends || friends,
      reels: newState.reels || reels,
      videos: newState.videos || videos,
      userPosts: newState.userPosts || userPosts,
      messages: newState.messages || messages,
      accountsCount: newState.accountsCount !== undefined ? newState.accountsCount : accountsCount,
      hasSeenDemo: newState.hasSeenDemo !== undefined ? newState.hasSeenDemo : hasSeenDemo
    }));
  };

  const login = (username: string, isRegister: boolean) => {
    let newUser: User = { id: `u_${Date.now()}`, username, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, streaks: 0 };
    
    let nextAccountsCount = accountsCount;
    let nextHasSeenDemo = hasSeenDemo;
    let nextReels = [...reels];
    let nextVideos = [...videos];
    let nextUserPosts = [...userPosts];
    let nextFriends = [...friends];
    let nextUsers = [...users];

    if (isRegister) {
      nextAccountsCount += 1;
      
      if (!nextHasSeenDemo) {
        toast({
          title: "Demo Experience",
          message: "We've pre-loaded some examples. They are only shown ONE time to give you a tour! 👀",
          icon: "bell"
        });
        nextHasSeenDemo = true;
      } else {
        // Clear mock data if demo was already seen
        nextReels = nextReels.filter(r => !r.id.startsWith('r'));
        nextVideos = nextVideos.filter(v => !v.id.startsWith('v'));
        nextUserPosts = nextUserPosts.filter(p => !p.id.startsWith('p'));
        nextFriends = nextFriends.filter(f => !f.id.startsWith('f'));
      }

      // 10th user celebration
      if (nextAccountsCount % 10 === 0) {
        toast({
          title: "🎉 10th User! 🎉",
          message: `AMAZING! You are the ${nextAccountsCount}th user to register!`,
          icon: "gift"
        });
      } else {
        toast({
          title: "Welcome! 👋",
          message: `So happy you joined us, ${username}!`,
          icon: "bell"
        });
      }

      // Auto Welcome Gesture post
      const welcomePost: Post = {
        id: `wp_${Date.now()}`,
        author: newUser,
        type: "reel",
        url: "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&q=80&w=600&h=1000",
        likes: 0,
        comments: 0,
        description: `Hey everyone! I just joined Zocialyse 🎉 Say hi!`
      };

      nextReels = [welcomePost, ...nextReels];
      nextUserPosts = [welcomePost, ...nextUserPosts];
      nextUsers = [...nextUsers, newUser];
      
    } else {
      // login
      const existing = nextUsers.find(u => u.username === username);
      if (existing) {
        newUser = existing;
        toast({
          title: "Welcome Back",
          message: `Good to see you, ${username}!`,
          icon: "bell"
        });
      } else {
        toast({
          title: "Account not found",
          message: `We couldn't find ${username}. Logging you in as a new guest.`,
          icon: "bell"
        });
      }
    }

    setUser(newUser);
    setUsers(nextUsers);
    setFriends(nextFriends);
    setReels(nextReels);
    setVideos(nextVideos);
    setUserPosts(nextUserPosts);
    setAccountsCount(nextAccountsCount);
    setHasSeenDemo(nextHasSeenDemo);

    saveState({
      user: newUser,
      users: nextUsers,
      friends: nextFriends,
      reels: nextReels,
      videos: nextVideos,
      userPosts: nextUserPosts,
      accountsCount: nextAccountsCount,
      hasSeenDemo: nextHasSeenDemo
    });
  };

  const logout = () => {
    setUser(null);
    saveState({ user: null });
  };

  const likePost = (postId: string, type: 'reel' | 'video' | 'post') => {
    if (type === 'reel') {
      const updated = reels.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
      setReels(updated);
      saveState({ reels: updated });
    } else if (type === 'video') {
      const updated = videos.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
      setVideos(updated);
      saveState({ videos: updated });
    }
    // Update userPosts if it exists there
    if (userPosts.some(p => p.id === postId)) {
      const updated = userPosts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
      setUserPosts(updated);
      saveState({ userPosts: updated });
    }
  };

  const createPost = (post: Post) => {
    if (post.type === 'reel') {
      const updated = [post, ...reels];
      setReels(updated);
      saveState({ reels: updated });
    } else {
      const updated = [post, ...videos];
      setVideos(updated);
      saveState({ videos: updated });
    }
    const updatedUserPosts = [post, ...userPosts];
    setUserPosts(updatedUserPosts);
    saveState({ userPosts: updatedUserPosts });
  };

  const sendMessage = (friendId: string, text: string) => {
    const updatedMsgs = { ...messages };
    if (!updatedMsgs[friendId]) updatedMsgs[friendId] = [];
    updatedMsgs[friendId].push({ sender: 'me', text, id: Date.now() });
    
    // Auto-reply
    setTimeout(() => {
      setMessages(prev => {
        const next = { ...prev };
        if (!next[friendId]) next[friendId] = [];
        next[friendId].push({ sender: 'them', text: `Got it! 😉`, id: Date.now() + 1 });
        saveState({ messages: next });
        return next;
      });
    }, 1500);

    setMessages(updatedMsgs);
    saveState({ messages: updatedMsgs });
  };

  return (
    <AppContext.Provider value={{
      user, users, reels, videos, userPosts, friends, messages, accountsCount, hasSeenDemo,
      login, logout, likePost, createPost, sendMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
