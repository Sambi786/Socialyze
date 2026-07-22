import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Post, GroupChat, MOCK_REELS, MOCK_VIDEOS, MOCK_USER_POSTS } from './data';
import { toast } from './lib/toast';
import { db, auth } from './lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, updateDoc, arrayUnion, arrayRemove, serverTimestamp, orderBy, where, addDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export interface Story {
  id: string;
  userId: string;
  type: 'image' | 'video';
  url: string;
  timestamp: number;
}

interface AppState {
  firebaseUser: any;
  profileSetupRequired: boolean;
  user: User | null;
  users: User[];
  reels: Post[];
  videos: Post[];
  userPosts: Post[];
  friends: User[];
  groups: GroupChat[];
  messages: Record<string, any[]>;
  typingStatus: Record<string, string[]>;
  setTyping: (chatId: string, isTyping: boolean, isGroup?: boolean) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  stories: Story[];
  notifications: any[];
  sendGlobalNotification: (userId: string, title: string, message: string) => void;
  markNotificationRead: (id: string) => void;
  removeGroupMember: (groupId: string, memberId: string, reason: string) => void;
  addGroupMember: (groupId: string, memberId: string) => void;
  accountsCount: number;
  hasSeenDemo: boolean;
  login: (username: string, password: string, isRegister: boolean, email?: string, gender?: string) => Promise<{ status: 'success' | 'new_user_tutorial' | 'old_account' | 'error', error?: string, pendingData?: any } | void>;
  logout: () => void;
  likePost: (postId: string, type: 'reel' | 'video' | 'post') => void;
  createPost: (post: Post) => void;
  sendMessage: (chatId: string, text: string, isGroup?: boolean, channelId?: string) => void;
  updateUser: (updatedData: Partial<User>) => void;
  addFriend: (userId: string) => void;
  acceptFriendRequest: (userId: string) => void;
  rejectFriendRequest: (userId: string) => void;
  removeFriend: (userId: string) => void;
  completeMission: (missionId: string, reward: number) => void;
  deleteAccount: () => void;
  resetOldAccount: (username: string, email: string, newPassword: string) => Promise<boolean>;
  completeTutorial: (pendingData: any) => void;
  createGroup: (name: string, memberIds: string[]) => void;
  updateGroup: (groupId: string, data: Partial<GroupChat>) => void;
  refreshReels: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addStory: (url: string, type?: 'image' | 'video') => void;
  searchUsers: (query: string) => User[];
  incomingCall: any | null;
  myActiveCall: any | null;
  sessionTimeSeconds: number;
  answerCall: (callId: string) => void;
  endCall: (callId: string) => void;
  startCall: (receiverId: string, isVideo?: boolean) => void;
  searchGroups: (query: string) => GroupChat[];
  requestJoinGroup: (groupId: string) => void;
  approveJoinRequest: (groupId: string, userId: string) => void;
}

export const AppContext = createContext<AppState | null>(null);


