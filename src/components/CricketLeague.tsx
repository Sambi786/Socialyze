import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trophy, Flag, Share2, Zap, MapPin, User, Loader2 } from 'lucide-react';
import { playArcadeSound } from '../utils/audio';
import { useAppContext } from '../AppContext';
import { toast } from '../lib/toast';
import { ShareModal } from './ShareModal';

const GROUNDS = [
  { id: 'mumbai', name: 'Mumbai', entryFee: 250, prize: 500, light: '#a3e635', dark: '#65a30d', pitch: '#cd853f', text: 'text-orange-900', bg: 'bg-gradient-to-b from-orange-400 to-orange-200' },
  { id: 'london', name: 'London', entryFee: 1000, prize: 2000, light: '#4ade80', dark: '#22c55e', pitch: '#d9b382', text: 'text-emerald-800', bg: 'bg-gradient-to-b from-blue-400 to-blue-200' },
  { id: 'melbourne', name: 'Melbourne', entryFee: 5000, prize: 10000, light: '#0d9488', dark: '#0f766e', pitch: '#78716c', text: 'text-cyan-400', bg: 'bg-gradient-to-b from-red-600 to-red-400' },
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
  const [menuTab, setMenuTab] = useState<'home' | 'play' | 'store'>('home');
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
    const defaultFielders = [
      { id: 0, x: 45, y: 15 }, // Wicket Keeper
      { id: 1, x: 30, y: 30 }, // Point
      { id: 2, x: 20, y: 50 }, // Cover
      { id: 3, x: 35, y: 70 }, // Mid-off
      { id: 4, x: 65, y: 70 }, // Mid-on
      { id: 5, x: 80, y: 50 }, // Mid-wicket
      { id: 6, x: 75, y: 30 }, // Square leg
      { id: 7, x: 65, y: 10 }, // Fine leg
      { id: 8, x: 25, y: 10 }, // Third man
  ];
  const [fielders, setFielders] = useState<{id: number, x: number, y: number}[]>(defaultFielders);
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

  const { completeMission } = useAppContext();
  useEffect(() => {
    if (phase === 'result') {
      completeMission('win_match', 50);
    }
  }, [phase, completeMission]);
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
          <div className="h-full bg-slate-950 text-white flex flex-col relative overflow-hidden font-sans">
              
              {/* Top Bar - Socialize League Style */}
              <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                 <div className="flex items-center gap-3 bg-white/5 rounded-full pr-5 pl-1 py-1 border border-white/10 shadow-lg backdrop-blur-md">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-inner">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                     </div>
                     <span className="font-bold text-white text-sm tracking-wide">{user?.username || 'Player_9381'}</span>
                 </div>
                 <div className="flex gap-3">
                     <div className="flex items-center bg-white/5 rounded-full px-3 py-1.5 border border-white/10 shadow-lg backdrop-blur-md">
                         <div className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-[12px] font-black mr-2 shadow-sm">S</div>
                         <span className="font-black text-white text-sm mr-2">25,500</span>
                         <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white text-lg leading-none hover:bg-white/20 cursor-pointer transition-colors">+</div>
                     </div>
                 </div>
              </div>

              {menuTab === 'home' && (
                  <div className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900 to-slate-950">
                      {/* Cool Hexagon Background */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                      <div className="absolute bottom-[20%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                      <div className="absolute top-[20%] w-64 h-64 md:w-96 md:h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
                      
                      {/* Logo Area */}
                      <div className="absolute top-[18%] flex flex-col items-center z-30 animate-pulse" style={{ animationDuration: '3s' }}>
                          <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-2xl">
                              SOCIALIZE
                          </h1>
                          <h2 className="text-3xl md:text-4xl font-black tracking-widest text-white uppercase drop-shadow-lg -mt-2">
                              League
                          </h2>
                      </div>

                      {/* Character Customization (Team/Bat) */}
                      <div className="absolute left-2 sm:left-6 top-[55%] -translate-y-1/2 flex flex-col gap-4 z-30">
                          <div className="bg-slate-900/60 p-3 rounded-3xl border border-white/10 backdrop-blur-xl flex flex-col gap-3 shadow-2xl">
                              <span className="text-indigo-300 text-[10px] font-black uppercase text-center tracking-widest">Team</span>
                              <div className="flex flex-col gap-2">
                              {TEAMS.map(team => (
                                  <button
                                      key={team.name}
                                      onClick={() => { setMyTeam(team); if(opponent.name === team.name) setOpponent(TEAMS.find(t => t.name !== team.name)!); }}
                                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-300 ${myTeam.name === team.name ? 'border-purple-400 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)] ' + team.color : 'border-white/10 bg-white/5 opacity-60 hover:opacity-100 hover:scale-105'}`}
                                      title={team.name}
                                  >
                                      {team.flag}
                                  </button>
                              ))}
                              </div>
                          </div>
                      </div>

                      <div className="absolute right-2 sm:right-6 top-[55%] -translate-y-1/2 flex flex-col gap-4 z-30">
                          <div className="bg-slate-900/60 p-3 rounded-3xl border border-white/10 backdrop-blur-xl flex flex-col gap-3 shadow-2xl">
                              <span className="text-indigo-300 text-[10px] font-black uppercase text-center tracking-widest">Bat</span>
                              <div className="flex flex-col gap-2">
                              {BATS.map(bat => (
                                  <button
                                      key={bat.id}
                                      onClick={() => setSelectedBat(bat)}
                                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selectedBat.id === bat.id ? 'border-purple-400 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)] bg-slate-800' : 'border-white/10 bg-white/5 opacity-60 hover:opacity-100 hover:scale-105'}`}
                                      title={bat.name}
                                  >
                                      <div className={`w-1.5 h-4 md:w-2 md:h-5 ${bat.color} rounded-sm`} />
                                  </button>
                              ))}
                              </div>
                          </div>
                      </div>

                      {/* Character Avatar - Modernized */}
                      <div className="absolute bottom-[28%] flex flex-col items-center">
                          <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-500">
                              {/* Glow behind */}
                              <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-2xl group-hover:bg-purple-500/40 transition-colors" />
                              <div className={`w-32 h-44 md:w-40 md:h-56 ${myTeam.uniform} rounded-t-[40px] md:rounded-t-[60px] rounded-b-3xl relative flex flex-col items-center justify-start pt-6 border border-white/20 shadow-2xl z-10 overflow-hidden`}>
                                  {/* Jersey details */}
                                  <div className="w-full h-4 bg-black/20 absolute top-12" />
                                  <div className="w-8 h-full bg-black/10 absolute left-4 skew-x-12" />
                                  
                                  <div className="w-16 h-20 md:w-20 md:h-24 bg-amber-200/90 rounded-full absolute -top-14 border border-white/20 overflow-hidden flex flex-col items-center pt-3 shadow-inner">
                                      <div className={`w-full h-10 ${myTeam.helmet} absolute top-0 shadow-md`} />
                                      {/* Visor */}
                                      <div className="w-10 h-3 md:w-12 md:h-4 bg-black/80 rounded-full absolute top-5 md:top-6" />
                                  </div>
                                  <div className="absolute right-[-10px] top-20 rotate-[25deg] origin-top drop-shadow-2xl">
                                      <div className={`w-6 h-32 md:w-8 md:h-40 ${selectedBat.color} rounded-b-2xl shadow-2xl border border-white/20 relative overflow-hidden`}>
                                          <div className="absolute top-0 inset-x-0 h-12 bg-black/80 rounded-t-sm" />
                                          <div className="absolute bottom-4 inset-x-2 h-16 bg-white/10 rounded-sm" />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Giant PLAY button - Cyberpunk/Neon style */}
                      <div className="absolute bottom-[12%] md:bottom-[10%] w-full px-4 md:px-8 flex justify-center z-20">
                          <button 
                              onClick={() => setMenuTab('play')}
                              className="w-full max-w-sm py-4 md:py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.5)] text-3xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group"
                          >
                              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                              Let's Play
                          </button>
                      </div>
                  </div>
              )}

              {menuTab === 'play' && (
                  <div className="flex-1 flex flex-col relative bg-slate-950 pt-16">
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black pointer-events-none" />
                      
                      <div className="w-full mt-10 mb-4 flex flex-col items-center z-10">
                          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 uppercase drop-shadow-lg text-center">
                              Online Matches
                          </h1>
                          <p className="text-slate-400 font-medium tracking-wide mt-2 text-sm uppercase">Select an arena to challenge players</p>
                      </div>
                      
                      <div className="w-full flex-1 flex flex-col justify-center relative z-10">
                          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-8 pt-4 hide-scrollbar items-center">
                              {GROUNDS.map((g, index) => (
                                  <div 
                                      key={g.id}
                                      className={`snap-center shrink-0 w-[240px] md:w-[280px] h-[280px] md:h-[400px] rounded-[2rem] relative overflow-hidden transition-all duration-500 ${ground.id === g.id ? 'scale-100 shadow-[0_0_50px_rgba(168,85,247,0.4)] border border-purple-500' : 'scale-90 border border-white/10 opacity-60 hover:opacity-100 cursor-pointer hover:scale-95'}`}
                                      onClick={() => setGround(g)}
                                  >
                                      {/* Background */}
                                      <div className={`absolute inset-0 ${g.bg}`} />
                                      <div className={`absolute bottom-0 inset-x-0 h-[50%]`} style={{ background: `repeating-linear-gradient(0deg, ${g.light}, ${g.light} 10px, ${g.dark} 10px, ${g.dark} 20px)` }} />
                                      <div className={`absolute bottom-0 inset-x-[20%] w-[60%] h-[40%]`} style={{ backgroundColor: g.pitch }} />
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                                      {/* League Info */}
                                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                          <div className="flex flex-col items-center mt-2">
                                              <span className="text-indigo-400 text-[10px] font-black tracking-widest uppercase mb-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 backdrop-blur-md">Tier {index + 1}</span>
                                              <h2 className="text-3xl font-black text-white tracking-tighter uppercase drop-shadow-2xl text-center leading-none mt-2">{g.name}</h2>
                                          </div>
                                          
                                          <div className="flex flex-col gap-3">
                                              <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                                                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Entry Fee</span>
                                                  <span className="text-white font-black flex items-center gap-1.5 text-sm">
                                                      <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">S</div>
                                                      {g.entryFee}
                                                  </span>
                                              </div>
                                              <div className="flex justify-between items-center bg-purple-500/20 p-3 rounded-2xl border border-purple-500/30 backdrop-blur-md">
                                                  <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">Prize</span>
                                                  <span className="text-purple-300 font-black flex items-center gap-1.5 text-sm">
                                                      <div className="w-5 h-5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">S</div>
                                                      {g.prize}
                                                  </span>
                                              </div>
                                              
                                              {ground.id === g.id && (
                                                  <button 
                                                      onClick={(e) => { e.stopPropagation(); handleToss(); }}
                                                      className="w-full mt-4 py-4 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest shadow-[0_10px_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-transform"
                                                  >
                                                      Matchmake
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {menuTab === 'store' && (
                  <div className="flex-1 flex flex-col relative bg-slate-950 p-6 overflow-y-auto pt-24 pb-32">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-900 via-slate-900 to-black pointer-events-none" />
                      
                      <div className="w-full mt-4 mb-8 flex flex-col items-center z-10">
                          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400 uppercase drop-shadow-lg text-center">
                              Equipment Store
                          </h1>
                          <p className="text-slate-400 font-medium tracking-wide mt-2 text-sm uppercase">Upgrade your gear with Sambi bonuses</p>
                      </div>

                      <div className="w-full max-w-2xl mx-auto z-10 space-y-8">
                          {/* Bats */}
                          <div>
                              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2"><Zap className="text-pink-400" /> PRO BATS</h2>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {BATS.map((bat, i) => (
                                      <div key={bat.id} onClick={() => setSelectedBat(bat)} className={`bg-white/5 border rounded-3xl p-4 flex flex-col items-center gap-3 backdrop-blur-md relative overflow-hidden group hover:border-pink-500/50 transition-colors cursor-pointer ${selectedBat.id === bat.id ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'border-white/10'}`}>
                                          <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          <div className={`w-4 h-24 ${bat.color} rounded-sm shadow-xl border border-white/20 rotate-[-20deg] my-2`} />
                                          <div className="text-center">
                                              <h3 className="font-bold text-white uppercase">{bat.name}</h3>
                                              <div className="flex gap-1 justify-center text-xs text-slate-400 mt-1">Power: <span className="text-pink-400 font-black">+{Math.floor(bat.power * 10)}</span></div>
                                          </div>
                                          <button className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors mt-2 ${selectedBat.id === bat.id ? 'bg-pink-500 text-white' : 'bg-white/10 hover:bg-pink-500/80 hover:text-white'}`}>
                                              {selectedBat.id === bat.id ? 'Equipped' : `Buy ${(i+1)*2500} S`}
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* Balls */}
                          <div>
                              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2"><MapPin className="text-orange-400" /> ELITE BALLS</h2>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {BALLS.map((ball, i) => (
                                      <div key={ball.id} onClick={() => setSelectedBall(ball)} className={`bg-white/5 border rounded-3xl p-4 flex flex-col items-center gap-3 backdrop-blur-md relative overflow-hidden group hover:border-orange-500/50 transition-colors cursor-pointer ${selectedBall.id === ball.id ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-white/10'}`}>
                                          <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          <div className={`w-16 h-16 rounded-full shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.5)] my-2 relative`} style={{ background: `radial-gradient(circle at 30% 30%, ${ball.color}, ${ball.color === 'white' ? '#e2e8f0' : '#7f1d1d'})` }}>
                                             {/* Seam */}
                                             <div className="absolute inset-0 border-2 border-dashed border-black/20 rounded-full" style={{ transform: 'rotate(45deg)' }} />
                                          </div>
                                          <div className="text-center">
                                              <h3 className="font-bold text-white uppercase">{ball.name}</h3>
                                              <div className="flex flex-col gap-0.5 text-[10px] text-slate-400 mt-1">
                                                <div>Pace: <span className="text-orange-400 font-black">+{Math.floor(ball.pace * 10)}</span></div>
                                                <div>Swing: <span className="text-orange-400 font-black">+{Math.floor(ball.swing * 10)}</span></div>
                                              </div>
                                          </div>
                                          <button className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors mt-2 ${selectedBall.id === ball.id ? 'bg-orange-500 text-white' : 'bg-white/10 hover:bg-orange-500/80 hover:text-white'}`}>
                                              {selectedBall.id === ball.id ? 'Equipped' : `Buy ${(i+1)*1500} S`}
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Bottom Nav Bar - Modern UI */}
              <div className="w-full bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 py-4 pb-safe z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] absolute bottom-0">
                  <button onClick={() => setMenuTab('home')} className={`flex flex-col items-center gap-1.5 transition-colors ${menuTab === 'home' ? 'text-indigo-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
                      <div className={`p-0 rounded-xl`}>
                          <User className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
                  </button>
                  <button onClick={() => setMenuTab('play')} className={`flex flex-col items-center gap-1.5 transition-colors ${menuTab === 'play' ? 'text-purple-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
                      <div className={`p-0 rounded-xl`}>
                          <Trophy className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Leagues</span>
                  </button>
                  <button onClick={() => setMenuTab('store')} className={`flex flex-col items-center gap-1.5 transition-colors ${menuTab === 'store' ? 'text-pink-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
                      <div className="p-0">
                          <Zap className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Store</span>
                  </button>
                  <button onClick={onExit} className="flex flex-col items-center gap-1.5 text-rose-500/70 hover:text-rose-400 transition-colors">
                      <div className="p-0">
                          <ArrowLeft className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Exit</span>
                  </button>
              </div>
          </div>
      );
  }if (phase === 'toss' || phase === 'inning_break') {
      return (
          <div className="flex-1 w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative">
              <button 
                onClick={onExit} 
                className="absolute top-4 left-4 z-[100] p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
              >
                  <ArrowLeft className="w-6 h-6 text-slate-300" />
              </button>
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
          <div className="h-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative">
              <button 
                onClick={onExit} 
                className="absolute top-4 left-4 z-[100] p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
              >
                  <ArrowLeft className="w-6 h-6 text-slate-300" />
              </button>
              <div className="relative z-10 text-center mb-8">
                  <h2 className={`text-5xl md:text-6xl font-black mb-2 uppercase tracking-tighter drop-shadow-2xl ${userWon ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400' : tie ? 'text-slate-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500'}`}>
                    {userWon ? 'Victory!' : tie ? 'Match Tied!' : 'Defeat!'}
                  </h2>
              </div>
              
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl w-full max-w-sm flex flex-col gap-6 relative z-10">
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
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-5 h-5" /> Share
                    </button>
                    <button 
                      onClick={() => {
                          setPhase('setup');
                          setTargetScore(0);
                          setUserTotalScore(0);
                          setOppTotalScore(0);
                          setUserWickets(0);
                          setOppWickets(0);
                      }}
                      className="flex-[2] py-4 bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-500/30"
                    >
                        Play Again
                    </button>
                  </div>
              </div>

              <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={`I ${userWon ? 'won' : 'played'} a Cricket match! ${myTeam.name}: ${userTotalScore}/${userWickets} vs ${opponent.name}: ${oppTotalScore}/${oppWickets}`}
                url="https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=600"
              />
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
      {/* Universal Exit Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onExit(); }} 
        className="absolute top-4 left-4 z-[100] p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors border border-white/10"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
            {/* 3D Perspective Container */}
      
<style>{
`
@keyframes legSwingLeft {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(15deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(2px) rotate(-15deg); }
  100% { transform: translateY(0) rotate(0deg); }
}
@keyframes legSwingRight {
  0% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(2px) rotate(-15deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-5px) rotate(15deg); }
  100% { transform: translateY(0) rotate(0deg); }
}
@keyframes breathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.95) translateY(2px); }
}
@keyframes swingBat {
  0% { transform: rotate(25deg) translate(4px, 2px); }
  40% { transform: rotate(-130deg) translate(-12px, -8px); }
  100% { transform: rotate(-150deg) translate(-15px, -10px); }
}
`
}</style>

      <div className="absolute inset-0 perspective-[800px] flex justify-center overflow-hidden z-10 pointer-events-none">
          {/* Ground Plane */}
          <div 
            className="absolute top-[35%] w-[350%] h-[250%] origin-top rounded-[50%]" 
            style={{ 
                transform: 'rotateX(68deg) translateY(-15%)',
                background: `radial-gradient(circle at 50% 50%, ${ground.light} 0%, ${ground.dark} 70%, #064e3b 100%)`,
                boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)'
            }}
          >
              {/* Grass Pattern overlay */}
              <div 
                  className="absolute inset-0 opacity-30" 
                  style={{ background: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)` }}
              />
              
              {/* Boundary Rope */}
              <div className="absolute inset-[15%] rounded-[50%] border-[6px] border-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)] border-dashed" />
              <div className="absolute inset-[15%] rounded-[50%] border-[2px] border-white opacity-50" />
              
              {/* 30 Yard Circle */}
              <div className="absolute top-[30%] left-[35%] right-[35%] bottom-[30%] rounded-[50%] border-[3px] border-white/50 border-dotted" />

              {/* The Pitch */}
              <div 
                className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[140px] h-[650px] border-[2px] border-white/30 shadow-2xl rounded-sm"
                style={{ 
                    backgroundColor: ground.pitch,
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 10px)'
                }}
              >
                  {/* Creases */}
                  <div className="absolute top-[12%] w-full h-[5px] bg-white shadow-sm" />
                  <div className="absolute top-[12%] left-[-20px] w-[20px] h-[5px] bg-white shadow-sm" />
                  <div className="absolute top-[12%] right-[-20px] w-[20px] h-[5px] bg-white shadow-sm" />
                  
                  <div className="absolute bottom-[12%] w-full h-[5px] bg-white shadow-sm" />
                  <div className="absolute bottom-[12%] left-[-20px] w-[20px] h-[5px] bg-white shadow-sm" />
                  <div className="absolute bottom-[12%] right-[-20px] w-[20px] h-[5px] bg-white shadow-sm" />
                  
                  {/* Wide lines */}
                  <div className="absolute bottom-[12%] left-[10px] w-[3px] h-[100px] bg-white/70" />
                  <div className="absolute bottom-[12%] right-[10px] w-[3px] h-[100px] bg-white/70" />
                  <div className="absolute top-[12%] left-[10px] w-[3px] h-[100px] bg-white/70" />
                  <div className="absolute top-[12%] right-[10px] w-[3px] h-[100px] bg-white/70" />

                  
                  {/* Pitch dirt/wear patterns */}
                  <div className="absolute inset-x-8 inset-y-[15%] bg-black/10 rounded-[100%] filter blur-xl" />

                  {/* Pitch Aim Marker */}
                  {(ballState === 'aiming' || ballState === 'run_up') && (
                      <div 
                          className="absolute w-8 h-8 -ml-4 -mt-4 border-[3px] border-cyan-400 rounded-full flex items-center justify-center bg-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.8)] z-10 transition-transform"
                          style={{ left: `${aimX}%`, top: `60%`, transform: ballState === 'aiming' ? 'scale(1.2)' : 'scale(1)' }}
                      >
                          <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                      </div>
                  )}

              </div>
          </div>
      </div>

            {/* HUD Scoreboard */}
      <div className="absolute top-4 inset-x-4 flex justify-between items-start z-50 pointer-events-none">
          {/* Batting Team Score */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-2 pr-4 md:p-3 md:pr-6 rounded-3xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center gap-3 md:gap-4 relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${battingTeam.color}`} />
              <div className="pl-2 flex flex-col">
                  <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">{battingTeam.name}</span>
                  <div className="text-2xl md:text-4xl font-black text-white leading-none tracking-tighter">
                      {inningScore}<span className="text-lg md:text-2xl text-yellow-500">/{inningWickets}</span>
                  </div>
              </div>
              <div className="w-px h-10 bg-slate-700/50" />
              <div className="flex flex-col">
                  <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">OVER</span>
                  <div className="text-xl md:text-2xl font-black text-white leading-none">
                      {Math.floor((totalBalls - ballsLeft)/6)}<span className="text-sm md:text-lg text-slate-400">.{(totalBalls - ballsLeft)%6}</span>
                  </div>
              </div>
          </div>
          
          {/* Target / Bowler Info */}
          <div className="flex flex-col items-end gap-2">
              {phase === 'inning2' && (
                  <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-black px-6 py-2 rounded-full shadow-[0_5px_20px_rgba(239,68,68,0.5)] border border-orange-300 flex flex-col items-end transform origin-right animate-[pulse_2s_infinite]">
                      <span className="uppercase text-[9px] tracking-widest text-orange-200">Target to Win</span>
                      <span className="text-2xl tracking-tighter leading-none">{targetScore}</span>
                  </div>
              )}
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 px-4 py-2 rounded-2xl flex flex-col items-end">
                  <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">Bowler</span>
                  <span className="text-cyan-400 font-bold text-sm">{selectedBall.name}</span>
              </div>
          </div>
      </div>

            
      {/* 2.5D Avatars & Elements */}
      
      {/* Bowler Avatar (Top) */}
      <div  className={`absolute top-[35%] left-[50%] transition-all duration-300 z-20 origin-bottom pointer-events-none ${ballState === 'run_up' ? 'translate-y-[100px] scale-[0.3]' : 'translate-y-0 scale-[0.15]'} md:${ballState === 'run_up' ? 'translate-y-[150px] scale-[0.4]' : 'translate-y-0 scale-[0.2]'}`} style={{ transform: `translateX(-50%)` }}>
          <div className={`w-24 h-32 ${bowlingTeam.uniform} rounded-t-full rounded-b-3xl relative flex flex-col items-center justify-start pt-2 border-2 border-black/20 shadow-xl`}>
              <div className="w-10 h-12 bg-amber-200 rounded-full absolute -top-10 border-2 border-black/10 overflow-hidden">
                  <div className="w-full h-4 bg-slate-800 absolute top-0" />
              </div>
          </div>
      </div>

      {/* Batsman Avatar (Bottom) */}
      <div className={`absolute bottom-[23%] left-[50%] transition-transform duration-150 z-30 origin-bottom pointer-events-none scale-[0.35] md:scale-[0.45]`} style={{ transform: `translateX(-50%) ${batSwing ? (isUserBatting ? 'translateX(-30px)' : 'translateX(30px)') : 'translateX(0)'}` }}>
          <div className={`w-32 h-44 ${battingTeam.uniform} rounded-t-full rounded-b-3xl relative flex flex-col items-center justify-start pt-6 border-2 border-black/20 shadow-2xl`}>
              <div className="w-16 h-18 bg-blue-900 rounded-t-3xl rounded-b-xl absolute -top-16 border-2 border-black/20 flex flex-col items-center pt-2">
                  <div className="w-14 h-8 border-4 border-slate-300 rounded-lg mt-2" />
              </div>
              <div className={`absolute top-10 ${batSwing ? '-left-20 -rotate-[120deg] origin-top-right' : '-right-10 rotate-12'} transition-all duration-150 ease-out`}>
                  <div className={`w-8 h-40 ${selectedBat.color} rounded-b-xl shadow-xl border border-black/30 relative`}>
                      <div className="absolute top-0 inset-x-0 h-12 bg-black/40 rounded-t-sm" />
                  </div>
              </div>
          </div>
      </div>

      {/* Ball Element */}
      <div 
          className={`absolute w-4 h-4 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.6)] z-40 pointer-events-none transition-all ${ballState === 'bowling' ? 'duration-[1200ms] ease-linear' : ballState === 'hit' ? 'duration-[400ms] ease-out' : 'duration-[0ms]'} ${ballState === 'run_up' || ballState === 'idle' ? 'opacity-0' : 'opacity-100'}`}
          style={{ 
            left: `calc(${ballX}% - 8px)`, 
            top: `${ballY}%`,
            transform: `scale(${ballScale})`,
            backgroundColor: selectedBall.color,
            boxShadow: `inset -2px -2px 5px rgba(0,0,0,0.5), inset 2px 2px 5px rgba(255,255,255,0.4)`
          }}
      >
          <div className={`absolute inset-0 border-[1px] border-white/50 rounded-full ${ballState === 'bowling' ? 'animate-[spin_0.2s_linear_infinite]' : ''}`} />
      </div>

      {/* Umpire Message */}
      {umpireMsg && (
        <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center pointer-events-none w-full flex flex-col items-center">
            {umpireMsg !== 'SET PITCH LINE' && (
                <div className="text-sm font-black uppercase text-white bg-slate-900/95 border-b-4 border-slate-700 shadow-2xl px-6 py-2 rounded-t-2xl mb-0 flex flex-col items-center gap-1">
                    <span className="text-4xl drop-shadow-lg">
                      {umpireMsg.includes('OUT') || umpireMsg.includes('BOWLED') || umpireMsg.includes('CAUGHT') ? '👲☝️' : umpireMsg.includes('SIX') ? '👲🙌' : umpireMsg.includes('FOUR') ? '👲🫱' : '👲👀'}
                    </span>
                    <span className="text-slate-400">UMPIRE</span>
                </div>
            )}
            <div className={`text-5xl md:text-7xl font-black uppercase tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] italic px-8 py-2 rounded-xl ${umpireMsg.includes('OUT') || umpireMsg.includes('BOWLED') || umpireMsg.includes('CAUGHT') ? 'text-red-500 bg-red-950/80 border-2 border-red-500' : umpireMsg === 'SET PITCH LINE' ? 'text-cyan-400' : 'text-yellow-400 bg-yellow-950/80 border-2 border-yellow-500 scale-110'}`}>
                {umpireMsg}
            </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 inset-x-0 p-4 md:p-8 pb-safe z-50 flex justify-center pointer-events-none">
          {isUserBatting ? (
              <div className="w-full max-w-sm flex flex-col gap-4 pointer-events-auto">
                  {ballState === 'idle' && !umpireMsg && (
                      <button 
                        onPointerDown={(e) => { e.stopPropagation(); userBat_bowlNextBall(); }}
                        className="w-full py-4 md:py-6 bg-gradient-to-b from-cyan-400 to-cyan-600 border border-cyan-300 text-white font-black rounded-full shadow-[0_10px_40px_rgba(6,182,212,0.6)] text-xl md:text-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                      >READY FOR BOWL</button>
                  )}
                  {ballState === 'run_up' && (
                      <div className="w-full py-5 md:py-6 text-center text-cyan-400 font-black text-xl uppercase tracking-widest animate-pulse">
                          BOWLER RUNNING IN...
                      </div>
                  )}
                  {ballState === 'bowling' && (
                      <div className="flex gap-4 w-full">
                          <button 
                            onPointerDown={(e) => { e.stopPropagation(); userBat_handleSwing(false, 'ground'); }}
                            className="flex-1 py-8 md:py-12 bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-300 backdrop-blur text-white font-black rounded-full shadow-[0_10px_50px_rgba(59,130,246,0.8)] text-lg md:text-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                          >GROUND</button>
                          <button 
                            onPointerDown={(e) => { e.stopPropagation(); userBat_handleSwing(false, 'loft'); }}
                            className="flex-1 py-8 md:py-12 bg-gradient-to-b from-pink-500 to-pink-700 border-2 border-pink-300 backdrop-blur text-white font-black rounded-full shadow-[0_10px_50px_rgba(236,72,153,0.8)] text-lg md:text-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all animate-pulse"
                          >LOFT</button>
                      </div>
                  )}
              </div>
          ) : (
              <div className="w-full max-w-sm flex flex-col gap-4 pointer-events-auto">
                  {ballState === 'idle' && !umpireMsg && (
                      <div className="flex flex-col gap-3">
                          <button 
                            onPointerDown={(e) => { e.stopPropagation(); userBowl_startAiming(); }}
                            className="w-full py-4 md:py-6 bg-gradient-to-b from-emerald-400 to-emerald-600 border border-emerald-300 text-white font-black rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.6)] text-xl md:text-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                          >START AIMING</button>
                          <div className="flex justify-center">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowFieldMap(true); }}
                                className="px-6 py-3 bg-slate-800 border border-slate-600 text-cyan-400 font-black rounded-xl text-sm uppercase tracking-widest hover:bg-slate-700 transition-colors"
                              >
                                  Adjust Field
                              </button>
                          </div>
                      </div>
                  )}
                  {ballState === 'aiming' && (
                      <button 
                        onPointerDown={(e) => { e.stopPropagation(); userBowl_lockAim(); }}
                        className="w-full py-4 md:py-6 bg-gradient-to-b from-yellow-400 to-yellow-600 border border-yellow-300 text-yellow-950 font-black rounded-full shadow-[0_10px_40px_rgba(234,179,8,0.6)] text-xl md:text-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all animate-pulse"
                      >LOCK AIM</button>
                  )}
              </div>
          )}
      </div>

{/* Field Map Overlay */}
      {showFieldMap && (
          <div className="absolute inset-0 bg-slate-900/95 z-[100] flex flex-col items-center justify-center p-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6">Field Formation</h2>
              
              <div className="relative w-full max-w-sm aspect-[4/5] bg-green-800 rounded-[100px] border-4 border-green-600 shadow-inner overflow-hidden"
                  onPointerMove={(e) => {
                      if (draggedFielder === null) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                      setFielders(prev => prev.map(f => f.id === draggedFielder ? { ...f, x, y } : f));
                  }}
                  onPointerUp={() => setDraggedFielder(null)}
                  onPointerLeave={() => setDraggedFielder(null)}
              >
                  {/* Pitch Area */}
                  <div className="absolute top-[40%] bottom-[40%] left-[45%] right-[45%] bg-[#E8DCC4] rounded-sm" />
                  
                  {/* 30 Yard Circle (Approximate) */}
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
                        className={`px-6 py-4 md:px-8 md:py-6 rounded-2xl font-black uppercase text-lg md:text-xl transition-all border-4 ${selectedBall.id === b.id ? 'bg-cyan-500 text-white border-cyan-300 scale-110 shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:scale-105 hover:bg-slate-700'}`}
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
