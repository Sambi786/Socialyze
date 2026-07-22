import React, { useState, useRef, useEffect } from "react";
import { X, Camera, Image as ImageIcon, Video, Send, UserPlus } from "lucide-react";
import { toast } from "../lib/toast";
import { useAppContext } from "../AppContext";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillTagged?: string;
}

export function CreatePostModal({ isOpen, onClose, prefillTagged }: CreatePostModalProps) {
  const { user, friends, createPost, completeMission } = useAppContext();
  const [description, setDescription] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [taggedFriend, setTaggedFriend] = useState<string | undefined>(prefillTagged);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update tagged friend if prefillTagged changes while modal opens
  useEffect(() => {
    if (isOpen) {
      setTaggedFriend(prefillTagged);
    } else {
      setTaggedFriend(undefined);
      setIsTagDropdownOpen(false);
    }
  }, [isOpen, prefillTagged]);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
  };

  const handlePost = () => {
    if (!mediaPreview && !description.trim()) {
      toast({
        title: "Empty Post",
        message: "Please add a photo, video, or caption to post.",
        icon: "bell"
      });
      return;
    }

    if (user) {
      const type = mediaType === "video" ? "video" : "reel";
      createPost({
        id: `post_${Date.now()}`,
        author: user,
        type,
        url: mediaPreview || "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=600&h=1000",
        likes: 0,
        comments: 0,
        description: taggedFriend ? `${description} (with @${taggedFriend})` : description
      });
      completeMission('create_post', 30);
    }

    toast({
      title: "Post Created!",
      message: `Your new post is now live on your feed${taggedFriend ? ` (with ${taggedFriend})` : ""}.`,
      icon: "bell"
    });
    setMediaPreview(null);
    setDescription("");
    setTaggedFriend(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[80dvh] sm:h-auto sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0 bg-slate-900/50">
          <h3 className="text-white font-bold tracking-tight">Create Post</h3>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3 items-start relative z-0">
            <textarea
              className="w-full bg-transparent text-white placeholder-slate-500 resize-none outline-none text-lg min-h-[100px]"
              placeholder="What's going on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {taggedFriend && (
              <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20 text-sm font-medium">
                <UserPlus className="w-4 h-4" />
                with {taggedFriend}
                <button onClick={() => setTaggedFriend(undefined)} className="hover:text-blue-300 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {mediaPreview ? (
            <div className="relative w-full aspect-[4/5] bg-black rounded-2xl overflow-hidden border border-slate-800">
              {mediaType === "video" ? (
                <video 
                  src={mediaPreview} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button 
                onClick={() => setMediaPreview(null)}
                className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex-1 w-full border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-500 p-8">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-center">Capture Photo or Video</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm font-bold transition-colors"
              >
                Open Camera
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/50">
          <div className="flex gap-2">
            <input 
              type="file" 
              accept="image/*,video/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-pink-500 hover:bg-pink-500/10 rounded-full transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button 
              onClick={() => {
                // If we specifically wanted to only choose from gallery
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                  // Reset capture attr after click so camera button works
                  setTimeout(() => fileInputRef.current?.setAttribute('capture', 'environment'), 100);
                }
              }}
              className="p-3 text-purple-500 hover:bg-purple-500/10 rounded-full transition-colors"
            >
              <ImageIcon className="w-6 h-6" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsTagDropdownOpen(v => !v)}
                className={`p-3 rounded-full transition-colors ${isTagDropdownOpen || taggedFriend ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:bg-slate-800"}`}
              >
                <UserPlus className="w-6 h-6" />
              </button>
              
              {isTagDropdownOpen && (
                 <div className="absolute bottom-full mb-2 left-0 w-56 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-xl py-2 z-50">
                   <div className="px-3 pb-2 mb-2 border-b border-slate-700/50 text-xs font-bold text-slate-400 uppercase tracking-widest">Tag a friend</div>
                   {friends.map(f => (
                     <button 
                       key={f.id} 
                       onClick={() => { setTaggedFriend(f.username); setIsTagDropdownOpen(false); }} 
                       className="w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors flex items-center gap-3"
                     >
                       <img src={f.avatar} alt={f.username} className="w-8 h-8 rounded-full bg-slate-900 object-cover" />
                       <span className="text-sm font-bold text-white">{f.username}</span>
                     </button>
                   ))}
                 </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handlePost}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-bold shadow-lg shadow-pink-500/20 hover:opacity-90 transition-opacity flex items-center gap-2 uppercase tracking-widest text-sm"
          >
            Post <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
