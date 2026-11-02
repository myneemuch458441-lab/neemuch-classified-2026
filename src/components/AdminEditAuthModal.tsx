import React, { useState, useEffect } from 'react';
import { X, Lock, Edit3, AlertCircle, ShieldCheck } from 'lucide-react';
import { Property } from '../types/property';

interface AdminEditAuthModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (property: Property) => void;
}

const ADMIN_PASSWORD = '3252';

export const AdminEditAuthModal: React.FC<AdminEditAuthModalProps> = ({
  property,
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.trim() !== ADMIN_PASSWORD) {
      setErrorMsg('अमान्य एडमिन पासवर्ड! केवल अधिकृत एडमिन ही मकान विवरण एडिट कर सकते हैं।');
      return;
    }

    // Success: open edit modal
    onClose();
    onAuthenticated(property);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">एडमिन एडिट सत्यापन</h3>
              <p className="text-xs text-slate-400">विवरण बदलने के लिए एडमिन प्रमाणीकरण आवश्यक है</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAuthSubmit} className="p-5 space-y-4">
          {/* Target property card snippet */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold text-amber-300 font-mono">
                {property.houseNumber || 'पहचान नं.'}
              </span>
              <span className="text-emerald-400 font-semibold">{property.config}</span>
            </div>
            <p className="font-semibold text-white truncate">{property.title}</p>
            <p className="text-slate-400 truncate">{property.colony}</p>
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
              <Lock className="w-3.5 h-3.5 text-amber-400" />
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-sm outline-none font-mono tracking-wider"
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
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              रद्द करें
            </button>

            <button
              type="submit"
              disabled={!password}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-950/50 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Edit3 className="w-4 h-4" />
              <span>सत्यापित करें और एडिट खोलें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
