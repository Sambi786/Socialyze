import React, { useState, useEffect } from "react";
import { Play, Radio, X, Send, Eye, MoreVertical, Share2, Heart, MessageCircle, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { PullToRefresh } from "./PullToRefresh";
import { ShareModal } from "./ShareModal";
import { useAppContext } from "../AppContext";
import { ReactionButton } from "./ReactionButton";
import { toast } from "../lib/toast";
import { Logo } from "./Logo";

export function SocialyzeWatch() {
  const { videos, user, likePost, addFriend, friends } = useAppContext();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState<{url: string, title: string} | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [liveComments, setLiveComments] = useState<{id: number, user: string, text: string}[]>([
    { id: 1, user: "alex_snap", text: "Yoo this stream is lit 🔥" },
    { id: 2, user: "emma_live", text: "Hello from Tokyo 🇯🇵" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [viewerCount, setViewerCount] = useState(1);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (activeVideo && isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            return 100;
          }
          return p + 0.1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [activeVideo, isPlaying]);

  useEffect(() => {
    if (progress >= 100 && isPlaying) {
      setIsPlaying(false);
    }
  }, [progress, isPlaying]);

  useEffect(() => {
    if (activeVideo) {
      setProgress(0);
      setIsPlaying(true);
    }
  }, [activeVideo?.id]);

  useEffect(() => {
    if (!isLive) return;
    
    // Simulate viewer count going up
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleRefresh = async () => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;
    setLiveComments(prev => [...prev, { id: Date.now(), user: user.username, text: chatInput }]);
    setChatInput("");
  };

  const handleShare = (video: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToShare({ url: video.url, title: video.description });
    setShareModalOpen(true);
  };

  if (activeVideo) {
    return (
      <div className="h-full bg-black flex flex-col relative overflow-hidden text-white group">
        {/* Mock Video Container */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <img 
            src={activeVideo.url} 
            alt={activeVideo.description} 
            className="w-full h-full object-contain" 
          />
          
          {/* Overlay gradient for controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Center Play/Pause Overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={() => {
              if (!isPlaying && progress >= 100) {
                setProgress(0);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
          >
            {!isPlaying && (
              <div className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center pointer-events-none">
                <Play className="w-10 h-10 ml-2" />
              </div>
            )}
          </div>

          {/* Top Header */}
          <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <button 
              onClick={() => setActiveVideo(null)}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 z-10">
              <button onClick={(e) => handleShare(activeVideo, e)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Seeking progress bar */}
            <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer relative overflow-hidden pointer-events-auto" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setProgress(pos * 100);
            }}>
              <div 
                className="absolute top-0 left-0 bottom-0 bg-pink-500 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    if (!isPlaying && progress >= 100) {
                      setProgress(0);
                      setIsPlaying(true);
                    } else {
                      setIsPlaying(!isPlaying);
                    }
                  }}
                  className="hover:text-pink-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="hover:text-pink-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-mono">
                  {Math.floor(progress / 100 * 14)}:{Math.floor((progress / 100 * 14 * 60) % 60).toString().padStart(2, '0')} / 14:59
                </span>
                <button className="hover:text-pink-400 transition-colors">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar/Overlay (Desktop) or Bottom Sheet (Mobile) - simplified for demo */}
        <div className="bg-slate-950 p-4 md:absolute md:top-0 md:right-0 md:w-80 md:h-full md:border-l md:border-slate-800 md:bg-slate-950/90 md:backdrop-blur-xl flex flex-col gap-4 z-20">
          <div className="flex gap-3 items-center">
            <img src={activeVideo.author.avatar} alt={activeVideo.author.username} className="w-10 h-10 rounded-full border border-slate-800" />
            <div className="flex flex-col flex-1">
              <h3 className="text-white font-bold text-sm leading-tight">{activeVideo.description}</h3>
              <span className="text-slate-400 text-xs font-medium">{activeVideo.author.username}</span>
            </div>
          </div>
          <div className="flex justify-around py-2 border-y border-slate-800">
            <ReactionButton
              postId={activeVideo.id}
              type="video"
              likes={activeVideo.likes}
              className="flex flex-col items-center group cursor-pointer"
              iconClassName="w-6 h-6"
              textClassName="text-xs mt-1"
            />
            <div className="flex flex-col items-center group cursor-pointer text-slate-400 hover:text-white">
              <MessageCircle className="w-6 h-6 mb-1" />
              <span className="text-xs font-bold font-mono">124</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-[100px] hide-scrollbar text-sm text-slate-400 pb-4">
            <p>Example comments...</p>
            <p className="mt-2 text-slate-500">Amazing video! Keep it up. 🔥</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLive && user) {
    return (
      <div className="h-full bg-slate-950 flex flex-col relative overflow-hidden text-white">
        {/* Background Mock Video */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
          style={{ backgroundImage: `url(${user.avatar})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        {/* Top Header */}
        <div className="relative z-10 p-4 pt-safe flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/50 backdrop-blur-md p-1.5 pr-4 rounded-full border border-slate-700/50 flex items-center gap-2">
              <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">{user.username}</span>
                <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Host</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-red-500/20 text-red-500 border border-red-500/50 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Live</span>
            </div>
            <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700/50">
              <Eye className="w-4 h-4 text-slate-300" />
              <span className="text-xs font-bold text-slate-200">{viewerCount.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setIsLive(false)}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-slate-700/50 hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Studio Content */}
        <div className="flex-1 relative z-10 flex flex-col justify-center items-center pointer-events-none">
          <div className="w-full max-w-md aspect-[3/4] border-2 border-dashed border-slate-500/30 rounded-[32px] flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm">
            <Radio className="w-16 h-16 text-slate-400/50" />
            <p className="text-slate-400/80 font-bold uppercase tracking-widest text-sm">Camera Offline</p>
          </div>
        </div>

        {/* Bottom Overlay containing Comments and Input */}
        <div className="relative z-10 w-full p-4 flex flex-col justify-end pointer-events-auto h-80 max-h-[50vh]">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col justify-end gap-3 mb-4 mask-image-b min-h-0">
            {liveComments.map(c => (
              <div key={c.id} className="flex flex-col max-w-[80%] bg-black/40 backdrop-blur-md p-3 rounded-2xl rounded-bl-sm border border-slate-700/50 self-start">
                <span className="text-[10px] text-pink-400 font-bold mb-1">{c.user}</span>
                <span className="text-sm">{c.text}</span>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 w-full shrink-0">
            <form onSubmit={handleSendComment} className="flex-1 flex gap-2">
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chat openly..."
                className="flex-1 bg-black/40 backdrop-blur-md border border-slate-700/50 rounded-full px-4 py-3 focus:outline-none focus:border-pink-500/50 transition-colors text-sm"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity shrink-0"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
            <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 transition-colors shrink-0">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900/50 backdrop-blur-md z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <h1 className="text-xl font-black tracking-tighter text-white hidden md:block">WATCH & LIVE</h1>
        </div>
        <button 
          onClick={() => setIsLive(true)}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/20"
        >
          <Radio className="w-4 h-4" />
          Go Live
        </button>
      </div>
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-4 py-3 z-10 flex gap-2 overflow-x-auto hide-scrollbar">
        {["All", "Live Now", "Gaming", "Music", "Vlogs", "Tech"].map((tag, i) => (
          <button 
            key={tag}
            className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest whitespace-nowrap transition-colors ${i === 0 ? "bg-pink-500 text-white" : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50"}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <PullToRefresh onRefresh={handleRefresh} containerClassName="flex-1" scrollClassName="p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => {
            const isFollowing = friends.some(f => f.id === video.author.id) || video.author.id === user?.id;
            return (
            <div key={video.id} className="group cursor-pointer flex flex-col" onClick={() => setActiveVideo(video)}>
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-800 mb-3 border border-transparent group-hover:border-slate-700 transition-colors relative">
                <img src={video.url} alt={video.description} className="w-full h-full object-cover" />
                
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>

                <div 
                  className="absolute top-3 right-3 bg-black/40 hover:bg-black/80 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                  onClick={(e) => handleShare(video, e)}
                >
                  <Share2 className="w-4 h-4" />
                </div>

                {video.type === "live" && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    Live
                  </div>
                )}
              {video.type === "live" && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {video.likes} watching
                </div>
              )}
              {video.type === "video" && (
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                  14:59
                </div>
              )}
            </div>
            
            <div className="flex gap-3 px-1">
              <img src={video.author.avatar} alt={video.author.username} className="w-10 h-10 rounded-full border border-slate-800" />
              <div className="flex flex-col flex-1">
                <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">{video.description}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-400 text-xs font-medium">{video.author.username}</span>
                  {!isFollowing && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); addFriend(video.author.id); }}
                      className="text-pink-500 hover:text-pink-400 text-[10px] font-bold uppercase transition-colors"
                    >
                      Follow
                    </button>
                  )}
                </div>
                <span className="text-slate-500 text-xs">{video.type === "live" ? "Started 10m ago" : "2 days ago • 12K views"}</span>
              </div>
              <div className="pt-1 px-1 flex flex-col gap-2 items-center">
                <MoreVertical 
                  className="w-5 h-5 text-slate-500 mb-2 cursor-pointer hover:text-white transition-colors" 
                  onClick={(e) => { e.stopPropagation(); toast({ title: "More Options", message: "Video options coming soon.", icon: "bell" }) }}
                />
                <ReactionButton
                  postId={video.id}
                  type="video"
                  likes={video.likes}
                  className="flex flex-col items-center group cursor-pointer"
                  iconClassName=""
                  textClassName="hidden"
                  heartIcon={<Heart className="w-5 h-5 text-slate-500 group-hover:text-pink-500 transition-colors" />}
                />
              </div>
            </div>
          </div>
          )})}
        </div>
      </PullToRefresh>

      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        url={itemToShare?.url}
        title={itemToShare?.title}
      />
    </div>
  );
}
