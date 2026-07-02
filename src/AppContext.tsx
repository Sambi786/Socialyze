import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Post, MOCK_USER, MOCK_FRIENDS, MOCK_REELS, MOCK_VIDEOS, MOCK_USER_POSTS } from "./data";
import { toast } from "./lib/toast";

export interface GroupChat {
  id: string;
  name: string;
  avatar: string;
  adminId: string;
  members: string[];
}

interface AppState {
  user: User | null;
  users: User[];
  reels: Post[];
  videos: Post[];
  userPosts: Post[];
  friends: User[];
  groups: GroupChat[];
  messages: Record<string, any[]>;
  accountsCount: number;
  hasSeenDemo: boolean;
  login: (username: string, password: string, isRegister: boolean, email?: string, gender?: string) => { status: 'success' | 'new_user_tutorial' | 'old_account' | 'error', error?: string, pendingData?: any } | void;
  completeTutorial: (pendingData: any) => void;
  logout: () => void;
  likePost: (postId: string, type: 'reel' | 'video' | 'post') => void;
  createPost: (post: Post) => void;
  sendMessage: (chatId: string, text: string, isGroup?: boolean) => void;
  updateUser: (updatedData: Partial<User>) => void;
  addFriend: (userId: string) => void;
  deleteAccount: () => void;
  resetOldAccount: (username: string, email: string, newPassword: string) => boolean;
  createGroup: (name: string, memberIds: string[]) => void;
}

