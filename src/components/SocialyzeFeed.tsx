import React, { useState } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Sparkles, Loader2, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { PullToRefresh } from "./PullToRefresh";
import { ShareModal } from "./ShareModal";
import { CommentsModal } from "./CommentsModal";
import { useAppContext } from "../AppContext";
import { ReactionButton } from "./ReactionButton";
import { toast } from "../lib/toast";
import { Logo } from "./Logo";
import { TrendingSlide } from "./TrendingSlide";

export function SocialyzeFeed() {
  const { reels, likePost, addFriend, removeFriend, acceptFriendRequest, friends, user, refreshReels, searchQuery } = useAppContext();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState<{url: string, title: string} | null>(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (isSummarizing || reels.length === 0) return;
    setIsSummarizing(true);
    toast({ title: "Summarizing", message: "Analyzing current feed...", icon: "gift" });
    
    try {
      const posts = reels.map(r => r.description);
      const response = await fetch("/api/summarize-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts })
      });
      const data = await response.json();
      toast({ title: "AI Summary", message: data.summary, icon: "gift" });
    } catch (error) {
      toast({ title: "AI Summary", message: "Lots of fun tech, coding, and lifestyle vibes today! ✨", icon: "gift" });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleRefresh = async () => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    refreshReels();
    toast({ title: "Refreshed", message: "Feed updated with new posts!", icon: "bell" });
  };

  const handleShare = (reel: any) => {
    setItemToShare({ url: reel.url, title: reel.description });
    setShareModalOpen(true);
  };

  return (
    <>
      {/* Floating Logo */}
      <div className="absolute top-4 left-4 z-50 md:hidden drop-shadow-2xl">
        <Logo size="sm" />
      </div>
      
      {/* AI Summarize Button */}
      <button
        onClick={handleSummarize}
        disabled={isSummarizing}
        className="absolute top-4 right-4 md:top-6 md:right-8 z-50 flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 rounded-full border border-slate-700/50 text-white shadow-lg shadow-pink-500/10 transition-all disabled:opacity-70"
      >
        {isSummarizing ? (
          <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin text-pink-500" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-500" />
        )}
        <span className="text-[10px] md:text-sm font-bold hidden sm:inline">Summarize</span>
      </button>

      <PullToRefresh onRefresh={handleRefresh} scrollClassName="snap-y snap-mandatory bg-slate-950">
        {(() => {
          const filteredReels = reels.filter(reel => {
             if (!searchQuery) return true;
             const query = searchQuery.toLowerCase().replace(/^#/, '');
             return (
               reel.description.toLowerCase().includes(query) ||
               reel.author.username.toLowerCase().includes(query)
             );
          });
          
          if (filteredReels.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium text-lg">No posts found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            );
          }

          return filteredReels.map((reel, index) => {
          const isFollowing = friends.some(f => f.id === reel.author.id) || reel.author.id === user?.id;
          const hasRequested = reel.author.friendRequests?.includes(user?.id || '');
                const hasRequestedMe = user?.friendRequests?.includes(reel.author.id);
          
          return (
          <React.Fragment key={reel.id}>
            {!searchQuery && index === 1 && <TrendingSlide />}
            <div className="relative h-full w-full snap-start snap-always bg-black flex justify-center md:py-6 overflow-hidden">
              {/* Blurred Background for desktop */}
              <div 
                className="hidden md:block absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110"
                style={{ backgroundImage: `url(${reel.url})` }}
              />
              {/* Main Reel Content */}
              <div className="relative w-full h-full md:max-w-[400px] lg:max-w-[450px] md:rounded-2xl overflow-hidden bg-black md:border border-slate-800 md:shadow-2xl md:shadow-black">
            {/* Mock Video Container */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${reel.url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            
            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 pb-20 sm:pb-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <img src={reel.author.avatar} alt={reel.author.username} className="w-10 h-10 rounded-full border-2 border-white bg-slate-800 cursor-pointer hover:scale-105 transition-transform" onClick={() => window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: reel.author.id }))} />
                    <span className="text-white font-bold text-base shadow-sm cursor-pointer hover:underline" onClick={() => window.dispatchEvent(new CustomEvent('OPEN_PROFILE', { detail: reel.author.id }))}>{reel.author.username}</span>
                    {isFollowing ? (
                      reel.author.id !== user?.id && (
                        <button 
                          onClick={() => removeFriend(reel.author.id)}
                          className="px-4 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all ml-2 shadow-lg backdrop-blur-md"
                        >
                          Following
                        </button>
                      )
                    ) : hasRequestedMe ? (
                      <button 
                        onClick={() => acceptFriendRequest(reel.author.id)}
                        className="px-4 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-xl transition-all ml-2 shadow-lg"
                      >
                        Accept
                      </button>
                    ) : hasRequested ? (
                      <button 
                        className="px-4 py-1.5 bg-slate-800/80 text-slate-400 text-xs font-bold rounded-xl border border-slate-700 transition-all ml-2 shadow-lg backdrop-blur-md"
                        disabled
                      >
                        Requested
                      </button>
                    ) : (
                      <button 
                        onClick={() => addFriend(reel.author.id)}
                        className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold rounded-xl transition-all ml-2 shadow-lg"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                  <p className="text-white font-medium text-sm drop-shadow-md line-clamp-3">
                    {reel.description}
                  </p>
                </div>

                <div className="flex flex-col justify-end items-center gap-6 pb-4">
                  <ReactionButton
                    postId={reel.id}
                    type="reel"
                    likes={reel.likes}
                  />
                  <div 
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                    onClick={() => {
                      setActivePostId(reel.id);
                      setCommentsModalOpen(true);
                    }}
                  >
                    <div className="p-3 bg-black/40 rounded-2xl backdrop-blur-sm group-hover:bg-pink-500/20 transition-all border border-transparent group-hover:border-pink-500/50">
                      <MessageCircle className="w-6 h-6 text-white group-hover:text-white/80 transition-colors" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{reel.comments}</span>
                  </div>
                  <div 
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                    onClick={() => handleShare(reel)}
                  >
                    <div className="p-3 bg-black/40 rounded-2xl backdrop-blur-sm group-hover:bg-white/20 transition-all border border-transparent group-hover:border-white/30">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                  </div>
                  <div 
                    className="flex flex-col items-center gap-1 group cursor-pointer pt-2"
                    onClick={() => toast({ title: "More Options", message: "Additional options are coming soon.", icon: "bell" })}
                  >
                    <MoreVertical className="w-6 h-6 text-white" />
                  </div>
                  
                </div>
              </div>
            </div>
            </div>
          </div>
          </React.Fragment>
          );
          })
        })()}
      </PullToRefresh>
      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        url={itemToShare?.url}
        title={itemToShare?.title}
      />
      {activePostId && (
        <CommentsModal 
          isOpen={commentsModalOpen}
          onClose={() => setCommentsModalOpen(false)}
          postId={activePostId}
        />
      )}
    </>
  );
}
