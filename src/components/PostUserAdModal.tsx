import React, { useState } from 'react';
import {
  X,
  Megaphone,
  Home,
  Store,
  Shield,
  Tag,
  Key,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Check,
  UserCheck,
  Search
} from 'lucide-react';
import { Property, PropertyConfig, ListingCategory } from '../types/property';
import { NEEMUCH_COLONIES } from '../data/seedProperties';

interface PostUserAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostAd: (propertyData: Omit<Property, 'id'>) => Promise<void>;
}

// Sub-options per category specified by user
export const AD_PURPOSE_OPTIONS: Record<
  ListingCategory,
  { label: string; role: 'owner' | 'seeker'; badge: string }[]
> = {
  'मकान किराए हेतु': [
    {
      label: 'मकान किराए से देना है (मकान मालिक)',
      role: 'owner',
      badge: 'मकान मालिक'
    },
    {
      label: 'मकान किराए से चाहिए (किराएदार)',
      role: 'seeker',
      badge: 'किराएदार'
    }
  ],
  'गिरवी मकान': [
    {
      label: 'मकान गिरवी देना है (मकान मालिक)',
      role: 'owner',
      badge: 'मकान मालिक'
    },
    {
      label: 'मकान गिरवी चाहिए (किराएदार)',
      role: 'seeker',
      badge: 'किराएदार'
    }
  ],
  'दुकान': [
    {
      label: 'दुकान किराए से देना है (दुकान मालिक)',
      role: 'owner',
      badge: 'दुकान मालिक'
    },
    {
      label: 'दुकान गिरवी देना है (दुकान मालिक)',
      role: 'owner',
      badge: 'दुकान मालिक'
    },
    {
      label: 'दुकान किराए से चाहिए (किराएदार)',
      role: 'seeker',
      badge: 'किराएदार'
    },
    {
      label: 'दुकान गिरवी चाहिए (किराएदार)',
      role: 'seeker',
      badge: 'किराएदार'
    }
  ],
  'मकान बेचना है': [
    {
      label: 'मकान बेचना है',
      role: 'owner',
      badge: 'विक्रेता (Seller)'
    },
    {
      label: 'मकान खरीदना है',
      role: 'seeker',
      badge: 'खरीदार (Buyer)'
    }
  ]
};

// Exact features requested by user (separated Narmada water & Borewell and all 17 amenities)
const COMMON_FEATURES = [
  'नगर पालिका नल कनेक्शन',
  'बोरवेल',
  'सेपरेट बिजली मीटर',
  'सब मीटर',
  'बालकनी उपलब्ध',
  'टेरिस उपलब्ध',
  'फर्नीश्ड मकान उपलब्ध',
  'सेमी फर्नीश्ड मकान उपलब्ध',
  'मॉडुलर किचन उपलब्ध',
  'न्यू कंस्ट्रक्शन मकान',
  'ओल्ड कंस्ट्रक्शन मकान',
  'मंदिर निकट',
  'गार्डन लोकेशन मकान',
  'मेन रोड फेसिंग मकान',
  'कार पार्किंग स्पेस उपलब्ध',
  'बाइक पार्किंग स्पेस उपलब्ध',
  'सीसीटीवी कैमरे उपलब्ध'
];

