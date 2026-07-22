import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { Camera, X, Send, SlidersHorizontal, Download, Image as ImageIcon, Pencil, Type, Clock, MapPin, Smile, Undo, Trash2, Check } from "lucide-react";
import { toast } from "../lib/toast";
import { useAppContext } from "../AppContext";

interface FilterParams {
  sepia: number;
  hue: number;
  contrast: number;
  brightness: number;
  frame?: string;
}

const PRESET_FILTERS: { name: string, params: FilterParams }[] = [
  { name: "Normal", params: { sepia: 0, hue: 0, contrast: 100, brightness: 100 } },
  { name: "Cyberpunk", params: { sepia: 0, hue: 280, contrast: 150, brightness: 110, frame: "cyberpunk" } },
  { name: "Vintage", params: { sepia: 80, hue: 0, contrast: 110, brightness: 90, frame: "vintage" } },
  { name: "Neon", params: { sepia: 0, hue: 320, contrast: 130, brightness: 120, frame: "neon" } },
  { name: "Matrix", params: { sepia: 0, hue: 120, contrast: 140, brightness: 100 } },
];

const STICKERS = ["😂", "❤️", "🔥", "✨", "😎", "🥺", "🎉", "💯", "💀", "✌️"];
const BRUSH_COLORS = ["#ffffff", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#000000"];

export function SocialyzeCamera({ onClose, onSendToFriend }: { onClose: () => void, onSendToFriend: (friendId: string, customText: string) => void }) {
  const { createPost, addStory, user, friends } = useAppContext();
  const [filterParams, setFilterParams] = useState<FilterParams>(PRESET_FILTERS[0].params);
  const [selectedPreset, setSelectedPreset] = useState("Normal");
  const [showSliders, setShowSliders] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedRawImage, setCapturedRawImage] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  
  // Editor State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[1]);
  const [brushSize, setBrushSize] = useState(5);
  const [textOverlays, setTextOverlays] = useState<{id: number, text: string, x: number, y: number}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [stickers, setStickers] = useState<{id: number, emoji: string, x: number, y: number}[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showTimePlace, setShowTimePlace] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
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
    if (videoRef.current && captureCanvasRef.current) {
      const video = videoRef.current;
      const canvas = captureCanvasRef.current;
      canvas.width = video.videoWidth || 600;
      canvas.height = video.videoHeight || 800;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.filter = "none";
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedRawImage(canvas.toDataURL("image/jpeg"));
        ctx.filter = getFilterStyle(filterParams);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add Frame if selected
        if (filterParams.frame === "cyberpunk") {
          ctx.strokeStyle = "#00ffff";
          ctx.lineWidth = 20;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        } else if (filterParams.frame === "vintage") {
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 10;
          ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        } else if (filterParams.frame === "neon") {
          ctx.strokeStyle = "#ff00ff";
          ctx.lineWidth = 15;
          ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }
        
        setCapturedImage(canvas.toDataURL("image/jpeg"));
      }
    } else {
      const canvas = captureCanvasRef.current;
      if (canvas) {
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = `hsl(${filterParams.hue}, 50%, 50%)`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          setCapturedRawImage(canvas.toDataURL("image/jpeg"));
          ctx.fillStyle = "#fff";
          ctx.font = "bold 40px sans-serif";
          ctx.fillText("Virtual Snap", 200, 400);
          setCapturedImage(canvas.toDataURL("image/jpeg"));
        }
      }
    }
  };

  // Drawing Handlers
  const startDrawing = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    setIsDrawing(true);
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY;
    setLastPos({
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    });
  };

  const draw = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode) return;
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  // Combine all layers before sending/saving
  const composeFinalImage = (): string | null => {
    if (!capturedImage) return null;
    const canvas = finalCanvasRef.current;
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Set canvas size to match the original capture
    const img = new Image();
    img.src = capturedImage;
    canvas.width = img.width || 600;
    canvas.height = img.height || 800;
    
    // Draw base image
    ctx.drawImage(img, 0, 0);
    
    // Draw drawings
    if (drawingCanvasRef.current) {
      ctx.drawImage(drawingCanvasRef.current, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw Text Overlays
    ctx.textAlign = "center";
    textOverlays.forEach(overlay => {
      ctx.font = "bold 40px sans-serif";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
      ctx.strokeText(overlay.text, overlay.x * canvas.width, overlay.y * canvas.height);
      ctx.fillText(overlay.text, overlay.x * canvas.width, overlay.y * canvas.height);
    });
    
    // Draw Stickers
    stickers.forEach(sticker => {
      ctx.font = "60px sans-serif";
      ctx.fillText(sticker.emoji, sticker.x * canvas.width, sticker.y * canvas.height);
    });
    
    // Draw Time & Place
    if (showTimePlace) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(20, 20, 250, 80);
      ctx.fillStyle = "white";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 40, 50);
      ctx.font = "16px sans-serif";
      ctx.fillText("📍 San Francisco, CA", 40, 80);
    }
    
    return canvas.toDataURL("image/jpeg");
  };

  const handleCreatePost = () => {
    const finalImg = composeFinalImage();
    if (!user || !finalImg) return;
    addStory(finalImg, "image");
    setCapturedImage(null);
    onClose();
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Saved to Gallery", message: "Downloaded successfully.", icon: "bell" });
  };

  const handleSendAction = () => {
    if (!selectedFriend) return;
    onSendToFriend(selectedFriend, `I sent you a snap using ${selectedPreset} filter! 📸`);
    toast({ title: "Snap Sent!", message: "Your snap was sent to chat.", icon: "bell" });
    setShowSendModal(false);
    onClose();
  };

  const addText = () => {
    if (currentText.trim()) {
      setTextOverlays([...textOverlays, { id: Date.now(), text: currentText, x: 0.5, y: 0.5 }]);
    }
    setCurrentText("");
    setIsTyping(false);
  };

  if (capturedImage) {
    return (
      <div className="absolute inset-0 bg-black z-50 flex flex-col">
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex justify-between items-start z-30">
          <button onClick={() => setCapturedImage(null)} className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-md">
            <X className="w-6 h-6" />
          </button>
          
          {/* Editor Tools */}
          <div className="flex flex-col gap-3">
            <button onClick={() => { setIsDrawingMode(!isDrawingMode); setShowStickerPicker(false); }} className={`w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors ${isDrawingMode ? 'bg-blue-500' : 'bg-black/50'}`}>
              <Pencil className="w-5 h-5" />
            </button>
            <button onClick={() => setIsTyping(true)} className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-md">
              <Type className="w-5 h-5" />
            </button>
            <button onClick={() => setShowStickerPicker(!showStickerPicker)} className={`w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-md ${showStickerPicker ? 'bg-pink-500' : 'bg-black/50'}`}>
              <Smile className="w-5 h-5" />
            </button>
            <button onClick={() => setShowTimePlace(!showTimePlace)} className={`w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-md ${showTimePlace ? 'bg-indigo-500' : 'bg-black/50'}`}>
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Drawing Controls (when drawing mode is active) */}
        {isDrawingMode && (
          <div className="absolute left-4 top-24 z-30 flex flex-col gap-2 bg-black/40 p-2 rounded-2xl backdrop-blur-md border border-white/10">
            {BRUSH_COLORS.map(c => (
              <button 
                key={c}
                onClick={() => setBrushColor(c)}
                className={`w-6 h-6 rounded-full border-2 ${brushColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <div className="w-full h-px bg-white/20 my-1" />
            <button onClick={() => {
              const canvas = drawingCanvasRef.current;
              const ctx = canvas?.getContext('2d');
              if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Undo className="w-3 h-3 text-white" />
            </button>
          </div>
        )}

        {/* Sticker Picker */}
        {showStickerPicker && (
          <div className="absolute right-16 top-24 z-30 bg-black/70 backdrop-blur-xl p-3 rounded-2xl border border-white/20 grid grid-cols-2 gap-2 shadow-2xl animation-slide-up">
            {STICKERS.map((emoji, i) => (
              <button 
                key={i} 
                className="text-3xl hover:scale-110 transition-transform p-2 bg-white/5 rounded-xl"
                onClick={() => {
                  setStickers([...stickers, { id: Date.now(), emoji, x: 0.5, y: 0.5 }]);
                  setShowStickerPicker(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Text Input Modal */}
        {isTyping && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-sm flex flex-col gap-4">
              <input 
                type="text" 
                autoFocus
                value={currentText}
                onChange={e => setCurrentText(e.target.value)}
                placeholder="Type something..."
                className="w-full bg-transparent text-white text-center text-4xl font-bold outline-none placeholder:text-white/30"
                onKeyDown={e => e.key === 'Enter' && addText()}
              />
              <button onClick={addText} className="mx-auto w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <Check className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
                
        {/* Main Canvas Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
          
          {/* Drawing Canvas */}
          <canvas 
            ref={drawingCanvasRef}
            className={`absolute inset-0 w-full h-full ${isDrawingMode ? 'z-20 cursor-crosshair' : 'z-10 pointer-events-none'}`}
            width={600}
            height={800}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          
          {/* Overlays (Text, Time, Stickers) - Visual only, baked in on export */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {showTimePlace && (
              <div className="absolute top-8 left-4 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white shadow-xl">
                <div className="text-2xl font-black flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="text-sm font-bold text-slate-300 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-pink-400" />
                  San Francisco, CA
                </div>
              </div>
            )}
            
            {textOverlays.map(text => (
              <div 
                key={text.id} 
                className="absolute text-4xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                style={{ left: `${text.x * 100}%`, top: `${text.y * 100}%`, transform: 'translate(-50%, -50%)' }}
              >
                {text.text}
              </div>
            ))}
            
            {stickers.map(sticker => (
              <div 
                key={sticker.id} 
                className="absolute text-6xl drop-shadow-xl"
                style={{ left: `${sticker.x * 100}%`, top: `${sticker.y * 100}%`, transform: 'translate(-50%, -50%)' }}
              >
                {sticker.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Canvas for Final Composite */}
        <canvas ref={finalCanvasRef} className="hidden" />

        <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe bg-gradient-to-t from-black/90 via-black/50 to-transparent z-30">
          <div className="flex gap-2 mb-4">
            {capturedRawImage && (
              <button onClick={() => downloadImage(capturedRawImage, 'snap-original.jpg')} className="px-3 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold backdrop-blur-md hover:bg-white/20 border border-white/10">
                <Download className="w-4 h-4 mr-1" /> Original
              </button>
            )}
            <button onClick={() => {
              const composite = composeFinalImage();
              if (composite) downloadImage(composite, 'snap-edited.jpg');
            }} className="px-3 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold backdrop-blur-md hover:bg-white/20 border border-white/10">
              <Download className="w-4 h-4 mr-1" /> Save
            </button>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleCreatePost}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-full py-4 font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <ImageIcon className="w-5 h-5" />
              Post to Story
            </button>
            <button 
              onClick={() => setShowSendModal(true)}
              className="flex-1 bg-gradient-to-tr from-pink-500 to-blue-500 text-white rounded-full py-4 font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
            >
              <Send className="w-5 h-5" />
              Send to Chat
            </button>
          </div>
        </div>

        {/* Send Modal */}
        {showSendModal && (
          <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="bg-slate-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative animation-slide-up border border-slate-800">
              <button onClick={() => setShowSendModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6">Send to...</h3>
              <div className="space-y-2 max-h-[50dvh] overflow-y-auto mb-6">
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
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
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
      <div className="flex-1 relative bg-black">
        <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay 
          playsInline 
          muted
          style={{ filter: getFilterStyle(filterParams) }}
        />
        
        {/* Filter Frames Overlay */}
        {filterParams.frame === "cyberpunk" && (
          <div className="absolute inset-0 pointer-events-none border-[12px] border-cyan-400 m-4 shadow-[0_0_20px_#00ffff_inset]" />
        )}
        {filterParams.frame === "vintage" && (
          <div className="absolute inset-0 pointer-events-none bg-black/20 border-8 border-white m-6 mix-blend-overlay" />
        )}
        {filterParams.frame === "neon" && (
          <div className="absolute inset-0 pointer-events-none border-8 border-fuchsia-500 shadow-[0_0_30px_#ff00ff_inset]" />
        )}

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
        
        <canvas ref={captureCanvasRef} className="hidden" />
        
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <X className="w-6 h-6" />
          </button>
          <button onClick={() => setShowSliders(!showSliders)} className={`w-10 h-10 rounded-full ${showSliders ? 'bg-blue-500 text-white' : 'bg-black/30 text-white'} backdrop-blur-md flex items-center justify-center border border-white/20 transition-colors`}>
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {showSliders && (
          <div className="absolute top-20 right-4 w-64 bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-5 space-y-4 shadow-2xl animation-slide-up z-20">
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

        <div className="absolute bottom-0 left-0 right-0 pb-10 flex flex-col items-center bg-gradient-to-t from-black/60 to-transparent">
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
                      className="w-14 h-14 rounded-full relative overflow-hidden" 
                      style={{ 
                        background: 'linear-gradient(45deg, #f472b6, #3b82f6)',
                        filter: getFilterStyle(preset.params)
                      }} 
                    >
                       {preset.params.frame === "cyberpunk" && <div className="absolute inset-0 border-2 border-cyan-400 m-1" />}
                       {preset.params.frame === "vintage" && <div className="absolute inset-0 border border-white m-1.5" />}
                       {preset.params.frame === "neon" && <div className="absolute inset-0 border-2 border-fuchsia-500" />}
                    </div>
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

          <button 
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center p-1 active:scale-95 transition-transform"
          >
            <div className="w-full h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
          </button>
          
        </div>
      </div>
    </div>
  );
}
