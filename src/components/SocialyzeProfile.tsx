import React, { useState } from "react";
import { Settings, ChevronRight, Grid3x3, LayoutList, Flame, Moon, Sun, Camera, Play, Heart, Edit3, X, Save, AlertTriangle, Trophy } from "lucide-react";
import { useTheme } from "../lib/theme";
import { useAppContext } from "../AppContext";
import { Logo } from "./Logo";

export function SocialyzeProfile({ onLogout, onNavigateToPost }: { onLogout: () => void, onNavigateToPost?: (type: string) => void }) {
  const { theme, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user, userPosts, likePost, updateUser, deleteAccount } = useAppContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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

  if (!user) return null;

  const currentUserPosts = userPosts.filter(post => post.author.id === user.id);

  return (
    <div className="h-full bg-slate-950 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 flex justify-between items-center sticky top-0 bg-slate-900/50 backdrop-blur-md z-20 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <h1 className="text-xl font-black tracking-tighter uppercase text-white hidden md:block">{user.username}</h1>
        </div>
        <button onClick={() => setShowEditModal(true)} className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-4 flex flex-col items-center border-b border-slate-800 pb-8 mt-4">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 rounded-full blur-md opacity-50"></div>
          <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-900 bg-slate-800 relative z-10" />
        </div>
        <h2 className="text-2xl font-black tracking-tighter text-white mb-1">{user.username}</h2>
        <p className="text-slate-400 text-sm mb-4 font-medium flex items-center gap-1">The all-in-one social user. <span className="text-orange-500 flex items-center gap-0.5"><Flame className="w-4 h-4 fill-orange-500"/> {user.streaks}</span> streak!</p>
        
        <div className="flex gap-8 mt-2 w-full max-w-xs justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-white">{userPosts.length}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-white">12K</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-white">108</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Following</div>
          </div>
        </div>

        {user.achievements && user.achievements.length > 0 && (
          <div className="mt-8 w-full max-w-md px-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Achievements
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.achievements.map((ach, idx) => (
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
        {/* Feed View Toggle */}
        <div className="flex border-b border-slate-800 sticky top-[72px] z-10 bg-slate-950">
          <button 
            onClick={() => setViewMode("grid")}
            className={`flex-1 flex items-center justify-center p-4 transition-colors border-b-2 ${viewMode === "grid" ? "border-blue-500 text-blue-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}
          >
            <Grid3x3 className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`flex-1 flex items-center justify-center p-4 transition-colors border-b-2 ${viewMode === "list" ? "border-blue-500 text-blue-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}
          >
            <LayoutList className="w-6 h-6" />
          </button>
        </div>

        {/* Posts Area */}
        <div className="flex-1 p-1 md:p-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-1 md:gap-4 w-full">
              {currentUserPosts.map(post => (
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
              {currentUserPosts.map(post => (
                <div 
                  key={post.id} 
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl cursor-pointer"
                  onClick={() => onNavigateToPost?.(post.type)}
                >
                  <div className="p-4 flex items-center gap-3">
                    <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
                    <div className="font-bold text-white text-sm">{user.username}</div>
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
                      <span className="font-bold text-white mr-2">{user.username}</span>
                      <span className="text-slate-300">{post.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Settings Area */}
        <div className="p-4 md:p-8 border-t border-slate-800 bg-slate-950/80 backdrop-blur mt-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Account Settings</h3>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-full bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl flex items-center justify-between max-w-md mx-auto hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-full text-slate-300">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white uppercase tracking-widest text-sm">Appearance</div>
                  <div className="text-xs text-slate-400 font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'light' ? 'bg-green-500' : 'bg-slate-700'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${theme === 'light' ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </button>

            {/* Action button */}
            <button 
              onClick={onLogout}
              className="w-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors text-white font-bold py-4 rounded-2xl shadow-lg mt-2 uppercase tracking-widest text-sm max-w-md mx-auto block mb-4"
            >
              Log Out
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-red-500 font-bold py-4 rounded-2xl shadow-lg uppercase tracking-widest text-sm max-w-md mx-auto block"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-6 relative animation-slide-up text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Delete Account?</h2>
            <p className="text-slate-400 text-sm mb-6">
              This action is permanent and cannot be undone. All your posts, followers, and profile data will be erased.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  deleteAccount();
                }}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-6 relative animation-slide-up">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center">Edit Profile</h2>
            
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
                            setEditForm({ ...editForm, avatar: event.target.result as string });
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
