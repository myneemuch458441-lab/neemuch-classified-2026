import React, { useState, useRef } from 'react';
import {
  Camera,
  Check,
  Upload,
  Trash2,
  AlertCircle,
  Crop,
  Layers,
  Sparkles,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { compressPropertyPhoto } from '../utils/photoCompressor';

interface HousePhotosUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  initiallyOpen?: boolean;
}

export const HousePhotosUploader: React.FC<HousePhotosUploaderProps> = ({
  photos,
  onChange,
  maxPhotos = 10,
  initiallyOpen = false
}) => {
  // Optional toggle: closed by default unless user has photos or clicks the right/checkmark icon
  const [isEnabled, setIsEnabled] = useState<boolean>(initiallyOpen || photos.length > 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If photos exist, ensure enabled
  React.useEffect(() => {
    if (photos.length > 0 && !isEnabled) {
      setIsEnabled(true);
    }
  }, [photos.length]);

  const handleToggle = () => {
    if (isEnabled && photos.length > 0) {
      const confirmClose = window.confirm('क्या आप फोटो अपलोड बंद करना चाहते हैं? चुनी गई फोटो हट जाएंगी।');
      if (!confirmClose) return;
      onChange([]);
    }
    setIsEnabled(!isEnabled);
    setErrorMsg('');
  };

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMsg('');
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      setErrorMsg(`आप अधिकतम ${maxPhotos} फोटो ही अपलोड कर सकते हैं।`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    setIsProcessing(true);

    try {
      const compressedList: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const res = await compressPropertyPhoto(file);
        compressedList.push(res.dataUrl);
      }

      if (compressedList.length > 0) {
        onChange([...photos, ...compressedList]);
      }
    } catch (err: any) {
      console.error('Error compressing photos:', err);
      setErrorMsg('फोटो प्रोसेस करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('क्या आप सभी अपलोड की गई फोटो हटाना चाहते हैं?')) {
      onChange([]);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 sm:p-4 space-y-3 transition-all">
      {/* Optional Checkmark/Right-icon Toggle Button */}
      <div
        onClick={handleToggle}
        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
          isEnabled
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
            : 'bg-slate-900 hover:bg-slate-800/80 border-slate-700/80 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              isEnabled
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-800 border border-slate-600 text-slate-400'
            }`}
          >
            {isEnabled ? <Check className="w-4 h-4 stroke-[3]" /> : <Camera className="w-3.5 h-3.5" />}
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold block">
              मकान के फोटो अपलोड करें (वैकल्पिक / Optional)
            </span>
            <span className="text-[11px] text-slate-400 block">
              {isEnabled
                ? 'फोटो अपलोड चालू है (अधिकतम 10 फोटो)'
                : 'राइट (✓) आइकॉन पर क्लिक करें यदि आप मकान के फोटो भी जोड़ना चाहते हैं'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
              isEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isEnabled ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>चालू (ON)</span>
              </>
            ) : (
              <span>बंद (OFF)</span>
            )}
          </span>
        </div>
      </div>

      {/* Unfolded Upload Section when toggled ON */}
      {isEnabled && (
        <div className="space-y-3 pt-1 animate-in fade-in zoom-in-95 duration-200">
          {/* Size & KB Recommendation Box */}
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1.5 text-xs text-indigo-200">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-amber-400" />
                <span>सुझावित फोटो साइज व KB निर्देश:</span>
              </span>
              <span className="text-[11px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700 font-mono">
                अधिकतम 10 फोटो
              </span>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
              <li>
                <strong>फोटो साइज (Dimensions):</strong> 800×600 px या 4:3 / 16:9 हॉरिजॉन्टल लैंडस्केप
              </li>
              <li>
                <strong>अनुशंसित फाइल साइज (Weight):</strong> लगभग <strong className="text-emerald-400">50 KB से 150 KB</strong> प्रति फोटो
              </li>
              <li className="text-amber-200/90">
                ⚡ <em>ऑटो-कंप्रेशन:</em> आप कैमरे या गैलरी से किसी भी साइज (MB) की फोटो चुन सकते हैं, सिस्टम उसे अपने आप 800×600 px व 50-80 KB में कंप्रेस कर लेगा!
              </li>
            </ul>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFilesSelect}
            className="hidden"
          />

          {/* Upload Dropzone / Button */}
          {photos.length < maxPhotos && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-2xl p-4 text-center cursor-pointer bg-slate-900/60 hover:bg-slate-900/90 transition-all group space-y-1.5"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center transition-colors shadow">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">
                  + मकान के फोटो चुनें ({photos.length}/{maxPhotos} फोटो)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  गैलरी या कैमरा से एक साथ कई फोटो सेलेक्ट करें (JPEG, PNG, WEBP)
                </span>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/30 text-xs text-amber-300 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>फोटो को ऑटो-कंप्रेस व ऑप्टिमाइज़ किया जा रहा है...</span>
            </div>
          )}

          {/* Uploaded Photos Grid */}
          {photos.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>अपलोड की गई फोटो ({photos.length} / {maxPhotos}):</span>
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                >
                  सभी फोटो हटाएं
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {photos.map((src, idx) => {
                  // Calculate rough KB for display
                  const approxKb = Math.round((src.length * 0.75) / 1024);
                  return (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group shadow-md"
                    >
                      <img
                        src={src}
                        alt={`मकान फोटो ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Number and KB Badge */}
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono font-bold text-amber-300">
                        #{idx + 1}
                      </span>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/85 text-[9px] font-mono text-emerald-400">
                        {approxKb} KB
                      </span>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600/90 text-white opacity-80 hover:opacity-100 transition-opacity shadow"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {photos.length < maxPhotos && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/3] rounded-xl border border-dashed border-slate-700 hover:border-amber-500/70 bg-slate-900/40 hover:bg-slate-900/80 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-amber-300 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-[10px] font-bold">+ और जोड़ें</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
