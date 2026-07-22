const fs = require('fs');
const file = 'src/components/SocialyzeSocial.tsx';
let content = fs.readFileSync(file, 'utf8');

const emptyState = `
          {groups.filter(g => g.members.includes(user?.id || '')).length === 0 && friends.filter(f => !showOnlineOnly || f.isOnline).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                <Users className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-300 font-bold mb-1">No friends found</p>
              <p className="text-slate-500 text-sm">Use the search bar above to find users</p>
            </div>
          )}
`;

content = content.replace(
  /          \{groups\.filter\(g => g\.members\.includes\(user\?\.id \|\| ''\)\)\.map\(\(group\) => \(/,
  emptyState + '\n          {groups.filter(g => g.members.includes(user?.id || \'\')).map((group) => ('
);

fs.writeFileSync(file, content);
console.log("Added empty state to social");
