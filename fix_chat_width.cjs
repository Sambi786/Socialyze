const fs = require('fs');
const file = 'src/components/SocialyzeSocial.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="flex-1 overflow-y-auto p-4 space-y-4">/,
  '<div className="flex-1 overflow-y-auto p-4 space-y-4 w-full max-w-4xl mx-auto">'
);

content = content.replace(
  /<div className="p-4 bg-slate-900 border-t border-slate-800 pb-safe relative">/,
  '<div className="p-4 bg-slate-900 border-t border-slate-800 pb-safe relative z-20">\n            <div className="w-full max-w-4xl mx-auto">'
);

// Close the wrapper div before the closing of the input container
content = content.replace(
  /            <\/form>\n          <\/div>\n        <\/div>\n      <\/div>/,
  '            </form>\n            </div>\n          </div>\n        </div>\n      </div>'
);

fs.writeFileSync(file, content);
console.log("Updated chat width");
