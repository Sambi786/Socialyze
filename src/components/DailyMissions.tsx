import React from 'react';
import { useAppContext } from '../AppContext';
import { Target, Gift, CheckCircle2, ChevronLeft } from 'lucide-react';

export const MISSIONS = [
  { id: 'win_match', title: 'Play Arcade', description: 'Play any game in the Arcade', reward: 50 },
  { id: 'send_friend_req', title: 'Make a Friend', description: 'Send a friend request to someone new', reward: 20 },
  { id: 'create_post', title: 'Share your life', description: 'Create a new post or reel', reward: 30 },
];

export function DailyMissions({ onClose }: { onClose: () => void }) {
  const { user } = useAppContext();
  const completedCount = MISSIONS.filter(m => user?.completedMissions?.includes(m.id)).length;
  const progress = (completedCount / MISSIONS.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 pt-safe">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-300" />
          </button>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Daily Missions
          </h2>
        </div>
        <div className="bg-indigo-500/20 text-indigo-400 font-black text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Gift className="w-4 h-4" />
          {user?.sambi || 0} Sambi
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:max-w-2xl lg:mx-auto w-full">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 mb-6 shadow-xl border border-indigo-500/20 relative overflow-hidden">
          
          <h3 className="text-xl font-black text-white mb-2 relative z-10">Daily Progress</h3>
          <p className="text-indigo-200 text-sm mb-6 relative z-10">Complete missions to earn Sambi and unlock special rewards!</p>
          
          <div className="relative z-10">
            <div className="flex justify-between text-xs font-bold text-indigo-300 mb-2 uppercase tracking-widest">
              <span>{completedCount} / {MISSIONS.length} Completed</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-slate-950/50 rounded-full overflow-hidden border border-indigo-500/30">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {MISSIONS.map((mission) => {
            const isCompleted = user?.completedMissions?.includes(mission.id);
            return (
              <div 
                key={mission.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isCompleted 
                    ? 'bg-slate-900/50 border-emerald-500/20 opacity-70' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className={`font-bold ${isCompleted ? 'text-slate-300 line-through' : 'text-white'}`}>
                      {mission.title}
                    </h4>
                    <p className="text-sm text-slate-400">{mission.description}</p>
                  </div>
                </div>
                
                <div className={`shrink-0 font-black flex items-center gap-1 ${
                  isCompleted ? 'text-emerald-500' : 'text-pink-500'
                }`}>
                  +{mission.reward} 
                  <span className="text-[10px] uppercase tracking-widest opacity-80">Sambi</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
