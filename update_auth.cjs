const fs = require('fs');
const file = 'src/components/AuthScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const [avatarUrl, setAvatarUrl] = useState("");',
  `const [avatarUrl, setAvatarUrl] = useState("");
  
  // New Setup States
  const [setupStep, setSetupStep] = useState(1);
  const [socialLinks, setSocialLinks] = useState({ youtube: "", facebook: "", snapchat: "", discord: "" });
  const [preferences, setPreferences] = useState({ notifications: true, privateProfile: false });`
);

content = content.replace(
  /      const newUser = \{\n        id: firebaseUser\.uid,\n        username: username\.trim\(\),\n        avatar: avatarUrl\.trim\(\) \|\| defaultAvatar,\n        bio: bio\.trim\(\),\n        email: firebaseUser\.email \|\| "",\n        streaks: 0,\n        friends: \[\]\n      \};/,
  `      const newUser = {
        id: firebaseUser.uid,
        username: username.trim(),
        avatar: avatarUrl.trim() || defaultAvatar,
        bio: bio.trim(),
        email: firebaseUser.email || "",
        streaks: 0,
        friends: [],
        socialLinks,
        preferences
      };`
);

const newSetupForm = `
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3].map(step => (
                <div key={step} className={\`w-2.5 h-2.5 rounded-full transition-colors \${setupStep >= step ? 'bg-pink-500' : 'bg-slate-700'}\`} />
              ))}
            </div>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (setupStep < 3) setSetupStep(setupStep + 1); else handleProfileSetup(); }}>
              {setupStep === 1 && (
                <div className="animate-fade-in">
                  <div className="flex flex-col items-center mb-6 gap-3">
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-lg shadow-black/50">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    <input 
                      type="text" 
                      placeholder="Avatar URL (Optional)" 
                      value={avatarUrl} 
                      onChange={e => setAvatarUrl(e.target.value)} 
                      className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:border-pink-500/50 transition-all font-medium text-white shadow-inner text-sm text-center" 
                    />
                  </div>
                  
                  <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-pink-500/50 transition-all font-medium text-white shadow-inner mb-4"
                  />
                  
                  <textarea 
                    placeholder="Short bio (Optional)" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all font-medium text-white shadow-inner resize-none h-24"
                  />
                </div>
              )}
              
              {setupStep === 2 && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-white font-bold text-lg mb-4">Link Social Accounts</h3>
                  <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl px-4 py-2">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">YT</div>
                    <input type="text" placeholder="YouTube Username" value={socialLinks.youtube} onChange={e => setSocialLinks({...socialLinks, youtube: e.target.value})} className="bg-transparent border-none outline-none text-white flex-1" />
                  </div>
                  <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl px-4 py-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">FB</div>
                    <input type="text" placeholder="Facebook Username" value={socialLinks.facebook} onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} className="bg-transparent border-none outline-none text-white flex-1" />
                  </div>
                  <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl px-4 py-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-xs">SC</div>
                    <input type="text" placeholder="Snapchat Username" value={socialLinks.snapchat} onChange={e => setSocialLinks({...socialLinks, snapchat: e.target.value})} className="bg-transparent border-none outline-none text-white flex-1" />
                  </div>
                  <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-2xl px-4 py-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">DC</div>
                    <input type="text" placeholder="Discord Username" value={socialLinks.discord} onChange={e => setSocialLinks({...socialLinks, discord: e.target.value})} className="bg-transparent border-none outline-none text-white flex-1" />
                  </div>
                </div>
              )}
              
              {setupStep === 3 && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-white font-bold text-lg mb-4">Preferences</h3>
                  <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-2xl px-5 py-4">
                    <div>
                      <div className="text-white font-bold">Push Notifications</div>
                      <div className="text-slate-400 text-xs">Receive alerts for messages and likes</div>
                    </div>
                    <button type="button" onClick={() => setPreferences({...preferences, notifications: !preferences.notifications})} className={\`w-12 h-6 rounded-full transition-colors relative \${preferences.notifications ? 'bg-pink-500' : 'bg-slate-700'}\`}>
                      <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-all \${preferences.notifications ? 'left-7' : 'left-1'}\`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-2xl px-5 py-4">
                    <div>
                      <div className="text-white font-bold">Private Profile</div>
                      <div className="text-slate-400 text-xs">Only friends can see your posts</div>
                    </div>
                    <button type="button" onClick={() => setPreferences({...preferences, privateProfile: !preferences.privateProfile})} className={\`w-12 h-6 rounded-full transition-colors relative \${preferences.privateProfile ? 'bg-pink-500' : 'bg-slate-700'}\`}>
                      <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-all \${preferences.privateProfile ? 'left-7' : 'left-1'}\`} />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                {setupStep > 1 && (
                  <button type="button" onClick={() => setSetupStep(setupStep - 1)} className="px-6 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors uppercase tracking-widest text-sm">
                    Back
                  </button>
                )}
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl tracking-widest uppercase text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  {setupStep < 3 ? "Next" : "Complete Setup"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
`;

const oldFormRegex = /<form className="space-y-4" onSubmit=\{\(e\) => \{ e\.preventDefault\(\); handleProfileSetup\(\); \}\}>[\s\S]*?<\/form>/;
content = content.replace(oldFormRegex, newSetupForm);

fs.writeFileSync(file, content);
console.log("Updated AuthScreen onboarding flow");
