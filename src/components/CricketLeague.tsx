import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trophy, Flag, Share2, Zap, MapPin, User, Loader2 } from 'lucide-react';
import { playArcadeSound } from '../utils/audio';
import { useAppContext } from '../AppContext';
import { toast } from '../lib/toast';
import { ShareModal } from './ShareModal';

const GROUNDS = [
  { id: 'london', name: 'London Oval', light: '#4ade80', dark: '#22c55e', pitch: '#d9b382', text: 'text-emerald-800', bg: 'bg-gradient-to-b from-blue-400 to-blue-200' },
  { id: 'mumbai', name: 'Mumbai Stadium', light: '#a3e635', dark: '#65a30d', pitch: '#cd853f', text: 'text-orange-900', bg: 'bg-gradient-to-b from-orange-400 to-orange-200' },
  { id: 'socialyze', name: 'Socialyze Night', light: '#0d9488', dark: '#0f766e', pitch: '#78716c', text: 'text-cyan-400', bg: 'bg-gradient-to-b from-slate-900 to-slate-800' },
];

const BATS = [
  { id: 'rookie', name: 'Wood Rookie', power: 4, timing: 5, color: 'bg-orange-800' },
  { id: 'pro', name: 'Pro Smasher', power: 7, timing: 6, color: 'bg-blue-600' },
  { id: 'legend', name: 'Legendary', power: 9, timing: 9, color: 'bg-yellow-500' },
];

const BALLS = [
  { id: 'basic', name: 'Red Seam', swing: 3, pace: 5, color: '#b91c1c' },
  { id: 'spin', name: 'White Spin', swing: 8, pace: 4, color: '#f8fafc' },
  { id: 'pace', name: 'Green Pace', swing: 4, pace: 9, color: '#22c55e' },
];

const TEAMS = [
  { name: 'India', color: 'border-blue-500 bg-blue-500/20 text-blue-200', uniform: 'bg-blue-600', pants: 'bg-blue-800', helmet: 'bg-blue-700', skin: 'bg-amber-700', flag: '🇮🇳' },
  { name: 'Australia', color: 'border-yellow-500 bg-yellow-500/20 text-yellow-200', uniform: 'bg-yellow-400', pants: 'bg-yellow-500', helmet: 'bg-yellow-500', skin: 'bg-orange-200', flag: '🇦🇺' },
  { name: 'England', color: 'border-red-500 bg-red-500/20 text-red-200', uniform: 'bg-red-600', pants: 'bg-blue-900', helmet: 'bg-blue-900', skin: 'bg-rose-200', flag: '🇬🇧' },
  { name: 'South Africa', color: 'border-emerald-500 bg-emerald-500/20 text-emerald-200', uniform: 'bg-emerald-600', pants: 'bg-yellow-500', helmet: 'bg-emerald-700', skin: 'bg-amber-800', flag: '🇿🇦' },
  { name: 'New Zealand', color: 'border-slate-500 bg-slate-500/20 text-slate-200', uniform: 'bg-slate-900', pants: 'bg-black', helmet: 'bg-slate-900', skin: 'bg-orange-200', flag: '🇳🇿' },
  { name: 'Pakistan', color: 'border-teal-500 bg-teal-500/20 text-teal-200', uniform: 'bg-teal-600', pants: 'bg-teal-800', helmet: 'bg-teal-700', skin: 'bg-amber-600', flag: '🇵🇰' },
];

type GamePhase = 'setup' | 'toss' | 'inning1' | 'inning_break' | 'inning2' | 'result';
type MatchFormat = 'quick' | 'league';

