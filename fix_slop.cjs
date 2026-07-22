const fs = require('fs');

const files = [
  'src/components/CricketLeague.tsx',
  'src/components/DailyMissions.tsx',
  'src/components/SocialyzeProfile.tsx',
  'src/components/SocialyzeSocial.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Specifically removing the glowing background empty divs
    content = content.replace(/<div className="absolute[^>]*blur[^>]*><\/div>/g, '');
    content = content.replace(/<div className="absolute[^>]*blur[^>]*>\s*<\/div>/g, '');
    content = content.replace(/<div className="h-full bg-gradient-to-r[^>]*><\/div>/g, '');
    content = content.replace(/<div className="w-10 h-10"><\/div>/g, ''); // the empty spacer
    
    fs.writeFileSync(file, content);
  }
});

console.log("Removed visual empty divs");
