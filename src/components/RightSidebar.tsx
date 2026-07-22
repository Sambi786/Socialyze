import React from 'react';
import { useAppContext } from '../AppContext';
import { Search, Flame, Users, Sparkles, UserPlus } from 'lucide-react';
import { User } from '../data';

export function RightSidebar() {
  const { user, users, friends, addFriend } = useAppContext();

  const suggestedUsers = users
    .filter(u => u.id !== user?.id && !friends.some(f => f.id === u.id) && !user?.friendRequests?.includes(u.id))
    .slice(0, 5);

  const activeFriends = friends.filter(f => f.isOnline).slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col gap-8">
      {/* Search mock */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search Socialyze..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
        />
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          Suggested for you
        </h3>
        <div className="space-y-4">
          {suggestedUsers.map(u => (
            <div key={u.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: u.id }))}>
                <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full bg-slate-800 object-cover" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white group-hover:text-pink-400 transition-colors">{u.username}</span>
                  <span className="text-xs text-slate-500">Popular</span>
                </div>
              </div>
              <button 
                onClick={() => addFriend(u.id)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          ))}
          {suggestedUsers.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-2">You follow everyone!</p>
          )}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Trending Topics
        </h3>
        <div className="space-y-4">
          {['#TechLife', '#CodingVibes', 'Silicon Valley', '#AIArtwork', 'New React'].map((tag, i) => (
            <div key={i} className="flex flex-col cursor-pointer group">
              <span className="text-sm font-medium text-slate-300 group-hover:text-orange-400 transition-colors">{tag}</span>
              <span className="text-xs text-slate-500">{(Math.random() * 50 + 10).toFixed(1)}K posts</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-auto pt-6 text-xs text-slate-600 space-y-2 pb-4">
        <div className="flex gap-2 flex-wrap">
          <a href="#" className="hover:text-slate-400">About</a>
          <a href="#" className="hover:text-slate-400">Help</a>
          <a href="#" className="hover:text-slate-400">Privacy</a>
          <a href="#" className="hover:text-slate-400">Terms</a>
        </div>
        <p>© 2026 Socialyze App</p>
      </div>
    </div>
  );
}
