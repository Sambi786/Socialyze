import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Send, SlidersHorizontal, Share2, Download, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "../lib/toast";
import { useAppContext } from "../AppContext";

interface FilterParams {
  sepia: number;
  hue: number;
  contrast: number;
  brightness: number;
}

const PRESET_FILTERS = [
  { name: "Normal", params: { sepia: 0, hue: 0, contrast: 100, brightness: 100 } },
  { name: "Cyberpunk", params: { sepia: 0, hue: 280, contrast: 150, brightness: 110 } },
  { name: "Vintage", params: { sepia: 80, hue: 0, contrast: 110, brightness: 90 } },
  { name: "Neon", params: { sepia: 0, hue: 320, contrast: 130, brightness: 120 } },
  { name: "Matrix", params: { sepia: 0, hue: 120, contrast: 140, brightness: 100 } },
];

export function ZocialyseCamera({ onClose, onSendToFriend }: { onClose: () => void, onSendToFriend: (friendId: string, customText: string) => void }) {
  const { createPost, user, friends } = useAppContext();
  const [filterParams, setFilterParams] = useState<FilterParams>(PRESET_FILTERS[0].params);
  const [selectedPreset, setSelectedPreset] = useState("Normal");
  const [showSliders, setShowSliders] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Try to access the real camera, fallback to a colorful placeholder if unavailable
    let activeStream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then(s => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => {
        console.log("No camera access, using fallback");
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const getFilterStyle = (params: FilterParams) => {
    return `sepia(${params.sepia}%) hue-rotate(${params.hue}deg) contrast(${params.contrast}%) brightness(${params.brightness}%)`;
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 600;
      canvas.height = video.videoHeight || 800;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.filter = getFilterStyle(filterParams);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL("image/jpeg"));
      }
    } else {
      // Fallback capture if no video stream
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = `hsl(${filterParams.hue}, 50%, 50%)`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 40px sans-serif";
          ctx.fillText("Virtual Snap", 200, 400);
          setCapturedImage(canvas.toDataURL("image/jpeg"));
        }
      }
    }
  };

  const handleCreatePost = () => {
    if (!user || !capturedImage) return;
    createPost({
      id: `post_${Date.now()}`,
      author: user,
      type: "reel",
      url: capturedImage,
      likes: 0,
      comments: 0,
      description: `Created with ${selectedPreset} filter! ✨`
    });
    toast({
      title: "Story Created!",
      message: "Your snap with filter has been shared.",
      icon: "camera"
    });
    onClose();
  };

  const handleSendAction = () => {
    if (!selectedFriend) return;
    onSendToFriend(selectedFriend, `I sent you a snap using ${selectedPreset} filter! 📸`);
    toast({
      title: "Snap Sent!",
      message: "Your filtered snap was sent to chat.",
      icon: "bell"
    });
    setShowSendModal(false);
    onClose();
  };

  if (capturedImage) {
    return (
      <div className="absolute inset-0 bg-black z-50 flex flex-col">
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={() => setCapturedImage(null)} className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-md">
            <X className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-md">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-4 bg-gradient-to-t from-black/80 to-transparent">
          <button 
            onClick={handleCreatePost}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-full py-4 font-bold transition-all flex items-center justify-center gap-2"
          >
            <ImageIcon className="w-5 h-5" />
            Post to Story
          </button>
          <button 
            onClick={() => setShowSendModal(true)}
            className="flex-1 bg-gradient-to-tr from-pink-500 to-blue-500 text-white rounded-full py-4 font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <Send className="w-5 h-5" />
            Send to Chat
          </button>
        </div>

        {/* Send Modal */}
        {showSendModal && (
          <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="bg-slate-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative animation-slide-up border border-slate-800">
              <button onClick={() => setShowSendModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">Send to...</h3>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto mb-6">
                {friends.map(friend => (
                  <button 
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${selectedFriend === friend.id ? 'bg-blue-500/20 border border-blue-500/50' : 'hover:bg-slate-800 border border-transparent'}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={friend.avatar} alt={friend.username} className="w-10 h-10 rounded-full" />
                      <span className="text-white font-bold">{friend.username}</span>
                    </div>
                    {selectedFriend === friend.id && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleSendAction}
                disabled={!selectedFriend}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Snap
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col overflow-hidden">
      {/* Viewport for camera/mock */}
      <div className="flex-1 relative bg-black">
        <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay 
          playsInline 
          muted
          style={{ filter: getFilterStyle(filterParams) }}
        />
        {/* Placeholder if video doesn't work */}
        {!stream && (
          <div 
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center"
            style={{ 
              background: `linear-gradient(${filterParams.hue}deg, rgba(236,72,153,1), rgba(59,130,246,1))`,
              filter: `sepia(${filterParams.sepia}%) contrast(${filterParams.contrast}%) brightness(${filterParams.brightness}%)`
            }}
          >
            <Camera className="w-20 h-20 text-white/50 mb-4 drop-shadow-xl" />
            <p className="text-white font-bold drop-shadow-lg text-lg">Virtual Camera</p>
            <p className="text-white/80 text-sm">Waiting for permission...</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <X className="w-6 h-6" />
          </button>
          <button onClick={() => setShowSliders(!showSliders)} className={`w-10 h-10 rounded-full ${showSliders ? 'bg-blue-500 text-white' : 'bg-black/30 text-white'} backdrop-blur-md flex items-center justify-center border border-white/20 transition-colors`}>
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Custom filter slider controls */}
        {showSliders && (
          <div className="absolute top-20 right-4 w-64 bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-5 space-y-4 shadow-2xl animation-slide-up">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-2">Custom Filter</h4>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-bold">Hue Rotate ({filterParams.hue}°)</label>
              <input type="range" min="0" max="360" value={filterParams.hue} onChange={e => {
                setFilterParams(p => ({ ...p, hue: parseInt(e.target.value) }));
                setSelectedPreset("Custom");
              }} className="w-full accent-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-bold">Contrast ({filterParams.contrast}%)</label>
              <input type="range" min="50" max="200" value={filterParams.contrast} onChange={e => {
                setFilterParams(p => ({ ...p, contrast: parseInt(e.target.value) }));
                setSelectedPreset("Custom");
              }} className="w-full accent-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-bold">Brightness ({filterParams.brightness}%)</label>
              <input type="range" min="50" max="150" value={filterParams.brightness} onChange={e => {
                setFilterParams(p => ({ ...p, brightness: parseInt(e.target.value) }));
                setSelectedPreset("Custom");
              }} className="w-full accent-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-bold">Sepia ({filterParams.sepia}%)</label>
              <input type="range" min="0" max="100" value={filterParams.sepia} onChange={e => {
                setFilterParams(p => ({ ...p, sepia: parseInt(e.target.value) }));
                setSelectedPreset("Custom");
              }} className="w-full accent-blue-500" />
            </div>
            <div className="pt-2 flex justify-between">
              <button 
                onClick={() => { setFilterParams(PRESET_FILTERS[0].params); setSelectedPreset("Normal"); }}
                className="text-xs text-pink-400 font-bold hover:text-pink-300"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowSliders(false)}
                className="text-xs text-white font-bold bg-white/20 px-3 py-1 rounded-full"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Bottom controls area */}
        <div className="absolute bottom-0 left-0 right-0 pb-10 flex flex-col items-center bg-gradient-to-t from-black/50 to-transparent">
          
          {/* Preset filters scrollable row */}
          <div className="w-full overflow-x-auto no-scrollbar mb-6 px-4">
            <div className="flex gap-4 min-w-max px-4">
              {PRESET_FILTERS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setFilterParams(preset.params);
                    setSelectedPreset(preset.name);
                    setShowSliders(false);
                  }}
                  className={`flex flex-col items-center gap-2 group transition-all`}
                >
                  <div className={`w-16 h-16 rounded-full border-[3px] flex items-center justify-center shadow-lg transition-all ${
                    selectedPreset === preset.name 
                      ? 'border-blue-500 scale-110 shadow-blue-500/50' 
                      : 'border-white/50 group-hover:border-white scale-100'
                  }`}>
                    <div 
                      className="w-14 h-14 rounded-full" 
                      style={{ 
                        background: 'linear-gradient(45deg, #f472b6, #3b82f6)',
                        filter: getFilterStyle(preset.params)
                      }} 
                    />
                  </div>
                  <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${
                    selectedPreset === preset.name ? 'text-blue-400' : 'text-white'
                  }`}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Capture button */}
          <button 
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center p-1 active:scale-95 transition-transform"
          >
            <div className="w-full h-full bg-white rounded-full" />
          </button>
          
        </div>
      </div>
    </div>
  );
}
