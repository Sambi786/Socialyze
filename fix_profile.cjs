const fs = require('fs');
const file = 'src/components/SocialyzeProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '{profileUser.socialLinks && (',
  '{profileUser.socialLinks && (profileUser.socialLinks.youtube || profileUser.socialLinks.facebook || profileUser.socialLinks.snapchat || profileUser.socialLinks.discord) && ('
);

content = content.replace(
  '<p className="text-slate-400 text-sm mb-4 font-medium flex items-center gap-1">\n          {isOwnProfile ? "The all-in-one social user." : "Social user."}',
  '<p className="text-slate-400 text-sm mb-4 font-medium flex flex-col items-center gap-2">\n          <span className="text-center">{profileUser.bio || (isOwnProfile ? "The all-in-one social user." : "Social user.")}</span>'
);

fs.writeFileSync(file, content);
console.log("Fixed profile empty sections");