export const CricketLeague = ({ onExit }: { onExit: () => void }) => {
  const { user, updateUser } = useAppContext();
  
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [format, setFormat] = useState<MatchFormat>('quick');
  
  const [myTeam, setMyTeam] = useState(TEAMS[0]);
  const [opponent, setOpponent] = useState(TEAMS[1]);
  const [ground, setGround] = useState(GROUNDS[2]); // Default Socialyze Arena
  const [selectedBat, setSelectedBat] = useState(BATS[0]);
  const [selectedBall, setSelectedBall] = useState(BALLS[0]);
  
  const [isUserBatting, setIsUserBatting] = useState(true);
  const [inningScore, setInningScore] = useState(0);
  const [inningWickets, setInningWickets] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const totalBalls = 12; // 2 over match
  const [ballsLeft, setBallsLeft] = useState(totalBalls);
  
  const [userTotalScore, setUserTotalScore] = useState(0);
  const [oppTotalScore, setOppTotalScore] = useState(0);
  const [userWickets, setUserWickets] = useState(0);
  const [oppWickets, setOppWickets] = useState(0);

  const [showFieldMap, setShowFieldMap] = useState(false);
  const [showBowlerSelect, setShowBowlerSelect] = useState(false);
  const [fielders, setFielders] = useState<{id: number, x: number, y: number}[]>([...Array(9)].map((_, i) => ({ id: i, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 })));
  const [draggedFielder, setDraggedFielder] = useState<number | null>(null);
  
  // Game states
  const [ballState, setBallState] = useState<'idle' | 'aiming' | 'run_up' | 'bowling' | 'hit'>('idle');
  const [ballScale, setBallScale] = useState(0.2);
  const [ballY, setBallY] = useState(25);
  const [ballX, setBallX] = useState(50);
  const [batSwing, setBatSwing] = useState(false);
  const [umpireMsg, setUmpireMsg] = useState('');
  const [isWicketHit, setIsWicketHit] = useState(false);
  const [activeFielderAction, setActiveFielderAction] = useState<{id: number, destX: number, destY: number} | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [tossWinner, setTossWinner] = useState<'user' | 'opponent' | null>(null);
  
  // Bowling specific states
  const [aimX, setAimX] = useState(50);
  const aimDirectionRef = useRef(1);
  const aimRafRef = useRef<number>(0);
  
  const bowlTimeRef = useRef(0);
  const autoMissTimeoutRef = useRef<any>(null);
  const targetXRef = useRef(50);
  const FLY_TIME = 1200;

  // --- TOSS & SETUP ---
  const handleToss = () => {
    setPhase('toss');
    setTossWinner(null);
    setUmpireMsg('');
    setTimeout(() => {
      const userWon = Math.random() > 0.5;
      setTossWinner(userWon ? 'user' : 'opponent');
      setUmpireMsg(userWon ? 'You won the toss!' : 'Opponent won the toss!');
      
      if (!userWon) {
          setTimeout(() => {
            const willBat = Math.random() > 0.5;
            setUmpireMsg(willBat ? 'Opponent chose to BAT' : 'Opponent chose to BOWL');
            setTimeout(() => {
                startInning(!willBat);
            }, 2000);
          }, 2000);
      }
    }, 1500);
  };
  
  const handleTossChoice = (userBats: boolean) => {
      setUmpireMsg(userBats ? 'You chose to BAT' : 'You chose to BOWL');
      setTimeout(() => {
          startInning(userBats);
      }, 2000);
  };

  const startInning = (userBats: boolean) => {
    setIsUserBatting(userBats);
    setInningScore(0);
    setInningWickets(0);
    setBallsLeft(totalBalls);
    setBallState('idle');
    setBallY(36);
    setBallScale(0.3);
    setUmpireMsg('');
    setIsWicketHit(false);
    
    // Check targetScore instead of phase closure to determine if it's inning1 or inning2
    setPhase(targetScore === 0 ? 'inning1' : 'inning2');
    
    if (!userBats) {
        setShowFieldMap(true);
    }
  };

  // --- BATTING MECHANICS (User Bats) ---
  const userBat_bowlNextBall = () => {
    console.log("userBat_bowlNextBall", { ballState, ballsLeft, inningWickets, phase, inningScore, targetScore });
    if (ballState !== 'idle' || ballsLeft <= 0 || inningWickets >= 10 || (phase === 'inning2' && inningScore >= targetScore)) return;
    
    setBallState('run_up'); // hide button immediately
    setUmpireMsg('');
    setBatSwing(false);
    setIsWicketHit(false);
    setActiveFielderAction(null);
    setBallScale(0.3);
    setBallY(36);
    
    const randomTargetX = 15 + Math.random() * 70;
    targetXRef.current = randomTargetX;
    setBallX(50); 
    
    setTimeout(() => {
      setBallState('bowling');
      playArcadeSound('bowl');
      bowlTimeRef.current = Date.now();
      
      setBallScale(1);
      setBallY(78);
      setBallX(targetXRef.current);
      
      autoMissTimeoutRef.current = setTimeout(() => {
        userBat_handleSwing(true);
      }, FLY_TIME + 250); 
    }, 1200); 
  };

  const userBat_handleSwing = (isAutoMiss = false, shotType: 'loft' | 'ground' = 'loft') => {
    if (ballState !== 'bowling') return;
    
    if (autoMissTimeoutRef.current) clearTimeout(autoMissTimeoutRef.current);
    setBatSwing(true);
    setBallState('hit');
    setBallsLeft(b => b - 1);
    
    let runs = 0;
    let msg = '';
    let isWicket = false;
    let newX = targetXRef.current;
    let newY = -10;
    
    if (isAutoMiss) {
        msg = 'OUT! BOWLED!';
        isWicket = true;
        playArcadeSound('out');
        setTimeout(() => playArcadeSound('cheer'), 300);
        newX = targetXRef.current;
        newY = 90;
    } else {
        const timeDiff = Date.now() - bowlTimeRef.current;
        const diffFromPerfect = Math.abs(timeDiff - FLY_TIME);
        
        const timingBonus = selectedBat.timing * 5;
        const powerBonus = selectedBat.power * 2;
        
        if (diffFromPerfect < 100 + timingBonus) {
            runs = shotType === 'loft' ? 6 : 4;
            msg = shotType === 'loft' ? 'SIX!' : 'FOUR (PUNCH)!';
            playArcadeSound('hit');
            setTimeout(() => playArcadeSound('cheer'), 200);
            newY = shotType === 'loft' ? -30 : 0;
            newX = Math.random() > 0.5 ? 10 : 90;
        } else if (diffFromPerfect < 200 + timingBonus + powerBonus) {
            runs = shotType === 'loft' ? 4 : 2;
            msg = shotType === 'loft' ? 'FOUR!' : '2 RUNS';
            playArcadeSound('hit');
            if (runs === 4) setTimeout(() => playArcadeSound('cheer'), 200);
            newY = shotType === 'loft' ? 0 : 40;
            newX = Math.random() > 0.5 ? 20 : 80;
        } else if (diffFromPerfect < 300 + timingBonus) {
            runs = shotType === 'loft' ? 2 : 1;
            msg = shotType === 'loft' ? '2 RUNS' : '1 RUN';
            playArcadeSound('hit');
            newY = 40;
            newX = Math.random() > 0.5 ? 10 : 90;
        } else if (diffFromPerfect < 450 + timingBonus) {
            if (timeDiff > FLY_TIME && Math.random() > (shotType === 'loft' ? 0.3 : 0.7)) { 
                msg = 'CAUGHT OUT!';
                isWicket = true;
                playArcadeSound('out');
                setTimeout(() => playArcadeSound('cheer'), 300);
                newY = 45;
                newX = targetXRef.current + (Math.random() > 0.5 ? 20 : -20);
            } else {
                runs = 1;
                msg = '1 RUN';
                playArcadeSound('hit');
                newY = 55;
                newX = Math.random() > 0.5 ? 30 : 70;
            }
        } else if (diffFromPerfect < 550 + timingBonus) {
            msg = 'BEATEN!';
            isWicket = false;
            playArcadeSound('ooh');
            newY = 90;
            newX = targetXRef.current + (Math.random() > 0.5 ? 10 : -10);
        } else {
            msg = 'MISSED! OUT!';
            isWicket = true;
            playArcadeSound('out');
            setTimeout(() => playArcadeSound('cheer'), 300);
            newY = 90;
            newX = targetXRef.current;
        }
    }

    setBallX(newX);
    setBallY(newY);
    
    if (isWicket && !msg.includes('CAUGHT')) {
        setTimeout(() => setIsWicketHit(true), 200);
    }
    
    handleBallResult(runs, isWicket, msg, newX, newY);
  };

  // --- BOWLING MECHANICS (User Bowls) ---
  const userBowl_startAiming = () => {
    setBallState('aiming');
    setBallY(36);
    setBallScale(0.3);
    setUmpireMsg('SET PITCH LINE');
    setIsWicketHit(false);
    setActiveFielderAction(null);
    
    let currentX = 50;
    let dir = 1;
    const speed = 1 + (selectedBall.pace * 0.15); // Pace affects aim speed
    
    const animateAim = () => {
        currentX += dir * speed;
        if (currentX >= 90) dir = -1;
        if (currentX <= 10) dir = 1;
        setAimX(currentX);
        aimRafRef.current = requestAnimationFrame(animateAim);
    };
    aimRafRef.current = requestAnimationFrame(animateAim);
  };

  const userBowl_lockAim = () => {
      cancelAnimationFrame(aimRafRef.current);
      setBallState('run_up');
      setUmpireMsg('');
      
      setTimeout(() => {
          setBallState('bowling');
          playArcadeSound('bowl');
          
          setBallScale(1); // Larger as it approaches
          setBallY(78); // To bottom
          setBallX(aimX);
          
          const distFromCenter = Math.abs(aimX - 50);
          const isYorkerOrEdge = distFromCenter > 30;
          const isWide = distFromCenter > 38;
          
          setTimeout(() => {
              setBallState('hit');
          setBallsLeft(b => b - 1);
          
          let runs = 0;
          let msg = '';
          let isWicket = false;
          let newY = 90; // Default behind batsman
          let newX = aimX;
          
          if (isWide) {
              runs = 1;
              msg = 'WIDE!';
              setBallsLeft(b => b + 1);
              newY = 90;
          } else {
              const aiRoll = Math.random() - (selectedBall.swing * 0.02);
              
              if (isYorkerOrEdge) {
                  if (aiRoll < 0.45) {
                      msg = 'BOWLED!';
                      isWicket = true;
                      newY = 90;
                  } else if (aiRoll < 0.60) {
                      runs = 0;
                      msg = 'BEATEN!';
                      newY = 90;
                      newX = aimX + (Math.random() > 0.5 ? 10 : -10);
                  } else if (aiRoll < 0.85) {
                      runs = 1;
                      msg = '1 RUN';
                      newY = 40;
                      newX = Math.random() > 0.5 ? 20 : 80;
                  } else {
                      runs = 4;
                      msg = 'FOUR!';
                      newY = 0;
                      newX = Math.random() > 0.5 ? 0 : 100;
                  }
              } else {
                  if (aiRoll < 0.15) {
                      msg = 'CAUGHT!';
                      isWicket = true;
                      newY = 45;
                      newX = Math.random() > 0.5 ? 30 : 70;
                  } else if (aiRoll < 0.35) {
                      runs = 0;
                      msg = 'BEATEN!';
                      newY = 90;
                      newX = aimX + (Math.random() > 0.5 ? 10 : -10);
                  } else if (aiRoll < 0.65) {
                      runs = 6;
                      msg = 'SIX!';
                      newY = -30;
                      newX = Math.random() > 0.5 ? 20 : 80;
                  } else {
                      runs = 4;
                      msg = 'FOUR!';
                      newY = 0;
                      newX = Math.random() > 0.5 ? 0 : 100;
                  }
              }
          }
          
          setBallY(newY);
          setBallX(newX);
          
          if (runs > 3) playArcadeSound('cheer');
          if (runs > 0 && runs <= 3) playArcadeSound('hit');
          if (msg === 'BEATEN!') playArcadeSound('ooh');
          if (isWicket) {
              playArcadeSound('out');
              setTimeout(() => playArcadeSound('cheer'), 300);
              if (msg === 'BOWLED!') setIsWicketHit(true);
          }
          
          handleBallResult(runs, isWicket, msg, newX, newY);
          
      }, FLY_TIME - (selectedBall.pace * 20)); // Pace makes ball fly faster
    }, 1200); // run up time
  };


  // --- SHARED GAME LOGIC ---
  const handleBallResult = (runs: number, isWicket: boolean, msg: string, endX: number, endY: number) => {
    const newScore = inningScore + runs;
    const newWickets = inningWickets + (isWicket ? 1 : 0);
    const newBallsLeft = msg === 'WIDE!' ? ballsLeft : ballsLeft - 1;
    
    setInningScore(newScore);
    if (isWicket) setInningWickets(newWickets);
    setUmpireMsg(msg);

    // Trigger fielder animation if the ball is hit into the field
    if (endY > 30 && endY < 100) {
        // Find nearest fielder
        let nearestFielder = fielders[0];
        let minFielderDist = 9999;
        
        // map endY (30-100 on 3D view) to tactical y (0-100)
        // earlier we did fieldY = 20 + (f.y * 0.6) => f.y = (fieldY - 20) / 0.6
        const tacticalEndY = (endY - 20) / 0.6;
        
        fielders.forEach(f => {
            const dist = Math.hypot(f.x - endX, f.y - tacticalEndY);
            if (dist < minFielderDist) {
                minFielderDist = dist;
                nearestFielder = f;
            }
        });
        
        if (nearestFielder) {
            setActiveFielderAction({ id: nearestFielder.id, destX: endX, destY: endY });
        }
    }
    
    setTimeout(() => {
       checkPhaseTransition(newScore, newWickets, newBallsLeft);
    }, 2000);
  };

  const checkPhaseTransition = (score: number, wkts: number, bls: number) => {
      if (phase === 'inning1') {
          if (wkts >= 10 || bls <= 0) {
              // End of Inning 1
              if (isUserBatting) {
                  setUserTotalScore(score);
                  setUserWickets(wkts);
              } else {
                  setOppTotalScore(score);
                  setOppWickets(wkts);
              }
              setTargetScore(score + 1);
              setPhase('inning_break');
          } else {
              resetForNextBall(bls);
          }
      } else if (phase === 'inning2') {
          if (score >= targetScore || wkts >= 10 || bls <= 0) {
              // End of Match
              if (isUserBatting) {
                  setUserTotalScore(score);
                  setUserWickets(wkts);
              } else {
                  setOppTotalScore(score);
                  setOppWickets(wkts);
              }
              setPhase('result');
              updateLeagueProgress();
          } else {
              resetForNextBall(bls);
          }
      }
  };
  
  const resetForNextBall = (currentBallsLeft: number) => {
      setBallState('idle');
      setBallY(36);
      setBallScale(0.3);
      setBatSwing(false);
      setUmpireMsg('');
      setIsWicketHit(false);
      setActiveFielderAction(null);
      
      // If over changed (multiples of 6), automatically show field map for bowler
      if (currentBallsLeft > 0 && currentBallsLeft % 6 === 0) {
          if (!isUserBatting) {
              setShowBowlerSelect(true);
              setShowFieldMap(true);
          } else {
              const nextBall = BALLS[1 + Math.floor(Math.random() * 2)];
              setSelectedBall(nextBall);
              toast({ title: 'New Over', message: `Opponent is bowling ${nextBall.name} this over.` });
          }
      }
  };

  const updateLeagueProgress = () => {
      // Logic to update user stats if it's league mode
  };

  // --- CLEANUP ---
  useEffect(() => {
    return () => {
        if (autoMissTimeoutRef.current) clearTimeout(autoMissTimeoutRef.current);
        if (aimRafRef.current) cancelAnimationFrame(aimRafRef.current);
    };
  }, []);

  // --- RENDERERS ---
  if (phase === 'setup') {
      return (
          <div className="h-full bg-slate-950 text-white flex flex-col items-center justify-start p-6 relative overflow-y-auto">
              <button onClick={onExit} className="absolute top-4 left-4 z-50 p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors border border-slate-700">
                  <ArrowLeft className="w-6 h-6 text-slate-300" />
              </button>
              
              <div className="w-full max-w-md mt-12 flex flex-col gap-6 pb-20">
                  <div className="text-center mb-4">
                      <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 uppercase drop-shadow-lg">
                          Socialyze League
                      </h1>
                      <p className="text-slate-400 text-sm font-bold tracking-widest mt-1 uppercase">T20 Cricket Clash</p>
                  </div>
                  
                  {/* Format Selection */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex gap-2">
                      <button 
                        onClick={() => setFormat('quick')}
                        className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all ${format === 'quick' ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >Quick Match</button>
                      <button 
                        onClick={() => toast({ title: 'League Mode', message: 'League mode unlocking soon!', icon: 'flame' })}
                        className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all bg-slate-800 text-slate-500 cursor-not-allowed`}
                      >League (Lock)</button>
                  </div>

                  {/* Ground Selection */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                          <MapPin className="w-4 h-4" /> Select Ground
                      </label>
                      <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                          {GROUNDS.map(g => (
                              <button 
                                key={g.id}
                                onClick={() => setGround(g)}
                                className={`snap-center shrink-0 w-32 h-20 rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all ${ground.id === g.id ? 'border-cyan-400 scale-105 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-slate-700 opacity-70 hover:opacity-100'}`}
                              >
                                  <div className={`absolute inset-0 ${g.bg}`} />
                                  <div className={`absolute bottom-0 inset-x-0 h-[60%]`} style={{ background: `repeating-linear-gradient(0deg, ${g.light}, ${g.light} 5px, ${g.dark} 5px, ${g.dark} 10px)` }} />
                                  <div className={`absolute bottom-0 inset-x-1/4 w-1/2 h-1/2`} style={{ backgroundColor: g.pitch }} />
                                  <span className={`relative z-10 font-black text-sm tracking-wide bg-white/80 px-2 rounded-md shadow-sm ${g.text}`}>{g.name}</span>
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Equipment Selection */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
                      <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                              <Zap className="w-4 h-4" /> Select Bat
                          </label>
                          <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                              {BATS.map(bat => (
                                  <button 
                                    key={bat.id}
                                    onClick={() => setSelectedBat(bat)}
                                    className={`snap-center shrink-0 w-32 p-3 rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${selectedBat.id === bat.id ? 'border-amber-400 bg-amber-500/10 scale-105' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}`}
                                  >
                                      <div className={`w-3 h-12 rounded-b-md shadow-sm mb-2 relative ${bat.color}`}>
                                          <div className="absolute -top-3 left-[2px] w-1.5 h-3 bg-slate-400 rounded-t-sm" />
                                      </div>
                                      <span className="font-bold text-[10px] tracking-wide text-white">{bat.name}</span>
                                      <div className="flex gap-2 mt-1 w-full justify-between px-2 text-[8px] text-slate-400">
                                        <span>PWR {bat.power}</span>
                                        <span>TIM {bat.timing}</span>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                              <Zap className="w-4 h-4" /> Select Ball
                          </label>
                          <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                              {BALLS.map(ball => (
                                  <button 
                                    key={ball.id}
                                    onClick={() => setSelectedBall(ball)}
                                    className={`snap-center shrink-0 w-32 p-3 rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${selectedBall.id === ball.id ? 'border-red-400 bg-red-500/10 scale-105' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'}`}
                                  >
                                      <div className="w-8 h-8 rounded-full shadow-[inset_-2px_-2px_5px_rgba(0,0,0,0.5)] mb-2 relative" style={{ backgroundColor: ball.color }}>
                                          <div className="absolute inset-0 flex items-center justify-center">
                                              <div className="w-full h-[1px] bg-white/40 rotate-45" />
                                          </div>
                                      </div>
                                      <span className="font-bold text-[10px] tracking-wide text-white">{ball.name}</span>
                                      <div className="flex gap-2 mt-1 w-full justify-between px-2 text-[8px] text-slate-400">
                                        <span>PAC {ball.pace}</span>
                                        <span>SWG {ball.swing}</span>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
                  
                  {/* Team Selection */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                          <User className="w-4 h-4" /> Your Team
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                          {TEAMS.map(team => (
                              <button 
                                key={team.name}
                                onClick={() => { setMyTeam(team); if(opponent.name === team.name) setOpponent(TEAMS.find(t => t.name !== team.name)!); }}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${myTeam.name === team.name ? team.color : 'border-slate-800 bg-slate-800/50 text-slate-400'}`}
                              >
                                <span className="text-2xl drop-shadow-sm">{team.flag}</span>
                                <span className="font-bold text-[10px] uppercase tracking-wide truncate w-full text-center">{team.name}</span>
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                           Opponent Team
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                          {TEAMS.map(team => (
                              <button 
                                key={team.name}
                                onClick={() => setOpponent(team)}
                                disabled={myTeam.name === team.name}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${opponent.name === team.name ? team.color : 'border-slate-800 bg-slate-800/50 text-slate-400'} ${myTeam.name === team.name ? 'opacity-20' : ''}`}
                              >
                                <span className="text-2xl drop-shadow-sm">{team.flag}</span>
                                <span className="font-bold text-[10px] uppercase tracking-wide truncate w-full text-center">{team.name}</span>
                              </button>
                          ))}
                      </div>
                  </div>

                  <button 
                    onClick={handleToss}
                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] active:scale-[0.98] transition-all uppercase tracking-widest"
                  >
                     Start Match
                  </button>
              </div>
          </div>
      );
  }

  if (phase === 'toss' || phase === 'inning_break') {
      return (
          <div className="h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              {phase === 'toss' && !umpireMsg && <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />}
              {phase === 'inning_break' && <Trophy className="w-16 h-16 text-yellow-500 mb-6" />}
              
              <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">
                  {phase === 'toss' ? 'Coin Toss' : 'Inning Break'}
              </h2>
              
              {umpireMsg && <div className="text-xl text-emerald-400 font-bold uppercase tracking-widest p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-xl mb-6">{umpireMsg}</div>}
              
              {phase === 'toss' && tossWinner === 'user' && !umpireMsg.includes('chose') && (
                  <div className="flex gap-4 w-full max-w-sm mt-4">
                      <button 
                          onClick={() => handleTossChoice(true)}
                          className="flex-1 py-4 bg-cyan-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
                      >
                          BAT
                      </button>
                      <button 
                          onClick={() => handleTossChoice(false)}
                          className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
                      >
                          BOWL
                      </button>
                  </div>
              )}
              
              {phase === 'inning_break' && (
                  <div className="mt-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 w-full max-w-sm">
                      <p className="text-slate-400 font-bold mb-2 uppercase tracking-widest">Target to win</p>
                      <p className="text-5xl font-black text-white">{targetScore}</p>
                      <p className="text-sm text-slate-500 mt-2">in {totalBalls} balls</p>
                      
                      <button 
                        onClick={() => startInning(!isUserBatting)}
                        className="mt-8 w-full py-4 bg-emerald-500 text-white font-black rounded-xl uppercase tracking-widest"
                      >
                          Start 2nd Inning
                      </button>
                  </div>
              )}
          </div>
      );
  }
  
  if (phase === 'result') {
      const userWon = userTotalScore > oppTotalScore || (userTotalScore === oppTotalScore && userWickets < oppWickets);
      const tie = userTotalScore === oppTotalScore && userWickets === oppWickets;
      
      return (
          <div className="h-full bg-slate-950 text-white flex flex-col items-center justify-center p-6">
              <div className="relative z-10 text-center mb-8">
                  <h2 className={`text-5xl md:text-6xl font-black mb-2 uppercase tracking-tighter drop-shadow-2xl ${userWon ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400' : tie ? 'text-slate-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500'}`}>
                    {userWon ? 'Victory!' : tie ? 'Match Tied!' : 'Defeat!'}
                  </h2>
              </div>
              
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl w-full max-w-sm flex flex-col gap-6">
                  <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl">
                      <div className="flex flex-col items-center">
                          <span className="text-4xl mb-1">{myTeam.flag}</span>
                          <span className="font-black text-xl">{userTotalScore}/{userWickets}</span>
                      </div>
                      <div className="text-slate-500 font-black italic">VS</div>
                      <div className="flex flex-col items-center">
                          <span className="text-4xl mb-1">{opponent.flag}</span>
                          <span className="font-black text-xl">{oppTotalScore}/{oppWickets}</span>
                      </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                        setPhase('setup');
                        setTargetScore(0);
                        setUserTotalScore(0);
                        setOppTotalScore(0);
                        setUserWickets(0);
                        setOppWickets(0);
                    }}
                    className="w-full py-4 bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-500/30"
                  >
                      Play Again
                  </button>
              </div>
          </div>
      );
  }

  // --- PLAYING VIEW ---
  const battingTeam = isUserBatting ? myTeam : opponent;
  const bowlingTeam = isUserBatting ? opponent : myTeam;

  return (
    <div 
      className={`h-full relative overflow-hidden ${ground.bg} select-none touch-none font-sans`}
      onClick={() => {
          if (isUserBatting && ballState === 'bowling') {
              userBat_handleSwing(false);
          } else if (!isUserBatting && ballState === 'aiming') {
              userBowl_lockAim();
          }
      }}
    >
      {/* 3D Perspective Container */}
      <div className="absolute inset-0 perspective-[800px] flex justify-center overflow-hidden z-10 pointer-events-none">
          {/* Ground Plane */}
          <div 
            className="absolute top-[40%] w-[300%] h-[200%] origin-top rounded-[100%]" 
            style={{ 
                transform: 'rotateX(65deg) translateY(-20%)',
                background: `repeating-linear-gradient(0deg, ${ground.light}, ${ground.light} 40px, ${ground.dark} 40px, ${ground.dark} 80px)`,
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
            }}
          >
              {/* The Pitch */}
              <div 
                className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[180px] h-[700px] border-[3px] border-white/20 shadow-2xl"
                style={{ backgroundColor: ground.pitch }}
              >
                  {/* Creases */}
                  <div className="absolute top-[10%] w-full h-[4px] bg-white opacity-90" />
                  <div className="absolute top-[10%] left-[-20px] w-[20px] h-[4px] bg-white opacity-90" />
                  <div className="absolute top-[10%] right-[-20px] w-[20px] h-[4px] bg-white opacity-90" />

                  <div className="absolute bottom-[10%] w-full h-[4px] bg-white opacity-90" />
                  <div className="absolute bottom-[10%] left-[-20px] w-[20px] h-[4px] bg-white opacity-90" />
                  <div className="absolute bottom-[10%] right-[-20px] w-[20px] h-[4px] bg-white opacity-90" />

                  {/* Pitch dirt/wear patterns */}
                  <div className="absolute inset-x-10 inset-y-[15%] bg-black/5 rounded-[100%] filter blur-md" />
              </div>
          </div>
      </div>

      {/* HUD Scoreboard */}
      <div className="absolute top-4 left-4 z-30 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="flex flex-col">
              <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{battingTeam.name}</span>
              <div className="text-3xl font-black text-white leading-none">
                  {inningScore}<span className="text-xl text-yellow-500">/{inningWickets}</span>
              </div>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="flex flex-col">
              <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">OVERS</span>
              <div className="text-xl font-black text-white leading-none">
                  {Math.floor((totalBalls - ballsLeft)/6)}.{ (totalBalls - ballsLeft)%6 }
              </div>
          </div>
          {phase === 'inning2' && (
              <>
                  <div className="w-px h-8 bg-slate-700" />
                  <div className="flex flex-col">
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">TARGET</span>
                      <div className="text-xl font-black text-cyan-400 leading-none">{targetScore}</div>
                  </div>
              </>
          )}
      </div>

      {/* 2.5D Play Area Elements (Stumps, Batsman, Bowler, Ball) */}
      <div className="absolute inset-0 z-20 pointer-events-none perspective-[800px]">
          
          {/* Fielders */}
          {fielders.map(f => {
              // f.y is 0 to 100 on tactical map. On 3D screen, 0% is near horizon (top), 100% is near user (bottom)
              // But perspective makes them smaller at the top.
              const isMoving = activeFielderAction?.id === f.id;
              
              const fieldY = isMoving ? activeFielderAction.destY : 20 + (f.y * 0.6); // 20% to 80% screen space
              const currentX = isMoving ? activeFielderAction.destX : f.x;
              
              const tacticalYForDepth = isMoving ? (activeFielderAction.destY - 20) / 0.6 : f.y;
              const depthScale = 0.3 + (tacticalYForDepth / 150); 
              
              // Give them moving arms if running
              const armRotate = isMoving ? 'animate-[spin_0.3s_linear_infinite]' : 'rotate-12';
              
              return (
                  <div 
                      key={f.id}
                      className={`absolute transition-all duration-700 ease-out z-10 flex flex-col items-center drop-shadow-xl ${isMoving ? 'scale-110' : ''}`}
                      style={{ 
                          left: `${currentX}%`, 
                          top: `${fieldY}%`, 
                          transform: `translate(-50%, -100%) scale(${depthScale})`,
                          zIndex: Math.floor(tacticalYForDepth) // nearer fielders render on top
                      }}
                  >
                      <div className={`w-6 h-6 ${bowlingTeam.skin} rounded-full border border-black/20 shadow-md z-20`} />
                      <div className={`w-10 h-14 -mt-1 ${bowlingTeam.uniform} rounded-t-xl shadow-xl flex justify-center pt-2 relative z-10`}>
                          {/* Arms */}
                          <div className={`absolute -left-2 top-2 w-3 h-10 ${bowlingTeam.skin} rounded-full ${armRotate} origin-top`}>
                              <div className={`absolute top-0 w-full h-4 ${bowlingTeam.uniform} rounded-t-full`} />
                          </div>
                          <div className={`absolute -right-2 top-2 w-3 h-10 ${bowlingTeam.skin} rounded-full ${armRotate} origin-top`} style={{ animationDelay: isMoving ? '0.15s' : '0s' }}>
                              <div className={`absolute top-0 w-full h-4 ${bowlingTeam.uniform} rounded-t-full`} />
                          </div>
                      </div>
                      <div className="flex gap-1 -mt-1 z-0">
                          <div className={`w-4 h-10 ${bowlingTeam.pants} rounded-b-md border-b border-x border-black/10`} />
                          <div className={`w-4 h-10 ${bowlingTeam.pants} rounded-b-md border-b border-x border-black/10`} />
                      </div>
                  </div>
              )
          })}

          {/* Aim Marker (when bowling) */}
          {!isUserBatting && ballState === 'aiming' && (
              <div 
                className="absolute top-[75%] w-10 h-5 -ml-5 rounded-[100%] border-4 border-cyan-400/80 bg-cyan-400/30 shadow-[0_0_25px_rgba(34,211,238,1)] z-20 transition-all"
                style={{ left: `${aimX}%`, transform: 'rotateX(65deg)' }}
              >
                  <div className="absolute inset-0 border-2 border-white rounded-[100%] animate-ping opacity-50" />
              </div>
          )}

          {/* Bowler's End Stumps (Top) */}
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 flex gap-[2px] items-end h-6 z-10">
                <div className="w-[4px] h-full bg-yellow-500 rounded-t-sm shadow-[inset_-1px_0_3px_rgba(0,0,0,0.3)]" />
                <div className="w-[4px] h-full bg-yellow-500 rounded-t-sm shadow-[inset_-1px_0_3px_rgba(0,0,0,0.3)]" />
                <div className="w-[4px] h-full bg-yellow-500 rounded-t-sm shadow-[inset_-1px_0_3px_rgba(0,0,0,0.3)]" />
          </div>

          {/* Batting End Stumps (Bottom) */}
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex gap-[3px] items-end h-8 z-10">
                <div className={`w-[5px] h-full bg-yellow-500 rounded-t-sm shadow-[inset_-1px_0_3px_rgba(0,0,0,0.4)] transition-transform duration-500 origin-bottom ${isWicketHit && isUserBatting ? '-rotate-[60deg] -translate-x-8 translate-y-4 opacity-0' : ''}`} />
                <div className={`w-[5px] h-full bg-yellow-500 rounded-t-sm shadow-[inset_-1px_0_3px_rgba(0,0,0,0.4)] transition-transform duration-500 origin-bottom ${isWicketHit && isUserBatting ? '-rotate-[20deg] translate-y-4 opacity-0' : ''}`} />
                <div className={`w-[5px] h-full bg-yellow-500 rounded-t-sm shadow-[inset_-1px_0_3px_rgba(0,0,0,0.4)] transition-transform duration-500 origin-bottom ${isWicketHit && isUserBatting ? 'rotate-[70deg] translate-x-8 translate-y-4 opacity-0' : ''}`} />
          </div>

          {/* Bowler Avatar (Top) */}
          <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center transition-all ${ballState === 'run_up' || ballState === 'bowling' ? 'duration-[1200ms] ease-out' : 'duration-[200ms]'} ${ballState === 'run_up' || ballState === 'bowling' ? 'top-[36%] scale-[0.3]' : 'top-[28%] scale-[0.15]'}`}>
               {/* Head/Hair */}
               <div className={`w-12 h-12 ${bowlingTeam.skin} rounded-full border border-black/20 z-20 relative shadow-md transition-transform ${ballState === 'run_up' ? 'animate-bounce' : ''}`}>
                   <div className="absolute top-0 inset-x-0 h-4 bg-black/80 rounded-t-full" /> {/* Hair */}
                   <div className="absolute top-[40%] right-2 w-2 h-2 bg-black/60 rounded-full" /> {/* Eye */}
               </div>
               
               {/* Torso & Arms */}
               <div className="relative z-10 flex flex-col items-center -mt-1">
                   <div className={`w-12 h-14 ${bowlingTeam.uniform} rounded-t-2xl shadow-xl flex justify-center pt-2 relative border border-white/10`}>
                        <div className="w-3 h-full bg-black/10 absolute left-1" /> {/* shading */}
                   </div>
                   
                   {/* Bowling Arm (animate when bowling) */}
                   <div className={`absolute -right-3 top-2 w-4 h-14 ${bowlingTeam.skin} rounded-full origin-top transition-transform duration-[400ms] ease-in ${ballState === 'bowling' ? '-rotate-[200deg]' : ballState === 'run_up' ? 'rotate-[40deg]' : 'rotate-[20deg]'}`}>
                       {/* Sleeve */}
                       <div className={`absolute top-0 w-full h-5 ${bowlingTeam.uniform} rounded-t-full`} />
                       {/* Hand / Ball */}
                       {ballState === 'idle' || ballState === 'aiming' || ballState === 'run_up' ? (
                           <div className="absolute -bottom-2 -left-1 w-5 h-5 rounded-full shadow-md" style={{ backgroundColor: selectedBall.color }} />
                       ) : null}
                   </div>
                   {/* Other Arm */}
                   <div className={`absolute -left-3 top-2 w-4 h-12 ${bowlingTeam.skin} rounded-full origin-top ${ballState === 'run_up' ? 'animate-pulse -rotate-[40deg]' : 'rotate-[-20deg]'}`}>
                       <div className={`absolute top-0 w-full h-5 ${bowlingTeam.uniform} rounded-t-full`} />
                   </div>
               </div>

               {/* Legs */}
               <div className="flex gap-[3px] -mt-1 z-0">
                  <div className={`w-5 h-12 ${bowlingTeam.pants} border-x border-b border-black/20 rounded-b-md shadow-inner relative transition-transform ${ballState === 'run_up' ? 'animate-pulse translate-y-[-2px]' : ''}`}>
                      <div className="absolute -bottom-1.5 left-0 w-5 h-2 bg-white rounded-t-sm border border-slate-300" /> {/* Shoe */}
                  </div>
                  <div className={`w-5 h-12 ${bowlingTeam.pants} border-x border-b border-black/20 rounded-b-md shadow-inner relative transition-transform ${ballState === 'run_up' ? 'animate-pulse translate-y-[2px]' : ''}`}>
                      <div className="absolute -bottom-1.5 left-0 w-5 h-2 bg-white rounded-t-sm border border-slate-300" /> {/* Shoe */}
                  </div>
               </div>
          </div>

          {/* Batsman Avatar (Bottom) */}
          <div className={`absolute bottom-[23%] left-[42%] transition-transform duration-150 z-30 origin-bottom`} style={{ transform: `translateX(-50%) ${batSwing && isUserBatting ? 'translateX(-30px)' : 'translateX(0)'} scale(0.35)` }}>
              <div className="relative flex flex-col items-center">
                  {/* Head & Helmet */}
                  <div className="relative w-14 h-16 z-30 flex flex-col items-center transition-transform duration-150" style={{ transform: batSwing ? 'rotate(-10deg) translate(-5px, 2px)' : 'rotate(15deg) translate(5px, 0)' }}>
                      <div className={`w-14 h-14 ${battingTeam.helmet} rounded-t-3xl rounded-b-xl border-4 border-black/40 relative shadow-[0_15px_30px_rgba(0,0,0,0.6)]`}>
                          <div className="absolute top-1/2 inset-x-1.5 h-5 border-[4px] border-slate-300 rounded-lg flex flex-col justify-between p-[1px]">
                              <div className="w-full h-[2px] bg-slate-300" />
                          </div> {/* Grill */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-black/20 rounded-full" /> {/* Visor detail */}
                      </div>
                      <div className={`absolute bottom-0 w-7 h-4 ${battingTeam.skin} rounded-b-md z-[-1] border-x border-b border-black/20`} /> {/* Neck/face */}
                  </div>
                  
                  {/* Torso */}
                  <div className={`w-20 h-24 -mt-2 ${battingTeam.uniform} rounded-t-[2rem] z-20 shadow-2xl border-x border-t border-white/10 flex justify-center pt-4 relative`}>
                      <span className="text-white/60 font-black text-3xl">10</span>
                      {/* Left Arm (Front) */}
                      <div className={`absolute -left-5 top-2 w-7 h-20 ${battingTeam.skin} rounded-full origin-top transition-transform duration-150 ${batSwing ? '-rotate-[110deg] -translate-y-4 -translate-x-6' : 'rotate-[35deg]'}`}>
                          <div className={`absolute top-0 w-full h-8 ${battingTeam.uniform} rounded-t-full shadow-inner`} />
                          {/* Glove */}
                          <div className="absolute -bottom-2 -left-1 w-8 h-8 bg-white border border-slate-300 rounded-xl" />
                      </div>
                  </div>
                  
                  {/* Right Arm (Back) */}
                  <div className={`absolute -right-2 top-[3.5rem] w-7 h-20 ${battingTeam.skin} rounded-full z-10 origin-top transition-transform duration-150 ${batSwing ? '-rotate-[130deg] -translate-x-5 -translate-y-6' : 'rotate-[15deg]'}`}>
                      <div className={`absolute top-0 w-full h-8 ${battingTeam.uniform} rounded-t-full shadow-inner`} />
                      {/* Glove */}
                      <div className="absolute -bottom-2 -left-1 w-8 h-8 bg-white border border-slate-300 rounded-xl shadow-md" />
                  </div>

                  {/* Legs with Pads */}
                  <div className="flex gap-3 -mt-2 z-10 transition-transform duration-150" style={{ transform: batSwing ? 'translate(10px, 0)' : 'translate(0, 0)' }}>
                      <div className={`w-7 h-24 ${battingTeam.pants} rounded-t-md rounded-b-xl border border-black/10 flex flex-col items-center relative`}>
                          <div className="absolute -bottom-2 w-8 h-4 bg-white rounded-t-md border border-slate-300" /> {/* Shoe */}
                          <div className="absolute top-1 w-8 h-[5.5rem] bg-white rounded-t-md rounded-b-xl border-2 border-slate-200 shadow-[inset_-3px_0_6px_rgba(0,0,0,0.2)] flex flex-col justify-around py-2 px-1 z-10">
                              <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                              <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                              <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                          </div> {/* Pad */}
                      </div>
                      <div className={`w-7 h-24 ${battingTeam.pants} rounded-t-md rounded-b-xl border border-black/10 flex flex-col items-center relative`}>
                          <div className="absolute -bottom-2 w-8 h-4 bg-white rounded-t-md border border-slate-300" /> {/* Shoe */}
                          <div className="absolute top-1 w-8 h-[5.5rem] bg-white rounded-t-md rounded-b-xl border-2 border-slate-200 shadow-[inset_-3px_0_6px_rgba(0,0,0,0.2)] flex flex-col justify-around py-2 px-1 z-10">
                              <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                              <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                              <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                          </div> {/* Pad */}
                      </div>
                  </div>

                  {/* Bat Component */}
                  <div className={`absolute left-0 top-[5.5rem] origin-[top_center] transition-transform duration-150 z-40 ${batSwing ? '-rotate-[130deg] -translate-x-12 -translate-y-8' : 'rotate-[25deg] translate-x-4 translate-y-2'}`}>
                      {/* Handle */}
                      <div className="w-4 h-16 bg-slate-800 rounded-t-md mx-auto relative shadow-inner">
                          <div className="absolute top-2 w-full h-1 bg-slate-900" />
                          <div className="absolute top-6 w-full h-1 bg-slate-900" />
                          <div className="absolute top-10 w-full h-1 bg-slate-900" />
                      </div>
                      {/* Blade */}
                      <div className={`w-9 h-44 ${selectedBat.color} rounded-b-xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] border border-black/30 overflow-hidden relative -ml-[2px]`}>
                          <div className="absolute inset-x-0 bottom-4 h-12 bg-black/20" /> {/* Grip wrap */}
                          <div className="absolute left-[4px] top-0 bottom-0 w-[2px] bg-white/30" />
                          <div className="absolute left-[10px] top-0 bottom-0 w-[1px] bg-black/20" />
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Ball Element - Rendered on top of 2.5D but manually positioned */}
      <div 
          className={`absolute w-3 h-3 md:w-4 md:h-4 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.6)] z-40 pointer-events-none transition-all ${ballState === 'bowling' ? 'duration-[1200ms] ease-linear' : ballState === 'hit' ? 'duration-[400ms] ease-out' : 'duration-[0ms]'} ${ballState === 'run_up' || ballState === 'idle' ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            left: `calc(${ballX}% - 6px)`, 
            top: `${ballY}%`,
            transform: `scale(${ballScale})`,
            backgroundColor: selectedBall.color,
            boxShadow: `inset -2px -2px 5px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.4)`
          }}
      >
          {/* Seam */}
          <div className={`absolute inset-0 border-[1px] border-white/50 rounded-full ${ballState === 'bowling' ? 'animate-[spin_0.2s_linear_infinite]' : ''}`} />
      </div>

      {/* Umpire Message */}
      {umpireMsg && (
        <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center pointer-events-none w-full flex flex-col items-center">
            {umpireMsg !== 'SET PITCH LINE' && (
                <div className="text-[10px] md:text-sm font-black uppercase text-white bg-slate-900/90 border border-slate-700 shadow-2xl px-6 py-2 rounded-full mb-4 flex items-center gap-2 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <User className="w-4 h-4 text-emerald-400" /> Umpire Decision
                </div>
            )}
            <div className={`text-5xl md:text-7xl font-black uppercase tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] italic stroke-black ${umpireMsg.includes('OUT') || umpireMsg.includes('BOWLED') || umpireMsg.includes('CAUGHT') || umpireMsg.includes('MISSED') ? 'text-red-500' : umpireMsg === 'SET PITCH LINE' ? 'text-cyan-400' : 'text-yellow-400 scale-110'}`} style={{ WebkitTextStroke: '2px #1e293b' }}>
                {umpireMsg}
            </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 inset-x-0 p-4 md:p-8 pb-safe z-50 flex justify-center">
          {isUserBatting ? (
              <div className="w-full max-w-sm flex flex-col gap-4">
                  {ballState === 'idle' && !umpireMsg && (
                      <button 
                        onPointerDown={(e) => { e.stopPropagation(); userBat_bowlNextBall(); }}
                        className="w-full py-5 md:py-6 bg-gradient-to-b from-cyan-400 to-cyan-600 border border-cyan-300 text-white font-black rounded-full shadow-[0_10px_40px_rgba(6,182,212,0.6)] text-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                      >READY FOR BOWL</button>
                  )}
                  {ballState === 'run_up' && (
                      <div className="w-full py-5 md:py-6 text-center text-cyan-400 font-black text-xl uppercase tracking-widest animate-pulse">
                          BOWLER RUNNING IN...
                      </div>
                  )}
                  {ballState === 'bowling' && (
                      <div className="flex gap-4 w-full pointer-events-auto">
                          <button 
                            onPointerDown={(e) => { e.stopPropagation(); userBat_handleSwing(false, 'ground'); }}
                            className="flex-1 py-10 md:py-12 bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-300 backdrop-blur text-white font-black rounded-full shadow-[0_10px_50px_rgba(59,130,246,0.8)] text-2xl md:text-3xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >GROUND</button>
                          <button 
                            onPointerDown={(e) => { e.stopPropagation(); userBat_handleSwing(false, 'loft'); }}
                            className="flex-1 py-10 md:py-12 bg-gradient-to-b from-pink-500 to-pink-700 border-2 border-pink-300 backdrop-blur text-white font-black rounded-full shadow-[0_10px_50px_rgba(236,72,153,0.8)] text-2xl md:text-3xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all animate-pulse cursor-pointer"
                          >LOFT</button>
                      </div>
                  )}
              </div>
          ) : (
              <div className="w-full max-w-sm flex flex-col gap-4">
                  {ballState === 'idle' && !umpireMsg && (
                      <div className="flex flex-col gap-3 pointer-events-auto">
                          <button 
                            onPointerDown={(e) => { e.stopPropagation(); userBowl_startAiming(); }}
                            className="w-full py-5 md:py-6 bg-gradient-to-b from-emerald-400 to-emerald-600 border border-emerald-300 text-white font-black rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.6)] text-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >START AIMING</button>
                          
                          <div className="flex gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowFieldMap(true); }}
                                className="flex-1 py-3 bg-slate-800 border border-slate-600 text-cyan-400 font-black rounded-xl text-sm uppercase tracking-widest hover:bg-slate-700 transition-colors"
                              >
                                  <MapPin className="w-4 h-4 inline mr-1" /> Field
                              </button>
                              
                              <div className="flex-1 flex overflow-hidden rounded-xl border border-slate-600 bg-slate-800">
                                  {BALLS.slice(1, 3).map(b => (
                                      <button
                                        key={b.id}
                                        onClick={(e) => { e.stopPropagation(); setSelectedBall(b); }}
                                        className={`flex-1 py-3 font-bold text-[10px] uppercase transition-colors ${selectedBall.id === b.id ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                                      >
                                        {b.name.split(' ')[1]}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}
                  {ballState === 'aiming' && (
                      <button 
                        onPointerDown={(e) => { e.stopPropagation(); userBowl_lockAim(); }}
                        className="w-full py-10 md:py-12 bg-gradient-to-b from-cyan-500 to-cyan-700 border-2 border-cyan-300 backdrop-blur text-white font-black rounded-full shadow-[0_10px_50px_rgba(6,182,212,0.8)] text-3xl md:text-4xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all animate-pulse cursor-pointer pointer-events-auto"
                      >LOCK BOWL</button>
                  )}
              </div>
          )}
      </div>
      
      {/* Field Map Overlay */}
      {showFieldMap && (
          <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4 touch-none">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6">Tactical Field Setup</h2>
              <div 
                  className="w-full max-w-[300px] aspect-[4/5] bg-emerald-700 rounded-[120px] border-4 border-white/20 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                  onPointerMove={(e) => {
                      if (draggedFielder !== null) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;
                          setFielders(prev => prev.map(f => f.id === draggedFielder ? { ...f, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } : f));
                      }
                  }}
                  onPointerUp={() => setDraggedFielder(null)}
                  onPointerLeave={() => setDraggedFielder(null)}
              >
                  {/* Pitch */}
                  <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-8 h-24 bg-[#d9b382] border border-white/30" />
                  
                  {/* Inner Circle */}
                  <div className="absolute top-[25%] left-[15%] right-[15%] bottom-[25%] rounded-[100px] border-2 border-dashed border-white/30 pointer-events-none" />

                  {/* Fielders */}
                  {fielders.map(f => (
                      <div 
                          key={f.id}
                          onPointerDown={(e) => { e.stopPropagation(); setDraggedFielder(f.id); }}
                          className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${draggedFielder === f.id ? 'scale-150 bg-yellow-400 z-50' : `scale-100 ${bowlingTeam.uniform} z-10`}`}
                          style={{ left: `${f.x}%`, top: `${f.y}%` }}
                      >
                          <span className="text-[8px] font-black text-white">{f.id + 1}</span>
                      </div>
                  ))}
              </div>
              <p className="text-slate-400 text-sm mt-6 mb-4">Drag fielders to position</p>
              <button 
                  onClick={() => setShowFieldMap(false)}
                  className="px-8 py-4 bg-emerald-500 text-white font-black rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 transition-transform"
              >
                  Confirm Formation
              </button>
          </div>
      )}
      
      {/* Bowler Select Overlay */}
      {showBowlerSelect && !showFieldMap && (
          <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 text-center">Select Bowler for this Over</h2>
              <div className="flex gap-4">
                  {BALLS.slice(1, 3).map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                            setSelectedBall(b);
                            setShowBowlerSelect(false);
                            toast({ title: 'Bowler Selected', message: `You chose ${b.name}` });
                        }}
                        className={`px-8 py-6 rounded-2xl font-black uppercase text-xl transition-all border-4 ${selectedBall.id === b.id ? 'bg-cyan-500 text-white border-cyan-300 scale-110 shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:scale-105 hover:bg-slate-700'}`}
                      >
                        {b.name.split(' ')[1]}
                      </button>
                  ))}
              </div>
          </div>
      )}

    </div>
  );
};
