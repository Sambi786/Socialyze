import React, { useState } from 'react';
import { Search, UserPlus, X, Check } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { User, GroupChat } from '../data';
import { Users } from 'lucide-react';

export function UserSearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { searchUsers, searchGroups, requestJoinGroup, addFriend, removeFriend, acceptFriendRequest, friends, user } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(User | GroupChat)[]>([]);
  const [addedFriend, setAddedFriend] = useState<User | null>(null);

  if (!isOpen && !addedFriend) return null;

  if (addedFriend) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-slate-950 animate-in fade-in duration-300">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-8 border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
          <img src={addedFriend.avatar} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-4">
          You finally added<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{addedFriend.username}</span><br />
          as a friend!
        </h2>
        <p className="text-slate-400 text-center text-lg font-medium">You can now chat and call each other in real time.</p>
        <div className="mt-12 text-indigo-500 animate-pulse flex flex-col items-center gap-2">
          <Check className="w-8 h-8" />
          <span className="text-sm font-bold tracking-widest uppercase">Success</span>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setResults([...searchUsers(val), ...searchGroups(val)]);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80dvh] mt-12 sm:mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-3 items-center">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input 
            autoFocus
            type="text"
            placeholder="Search friends or groups..."
            className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-slate-500 font-medium"
            value={query}
            onChange={handleSearch}
          />
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 min-h-[300px]">
          {results.length === 0 && query.length > 0 ? (
            <div className="text-center p-8 text-slate-500 font-medium">No users or groups found for "{query}"</div>
          ) : results.length === 0 ? (
            <div className="text-center p-8 text-slate-500 font-medium">Type a username or group name to search</div>
          ) : (
            results.map(item => {
              const isGroup = 'members' in item;
              const u = item as any;
              if (isGroup) {
                const group = item as GroupChat;
                const hasRequested = group.joinRequests?.includes(user?.id || '');
                return (
                  <div key={group.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={group.avatar} className="w-12 h-12 rounded-full border border-slate-800" />
                      <div>
                        <div className="font-bold text-white">{group.name}</div>
                        <div className="text-xs text-slate-500">{group.members.length} members</div>
                      </div>
                    </div>
                    {hasRequested ? (
                      <div className="px-4 py-2 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4" /> Requested
                      </div>
                    ) : (
                      <button 
                        onClick={() => requestJoinGroup(group.id)}
                        className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors"
                      >
                        <Users className="w-4 h-4" /> Join
                      </button>
                    )}
                  </div>
                );
              }
              const isFriend = friends.some(f => f.id === u.id);
              const hasRequested = u.friendRequests?.includes(user?.id || '');
              const hasRequestedMe = user?.friendRequests?.includes(u.id);
              return (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="w-12 h-12 rounded-full border border-slate-800" />
                    <div>
                      <div className="font-bold text-white">{u.username}</div>
                      <div className="text-xs text-slate-500">Joined Socialyze</div>
                    </div>
                  </div>
                  {isFriend ? (
                    <button 
                      onClick={() => removeFriend(u.id)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Following
                    </button>
                  ) : hasRequestedMe ? (
                    <button 
                      onClick={() => acceptFriendRequest(u.id)}
                      className="px-4 py-2 bg-pink-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-pink-600 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                  ) : hasRequested ? (
                    <button 
                      className="px-4 py-2 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl flex items-center gap-2"
                      disabled
                    >
                      <Check className="w-4 h-4" /> Requested
                    </button>
                  ) : (
                    <button 
                      onClick={() => addFriend(u.id)}
                      className="px-4 py-2 bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-indigo-600 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" /> Add
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
