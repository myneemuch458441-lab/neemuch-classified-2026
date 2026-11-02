import React, { useState, useEffect } from 'react';
import { X, Lock, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';
import { Property } from '../types/property';

interface AdminDeleteModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
}

const ADMIN_PASSWORD = '3252';

export const AdminDeleteModal: React.FC<AdminDeleteModalProps> = ({
  property,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.trim() !== ADMIN_PASSWORD) {
      setErrorMsg('अमान्य एडमिन पासवर्ड! केवल अधिकृत एडमिन ही लिस्टिंग डिलीट कर सकते हैं।');
      return;
    }

    try {
      setIsDeleting(true);
      await onConfirmDelete(property.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'डेटाबेस से डिलीट करने में त्रुटि हुई।');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-rose-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">एडमिन डिलीट सत्यापन</h3>
              <p className="text-xs text-slate-400">यह क्रिया डेटाबेस से स्थायी रूप से लिस्टिंग को हटा देगी</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleDeleteSubmit} className="p-5 space-y-4">
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

          {/* Password Input Field - No hints or password text displayed */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>एडमिन सुरक्षा पासवर्ड (Admin Password):</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="गुप्त एडमिन पासवर्ड दर्ज करें..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-white text-sm outline-none font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-200"
              >
                {showPassword ? 'छुपाएं' : 'दिखाएं'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              सुरक्षा हेतु केवल अधिकृत एडमिन ही इस मकान/दुकान को डेटाबेस से स्थायी रूप से हटा सकते हैं।
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              रद्द करें
            </button>

            <button
              type="submit"
              disabled={isDeleting || !password}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'डिलीट हो रहा है...' : 'प्रमाणित करें और डिलीट करें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
