import React, { useState, useEffect } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { SocialyzeFeed } from "./components/SocialyzeFeed";
import { SocialyzeSocial } from "./components/SocialyzeSocial";
import { SocialyzeWatch } from "./components/SocialyzeWatch";
import { SocialyzeAI } from "./components/SocialyzeAI";
import { SocialyzeProfile } from "./components/SocialyzeProfile";
import { ToastContainer } from "./components/ToastContainer";
import { CreatePostModal } from "./components/CreatePostModal";
import { toast } from "./lib/toast";
import { playNotificationSound } from "./lib/audio";
import { Layers, MessageSquare, PlaySquare, Bot, UserCircle, Plus, Gamepad2 } from "lucide-react";
import { useAppContext } from "./AppContext";
import { SocialyzeGames } from "./components/SocialyzeGames";
import { Logo } from "./components/Logo";

type Tab = "feed" | "social" | "watch" | "ai" | "profile" | "games";

export default function App() {
  const { user, login: loginContext, friends, logout, updateUser } = useAppContext();
  const isAuthenticated = !!user;
  const [currentTab, setCurrentTab] = useState<Tab>("feed");
  const [isTagModalOpen, setIsTagModalOpen] = useState<{isOpen: boolean, taggedFriend?: string}>({isOpen: false});
  
  // Walkthrough state
  const [walkthroughStep, setWalkthroughStep] = useState(-1);

  useEffect(() => {
    if (isAuthenticated && user && !user.hasSeenWalkthrough) {
      setWalkthroughStep(0);
    }
  }, [isAuthenticated, user?.hasSeenWalkthrough]);

  const handleNextWalkthroughStep = () => {
    if (walkthroughStep < 5) {
      setWalkthroughStep(prev => prev + 1);
    } else {
      setWalkthroughStep(-1);
      updateUser({ hasSeenWalkthrough: true });
    }
  };

  const handleSkipWalkthrough = () => {
    setWalkthroughStep(-1);
    updateUser({ hasSeenWalkthrough: true });
  };

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
          playNotificationSound();
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

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "feed", icon: <Layers className="w-6 h-6" />, label: "Posts" },
    { id: "social", icon: <MessageSquare className="w-6 h-6" />, label: "Chat" },
    { id: "watch", icon: <PlaySquare className="w-6 h-6" />, label: "Watch" },
    { id: "ai", icon: <Bot className="w-6 h-6" />, label: "AI" },
    { id: "games", icon: <Gamepad2 className="w-6 h-6" />, label: "Games" },
    { id: "profile", icon: <UserCircle className="w-6 h-6" />, label: "Profile" },
  ];

  useEffect(() => {
    if (walkthroughStep >= 0 && walkthroughStep < tabs.length) {
      setCurrentTab(tabs[walkthroughStep].id);
    }
  }, [walkthroughStep]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case "feed": return <SocialyzeFeed />;
      case "social": return <SocialyzeSocial onOpenCreatePost={(friendName) => setIsTagModalOpen({isOpen: true, taggedFriend: friendName})} />;
      case "watch": return <SocialyzeWatch />;
      case "ai": return <SocialyzeAI />;
      case "games": return <SocialyzeGames onExit={() => setCurrentTab('feed')} />;
      case "profile": return <SocialyzeProfile onLogout={logout} onNavigateToPost={(type) => {
        if (type === 'video' || type === 'live') setCurrentTab('watch');
        else setCurrentTab('feed');
      }} />;
    }
  };

  return (
    <div className="flex bg-slate-950 h-[100dvh] w-full overflow-hidden font-sans">
      <ToastContainer />
      {/* Desktop Sidebar Navigation */}
      {currentTab !== 'games' && (
        <aside className="hidden md:flex w-24 bg-slate-900/50 backdrop-blur-md border-r border-slate-800 flex-col items-center py-6 gap-8 shrink-0 z-50">
          <Logo size="md" />
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
      )}

      {/* Main App Container */}
      <div className="flex-1 h-[100dvh] flex flex-col overflow-hidden relative w-full shadow-2xl shadow-indigo-500/10">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Global Floating Action Button for Create Post */}
        {currentTab !== 'games' && (
          <button 
            onClick={() => setIsTagModalOpen({isOpen: true})}
            className="absolute bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform z-40"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Mobile Bottom Navigation */}
        {currentTab !== 'games' && (
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
        )}
      </div>

      <CreatePostModal isOpen={isTagModalOpen.isOpen} prefillTagged={isTagModalOpen.taggedFriend} onClose={() => setIsTagModalOpen({isOpen: false})} />

      {/* Walkthrough Overlay */}
      {walkthroughStep >= 0 && walkthroughStep < tabs.length && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-pink-500/20">
              {tabs[walkthroughStep].icon}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {tabs[walkthroughStep].label}
            </h2>
            
            <p className="text-slate-400 mb-8 min-h-[60px]">
              {walkthroughStep === 0 && "Discover engaging short-form videos from creators around the world. Swipe vertically to explore."}
              {walkthroughStep === 1 && "Connect with friends, chat, and keep your daily streaks alive. Never miss a moment."}
              {walkthroughStep === 2 && "Watch longer videos and livestreams. Interact with creators in real-time."}
              {walkthroughStep === 3 && "Chat with our intelligent AI assistant to discover new content, get tips, or just have fun."}
              {walkthroughStep === 4 && "Take a break and play some fun arcade games like Penalty Shootout and Hoops Master."}
              {walkthroughStep === 5 && "Manage your profile, view your posts, track your analytics, and customize your settings."}
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={handleSkipWalkthrough}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Skip
              </button>
              <button 
                onClick={handleNextWalkthroughStep}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 shadow-lg transition-all"
              >
                {walkthroughStep === tabs.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
            
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {tabs.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-colors ${i === walkthroughStep ? "bg-white" : "bg-slate-700"}`} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
