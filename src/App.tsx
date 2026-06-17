import React, { useState, useEffect } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { ZocialyseFeed } from "./components/ZocialyseFeed";
import { ZocialyseSocial } from "./components/ZocialyseSocial";
import { ZocialyseWatch } from "./components/ZocialyseWatch";
import { ZocialyseAI } from "./components/ZocialyseAI";
import { ZocialyseProfile } from "./components/ZocialyseProfile";
import { ToastContainer } from "./components/ToastContainer";
import { CreatePostModal } from "./components/CreatePostModal";
import { toast } from "./lib/toast";
import { Layers, MessageSquare, PlaySquare, Bot, UserCircle, Plus } from "lucide-react";
import { useAppContext } from "./AppContext";

type Tab = "feed" | "social" | "watch" | "ai" | "profile";

export default function App() {
  const { user, login: loginContext, friends, logout } = useAppContext();
  const isAuthenticated = !!user;
  const [currentTab, setCurrentTab] = useState<Tab>("feed");
  const [isTagModalOpen, setIsTagModalOpen] = useState<{isOpen: boolean, taggedFriend?: string}>({isOpen: false});

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate notifications
      const timeout1 = setTimeout(() => {
        toast({
          title: "🔥 Streak Alert!",
          message: "You have a 12 day streak with someone! Don't lose it!",
          icon: "flame"
        });
      }, 3000);

      const timeout2 = setTimeout(() => {
        const birthdayFriend = friends.find(f => f.birthDate);
        if (birthdayFriend) {
          toast({
            title: "🎉 Birthday Reminder",
            message: `It's ${birthdayFriend.username}'s birthday today! Wish them!`,
            icon: "gift"
          });
        }
      }, 15000);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
  }, [isAuthenticated, friends]);

  if (!isAuthenticated) {
    return <AuthScreen onLogin={(username, isRegister) => loginContext(username, isRegister)} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case "feed": return <ZocialyseFeed />;
      case "social": return <ZocialyseSocial onOpenCreatePost={(friendName) => setIsTagModalOpen({isOpen: true, taggedFriend: friendName})} />;
      case "watch": return <ZocialyseWatch />;
      case "ai": return <ZocialyseAI />;
      case "profile": return <ZocialyseProfile onLogout={logout} />;
    }
  };

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "feed", icon: <Layers className="w-6 h-6" />, label: "Reels" },
    { id: "social", icon: <MessageSquare className="w-6 h-6" />, label: "Chat" },
    { id: "watch", icon: <PlaySquare className="w-6 h-6" />, label: "Watch" },
    { id: "ai", icon: <Bot className="w-6 h-6" />, label: "AI" },
    { id: "profile", icon: <UserCircle className="w-6 h-6" />, label: "Profile" },
  ];

  return (
    <div className="flex bg-slate-950 h-[100dvh] w-full overflow-hidden font-sans">
      <ToastContainer />
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-24 bg-slate-900/50 backdrop-blur-md border-r border-slate-800 flex-col items-center py-6 gap-8 shrink-0 z-50">
        <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
          <span className="text-3xl font-black italic text-white flex items-center justify-center leading-none mt-1">Z</span>
        </div>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center gap-1.5 w-full transition-colors ${
                isActive ? "text-pink-500" : "text-slate-500 hover:text-pink-400"
              }`}
            >
              <div className={`${isActive ? "scale-110 drop-shadow-md" : "scale-100"} transition-transform duration-200`}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Main App Container */}
      <div className="flex-1 h-[100dvh] flex flex-col overflow-hidden relative w-full shadow-2xl shadow-indigo-500/10">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Global Floating Action Button for Create Post */}
        <button 
          onClick={() => setIsTagModalOpen({isOpen: true})}
          className="absolute bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform z-40"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden bg-slate-900/50 backdrop-blur-md border-t border-slate-800 px-2 py-3 flex justify-between items-center z-50 shrink-0 pb-safe">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex flex-col items-center gap-1 w-full transition-colors ${
                  isActive ? "text-pink-500" : "text-slate-500 hover:text-pink-400"
                }`}
              >
                <div className={`${isActive ? "scale-110 shadow-glow" : "scale-100"} transition-transform duration-200`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <CreatePostModal isOpen={isTagModalOpen.isOpen} prefillTagged={isTagModalOpen.taggedFriend} onClose={() => setIsTagModalOpen({isOpen: false})} />
    </div>
  );
}