export const PostUserAdModal: React.FC<PostUserAdModalProps> = ({
  isOpen,
  onClose,
  onPostAd
}) => {
  const [listingCategory, setListingCategory] = useState<ListingCategory>('मकान किराए हेतु');
  const [adPurpose, setAdPurpose] = useState<string>('मकान किराए से देना है (मकान मालिक)');
  const [title, setTitle] = useState('');
  const [colony, setColony] = useState(NEEMUCH_COLONIES[0]);
  const [customColony, setCustomColony] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [config, setConfig] = useState<PropertyConfig | string>('2BHK');
  const [floor, setFloor] = useState('ग्राउंड फ्लोर');
  const [rent, setRent] = useState<number | ''>('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'नगर पालिका नल कनेक्शन',
    'बोरवेल',
    'सेपरेट बिजली मीटर'
  ]);
  const [customFeature, setCustomFeature] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPurposes = AD_PURPOSE_OPTIONS[listingCategory] || [];
  const selectedPurposeObj = currentPurposes.find((p) => p.label === adPurpose) || currentPurposes[0];
  const isSeeker = selectedPurposeObj?.role === 'seeker';

  const handleCategorySelect = (cat: ListingCategory) => {
    setListingCategory(cat);
    const availablePurposes = AD_PURPOSE_OPTIONS[cat] || [];
    if (availablePurposes.length > 0) {
      setAdPurpose(availablePurposes[0].label);
    }
    if (cat === 'दुकान') {
      setConfig('दुकान (Shop)');
      setFloor('ग्राउंड फ्लोर शटर');
    } else if (cat === 'गिरवी मकान') {
      setConfig('2BHK');
      setFloor('स्वतंत्र मकान (2 वर्ष लीज)');
    } else if (cat === 'मकान बेचना है') {
      setConfig('3BHK');
      setFloor('स्वतंत्र मकान');
    } else {
      setConfig('2BHK');
      setFloor('ग्राउंड फ्लोर');
    }
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleAddCustomFeature = () => {
    const val = customFeature.trim();
    if (val && !selectedFeatures.includes(val)) {
      setSelectedFeatures([...selectedFeatures, val]);
      setCustomFeature('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalColony = colony === 'अन्य (Other)' ? customColony.trim() : colony;
    if (!finalColony) {
      setErrorMsg('कृपया कॉलोनी का नाम चुनें या दर्ज करें।');
      return;
    }

    if (!contactNumber.trim()) {
      setErrorMsg('कृपया संपर्क नंबर (मोबाइल नंबर) दर्ज करें ताकि लोग आपसे बात कर सकें।');
      return;
    }

    const cleanContact = contactNumber.trim();
    const cleanWaRaw = (whatsappNumber.trim() || cleanContact).replace(/[^0-9]/g, '');
    const cleanWa = cleanWaRaw.length === 10 ? `91${cleanWaRaw}` : cleanWaRaw;

    let priceType = 'प्रति माह';
    if (listingCategory === 'गिरवी मकान') priceType = 'गिरवी राशि';
    else if (listingCategory === 'मकान बेचना है') priceType = 'बिक्री मूल्य';

    const finalTitle =
      title.trim() ||
      `${adPurpose} - ${config}, ${finalColony.split(' ')[0]} ${houseNumber ? `(${houseNumber})` : ''}`.trim();

    const rentNumber = typeof rent === 'number' && rent > 0 ? rent : 0;

    const propertyPayload: Omit<Property, 'id'> = {
      title: finalTitle,
      listingCategory: listingCategory,
      adPurpose: adPurpose,
      colony: finalColony,
      houseNumber: houseNumber.trim() || (isSeeker ? 'किराएदार / वांछित क्षेत्र' : listingCategory === 'दुकान' ? 'दुकान' : 'H.N. -'),
      config: config || (listingCategory === 'दुकान' ? 'दुकान (Shop)' : '2BHK'),
      floor: floor || 'ग्राउंड फ्लोर',
      rent: rentNumber,
      priceType: priceType,
      contactNumber: cleanContact,
      whatsappNumber: cleanWa,
      description:
        description.trim() ||
        `${adPurpose}: ${finalColony} (नीमच)। स्वच्छ व हवादार परिसर।`,
      imageUrl: '',
      aiDetected: false,
      aiConfidence: 1.0,
      aiTags: [
        'पब्लिक विज्ञापन',
        listingCategory,
        adPurpose,
        isSeeker ? 'किराएदार / खरीदार' : 'मालिक',
        finalColony.split(' ')[0]
      ],
      features: selectedFeatures,
      landmark: landmark.trim(),
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      setIsSubmitting(true);
      await onPostAd(propertyPayload);
      setIsSubmittedSuccess(true);
      setTimeout(() => {
        setIsSubmittedSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to post ad:', err);
      setErrorMsg(err.message || 'विज्ञापन पोस्ट करने में समस्या हुई। कृपया पुनः प्रयास करें।');
      setIsSubmitting(false);
    }
  };

  const categories: { label: string; value: ListingCategory; icon: React.ReactNode; desc: string }[] = [
    { label: 'मकान किराए हेतु', value: 'मकान किराए हेतु', icon: <Key className="w-4 h-4" />, desc: 'देना है या चाहिए' },
    { label: 'गिरवी मकान', value: 'गिरवी मकान', icon: <Shield className="w-4 h-4" />, desc: 'देना है या चाहिए' },
    { label: 'दुकान (Shop)', value: 'दुकान', icon: <Store className="w-4 h-4" />, desc: 'किराए/गिरवी' },
    { label: 'मकान बेचना है', value: 'मकान बेचना है', icon: <Tag className="w-4 h-4" />, desc: 'बेचना या खरीदना' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/70 via-slate-950 to-teal-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  अपना विज्ञापन खुद पोस्ट करें
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                  100% निःशुल्क
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>कोई log in या OTP की जरूरत नहीं, विज्ञापन लिखें और पोस्ट करें, विज्ञापन तुरंत लाइव करें!</span>
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
          {/* Submission Success Banner */}
          {isSubmittedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 text-sm flex items-center gap-3 animate-in zoom-in-95">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-base text-white">बधाई! आपका विज्ञापन पोस्ट हो गया है!</p>
                <p className="text-xs text-emerald-200 mt-0.5">
                  यह विज्ञापन नीमच क्लासिफाइड पर तुरंत लाइव हो चुका है और लोग आपसे सीधे व्हाट्सएप/फोन पर संपर्क कर सकेंगे।
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Category Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                1. प्रॉपर्टी श्रेणी (Category) चुनें: *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const isSelected = listingCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategorySelect(cat.value)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 scale-[1.02]'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={isSelected ? 'text-emerald-400' : 'text-slate-500'}>
                          {cat.icon}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-xs font-bold block">{cat.label}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Specific Ad Purpose / Role Options (Requested by User) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>2. आपकी सही आवश्यकता चुनें (आप क्या चाहते हैं?): *</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentPurposes.length} विकल्प उपलब्ध
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentPurposes.map((option, idx) => {
                  const isSelected = adPurpose === option.label;
                  const isOwner = option.role === 'owner';
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setAdPurpose(option.label)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {letter}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block leading-snug">
                          {option.label}
                        </span>
                        <span
                          className={`inline-block text-[10px] px-1.5 py-0.2 rounded mt-1 font-semibold ${
                            isOwner
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {option.badge}
                        </span>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & House Number */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  विज्ञापन शीर्षक (Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isSeeker
                      ? 'उदा. 2BHK मकान किराए से चाहिए, विकास नगर या कैंट के पास'
                      : 'उदा. 2BHK स्वतंत्र मकान किराए से देना है, लायंस पार्क के पास'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs sm:text-sm outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSeeker ? 'मकान/दुकान नं. (यदि कोई हो)' : 'मकान / दुकान नंबर'}
                </label>
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder={isSeeker ? 'वैकल्पिक (खाली छोड़ सकते हैं)' : 'उदा. H.N. 42 / Shop 15'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-amber-300 font-mono text-xs sm:text-sm outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  *मकान बुक होने पर नंबर स्वतः सुरक्षित रहेगा
                </span>
              </div>
            </div>

            {/* Colony & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSeeker ? 'वांछित कॉलोनी / क्षेत्र (Area) *' : 'कॉलोनी / क्षेत्र (Neemuch Area) *'}
                </label>
                <select
                  value={colony}
                  onChange={(e) => setColony(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs sm:text-sm outline-none"
                >
                  {NEEMUCH_COLONIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="अन्य (Other)">अन्य नीमच क्षेत्र...</option>
                </select>

                {colony === 'अन्य (Other)' && (
                  <input
                    type="text"
                    value={customColony}
                    onChange={(e) => setCustomColony(e.target.value)}
                    placeholder="कॉलोनी का नाम दर्ज करें"
                    className="w-full mt-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-emerald-500/50 text-white text-xs outline-none"
                  />
                )}
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  पहचान स्थल (Landmark)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="उदा. कमल चौक के पास, दिगंबर जैन मंदिर के सामने"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs sm:text-sm outline-none"
                />
              </div>
            </div>

            {/* Config, Floor, and Rent */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  प्रकार (Config)
                </label>
                <select
                  value={config}
                  onChange={(e) => setConfig(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs sm:text-sm outline-none"
                >
                  <option value="1R">1R (Single Room)</option>
                  <option value="1RK">1RK (Room + Kitchen)</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                  <option value="4BHK">4BHK / Villa</option>
                  <option value="दुकान (Shop)">दुकान (Shop)</option>
                  <option value="कमर्शियल स्पेस">कमर्शियल स्पेस</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  फ्लोर / मंज़िल
                </label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="उदा. ग्राउंड फ्लोर / 1st फ्लोर"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isSeeker
                    ? 'बजट (₹) (खाली छोड़ सकते हैं)'
                    : listingCategory === 'गिरवी मकान'
                    ? 'गिरवी राशि (₹)'
                    : listingCategory === 'मकान बेचना है'
                    ? 'बिक्री मूल्य (₹)'
                    : 'मासिक किराया (₹)'}
                </label>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value ? Number(e.target.value) : '')}
                  placeholder="खाली छोड़ें यदि तय नहीं है"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-emerald-400 font-bold text-xs sm:text-sm outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  *यदि खाली छोड़ेंगे तो "रेंट की जानकारी उपलब्ध नहीं है" दिखेगा
                </span>
              </div>
            </div>

            {/* Owner Contact Information */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSeeker ? 'किराएदार / आवेदक संपर्क जानकारी:' : 'मालिक / विज्ञापनदाता संपर्क जानकारी:'}</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    आपका मोबाइल नंबर *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="उदा. 98260XXXXX या 7999646575"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-white text-xs sm:text-sm outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    व्हाट्सएप नंबर (सीधी चैट हेतु)
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="मोबाइल नंबर समान होने पर खाली छोड़ें"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-white text-xs sm:text-sm outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Key Amenities & Features (Separated Narmada water & Borewell and all 17 features) */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-white">
                  3. उपलब्ध सुविधाएं व विशेषताएं (चुनें):
                </label>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {selectedFeatures.length} चुनी गईं
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {COMMON_FEATURES.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat);
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                      )}
                      <span>{feat}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800/80">
                <input
                  type="text"
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  placeholder="अन्य कोई विशेष सुविधा जोड़ें..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomFeature();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomFeature}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  + जोड़ें
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                अतिरिक्त विवरण (Description)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="मकान या दुकान के बारे में कोई विशेष बात, एग्रीमेंट शर्ते, परिवार या ऑफिस की प्राथमिकता..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs sm:text-sm outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                रद्द करें
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isSubmittedSuccess}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Megaphone className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmitting ? 'विज्ञापन पोस्ट हो रहा है...' : '🚀 विज्ञापन अभी पोस्ट करें (तुरंत लाइव)'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
