import React, { useEffect, useState } from "react";
import { TrendingUp, Hash, Flame } from "lucide-react";
import { useAppContext } from "../AppContext";

interface TrendingTopic {
  tag: string;
  posts: string;
}

export function TrendingSlide() {
  const { setSearchQuery, reels } = useAppContext();
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const posts = reels.map(r => r.description);
        const response = await fetch("/api/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ posts })
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setTopics(data);
        }
      } catch (error) {
        setTopics([
          { tag: "#chilling", posts: "1.2M posts" },
          { tag: "Tokyo", posts: "89.2K posts" },
          { tag: "tech", posts: "45.6K posts" },
          { tag: "coding", posts: "234K posts" },
          { tag: "hike", posts: "67.8K posts" }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div className="relative h-[100dvh] md:h-[100dvh] lg:h-full w-[100dvw] md:w-full snap-start snap-always bg-slate-900 flex flex-col items-center justify-center p-6 border-slate-800/80">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-slate-900 to-black/80 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-indigo-500/20 rounded-full">
            <TrendingUp className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Trending Now</h2>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col gap-4 items-center justify-center py-10 text-slate-400">
              <Flame className="w-8 h-8 animate-pulse text-indigo-400/50" />
              <p className="font-medium animate-pulse">Finding hot topics...</p>
            </div>
          ) : topics.length > 0 ? (
            topics.map((topic, i) => (
              <div 
                key={i} 
                className="group flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 transition-all cursor-pointer"
                onClick={() => setSearchQuery(topic.tag.startsWith('#') ? topic.tag : `#${topic.tag}`)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-slate-500 w-6 text-center">{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                      {topic.tag.startsWith('#') ? topic.tag : `#${topic.tag}`}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium">{topic.posts}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Flame className="w-5 h-5 text-rose-500" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-400 py-10">
              <p>Check back later for trending topics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
