const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, arrayUnion, arrayRemove } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "ai-studio-socialyze-70f5baed-44f0-44bc-82b9-5ff0a1b663b8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const usersSnap = await getDocs(collection(db, 'users'));
  const allUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  for (const user of allUsers) {
    const userRef = doc(db, 'users', user.id);
    const myFriends = user.friends || [];
    const myFriendRequests = user.friendRequests || [];

    for (const friendId of myFriends) {
      const friend = allUsers.find(u => u.id === friendId);
      if (friend && !(friend.friends || []).includes(user.id)) {
        console.log(`Fixing: ${friendId} should have ${user.id} in friends`);
        await updateDoc(doc(db, 'users', friendId), {
          friends: arrayUnion(user.id),
          friendRequests: arrayRemove(user.id)
        });
      }
    }
  }
  console.log("Done");
}

run().catch(console.error);
