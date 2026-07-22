const fs = require('fs');
const file = 'src/components/SocialyzeProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

// I will import lucide icons for social media, although lucide doesn't have brand icons except a few, so we'll use placeholder text or custom SVGs. Wait, Lucide has Youtube, Facebook, Twitch, Twitter. Discord and Snapchat might not be there. We can use generic icons or text.
// Let's check if the user object has socialLinks.
const socialBlock = `
        {profileUser.socialLinks && (
          <div className="mt-6 w-full max-w-md px-6 flex justify-center gap-4">
            {profileUser.socialLinks.youtube && (
              <a href={\`https://youtube.com/@\${profileUser.socialLinks.youtube}\`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="YouTube">YT</a>
            )}
            {profileUser.socialLinks.facebook && (
              <a href={\`https://facebook.com/\${profileUser.socialLinks.facebook}\`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors" title="Facebook">FB</a>
            )}
            {profileUser.socialLinks.snapchat && (
              <a href={\`https://snapchat.com/add/\${profileUser.socialLinks.snapchat}\`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-yellow-400/20 text-yellow-500 border border-yellow-400/30 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors font-bold" title="Snapchat">SC</a>
            )}
            {profileUser.socialLinks.discord && (
              <a href="#" className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-colors" title={\`Discord: \${profileUser.socialLinks.discord}\`}>DC</a>
            )}
          </div>
        )}
`;

content = content.replace(
  /        \{profileUser\.achievements && profileUser\.achievements\.length > 0 && \(/,
  socialBlock + '\n        {profileUser.achievements && profileUser.achievements.length > 0 && ('
);

fs.writeFileSync(file, content);
console.log("Updated SocialyzeProfile.tsx");
