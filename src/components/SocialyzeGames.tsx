import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, ArrowLeft, Trophy, Share2 } from 'lucide-react';
import { playArcadeSound } from '../utils/audio';
import { useAppContext } from '../AppContext';
import { toast } from '../lib/toast';
import { CricketLeague } from './CricketLeague';
import { ShareModal } from './ShareModal';
import { Logo } from './Logo';

const SoccerGame = () => {
  const { user, updateUser } = useAppContext();
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [obstacles, setObstacles] = useState<{id: number, type: 'card' | 'haaland', x: number, passed: boolean, defeated: boolean}[]>([]);
  
  const [zlatanY, setZlatanY] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);

  const jumpingRef = useRef(false);
  const attackingRef = useRef(false);
  const obstaclesRef = useRef<any[]>([]);
  const gameSpeedRef = useRef(1.0);
  const spawnTimerRef = useRef(0);
  const scoreRef = useRef(0);

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setGameState('playing');
    setObstacles([]);
    obstaclesRef.current = [];
    gameSpeedRef.current = 1.0;
    spawnTimerRef.current = 1000;
    jumpingRef.current = false;
    attackingRef.current = false;
    setZlatanY(0);
    setIsAttacking(false);
  };

  const handleJump = () => {
    if (gameState !== 'playing' || jumpingRef.current) return;
    jumpingRef.current = true;
    playArcadeSound('shoot');
    setZlatanY(120); 
    setTimeout(() => {
      setZlatanY(0);
      setTimeout(() => {
        jumpingRef.current = false;
      }, 100); 
    }, 500); 
  };

  const handleAttack = () => {
    if (gameState !== 'playing' || attackingRef.current) return;
    attackingRef.current = true;
    setIsAttacking(true);
    playArcadeSound('shoot');
    setTimeout(() => {
      attackingRef.current = false;
      setIsAttacking(false);
    }, 400);
  };

  useEffect(() => {
    let animationId: number;
    let lastTime: number | null = null;

    const loop = (time: number) => {
      if (gameState !== 'playing') return;
      if (lastTime === null) lastTime = time;
      const deltaTime = time - lastTime;
      const timeScale = deltaTime / 16.66;
      lastTime = time;

      let currentObstacles = [...obstaclesRef.current];
      let isGameOver = false;

      spawnTimerRef.current -= deltaTime;
      if (spawnTimerRef.current <= 0) {
        currentObstacles.push({
          id: Date.now() + Math.random(),
          type: Math.random() > 0.5 ? 'card' : 'haaland',
          x: 120, // percentage 
          passed: false,
          defeated: false
        });
        spawnTimerRef.current = 1000 + Math.random() * 1500 * (1 / gameSpeedRef.current);
        gameSpeedRef.current += 0.02;
      }

      const ZLATAN_X = 20; 
      const ZLATAN_WIDTH = 15; 

      currentObstacles.forEach(obs => {
        obs.x -= (gameSpeedRef.current * 0.5) * timeScale; // Move left

        const inHitbox = obs.x < ZLATAN_X + ZLATAN_WIDTH && obs.x > ZLATAN_X - 5;

        if (inHitbox && !obs.passed && !obs.defeated) {
          if (obs.type === 'card') {
            if (!jumpingRef.current) {
               isGameOver = true;
            }
          } else if (obs.type === 'haaland') {
            if (attackingRef.current && !jumpingRef.current) {
               obs.defeated = true;
               playArcadeSound('goal');
               setScore(s => s + 10);
            } else {
               isGameOver = true;
            }
          }
        }

        if (obs.x < ZLATAN_X - 5 && !obs.passed && !obs.defeated) {
           obs.passed = true;
           setScore(s => s + 5);
        }
      });

      if (isGameOver) {
         playArcadeSound('out');
         setGameState('gameover');
         // update achievements
         if (scoreRef.current >= 100 && user && !user.achievements?.includes('Zlatan Rampage')) {
            updateUser({ achievements: [...(user.achievements || []), 'Zlatan Rampage'] });
            toast({ title: "Achievement Unlocked!", message: "Zlatan Rampage Master!", icon: "gift" });
         }
         return;
      }

      currentObstacles = currentObstacles.filter(obs => obs.x > -20);
      obstaclesRef.current = currentObstacles;
      setObstacles(currentObstacles);
      scoreRef.current = score;

      animationId = requestAnimationFrame(loop);
    };

    if (gameState === 'playing') {
      animationId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animationId);
  }, [gameState, user, updateUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
         e.preventDefault();
         if (gameState === 'start' || gameState === 'gameover') startGame();
         else handleJump();
      }
      if (e.code === 'ArrowRight' || e.key === 'x') {
         e.preventDefault();
         handleAttack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
     if (gameState === 'start' || gameState === 'gameover') {
        startGame();
        return;
     }
     if ((e.target as HTMLElement).closest('.share-button')) return;
     const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
     const screenWidth = window.innerWidth;
     if (clientX < screenWidth / 2) {
        handleJump();
     } else {
        handleAttack();
     }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-blue-400 p-4 relative overflow-hidden touch-none select-none" onPointerDown={handleTouch}>
      {/* Sky/Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200 pointer-events-none" />
      
      {/* Moving Ground */}
      <div className="absolute bottom-0 inset-x-0 h-[30%] bg-emerald-600 border-t-8 border-emerald-800 flex" />
      <div className={`absolute bottom-0 inset-x-0 h-[30%] flex ${gameState === 'playing' ? 'animate-[slide_1s_linear_infinite]' : ''}`} style={{ width: '200%' }}>
         {Array.from({ length: 40 }).map((_, i) => (
           <div key={i} className={`h-full w-10 ${i % 2 === 0 ? 'bg-emerald-500/30' : 'bg-transparent'}`} />
         ))}
      </div>

      <div className="text-white font-black text-2xl mb-4 absolute top-4 left-4 z-10 flex items-center gap-4">
        <span className="flex items-center gap-2 tracking-tighter shadow-sm text-slate-800"><Trophy className="w-6 h-6 text-yellow-400" /> {score}</span>
        {score > 0 && gameState === 'gameover' && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(true); }}
            className="share-button flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full text-white transition-colors"
          >
            <Share2 className="w-3 h-3" /> Share
          </button>
        )}
      </div>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`I scored ${score} in Zlatan Rampage!`}
        url="https://socialyze.app/games/zlatan-rampage"
      />

      {/* Start / Game Over Screen */}
      {(gameState === 'start' || gameState === 'gameover') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
           <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-xl mb-2 text-center">
             Zlatan Rampage
           </h2>
           <p className="text-white/80 font-bold mb-8 text-center px-4">
             Left Tap / Up = JUMP over Red Cards<br/>
             Right Tap / Right Arrow = ATTACK Haaland
           </p>
           {gameState === 'gameover' && (
             <div className="text-2xl font-bold text-yellow-400 mb-8 animate-bounce drop-shadow-md">
               Final Score: {score}
             </div>
           )}
           <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95 text-xl">
             {gameState === 'start' ? 'Play Now' : 'Play Again'}
           </button>
        </div>
      )}

      {/* Zlatan Avatar */}
      <div 
        className="absolute z-10 text-6xl drop-shadow-xl flex items-center justify-center"
        style={{ 
          left: `20%`, 
          bottom: `30%`,
          transform: `translateY(-${zlatanY}px) ${isAttacking ? 'rotate(45deg) scale(1.2)' : ''}`,
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {isAttacking ? '🦵' : '🧔🏻‍♂️'}
      </div>

      {/* Obstacles */}
      {obstacles.map(obs => (
        <div 
          key={obs.id}
          className={`absolute z-10 text-6xl drop-shadow-xl ${obs.defeated ? 'opacity-0 scale-150 rotate-180 duration-500' : ''}`}
          style={{ 
            left: `${obs.x}%`, 
            bottom: obs.type === 'card' ? '30%' : '35%',
            transition: obs.defeated ? 'all 500ms ease-out' : 'none'
          }}
        >
          {obs.type === 'card' ? '🟥' : '👱🏼‍♂️'}
        </div>
      ))}
      
      {/* Custom CSS for ground slide animation */}
      <style>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
const BasketballGame = () => {
  const { user, updateUser } = useAppContext();
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [isShooting, setIsShooting] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 50, y: 80, scale: 1 });
  const [hoopPos, setHoopPos] = useState(50);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [ballsLeft, setBallsLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let interval: any;
    if (!isShooting && !gameOver) {
      interval = setInterval(() => {
        setHoopPos(prev => {
          let movement = Math.random() > 0.5 ? 15 : -15;
          return Math.max(15, Math.min(85, prev + movement));
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isShooting, gameOver]);

  const handleShoot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isShooting || gameOver) return;
    if ((e.target as HTMLElement).closest('.share-button')) return;
    
    setBallsLeft(prev => prev - 1);
    
    // Shoot straight up towards wherever the user clicked, but ball scales down to simulate depth
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    
    setBallPos({ x, y: 20, scale: 0.5 });
    setIsShooting(true);
    playArcadeSound('shoot');

    setTimeout(() => {
      // Check if ball x is close to hoop x
      if (Math.abs(x - hoopPos) < 15) {
        setMessage('SWISH!');
        setScore(s => s + 2);
        playArcadeSound('swish');
        setTimeout(() => playArcadeSound('bounce'), 300);
      } else {
        setMessage('BRICK!');
        playArcadeSound('bounce');
      }

      setTimeout(() => {
        setIsShooting(false);
        setBallPos({ x: 50, y: 80, scale: 1 });
        setMessage('');
        setBallsLeft(prev => {
          if (prev <= 0) {
            setGameOver(true);
            if (user && score >= 10 && !user.achievements?.includes('Street Hoops Pro')) {
              updateUser({ achievements: [...(user.achievements || []), 'Street Hoops Pro'] });
              toast({ title: "Achievement!", message: "Street Hoops Pro unlocked!", icon: "gift" });
            }
          }
          return prev;
        });
      }, 1000);
    }, 500);
  };

  const restartGame = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScore(0);
    setBallsLeft(10);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 p-4 relative overflow-hidden touch-none select-none" onClick={handleShoot}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 pointer-events-none" />
      
      <div className="text-white font-black text-2xl mb-4 absolute top-4 left-0 w-full px-4 z-10 flex items-center justify-between">
        <span className="flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400" /> {score}</span>
        <div className="flex flex-col items-end mr-4">
          <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">Balls Left</span>
          <span className="text-xl text-pink-500">{ballsLeft > 0 ? ballsLeft : 0}</span>
        </div>
      </div>
      
      {gameOver && score > 0 && (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(true); }}
          className="share-button absolute bottom-8 z-30 flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full text-white transition-colors"
        >
          <Share2 className="w-4 h-4" /> Share Score
        </button>
      )}

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`I scored ${score} pts in Street Hoops!`}
        url="https://socialyze.app/games/street-hoops"
      />

      {/* Backboard and Hoop */}
      <div 
        className="absolute top-12 flex flex-col items-center transition-all duration-500 z-0 ease-in-out"
        style={{ left: `calc(${hoopPos}% - 3rem)` }}
      >
        <div className="w-24 h-16 border-4 border-slate-300 rounded-sm relative bg-white/5 backdrop-blur-sm">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-6 border-2 border-red-500" />
        </div>
        <div className="w-10 h-2 bg-orange-500 rounded-full mt-2 relative z-20 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
        {/* Net */}
        <div className="w-8 h-10 border-x-2 border-b-2 border-slate-200/50 rounded-b-lg border-dashed opacity-70 relative">
          <div className="absolute inset-0 bg-white/10" />
        </div>
      </div>

      {/* Basketball */}
      {!gameOver && (
      <div 
        className={`absolute w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden transition-all ${isShooting ? 'duration-500 ease-in' : 'duration-0'} z-10 shadow-[0_0_20px_rgba(249,115,22,0.4)]`}
        style={{ 
          left: `calc(${ballPos.x}% - 1.5rem)`, 
          top: `${ballPos.y}%`,
          transform: `scale(${ballPos.scale}) ${isShooting ? 'rotate(360deg)' : 'rotate(0deg)'}`
        }}
      >
        <div className="absolute w-full h-[2px] bg-black/60 rotate-45" />
        <div className="absolute w-[2px] h-full bg-black/60 rotate-45" />
        <div className="absolute w-16 h-16 border-[2px] border-black/60 rounded-full -left-10" />
        <div className="absolute w-16 h-16 border-[2px] border-black/60 rounded-full -right-10" />
      </div>
      )}

      {message && !gameOver && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 drop-shadow-2xl text-center z-20 animate-bounce tracking-tighter">
          {message}
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
          <div className="text-5xl font-black text-white mb-2">GAME OVER</div>
          <div className="text-2xl text-slate-300 font-bold mb-8">Score: {score}</div>
          <button 
            onClick={restartGame}
            className="share-button px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest text-sm rounded-full shadow-[0_0_20px_rgba(219,39,119,0.5)] transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {!isShooting && !message && !gameOver && (
        <div className="absolute bottom-32 text-slate-400 text-sm font-bold tracking-widest uppercase animate-pulse w-full text-center">
          Swipe to shoot!
        </div>
      )}
    </div>
  );
};


