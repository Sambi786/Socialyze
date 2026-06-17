import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Gamepad2, Layers, Zap, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "../lib/toast";

export function AuthScreen({ onLogin }: { onLogin: (username: string, isRegister: boolean) => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const handleAuth = () => {
    if (isRegister) {
      if (!username.trim() || !password || !birthDate) {
        toast({ title: "Error", message: "Please fill out all fields", icon: "bell" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Error", message: "Passwords do not match", icon: "bell" });
        return;
      }
    } else {
      if (!username.trim() || !password) {
        toast({ title: "Error", message: "Please enter username and password", icon: "bell" });
        return;
      }
    }
    onLogin(username, isRegister);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0e] flex flex-col items-center justify-center p-6 sm:p-12 text-slate-50 overflow-auto relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-pink-600/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-purple-600/20 blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            y: [0, -50, 0],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[100px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative z-10"
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex justify-center mb-8 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 blur-2xl opacity-40 scale-150 rounded-full" />
          <div className="relative bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-5 rounded-3xl shadow-2xl flex items-center justify-center">
            <Zap className="w-12 h-12 text-white fill-white/20" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mb-4 pb-1">ZOCIALYSE</h1>
          <p className="text-slate-300/80 text-lg font-medium">The ultimate social universe.</p>
        </motion.div>

        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[40px] p-8 shadow-2xl mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          
          <h2 className="text-2xl font-bold mb-8 text-center text-white/90">
            {isRegister ? "Start Your Journey" : "Welcome Back"}
          </h2>
          
          <form className="space-y-4 relative z-10" onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
            <div className="group">
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-pink-500/50 focus:bg-white/[0.05] transition-all font-medium placeholder-slate-500 text-white shadow-inner"
              />
            </div>
            <div className="group">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all font-medium placeholder-slate-500 text-white shadow-inner"
              />
            </div>
            
            <AnimatePresence>
              {isRegister && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all font-medium placeholder-slate-500 text-white shadow-inner mt-4"
                  />
                  <input 
                    type="date" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all font-medium text-slate-400 shadow-inner"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:opacity-90 transition-all text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-500/25 mt-6 tracking-widest uppercase text-sm flex items-center justify-center gap-2 group hover:scale-[1.02]"
            >
              {isRegister ? "Join Zocialyse" : "Log In"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-8 text-center relative z-10">
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="grid grid-cols-3 gap-4 text-center opacity-80"
        >
          <div className="flex flex-col items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110 transition-transform">
            <div className="p-3 rounded-full bg-white/5 border border-white/10">
              <Layers className="w-6 h-6 text-pink-400" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">Reels</span>
          </div>
          <div className="flex flex-col items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110 transition-transform">
            <div className="p-3 rounded-full bg-white/5 border border-white/10">
              <Camera className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">Filters</span>
          </div>
          <div className="flex flex-col items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110 transition-transform">
            <div className="p-3 rounded-full bg-white/5 border border-white/10">
              <Gamepad2 className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300">Streaks</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
