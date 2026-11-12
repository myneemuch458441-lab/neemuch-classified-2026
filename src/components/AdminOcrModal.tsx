import React, { useState, useRef } from 'react';
import {
  X,
  Lock,
  Newspaper,
  Upload,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  FileText,
  RotateCcw,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';

interface AdminOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseForAd?: (text: string) => void;
}

const ADMIN_PASSWORD = '3252';

export const AdminOcrModal: React.FC<AdminOcrModalProps> = ({
  isOpen,
  onClose,
  onUseForAd
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // OCR state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [ocrError, setOcrError] = useState('');
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Admin PIN submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (password.trim() !== ADMIN_PASSWORD) {
      setAuthError('अमान्य एडमिन पासवर्ड! केवल अधिकृत एडमिन ही फोटो से टेक्स्ट निकाल सकते हैं।');
      return;
    }

    setIsAuthenticated(true);
  };

  // Convert File to Base64 (with optional canvas downscaling if huge)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError('');
    setExtractedText('');
    setImageMime(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;

      // Downscale if very large to prevent network lag
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.88);
            setSelectedImage(optimizedBase64);
            return;
          }
        }
        setSelectedImage(base64Url);
      };
      img.src = base64Url;
    };
    reader.readAsDataURL(file);
  };

  // Clean user-friendly error formatting
  const formatOcrError = (raw: string): string => {
    if (!raw) return 'फोटो से टेक्स्ट निकालने में समस्या आई। कृपया पुनः प्रयास करें।';
    if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
      return 'सर्वर पर अस्थाई रूप से अधिक लोड है (503 High Demand)। कृपया 2-3 सेकंड बाद "पुनः प्रयास करें" दबाएं।';
    }
    if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
      return 'अनुरोध सीमा पूरी हो गई है। कृपया 2-3 सेकंड रुककर पुनः प्रयास करें।';
    }
    if (raw.startsWith('{') && (raw.includes('"error"') || raw.includes('"message"'))) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.error?.message) {
          return formatOcrError(parsed.error.message);
        }
      } catch {}
    }
    return raw;
  };

  // Trigger OCR extraction via Server API
  const handleExtractText = async () => {
    if (!selectedImage) {
      setOcrError('कृपया पहले न्यूज़पेपर या विज्ञापन की फोटो चुनें।');
      return;
    }

    setIsProcessing(true);
    setOcrError('');
    setExtractedText('');

    try {
      const response = await fetch('/api/ocr-photo-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: imageMime || 'image/jpeg'
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'टेक्स्ट निकालने में असमर्थ। कृपया पुनः प्रयास करें।');
      }

      setExtractedText(result.extractedText || '');
    } catch (err: any) {
      console.error('OCR Error:', err);
      setOcrError(formatOcrError(err?.message || String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy extracted text to clipboard
  const handleCopyText = async () => {
    if (!extractedText) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(extractedText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = extractedText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  // Use for Ad posting directly
  const handleCreateAd = () => {
    if (onUseForAd && extractedText) {
      onUseForAd(extractedText);
      onClose();
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setExtractedText('');
    setOcrError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/80 via-slate-950 to-teal-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black shadow-lg shadow-indigo-500/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  न्यूज़पेपर व फोटो से टेक्स्ट कनवर्टर (OCR)
                </h3>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                    एडमिन अनलॉक ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                अख़बार के विज्ञापन या बोर्ड की फोटो से तुरंत टेक्स्ट बनाएं
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

        {/* Modal Content */}
        {!isAuthenticated ? (
          /* PHASE 1: ADMIN PASSWORD GATE */
          <form onSubmit={handleAuthSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>एडमिन सुरक्षा सत्यापन:</strong> न्यूज़पेपर की कटिंग व फोटो से टेक्स्ट निकालने का फीचर केवल मुख्य एडमिन पासवर्ड से ही ऑपरेट किया जा सकता है।
              </span>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

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

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>सत्यापित करें व खोलें</span>
              </button>
            </div>
          </form>
        ) : (
          /* PHASE 2: OCR SCANNER & TEXT EXTRACTOR */
          <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {ocrError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{ocrError}</span>
                </div>
                {selectedImage && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleExtractText}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                      <span>{isProcessing ? 'प्रयास जारी है...' : '🔄 पुनः प्रयास करें (Retry)'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Upload or View Image */}
            {!extractedText && (
              <div className="space-y-3">
                <div className="text-xs text-slate-300">
                  अख़बार के विज्ञापन (मकान बेचना है, खरीदना है, किराए से देना है आदि) या बोर्ड की तस्वीर अपलोड करें:
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-3xl p-6 sm:p-8 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950/90 transition-all group space-y-3"
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center transition-colors shadow">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        अख़बार या विज्ञापन की फोटो चुनें
                      </span>
                      <span className="text-xs text-slate-400 block mt-1">
                        फ़ोन कैमरा से खींची फोटो या गैलरी से सेलेक्ट करें (PNG, JPG, WEBP)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 max-h-60 flex items-center justify-center">
                      <img
                        src={selectedImage}
                        alt="Newspaper ad preview"
                        className="max-h-56 max-w-full rounded-xl object-contain shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={resetScanner}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-colors"
                        title="हटाएं"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleExtractText}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 border border-amber-300/60 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>फोटो से टेक्स्ट पढ़ा जा रहा है (OCR)...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>✨ फोटो से टेक्स्ट निकालें (Convert to Text)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Extracted Text View with 1-Click Copy and Post as Ad */}
            {extractedText && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>फोटो से निकाला गया टेक्स्ट (तैयार विज्ञापन):</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${
                        copied
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>कॉपी हो गया! ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>📋 1-क्लिक कॉपी करें</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetScanner}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                      title="दूसरी फोटो चुनें"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>दूसरी फोटो</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm leading-relaxed outline-none focus:border-amber-400 font-sans shadow-inner resize-y whitespace-pre-line"
                  />
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-[11px] text-slate-300 flex items-center justify-between gap-2 flex-wrap">
                  <span>
                    💡 आप इस टेक्स्ट को ऊपर <strong>'कॉपी करें'</strong> बटन से कॉपी करके व्हाट्सएप या नोटबुक में रख सकते हैं, या सीधे विज्ञापन बना सकते हैं।
                  </span>
                </div>

                {/* Direct Action: Post as Ad */}
                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'टेक्स्ट क्लिपबोर्ड में कॉपी हो गया' : 'टेक्स्ट कॉपी करें'}</span>
                  </button>

                  {onUseForAd && (
                    <button
                      type="button"
                      onClick={handleCreateAd}
                      className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 border border-amber-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>🚀 सीधे विज्ञापन में उपयोग करें</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
