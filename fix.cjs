const fs = require('fs');
let content = fs.readFileSync('src/components/SocialyzeProfile.tsx', 'utf8');
content = content.replace(/\) : \(\s*\)\}/, ') : null}');
fs.writeFileSync('src/components/SocialyzeProfile.tsx', content);
console.log("Fixed");
