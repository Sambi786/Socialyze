const fs = require('fs');
const file = 'src/components/SocialyzeSocial.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `                const nameChanged = groupSettingsName.trim() && groupSettingsName !== group.name;
                const avatarChanged = groupSettingsAvatar !== group.avatar;
                if (nameChanged || avatarChanged) {
                  updateGroup(group.id, { 
                    name: groupSettingsName.trim() || group.name, 
                    avatar: groupSettingsAvatar || group.avatar 
                  });
                }`,
  `                const nameChanged = groupSettingsName.trim() && groupSettingsName !== group.name;
                const avatarChanged = groupSettingsAvatar !== group.avatar;
                const descChanged = groupSettingsDescription !== (group.description || "");
                const themeChanged = groupSettingsTheme !== (group.theme || "default");
                const gameChanged = groupSettingsGame !== (group.activeGame || "none");
                
                if (nameChanged || avatarChanged || descChanged || themeChanged || gameChanged) {
                  updateGroup(group.id, { 
                    name: groupSettingsName.trim() || group.name, 
                    avatar: groupSettingsAvatar || group.avatar,
                    description: groupSettingsDescription,
                    theme: groupSettingsTheme,
                    activeGame: groupSettingsGame
                  });
                }`
);

fs.writeFileSync(file, content);
