import React from "react";
import { X, Link2, MessageSquare, Twitter, Instagram, Send, Sparkles } from "lucide-react";
import { useAppContext } from "../AppContext";
import { toast } from "../lib/toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
  onShareLocally?: (text: string) => void;
}

export function ShareModal({ isOpen, onClose, url, title, onShareLocally }: ShareModalProps) {
  const { friends, groups, sendMessage, addStory } = useAppContext();

  if (!isOpen) return null;

  const handleSendToChat = (chatId: string, isGroup: boolean) => {
    const defaultText = `Check this out: ${title} ${url}`;
    if (onShareLocally) {
      onShareLocally(chatId);
    } else {
      sendMessage(chatId, defaultText, isGroup);
    }
    // optionally give a small toast here or just close
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-white font-bold tracking-tight">Share to...</h3>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex gap-4 overflow-x-auto hide-scrollbar border-b border-slate-800">
          <button 
            onClick={() => {
              addStory(url || '', 'image');
              onClose();
            }}
            className="flex flex-col items-center gap-2 min-w-[72px]"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-orange-500 border border-orange-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-pink-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">My Story</span>
          </button>
          <button 
            className="flex flex-col items-center gap-2 min-w-[72px]"
            onClick={() => {
              const textToCopy = `${title ? title + ' ' : ''}${url || ''}`;
              navigator.clipboard.writeText(textToCopy);
              toast({ title: 'Copied!', message: 'Link copied to clipboard', icon: 'bell' });
              onClose();
            }}
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Copy Link</span>
          </button>
          <button 
            className="flex flex-col items-center gap-2 min-w-[72px]"
            onClick={() => {
              const text = encodeURIComponent(`${title ? title + ' ' : ''}${url || ''}`);
              window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
              onClose();
            }}
          >
            <div className="w-12 h-12 rounded-full bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 flex items-center justify-center text-[#1DA1F2] hover:bg-[#1DA1F2]/30 transition-colors">
              <Twitter className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Twitter</span>
          </button>
          <button 
            className="flex flex-col items-center gap-2 min-w-[72px]"
            onClick={() => {
              const textToCopy = `${title ? title + ' ' : ''}${url || ''}`;
              navigator.clipboard.writeText(textToCopy);
              toast({ title: 'Instagram', message: 'Link copied! Open Instagram to share.', icon: 'bell' });
              onClose();
            }}
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-500 hover:bg-pink-500/30 transition-colors">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Instagram</span>
          </button>
        </div>

        <div className="p-4 bg-slate-900/50 max-h-64 overflow-y-auto">
          {groups.length > 0 && (
            <>
              <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 ml-1 mt-2">Groups</h4>
              <div className="space-y-2 mb-4">
                {groups.map(group => (
                  <div key={group.id} onClick={() => handleSendToChat(group.id, true)} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-800 transition-colors group cursor-pointer border border-transparent hover:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <img src={group.avatar} alt={group.name} className="w-10 h-10 rounded-full border border-slate-700" />
                      <span className="font-bold text-sm text-slate-200">{group.name}</span>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 ml-1">Friends</h4>
          <div className="space-y-2">
            {friends.map(friend => (
              <div key={friend.id} onClick={() => handleSendToChat(friend.id, false)} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-800 transition-colors group cursor-pointer border border-transparent hover:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <img src={friend.avatar} alt={friend.username} className="w-10 h-10 rounded-full border border-slate-700" />
                  <span className="font-bold text-sm text-slate-200">{friend.username}</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
