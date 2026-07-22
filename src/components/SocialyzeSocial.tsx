import React, { useState, useEffect } from "react";
import { Camera, Lock, ShieldCheck, Search, Flame, MapPin, Sparkles, Gift, Edit3, MessageCircle, Send, ChevronLeft, Trophy, Medal, Award, Users, Phone, Video, Mic, MicOff, PhoneOff, Check, X, Settings, UserMinus, Plus, UserPlus, Image as ImageIcon, BarChart2, HelpCircle, Lightbulb, Paperclip } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "../lib/toast";
import { useAppContext } from "../AppContext";
import { SocialyzeCamera } from "./SocialyzeCamera";
import { Logo } from "./Logo";
import { User, GroupChat } from "../data";
import { StoriesBar } from "./StoriesBar";

export function SocialyzeSocial({ onOpenCreatePost }: { onOpenCreatePost?: (friendName?: string) => void }) {
  const { user, users, friends, groups, messages, sendMessage, createGroup, updateGroup, addFriend, removeFriend, searchUsers, searchGroups, requestJoinGroup, incomingCall, myActiveCall, answerCall, endCall, startCall, typingStatus, setTyping, activeChatId, setActiveChatId } = useAppContext();
  const [addedFriend, setAddedFriend] = useState<User | null>(null);
  const { approveJoinRequest, removeGroupMember, addGroupMember, acceptFriendRequest, rejectFriendRequest } = useAppContext();
  const [activeTab, setActiveTab] = useState<"chat" | "camera" | "search">("chat");
  const [leaderboardScope, setLeaderboardScope] = useState<"friends" | "global">("friends");

  const [wishModalFriend, setWishModalFriend] = useState<User | null>(null);
  const [activeChat, setActiveChatState] = useState<User | GroupChat | null>(null);
  useEffect(() => {
    if (activeChatId) {
      const u = users.find(u => u.id === activeChatId);
      const g = groups.find(g => g.id === activeChatId);
      if (u) {
        setActiveChatState(u);
        setActiveTab("chat");
      } else if (g) {
        setActiveChatState(g);
        setActiveTab("chat");
      }
    }
  }, [activeChatId, users, groups]);

  const setActiveChat = (chat: User | GroupChat | null) => {
    setActiveChatState(chat);
    if (chat) {
      setActiveChatId(chat.id);
    } else {
      setActiveChatId(null);
    }
    setActiveChatId(chat ? chat.id : null);
  };
  const [messageInput, setMessageInput] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [groupSettingsName, setGroupSettingsName] = useState("");
  const [groupSettingsAvatar, setGroupSettingsAvatar] = useState("");
  const [groupSettingsDescription, setGroupSettingsDescription] = useState("");
  const [groupSettingsTheme, setGroupSettingsTheme] = useState("default");
  const [groupSettingsGame, setGroupSettingsGame] = useState("none");
  const [groupSettingsRulesEnabled, setGroupSettingsRulesEnabled] = useState(false);
  const [groupSettingsRules, setGroupSettingsRules] = useState("");
  const [groupSettingsHideMembers, setGroupSettingsHideMembers] = useState(false);
  const [groupSettingsCategories, setGroupSettingsCategories] = useState<any[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any>(null);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState<Set<string>>(new Set());
  
  const [memberToRemove, setMemberToRemove] = useState<{groupId: string, memberId: string, memberName: string} | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  






    const globalLeaderboard = [...users].sort((a, b) => b.streaks - a.streaks).slice(0, 5);
  const friendsLeaderboard = [...friends, user].filter((u): u is import('../data').User => u !== null).sort((a, b) => b.streaks - a.streaks).slice(0, 5);
  const activeLeaderboard = leaderboardScope === "friends" ? friendsLeaderboard : globalLeaderboard;

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const activeChatRef = React.useRef(activeChat);
  const messageInputRef = React.useRef(messageInput);

  useEffect(() => {
    // Immediate scroll
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    // Backup scroll in case of render delay
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 100);
  }, [messages, activeChat]);

  useEffect(() => {
    activeChatRef.current = activeChat;
    messageInputRef.current = messageInput;
  }, [activeChat, messageInput]);

  useEffect(() => {
    return () => {
      const chat = activeChatRef.current;
      const msg = messageInputRef.current;
      if (chat && msg.length > 0) {
        const isGroup = 'members' in chat;
        setTyping(chat.id, false, isGroup);
      }
    };
  }, []);

  if (addedFriend) {
    return (
      <div className="flex-1 w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-8 border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
            <img src={addedFriend.avatar} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-4">
            You finally added<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{addedFriend.username}</span><br />
            as a friend!
          </h2>
          <p className="text-slate-400 text-center text-lg font-medium">You can now chat and call each other in real time.</p>
        </div>
      );
    }
  const friendsWithBirthdays = friends.filter(f => f.birthDate);


  const handleWishChat = (friendName: string) => {
    const friend = friends.find(f => f.username === friendName);
    if (friend) {
       setActiveChat(friend);
       setMessageInput(`Happy Birthday ${friendName}! 🎉`);
    }
    setWishModalFriend(null);
  };

  const handleWishPost = (friendName: string) => {
    setWishModalFriend(null);
    if (onOpenCreatePost) onOpenCreatePost(friendName);
  };


  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    if (activeChat) {
      const isGroup = 'members' in activeChat;
      setTyping(activeChat.id, isTyping, isGroup);
    }
  }, [isTyping, activeChat?.id]);
  
  useEffect(() => {
    if (activeChat && 'members' in activeChat) {
      const group = activeChat as GroupChat;
      if (group.categories && group.categories.length > 0 && group.categories[0].channels.length > 0) {
        if (!activeChannelId) {
          setActiveChannelId(group.categories[0].channels[0].id);
        }
      }
    } else {
      setActiveChannelId(null);
    }
  }, [activeChat?.id]);

  useEffect(() => {
    if (messageInput.length > 0) {
      setIsTyping(true);
      const timeoutId = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timeoutId);
    } else {
      setIsTyping(false);
    }
  }, [messageInput]);

  const handleSendMessage = () => {
    if (activeChat && messageInput.trim()) {
      const isGroup = 'members' in activeChat;
      sendMessage(activeChat.id, messageInput.trim(), isGroup, isGroup ? (activeChannelId || undefined) : undefined);
      setMessageInput("");
      setTyping(activeChat.id, false, isGroup);
    }
  };

  const openGroupSettings = (group: any) => {
    setGroupSettingsName(group.name);
    setGroupSettingsAvatar(group.avatar);
    setGroupSettingsDescription(group.description || "");
    setGroupSettingsTheme(group.theme || "default");
    setGroupSettingsGame(group.activeGame || "none");
    setGroupSettingsRulesEnabled(group.rulesEnabled || false);
    setGroupSettingsRules(group.rules || "");
    setGroupSettingsHideMembers(group.hideMembers || false);
    setGroupSettingsCategories(group.categories || []);
    setShowGroupSettings(true);
  };
  
  const handleCreateGroup = () => {
    if (newGroupName.trim() && selectedFriendsForGroup.size > 0) {
      createGroup(newGroupName.trim(), Array.from(selectedFriendsForGroup));
      setIsCreatingGroup(false);
      setNewGroupName("");
      setSelectedFriendsForGroup(new Set());
    }
  };



  if (showGroupSettings && activeChat && 'members' in activeChat) {
    const group = activeChat as any;
    const groupMembers = users.filter(u => group.members.includes(u.id));
    const nonMembers = friends.filter(f => !group.members.includes(f.id));
    const isAdmin = group.adminId === user?.id;

    if (selectedMemberProfile) {
      const isFriend = friends.some(f => f.id === selectedMemberProfile.id);
      const hasRequested = selectedMemberProfile.friendRequests?.includes(user?.id);
      const isSelf = selectedMemberProfile.id === user?.id;
      return (
        <div className="flex-1 w-full h-full bg-slate-950 flex flex-col pt-0">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center">
            <button onClick={() => setSelectedMemberProfile(null)} className="text-slate-400 hover:text-white mr-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black tracking-tighter uppercase">Profile Info</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
            <img src={selectedMemberProfile.avatar} className="w-32 h-32 rounded-full border-4 border-slate-800 mb-4" />
            <h2 className="text-2xl font-bold text-white">{selectedMemberProfile.username}</h2>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-white">{selectedMemberProfile.streaks || 0}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Streaks</span>
              </div>
            </div>
            {!isFriend && !isSelf && (
              hasRequested ? (
                <div className="mt-8 px-6 py-3 bg-slate-800 rounded-full text-slate-400 font-bold w-full text-center">
                  Request Sent
                </div>
              ) : (
              <button 
                onClick={() => {
                  // Assuming requestJoinGroup or addFriend logic
                  addFriend(selectedMemberProfile.id);
                  // We just show toast or optimistically update, addFriend already does toast
                }}
                className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white font-bold transition-colors w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Friend
              </button>
            ))}
            {isFriend && !isSelf && (
              <div className="mt-8 px-6 py-3 bg-slate-800 rounded-full text-slate-400 font-bold w-full text-center">
                Already Friends
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 w-full h-full bg-slate-950 flex flex-col pt-0">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowGroupSettings(false)} className="text-slate-400 hover:text-white mr-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black tracking-tighter uppercase">{isAdmin ? 'Group Settings' : 'Group Info'}</h1>
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                const nameChanged = groupSettingsName.trim() && groupSettingsName !== group.name;
                const avatarChanged = groupSettingsAvatar !== group.avatar;
                const descChanged = groupSettingsDescription !== (group.description || "");
                const themeChanged = groupSettingsTheme !== (group.theme || "default");
                const gameChanged = groupSettingsGame !== (group.activeGame || "none");
                
                const rulesEnChanged = groupSettingsRulesEnabled !== (group.rulesEnabled || false);
                const rulesChanged = groupSettingsRules !== (group.rules || "");
                const hideMembersChanged = groupSettingsHideMembers !== (group.hideMembers || false);
                // Also categories if they changed, we can just save them always if admin clicked save
                
                updateGroup(group.id, { 
                  name: groupSettingsName.trim() || group.name, 
                  avatar: groupSettingsAvatar || group.avatar,
                  description: groupSettingsDescription,
                  theme: groupSettingsTheme,
                  activeGame: groupSettingsGame,
                  rulesEnabled: groupSettingsRulesEnabled,
                  rules: groupSettingsRules,
                  hideMembers: groupSettingsHideMembers,
                  categories: groupSettingsCategories
                });
                setShowGroupSettings(false);
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-white text-xs font-bold transition-colors"
            >
              Save
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <button 
            onClick={() => setShowGroupSettings(false)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Enter Chat
          </button>
          {isAdmin ? (
            <div className="flex flex-col gap-8 pb-20 px-2 sm:px-4">
              
              {/* Ultra Modern Header Section */}
              <div className="relative group rounded-[3rem] p-1 bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-500 overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.2)] hover:shadow-[0_0_80px_rgba(217,70,239,0.3)] transition-all duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className="relative bg-slate-950 rounded-[2.8rem] p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-center overflow-hidden">
                  
                  {/* Avatar Picker */}
                  <div 
                    className="relative cursor-pointer shrink-0 group/avatar z-10"
                    onClick={() => {
                      const newSeed = Math.random().toString(36).substring(7);
                      setGroupSettingsAvatar(`https://api.dicebear.com/7.x/shapes/svg?seed=${newSeed}`);
                    }}
                  >
                    
                    <img src={groupSettingsAvatar || group.avatar} className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] bg-slate-900 border-2 border-white/10 object-cover shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105 group-hover/avatar:rotate-3" />
                    <div className="absolute inset-0 bg-black/50 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 backdrop-blur-sm z-20 scale-95 group-hover/avatar:scale-100">
                      <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-1 space-y-5 w-full z-10 relative">
                    
                    <div>
                      <input 
                        value={groupSettingsName}
                        onChange={(e) => setGroupSettingsName(e.target.value)}
                        placeholder="Group Name"
                        className="w-full bg-transparent border-none px-0 py-2 text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 outline-none focus:from-indigo-300 focus:to-fuchsia-300 transition-all placeholder:text-slate-700 uppercase tracking-tighter"
                      />
                      <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                        
                      </div>
                    </div>
                    <div>
                      <textarea 
                        value={groupSettingsDescription}
                        onChange={(e) => setGroupSettingsDescription(e.target.value)}
                        placeholder="What's the vibe of this community?"
                        className="w-full bg-white/5 border border-white/10 rounded-3xl px-5 py-4 text-base text-slate-300 outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all min-h-[100px] resize-none backdrop-blur-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Config Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Visuals & Games */}
                <div className="bg-slate-900 border border-slate-800/50 p-8 rounded-[3rem] relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                  
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400"><Flame className="w-6 h-6" /></div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Environment</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Atmosphere Theme</label>
                      <select 
                        value={groupSettingsTheme}
                        onChange={(e) => setGroupSettingsTheme(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer appearance-none"
                      >
                        <option value="default">Midnight Default</option>
                        <option value="cyberpunk">Cyberpunk Neon</option>
                        <option value="neon">Fuchsia Dream</option>
                        <option value="vintage">Vintage Analog</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Active Activity</label>
                      <select 
                        value={groupSettingsGame}
                        onChange={(e) => setGroupSettingsGame(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer appearance-none"
                      >
                        <option value="none">Chill Lounge</option>
                        <option value="soccer">Super Soccer</option>
                        <option value="basketball">Hoops 3D</option>
                        <option value="cricket">Cricket Clash</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security Matrix */}
                <div className="bg-slate-900 border border-slate-800/50 p-8 rounded-[3rem] relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><ShieldCheck className="w-6 h-6" /></div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Security Matrix</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-950 rounded-3xl border border-slate-800/50 hover:border-emerald-500/30 transition-colors">
                      <div>
                        <div className="font-black text-white text-base mb-1">Rules Gate</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter New Members</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={groupSettingsRulesEnabled} onChange={(e) => setGroupSettingsRulesEnabled(e.target.checked)} />
                        <div className="w-16 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-950 rounded-3xl border border-slate-800/50 hover:border-rose-500/30 transition-colors">
                      <div>
                        <div className="font-black text-white text-base mb-1">Ghost Mode</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hide Member List</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={groupSettingsHideMembers} onChange={(e) => setGroupSettingsHideMembers(e.target.checked)} />
                        <div className="w-16 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules Textarea (Animated Entry) */}
              {groupSettingsRulesEnabled && (
                <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-[3rem] shadow-[0_0_50px_rgba(16,185,129,0.05)] animate-in fade-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><Lock className="w-6 h-6" /></div>
                    <h2 className="text-sm font-black text-emerald-400 uppercase tracking-widest">Community Code</h2>
                  </div>
                  <textarea 
                    value={groupSettingsRules}
                    onChange={(e) => setGroupSettingsRules(e.target.value)}
                    placeholder="1. Good vibes only..."
                    className="w-full bg-slate-950 border border-emerald-500/20 rounded-3xl px-6 py-5 text-sm text-slate-300 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all min-h-[140px] font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* Channels Architecture */}
              <div className="bg-slate-900 border border-slate-800/50 p-8 rounded-[3rem]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400"><Users className="w-6 h-6" /></div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Architecture</h2>
                  </div>
                  <button onClick={() => {
                    setGroupSettingsCategories([...groupSettingsCategories, {
                      id: `cat_${Date.now()}`,
                      name: "NEW CATEGORY",
                      channels: []
                    }]);
                  }} className="text-xs font-black bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                    <Plus className="w-5 h-5"/> BUILD CATEGORY
                  </button>
                </div>
                
                <div className="space-y-8">
                  {groupSettingsCategories.map((cat, catIdx) => (
                    <div key={cat.id} className="bg-slate-950 border border-slate-800/80 rounded-[2.5rem] overflow-hidden group/cat transition-all duration-300 hover:border-slate-700">
                      <div className="bg-slate-900/40 p-5 px-6 flex items-center justify-between border-b border-slate-800/80 group-focus-within/cat:border-cyan-500/30 transition-colors">
                        <input
                          value={cat.name}
                          onChange={(e) => {
                            const newCats = [...groupSettingsCategories];
                            newCats[catIdx].name = e.target.value;
                            setGroupSettingsCategories(newCats);
                          }}
                          className="bg-transparent text-white font-black text-lg outline-none w-full border-b-2 border-transparent focus:border-cyan-500 transition-colors uppercase tracking-widest placeholder:text-slate-600"
                          placeholder="CATEGORY NAME"
                        />
                        <button onClick={() => {
                           const newCats = [...groupSettingsCategories];
                           newCats.splice(catIdx, 1);
                           setGroupSettingsCategories(newCats);
                        }} className="text-slate-500 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-500/10 transition-colors"><X className="w-5 h-5"/></button>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        {cat.channels.map((chan, chanIdx) => (
                           <div key={chan.id} className="flex flex-col xl:flex-row xl:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/50 group/chan hover:border-slate-700 hover:shadow-lg hover:shadow-black/20 transition-all">
                             <div className="flex items-center gap-4 flex-1">
                               <div className={`p-3 rounded-2xl transition-colors ${chan.type === 'voice' ? 'bg-emerald-500/10 text-emerald-400 group-hover/chan:bg-emerald-500/20' : 'bg-slate-800/80 text-slate-400 group-hover/chan:text-cyan-400 group-hover/chan:bg-cyan-500/10'}`}>
                                 {chan.type === 'voice' ? <Mic className="w-5 h-5"/> : <MessageCircle className="w-5 h-5"/>}
                               </div>
                               <input
                                  value={chan.name}
                                  onChange={(e) => {
                                    const newCats = [...groupSettingsCategories];
                                    newCats[catIdx].channels[chanIdx].name = e.target.value;
                                    setGroupSettingsCategories(newCats);
                                  }}
                                  className="bg-transparent text-white font-bold text-base outline-none w-full placeholder:text-slate-600 focus:text-cyan-400 transition-colors"
                                  placeholder="channel-name"
                               />
                             </div>
                             
                             <div className="flex items-center justify-between xl:justify-end gap-6 pl-16 xl:pl-0 border-t border-slate-800/50 xl:border-0 pt-4 xl:pt-0 mt-2 xl:mt-0">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer hover:text-white transition-colors">
                                  <input type="checkbox" checked={chan.isPrivate} onChange={(e) => {
                                    const newCats = [...groupSettingsCategories];
                                    newCats[catIdx].channels[chanIdx].isPrivate = e.target.checked;
                                    setGroupSettingsCategories(newCats);
                                  }} className="w-5 h-5 rounded-lg bg-slate-800 border-slate-700 text-cyan-500 accent-cyan-500"/>
                                  PRIVATE
                                </label>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer hover:text-white transition-colors">
                                  <input type="checkbox" checked={chan.isReadOnly} onChange={(e) => {
                                    const newCats = [...groupSettingsCategories];
                                    newCats[catIdx].channels[chanIdx].isReadOnly = e.target.checked;
                                    setGroupSettingsCategories(newCats);
                                  }} className="w-5 h-5 rounded-lg bg-slate-800 border-slate-700 text-cyan-500 accent-cyan-500"/>
                                  READ-ONLY
                                </label>
                                <button onClick={() => {
                                  const newCats = [...groupSettingsCategories];
                                  newCats[catIdx].channels.splice(chanIdx, 1);
                                  setGroupSettingsCategories(newCats);
                                }} className="text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 p-2.5 rounded-xl transition-all opacity-100 xl:opacity-0 xl:group-hover/chan:opacity-100">
                                  <X className="w-5 h-5"/>
                                </button>
                             </div>
                           </div>
                        ))}
                        
                        <div className="flex gap-4 pt-4">
                          <button onClick={() => {
                            const newCats = [...groupSettingsCategories];
                            newCats[catIdx].channels.push({
                              id: `chan_${Date.now()}`,
                              name: "new-text-channel",
                              type: "text"
                            });
                            setGroupSettingsCategories(newCats);
                          }} className="flex-1 py-4 rounded-2xl border-2 border-dashed border-slate-800 text-sm font-bold text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-5 h-5"/> TEXT CHANNEL
                          </button>
                          <button onClick={() => {
                            const newCats = [...groupSettingsCategories];
                            newCats[catIdx].channels.push({
                              id: `chan_${Date.now()}`,
                              name: "new-voice-channel",
                              type: "voice"
                            });
                            setGroupSettingsCategories(newCats);
                          }} className="flex-1 py-4 rounded-2xl border-2 border-dashed border-slate-800 text-sm font-bold text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-5 h-5"/> VOICE CHANNEL
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-3xl border border-slate-800 mb-4">
                <img src={group.avatar} className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700" />
                <div className="flex-1">
                  <div className="text-white font-bold text-lg">{group.name}</div>
                </div>
              </div>
              {group.description && (
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 mb-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</div>
                  <p className="text-slate-300 text-sm">{group.description}</p>
                </div>
              )}
            </div>
          )}

          {(!group.hideMembers || isAdmin) && (
          <div>
            <label className="text-xs font-bold text-slate-500 tracking-wider uppercase ml-2 mb-2 block">Members ({groupMembers.length})</label>
            <div className="space-y-2">
              {groupMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="font-bold text-sm text-slate-200 flex items-center gap-2">{m.username} {m.id === group.adminId && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md text-[10px] uppercase font-black tracking-widest">Admin</span>}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: m.id }))}
                      className="text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    >
                      More Info
                    </button>
                    {isAdmin && m.id !== group.adminId && (
                      <button 
                        onClick={() => {
                          setMemberToRemove({ groupId: group.id, memberId: m.id, memberName: m.username });
                          setRemoveReason("");
                        }}
                        className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {isAdmin && nonMembers.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-500 tracking-wider uppercase ml-2 mb-2 block">Add Friends</label>
              <div className="space-y-2">
                {nonMembers.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-2xl border border-slate-800 border-dashed">
                    <div className="flex items-center gap-3">
                      <img src={f.avatar} className="w-10 h-10 rounded-full opacity-70" />
                      <div className="font-bold text-sm text-slate-400">{f.username}</div>
                    </div>
                    <button 
                      onClick={() => addGroupMember(group.id, f.id)}
                      className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {memberToRemove && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-white font-bold text-lg mb-2">Remove {memberToRemove.memberName}</h3>
                <p className="text-slate-400 text-sm mb-4">Are you sure you want to remove this member from the group?</p>
                <input 
                  autoFocus
                  placeholder="Reason (optional)"
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none mb-6 focus:border-rose-500"
                />
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setMemberToRemove(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      removeGroupMember(memberToRemove.groupId, memberToRemove.memberId, removeReason || "No reason provided");
                      setMemberToRemove(null);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  

  if (activeChat) {
    const isGroup = 'members' in activeChat;
    const displayName = isGroup ? (activeChat as GroupChat).name : (activeChat as User).username;
    let chatMessages = messages[activeChat.id] || [];
    if (isGroup && activeChannelId) {
      chatMessages = chatMessages.filter((m: any) => m.channelId === activeChannelId || (!m.channelId && activeChannelId === 'chan_general'));
    }
    const isAdmin = isGroup && (activeChat as GroupChat).adminId === user?.id;
    const pendingRequests = isGroup ? ((activeChat as GroupChat).joinRequests || []) : [];

    let chatBg = "bg-slate-950";
    let bubbleColor = "bg-blue-600";
    let otherBubbleColor = "bg-slate-800 text-slate-200";
    
    if (isGroup) {
      const group = activeChat as GroupChat;
      if (group.rulesEnabled && !group.agreedUsers?.includes(user?.id || "")) {
        return (
          <div className="flex-1 w-full h-full bg-slate-950 flex flex-col pt-0">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
              <button onClick={() => setActiveChat(null)} className="text-slate-400 hover:text-white mr-2">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <img src={group.avatar} className="w-10 h-10 rounded-full" />
                <div className="font-bold text-white">{group.name}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
              <div className="w-full max-w-md bg-slate-900/80 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl relative z-10 text-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-10 h-10 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">Server Rules</h1>
                <p className="text-slate-400 mb-8 text-sm">You must read and agree to the rules before you can enter {group.name}.</p>
                
                <div className="bg-slate-950 p-4 rounded-xl text-left border border-slate-800 h-48 overflow-y-auto mb-8 whitespace-pre-wrap text-sm text-slate-300">
                  {group.rules}
                </div>
                
                <button 
                  onClick={() => {
                     updateGroup(group.id, { agreedUsers: [...(group.agreedUsers || []), user?.id || ""] });
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest uppercase rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                >
                  I Agree to the Rules
                </button>
              </div>
            </div>
          </div>
        );
      }
    }
    
    if (isGroup) {
      const group = activeChat as GroupChat;
      if (group.theme === "cyberpunk") {
        chatBg = "bg-slate-900 border-x-2 border-cyan-500/50";
        bubbleColor = "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]";
        otherBubbleColor = "bg-slate-800 border border-cyan-500/30 text-cyan-50";
      } else if (group.theme === "neon") {
        chatBg = "bg-fuchsia-950/20 border-x-2 border-fuchsia-500/30";
        bubbleColor = "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]";
        otherBubbleColor = "bg-slate-800 border border-fuchsia-500/30 text-fuchsia-50";
      } else if (group.theme === "vintage") {
        chatBg = "bg-[#2a2422]";
        bubbleColor = "bg-orange-700/80 text-orange-50";
        otherBubbleColor = "bg-[#3d332f] border border-[#4d403a] text-orange-100";
      }
    }

    const activeCat = isGroup ? (activeChat as GroupChat).categories?.find(c => c.channels.find(ch => ch.id === activeChannelId)) : null;
    const activeChanObj = activeCat?.channels.find(ch => ch.id === activeChannelId);
    
    return (
      <div className={`flex-1 w-full h-full flex pt-0 ${chatBg}`}>
        {isGroup && (activeChat as GroupChat).categories && (activeChat as GroupChat).categories!.length > 0 && (
          <div className="w-64 border-r border-slate-800/50 bg-slate-900/80 hidden md:flex flex-col flex-shrink-0">
             <div className="p-4 border-b border-slate-800/50 flex items-center gap-3 cursor-pointer select-none group" onDoubleClick={() => openGroupSettings(activeChat)} title="Double click to open Dashboard">
                <img src={(activeChat as GroupChat).avatar} className="w-8 h-8 rounded-full" />
                <div className="font-black text-white truncate">{(activeChat as GroupChat).name}</div>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-4">
                {(activeChat as GroupChat).categories!.map(cat => {
                   const canViewCat = !cat.isPrivate || isAdmin;
                   if (!canViewCat) return null;
                   return (
                     <div key={cat.id}>
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-1">{cat.name}</div>
                       <div className="space-y-0.5">
                         {cat.channels.map(chan => {
                            const canViewChan = !chan.isPrivate || isAdmin;
                            if (!canViewChan) return null;
                            const isActive = activeChannelId === chan.id;
                            return (
                              <div 
                                key={chan.id} 
                                onClick={() => setActiveChannelId(chan.id)}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                              >
                                {chan.type === 'voice' ? <Mic className="w-4 h-4"/> : <MessageCircle className="w-4 h-4"/>}
                                <span className="text-sm font-medium truncate">{chan.name}</span>
                                {chan.isPrivate && <Lock className="w-3 h-3 ml-auto opacity-50"/>}
                              </div>
                            )
                         })}
                       </div>
                     </div>
                   )
                })}
             </div>
          </div>
        )}
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveChat(null)} className="text-slate-400 hover:text-white mr-2">
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              {isGroup ? (
                 <div className="flex flex-col md:hidden">
                    <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors select-none cursor-pointer" onDoubleClick={() => openGroupSettings(activeChat)} title="Double click to open Dashboard">{displayName}</div>
                    <select 
                       value={activeChannelId || ""} 
                       onChange={(e) => setActiveChannelId(e.target.value)}
                       className="bg-transparent text-xs text-slate-400 outline-none w-32"
                    >
                       {(activeChat as GroupChat).categories?.map(cat => (
                          <optgroup key={cat.id} label={cat.name}>
                             {cat.channels.map(chan => (
                                <option key={chan.id} value={chan.id}>{chan.name}</option>
                             ))}
                          </optgroup>
                       ))}
                    </select>
                 </div>
              ) : (
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: activeChat.id }))}
                >
                  <img src={activeChat.avatar} alt={displayName} className="w-10 h-10 rounded-full bg-slate-800 group-hover:opacity-80 transition-opacity" />
                  <div>
                    <div className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{displayName}</div>
                  </div>
                </div>
              )}
              
              {isGroup && <div className="hidden md:flex items-center gap-2">
                 {activeChanObj?.type === 'voice' ? <Mic className="w-5 h-5 text-slate-500"/> : <MessageCircle className="w-5 h-5 text-slate-500"/>}
                 <span className="font-bold text-white">{activeChanObj?.name || 'General'}</span>
                 {activeChanObj?.isReadOnly && <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded uppercase font-bold tracking-widest ml-2">Read Only</span>}
              </div>}
            </div>


          {!isGroup && (
            <button onClick={() => startCall(activeChat.id, false)} className="p-2 bg-indigo-500/10 text-indigo-400 rounded-full hover:bg-indigo-500/20 transition-colors">
              <Phone className="w-5 h-5" />
            </button>
          )}
          {isGroup && isAdmin && (
            <button 
              onClick={() => {
                openGroupSettings(activeChat);
              }} 
              className="p-2 bg-slate-800/50 text-slate-400 rounded-full hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full max-w-4xl mx-auto">
          {isAdmin && pendingRequests.length > 0 && (
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 mb-4">
              <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-3">Pending Join Requests ({pendingRequests.length})</h3>
              <div className="space-y-2">
                {pendingRequests.map(reqId => {
                  const reqUser = users.find(u => u.id === reqId);
                  if (!reqUser) return null;
                  return (
                    <div key={reqId} className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <img src={reqUser.avatar} className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-medium text-white">{reqUser.username}</span>
                      </div>
                      <button onClick={() => approveJoinRequest(activeChat.id, reqId)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {isGroup && (activeChat as GroupChat).activeGame && (activeChat as GroupChat).activeGame !== "none" && (
            <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Group Game Active</h3>
                <p className="text-white text-sm">Join the {(activeChat as GroupChat).activeGame} match!</p>
              </div>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('OPEN_TAB', { detail: 'games' }));
                  setTimeout(() => window.dispatchEvent(new CustomEvent('OPEN_ARCADE', { detail: (activeChat as GroupChat).activeGame })), 100);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-lg shadow-emerald-500/20"
              >
                Play Now
              </button>
            </div>
          )}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-800 text-slate-400 text-xs px-3 py-1 rounded-full font-medium">Today</div>
          </div>
          {chatMessages.map((msg: any, i: number) => {
            const isMe = msg.sender === user?.id;
            const senderUser = users.find(u => u.id === msg.sender);
            const showSenderInfo = !isMe && isGroup;

            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                {showSenderInfo && senderUser && (
                  <img src={senderUser.avatar} alt={senderUser.username} className="w-8 h-8 rounded-full mr-2 self-end mb-1" />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {showSenderInfo && senderUser && (
                    <span className="text-[10px] text-slate-500 font-bold mb-0.5 ml-2">{senderUser.username}</span>
                  )}
                  <div className={`px-4 py-2 rounded-2xl ${isMe ? `${bubbleColor} rounded-br-sm` : `${otherBubbleColor} rounded-bl-sm`}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          {typingStatus[activeChat.id]?.some(id => id !== user?.id) && (
            <div className="flex justify-start mb-2">
              {'members' in activeChat && (
                <span className="text-xs text-slate-500 mr-2 uppercase tracking-widest font-bold self-end mb-1">
                  {users.find(u => u.id === typingStatus[activeChat.id].find(id => id !== user?.id))?.username}
                </span>
              )}
              <div className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-400 rounded-bl-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {(!isGroup || !activeChanObj?.isReadOnly || isAdmin) ? (
          <div className="p-4 bg-slate-900 border-t border-slate-800 relative z-20">
            <div className="w-full max-w-4xl mx-auto">
            {showAttachmentMenu && isGroup && (
              <div className="absolute bottom-[calc(100%+8px)] left-4 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-2 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 z-50">
                <button onClick={() => { setShowAttachmentMenu(false); toast({title:"Media", message:"Gallery & Camera coming soon", icon:"bell"}) }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 rounded-2xl transition-all text-white text-sm font-bold w-full group">
                  <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all"><ImageIcon className="w-5 h-5"/></div>
                  Media <span className="text-[10px] text-slate-500 ml-auto font-normal whitespace-nowrap">Gallery, Cam & Snap</span>
                </button>
                <button onClick={() => { setShowAttachmentMenu(false); toast({title:"Poll", message:"Poll coming soon", icon:"bell"}) }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 rounded-2xl transition-all text-white text-sm font-bold w-full group">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all"><BarChart2 className="w-5 h-5"/></div>
                  Poll
                </button>
                <button onClick={() => { setShowAttachmentMenu(false); toast({title:"Quiz", message:"Quiz coming soon", icon:"bell"}) }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 rounded-2xl transition-all text-white text-sm font-bold w-full group">
                  <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all"><HelpCircle className="w-5 h-5"/></div>
                  Quiz
                </button>
                <button onClick={() => { setShowAttachmentMenu(false); toast({title:"Question", message:"Question coming soon", icon:"bell"}) }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 rounded-2xl transition-all text-white text-sm font-bold w-full group">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all"><Lightbulb className="w-5 h-5"/></div>
                  Question
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2 relative z-10">
              {isGroup && (
                <button 
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className={`p-3 rounded-full transition-all shrink-0 ${showAttachmentMenu ? 'bg-indigo-500 text-white rotate-45 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  <Plus className="w-5 h-5 transition-transform" />
                </button>
              )}
              
              <input 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-full px-5 py-3 text-white outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all placeholder:text-slate-500 text-sm"
              />
              <button onClick={handleSendMessage} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-all shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95">
                <Send className="w-5 h-5" />
              </button>
            </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-center">
            <div className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-4 h-4"/> Read Only Channel
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  if (isCreatingGroup) {
    return (
      <div className="flex-1 w-full h-full bg-slate-950 flex flex-col pt-0">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setIsCreatingGroup(false); setNewGroupName(""); setSelectedFriendsForGroup(new Set()); }} className="text-slate-400 hover:text-white mr-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black tracking-tighter">CREATE GROUP</h1>
          </div>
          <button 
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim() || selectedFriendsForGroup.size === 0}
            className="px-4 py-1.5 bg-blue-600 disabled:opacity-50 hover:bg-blue-500 rounded-full text-white text-xs font-bold transition-colors"
          >
            Create
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 tracking-wider uppercase ml-2 mb-2 block">Group Name</label>
            <input 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="E.g. The Squad"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 tracking-wider uppercase ml-2 mb-2 block">Select Members ({selectedFriendsForGroup.size}/25)</label>
            <div className="space-y-2">
              {friends.map(friend => {
                const isSelected = selectedFriendsForGroup.has(friend.id);
                return (
                  <div 
                    key={friend.id} 
                    onClick={() => {
                      const next = new Set(selectedFriendsForGroup);
                      if (isSelected) next.delete(friend.id);
                      else {
                        if (next.size >= 24) return; // 24 + 1 admin = 25
                        next.add(friend.id);
                      }
                      setSelectedFriendsForGroup(next);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-600'}`}>
                      {isSelected && <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <img src={friend.avatar} alt={friend.username} className="w-10 h-10 rounded-full border border-slate-700" />
                    <span className="font-bold text-slate-200">{friend.username}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "camera") {
    return (
      <SocialyzeCamera 
        onClose={() => setActiveTab("chat")} 
        onSendToFriend={(friendId, text) => {
          sendMessage(friendId, text);
          setActiveTab("chat");
        }} 
      />
    );
  }

  if (activeTab === "search") {
    const searchResults = [...searchUsers(searchQuery), ...searchGroups(searchQuery)];
    return (
      <div className="flex-1 w-full h-full bg-slate-950 flex flex-col pt-0">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center gap-3">
          <button onClick={() => { setActiveTab("chat"); setSearchQuery(""); }} className="text-slate-400 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <input 
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {searchQuery && searchResults.length === 0 && (
            <div className="text-center text-slate-500 mt-10">No users found</div>
          )}
          {searchResults.map(item => {
            const isGroup = 'members' in item;
            if (isGroup) {
              const group = item as GroupChat;
              const hasRequested = group.joinRequests?.includes(user?.id || '');
              return (
                <div 
                  key={group.id} 
                  className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800 cursor-pointer hover:bg-slate-800/80 transition-colors"
                  onClick={() => setActiveChat(group)}
                >
                  <div className="flex items-center gap-3">
                    <img src={group.avatar} alt={group.name} className="w-12 h-12 rounded-full border border-slate-700" />
                    <div className="font-bold text-slate-200">{group.name}</div>
                  </div>
                  <div className="flex gap-2">
                    {hasRequested ? (
                      <div className="px-4 py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-full">
                        Requested
                      </div>
                    ) : (
                      <button onClick={() => requestJoinGroup(group.id)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full transition-colors">
                        Join Group
                      </button>
                    )}
                  </div>
                </div>
              );
            }
            const u = item as User;
            const isFriend = friends.some(f => f.id === u.id);
            const hasRequested = u.friendRequests?.includes(user?.id || '');
            return (
              <div key={u.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.username} className="w-12 h-12 rounded-full border border-slate-700 cursor-pointer hover:scale-105 transition-transform" onClick={() => window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: u.id }))} />
                  <div className="font-bold text-slate-200 cursor-pointer hover:underline" onClick={() => window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: u.id }))}>{u.username}</div>
                </div>
                <div className="flex gap-2">
                  {!isFriend ? hasRequested ? (
                    <button className="px-4 py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-full transition-colors border border-slate-700" disabled>
                      Requested
                    </button>
                  ) : (
                    <button onClick={() => {
                      addFriend(u.id);
                      setAddedFriend(u);
                      setTimeout(() => {
                        setAddedFriend(null);
                      }, 2500);
                    }} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full transition-colors">
                      Add Friend
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setActiveTab("chat"); setActiveChat(u); }} className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-full transition-colors">
                        Chat
                      </button>
                      <button onClick={() => removeFriend(u.id)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-full transition-colors border border-slate-700">
                        Unfriend
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-50">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/50 backdrop-blur-md z-20">
        <div onClick={() => setActiveTab("search")} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer border border-slate-700 hover:bg-slate-700 transition">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <h1 className="text-xl font-black tracking-tighter hidden md:block">CHAT</h1>
        </div>
        <div 
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center cursor-pointer shadow-lg shadow-purple-500/20"
          onClick={() => setActiveTab("camera")}
        >
          <Camera className="w-5 h-5 text-white" />
        </div>
      </div>

      <StoriesBar />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Pending Requests Section */}
          {user?.friendRequests && user.friendRequests.length > 0 && (
            <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 mb-8 shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest">Friend Requests</h3>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                {user.friendRequests.map(reqId => {
                  const reqUser = users.find(u => u.id === reqId);
                  if (!reqUser) return null;
                  return (
                    <div key={reqId} className="flex items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-700/50">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: reqId }))}>
                        <img src={reqUser.avatar} alt={reqUser.username} className="w-10 h-10 rounded-full border border-slate-700" />
                        <div>
                          <div className="font-bold text-sm text-slate-200">{reqUser.username}</div>
                          <div className="text-xs text-indigo-400 font-medium">Wants to be friends</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => acceptFriendRequest(reqId)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors uppercase tracking-widest"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => rejectFriendRequest(reqId)}
                          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors uppercase tracking-widest"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Birthdays Section */}
          {friendsWithBirthdays.length > 0 && (
            <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 mb-8 shadow-lg relative overflow-hidden group">
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-500/10 rounded-xl text-pink-500">
                    <Gift className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest">Upcoming Birthdays</h3>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                {friendsWithBirthdays.map(f => (
                  <div key={f.id} className="flex items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <img src={f.avatar} alt={f.username} className="w-10 h-10 rounded-full border border-slate-700" />
                      <div>
                        <div className="font-bold text-sm text-slate-200">{f.username}</div>
                        <div className="text-xs text-pink-400 font-medium">Turning 27 today! 🎉</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setWishModalFriend(f)}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-pink-500/20 transition-all uppercase tracking-widest"
                    >
                      Wish
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4 ml-2">
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setShowOnlineOnly(false)} 
                className={`text-xs font-bold tracking-wider uppercase transition-colors ${!showOnlineOnly ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                All Friends
              </button>
              <button 
                onClick={() => setShowOnlineOnly(true)} 
                className={`text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 ${showOnlineOnly ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <span className={`w-2 h-2 rounded-full ${showOnlineOnly ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`} />
                Online
              </button>
            </div>
            <button onClick={() => setIsCreatingGroup(true)} className="text-xs font-bold text-blue-400 uppercase">Create Group</button>
          </div>
          

          {groups.filter(g => g.members.includes(user?.id || '')).length === 0 && friends.filter(f => !showOnlineOnly || f.isOnline).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                <Users className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-300 font-bold mb-1">No friends found</p>
              <p className="text-slate-500 text-sm">Use the search bar above to find users</p>
            </div>
          )}

          {groups.filter(g => g.members.includes(user?.id || '')).map((group) => (
          <div 
            key={group.id} 
            onClick={() => setActiveChat(group)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={group.avatar} alt={group.name} className="w-14 h-14 rounded-full border border-slate-800" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-100">{group.name}</span>
                <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
                  {typingStatus[group.id]?.some(id => id !== user?.id) ? (
                    <span className="text-pink-400 font-bold flex items-center">
                      Someone is typing
                      <span className="flex gap-0.5 ml-1.5 h-full items-center">
                        <span className="w-1 h-1 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                        <span className="w-1 h-1 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                        <span className="w-1 h-1 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
                      </span>
                    </span>
                  ) : (
                    `Group • ${group.members.length} members`
                  )}
                </span>
              </div>
            </div>
          </div>
          ))}

          {friends.filter(f => !showOnlineOnly || f.isOnline).map((friend) => (
          <div 
            key={friend.id} 
            onClick={() => setActiveChat(friend)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={friend.avatar} alt={friend.username} className="w-14 h-14 rounded-full border border-slate-800 hover:scale-105 transition-transform" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: friend.id })); }} />
                {friend.isOnline && (
                  <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                )}
                {friend.streaks > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-800 flex items-center justify-center shadow-md">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-100 hover:underline" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: friend.id })); }}>{friend.username}</span>
                {typingStatus[friend.id]?.some(id => id !== user?.id) ? (
                  <span className="text-sm text-pink-400 font-bold flex items-center mt-0.5">
                    Typing
                    <span className="flex gap-0.5 ml-1.5 h-full items-center">
                      <span className="w-1 h-1 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                      <span className="w-1 h-1 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                      <span className="w-1 h-1 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
                    </span>
                  </span>
                ) : (
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full justify-self-center bg-purple-500 inline-block mr-1" />
                    New Snap • 2m
                  </span>
                )}
              </div>
            </div>
            
            {friend.streaks > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="font-bold text-xs text-slate-300">{friend.streaks}</span>
                <Flame className="w-4 h-4 text-orange-500 drop-shadow-md" />
              </div>
            )}
          </div>
        ))}
          {/* Streak Leaderboard Section */}
          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 mb-8 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                  <Trophy className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm uppercase tracking-widest">Streak Leaderboard</h3>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setLeaderboardScope('friends')}
                  className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg font-bold transition-colors ${leaderboardScope === 'friends' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Friends
                </button>
                <button
                  onClick={() => setLeaderboardScope('global')}
                  className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg font-bold transition-colors ${leaderboardScope === 'global' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Global
                </button>
              </div>
            </div>
            
            <div className="space-y-2 relative z-10">
              {activeLeaderboard.map((u, idx) => (
                <div key={`${leaderboardScope}-${u.id}`} className="flex items-center justify-between bg-slate-950/50 p-2.5 rounded-2xl border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-black ${idx === 0 ? 'text-yellow-400 text-lg drop-shadow-md' : idx === 1 ? 'text-slate-300 text-base drop-shadow-sm' : idx === 2 ? 'text-amber-600 text-base drop-shadow-sm' : 'text-slate-500 text-sm'}`}>
                      #{idx + 1}
                    </span>
                    <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-full border border-slate-700" />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">{u.username} {u.id === user?.id ? ' (You)' : ''}</span>
                      {u.streaks >= 100 && (
                        <span title="100-day Streak!" className="flex items-center gap-0.5 text-[10px] font-black bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-md border border-red-500/20">
                          <Award className="w-3 h-3" /> 100
                        </span>
                      )}
                      {u.streaks >= 50 && u.streaks < 100 && (
                        <span title="50-day Streak!" className="flex items-center gap-0.5 text-[10px] font-black bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                          <Medal className="w-3 h-3" /> 50
                        </span>
                      )}
                      {u.streaks >= 30 && u.streaks < 50 && (
                        <span title="30-day Streak!" className="flex items-center gap-0.5 text-[10px] font-black bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-md border border-blue-500/20">
                          <Trophy className="w-3 h-3" /> 30
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20 shrink-0">
                    <span className="font-black text-sm text-orange-400">{u.streaks}</span>
                    <Flame className="w-3.5 h-3.5 text-orange-500 drop-shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
      
      {/* Wish Modal */}
      {wishModalFriend && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setWishModalFriend(null)}>
          <div 
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl p-6 relative animation-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-4 p-1">
                <img src={wishModalFriend.avatar} alt={wishModalFriend.username} className="w-full h-full rounded-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Wish {wishModalFriend.username}</h3>
              <p className="text-sm text-pink-400 font-medium">It's their birthday today! 🎉</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleWishPost(wishModalFriend.username)}
                className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 text-pink-500 rounded-xl group-hover:scale-110 transition-transform">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase tracking-widest">Create a Post</div>
                    <div className="text-xs text-slate-400 font-medium">Share on your feed & tag them</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => handleWishChat(wishModalFriend.username)}
                className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white uppercase tracking-widest">Message in Chat</div>
                    <div className="text-xs text-slate-400 font-medium">Send a direct message</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
