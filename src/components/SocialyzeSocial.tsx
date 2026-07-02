import React, { useState, useEffect } from "react";
import { Camera, Search, Flame, MapPin, Sparkles, Gift, Edit3, MessageCircle, Send, ChevronLeft, Trophy, Medal, Award, Users } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "../lib/toast";
import { useAppContext, GroupChat } from "../AppContext";
import { SocialyzeCamera } from "./SocialyzeCamera";
import { Logo } from "./Logo";
import { User } from "../data";

export function SocialyzeSocial({ onOpenCreatePost }: { onOpenCreatePost?: (friendName?: string) => void }) {
  const { user, users, friends, groups, messages, sendMessage, createGroup, addFriend } = useAppContext();
  const [activeTab, setActiveTab] = useState<"chat" | "camera" | "search">("chat");
  const [leaderboardScope, setLeaderboardScope] = useState<"friends" | "global">("friends");
  const [typingFriends, setTypingFriends] = useState<Set<string | number>>(new Set([friends[0]?.id]));
  const [wishModalFriend, setWishModalFriend] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<User | GroupChat | null>(null);
  const [messageInput, setMessageInput] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFriendsForGroup, setSelectedFriendsForGroup] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingFriends(prev => {
        const next = new Set(prev);
        const randomId = friends[Math.floor(Math.random() * friends.length)]?.id;
        if (randomId) {
          if (next.has(randomId)) {
            next.delete(randomId);
          } else {
            next.add(randomId);
          }
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [friends]);

  const friendsWithBirthdays = friends.filter(f => f.birthDate);

  const globalLeaderboard = [...users].sort((a, b) => b.streaks - a.streaks).slice(0, 5);
  const friendsLeaderboard = [...friends, user].filter((u): u is import('../data').User => u !== null).sort((a, b) => b.streaks - a.streaks).slice(0, 5);
  const activeLeaderboard = leaderboardScope === "friends" ? friendsLeaderboard : globalLeaderboard;

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

  const handleSendMessage = () => {
    if (activeChat && messageInput.trim()) {
      // Check if it's a group
      const isGroup = 'members' in activeChat;
      sendMessage(activeChat.id, messageInput.trim(), isGroup);
      setMessageInput("");
    }
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() && selectedFriendsForGroup.size > 0) {
      createGroup(newGroupName.trim(), Array.from(selectedFriendsForGroup));
      setIsCreatingGroup(false);
      setNewGroupName("");
      setSelectedFriendsForGroup(new Set());
    }
  };

  if (activeChat) {
    const isGroup = 'members' in activeChat;
    const displayName = isGroup ? (activeChat as GroupChat).name : (activeChat as User).username;
    const chatMessages = messages[activeChat.id] || [];
    return (
      <div className="h-full bg-slate-950 flex flex-col pt-12 md:pt-0">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveChat(null)} className="text-slate-400 hover:text-white mr-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <img src={activeChat.avatar} alt={displayName} className="w-10 h-10 rounded-full bg-slate-800" />
            <div>
              <div className="font-bold text-white text-sm">{displayName}</div>
              {isGroup && <div className="text-xs text-slate-400">{((activeChat as GroupChat).members || []).length} members</div>}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-800 text-slate-400 text-xs px-3 py-1 rounded-full font-medium">Today</div>
          </div>
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-[75%] ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {!isGroup && typingFriends.has(activeChat.id) && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-400 rounded-bl-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-900 border-t border-slate-800 pb-safe">
          <div className="flex items-center gap-2">
            <input 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
            />
            <button onClick={handleSendMessage} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCreatingGroup) {
    return (
      <div className="h-full bg-slate-950 flex flex-col pt-12 md:pt-0">
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
            <label className="text-xs font-bold text-slate-500 tracking-wider uppercase ml-2 mb-2 block">Select Members ({selectedFriendsForGroup.size})</label>
            <div className="space-y-2">
              {friends.map(friend => {
                const isSelected = selectedFriendsForGroup.has(friend.id);
                return (
                  <div 
                    key={friend.id} 
                    onClick={() => {
                      const next = new Set(selectedFriendsForGroup);
                      if (isSelected) next.delete(friend.id);
                      else next.add(friend.id);
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
    const searchResults = users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== user?.id);
    return (
      <div className="h-full bg-slate-950 flex flex-col pt-12 md:pt-0">
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
          {searchResults.map(u => {
            const isFriend = friends.some(f => f.id === u.id);
            return (
              <div key={u.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.username} className="w-12 h-12 rounded-full border border-slate-700" />
                  <div className="font-bold text-slate-200">{u.username}</div>
                </div>
                <div className="flex gap-2">
                  {!isFriend ? (
                    <button onClick={() => addFriend(u.id)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full transition-colors">
                      Add Friend
                    </button>
                  ) : (
                    <button onClick={() => { setActiveTab("chat"); setActiveChat(u); }} className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-full transition-colors">
                      Chat
                    </button>
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

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Birthdays Section */}
          {friendsWithBirthdays.length > 0 && (
            <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 mb-8 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-pink-500/20 blur-3xl group-hover:bg-pink-500/30 transition-colors"></div>
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

          <div className="flex items-center justify-between mb-4 ml-2">
            <div className="text-xs font-bold text-slate-500 tracking-wider uppercase">Recent Chats</div>
            <button onClick={() => setIsCreatingGroup(true)} className="text-xs font-bold text-blue-400 uppercase">Create Group</button>
          </div>
          
          {groups.map((group) => (
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
                  Group • {group.members.length} members
                </span>
              </div>
            </div>
          </div>
          ))}

          {friends.map((friend) => (
          <div 
            key={friend.id} 
            onClick={() => setActiveChat(friend)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={friend.avatar} alt={friend.username} className="w-14 h-14 rounded-full border border-slate-800" />
                {friend.streaks > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-800 flex items-center justify-center shadow-md">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-100">{friend.username}</span>
                {typingFriends.has(friend.id) ? (
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
