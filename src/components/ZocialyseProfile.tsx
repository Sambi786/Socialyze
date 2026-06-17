import React, { useState } from "react";
import { Settings, ChevronRight, Grid3x3, LayoutList, Flame, Moon, Sun, Camera, Play, Heart } from "lucide-react";
import { useTheme } from "../lib/theme";
import { useAppContext } from "../AppContext";

export function ZocialyseProfile({ onLogout }: { onLogout: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user, userPosts, likePost } = useAppContext();

  if (!user) return null;

  return (
    <div className="h-full bg-slate-950 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 flex justify-between items-center sticky top-0 bg-slate-900/50 backdrop-blur-md z-20 border-b border-slate-800">
        <h1 className="text-xl font-black tracking-tighter uppercase text-white">{user.username}</h1>
        <button className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
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
              {userPosts.map(post => (
                <div key={post.id} className="aspect-square relative group overflow-hidden bg-slate-900 rounded-md md:rounded-2xl cursor-pointer">
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
              {userPosts.map(post => (
                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
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
              className="w-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors text-red-400 font-bold py-4 rounded-2xl shadow-lg mt-2 uppercase tracking-widest text-sm max-w-md mx-auto block"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
