import React, { useState } from "react";
import { Heart, MessageCircle, Share2, MoreVertical } from "lucide-react";
import { cn } from "../lib/utils";
import { PullToRefresh } from "./PullToRefresh";
import { ShareModal } from "./ShareModal";
import { useAppContext } from "../AppContext";
import { ReactionButton } from "./ReactionButton";

export function ZocialyseFeed() {
  const { reels, likePost } = useAppContext();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState<{url: string, title: string} | null>(null);

  const handleRefresh = async () => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleShare = (reel: any) => {
    setItemToShare({ url: reel.url, title: reel.description });
    setShareModalOpen(true);
  };

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh} scrollClassName="snap-y snap-mandatory bg-slate-950">
        {reels.map((reel) => (
          <div key={reel.id} className="relative h-[100dvh] md:h-full w-full md:max-w-[480px] md:mx-auto snap-start snap-always bg-black md:border-x border-slate-800/80">
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
                    <img src={reel.author.avatar} alt={reel.author.username} className="w-10 h-10 rounded-full border-2 border-white bg-slate-800" />
                    <span className="text-white font-bold text-base shadow-sm">{reel.author.username}</span>
                    <button className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold rounded-xl transition-all ml-2 shadow-lg">
                      Follow
                    </button>
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
                  <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="p-3 bg-black/40 rounded-2xl backdrop-blur-sm group-hover:bg-white/20 transition-all border border-transparent group-hover:border-white/30">
                      <MessageCircle className="w-6 h-6 text-white" />
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
                  <div className="flex flex-col items-center gap-1 group cursor-pointer pt-2">
                    <MoreVertical className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </PullToRefresh>
      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        url={itemToShare?.url}
        title={itemToShare?.title}
      />
    </>
  );
}
