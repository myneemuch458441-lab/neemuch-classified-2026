import React from 'react';
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Sparkles,
  Edit3,
  CheckCircle2,
  XCircle,
  Home,
  IndianRupee,
  Layers,
  Calendar,
  Building,
  Store,
  Shield,
  Tag,
  Key,
  Trash2,
  Lock
} from 'lucide-react';
import { Property, ListingCategory } from '../types/property';
import { sanitizeTextForBookedProperty } from '../utils/privacyMask';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onEdit: (property: Property) => void;
  onShare: (property: Property) => void;
  onToggleAvailability: (property: Property) => Promise<void>;
  onDeleteRequest: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onEdit,
  onShare,
  onToggleAvailability,
  onDeleteRequest,
}) => {
  const category: ListingCategory = property?.listingCategory || 'मकान किराए हेतु';
  const isBooked =
    property?.available === false ||
    String(property?.available).toLowerCase() === 'false' ||
    (property as any)?.status === 'booked';

  // Sanitize title so house number / phone number does not leak when booked
  const displayTitle = React.useMemo(() => {
    if (!property) return '';
    return sanitizeTextForBookedProperty(
      property.title || '',
      Boolean(isBooked),
      property.houseNumber,
      property.contactNumber,
      property.whatsappNumber
    );
  }, [property?.title, property?.houseNumber, property?.contactNumber, property?.whatsappNumber, isBooked]);

  // Sanitize description so phone numbers and house numbers are strictly hidden when booked
  const displayDescription = React.useMemo(() => {
    if (!property) return '';
    return sanitizeTextForBookedProperty(
      property.description || '',
      Boolean(isBooked),
      property.houseNumber,
      property.contactNumber,
      property.whatsappNumber
    );
  }, [property?.description, property?.houseNumber, property?.contactNumber, property?.whatsappNumber, isBooked]);

  // Sanitize landmark so phone numbers/house numbers are strictly hidden when booked
  const displayLandmark = React.useMemo(() => {
    if (!property) return '';
    return sanitizeTextForBookedProperty(
      property.landmark || '',
      Boolean(isBooked),
      property.houseNumber,
      property.contactNumber,
      property.whatsappNumber
    );
  }, [property?.landmark, property?.houseNumber, property?.contactNumber, property?.whatsappNumber, isBooked]);

  if (!property) return null;

  const hasValidPrice = Boolean(property.rent && property.rent > 0);

  const formatPrice = (val?: number) => {
    if (!val || val <= 0) return 'रेंट की जानकारी उपलब्ध नहीं है';
    if (val >= 100000) {
      const inLakhs = val / 100000;
      return `₹${inLakhs % 1 === 0 ? inLakhs : inLakhs.toFixed(2)} लाख`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getPriceLabel = () => {
    if (!hasValidPrice) return '(बातचीत अनुसार)';
    if (property.priceType) return property.priceType;
    if (category === 'गिरवी मकान') return 'गिरवी राशि';
    if (category === 'मकान बेचना है') return 'बिक्री मूल्य';
    return '/ प्रति माह';
  };

  const rawNumber = property.whatsappNumber || property.contactNumber || '917999646575';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  let itemType = 'मकान';
  if (category === 'दुकान') itemType = 'दुकान';
  else if (category === 'गिरवी मकान') itemType = 'गिरवी मकान';
  else if (category === 'मकान बेचना है') itemType = 'बिक्री का मकान';

  const priceText = hasValidPrice
    ? `${getPriceLabel()}: ${formatPrice(property.rent)}`
    : 'रेंट की जानकारी उपलब्ध नहीं है (बातचीत अनुसार)';

  const message = `नमस्ते! मैंने नीमच क्लासिफाइड पर आपकी लिस्टिंग देखी है:
🏷️ श्रेणी: ${category}
📍 पहचान/नंबर: ${property.houseNumber || 'H.N.'}
🏠 स्थान: ${property.colony}
🔑 प्रकार: ${property.config} (${property.floor || 'विवरण'})
💰 ${priceText}

क्या यह ${itemType} अभी उपलब्ध है? कृपया विवरण साझा करें।`;

  const waUrl = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Blueprint Card Banner - Strictly NO PHOTOS rendered */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                {isBooked ? (
                  <span className="px-3 py-1 rounded-lg bg-rose-950/70 text-rose-300 font-bold text-sm border border-rose-500/40 font-mono shadow-sm flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-rose-400" />
                    <span>•••••• (मकान बुक है - नंबर गोपनीय)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-black text-base border border-amber-500/25 font-mono shadow-sm">
                    {property.houseNumber || 'पहचान -'}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs shadow-sm">
                  {category}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700 font-semibold">
                  {property.config}
                </span>
                {property.adPurpose && (
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    property.adPurpose.includes('मालिक') || property.adPurpose.includes('बेचना')
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {property.adPurpose}
                  </span>
                )}
                {property.aiDetected && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    AI सत्यापित
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {displayTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-medium">{property.colony}</span>
              </p>
            </div>

            <div className="text-right shrink-0 pt-1">
              {hasValidPrice ? (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {formatPrice(property.rent)}
                  </span>
                  <span className="text-xs text-slate-400 block -mt-1">{getPriceLabel()}</span>
                </>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-right">
                  <span className="text-sm font-bold text-amber-400 block">
                    रेंट की जानकारी उपलब्ध नहीं है
                  </span>
                  <span className="text-[11px] text-slate-400 block">(बातचीत अनुसार)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body Info */}
        <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          {/* Location and Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">कॉलोनी / स्थान:</span>
                <span className="text-sm font-bold text-white">{property.colony}</span>
                {property.landmark && (
                  <span className="text-xs text-slate-400 block">पहचान: {displayLandmark}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleAvailability(property)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm active:scale-95 ${
                  property.available !== false
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25'
                }`}
                title="शटर बटन: मकान की उपलब्धता स्थिति बदलें"
              >
                {property.available !== false ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>मकान उपलब्ध है</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>मकान बुक हो चुका</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">श्रेणी:</span>
              <span className="text-xs font-bold text-white">{category}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">कॉन्फ़िगरेशन:</span>
              <span className="text-xs font-bold text-white">{property.config}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 block">फ्लोर / साइज़:</span>
              <span className="text-xs font-bold text-white">{property.floor}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              विस्तृत विवरण
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
              {displayDescription || 'कोई विशेष विवरण उपलब्ध नहीं है।'}
            </p>
          </div>

          {/* Amenities / Features */}
          {property.features && property.features.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                उपलब्ध सुविधाएं व विशेषताएं
              </h4>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-200 text-xs border border-slate-800 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Details box */}
          {isBooked ? (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-rose-400 font-bold block">
                    मालिक का संपर्क नंबर हाइड / सुरक्षित है
                  </span>
                  <span className="text-sm font-bold text-slate-500 font-mono blur-[3px] select-none tracking-wider block">
                    +91-98••••••75
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    यह मकान बुक हो चुका है, इसलिए मालिक को बिना वजह कॉल आने से बचाने हेतु पर्सनल जानकारी छुपा दी गई है।
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800/80 text-rose-300/80 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-900/40 cursor-not-allowed select-none"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>कॉल बंद (मकान बुक)</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">मालिक / डीलर संपर्क नंबर</span>
                  <span className="text-base font-bold text-white font-mono">
                    {property.contactNumber || '+91-7999646575'}
                  </span>
                </div>
              </div>

              <a
                href={`tel:${property.contactNumber || '+917999646575'}`}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>कॉल करें</span>
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer Actions: WhatsApp, Share, Edit, and Admin Delete */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 grid grid-cols-12 gap-2">
          {/* Direct WhatsApp Chat */}
          {isBooked ? (
            <button
              type="button"
              disabled
              className="col-span-5 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/90 text-rose-300/80 font-bold text-xs sm:text-sm border border-rose-900/40 cursor-not-allowed select-none"
              title="मकान बुक हो चुका है, मालिक का संपर्क नंबर बंद है"
            >
              <Lock className="w-4 h-4 text-rose-400" />
              <span>व्हाट्सएप बंद (मकान बुक)</span>
            </button>
          ) : (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-5 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.01]"
            >
              <MessageCircle className="w-4 h-4 fill-white stroke-emerald-600" />
              <span>व्हाट्सएप</span>
            </a>
          )}

          {/* Share Button */}
          <button
            onClick={() => {
              onClose();
              onShare(property);
            }}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">शेयर</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => {
              onClose();
              onEdit(property);
            }}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">एडिट</span>
          </button>

          {/* Admin Delete Button with 3252 Password */}
          <button
            onClick={() => {
              onClose();
              onDeleteRequest(property);
            }}
            className="col-span-3 inline-flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
            title="एडमिन डिलीट"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>एडमिन डिलीट</span>
          </button>
        </div>
      </div>
    </div>
  );
};
