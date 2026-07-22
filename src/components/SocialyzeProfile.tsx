
import React, { useState } from "react";
import { Settings, ChevronRight, Grid3x3, LayoutList, Flame, Moon, Sun, Camera, Play, Heart, Edit3, X, Save, AlertTriangle, Trophy, Users } from "lucide-react";
import { useTheme } from "../lib/theme";
import { useAppContext } from "../AppContext";
import { Logo } from "./Logo";
import { DailyMissions } from "./DailyMissions";
import { Target, Gift, Clock } from "lucide-react";

export function SocialyzeProfile({ profileId, onLogout, onNavigateToPost }: { profileId?: string | null, onLogout: () => void, onNavigateToPost?: (type: string) => void }) {
  const { theme, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState<"posts" | "snaps" | "media">("posts");
  
  const { user, users, userPosts, likePost, updateUser, deleteAccount, friends, addFriend, removeFriend, acceptFriendRequest, rejectFriendRequest, sessionTimeSeconds } = useAppContext();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  
  const profileUser = profileId ? (users.find(u => u.id === profileId) || user) : user;
  const [aiBio, setAiBio] = useState<string | null>(null);
  const [generatingBio, setGeneratingBio] = useState(false);

  const generateBio = async () => {
    if (!profileUser) return;
    setGeneratingBio(true);
    try {
      const posts = userPosts.filter(p => p.author.id === profileUser.id).map(p => p.description);
      const res = await fetch("/api/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts, username: profileUser.username })
      });
      const data = await res.json();
      setAiBio(data.bio);
    } catch (e) {
      console.error(e);
      setAiBio("Just a fun person sharing my life vibes! ✨");
    } finally {
      setGeneratingBio(false);
    }
  };

  
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    gender: user?.gender || "",
    birthDate: user?.birthDate || "",
    avatar: user?.avatar || "",
    password: ""
  });

  const handleSaveProfile = () => {
    updateUser({
      username: editForm.username,
      email: editForm.email,
      gender: editForm.gender,
      birthDate: editForm.birthDate,
      avatar: editForm.avatar
    });
    setShowEditModal(false);
  };

  if (!profileUser) return null;

  const isOwnProfile = profileUser.id === user?.id;
  const isFriend = friends.some(f => f.id === profileUser.id);
  const hasRequested = profileUser.friendRequests?.includes(user?.id || "");
  const hasRequestedMe = user?.friendRequests?.includes(profileUser.id);
  
  let followersCount = profileUser.friends?.length || 0;
  let followingCount = profileUser.friends?.length || 0;
  
  if (profileUser.id === user?.id) {
    followersCount = friends.length;
    followingCount = friends.length;
  }
  
  // Calculate mutual friends
  const mutualFriends = isOwnProfile ? [] : friends.filter(f => profileUser.friends?.includes(f.id));
  
  // Filter posts based on category
  const currentUserPosts = userPosts.filter(post => post.author.id === profileUser.id);
  const displayedPosts = currentUserPosts.filter(post => {
    if (activeCategory === "posts") return true; // Show all for posts tab, or maybe just 'post' if we had it, but we have 'reel' | 'video' | 'live'
    if (activeCategory === "snaps") return post.type === "reel";
    if (activeCategory === "media") return post.type === "video" || post.type === "live";
    return true;
  });

  return (
    <div className="flex-1 w-full h-full bg-slate-950 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 flex justify-between items-center sticky top-0 bg-slate-900/50 backdrop-blur-md z-20 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <h1 className="text-xl font-black tracking-tighter uppercase text-white hidden md:block">{profileUser.username}</h1>
        </div>
        {isOwnProfile ? (
          <button onClick={() => setShowEditModal(true)} className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        ) : null}
      </div>

      <div className="p-4 flex flex-col items-center border-b border-slate-800 pb-8 mt-4">
        <div className="relative mb-4">
          
          <img src={profileUser.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-900 bg-slate-800 relative z-10" />
        </div>
        
        <h2 className="text-2xl font-black tracking-tighter text-white mb-1">{profileUser.username}</h2>
        <p className="text-slate-400 text-sm mb-4 font-medium flex flex-col items-center gap-2">
          <span className="text-center">{profileUser.bio || (isOwnProfile ? "The all-in-one social user." : "Social user.")}</span> 
          <span className="text-orange-500 flex items-center gap-0.5">
            <Flame className="w-4 h-4 fill-orange-500"/> {profileUser.streaks || 0}
          </span> streak!
        </p>
        
        {!isOwnProfile && mutualFriends.length > 0 && (
          <div className="text-xs text-slate-500 font-bold mb-4 flex items-center gap-1 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
             <Users className="w-3 h-3" /> {mutualFriends.length} Mutual Friend{mutualFriends.length > 1 ? 's' : ''}
          </div>
        )}
        
        {!isOwnProfile && (
           <div className="flex gap-2 mb-6">
              {isFriend ? (
                 <button onClick={() => removeFriend(profileUser.id)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full transition-colors border border-slate-700">
                    Unfriend
                 </button>
              ) : hasRequestedMe ? (
                <>
                 <button onClick={() => acceptFriendRequest(profileUser.id)} className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full transition-colors">
                    Accept Request
                 </button>
                 <button onClick={() => rejectFriendRequest(profileUser.id)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-full transition-colors border border-slate-700">
                    Reject
                 </button>
                </>
              ) : hasRequested ? (
                 <button className="px-6 py-2 bg-slate-800 text-slate-400 font-bold rounded-full transition-colors border border-slate-700" disabled>
                    Requested
                 </button>
              ) : (
                 <button onClick={() => addFriend(profileUser.id)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors">
                    Add Friend
                 </button>
              )}
           </div>
        )}
        
        <div className="flex gap-8 mt-2 w-full max-w-xs justify-center">
          <div className="text-center cursor-pointer">
            <div className="text-2xl font-black text-white">{currentUserPosts.length}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Posts</div>
          </div>
          <div className="text-center cursor-pointer">
            <div className="text-2xl font-black text-white">{followersCount}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Followers</div>
          </div>
          <div className="text-center cursor-pointer">
            <div className="text-2xl font-black text-white">{followingCount}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Following</div>
          </div>
        </div>


        {profileUser.socialLinks && (profileUser.socialLinks.youtube || profileUser.socialLinks.facebook || profileUser.socialLinks.snapchat || profileUser.socialLinks.discord) && (
          <div className="mt-6 w-full max-w-md px-6 flex justify-center gap-4">
            {profileUser.socialLinks.youtube && (
              <a href={`https://youtube.com/@${profileUser.socialLinks.youtube}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="YouTube">YT</a>
            )}
            {profileUser.socialLinks.facebook && (
              <a href={`https://facebook.com/${profileUser.socialLinks.facebook}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors" title="Facebook">FB</a>
            )}
            {profileUser.socialLinks.snapchat && (
              <a href={`https://snapchat.com/add/${profileUser.socialLinks.snapchat}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-yellow-400/20 text-yellow-500 border border-yellow-400/30 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors font-bold" title="Snapchat">SC</a>
            )}
            {profileUser.socialLinks.discord && (
              <a href="#" className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-colors" title={`Discord: ${profileUser.socialLinks.discord}`}>DC</a>
            )}
          </div>
        )}

        {profileUser.achievements && profileUser.achievements.length > 0 && (
          <div className="mt-8 w-full max-w-md px-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Achievements
            </h3>
            <div className="flex flex-wrap gap-2">
              {profileUser.achievements.map((ach, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full">
                  <span className="text-yellow-500 text-sm">🏆</span>
                  <span className="text-white text-xs font-bold">{ach}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col">
        {/* Feed View Toggle & Categories */}
        <div className="flex flex-col border-b border-slate-800 sticky top-[72px] z-10 bg-slate-950">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
             <div className="flex gap-4">
               <button 
                 onClick={() => setActiveCategory("posts")}
                 className={`text-sm font-bold ${activeCategory === "posts" ? "text-white" : "text-slate-500 hover:text-slate-300"} transition-colors`}
               >
                 Posts
               </button>
               <button 
                 onClick={() => setActiveCategory("snaps")}
                 className={`text-sm font-bold ${activeCategory === "snaps" ? "text-white" : "text-slate-500 hover:text-slate-300"} transition-colors`}
               >
                 Snaps
               </button>
               <button 
                 onClick={() => setActiveCategory("media")}
                 className={`text-sm font-bold ${activeCategory === "media" ? "text-white" : "text-slate-500 hover:text-slate-300"} transition-colors`}
               >
                 Media
               </button>
             </div>
             
             <div className="flex">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors rounded-lg ${viewMode === "grid" ? "bg-slate-800 text-blue-500" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors rounded-lg ${viewMode === "list" ? "bg-slate-800 text-blue-500" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>

        {/* Posts Area */}
        <div className="flex-1 p-1 md:p-4">
          {displayedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Camera className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">No {activeCategory} yet</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-1 md:gap-4 w-full">
              {displayedPosts.map(post => (
                <div 
                  key={post.id} 
                  className="aspect-square relative group overflow-hidden bg-slate-900 rounded-md md:rounded-2xl cursor-pointer"
                  onClick={() => onNavigateToPost?.(post.type)}
                >
                  <img src={post.url} alt={post.description} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-xs md:text-base backdrop-blur-sm">
                    <span className="flex items-center gap-1"><Flame className="w-4 h-4 md:w-5 md:h-5 fill-white"/> {post.likes}</span>
                  </div>
                  {post.type !== "reel" && (
                    <div className="absolute top-2 right-2 text-white">
                      <Play className="w-4 h-4 md:w-5 md:h-5 fill-white shadow-xl" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-w-xl mx-auto w-full">
              {displayedPosts.map(post => (
                <div 
                  key={post.id} 
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl cursor-pointer"
                  onClick={() => onNavigateToPost?.(post.type)}
                >
                  <div className="p-4 flex items-center gap-3">
                    <img src={profileUser.avatar} alt={profileUser.username} className="w-10 h-10 rounded-full" />
                    <div className="font-bold text-white text-sm">{profileUser.username}</div>
                  </div>
                  <div className="w-full aspect-square relative bg-black">
                    <img src={post.url} alt={post.description} className="w-full h-full object-contain" />
                    {post.type !== "reel" && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white">
                        <Play className="w-5 h-5 fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-4 text-slate-400">
                      <button className="hover:text-pink-500 transition-colors flex items-center gap-1" onClick={() => likePost(post.id, 'post')}>
                        <Flame className="w-6 h-6" /> <span className="font-bold">{post.likes}</span>
                      </button>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-white mr-2">{profileUser.username}</span>
                      <span className="text-slate-300">{post.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && (
      <div className="p-4 border-t border-slate-800 bg-slate-900 mt-auto shrink-0">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Settings</h3>
        
        <div className="space-y-2 mb-6">
          <div className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-slate-200">Screen Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white bg-slate-700 px-3 py-1 rounded-full">
                {Math.floor(sessionTimeSeconds / 60)}m {sessionTimeSeconds % 60}s
              </span>
            </div>
          </div>

          <button 
            onClick={() => setShowMissions(true)}
            className="w-full flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700 hover:bg-slate-700/80 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-slate-200">Daily Missions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-indigo-500 text-white px-2 py-1 rounded-full">New</span>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </button>
        </div>

        <button 
          onClick={onLogout}
          className="w-full bg-slate-800 text-slate-300 hover:text-white font-bold py-4 rounded-xl transition-colors hover:bg-slate-700 mb-4 flex items-center justify-center gap-2"
        >
          Logout
        </button>
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/50 hover:text-red-400 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-5 h-5" />
          Delete Account
        </button>
      </div>
      )}

      {/* Daily Missions Modal */}
      {showMissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                DAILY MISSIONS
              </h2>
              <button 
                onClick={() => setShowMissions(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DailyMissions onClose={() => setShowMissions(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-900/50 p-6 rounded-3xl max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Account?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This action is permanent and cannot be undone. All your posts, messages, and streaks will be lost.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteAccount();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 animation-slide-up">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowEditModal(false)} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-black text-white">EDIT PROFILE</h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-xl mx-auto w-full">
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <label className="relative group cursor-pointer block">
                  <img src={editForm.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-slate-800 object-cover" />
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const MAX_SIZE = 150;
                              let width = img.width;
                              let height = img.height;
                              if (width > height) {
                                if (width > MAX_SIZE) {
                                  height *= MAX_SIZE / width;
                                  width = MAX_SIZE;
                                }
                              } else {
                                if (height > MAX_SIZE) {
                                  width *= MAX_SIZE / height;
                                  height = MAX_SIZE;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              const resizedUrl = canvas.toDataURL('image/jpeg', 0.8);
                              setEditForm({ ...editForm, avatar: resizedUrl });
                            };
                            img.src = event.target.result as string;
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Username</label>
                <input 
                  type="text" 
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Email</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Gender</label>
                <select 
                  value={editForm.gender}
                  onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Birth Date</label>
                <input 
                  type="date" 
                  value={editForm.birthDate}
                  onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">New Password <span className="opacity-50">(optional)</span></label>
                <input 
                  type="password" 
                  value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <button 
                onClick={handleSaveProfile}
                className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
