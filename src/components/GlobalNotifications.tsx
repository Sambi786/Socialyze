import React, { useEffect, useRef } from "react";
import { toast } from "../lib/toast";
import { useAppContext } from "../AppContext";
import { Phone, PhoneOff, Video, MicOff } from "lucide-react";

export function GlobalNotifications() {
  const { user, users, messages, myActiveCall, answerCall, endCall, startCall, incomingCall, activeChatId, acceptFriendRequest, setActiveChatId, notifications, markNotificationRead } = useAppContext();
  const prevMessagesRef = useRef(messages);
  const prevFriendRequestsRef = useRef(user?.friendRequests || []);
  
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      notifications.forEach(notif => {
        toast({
          title: notif.title,
          message: notif.message,
          icon: notif.icon || 'bell'
        });
        markNotificationRead(notif.id);
      });
    }
  }, [notifications, markNotificationRead]);


  useEffect(() => {
    const prev = prevMessagesRef.current;
    
    // Check what changed
    Object.keys(messages).forEach(chatId => {
      const prevChatMsgs = prev[chatId] || [];
      const currentChatMsgs = messages[chatId] || [];
      
      if (currentChatMsgs.length > prevChatMsgs.length) {
        const newMsg = currentChatMsgs[currentChatMsgs.length - 1];
        if (newMsg.sender !== user?.id && chatId !== activeChatId) {
          const senderUser = users.find(u => u.id === newMsg.sender);
          if (senderUser) {
            toast({ 
              title: 'New Message', 
              message: `From ${senderUser.username}: ${newMsg.text}`, 
              icon: 'bell',
              onClick: () => {
                setActiveChatId(chatId);
                // Also trigger navigating to the chat tab if we can,
                // but we might not have access to setCurrentTab here.
                // We'll rely on the App listening to activeChatId or we'll trigger it.
                // We can dispatch a custom event.
                window.dispatchEvent(new CustomEvent('OPEN_CHAT', { detail: chatId }));
              }
            });
          }
        }
      }
    });
    
    prevMessagesRef.current = messages;
  }, [messages, user?.id, users, activeChatId]);

  useEffect(() => {
    const prev = prevFriendRequestsRef.current;
    const current = user?.friendRequests || [];
    
    if (current.length > prev.length) {
      const newRequests = current.filter(id => !prev.includes(id));
      newRequests.forEach(reqId => {
        const reqUser = users.find(u => u.id === reqId);
        if (reqUser) {
          toast({
            title: 'Friend Request',
            message: `${reqUser.username} sent you a friend request`,
            icon: 'bell',
            actionText: 'Accept',
            onClick: () => {
              window.dispatchEvent(new CustomEvent('OPEN_TAB', { detail: 'social' }));
            },
            onAction: () => acceptFriendRequest(reqId)
          });
        }
      });
    }
    prevFriendRequestsRef.current = current;
  }, [user?.friendRequests, users, acceptFriendRequest]);

  if (myActiveCall) {
    const otherUserId = myActiveCall.callerId === user?.id ? myActiveCall.receiverId : myActiveCall.callerId;
    const otherUser = users.find(u => u.id === otherUserId);
    if (otherUser) {
      const isRinging = myActiveCall.status === 'ringing';
      const isReceiver = myActiveCall.receiverId === user?.id;
      
      return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col pt-0 overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-[9999]">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-slate-950/90 pointer-events-none" />
          <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-8 border-4 border-indigo-500/50 shadow-[0_0_80px_rgba(99,102,241,0.4)] animate-pulse">
              <img src={otherUser.avatar} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">{otherUser.username}</h2>
            <p className="text-indigo-400 font-medium tracking-widest uppercase text-sm">
              {isRinging ? (isReceiver ? 'Incoming Call...' : 'Ringing...') : 'Connected in real time'}
            </p>
          </div>
          <div className="p-10 pb-safe flex justify-center gap-6 relative z-10 bg-gradient-to-t from-black to-transparent">
            {isRinging && isReceiver ? (
              <>
                <button onClick={() => endCall(myActiveCall.id)} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button onClick={() => answerCall(myActiveCall.id)} className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <Phone className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                <button className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
                  <MicOff className="w-6 h-6" />
                </button>
                <button className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
                  <Video className="w-6 h-6" />
                </button>
                <button onClick={() => endCall(myActiveCall.id)} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                  <PhoneOff className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      );
    }
  }

  return null;
}
