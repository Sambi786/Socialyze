import React from "react";
import { X, Link2, MessageSquare, Twitter, Instagram, Send } from "lucide-react";
import { MOCK_FRIENDS } from "../data";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-white font-bold tracking-tight">Share to...</h3>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex gap-4 overflow-x-auto hide-scrollbar border-b border-slate-800">
          <button className="flex flex-col items-center gap-2 min-w-[72px]">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Copy Link</span>
          </button>
          <button className="flex flex-col items-center gap-2 min-w-[72px]">
            <div className="w-12 h-12 rounded-full bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 flex items-center justify-center text-[#1DA1F2] hover:bg-[#1DA1F2]/30 transition-colors">
              <Twitter className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Twitter</span>
          </button>
          <button className="flex flex-col items-center gap-2 min-w-[72px]">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-500 hover:bg-pink-500/30 transition-colors">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Instagram</span>
          </button>
        </div>

        <div className="p-4 bg-slate-900/50">
          <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 ml-1">Send internally</h4>
          <div className="space-y-2">
            {MOCK_FRIENDS.slice(0, 3).map(friend => (
              <div key={friend.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-800 transition-colors group cursor-pointer border border-transparent hover:border-slate-700/50">
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