export const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([...MOCK_FRIENDS, MOCK_USER]); // all users
  const [friends, setFriends] = useState<User[]>(MOCK_FRIENDS);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [reels, setReels] = useState<Post[]>(MOCK_REELS);
  const [videos, setVideos] = useState<Post[]>(MOCK_VIDEOS);
  const [userPosts, setUserPosts] = useState<Post[]>(MOCK_USER_POSTS);
  const [messages, setMessages] = useState<Record<string, any[]>>({});
  
  const [accountsCount, setAccountsCount] = useState(0);
  const [hasSeenDemo, setHasSeenDemo] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('socialyze-db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || null);
        setUsers(parsed.users || [...MOCK_FRIENDS, MOCK_USER]);
        setFriends(parsed.friends || MOCK_FRIENDS);
        setGroups(parsed.groups || []);
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
    localStorage.setItem('socialyze-db', JSON.stringify({
      user: newState.user !== undefined ? newState.user : user,
      users: newState.users || users,
      friends: newState.friends || friends,
      groups: newState.groups || groups,
      reels: newState.reels || reels,
      videos: newState.videos || videos,
      userPosts: newState.userPosts || userPosts,
      messages: newState.messages || messages,
      accountsCount: newState.accountsCount !== undefined ? newState.accountsCount : accountsCount,
      hasSeenDemo: newState.hasSeenDemo !== undefined ? newState.hasSeenDemo : hasSeenDemo
    }));
  };

  const login = (username: string, password: string, isRegister: boolean, email?: string, gender?: string) => {
    let newUser: User = { id: `u_${Date.now()}`, username, password, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, streaks: 0, email, gender };
    
    let nextAccountsCount = accountsCount;
    let nextHasSeenDemo = hasSeenDemo;
    let nextReels = [...reels];
    let nextVideos = [...videos];
    let nextUserPosts = [...userPosts];
    let nextFriends = [...friends];
    let nextUsers = [...users];

    if (isRegister) {
      const existing = nextUsers.find(u => u.username === username);
      if (existing) {
        toast({ title: "Username taken", message: "That username is already in use.", icon: "bell" });
        return { status: 'error' as const, error: 'username_taken' };
      }
      nextAccountsCount += 1;
      
      toast({
        title: "🚀 DEMO MODE ACTIVE",
        message: "IMPORTANT: You are seeing the Demo version with pre-loaded examples. This happens ONLY ONCE to give you a tour of the app. Next time you login, it will be completely empty!",
        icon: "gift"
      });
      nextHasSeenDemo = true;

      // Restore demo data for new accounts
      const missingDemoReels = MOCK_REELS.filter(mr => !nextReels.find(r => r.id === mr.id));
      nextReels = [...nextReels, ...missingDemoReels];

      const missingDemoVideos = MOCK_VIDEOS.filter(mv => !nextVideos.find(v => v.id === mv.id));
      nextVideos = [...nextVideos, ...missingDemoVideos];

      const missingDemoPosts = MOCK_USER_POSTS.filter(mp => !nextUserPosts.find(p => p.id === mp.id)).map(p => ({ ...p, author: newUser, id: p.id }));
      nextUserPosts = [...missingDemoPosts, ...nextUserPosts];

      const missingDemoFriends = MOCK_FRIENDS.filter(mf => !nextFriends.find(f => f.id === mf.id));
      nextFriends = [...nextFriends, ...missingDemoFriends];
      
      const missingDemoUsers = MOCK_FRIENDS.filter(mf => !nextUsers.find(u => u.id === mf.id));
      nextUsers = [...nextUsers, ...missingDemoUsers];
      
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
        description: `Hey everyone! I just joined Socialyze 🎉 Say hi!`
      };

      nextReels = [welcomePost, ...nextReels];
      nextUserPosts = [welcomePost, ...nextUserPosts];
      nextUsers = [...nextUsers, newUser];
      
      return {
        status: 'new_user_tutorial' as const,
        pendingData: {
          newUser, nextUsers, nextFriends, nextReels, nextVideos, nextUserPosts, nextAccountsCount, nextHasSeenDemo
        }
      };
    } else {
      // login
      if (nextHasSeenDemo) {
        nextReels = nextReels.filter(r => !r.id.startsWith('r'));
        nextVideos = nextVideos.filter(v => !v.id.startsWith('v'));
        nextUserPosts = nextUserPosts.filter(p => !p.id.startsWith('p'));
        nextFriends = nextFriends.filter(f => !f.id.startsWith('f'));
      }

      const existing = nextUsers.find(u => u.username === username);
      if (existing) {
        if (!existing.password) {
          // Old account, needs password and email reset
          return { status: 'old_account' as const };
        }
        if (existing.password && existing.password !== password) {
          toast({ title: "Incorrect Password", message: "The password you entered is incorrect.", icon: "bell" });
          return { status: 'error' as const, error: 'incorrect_password' };
        }
        newUser = existing;
        toast({
          title: "Welcome Back",
          message: `Good to see you, ${username}!`,
          icon: "bell"
        });
      } else {
        toast({
          title: "Account not found",
          message: `We couldn't find ${username}. Please register.`,
          icon: "bell"
        });
        return { status: 'error' as const, error: 'not_found' };
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
    return { status: 'success' as const };
  };

  const completeTutorial = (pendingData: any) => {
    setUser(pendingData.newUser);
    setUsers(pendingData.nextUsers);
    setFriends(pendingData.nextFriends);
    setReels(pendingData.nextReels);
    setVideos(pendingData.nextVideos);
    setUserPosts(pendingData.nextUserPosts);
    setAccountsCount(pendingData.nextAccountsCount);
    setHasSeenDemo(pendingData.nextHasSeenDemo);

    saveState({
      user: pendingData.newUser,
      users: pendingData.nextUsers,
      friends: pendingData.nextFriends,
      reels: pendingData.nextReels,
      videos: pendingData.nextVideos,
      userPosts: pendingData.nextUserPosts,
      accountsCount: pendingData.nextAccountsCount,
      hasSeenDemo: pendingData.nextHasSeenDemo
    });
  };

  const resetOldAccount = (username: string, email: string, newPassword: string) => {
    const existingIndex = users.findIndex(u => u.username === username);
    if (existingIndex === -1) return false;
    const existing = users[existingIndex];
    if (existing.email && existing.email.toLowerCase() !== email.toLowerCase()) {
      return false;
    }
    
    // Reset password
    const updatedUser = { ...existing, password: newPassword, email: email };
    
    // Only update the user, don't log them in yet, or do we? 
    // Usually a password reset logs you in or confirms.
    const nextUsers = [...users];
    nextUsers[existingIndex] = updatedUser;
    setUsers(nextUsers);
    setUser(updatedUser);
    saveState({
      users: nextUsers,
      user: updatedUser
    });
    return true;
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

  const sendMessage = (chatId: string, text: string, isGroup?: boolean) => {
    const updatedMsgs = { ...messages };
    if (!updatedMsgs[chatId]) updatedMsgs[chatId] = [];
    updatedMsgs[chatId].push({ sender: 'me', text, id: Date.now() });
    
    // Auto-reply for individuals
    if (!isGroup) {
      setTimeout(() => {
        setMessages(prev => {
          const next = { ...prev };
          if (!next[chatId]) next[chatId] = [];
          next[chatId].push({ sender: 'them', text: `Got it! 😉`, id: Date.now() + 1 });
          saveState({ messages: next });
          return next;
        });
      }, 1500);
    }

    setMessages(updatedMsgs);
    saveState({ messages: updatedMsgs });
  };

  const createGroup = (name: string, memberIds: string[]) => {
    if (!user) return;
    const newGroup: GroupChat = {
      id: `g_${Date.now()}`,
      name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      adminId: user.id,
      members: [user.id, ...memberIds]
    };
    const nextGroups = [...groups, newGroup];
    setGroups(nextGroups);
    saveState({ groups: nextGroups });
    toast({ title: "Group Created", message: `You created a new group: ${name}`, icon: "bell" });
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    
    // Also update in users list so it persists correctly if needed
    const nextUsers = users.map(u => u.id === user.id ? newUser : u);
    setUsers(nextUsers);
    
    // Update posts authored by user
    const updateAuthor = (post: Post) => post.author.id === user.id ? { ...post, author: newUser } : post;
    const nextReels = reels.map(updateAuthor);
    const nextVideos = videos.map(updateAuthor);
    const nextUserPosts = userPosts.map(updateAuthor);
    
    setReels(nextReels);
    setVideos(nextVideos);
    setUserPosts(nextUserPosts);

    saveState({ 
      user: newUser, 
      users: nextUsers,
      reels: nextReels,
      videos: nextVideos,
      userPosts: nextUserPosts
    });
    
    toast({
      title: "Profile Updated",
      message: "Your profile has been saved successfully.",
      icon: "bell"
    });
  };

  const addFriend = (userId: string) => {
    const friendToAdd = users.find(u => u.id === userId);
    if (!friendToAdd) return;
    if (friends.some(f => f.id === userId)) {
      toast({ title: "Already following", message: `You are already following ${friendToAdd.username}`, icon: "bell" });
      return;
    }
    const nextFriends = [...friends, friendToAdd];
    setFriends(nextFriends);
    saveState({ friends: nextFriends });
    toast({ title: "Started following", message: `You are now following ${friendToAdd.username}`, icon: "bell" });
  };

  const deleteAccount = () => {
    if (!user) return;
    
    // Remove user's data
    const nextUsers = users.filter(u => u.id !== user.id);
    const nextReels = reels.filter(r => r.author.id !== user.id);
    const nextVideos = videos.filter(v => v.author.id !== user.id);
    const nextFriends = friends.filter(f => f.id !== user.id);
    
    setUser(null);
    setUsers(nextUsers);
    setReels(nextReels);
    setVideos(nextVideos);
    setUserPosts([]);
    setFriends(nextFriends);
    setMessages({});
    
    saveState({
      user: null,
      users: nextUsers,
      reels: nextReels,
      videos: nextVideos,
      userPosts: [],
      friends: nextFriends,
      messages: {}
    });
    
    toast({ title: "Account Deleted", message: "Your account has been permanently deleted.", icon: "bell" });
  };

  return (
    <AppContext.Provider value={{
      user, users, reels, videos, userPosts, friends, groups, messages, accountsCount, hasSeenDemo,
      login, logout, likePost, createPost, sendMessage, updateUser, addFriend, deleteAccount, resetOldAccount, completeTutorial, createGroup
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
