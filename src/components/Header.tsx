import React from 'react';
import { Home, Plus, Sparkles, Phone, MessageSquare, Database, RotateCcw } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  availableCount: number;
  onOpenAddModal: () => void;
  onOpenPostUserAdModal: () => void;
  onOpenBulkModal: () => void;
  onOpenMasterResetModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  availableCount,
  onOpenAddModal,
  onOpenPostUserAdModal,
  onOpenBulkModal,
  onOpenMasterResetModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      {/* Top micro-bar */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800/50 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              नीमच डायरेक्टरी (Neemuch Directory)
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <Database className="w-3 h-3 text-emerald-400" />
              क्लाउड डेटाबेस सक्रिय (Permanent Firestore Sync)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-medium">
              कुल मकान:{' '}
              <span className="text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                {totalCount}
              </span>
              <span className="text-slate-400 text-[11px] ml-1.5">
                ({availableCount} उपलब्ध)
              </span>
            </span>

            <a
              href="tel:+917999646575"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              +91-7999646575
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md uppercase tracking-tight shadow">
                MP-44
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  नीमच क्लासिफाइड
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                    Neemuch Classified
                  </span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                नीमच शहर में मकान, दुकान, फ्लैट एवं रेंटल प्रॉपर्टी डायरेक्टरी • सीधा व्हाट्सएप संपर्क
              </p>
            </div>
          </div>

          {/* Action Buttons & Quick Help */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            <a
              href="https://wa.me/917999646575?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87%2C%20%E0%A4%AE%E0%A5%81%E0%A4%9D%E0%A5%87%20%E0%A4%A8%E0%A5%80%E0%A4%AE%E0%A4%9 need%20%E0%A4%95%E0%A5%8D%E0%A4%B2%E0%A4%BE%E0%A4%B8%E0%A4%BF%E0%A4%AB%E0%A4%BE%E0%A4%87%E0%A4%A1%20%E0%A4%AA%E0%A4%B0%20%E0%A4%AE%E0%A4%95%E0%A4%BE%E0%A4%A8%20%E0%A4%95%E0%A5%87%20%E0%A4%AC%E0%A4%BE%E0%A4%B0%E0%A5%87%20%E0%A4%AE%E0%A5%87%E0%A4%82%20%E0%A4%9C%E0%A4%BE%E0%A4%A8%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%80%20%E0%A4%9A%E0%A4%BE%E0%A4%B9%E0%A4%BF%E0%A4%8F"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-all text-xs font-medium"
              title="हेल्पलाइन व्हाट्सएप"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">हेल्पलाइन:</span> +91-7999646575
            </a>

            {/* Master Reset Button with PIN Protection */}
            <button
              onClick={onOpenMasterResetModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-all text-xs font-semibold hover:scale-[1.02]"
              title="मास्टर रिसेट"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>मास्टर रिसेट</span>
            </button>

            {/* AI Bulk Upload Button */}
            <button
              onClick={onOpenBulkModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>% AI बल्क अपलोड</span>
            </button>

            {/* Post User Ad Button (निःशुल्क - बिना एडमिन पासवर्ड) */}
            <button
              onClick={onOpenPostUserAdModal}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 border border-amber-300/60 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              title="अपना विज्ञापन खुद पोस्ट करें (100% फ्री)"
            >
              <span className="text-base">📢</span>
              <span>अपना विज्ञापन खुद पोस्ट करें</span>
            </button>

            {/* Add House Button (Admin verification) */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-bold transition-all hover:scale-[1.02]"
              title="एडमिन द्वारा लिस्टिंग जोड़ें"
            >
              <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>+ मकान जोड़ें</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
