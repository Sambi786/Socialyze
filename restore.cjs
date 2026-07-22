const fs = require('fs');

let file = 'src/components/SocialyzeFeed.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /<span className="text-white text-xs font-bold drop-shadow-md">Share<\/span>\n                  <\/div>/g,
  '<span className="text-white text-xs font-bold drop-shadow-md">Share</span>\n                  </div>\n                  <div \n                    className="flex flex-col items-center gap-1 group cursor-pointer pt-2"\n                    onClick={() => toast({ title: "More Options", message: "Additional options are coming soon.", icon: "bell" })}\n                  >\n                    <MoreVertical className="w-6 h-6 text-white" />\n                  </div>'
);
fs.writeFileSync(file, content);

file = 'src/components/SocialyzeWatch.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /<ReactionButton /g,
  '<MoreVertical \n                  className="w-5 h-5 text-slate-500 mb-2 cursor-pointer hover:text-white transition-colors" \n                  onClick={(e) => { e.stopPropagation(); toast({ title: "More Options", message: "Video options coming soon.", icon: "bell" }) }}\n                />\n                <ReactionButton '
);
fs.writeFileSync(file, content);

file = 'src/components/SocialyzeSocial.tsx';
content = fs.readFileSync(file, 'utf8');
const toggleCode = `{isGroup && (
                <button 
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className={\`p-3 rounded-full transition-all shrink-0 \${showAttachmentMenu ? 'bg-indigo-500 text-white rotate-45 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}\`}
                >
                  <Plus className="w-5 h-5 transition-transform" />
                </button>
              )}`;
content = content.replace(
  /\{isGroup && \(\n                <button \n                  onClick=\{\(\) => setShowAttachmentMenu\(!showAttachmentMenu\)\}/,
  ''
); // just in case
content = content.replace(
  /            <div className="flex items-center gap-2 relative z-10">/,
  `            <div className="flex items-center gap-2 relative z-10">\n              ${toggleCode}`
);
fs.writeFileSync(file, content);

console.log("Restored buttons");
