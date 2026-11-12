import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  MapPin,
  Phone,
  MessageCircle,
  Home,
  Layers,
  Lock,
  Plus
} from 'lucide-react';
import { Property } from '../types/property';
import { sanitizeTextForBookedProperty } from '../utils/privacyMask';

interface PropertyPhotoGalleryModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenUploadPhotos?: (property: Property) => void;
}

export const PropertyPhotoGalleryModal: React.FC<PropertyPhotoGalleryModalProps> = ({
  property,
  isOpen,
  onClose,
  onOpenUploadPhotos
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen, property]);

  // Keyboard navigation (Arrow keys, Esc)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen || !property) return null;

  const photos = property.photos || [];
  const totalPhotos = photos.length;

  const handlePrev = () => {
    if (totalPhotos <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalPhotos <= 1) return;
    setCurrentIndex((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
  };

  const isBooked =
    property.available === false ||
    String(property.available).toLowerCase() === 'false' ||
    (property as any)?.status === 'booked';

  const cleanPhone = (property.whatsappNumber || property.contactNumber || '917999646575').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`नमस्ते, मैंने नीमच क्लासिफाइड पर आपके मकान [${property.colony} - ${property.config}] के फोटो देखे हैं। क्या यह अभी उपलब्ध है?`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-3 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
                  {property.listingCategory || 'मकान'}
                </span>
                <span className="text-xs text-amber-300 font-bold font-mono">
                  {property.houseNumber || 'H.N.'}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {property.config}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{property.colony}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenUploadPhotos && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUploadPhotos(property);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1 transition-colors"
                title="और फोटो जोड़ें या बदलें"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">फोटो जोड़ें/बदलें</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {totalPhotos > 0 ? (
            <div className="space-y-3">
              {/* Main Photo Display Area */}
              <div className="relative aspect-[4/3] sm:aspect-[16/10] max-h-[60vh] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center group shadow-2xl">
                <img
                  src={photos[currentIndex]}
                  alt={`मकान फोटो ${currentIndex + 1}`}
                  className="w-full h-full object-contain select-none"
                />

                {/* Left Arrow Button */}
                {totalPhotos > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/75 hover:bg-slate-900 text-white border border-slate-700/80 shadow-lg transition-transform active:scale-95"
                    title="पिछली फोटो (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Right Arrow Button */}
                {totalPhotos > 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/75 hover:bg-slate-900 text-white border border-slate-700/80 shadow-lg transition-transform active:scale-95"
                    title="अगली फोटो (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Counter Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-sm text-xs font-mono font-bold text-amber-300 border border-slate-700 shadow flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>फोटो {currentIndex + 1} / {totalPhotos}</span>
                </div>
              </div>

              {/* Thumbnails Carousel Bar */}
              {totalPhotos > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-slate-700 pb-1">
                  {photos.map((thumb, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative shrink-0 w-16 sm:w-20 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={thumb}
                        alt={`थंबनेल ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-slate-950/80 text-[8px] font-mono text-white">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 space-y-3">
              <Camera className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  इस मकान के लिए अभी कोई फोटो अपलोड नहीं की गई है।
                </p>
                <p className="text-xs text-slate-400">
                  हर विज्ञापनदाता मकान के फोटो अपलोड नहीं करता, यह वैकल्पिक सुविधा है।
                </p>
              </div>
              {onOpenUploadPhotos && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUploadPhotos(property);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ मकान के फोटो जोड़ें (अधिकतम 10)</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Contact Bar below photos */}
          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
            {isBooked ? (
              <div className="text-xs text-rose-400 flex items-center gap-1.5 font-bold">
                <Lock className="w-4 h-4" />
                <span>यह मकान बुक हो चुका है</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${property.contactNumber || '+917999646575'}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>कॉल करें</span>
                </a>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>व्हाट्सएप</span>
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              बंद करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
