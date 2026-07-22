const fs = require('fs');

let file = 'src/components/SocialyzeFeed.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /<div \n                    className="flex flex-col items-center gap-1 group cursor-pointer pt-2"\n                    onClick=\{\(\) => toast\(\{ title: "More Options", message: "Additional options are coming soon.", icon: "bell" \}\)\}\n                  >\n                    <MoreVertical className="w-6 h-6 text-white" \/>\n                  <\/div>/g,
  ''
);
fs.writeFileSync(file, content);

file = 'src/components/SocialyzeWatch.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /<MoreVertical \n                  className="w-5 h-5 text-slate-500 mb-2 cursor-pointer hover:text-white transition-colors" \n                  onClick=\{\(e\) => \{ e\.stopPropagation\(\); toast\(\{ title: "More Options", message: "Video options coming soon.", icon: "bell" \}\) \}\}\n                \/>/g,
  ''
);
fs.writeFileSync(file, content);

console.log("Removed coming soon options");
