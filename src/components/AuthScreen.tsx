import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Gamepad2, Layers, Zap, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "../lib/toast";
import { useAppContext } from "../AppContext";
import { Logo } from "./Logo";

export function AuthScreen() {
  const { login, resetOldAccount, completeTutorial } = useAppContext();
  const [isRegister, setIsRegister] = useState(false);
  const [isResetRequired, setIsResetRequired] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");

  const handleAuth = () => {
    if (isResetRequired) {
      if (!username.trim() || !email.trim() || !password || !confirmPassword) {
        toast({ title: "Error", message: "Please fill out all fields", icon: "bell" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Error", message: "Passwords do not match", icon: "bell" });
        return;
      }
      const success = resetOldAccount(username, email, password);
      if (success) {
        toast({ title: "Success!", message: "Your password has been successfully reset! Welcome back.", icon: "gift" });
      } else {
        toast({ title: "Error", message: "Incorrect username or email.", icon: "bell" });
      }
      return;
    }

    if (isRegister) {
      if (!username.trim() || !password || !birthDate || !email.trim() || !gender) {
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
    
    const result = login(username, password, isRegister, email, gender);
    if (result && result.status === 'old_account') {
      setIsResetRequired(true);
      setPassword("");
      toast({ title: "Action Required", message: "Looks like this is an old account. Please confirm your email to set a password.", icon: "bell" });
    } else if (result && result.status === 'new_user_tutorial') {
      completeTutorial(result.pendingData);
    }
  };

  return (
    <div className="h-full w-full bg-[#0a0a0e] overflow-y-auto relative text-slate-50">
      <div className="min-h-full w-full flex flex-col items-center justify-center p-6 sm:p-12">
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
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-500 blur-2xl opacity-40 scale-150 rounded-full" />
          <Logo size="lg" />
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mb-4 pb-1">SOCIALYZE</h1>
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
            {isResetRequired ? "Secure Your Account" : isRegister ? "Start Your Journey" : "Welcome Back"}
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
                  className="overflow-hidden space-y-4 pt-4"
                >
                  <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all font-medium placeholder-slate-500 text-white shadow-inner"
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all font-medium placeholder-slate-500 text-white shadow-inner"
                  />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all font-medium text-slate-400 shadow-inner appearance-none"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non_binary">Non-binary</option>
                  </select>
                  <input 
                    type="text"
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                    placeholder="your birthday: dd.mm.year"
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
              {isRegister ? "Join Socialyze" : "Log In"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-8 text-center relative z-10 flex flex-col gap-3">
            {!isRegister && (
              <button 
                type="button"
                onClick={() => { setIsRegister(false); setIsResetRequired(true); }}
                className="text-pink-400 hover:text-pink-300 transition-colors text-sm font-medium"
              >
                Forgot your password?
              </button>
            )}
            <button 
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Security Reset Dialog */}
      {isResetRequired && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-8 relative animation-slide-up text-center">
            <h2 className="text-2xl font-bold mb-2 text-white">Reset Your Password</h2>
            <p className="text-sm text-slate-400 mb-6 font-medium">Please confirm your email address and set a new password for your account.</p>
            <div className="space-y-4 mb-8">
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 transition-all font-medium placeholder-slate-500 text-white"
              />
              <input 
                type="email" 
                placeholder="Your Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-pink-500/50 transition-all font-medium placeholder-slate-500 text-white"
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all font-medium placeholder-slate-500 text-white"
              />
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder-slate-500 text-white"
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsResetRequired(false)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAuth}
                className="flex-[2] py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-colors"
              >
                Verify & Reset
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
