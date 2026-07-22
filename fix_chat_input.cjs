const fs = require('fs');
const file = 'src/components/SocialyzeSocial.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="p-4 bg-slate-900 border-t border-slate-800 pb-safe relative">/,
  '<div className="p-4 bg-slate-900 border-t border-slate-800 pb-safe relative">\n            <div className="w-full max-w-4xl mx-auto relative">'
);

content = content.replace(
  /              <\/button>\n            <\/div>\n          <\/div>\n        \) : \(/,
  '              </button>\n            </div>\n            </div>\n          </div>\n        ) : ('
);

fs.writeFileSync(file, content);
console.log("Updated chat input width");
