import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Store,
  Sparkles,
  AlertCircle,
  Crop,
  Trash2,
  FileImage
} from 'lucide-react';
import { Property, PosterAd } from '../types/property';

interface PublicPosterUploadModalProps {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
  onSavePoster: (propertyId: string, poster: PosterAd | null) => Promise<void>;
  onRequestDeletePoster?: (property: Property) => void;
}

export const PublicPosterUploadModal: React.FC<PublicPosterUploadModalProps> = ({
  isOpen,
  property,
  onClose,
  onSavePoster,
  onRequestDeletePoster
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(property?.posterAd?.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or property changes
  React.useEffect(() => {
    if (property) {
      setSelectedImage(property.posterAd?.imageUrl || null);
      setErrorMessage('');
    }
  }, [property, isOpen]);

  if (!isOpen || !property) return null;

  /**
   * Process and normalize uploaded image to a crisp 2:1 Landscape Banner (1200x600 px)
   * Automatically crops and centers any user photo to 2:1 so no columns or forms are needed.
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string;
      const img = new Image();

      img.onload = () => {
        // Target 2:1 dimensions (1200x600 px)
        const TARGET_WIDTH = 1200;
        const TARGET_HEIGHT = 600;
        const TARGET_ASPECT = 2.0;

        const canvas = document.createElement('canvas');
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setSelectedImage(rawBase64);
          return;
        }

        // Draw dark background to prevent transparent artifacts
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        const imgWidth = img.width;
        const imgHeight = img.height;
        const imgAspect = imgWidth / imgHeight;

        // Calculate aspect fill or crop for true 2:1 ratio
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = imgWidth;
        let sourceHeight = imgHeight;

        if (imgAspect > TARGET_ASPECT) {
          // Wider than 2:1: crop left/right
          sourceWidth = imgHeight * TARGET_ASPECT;
          sourceX = (imgWidth - sourceWidth) / 2;
        } else if (imgAspect < TARGET_ASPECT) {
          // Taller than 2:1: crop top/bottom
          sourceHeight = imgWidth / TARGET_ASPECT;
          sourceY = (imgHeight - sourceHeight) / 2;
        }

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          TARGET_WIDTH,
          TARGET_HEIGHT
        );

        // Convert to optimized JPEG (quality 0.82 for sharp text & lightweight storage)
        const bannerDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setSelectedImage(bannerDataUrl);
      };

      img.src = rawBase64;
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      setErrorMessage('कृपया दुकान या व्यवसाय का 2:1 पोस्टर फोटो चुनें।');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const posterData: PosterAd = {
        imageUrl: selectedImage,
        updatedAt: new Date().toISOString()
      };

      await onSavePoster(property.id, posterData);
      onClose();
    } catch (err: any) {
      console.error('Failed to save poster ad:', err);
      setErrorMessage('पोस्टर सेव करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePoster = () => {
    onClose();
    if (onRequestDeletePoster) {
      onRequestDeletePoster(property);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/70 via-slate-950 to-orange-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/25">
              <Store className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  दुकान / बिजनेस 2:1 पोस्टर विज्ञापन
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  100% फ्री
                </span>
              </div>
              <p className="text-xs text-slate-400">
                सिर्फ अपना 2:1 पोस्टर चुनें और 1-क्लिक में लाइव करें
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Target Listing Reference Banner */}
          <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs flex items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 block text-[11px]">पोस्टर इस विज्ञापन के नीचे दिखेगा:</span>
              <span className="font-bold text-amber-300">
                [{property.listingCategory || 'प्रॉपर्टी'}] {property.config} - {property.colony}
              </span>
            </div>
            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300">
              {property.houseNumber || 'H.N.'}
            </span>
          </div>

          {/* Size Instruction Highlight Box */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-2xl space-y-1 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-black text-amber-300">
              <Crop className="w-4 h-4 text-amber-400" />
              <span>पोस्टर साइज निर्देश: 2:1 (Landscape / 1200×600 px)</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              दुकानदार अपना <strong>2:1 साइज का पोस्टर</strong> बना कर लगाएं। दुकान का नाम, संपर्क नंबर व डिस्काउंट जैसी सभी जानकारियां आपके पोस्टर में ही दिखेंगी, अलग से कोई फॉर्म भरने की आवश्यकता नहीं है।
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 2:1 Poster Image Upload & Preview Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-amber-400" />
                <span>2:1 पोस्टर फोटो चुनें * :</span>
              </span>
              <span className="text-[11px] text-amber-400 font-mono">अनुपात: 2:1 (Landscape)</span>
            </label>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-3xl p-6 sm:p-7 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950/90 transition-all group space-y-2.5"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center transition-colors shadow">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    दुकान या बिजनेस का 2:1 पोस्टर अपलोड करें
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    गैलरी या कैमरा से फोटो चुनें (PNG, JPG, WEBP) • स्वतः 2:1 में फिट
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] text-amber-300 border border-slate-700">
                  <Crop className="w-3 h-3 text-amber-400" />
                  <span>साइज: 2:1 (Landscape - 1200×600 px)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* 2:1 Landscape Preview Box */}
                <div className="relative aspect-[2/1] w-full max-w-[440px] mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-slate-950 shadow-2xl flex items-center justify-center group">
                  <img
                    src={selectedImage}
                    alt="2:1 Poster Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* 2:1 Badge Indicator */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 text-amber-300 border border-amber-400/50 text-[10px] font-black tracking-wider shadow">
                    2:1 POSTER
                  </span>

                  {/* Change Image Overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow hover:bg-amber-400 transition-colors"
                    >
                      फोटो बदलें
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="p-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs shadow hover:bg-rose-600 transition-colors"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    दूसरी फोटो चुनें (Change Photo)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            {property.posterAd ? (
              <button
                type="button"
                onClick={handleRemovePoster}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="पोस्टर हटाने के लिए एडमिन पासवर्ड आवश्यक है"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>पोस्टर हटाएं (एडमिन पासवर्ड)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
              >
                रद्द करें
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedImage}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 border border-amber-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>पोस्टर लाइव हो रहा है...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>🚀 2:1 पोस्टर विज्ञापन लाइव करें</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
