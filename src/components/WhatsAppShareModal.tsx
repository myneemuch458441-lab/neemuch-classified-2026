import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, Share2, Phone } from 'lucide-react';
import { Property, ListingCategory } from '../types/property';
import { sanitizeTextForBookedProperty } from '../utils/privacyMask';

interface WhatsAppShareModalProps {
  property: Property | null;
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  property,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!property) return null;

  const category: ListingCategory = property.listingCategory || 'मकान किराए हेतु';

  const hasValidPrice = Boolean(property.rent && property.rent > 0);

  const formatPrice = (val?: number) => {
    if (!val || val <= 0) return 'रेंट की जानकारी उपलब्ध नहीं है (बातचीत अनुसार)';
    if (val >= 100000) {
      const inLakhs = val / 100000;
      return `₹${inLakhs % 1 === 0 ? inLakhs : inLakhs.toFixed(2)} लाख`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getPriceLabel = () => {
    if (property.priceType) return property.priceType;
    if (category === 'गिरवी मकान') return 'गिरवी राशि';
    if (category === 'मकान बेचना है') return 'बिक्री मूल्य';
    return 'मासिक किराया';
  };

  const priceLine = hasValidPrice
    ? `💰 *${getPriceLabel()}:* ${formatPrice(property.rent)}`
    : '💰 *रेंट / मूल्य:* रेंट की जानकारी उपलब्ध नहीं है (बातचीत अनुसार)';

  const isBooked =
    property.available === false ||
    String(property.available).toLowerCase() === 'false' ||
    (property as any).status === 'booked';

  const safeDescription = sanitizeTextForBookedProperty(
    property.description || 'बुनियादी सुविधाएं उपलब्ध।',
    Boolean(isBooked),
    property.houseNumber,
    property.contactNumber,
    property.whatsappNumber
  );

  const safeLandmark = sanitizeTextForBookedProperty(
    property.landmark || '',
    Boolean(isBooked),
    property.houseNumber,
    property.contactNumber,
    property.whatsappNumber
  );

  const shareText = `🏡 *नीमच क्लासिफाइड (Neemuch Classified) - लिस्टिंग अलर्ट* 🏡

🏷️ *श्रेणी:* ${category}
📍 *पहचान / नंबर:* ${isBooked ? '🔒 [मकान बुक है - नंबर गोपनीय]' : (property.houseNumber || 'H.N.')}
🏙️ *कॉलोनी / स्थान:* ${property.colony}
🔑 *प्रकार:* ${property.config} • ${property.floor || 'विवरण'}
${priceLine}
📞 *सम्पर्क:* ${isBooked ? '🔒 [मकान बुक होने के कारण नंबर सुरक्षित है]' : (property.contactNumber || '+91-7999646575')}
${property.landmark ? `📌 *पहचान स्थल:* ${safeLandmark}\n` : ''}
📝 *विवरण:* ${safeDescription}

${isBooked ? '🚫 *स्थिति:* यह मकान बुक हो चुका है (मालिक का नंबर गोपनीय)\n' : ''}📲 *नीमच क्लासिफाइड हेल्पलाइन:* +91-7999646575`;

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">व्हाट्सएप पर शेयर करें</h3>
              <p className="text-xs text-slate-400">
                नीमच ग्रुप्स या दोस्तों को {category} की जानकारी भेजें
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

        {/* Content Preview */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {shareText}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-emerald-600" />
              <span>व्हाट्सएप पर शेयर करें</span>
            </a>

            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400 font-bold">कॉपी हो गया!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>टेक्स्ट कॉपी करें</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
