import React, { useState, useEffect } from 'react';
import { X, Lock, Trash2, AlertCircle, ShieldAlert, Store, Crop } from 'lucide-react';
import { Property } from '../types/property';

interface AdminDeletePosterModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDeletePoster: (propertyId: string) => Promise<void>;
}

const ADMIN_PASSWORD = '3252';

export const AdminDeletePosterModal: React.FC<AdminDeletePosterModalProps> = ({
  property,
  isOpen,
  onClose,
  onConfirmDeletePoster,
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

  if (!isOpen || !property || !property.posterAd) return null;

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.trim() !== ADMIN_PASSWORD) {
      setErrorMsg('अमान्य एडमिन पासवर्ड! केवल अधिकृत एडमिन ही पोस्टर विज्ञापन डिलीट कर सकते हैं।');
      return;
    }

    try {
      setIsDeleting(true);
      await onConfirmDeletePoster(property.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'डेटाबेस से पोस्टर डिलीट करने में त्रुटि हुई।');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-rose-950/40 via-slate-950 to-rose-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">पोस्टर विज्ञापन डिलीट सत्यापन</h3>
              <p className="text-xs text-slate-400">एडमिन पासवर्ड सुरक्षा (Admin Protected)</p>
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
          {/* Target 2:1 Poster Preview snippet */}
          <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs flex items-center gap-3">
            <div className="w-24 h-12 aspect-[2/1] rounded-xl overflow-hidden border border-amber-500/40 shrink-0 bg-slate-900">
              <img
                src={property.posterAd.imageUrl}
                alt="Poster Thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1 truncate flex-1">
              <div className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold text-white truncate">
                  {property.posterAd.shopName || 'दुकान/बिजनेस 2:1 पोस्टर'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                विज्ञापन: [{property.listingCategory || 'प्रॉपर्टी'}] {property.colony}
              </p>
              {property.posterAd.contactNumber && (
                <p className="text-[10px] text-emerald-400 font-mono">
                  सम्पर्क: {property.posterAd.contactNumber}
                </p>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Password Input Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>एडमिन पासवर्ड दर्ज करें (Admin Password):</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="गुप्त एडमिन पासवर्ड..."
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
            <p className="text-[11px] text-slate-400 leading-relaxed">
              सुरक्षा हेतु पोस्टर केवल एडमिन पासवर्ड से ही डिलीट किया जा सकता है, ताकि कोई अन्य व्यक्ति या प्रतिद्वंद्वी आपका विज्ञापन न हटा सके।
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'डिलीट हो रहा है...' : 'प्रमाणित करें और पोस्टर डिलीट करें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
