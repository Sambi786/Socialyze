const fs = require('fs');
const file = 'src/components/SocialyzeSocial.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove attachment menu
const attachRegex = /\{showAttachmentMenu && isGroup && \([\s\S]*?<\/div>\n            \)\}/;
content = content.replace(attachRegex, '');

// Remove the toggle button
const toggleRegex = /\{isGroup && \(\n                <button \n                  onClick=\{.*?\}\n                  className=\{.*?\}\n                >\n                  <Plus className="w-5 h-5 transition-transform" \/>\n                <\/button>\n              \)\}/;
content = content.replace(toggleRegex, '');

fs.writeFileSync(file, content);
console.log("Fixed attachment menu");
