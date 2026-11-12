import React, { useState } from 'react';
import {
  Users,
  Eye,
  TrendingUp,
  Activity,
  MapPin,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { VisitorStats } from '../services/visitorService';

interface VisitorCountBarProps {
  stats: VisitorStats;
  totalListingsCount: number;
}

export const VisitorCountBar: React.FC<VisitorCountBarProps> = ({ stats, totalListingsCount }) => {
  const [showInfo, setShowInfo] = useState(false);

  // Format numbers nicely with Indian grouping e.g. 1,842
  const formattedTotal = stats.totalVisitors.toLocaleString('en-IN');
  const formattedToday = stats.todayVisitors.toLocaleString('en-IN');

  return (
    <div className="w-full">
      {/* Main Visitor Count Bar Screen */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 p-3 sm:p-4 shadow-xl shadow-emerald-950/20 backdrop-blur-md">
        {/* Subtle background glow effect */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-3.5 sm:gap-4">
          {/* Left section: Live Status & Title */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25">
                  <Users className="w-5 h-5 text-slate-950" />
                </div>
                {/* Live pulsing green dot */}
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-white tracking-wide flex items-center gap-1.5">
                    लाइव विज़िटर काउंटर
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      LIVE BAR
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {stats.activeNow} लोग अभी ऑनलाइन
                  </span>
                  <span>•</span>
                  <span className="hidden sm:inline">नीमच व आसपास से विज़िट्स</span>
                  <span className="sm:hidden">नीमच विज़िट्स</span>
                </div>
              </div>
            </div>

            {/* Info toggle button for mobile */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="काउंटर विवरण देखें"
            >
              <Info className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Center / Right Section: Metrics Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Metric 1: Total All-Time Visitors */}
            <div className="flex items-center gap-2.5 bg-slate-950/80 border border-emerald-500/30 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-inner">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">
                  कुल विज़िटर्स (Total)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-xl font-black text-white font-mono tracking-wider text-emerald-300">
                    {formattedTotal}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                    +15-20/दिन
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 2: Today's Visitors */}
            <div className="flex items-center gap-2.5 bg-slate-950/80 border border-amber-500/30 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-inner">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">
                  आज के विज़िटर (Today)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-xl font-black text-amber-300 font-mono tracking-wider">
                    +{formattedToday}
                  </span>
                  <span className="text-[9px] text-amber-400/90 font-medium">
                    आज विज़िट
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 3: Active Now & Properties */}
            <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-start gap-2.5 bg-slate-950/80 border border-teal-500/30 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 shrink-0">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">
                    अभी ऑनलाइन (Active)
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-teal-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    {stats.activeNow} यूज़र्स लाइव
                  </span>
                </div>
              </div>

              {/* Info Button for desktop */}
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="hidden lg:inline-flex p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors ml-auto"
                title="काउंटर के बारे में जानें"
              >
                <Info className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Explanation & Growth Detail */}
        {showInfo && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>नीमच क्लासिफाइड लाइव काउंटर:</strong> इस डायरेक्टरी पर प्रतिदिन 15 से 20+ नए लोग मकान, दुकान, गिरवी और बिकाऊ प्रॉपर्टी देखने आते हैं।
              </span>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-[11px] text-emerald-400 hover:underline font-semibold"
            >
              बंद करें ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
