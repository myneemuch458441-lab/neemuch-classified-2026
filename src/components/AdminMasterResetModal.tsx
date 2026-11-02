import React, { useState } from 'react';
import {
  X,
  Lock,
  Trash2,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Database,
  IndianRupee,
  ShieldAlert
} from 'lucide-react';

interface AdminMasterResetModalProps {
  isOpen: boolean;
  totalCount: number;
  onClose: () => void;
  onWipeAll: () => Promise<number>;
  onResetRents: () => Promise<number>;
  onRestoreSeed: () => Promise<number>;
}

const ADMIN_PASSWORD = '3252';

type ResetAction = 'rents_only' | 'wipe_all' | 'restore_seed';

export const AdminMasterResetModal: React.FC<AdminMasterResetModalProps> = ({
  isOpen,
  totalCount,
  onClose,
  onWipeAll,
  onResetRents,
  onRestoreSeed,
}) => {
  const [selectedAction, setSelectedAction] = useState<ResetAction>('rents_only');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.trim() !== ADMIN_PASSWORD) {
      setErrorMsg('अमान्य एडमिन पासवर्ड! केवल अधिकृत एडमिन ही मास्टर रिसेट कर सकते हैं।');
      return;
    }

    try {
      setIsProcessing(true);
      if (selectedAction === 'rents_only') {
        const count = await onResetRents();
        setSuccessMsg(`सफलता! सभी ${count} मकानों/दुकानों का रेंट हटा दिया गया है। अब सभी में 'रेंट की जानकारी उपलब्ध नहीं है' दिखेगा।`);
      } else if (selectedAction === 'wipe_all') {
        const count = await onWipeAll();
        setSuccessMsg(`सफलता! Firebase डेटाबेस से सभी ${count} गलत/पुरानी लिस्टिंग्स को हमेशा के लिए खाली कर दिया गया है।`);
      } else if (selectedAction === 'restore_seed') {
        const count = await onRestoreSeed();
        setSuccessMsg(`सफलता! डेटाबेस रीसेट कर ${count} स्वच्छ नीमच लिस्टिंग्स रीस्टोर कर दी गई हैं।`);
      }
      setPassword('');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      console.error('Master reset error:', err);
      setErrorMsg(err?.message || 'मास्टर रिसेट करने में त्रुटि हुई।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-rose-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                एडमिन मास्टर रिसेट (Master Database Reset)
              </h3>
              <p className="text-xs text-slate-400">
                गलत या डुप्लीकेट डेटा अपलोड होने पर Firebase व ऐप दोनों जगह से तुरंत सुधारें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleResetSubmit} className="p-5 space-y-4">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Choice Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200">
              मास्टर रिसेट का प्रकार चुनें:
            </label>

            {/* Option 1: Reset Rents Only */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                selectedAction === 'rents_only'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-950'
              }`}
            >
              <input
                type="radio"
                name="resetAction"
                value="rents_only"
                checked={selectedAction === 'rents_only'}
                onChange={() => setSelectedAction('rents_only')}
                className="mt-1 w-4 h-4 accent-amber-500"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>केवल किराया रीसेट करें (अनुशंसा)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  सभी मौजूदा {totalCount} मकानों की जानकारी (मकान नं., कॉलोनी, संपर्क) सुरक्षित रहेगी, लेकिन सभी से पुराना गलत किराया हटाकर <strong>'रेंट की जानकारी उपलब्ध नहीं है'</strong> कर दिया जाएगा।
                </p>
              </div>
            </label>

            {/* Option 2: Wipe All Database */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                selectedAction === 'wipe_all'
                  ? 'bg-rose-500/10 border-rose-500/50 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-950'
              }`}
            >
              <input
                type="radio"
                name="resetAction"
                value="wipe_all"
                checked={selectedAction === 'wipe_all'}
                onChange={() => setSelectedAction('wipe_all')}
                className="mt-1 w-4 h-4 accent-rose-500"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>पूरा डेटाबेस खाली करें (Wipe All to 0 Listings)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Firebase डेटाबेस और ऐप से सभी {totalCount} गलत लिस्टिंग्स पूरी तरह हटा दी जाएंगी। इसके बाद आप नए सिरे से शुद्ध डेटा अपलोड कर सकेंगे।
                </p>
              </div>
            </label>

            {/* Option 3: Restore Default Seed */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                selectedAction === 'restore_seed'
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-950'
              }`}
            >
              <input
                type="radio"
                name="resetAction"
                value="restore_seed"
                checked={selectedAction === 'restore_seed'}
                onChange={() => setSelectedAction('restore_seed')}
                className="mt-1 w-4 h-4 accent-indigo-500"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>डिफ़ॉल्ट नीमच लिस्टिंग्स रीस्टोर करें</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  सभी पुरानी गलत लिस्टिंग्स हटाकर नीमच के 8 स्वच्छ डिफ़ॉल्ट सैंपल मकान/दुकान सेट कर देगा।
                </p>
              </div>
            </label>
          </div>

          {/* Password Input - strictly hidden, NO hints */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>प्रमाणीकरण हेतु एडमिन पासवर्ड:</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="गुप्त एडमिन पासवर्ड दर्ज करें..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-rose-500 text-white text-sm outline-none font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-200"
              >
                {showPassword ? 'छुपाएं' : 'दिखाएं'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              रद्द करें
            </button>

            <button
              type="submit"
              disabled={isProcessing || !password}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all ${
                selectedAction === 'wipe_all'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : selectedAction === 'rents_only'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              } disabled:opacity-50`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>प्रक्रिया जारी है...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>मास्टर रिसेट निष्पादित करें</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
