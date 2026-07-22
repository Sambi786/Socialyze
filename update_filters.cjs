const fs = require('fs');
const file = 'src/components/SocialyzeFilters.tsx';
let content = fs.readFileSync(file, 'utf8');

// I need to add state for activeFilter to show details.
content = content.replace(
  /  const \[activeTab, setActiveTab\] = useState<'marketplace' \| 'create'>\('marketplace'\);/,
  `  const [activeTab, setActiveTab] = useState<'marketplace' | 'create'>('marketplace');
  const [activeFilter, setActiveFilter] = useState<any>(null);
  const [commentInput, setCommentInput] = useState("");
  const [userRating, setUserRating] = useState(0);`
);

const modalCode = `
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
                      className={\`w-10 h-10 rounded-full flex items-center justify-center transition-all \${userRating >= star ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}\`}
                    >
                      <Star className={\`w-5 h-5 \${userRating >= star ? 'fill-current' : ''}\`} />
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
`;

content = content.replace(
  /      <div className="flex-1 overflow-y-auto">/,
  modalCode + '\n      <div className="flex-1 overflow-y-auto">'
);

// add onClick to open modal
content = content.replace(
  /<div key=\{filter\.id\} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-pink-500\/50 transition-colors group">/g,
  '<div key={filter.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-pink-500/50 transition-colors group cursor-pointer shadow-lg" onClick={() => setActiveFilter(filter)}>'
);

fs.writeFileSync(file, content);
console.log("Updated Filters modal");
