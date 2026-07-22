const fs = require('fs');
const file = 'src/AppContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// Also filter out undefined from participants in sendMessage
const sendReplacement = `    if (!chatDoc.exists()) {
      let participants = [user.id, chatId];
      if (isGroup) {
        const group = groups.find(g => g.id === chatId);
        participants = (group && group.members) ? group.members : [user.id];
      }
      
      participants = participants.filter(Boolean); // Safe guard against undefined

      await setDoc(chatRef, {
        participants,
        groupId: isGroup ? chatId : null,
        messages: [msg]
      });`;

content = content.replace(/    if \(\!chatDoc\.exists\(\)\) \{[\s\S]*?messages\: \[msg\]\n      \}\)\;/m, sendReplacement);
fs.writeFileSync(file, content);
console.log("Patched participants");
