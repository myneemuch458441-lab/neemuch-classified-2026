import React from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Sparkles,
  Edit3,
  CheckCircle2,
  XCircle,
  Building,
  Home,
  Store,
  Shield,
  Tag,
  Key,
  Trash2,
  Lock,
  Crop,
  Upload,
  Camera
} from 'lucide-react';
import { Property, ListingCategory } from '../types/property';
import { sanitizeTextForBookedProperty } from '../utils/privacyMask';

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onShare: (property: Property) => void;
  onSelect: (property: Property) => void;
  onDeleteRequest: (property: Property) => void;
  onToggleAvailabilityRequest: (property: Property) => void;
  onOpenPosterUpload: (property: Property) => void;
  onRequestDeletePoster: (property: Property) => void;
  onViewPhotos?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onShare,
  onSelect,
  onDeleteRequest,
  onToggleAvailabilityRequest,
  onOpenPosterUpload,
  onRequestDeletePoster,
  onViewPhotos,
}) => {
  const category: ListingCategory = property.listingCategory || 'मकान किराए हेतु';
  const isBooked =
    property.available === false ||
    String(property.available).toLowerCase() === 'false' ||
    (property as any).status === 'booked' ||
    (property as any).status === 'unavailable';

  // Sanitize title so house number / phone number does not leak in the title when booked
  const displayTitle = React.useMemo(() => {
    return sanitizeTextForBookedProperty(
      property.title || '',
      isBooked,
      property.houseNumber,
      property.contactNumber,
      property.whatsappNumber
    );
  }, [property.title, property.houseNumber, property.contactNumber, property.whatsappNumber, isBooked]);

  // Sanitize description so phone numbers and house numbers are strictly hidden when booked
  const displayDescription = React.useMemo(() => {
    return sanitizeTextForBookedProperty(
      property.description || '',
      isBooked,
      property.houseNumber,
      property.contactNumber,
      property.whatsappNumber
    );
  }, [property.description, property.houseNumber, property.contactNumber, property.whatsappNumber, isBooked]);

  // Sanitize landmark
  const displayLandmark = React.useMemo(() => {
    return sanitizeTextForBookedProperty(
      property.landmark || '',
      isBooked,
      property.houseNumber,
      property.contactNumber,
      property.whatsappNumber
    );
  }, [property.landmark, property.houseNumber, property.contactNumber, property.whatsappNumber, isBooked]);

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

  // Format WhatsApp chat link with category-specific Hindi greeting
  const getWhatsAppChatUrl = () => {
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

    const message = `नमस्ते! मैंने नीमच क्लासिफाइड (Neemuch Classified) पर आपका [${category}] देखा है:
📍 नंबर/पहचान: ${property.houseNumber || 'H.N.'}
🏠 कॉलोनी/स्थान: ${property.colony}
🔑 प्रकार: ${property.config} (${property.floor || 'विवरण'})
💰 ${priceText}

क्या यह ${itemType} अभी उपलब्ध है? कृपया आगे की जानकारी साझा करें।`;

    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
  };

  // Category Badge Style
  const getCategoryBadge = () => {
    switch (category) {
      case 'गिरवी मकान':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold shadow">
            <Shield className="w-3 h-3 text-amber-300" />
            <span>गिरवी मकान</span>
          </span>
        );
      case 'दुकान':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold shadow">
            <Store className="w-3 h-3 text-cyan-300" />
            <span>दुकान (Shop)</span>
          </span>
        );
      case 'मकान बेचना है':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold shadow">
            <Tag className="w-3 h-3 text-emerald-300" />
            <span>मकान बेचना है</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold shadow">
            <Key className="w-3 h-3 text-indigo-300" />
            <span>किराए हेतु</span>
          </span>
        );
    }
  };

  const getIconForCategory = () => {
    if (category === 'दुकान') return <Store className="w-5 h-5 text-cyan-400" />;
    if (category === 'गिरवी मकान') return <Shield className="w-5 h-5 text-amber-400" />;
    if (category === 'मकान बेचना है') return <Tag className="w-5 h-5 text-emerald-400" />;
    return <Home className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <div className="h-full flex flex-col justify-between gap-2.5 group/listing">
      {/* 1. मुख्य प्रॉपर्टी विज्ञापन कार्ड (Main Property Classified Listing Card) */}
      <div className={`flex-1 flex flex-col justify-between group bg-slate-900/90 hover:bg-slate-900 border ${
        isBooked ? 'border-rose-900/50 hover:border-rose-600/50' : 'border-slate-800 hover:border-emerald-500/50'
      } rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-950/30 transition-all duration-300`}>
        {/* Booked Status Top Alert Ribbon */}
      {isBooked && (
        <div className="bg-rose-950/90 border-b border-rose-500/40 px-3.5 py-1.5 flex items-center justify-between text-xs text-rose-300 font-bold shadow-inner">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>मकान बुक हो चुका है</span>
          </span>
          <span className="text-[10px] bg-rose-900/80 text-rose-200 px-2 py-0.5 rounded-full border border-rose-500/40">
            🔒 मकान नं. व मोबाइल हाइड
          </span>
        </div>
      )}

      {/* Architectural Blueprint Card Header - NO PHOTOS SHOWN ON SCREEN */}
      <div className="flex-1 flex flex-col justify-between">
        <div
          className="relative p-4 sm:p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 cursor-pointer overflow-hidden group-hover:border-emerald-500/30 transition-colors"
          onClick={() => onSelect(property)}
        >
          {/* Subtle architectural grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:14px_14px] opacity-40 pointer-events-none" />

          <div className="relative z-10 space-y-3">
            {/* Header row: House/Shop Number and Category Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow">
                  {getIconForCategory()}
                </div>
                <div>
                  {isBooked ? (
                    <div className="flex items-center gap-1.5 py-0.5">
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-300 font-mono bg-rose-950/90 px-2.5 py-1 rounded-lg border border-rose-500/50 shadow-inner">
                        <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="line-through blur-[2px] select-none text-slate-500">••••</span>
                        <span className="text-[11px] font-bold text-rose-300 ml-1">मकान बुक है (गोपनीय)</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-base sm:text-lg font-black text-amber-300 tracking-wide font-mono block">
                      {property.houseNumber || 'H.N. -'}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block -mt-0.5">
                    {category === 'दुकान' ? 'दुकान / कमर्शियल' : 'नीमच प्रॉपर्टी'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {getCategoryBadge()}
                {property.aiDetected && (
                  <span
                    className="inline-flex items-center p-1 rounded-lg bg-indigo-950/80 text-amber-300 border border-indigo-500/30"
                    title="AI सत्यापित"
                  >
                    <Sparkles className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>

            {/* Price and Config Highlights */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-sm">
                  {property.config}
                </span>
                <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700">
                  {property.floor || 'विवरण'}
                </span>
              </div>

              <div className="text-right">
                {hasValidPrice ? (
                  <>
                    <span className="text-emerald-400 font-extrabold text-lg sm:text-xl">
                      {formatPrice(property.rent)}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-1">{getPriceLabel()}</span>
                  </>
                ) : (
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 block text-right">
                    रेंट की जानकारी उपलब्ध नहीं है
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card Body - Flex-1 so cards with varying content expand evenly */}
        <div className="flex-1 flex flex-col justify-between p-3.5">
          <div className="space-y-2.5">
            {/* Ad Purpose / Role Tag if present */}
            {property.adPurpose && (
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  property.adPurpose.includes('मालिक') || property.adPurpose.includes('बेचना')
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                }`}>
                  {property.adPurpose}
                </span>
              </div>
            )}

            {/* Title */}
            <h3
              onClick={() => onSelect(property)}
              className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 cursor-pointer"
              title={displayTitle}
            >
              {displayTitle}
            </h3>

            {/* Colony / Locality */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate font-medium">{property.colony}</span>
            </div>

            {/* Landmark if present */}
            {property.landmark && (
              <div className="text-[11px] text-slate-400 truncate pl-5 -mt-1">
                पहचान: {displayLandmark}
              </div>
            )}

            {/* Description snippet */}
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {displayDescription || 'नीमच क्लासिफाइड पर सूचीबद्ध प्रॉपर्टी।'}
            </p>

            {/* Features Tags */}
            {property.features && property.features.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {property.features.slice(0, 3).map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] border border-slate-800"
                  >
                    ✓ {feat}
                  </span>
                ))}
                {property.features.length > 3 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-slate-500 text-[10px]">
                    +{property.features.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* House Photos Button: बाहर मेन पेज पर सिर्फ मकान के फोटो देखने के लिए यहां क्लिक करे */}
            {property.photos && property.photos.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPhotos?.(property);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 hover:from-cyan-900 hover:to-indigo-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold flex items-center justify-between transition-all shadow-md group cursor-pointer active:scale-[0.99]"
                  title="मकान के सभी अपलोड फोटो देखें"
                >
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="font-extrabold tracking-wide">मकान के फोटो देखने के लिए यहां क्लिक करे</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold shrink-0">
                    {property.photos.length} फोटो
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Contact Bar with Shutter Button directly above Delete button - pinned to bottom */}
          <div className="pt-2.5 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            {isBooked ? (
              <div
                className="flex items-center gap-1.5 text-xs text-rose-400 font-mono py-0.5"
                title="मकान बुक हो चुका है - मालिक का नंबर सुरक्षित कर दिया गया है"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="blur-[3px] select-none text-slate-400 font-bold tracking-wider">
                  +91-98••••••75
                </span>
                <span className="text-[10px] text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/30 font-sans">
                  नंबर हाइड है
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-300 font-mono">
                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{property.contactNumber || '+91-7999646575'}</span>
              </div>
            )}

            {/* Shutter Button (शटर बटन) directly above Delete button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAvailabilityRequest(property);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-sm active:scale-95 ${
                property.available !== false
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/40 hover:border-emerald-500/60'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border-rose-500/40 hover:border-rose-500/60'
              }`}
              title="शटर बटन: क्लिक कर मकान की उपलब्धता बदलें"
            >
              {property.available !== false ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>मकान उपलब्ध है</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>मकान बुक हो चुका</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card Action Buttons: WhatsApp, Share, Edit, and Admin Delete */}
      <div className="shrink-0 p-3 pt-0 grid grid-cols-12 gap-1.5">
        {/* Direct WhatsApp Chat Button - Disabled when booked */}
        {isBooked ? (
          <button
            type="button"
            disabled
            className="col-span-5 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-800/90 text-rose-300/80 font-bold text-xs border border-rose-900/40 cursor-not-allowed select-none shadow"
            title="मकान बुक हो चुका है, मालिक को अनावश्यक कॉल/मैसेज से बचाने हेतु संपर्क बंद है"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate text-[11px]">संपर्क बंद (बुक है)</span>
          </button>
        ) : (
          <a
            href={getWhatsAppChatUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-5 inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="सीधे व्हाट्सएप पर चैट करें"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white stroke-emerald-600 shrink-0" />
            <span className="truncate">व्हाट्सएप</span>
          </a>
        )}

        {/* WhatsApp Share Button */}
        <button
          onClick={() => onShare(property)}
          className="col-span-2 inline-flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 border border-slate-700 text-xs font-medium transition-all"
          title="व्हाट्सएप पर शेयर करें"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[10px]">शेयर</span>
        </button>

        {/* Edit Button */}
        <button
          onClick={() => onEdit(property)}
          className="col-span-2 inline-flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition-all"
          title="विवरण देखें / एडिट करें"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline text-[10px]">एडिट</span>
        </button>

        {/* Admin Delete Button - NO PASSWORD IN TITLE TOOLTIP */}
        <button
          onClick={() => onDeleteRequest(property)}
          className="col-span-3 inline-flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
          title="एडमिन डिलीट"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="text-[11px] truncate">डिलीट</span>
        </button>
      </div>
    </div>

      {/* 2. स्पष्ट विभाजक पट्टी (Clear Visual Division between House Listing & Shop Poster) */}
      <div className="shrink-0 relative flex items-center justify-center my-1 select-none">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed border-amber-500/40" />
        </div>
        <div className="relative px-3 py-0.5 rounded-full bg-slate-950 border border-amber-500/50 text-[10px] font-black text-amber-300 flex items-center gap-1.5 shadow-md">
          <Store className="w-3 h-3 text-amber-400" />
          <span>दुकान प्रचार पोस्टर विज्ञापन</span>
        </div>
      </div>

      {/* 3. अलग दुकान / बिजनेस 2:1 पोस्टर बॉक्स (Distinct Dedicated Shop Poster Box) */}
      <div className="shrink-0 rounded-2xl border-2 border-amber-500/35 hover:border-amber-400/80 bg-gradient-to-b from-slate-950 via-slate-900/95 to-amber-950/20 p-3 sm:p-3.5 shadow-xl transition-all">
        {property.posterAd && property.posterAd.imageUrl ? (
          /* Case A: Poster Already Uploaded - 2:1 Aspect Ratio Display */
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1 text-[11px] h-6">
              <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>दुकान / बिजनेस 2:1 पोस्टर</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono font-bold">2:1 BANNER</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPosterUpload(property)}
                  className="text-[10px] text-slate-400 hover:text-amber-300 font-semibold underline flex items-center gap-1 transition-colors cursor-pointer"
                  title="पोस्टर बदलें या अपडेट करें"
                >
                  <span>बदलें</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRequestDeletePoster(property)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="एडमिन पासवर्ड द्वारा पोस्टर डिलीट करें"
                >
                  <Trash2 className="w-2.5 h-2.5 text-rose-400" />
                  <span>डिलीट</span>
                </button>
              </div>
            </div>

            {/* 2:1 Landscape Frame Container */}
            <div
              onClick={() => onOpenPosterUpload(property)}
              className="relative aspect-[2/1] w-full rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 shadow-xl cursor-pointer group/poster"
              title="2:1 पोस्टर देखने या बदलने के लिए क्लिक करें"
            >
              <img
                src={property.posterAd.imageUrl}
                alt="दुकान 2:1 पोस्टर"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/poster:scale-105"
              />

              {/* 2:1 Tag on Image */}
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-amber-400/50 text-[9px] font-mono font-bold shadow">
                2:1 BANNER
              </span>
            </div>
          </div>
        ) : (
          /* Case B: No Poster Yet - Prominent Public Upload CTA Box with matching 2:1 Aspect Ratio Frame */
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1 text-[11px] h-6">
              <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>दुकान प्रचार पोस्टर विज्ञापन</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% फ्री
              </span>
            </div>

            {/* 2:1 Landscape Upload Frame - exact aspect-[2/1] matching uploaded posters */}
            <div
              onClick={() => onOpenPosterUpload(property)}
              className="relative aspect-[2/1] w-full rounded-xl border-2 border-dashed border-amber-500/50 hover:border-amber-400 bg-gradient-to-b from-slate-950/90 to-amber-950/20 p-2.5 flex flex-col items-center justify-center gap-2 text-center shadow-inner cursor-pointer transition-all group/cta"
              title="यहाँ अपनी दुकान या फर्म का 2:1 साइज पोस्टर अपलोड करें"
            >
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 flex items-center justify-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>पोस्टर साइज: </span>
                <strong className="text-amber-300 font-mono">2:1 (1200×600 px)</strong>
              </div>

              <span className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 border border-amber-300/50 group-hover/cta:scale-105 transition-transform">
                <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ 2:1 पोस्टर विज्ञापन अपलोड करें</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
