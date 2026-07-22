import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, UserPlus, Fingerprint, Lock, Shield, AtSign, Mail, Calendar, Key, AlertCircle, Camera } from "lucide-react";
import { toast } from "../lib/toast";
import { useAppContext } from "../AppContext";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Logo } from "./Logo";

export function AuthScreen() {
  const { login, firebaseUser, profileSetupRequired } = useAppContext();
  const [isRegister, setIsRegister] = useState(false);
  const [isResetRequired, setIsResetRequired] = useState(false);
  
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Profile Setup State
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // New Setup States
  const [setupStep, setSetupStep] = useState(1);
  const [socialLinks, setSocialLinks] = useState({ youtube: "", facebook: "", snapchat: "", discord: "" });
  const [preferences, setPreferences] = useState({ notifications: true, privateProfile: false });
  
  const handleAuth = async () => {
    if (!loginIdentifier || !password) {
      toast({ title: "Required Fields", message: "Please fill in all required fields.", icon: "bell" });
      return;
    }
    
    try {
      if (isRegister) {
        // Registering a new account
        let emailToUse = email.trim();
        if (!emailToUse) {
          // Fallback to a pseudo-email if they didn't provide one
          emailToUse = `${loginIdentifier.replace(/[^a-zA-Z0-9]/g, '')}@socialyze.local`;
        }
        
        // Check if username is taken
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", loginIdentifier));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          toast({ title: "Username Taken", message: "This username is already in use.", icon: "bell" });
          return;
        }

        setUsername(loginIdentifier); // Pre-fill for profile setup
        await createUserWithEmailAndPassword(auth, emailToUse, password);
        toast({ title: "Account Created", message: "Welcome! Let's setup your profile.", icon: "bell" });
      } else {
        // Logging in
        let authEmail = loginIdentifier;
        let isLegacyFormat = false;
        let legacyData = null;

        if (!loginIdentifier.includes('@')) {
          // Look up user by username
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("username", "==", loginIdentifier));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            legacyData = snapshot.docs[0].data();
            if (legacyData.email && legacyData.email.includes('@')) {
              authEmail = legacyData.email;
            } else {
              isLegacyFormat = true;
              authEmail = `${loginIdentifier}@socialyze.local`;
            }
          } else {
            isLegacyFormat = true;
            authEmail = `${loginIdentifier.replace(/[^a-zA-Z0-9]/g, '')}@socialyze.local`;
          }
        }
        
        try {
          await signInWithEmailAndPassword(auth, authEmail, password);
          toast({ title: "Logged In", message: "Welcome back!", icon: "bell" });
        } catch (signInError: any) {
          // If it's a legacy account that doesn't exist in Firebase Auth yet, migrate it!
          if ((signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') && legacyData && legacyData.password === password) {
            try {
              // Create the auth user for the legacy account
              const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
              // Update the user document to map to the new Firebase Auth UID
              
              // We can't easily move documents, but we can set the new doc and delete the old, or just leave the old one.
              // Actually, since AppContext relies on the ID matching the auth.uid, we need to create a new doc with the auth.uid
              const newUserData = { ...legacyData, id: userCredential.user.uid };
              await setDoc(doc(db, "users", userCredential.user.uid), newUserData);
              
              toast({ title: "Account Migrated", message: "Welcome back!", icon: "bell" });
            } catch (migrationError: any) {
              toast({ title: "Login Error", message: "Could not migrate legacy account. " + migrationError.message, icon: "bell" });
            }
          } else {
             throw signInError;
          }
        }
      }
    } catch (e: any) {
      toast({ title: "Authentication Error", message: e.message.replace('Firebase:', '').trim(), icon: "bell" });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      toast({ title: "Google Login Error", message: e.message, icon: "bell" });
    }
  };
  
  const handleProfileSetup = async () => {
    if (!username.trim()) {
      toast({ title: "Required", message: "Username is required", icon: "bell" });
      return;
    }
    
    try {
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      const newUser = {
        id: firebaseUser.uid,
        username: username.trim(),
        avatar: avatarUrl.trim() || defaultAvatar,
        bio: bio.trim(),
        email: firebaseUser.email || "",
        streaks: 0,
        friends: [],
        socialLinks,
        preferences
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      toast({ title: "Profile Complete", message: "Welcome to Socialyze!", icon: "bell" });
      window.location.reload(); // Force reload to ensure context picks up the new document correctly
    } catch (e: any) {
      toast({ title: "Error", message: "Could not create profile", icon: "bell" });
    }
  };

  const handleResetPassword = async () => {
    if (!loginIdentifier) {
      toast({ title: "Email required", message: "Please enter your email to reset password.", icon: "bell" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, loginIdentifier);
      toast({ title: "Email Sent", message: "Password reset email has been sent.", icon: "bell" });
      setIsResetRequired(false);
    } catch (e: any) {
      toast({ title: "Error", message: e.message, icon: "bell" });
    }
  };

  // If Firebase user exists but no profile, show Profile Setup
  if (profileSetupRequired && firebaseUser) {
    return (
      <div className="absolute inset-0 bg-slate-950 p-4 z-[100] font-sans overflow-y-auto flex flex-col items-center py-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-2 text-center text-white">Create Your Profile</h2>
            <p className="text-slate-400 text-center mb-8 text-sm">Tell us a bit about yourself</p>
            
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3].map(step => (
                <div key={step} className={`w-2.5 h-2.5 rounded-full transition-colors ${setupStep >= step ? 'bg-pink-500' : 'bg-slate-700'}`} />
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
                    <button type="button" onClick={() => setPreferences({...preferences, notifications: !preferences.notifications})} className={`w-12 h-6 rounded-full transition-colors relative ${preferences.notifications ? 'bg-pink-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.notifications ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-2xl px-5 py-4">
                    <div>
                      <div className="text-white font-bold">Private Profile</div>
                      <div className="text-slate-400 text-xs">Only friends can see your posts</div>
                    </div>
                    <button type="button" onClick={() => setPreferences({...preferences, privateProfile: !preferences.privateProfile})} className={`w-12 h-6 rounded-full transition-colors relative ${preferences.privateProfile ? 'bg-pink-500' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${preferences.privateProfile ? 'left-7' : 'left-1'}`} />
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

          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-950 p-4 z-[100] font-sans overflow-y-auto flex flex-col items-center py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-10 relative">
          <Logo size="lg" />
        </div>
        
        <motion.div 
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
        >
          <h2 className="text-2xl font-bold mb-8 text-center text-white/90">
            {isResetRequired ? "Reset Password" : isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          
          <form className="space-y-4 relative z-10" onSubmit={(e) => { e.preventDefault(); isResetRequired ? handleResetPassword() : handleAuth(); }}>
            <input 
              type="text" 
              placeholder={isRegister ? "Choose a Username" : "Username or Email"} 
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-medium text-white shadow-inner"
            />
            
            {isRegister && (
              <input 
                type="email" 
                placeholder="Email Address (Optional)" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-pink-500/50 transition-all font-medium text-white shadow-inner"
              />
            )}

            {!isResetRequired && (
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all font-medium text-white shadow-inner"
              />
            )}
            
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl mt-6 tracking-widest uppercase text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              {isResetRequired ? "Send Reset Email" : isRegister ? "Sign Up" : "Log In"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          
          {!isResetRequired && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">or continue with</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              
              <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </>
          )}

          <div className="mt-8 text-center relative z-10 flex flex-col gap-3">
            {!isRegister && !isResetRequired && (
              <button 
                type="button"
                onClick={() => setIsResetRequired(true)}
                className="text-pink-400 hover:text-pink-300 transition-colors text-sm font-medium"
              >
                Forgot your password?
              </button>
            )}
            
            {isResetRequired && (
              <button 
                type="button"
                onClick={() => setIsResetRequired(false)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Back to login
              </button>
            )}

            {!isResetRequired && (
              <button 
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
