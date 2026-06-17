import React, { useState, useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAppContext } from "../AppContext";

const EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👏"];

interface ReactionButtonProps {
  postId: string;
  type: 'reel' | 'video' | 'post';
  likes: number;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  heartIcon?: React.ReactNode;
}

export function ReactionButton({ postId, type, likes, className, iconClassName, textClassName, heartIcon }: ReactionButtonProps) {
  const { likePost } = useAppContext();
  const [showReactions, setShowReactions] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: number; emoji: string }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    timerRef.current = setTimeout(() => {
      setShowReactions(true);
    }, 400); // 400ms to open reaction bar
  };

  const handlePointerUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!showReactions) {
      handleReact(selectedEmoji || '❤️'); // Default like if no emoji selected
    }
  };

  const handleReact = (emoji: string) => {
    likePost(postId, type);
    setSelectedEmoji(emoji);
    setShowReactions(false);

    // Create flying effect
    const newEmoji = { id: Date.now(), emoji };
    setFlyingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFlyingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 1000);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Reaction Bar */}
      {showReactions && (
        <div className="absolute bottom-full mb-4 z-50 flex gap-2 p-2 bg-slate-900/90 backdrop-blur-md rounded-full border border-slate-700/50 shadow-2xl animation-slide-up origin-bottom">
          {EMOJIS.map((emoji, idx) => (
            <button
              key={emoji}
              onClick={(e) => { e.stopPropagation(); handleReact(emoji); }}
              className="text-2xl hover:scale-125 transition-transform origin-bottom"
              style={{ animation: `slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s both` }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Like Button */}
      <div 
        className={className || "flex flex-col items-center gap-1 group cursor-pointer"}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
      >
        <div className={iconClassName || "p-3 bg-black/40 rounded-2xl backdrop-blur-sm group-hover:bg-pink-500/20 transition-all border border-transparent group-hover:border-pink-500/50"}>
          {selectedEmoji ? (
             <span className="w-6 h-6 flex items-center justify-center text-xl">{selectedEmoji}</span>
          ) : (
             heartIcon || <Heart className="w-6 h-6 text-white group-hover:text-pink-500 transition-colors" />
          )}
        </div>
        <span className={textClassName || "text-white text-xs font-bold drop-shadow-md"}>{likes}</span>
      </div>

      {/* Flying Emojis */}
      {flyingEmojis.map((e) => (
        <div 
          key={e.id} 
          className="absolute text-3xl pointer-events-none select-none z-[60]"
          style={{
            animation: 'flyUp .8s cubic-bezier(.16, 1, .3, 1) forwards',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {e.emoji}
        </div>
      ))}

      {showReactions && (
        <div 
          className="fixed inset-0 z-40"
          onClick={(e) => { e.stopPropagation(); setShowReactions(false); }}
        />
      )}
    </div>
  );
}
