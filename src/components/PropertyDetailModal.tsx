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
  Lock,
  Crop,
  Upload,
  Camera,
  ChevronLeft,
  ChevronRight,
  Plus
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
  onOpenPosterUpload?: (property: Property) => void;
  onRequestDeletePoster?: (property: Property) => void;
  onOpenUploadPhotos?: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onEdit,
  onShare,
  onToggleAvailability,
  onDeleteRequest,
  onOpenPosterUpload,
  onRequestDeletePoster,
  onOpenUploadPhotos,
}) => {
  const category: ListingCategory = property?.listingCategory || 'मकान किराए हेतु';
  const isBooked =
    property?.available === false ||
    String(property?.available).toLowerCase() === 'false' ||
    (property as any)?.status === 'booked';

  const [activePhotoIndex, setActivePhotoIndex] = React.useState(0);

  React.useEffect(() => {
    setActivePhotoIndex(0);
  }, [property?.id]);

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

  const hasDisplayPrice = Boolean(property.priceDisplay && property.priceDisplay.trim());
  const hasValidPrice = hasDisplayPrice || Boolean(property.rent && property.rent > 0);
  const isBuyerAd =
    category === 'मकान खरीदना है' ||
    Boolean(property.adPurpose?.includes('खरीदना')) ||
    Boolean(property.title?.includes('खरीदना'));
  const displayCategory: ListingCategory = isBuyerAd ? 'मकान खरीदना है' : category;

  const formatPrice = (val?: number) => {
    if (hasDisplayPrice) return property.priceDisplay!.trim();
    if (!val || val <= 0) {
      if (displayCategory === 'मकान खरीदना है') return 'बजट: बातचीत अनुसार';
      if (displayCategory === 'मकान बेचना है') return 'मूल्य: बातचीत अनुसार';
      if (displayCategory === 'गिरवी मकान') return 'गिरवी राशि: बातचीत अनुसार';
      return 'रेंट की जानकारी उपलब्ध नहीं है';
    }
    if (val >= 100000) {
      const inLakhs = val / 100000;
      return `₹${inLakhs % 1 === 0 ? inLakhs : inLakhs.toFixed(2)} लाख`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getPriceLabel = () => {
    if (!hasValidPrice) return '(बातचीत अनुसार)';
    if (displayCategory === 'मकान खरीदना है') {
      if (property.priceType && property.priceType !== 'बिक्री मूल्य') return property.priceType;
      return 'बजट';
    }
    if (property.priceType) return property.priceType;
    if (displayCategory === 'गिरवी मकान') return 'गिरवी राशि';
    if (displayCategory === 'मकान बेचना है') return 'बिक्री मूल्य';
    return '/ प्रति माह';
  };

  const rawNumber = property.whatsappNumber || property.contactNumber || '917999646575';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  let itemType = 'मकान';
  if (displayCategory === 'दुकान') itemType = 'दुकान';
  else if (displayCategory === 'गिरवी मकान') itemType = 'गिरवी मकान';
  else if (displayCategory === 'मकान बेचना है') itemType = 'बिक्री का मकान';
  else if (displayCategory === 'मकान खरीदना है') itemType = 'प्रॉपर्टी खरीदने की आवश्यकता';

  const priceText = hasValidPrice
    ? `${getPriceLabel()}: ${formatPrice(property.rent)}`
    : `${formatPrice(0)} (बातचीत अनुसार)`;

  const message = `नमस्ते! मैंने नीमच क्लासिफाइड पर आपकी लिस्टिंग देखी है:
🏷️ श्रेणी: ${displayCategory}
📍 पहचान/नंबर: ${property.houseNumber || 'H.N.'}
🏠 स्थान: ${property.colony}
🔑 प्रकार: ${property.config}${property.floor ? ` (${property.floor})` : ''}
💰 ${priceText}

${displayCategory === 'मकान खरीदना है' ? 'मेरे पास आपकी जरूरत के अनुसार प्रॉपर्टी उपलब्ध है।' : `क्या यह ${itemType} अभी उपलब्ध है? कृपया विवरण साझा करें।`}`;

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
                <span className={`px-2.5 py-1 rounded-lg font-bold text-xs shadow-sm ${
                  displayCategory === 'मकान खरीदना है' ? 'bg-sky-400 text-slate-950' : 'bg-emerald-500 text-slate-950'
                }`}>
                  {displayCategory}
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

          {/* House Photos Section (मकान के सभी अपलोड फोटो) */}
          {property.photos && property.photos.length > 0 ? (
            <div className="rounded-2xl border border-indigo-500/40 bg-slate-950/80 p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>मकान के फोटो ({property.photos.length} फोटो)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono">
                    फोटो {activePhotoIndex + 1} / {property.photos.length}
                  </span>
                </span>

                {onOpenUploadPhotos && (
                  <button
                    type="button"
                    onClick={() => onOpenUploadPhotos(property)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>फोटो जोड़ें / बदलें</span>
                  </button>
                )}
              </div>

              {/* Main Photo Viewer */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] max-h-[340px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner group">
                <img
                  src={property.photos[activePhotoIndex] || property.photos[0]}
                  alt={`मकान फोटो ${activePhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />

                {property.photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIndex((prev) => (prev === 0 ? property.photos!.length - 1 : prev - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white border border-slate-700 shadow-md transition-transform active:scale-95"
                      title="पिछली फोटो"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIndex((prev) => (prev === property.photos!.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white border border-slate-700 shadow-md transition-transform active:scale-95"
                      title="अगली फोटो"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm text-[11px] font-mono font-bold text-amber-300 border border-slate-700">
                  📷 {activePhotoIndex + 1} / {property.photos.length}
                </div>
              </div>

              {/* Thumbnails Carousel */}
              {property.photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {property.photos.map((thumb, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative shrink-0 w-16 sm:w-20 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        idx === activePhotoIndex
                          ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={thumb} alt={`थंबनेल ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-slate-950/80 text-[8px] font-mono text-white">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            onOpenUploadPhotos && (
              <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-center flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>इस मकान की कोई फोटो अपलोड नहीं है (वैकल्पिक)</span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenUploadPhotos(property)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ फोटो अपलोड करें</span>
                </button>
              </div>
            )
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              विस्तृत विवरण (विज्ञापन टेक्स्ट)
            </h4>
            <div className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 whitespace-pre-line font-sans">
              {displayDescription || 'कोई विशेष विवरण उपलब्ध नहीं है।'}
            </div>
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

          {/* Section Divider: प्रायोजित दुकान प्रचार पोस्टर */}
          <div className="relative flex items-center justify-center my-2 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-amber-500/40" />
            </div>
            <div className="relative px-3 py-1 rounded-full bg-slate-900 border border-amber-500/50 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>प्रायोजित दुकान प्रचार पोस्टर विज्ञापन</span>
            </div>
          </div>

          {/* 2:1 Shop Poster Advertisement Box */}
          <div className="rounded-2xl border-2 border-amber-500/35 bg-gradient-to-b from-slate-950 via-slate-900/90 to-amber-950/20 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-400" />
                <span>दुकान / बिजनेस 2:1 पोस्टर विज्ञापन</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">2:1 BANNER</span>
              </span>

              <div className="flex items-center gap-2">
                {onOpenPosterUpload && (
                  <button
                    type="button"
                    onClick={() => onOpenPosterUpload(property)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold underline"
                  >
                    {property.posterAd?.imageUrl ? 'पोस्टर बदलें' : '+ पोस्टर लगाएं'}
                  </button>
                )}

                {property.posterAd?.imageUrl && onRequestDeletePoster && (
                  <button
                    type="button"
                    onClick={() => onRequestDeletePoster(property)}
                    className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30 font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="एडमिन पासवर्ड द्वारा पोस्टर डिलीट करें"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>पोस्टर डिलीट</span>
                  </button>
                )}
              </div>
            </div>

            {property.posterAd?.imageUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[2/1] max-w-[440px] mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-slate-950 shadow-xl">
                  <img
                    src={property.posterAd.imageUrl}
                    alt="दुकान 2:1 पोस्टर"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-amber-400/50 text-[9px] font-mono font-bold shadow">
                    2:1 BANNER
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-2">
                <div className="text-xs text-amber-200">
                  इस विज्ञापन के नीचे अपनी दुकान या व्यवसाय का 2:1 पोस्टर विज्ञापन लगाएं (100% फ्री)
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300">
                  <Crop className="w-3.5 h-3.5 text-amber-400" />
                  <span>आवश्यक पोस्टर साइज: </span>
                  <strong className="text-amber-300 font-mono">2:1 (Landscape - 1200×600 px)</strong>
                </div>
                {onOpenPosterUpload && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenPosterUpload(property)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                    >
                      + 2:1 पोस्टर विज्ञापन अपलोड करें
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
