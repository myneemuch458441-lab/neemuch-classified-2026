import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Database,
  Building,
  RefreshCw,
  Edit2,
  Check,
  Store,
  Shield,
  Tag,
  Key,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { Property, BulkUploadItem, ListingCategory } from '../types/property';
import { compressImage, extractPropertyFromImage } from '../services/aiBulkExtractor';

interface AIBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkSave: (properties: Omit<Property, 'id'>[]) => Promise<number>;
}

export const AIBulkUploadModal: React.FC<AIBulkUploadModalProps> = ({
  isOpen,
  onClose,
  onBulkSave,
}) => {
  const [items, setItems] = useState<BulkUploadItem[]>([]);
  const [selectedBatchCategory, setSelectedBatchCategory] = useState<ListingCategory | 'Auto'>('Auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [savedSuccessCount, setSavedSuccessCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process a queue of items with AI extraction immediately
  const processExtractionQueue = async (itemsToProcess: BulkUploadItem[], preferredCat: ListingCategory | 'Auto') => {
    if (itemsToProcess.length === 0) return;

    setIsProcessing(true);
    const totalToProcess = itemsToProcess.length;
    setProgress({ current: 0, total: totalToProcess, percent: 0 });

    let completedCount = 0;
    const CONCURRENCY = 3;
    const queue = [...itemsToProcess];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item || !item.file) continue;

        setItems((current) =>
          current.map((it) => (it.id === item.id ? { ...it, status: 'processing' } : it))
        );

        try {
          const compressedDataUrl = await compressImage(item.file, 1200, 0.8);
          const indexHint = completedCount;
          const cat = preferredCat === 'Auto' ? undefined : preferredCat;

          const { data, confidence, detectedTags } = await extractPropertyFromImage(
            item.file,
            compressedDataUrl || item.previewUrl,
            indexHint,
            cat
          );

          setItems((current) =>
            current.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: 'success',
                    previewUrl: compressedDataUrl || it.previewUrl,
                    extractedData: {
                      ...data,
                      aiConfidence: confidence,
                      aiTags: detectedTags,
                    },
                  }
                : it
            )
          );
        } catch (err: any) {
          console.error('Extraction error for item:', item.id, err);
          setItems((current) =>
            current.map((it) =>
              it.id === item.id
                ? { ...it, status: 'failed', error: err?.message || 'डेटा निकालने में त्रुटि' }
                : it
            )
          );
        } finally {
          completedCount++;
          setProgress({
            current: completedCount,
            total: totalToProcess,
            percent: Math.round((completedCount / totalToProcess) * 100),
          });
        }
      }
    };

    const workers = Array.from({ length: Math.min(CONCURRENCY, totalToProcess) }, () => worker());
    await Promise.all(workers);
    setIsProcessing(false);
  };

  // Handle file selection (starts extraction automatically!)
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setErrorMsg('');
    setSavedSuccessCount(null);

    const selectedFiles = Array.from(fileList).slice(0, 500);
    const newItems: BulkUploadItem[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `upload-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        file,
        previewUrl,
        status: 'pending',
      });
    }

    // Add to state and immediately trigger extraction
    setItems((prev) => [...prev, ...newItems].slice(0, 500));
    // Trigger extraction queue immediately with the new items
    processExtractionQueue(newItems, selectedBatchCategory);
  };

  // Retry or manual re-run for any pending or failed items
  const retryFailedOrPending = () => {
    const pendingItems = items.filter((it) => it.status === 'pending' || it.status === 'failed');
    if (pendingItems.length > 0) {
      processExtractionQueue(pendingItems, selectedBatchCategory);
    }
  };

  // Update item field inline
  const updateItemData = (id: string, field: keyof Property, value: any) => {
    setItems((current) =>
      current.map((it) => {
        if (it.id !== id) return it;
        const currentData = it.extractedData || {};
        const updatedData = { ...currentData, [field]: value };

        if (field === 'listingCategory') {
          if (value === 'गिरवी मकान') {
            updatedData.priceType = 'गिरवी राशि';
          } else if (value === 'मकान बेचना है') {
            updatedData.priceType = 'बिक्री मूल्य';
          } else {
            updatedData.priceType = 'प्रति माह';
          }
        }

        return {
          ...it,
          extractedData: updatedData,
        };
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((it) => it.id !== id));
  };

  // Commit items to Firestore
  const handleSaveAllToDatabase = async () => {
    const readyItems = items
      .filter((it) => it.status === 'success' && it.extractedData)
      .map((it) => ({
        ...(it.extractedData as Omit<Property, 'id'>),
        imageUrl: '', // Strictly no photos stored on screen cards
      }));

    if (readyItems.length === 0) {
      setErrorMsg('सेव करने के लिए कोई मान्य प्रॉपर्टी डेटा तैयार नहीं है। कृपया फ़ोटो चुनें।');
      return;
    }

    try {
      setIsSavingToDb(true);
      setErrorMsg('');
      const count = await onBulkSave(readyItems);
      setSavedSuccessCount(count);
      setItems([]);
    } catch (err: any) {
      console.error('Failed to save bulk properties:', err);
      setErrorMsg(err.message || 'डेटाबेस में बल्क सेव करने में त्रुटि हुई।');
    } finally {
      setIsSavingToDb(false);
    }
  };

  // Save single item directly
  const handleSaveSingleItem = async (item: BulkUploadItem) => {
    if (!item.extractedData) return;
    try {
      setIsSavingToDb(true);
      setErrorMsg('');
      await onBulkSave([{
        ...(item.extractedData as Omit<Property, 'id'>),
        imageUrl: '',
      }]);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      setSavedSuccessCount(1);
    } catch (err: any) {
      setErrorMsg(err.message || 'सेव करने में त्रुटि हुई।');
    } finally {
      setIsSavingToDb(false);
    }
  };

  const successCount = items.filter((it) => it.status === 'success').length;
  const pendingCount = items.filter((it) => it.status === 'pending').length;
  const processingCount = items.filter((it) => it.status === 'processing').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">
                  % AI बल्क अपलोड (मकान, दुकान, गिरवी व बिक्री)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold">
                  ऑटो विज़न डिटेक्शन
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1 से 500 फोटो अपलोड करें — AI स्वतः श्रेणी, कॉलोनी, कमरा, फ़ोन व रेंट की जानकारी निकाल कर ऐप में जोड़ेगा।
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Success Banner */}
          {savedSuccessCount !== null && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 text-sm flex items-center justify-between gap-3 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-white">सफलतापूर्वक ऐप में जुड़ गया!</p>
                  <p className="text-xs text-emerald-200">
                    {savedSuccessCount} लिस्टिंग नीमच क्लासिफाइड में स्थायी रूप से सेव कर दी गई है।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <span>ऐप पर देखें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Batch Category Selector Bar */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">
                अपलोड बैच की श्रेणी (Batch Category):
              </span>
              <span className="text-[11px] text-slate-400">
                यदि आप केवल गिरवी, दुकान या बिक्री के फोटो डाल रहे हैं तो श्रेणी चुन सकते हैं, अन्यथा AI अपने-आप तय करेगा।
              </span>
            </div>

            <select
              value={selectedBatchCategory}
              onChange={(e) => setSelectedBatchCategory(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-emerald-400 outline-none cursor-pointer"
            >
              <option value="Auto">✨ ऑटो-डिटेक्ट (AI द्वारा स्वतः पहचानें)</option>
              <option value="मकान किराए हेतु">🔑 केवल मकान किराए हेतु</option>
              <option value="गिरवी मकान">🤝 केवल गिरवी मकान</option>
              <option value="दुकान">🏪 केवल दुकान (Shop)</option>
              <option value="मकान बेचना है">🏷️ केवल मकान बेचना है</option>
            </select>
          </div>

          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all group flex flex-col items-center justify-center gap-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">
              मकान, दुकान या बोर्ड की तस्वीरें चुनें (Single या Bulk)
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              दुकानों के शटर, किराए के बोर्ड, 'मकान बेचना है' साइन, 'गिरवी मकान' या नंबर प्लेट की तस्वीरें यहाँ ड्रॉप करें
            </p>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mt-1">
              ✨ फोटो चुनते ही AI स्वतः तुरंत डेटा निकालना शुरू कर देगा
            </span>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Progress Bar (when AI is processing) */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-200">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  AI विज़न द्वारा फोटो से विवरण निकाला जा रहा है...
                </span>
                <span>
                  {progress.current} / {progress.total} फोटो ({progress.percent}%)
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Extracted Review Cards */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
                <span>
                  स्कैन की गई तस्वीरें ({items.length} कुल • {successCount} तैयार • {processingCount + pendingCount} प्रोसेस में)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setItems([])}
                    disabled={isProcessing || isSavingToDb}
                    className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                  >
                    सभी हटाएं
                  </button>
                  {items.some((it) => it.status === 'failed') && (
                    <button
                      type="button"
                      onClick={retryFailedOrPending}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                    >
                      त्रुटि वाली फोटो पुनः स्कैन करें
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const data = item.extractedData;
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col justify-between gap-2.5 text-xs relative group shadow-md"
                    >
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute top-2.5 right-2.5 p-1 rounded-md bg-slate-900/80 text-slate-400 hover:text-rose-400 border border-slate-700 z-10"
                        title="हटाएँ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex gap-3">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative">
                          <img
                            src={item.previewUrl}
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                          {item.status === 'processing' && (
                            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-6 space-y-1">
                          {item.status === 'processing' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
                              AI स्कैन जारी...
                            </span>
                          )}

                          {item.status === 'failed' && (
                            <span className="inline-block px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                              त्रुटि: {item.error || 'स्कैन विफल'}
                            </span>
                          )}

                          {item.status === 'success' && data && (
                            <>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                  ✓ {data.listingCategory}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-mono">
                                  {data.houseNumber || 'H.N.'}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                  {data.config}
                                </span>
                              </div>

                              <p className="font-bold text-white text-xs truncate">
                                {data.title}
                              </p>

                              <p className="text-[11px] text-slate-400 truncate">
                                📍 {data.colony}
                              </p>

                              <p className="text-[11px] text-slate-300 font-mono">
                                📞 {data.contactNumber || '+91-7999646575'}
                              </p>

                              <div className="pt-1">
                                {data.rent && data.rent > 0 ? (
                                  <span className="text-emerald-400 font-black text-xs">
                                    ₹{data.rent.toLocaleString('en-IN')} {data.priceType || ''}
                                  </span>
                                ) : (
                                  <span className="text-amber-400 text-[10px] font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    रेंट की जानकारी उपलब्ध नहीं है
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Single Item Quick Save Button */}
                      {item.status === 'success' && data && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {data.features && data.features.length > 0
                              ? data.features.slice(0, 2).join(', ')
                              : 'डेटा सत्यापित'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSaveSingleItem(item)}
                            disabled={isSavingToDb}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>ऐप में जोड़ें</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {successCount > 0 ? (
              <span className="text-emerald-400 font-semibold">
                ✓ {successCount} लिस्टिंग्स ऐप में सेव करने के लिए तैयार हैं
              </span>
            ) : (
              <span>फोटो चुनते ही AI विवरण निकाल देगा</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSavingToDb}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              बंद करें
            </button>

            {successCount > 0 && (
              <button
                type="button"
                onClick={handleSaveAllToDatabase}
                disabled={isSavingToDb || isProcessing}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Database className="w-4 h-4 text-slate-950" />
                <span>
                  {isSavingToDb
                    ? 'डेटाबेस में सेव हो रहा है...'
                    : `🚀 सभी ${successCount} लिस्टिंग्स ऐप में सेव करें`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