export function SocialyzeGames({ onExit }: { onExit?: () => void }) {
  const [activeGame, setActiveGame] = useState<'menu' | 'soccer' | 'basketball' | 'cricket'>('menu');
  
  useEffect(() => {
    const handleOpenArcade = (e: CustomEvent) => {
      setActiveGame(e.detail);
    };
    window.addEventListener('OPEN_ARCADE', handleOpenArcade as EventListener);
    return () => window.removeEventListener('OPEN_ARCADE', handleOpenArcade as EventListener);
  }, []);

  if (activeGame === 'soccer') {
    return (
      <div className="h-full relative overflow-hidden bg-slate-950">
        <button 
          onClick={() => setActiveGame('menu')}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <SoccerGame />
      </div>
    );
  }

  if (activeGame === 'basketball') {
    return (
      <div className="h-full relative overflow-hidden bg-slate-950">
        <button 
          onClick={() => setActiveGame('menu')}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <BasketballGame />
      </div>
    );
  }

  if (activeGame === 'cricket') {
    return (
      <div className="h-full relative overflow-hidden bg-slate-950">
        <CricketLeague onExit={() => setActiveGame('menu')} />
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-950 text-white overflow-y-auto pb-safe">
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 border-dashed">
        <div className="flex items-center justify-between p-4 pt-safe">
          <div className="flex items-center gap-2">
            {onExit && (
              <button onClick={onExit} className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </button>
            )}
            <Logo size="sm" />
            <h1 className="text-xl font-black font-sans uppercase tracking-tight flex items-center gap-2 hidden md:flex">
              <Gamepad2 className="w-6 h-6 text-indigo-400" />
              Arcade
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-br from-green-600 to-green-900 rounded-3xl p-6 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl relative overflow-hidden" onClick={() => setActiveGame('soccer')}>
          <div className="absolute -right-10 -bottom-10 opacity-20 text-[120px]">🧔🏻‍♂️</div>
          <h2 className="text-2xl font-bold mb-2 relative z-10">Zlatan Rampage</h2>
          <p className="text-white/80 text-sm relative z-10">Play as Zlatan on the rampage! Jump over cards and defeat Haaland.</p>
          <div className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold inline-block relative z-10 hover:bg-white/30 transition-colors">
            Play Rampage
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-800 rounded-3xl p-6 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl relative overflow-hidden" onClick={() => setActiveGame('basketball')}>
          <div className="absolute -right-10 -bottom-10 opacity-20 text-[120px]">🏀</div>
          <h2 className="text-2xl font-bold mb-2 relative z-10">Hoops Master</h2>
          <p className="text-white/80 text-sm relative z-10">Time your shots perfectly to sink the ball through the moving hoop.</p>
          <div className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold inline-block relative z-10 hover:bg-white/30 transition-colors">
            Play Basketball
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-3xl p-6 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl relative overflow-hidden" onClick={() => setActiveGame('cricket')}>
          <div className="absolute -right-10 -bottom-10 opacity-20 text-[120px]">🏏</div>
          <h2 className="text-2xl font-black italic tracking-tight mb-2 relative z-10">Socialyze League</h2>
          <p className="text-white/80 text-sm relative z-10">Compete in 1v1 multiplayer T20 matches. Bat, bowl, and win the league!</p>
          <div className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold inline-block relative z-10 hover:bg-white/30 transition-colors">
            Play League
          </div>
        </div>
      </div>
    </div>
  );
}
