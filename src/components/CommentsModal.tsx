import React, { useState } from 'react';
import { X, Send, Smile } from 'lucide-react';
import { toast } from '../lib/toast';
import { useAppContext } from '../AppContext';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

const EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👏"];

export function CommentsModal({ isOpen, onClose, postId }: CommentsModalProps) {
  const { user } = useAppContext();
  const [comment, setComment] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Dummy comments state
  const [comments, setComments] = useState([
    { id: '1', user: 'Alex', text: 'This is awesome! 🔥', time: '2h ago' },
    { id: '2', user: 'Sarah', text: 'Love this so much ❤️', time: '3h ago' },
    { id: '3', user: 'Mike', text: 'Can\'t wait for more!', time: '5h ago' }
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setComments([{ 
      id: Date.now().toString(), 
      user: user?.username || 'You', 
      text: comment,
      time: 'Just now'
    }, ...comments]);
    
    setComment("");
    setShowEmojis(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setComment(prev => prev + emoji);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-slate-900 w-full sm:max-w-md h-[70dvh] sm:h-[600px] sm:rounded-3xl rounded-t-3xl relative z-10 flex flex-col shadow-2xl border border-slate-700/50 animation-slide-up overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-white font-bold text-lg">Comments</h3>
          <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {c.user[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-semibold text-sm">{c.user}</span>
                  <span className="text-slate-500 text-xs">{c.time}</span>
                </div>
                <p className="text-slate-300 text-sm mt-0.5 break-words">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
          {showEmojis && (
            <div className="flex gap-2 p-3 bg-slate-800 rounded-xl mb-3 overflow-x-auto no-scrollbar shadow-inner">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-110 transition-transform shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              className={`p-2 rounded-xl transition-colors ${showEmojis ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-pink-500/50"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="p-3 bg-pink-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