function getLevenshteinDistance(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyMatch(query: string, target: string): boolean {
  if (!query || !target) return false;
  const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = target.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!q) return false;
  if (t.includes(q)) return true;
  if (q.length > 3 && getLevenshteinDistance(q, t) <= 2) return true;
  return false;
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [profileSetupRequired, setProfileSetupRequired] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [reels, setReels] = useState<Post[]>(MOCK_REELS);
  const [videos, setVideos] = useState<Post[]>(MOCK_VIDEOS);
  const [userPosts, setUserPosts] = useState<Post[]>(MOCK_USER_POSTS);
  const [friends, setFriends] = useState<User[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Record<string, any[]>>({});
  const [typingStatus, setTypingStatus] = useState<Record<string, string[]>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [accountsCount, setAccountsCount] = useState(0);
  const [hasSeenDemo, setHasSeenDemo] = useState(true);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [myActiveCall, setMyActiveCall] = useState<any | null>(null);
  const [sessionTimeSeconds, setSessionTimeSeconds] = useState(0);

  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => setSessionTimeSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const setOnline = async () => {
      await updateDoc(doc(db, "users", user.id), { isOnline: true });
    };
    const setOffline = async () => {
      await updateDoc(doc(db, "users", user.id), { isOnline: false });
    };
    setOnline();
    window.addEventListener("beforeunload", setOffline);
    return () => {
      setOffline();
      window.removeEventListener("beforeunload", setOffline);
    };
  }, [user?.id]);

  // Firestore Subscriptions
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(allUsers);
      setAccountsCount(allUsers.length);
      
      // Save all user accounts to a local file via the backend API so the user can inspect it
      fetch("/api/save-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allUsers)
      }).catch(console.error);
      
      if (user) {
        const me = allUsers.find(u => u.id === user.id);
        if (me) {
          setUser(me);
          // Recompute friends if any data changed
          const myFriends = allUsers.filter(u => {
            const iHaveThem = me.friends?.includes(u.id);
            const theyHaveMe = u.friends?.includes(me.id);
            const areFriends = iHaveThem || theyHaveMe;
            
            if (areFriends) {
              if (!iHaveThem) updateDoc(doc(db, "users", me.id), { friends: arrayUnion(u.id) }).catch(console.error);
              if (!theyHaveMe) updateDoc(doc(db, "users", u.id), { friends: arrayUnion(me.id) }).catch(console.error);
              
              if (me.friendRequests?.includes(u.id)) {
                updateDoc(doc(db, "users", me.id), { friendRequests: arrayRemove(u.id) }).catch(console.error);
              }
              if (u.friendRequests?.includes(me.id)) {
                updateDoc(doc(db, "users", u.id), { friendRequests: arrayRemove(me.id) }).catch(console.error);
              }
              return true;
            }
            return false;
          });
          setFriends(myFriends);
        }
      }
    });

    const unsubGroups = onSnapshot(collection(db, "groups"), (snapshot) => {
      const allGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupChat));
      setGroups(allGroups);
    });

    const unsubCalls = onSnapshot(collection(db, "calls"), (snapshot) => {
      const activeCalls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Check if we are being called
      const myIncoming = activeCalls.find(c => c.receiverId === user?.id && c.status === 'ringing');
      if (myIncoming) {
        setIncomingCall(myIncoming);
      } else {
        setIncomingCall(null);
      }
      
      const myCall = activeCalls.find(c => (c.callerId === user?.id || c.receiverId === user?.id) && (c.status === 'ringing' || c.status === 'accepted'));
      setMyActiveCall(myCall || null);
    });

    let unsubNotifs: any = null;
    if (user) {
      unsubNotifs = onSnapshot(query(collection(db, "notifications"), where("userId", "==", user.id), where("read", "==", false)), (snapshot) => {
        const notifsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setNotifications(notifsData);
      });
    }
      
      const unsubStories = onSnapshot(query(collection(db, "stories"), orderBy("timestamp", "desc")), (snapshot) => {
      const allStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      setStories(allStories);
    });

    return () => {
      unsubNotifs && unsubNotifs();
      unsubUsers();
      unsubStories();
      unsubGroups();
      unsubCalls();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const unsubMsgs = onSnapshot(query(collection(db, "messages"), where("participants", "array-contains", user.id)), (snapshot) => {
      const msgsObj: Record<string, any[]> = {};
      const typingObj: Record<string, string[]> = {};
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.groupId) {
          msgsObj[data.groupId] = data.messages || [];
          typingObj[data.groupId] = data.typing || [];
        } else {
          const otherId = data.participants.find((p: string) => p !== user.id) || user.id;
          msgsObj[otherId] = data.messages || [];
          typingObj[otherId] = data.typing || [];
        }
      });
      setMessages(msgsObj);
      setTypingStatus(typingObj);
    });
    return () => unsubMsgs();
  }, [user?.id]);

  // Auth persistence using Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        // user is logged into firebase auth
        const userDocRef = doc(db, 'users', fUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          setProfileSetupRequired(false);
          // Wait for allUsers to be populated to set friends, handled by unsubUsers listener
        } else {
          setUser(null);
          setProfileSetupRequired(true);
        }
      } else {
        setUser(null);
        setProfileSetupRequired(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && users.length > 0) {
      setFriends(users.filter(u => user.friends?.includes(u.id)));
    }
  }, [user, users.length]);


  const login = async (username: string, password: string, isRegister: boolean, email?: string, gender?: string) => {
    if (isRegister) {
      const existing = users.find(u => u.username === username);
      if (existing) {
        toast({ title: "Username taken", message: "Try another username.", icon: "bell" });
        return { status: 'error' as const, error: 'exists' };
      }
      const newUser: User = {
        id: `u_${Date.now()}`,
        username,
        password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        streaks: 0,
        email,
        gender,
        friends: []
      };
      await setDoc(doc(db, "users", newUser.id), newUser);
      localStorage.setItem('socialyze_user_id', newUser.id);
      return { status: 'new_user_tutorial' as const, pendingData: { newUser } };
    } else {
      const existing = users.find(u => u.username === username);
      if (existing) {
        if (existing.password && existing.password !== password) {
          toast({ title: "Incorrect Password", message: "The password you entered is incorrect.", icon: "bell" });
          return { status: 'error' as const, error: 'incorrect_password' };
        }
        setUser(existing);
        setFriends(users.filter(u => existing.friends?.includes(u.id)));
        localStorage.setItem('socialyze_user_id', existing.id);
        toast({ title: "Welcome Back", message: `Good to see you, ${username}!`, icon: "bell" });
        return { status: 'success' as const };
      } else {
        toast({ title: "Account not found", message: `We couldn't find ${username}.`, icon: "bell" });
        return { status: 'error' as const, error: 'not_found' };
      }
    }
  };

  const completeTutorial = (pendingData: any) => {
    setUser(pendingData.newUser);
  };

  const resetOldAccount = async (username: string, email: string, newPassword: string) => {
    const existing = users.find(u => u.username === username);
    if (!existing) return false;
    if (existing.email && existing.email.toLowerCase() !== email.toLowerCase()) return false;
    await updateDoc(doc(db, "users", existing.id), { password: newPassword, email: email.toLowerCase() });
    
    // Also trigger save-accounts so it updates immediately in the local file
    const updatedUsers = users.map(u => u.id === existing.id ? { ...u, password: newPassword, email: email.toLowerCase() } : u);
    fetch("/api/save-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUsers)
    }).catch(console.error);

    return true;
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setProfileSetupRequired(false);
    localStorage.removeItem('socialyze_user_id');
  };

  const likePost = () => {};
  const createPost = () => {};

  const setTyping = async (chatId: string, isTyping: boolean, isGroup?: boolean) => {
    if (!user) return;
    const docId = isGroup ? chatId : (user.id < chatId ? `${user.id}_${chatId}` : `${chatId}_${user.id}`);
    const chatRef = doc(db, "messages", docId);
    
    try {
      if (isTyping) {
        const dataToSet: any = {
          typing: arrayUnion(user.id),
          groupId: isGroup ? chatId : null
        };
        if (!isGroup) {
          dataToSet.participants = arrayUnion(user.id, chatId);
        }
        await setDoc(chatRef, dataToSet, { merge: true });
      } else {
        await setDoc(chatRef, { typing: arrayRemove(user.id) }, { merge: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (chatId: string, text: string, isGroup?: boolean, channelId?: string) => {
    if (!user) return;
    const msg: any = { sender: user.id, text, id: Date.now() };
    if (channelId) msg.channelId = channelId;
    
    const docId = isGroup ? chatId : (user.id < chatId ? `${user.id}_${chatId}` : `${chatId}_${user.id}`);
    const chatRef = doc(db, "messages", docId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      let participants = [user.id, chatId];
      if (isGroup) {
        const group = groups.find(g => g.id === chatId);
        participants = (group && group.members) ? group.members : [user.id];
      }
      
      participants = participants.filter(Boolean); // Safe guard against undefined

      await setDoc(chatRef, {
        participants,
        groupId: isGroup ? chatId : null,
        messages: [msg]
      });
    } else {
      await updateDoc(chatRef, {
        messages: arrayUnion(msg)
      });
    }
  };

  const completeMission = async (missionId: string, reward: number) => {
    if (!user) return;
    if (user.completedMissions?.includes(missionId)) return;
    
    const newSambi = (user.sambi || 0) + reward;
    await updateDoc(doc(db, "users", user.id), {
      sambi: newSambi,
      completedMissions: arrayUnion(missionId)
    });
    
    toast({
      title: "Mission Completed!",
      message: `You earned ${reward} Sambi!`,
      icon: "gift"
    });
  };

  const updateGroup = async (groupId: string, data: Partial<GroupChat>) => {
    if (!user) return;
    await updateDoc(doc(db, "groups", groupId), data);
    toast({ title: "Group Updated", message: "Group settings saved.", icon: "bell" });
  };

  
  const sendGlobalNotification = async (userId: string, title: string, message: string) => {
    try {
      await addDoc(collection(db, "notifications"), {
        userId,
        title,
        message,
        createdAt: Date.now(),
        read: false
      });
    } catch (e) {
      console.error("Failed to send notification", e);
    }
  };


  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const removeGroupMember = async (groupId: string, memberId: string, reason: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "groups", groupId), {
        members: arrayRemove(memberId)
      });
      const group = groups.find(g => g.id === groupId);
      if (group) {
        await sendGlobalNotification(memberId, "Removed from group", `You were removed from ${group.name}. Reason: ${reason}`);
      }
      toast({ title: "Member removed", message: "Successfully removed member from group.", icon: "bell" });
    } catch (e) {
      console.error(e);
    }
  };

  const addGroupMember = async (groupId: string, memberId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "groups", groupId), {
        members: arrayUnion(memberId)
      });
      const group = groups.find(g => g.id === groupId);
      if (group) {
        await sendGlobalNotification(memberId, "Added to group", `You were added to ${group.name}.`);
      }
      toast({ title: "Member added", message: "Successfully added member to group.", icon: "bell" });
    } catch (e) {
      console.error(e);
    }
  };

  const createGroup = async (name: string, memberIds: string[]) => {
    if (!user) return;
    const newGroup = {
      id: `g_${Date.now()}`,
      name,
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
      adminId: user.id,
      members: [user.id, ...memberIds].slice(0, 25),
      joinRequests: [],
      rulesEnabled: false,
      rules: "Be respectful and kind.",
      agreedUsers: [user.id],
      hideMembers: false,
      categories: [
        {
          id: "cat_general",
          name: "General",
          channels: [
            { id: "chan_general", name: "general", type: "text" as const },
            { id: "chan_announcements", name: "announcements", type: "text" as const, isReadOnly: true }
          ]
        },
        {
          id: "cat_voice",
          name: "Voice Channels",
          channels: [
            { id: "chan_lounge", name: "Lounge", type: "voice" as const }
          ]
        }
      ]
    };
    await setDoc(doc(db, "groups", newGroup.id), newGroup);
    toast({ title: "Group Created", message: `${name} has been created.`, icon: "bell" });
  };
  const refreshReels = () => {};
  
  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.id), updatedData);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error updating profile", message: e.message || "Failed to update profile", icon: "bell" });
    }
  };

  const addFriend = async (userId: string) => {
    if (!user) return;
    // Instead of instantly adding to friends, we send a request to the other user
    await updateDoc(doc(db, "users", userId), {
      friendRequests: arrayUnion(user.id)
    });
    completeMission('send_friend_req', 20);
    toast({ title: "Request Sent", message: `Friend request sent!`, icon: "bell" });
  };

  const acceptFriendRequest = async (userId: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.id), {
      friends: arrayUnion(userId),
      friendRequests: arrayRemove(userId)
    });
    await updateDoc(doc(db, "users", userId), {
      friends: arrayUnion(user.id),
      friendRequests: arrayRemove(user.id)
    });
    toast({ title: "Request Accepted", message: `You are now friends!`, icon: "bell" });
  };

  const rejectFriendRequest = async (userId: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.id), {
      friendRequests: arrayRemove(userId)
    });
    toast({ title: "Request Rejected", message: `Friend request rejected.`, icon: "bell" });
  };

  const removeFriend = async (userId: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.id), {
      friends: arrayRemove(userId)
    });
    await updateDoc(doc(db, "users", userId), {
      friends: arrayRemove(user.id)
    });
    toast({ title: "Unfollowed", message: `You unfollowed them.`, icon: "bell" });
  };

  const deleteAccount = async () => {
    if (!user) return;
    logout();
  };

  const addStory = async (url: string, type: 'image' | 'video' = 'image') => {
    if (!user) return;
    const newStory = {
      userId: user.id,
      type,
      url,
      timestamp: Date.now()
    };
    await addDoc(collection(db, "stories"), newStory);
    toast({ title: "Added to Story", message: "Your story is live for 24 hours!", icon: "bell" });
  };

  const searchUsers = (queryStr: string) => {
    if (!queryStr) return [];
    return users.filter(u => fuzzyMatch(queryStr, u.username) && u.id !== user?.id);
  };

  const startCall = async (receiverId: string, isVideo = false) => {
    if (!user) return;
    const newCall = {
      callerId: user.id,
      receiverId,
      status: 'ringing',
      type: isVideo ? 'video' : 'audio',
      timestamp: Date.now()
    };
    await setDoc(doc(db, "calls", user.id), newCall); // using callerId as docId for simplicity
  };

  const answerCall = async (callId: string) => {
    await updateDoc(doc(db, "calls", callId), { status: 'accepted' });
  };

  const endCall = async (callId: string) => {
    await updateDoc(doc(db, "calls", callId), { status: 'ended' });
  };

  const searchGroups = (queryStr: string) => {
    if (!queryStr) return [];
    return groups.filter(g => fuzzyMatch(queryStr, g.name) && !g.members.includes(user?.id || ''));
  };

  const requestJoinGroup = async (groupId: string) => {
    if (!user) return;
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      joinRequests: arrayUnion(user.id)
    });
    toast({ title: "Request Sent", message: "Wait for admin to approve.", icon: "bell" });
  };

  const approveJoinRequest = async (groupId: string, userId: string) => {
    if (!user) return;
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      joinRequests: arrayRemove(userId),
      members: arrayUnion(userId)
    });
    
    // update messages document participants if it exists
    const msgRef = doc(db, "messages", groupId);
    const msgDoc = await getDoc(msgRef);
    if (msgDoc.exists()) {
      await updateDoc(msgRef, {
        participants: arrayUnion(userId)
      });
    }
  };

  return (
    <AppContext.Provider value={{
      user, users, reels, videos, userPosts, friends, groups, messages, stories, accountsCount, hasSeenDemo,
      login, logout, likePost, createPost, firebaseUser, profileSetupRequired, sendMessage, updateUser, addFriend, acceptFriendRequest, rejectFriendRequest, removeFriend, deleteAccount, resetOldAccount, completeTutorial, createGroup, updateGroup, refreshReels, addStory, searchUsers, searchGroups, requestJoinGroup, approveJoinRequest, incomingCall, myActiveCall, answerCall, endCall, startCall, typingStatus, setTyping, completeMission, activeChatId, setActiveChatId, searchQuery, setSearchQuery,
      notifications, sendGlobalNotification, markNotificationRead, removeGroupMember, addGroupMember, sessionTimeSeconds
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
