import React, { useState, useRef, ReactNode } from "react";
import { motion } from "motion/react";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

interface Props {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  containerClassName?: string;
  scrollClassName?: string;
}

export function PullToRefresh({ onRefresh, children, containerClassName, scrollClassName }: Props) {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const y = e.touches[0].clientY;
    const dy = y - startY.current;
    
    if (dy > 0 && containerRef.current?.scrollTop === 0) {
      // Add friction
      setPullY(Math.min(dy * 0.4, 80));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    
    if (pullY > 50) {
      setIsRefreshing(true);
      setPullY(50);
      await onRefresh();
      setIsRefreshing(false);
      setPullY(0);
    } else {
      setPullY(0);
    }
  };

  return (
    <div 
      className={cn("h-full flex flex-col relative overflow-hidden w-full", containerClassName)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center z-50 pointer-events-none"
        style={{ height: "60px", transform: `translateY(${pullY > 0 ? pullY - 60 : -60}px)`, transition: isPulling.current ? 'none' : 'transform 0.3s ease' }}
      >
        <div className="bg-slate-900 border border-slate-700 p-2 rounded-full shadow-lg shadow-black/50">
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
          ) : (
            <RefreshCw 
              className="w-5 h-5 text-pink-500" 
              style={{ transform: `rotate(${pullY * 4}deg)` }} 
            />
          )}
        </div>
      </div>
      <motion.div 
        ref={containerRef}
        animate={{ y: isRefreshing ? 50 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn("h-full w-full overflow-y-auto hide-scrollbar", scrollClassName)}
      >
        {children}
      </motion.div>
    </div>
  );
}
