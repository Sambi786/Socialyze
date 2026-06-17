import React, { useEffect, useState } from 'react';
import { Flame, Gift, Bell, X } from 'lucide-react';
import { subscribeToToasts, ToastType } from '../lib/toast';
import { motion, AnimatePresence } from 'motion/react';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    return subscribeToToasts((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== t.id));
      }, 5000);
    });
  }, []);

  const getIcon = (icon?: string) => {
    switch (icon) {
      case 'flame': return <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />;
      case 'gift': return <Gift className="w-5 h-5 text-pink-500" />;
      case 'bell':
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 shadow-2xl shadow-black/50 pointer-events-auto flex gap-3 items-start backdrop-blur-md"
          >
            <div className="bg-slate-800 p-2 rounded-xl shrink-0">
              {getIcon(t.icon)}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white tracking-tight">{t.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{t.message}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
