import React, { useState } from 'react';
import { useAppContext, Story } from '../AppContext';
import { Plus, X } from 'lucide-react';

export function StoriesBar() {
  const { user, stories, users } = useAppContext();
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Group stories by user and filter out expired (24h)
  const now = Date.now();
  const activeStories = stories.filter(s => now - s.timestamp < 24 * 60 * 60 * 1000);

  // Get unique users who have stories
  const storyUsers = Array.from(new Set(activeStories.map(s => s.userId)))
    .map(id => users.find(u => u.id === id))
    .filter(Boolean);

  const myStories = activeStories.filter(s => s.userId === user?.id);
  const hasMyStory = myStories.length > 0;

  return (
    <>
      <div className="w-full overflow-x-auto hide-scrollbar py-4 px-4 flex gap-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm z-10 shrink-0">
        
        {/* My Story Button */}
        <div 
          className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
          onClick={() => {
            if (hasMyStory) setActiveStory(myStories[0]);
          }}
        >
          <div className={`relative w-16 h-16 rounded-full p-0.5 ${hasMyStory ? 'bg-gradient-to-tr from-pink-500 to-orange-500' : 'bg-slate-800'}`}>
            <img 
              src={user?.avatar} 
              alt="My Story" 
              className="w-full h-full rounded-full border-2 border-slate-950 bg-slate-900 object-cover"
            />
            {!hasMyStory && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center border-2 border-slate-950 text-white">
                <Plus className="w-3 h-3" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-300">My Story</span>
        </div>

        {/* Other Users' Stories */}
        {storyUsers.map(u => {
          if (!u || u.id === user?.id) return null;
          const userStory = activeStories.find(s => s.userId === u.id);
          return (
            <div 
              key={u.id}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                if (userStory) setActiveStory(userStory);
              }}
            >
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-orange-500">
                <img 
                  src={u.avatar} 
                  alt={u.username} 
                  className="w-full h-full rounded-full border-2 border-slate-950 bg-slate-900 object-cover"
                />
              </div>
              <span className="text-[10px] font-medium text-slate-300 truncate w-16 text-center">{u.username}</span>
            </div>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-[150] bg-black flex flex-col justify-center items-center">
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2">
              <img 
                src={users.find(u => u.id === activeStory.userId)?.avatar} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full bg-slate-800"
              />
              <span className="text-white font-bold">
                {users.find(u => u.id === activeStory.userId)?.username}
              </span>
            </div>
            <button 
              onClick={() => setActiveStory(null)}
              className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <img 
            src={activeStory.url} 
            alt="Story content" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}
