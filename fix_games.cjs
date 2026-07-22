const fs = require('fs');
const file = 'src/components/SocialyzeGames.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="p-4 flex flex-col gap-4">/,
  '<div className="p-4 flex flex-col gap-4 max-w-4xl mx-auto w-full">'
);

fs.writeFileSync(file, content);
console.log("Updated games layout");
