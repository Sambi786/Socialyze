import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Star, MessageSquare, Download, Share2, Upload, SlidersHorizontal, Wand2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { toast } from '../lib/toast';

export function SocialyzeFilters() {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'create'>('marketplace');
  const [activeFilter, setActiveFilter] = useState<any>(null);
  const [commentInput, setCommentInput] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [filters, setFilters] = useState([
    { id: 1, name: "Neon Glow", author: "cyber_punk", rating: 4.8, downloads: 12450, params: { hue: 280, contrast: 150, brightness: 120, sepia: 0, frame: 'neon' }, comments: [] },
    { id: 2, name: "Vintage Dream", author: "retro_lover", rating: 4.5, downloads: 8300, params: { hue: 30, contrast: 90, brightness: 110, sepia: 60, frame: 'vintage' }, comments: [] },
    { id: 3, name: "Cyber Glitch", author: "hax0r", rating: 4.9, downloads: 25000, params: { hue: 180, contrast: 200, brightness: 90, sepia: 0, frame: 'cyberpunk' }, comments: [] },
    { id: 4, name: "Golden Hour", author: "sunshine_gal", rating: 4.7, downloads: 15200, params: { hue: 45, contrast: 110, brightness: 130, sepia: 20, frame: 'none' }, comments: [] }
  ]);

  const [filterParams, setFilterParams] = useState({ hue: 0, contrast: 100, brightness: 100, sepia: 0, frame: 'none' });
  const [filterName, setFilterName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (activeTab === 'create') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (e) {
      console.log('Camera error', e);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const getFilterStyle = (params: any) => {
    return `hue-rotate(${params.hue}deg) contrast(${params.contrast}%) brightness(${params.brightness}%) sepia(${params.sepia}%)`;
  };

  const handlePublish = () => {
    if (!filterName.trim()) {
      toast({ title: "Error", message: "Please enter a filter name", icon: "bell" });
      return;
    }
    setFilters([{
      id: Date.now(),
      name: filterName,
      author: user?.username || "You",
      rating: 0,
      downloads: 0,
      params: { ...filterParams },
      comments: []
    }, ...filters]);
    toast({ title: "Published!", message: "Your filter is now in the marketplace", icon: "bell" });
    setActiveTab('marketplace');
    setFilterName("");
  };

  return (
    <div className="flex-1 w-full h-full bg-slate-950 flex flex-col text-white overflow-hidden relative">
      <div className="p-4 pt-safe flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
        <h1 className="text-xl font-black uppercase flex items-center gap-2">
          <Wand2 className="text-pink-500 w-6 h-6" /> Filters
        </h1>
        <div className="flex bg-slate-800 rounded-full p-1">
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'marketplace' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Marketplace
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'create' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Create
          </button>
        </div>
      </div>


      {activeFilter && (
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <h2 className="font-bold text-xl text-white">{activeFilter.name}</h2>
              <button onClick={() => setActiveFilter(null)} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex flex-col gap-6">
              <div className="h-64 rounded-2xl relative overflow-hidden bg-slate-800 shrink-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80)',
                    filter: getFilterStyle(activeFilter.params)
                  }} 
                />
                {activeFilter.params.frame === "cyberpunk" && <div className="absolute inset-0 border-[8px] border-cyan-400 m-2 shadow-[0_0_10px_#00ffff_inset]" />}
                {activeFilter.params.frame === "vintage" && <div className="absolute inset-0 bg-black/20 border-4 border-white m-4 mix-blend-overlay" />}
                {activeFilter.params.frame === "neon" && <div className="absolute inset-0 border-4 border-fuchsia-500 shadow-[0_0_15px_#ff00ff_inset]" />}
              </div>
              
              <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                 <div>
                   <p className="text-sm text-slate-400 font-bold mb-1">Created by @{activeFilter.author}</p>
                   <div className="flex items-center gap-1">
                     <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                     <span className="font-bold text-lg">{activeFilter.rating.toFixed(1)}</span>
                     <span className="text-xs text-slate-500 ml-1">({activeFilter.downloads} downloads)</span>
                   </div>
                 </div>
                 <button 
                   onClick={() => {
                     toast({title: "Filter Applied", message: "Open camera to try it out!", icon: "bell"});
                     setActiveFilter(null);
                   }}
                   className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2"
                 >
                   <Download className="w-5 h-5" /> Try Filter
                 </button>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500"/> Rate this filter</h3>
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      onClick={() => {
                        setUserRating(star);
                        const updated = filters.map(f => f.id === activeFilter.id ? { ...f, rating: ((f.rating * 10) + star) / 11 } : f);
                        setFilters(updated);
                        setActiveFilter(updated.find(f => f.id === activeFilter.id));
                        toast({title: "Thanks for rating!", message: "Your feedback helps the creator.", icon: "bell"});
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${userRating >= star ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                    >
                      <Star className={`w-5 h-5 ${userRating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-400"/> Comments</h3>
                <div className="space-y-4 mb-4 max-h-40 overflow-y-auto pr-2">
                  {activeFilter.comments.length === 0 ? (
                    <p className="text-slate-500 text-sm italic text-center py-4">No comments yet. Be the first!</p>
                  ) : (
                    activeFilter.comments.map((comment: any, i: number) => (
                      <div key={i} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                        <span className="text-xs font-bold text-pink-400 block mb-1">@{comment.user}</span>
                        <span className="text-sm text-slate-200">{comment.text}</span>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && commentInput.trim()) {
                        const newComment = { user: user?.username || "You", text: commentInput.trim() };
                        const updated = filters.map(f => f.id === activeFilter.id ? { ...f, comments: [...f.comments, newComment] } : f);
                        setFilters(updated);
                        setActiveFilter(updated.find(f => f.id === activeFilter.id));
                        setCommentInput("");
                      }
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-500"
                  />
                  <button 
                    disabled={!commentInput.trim()}
                    onClick={() => {
                      const newComment = { user: user?.username || "You", text: commentInput.trim() };
                      const updated = filters.map(f => f.id === activeFilter.id ? { ...f, comments: [...f.comments, newComment] } : f);
                      setFilters(updated);
                      setActiveFilter(updated.find(f => f.id === activeFilter.id));
                      setCommentInput("");
                    }}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 rounded-full font-bold transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'marketplace' ? (
          <div className="p-4 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4 bg-slate-900 rounded-2xl px-4 py-3 border border-slate-800">
              <Search className="w-5 h-5 text-slate-500" />
              <input type="text" placeholder="Search filters..." className="bg-transparent border-none outline-none flex-1 text-sm font-medium" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filters.map(filter => (
                <div key={filter.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-pink-500/50 transition-colors group cursor-pointer shadow-lg" onClick={() => setActiveFilter(filter)}>
                  <div className="h-48 relative overflow-hidden bg-slate-800 flex items-center justify-center">
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ 
                        backgroundImage: 'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80)',
                        filter: getFilterStyle(filter.params)
                      }} 
                    />
                    {filter.params.frame === "cyberpunk" && <div className="absolute inset-0 border-[8px] border-cyan-400 m-2 shadow-[0_0_10px_#00ffff_inset]" />}
                    {filter.params.frame === "vintage" && <div className="absolute inset-0 bg-black/20 border-4 border-white m-4 mix-blend-overlay" />}
                    {filter.params.frame === "neon" && <div className="absolute inset-0 border-4 border-fuchsia-500 shadow-[0_0_15px_#ff00ff_inset]" />}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm gap-4">
                       <button className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-white">
                         <Download className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{filter.name}</h3>
                        <p className="text-xs text-slate-400 font-medium">by @{filter.author}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-xs font-bold">
                        <Star className="w-3 h-3 fill-current" /> {filter.rating.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 border-t border-slate-800 pt-3">
                      <div className="flex gap-3 text-slate-400 text-xs font-medium">
                        <span className="flex items-center gap-1"><Download className="w-3 h-3"/> {(filter.downloads / 1000).toFixed(1)}k</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/> {filter.comments.length}</span>
                      </div>
                      <button className="text-pink-400 text-xs font-bold uppercase hover:text-pink-300">Try Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col md:flex-row max-w-6xl mx-auto w-full p-4 gap-6">
            <div className="flex-1 bg-black rounded-3xl overflow-hidden relative min-h-[400px] border border-slate-800 shadow-2xl">
              <video 
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay playsInline muted
                style={{ filter: getFilterStyle(filterParams) }}
              />
              {filterParams.frame === "cyberpunk" && <div className="absolute inset-0 border-[12px] border-cyan-400 m-4 shadow-[0_0_20px_#00ffff_inset] pointer-events-none" />}
              {filterParams.frame === "vintage" && <div className="absolute inset-0 bg-black/20 border-8 border-white m-6 mix-blend-overlay pointer-events-none" />}
              {filterParams.frame === "neon" && <div className="absolute inset-0 border-8 border-fuchsia-500 shadow-[0_0_30px_#ff00ff_inset] pointer-events-none" />}
              
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                  <Camera className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400 font-bold">Waiting for camera...</p>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shrink-0 h-min">
              <div>
                <h3 className="font-bold text-lg mb-1">Filter Studio</h3>
                <p className="text-xs text-slate-400">Design your custom visual filter</p>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Filter Name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                    <span>Hue Rotate</span> <span>{filterParams.hue}°</span>
                  </label>
                  <input type="range" min="0" max="360" value={filterParams.hue} onChange={e => setFilterParams(p => ({...p, hue: parseInt(e.target.value)}))} className="w-full accent-pink-500" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                    <span>Contrast</span> <span>{filterParams.contrast}%</span>
                  </label>
                  <input type="range" min="50" max="200" value={filterParams.contrast} onChange={e => setFilterParams(p => ({...p, contrast: parseInt(e.target.value)}))} className="w-full accent-pink-500" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                    <span>Brightness</span> <span>{filterParams.brightness}%</span>
                  </label>
                  <input type="range" min="50" max="150" value={filterParams.brightness} onChange={e => setFilterParams(p => ({...p, brightness: parseInt(e.target.value)}))} className="w-full accent-pink-500" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                    <span>Sepia</span> <span>{filterParams.sepia}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={filterParams.sepia} onChange={e => setFilterParams(p => ({...p, sepia: parseInt(e.target.value)}))} className="w-full accent-pink-500" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Frame Style</label>
                  <div className="flex gap-2">
                    {['none', 'cyberpunk', 'vintage', 'neon'].map(frame => (
                      <button 
                        key={frame}
                        onClick={() => setFilterParams(p => ({...p, frame}))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase border transition-colors ${filterParams.frame === frame ? 'bg-pink-500/20 border-pink-500 text-pink-500' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                      >
                        {frame === 'none' ? 'None' : frame.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handlePublish}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-bold tracking-widest uppercase shadow-lg shadow-pink-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
              >
                <Upload className="w-5 h-5" /> Publish to Market
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
