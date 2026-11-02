import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Store } from 'lucide-react';
import { Property } from '../types/property';

interface AdminShutterToggleModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmToggle: (property: Property, nextState: boolean) => Promise<void>;
}

const ADMIN_PASSWORD = '3252';

export const AdminShutterToggleModal: React.FC<AdminShutterToggleModalProps> = ({
  property,
  isOpen,
  onClose,
  onConfirmToggle,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const currentAvailable = property.available !== false;
  const targetAvailable = !currentAvailable;

  const handleToggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.trim() !== ADMIN_PASSWORD) {
      setErrorMsg('अमान्य एडमिन पासवर्ड! केवल अधिकृत एडमिन ही शटर की स्थिति बदल सकते हैं।');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmToggle(property, targetAvailable);
      onClose();
    } catch (err: any) {
      console.error('Error toggling shutter availability:', err);
      setErrorMsg(err?.message || 'शटर स्थिति बदलने में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">एडमिन शटर सत्यापन</h3>
              <p className="text-xs text-slate-400">मकान की उपलब्धता स्थिति बदलने हेतु एडमिन पासवर्ड दर्ज करें</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleToggleSubmit} className="p-5 space-y-4">
          {/* Target property card snippet */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold text-amber-300 font-mono">
                {property.houseNumber || 'पहचान नं.'}
              </span>
              <span className="text-slate-300 font-medium">{property.colony}</span>
            </div>
            <p className="font-semibold text-white truncate">{property.title}</p>

            {/* Current vs Next State Indicator */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">वर्तमान स्थिति:</span>
                {currentAvailable ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    मकान उपलब्ध है
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                    <XCircle className="w-3 h-3" />
                    मकान बुक हो चुका
                  </span>
                )}
              </div>

              <span className="text-slate-500 text-xs">➔</span>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block mb-0.5">नई स्थिति (शटर बदलें):</span>
                {targetAvailable ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold animate-pulse">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    मकान उपलब्ध है
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[11px] font-bold animate-pulse">
                    <XCircle className="w-3 h-3 text-rose-400" />
                    मकान बुक हो चुका
                  </span>
                )}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Password Input Field - strictly no hints or password value displayed */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>एडमिन पासवर्ड दर्ज करें:</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="गुप्त एडमिन पासवर्ड..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white text-sm outline-none font-mono tracking-wider"
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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              रद्द करें
            </button>

            <button
              type="submit"
              disabled={!password || isSubmitting}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 ${
                targetAvailable
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
              }`}
            >
              {targetAvailable ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>शटर खोलें: 'मकान उपलब्ध है'</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>शटर बंद करें: 'मकान बुक हो चुका'</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
