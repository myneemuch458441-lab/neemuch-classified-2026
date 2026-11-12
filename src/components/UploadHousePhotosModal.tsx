import React, { useState, useEffect } from 'react';
import { X, Camera, Sparkles, AlertCircle, Check } from 'lucide-react';
import { Property } from '../types/property';
import { HousePhotosUploader } from './HousePhotosUploader';

interface UploadHousePhotosModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePhotos: (propertyId: string, photos: string[]) => Promise<void>;
}

export const UploadHousePhotosModal: React.FC<UploadHousePhotosModalProps> = ({
  property,
  isOpen,
  onClose,
  onSavePhotos
}) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (property && isOpen) {
      setPhotos(property.photos || []);
      setErrorMsg('');
    }
  }, [property, isOpen]);

  if (!isOpen || !property) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSavePhotos(property.id, photos);
      onClose();
    } catch (err: any) {
      console.error('Failed to save house photos:', err);
      setErrorMsg(err?.message || 'फोटो सेव करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/70 via-slate-950 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                मकान के फोटो अपलोड करें / बदलें
              </h3>
              <p className="text-xs text-slate-400">
                [{property.listingCategory || 'मकान'}] {property.config} - {property.colony}
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
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <HousePhotosUploader
            photos={photos}
            onChange={setPhotos}
            maxPhotos={10}
            initiallyOpen={true}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>सेव हो रहा है...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>फोटो सुरक्षित करें ({photos.length} फोटो)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
