const fs = require('fs');

const attachCode = `{showAttachmentMenu && isGroup && (
              <div className="absolute bottom-[calc(100%+8px)] left-4 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-2 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 z-50">
                <button onClick={() => { setShowAttachmentMenu(false); toast({title:"Media", message:"Gallery & Camera coming soon", icon:"bell"}) }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 rounded-2xl transition-all text-white text-sm font-bold w-full group">
                  <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all"><ImageIcon className="w-5 h-5"/></div>
                  Media <span className="text-[10px] text-slate-500 ml-auto font-normal whitespace-nowrap">Gallery, Cam & Snap</span>
                </button>
                <button onClick={() => { setShowAttachmentMenu(false); toast({title:"Poll", message:"Poll coming soon", icon:"bell"}) }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 rounded-2xl transition-all text-white text-sm font-bold w-full group">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all"><BarChart2 className="w-5 h-5"/></div>
                  Poll
                </button>
                <button onClick={() => { setShowAttachmentMenu(false); toast({title:"Quiz", message:"Quiz coming soon", icon:"bell"}) }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 rounded-2xl transition-all text-white text-sm font-bold w-full group">
                  <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all"><HelpCircle className="w-5 h-5"/></div>
                  Quiz
                </button>
                <button onClick={() => { setShowAttachmentMenu(false); toast({title:"Question", message:"Question coming soon", icon:"bell"}) }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 rounded-2xl transition-all text-white text-sm font-bold w-full group">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all"><Lightbulb className="w-5 h-5"/></div>
                  Question
                </button>
              </div>
            )}`;

let file = 'src/components/SocialyzeSocial.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="w-full max-w-4xl mx-auto">/,
  '<div className="w-full max-w-4xl mx-auto">\n            ' + attachCode
);

fs.writeFileSync(file, content);
console.log("Restored attachment menu");
