import React, { useState, useEffect, useMemo } from 'react';
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
  Clipboard,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Layers,
  FileText,
  Share2,
  Camera,
  Edit3,
  Plus,
  IndianRupee,
  Hash
} from 'lucide-react';
import {
  Property,
  PropertyConfig,
  ListingCategory,
  PROPERTY_CONFIG_OPTIONS,
  FLOOR_OPTIONS
} from '../types/property';
import { NEEMUCH_COLONIES } from '../data/seedProperties';
import { parsePastedAdText, SAMPLE_USER_AD, ParsedAdResult } from '../utils/adTextParser';
import { HousePhotosUploader } from './HousePhotosUploader';

interface PostUserAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostAd: (propertyData: Omit<Property, 'id'>) => Promise<void>;
  initialAdText?: string;
}

// Sub-options per category
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
      label: 'मकान बेचना है (विक्रेता)',
      role: 'owner',
      badge: 'विक्रेता (Seller)'
    },
    {
      label: 'प्लॉट / फ्लैट बेचना है (विक्रेता)',
      role: 'owner',
      badge: 'विक्रेता (Seller)'
    }
  ],
  'मकान खरीदना है': [
    {
      label: 'मकान खरीदना है (खरीदार)',
      role: 'seeker',
      badge: 'खरीदार (Buyer)'
    },
    {
      label: 'प्लॉट / फ्लैट खरीदना है (खरीदार)',
      role: 'seeker',
      badge: 'खरीदार (Buyer)'
    }
  ]
};

// 17 Amenities requested by user
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
  onPostAd,
  initialAdText
}) => {
  // Tab Mode: 'quick_paste' (Default - No Form!) or 'detailed_form'
  const [activeTab, setActiveTab] = useState<'quick_paste' | 'detailed_form'>('quick_paste');

  // Quick Paste States (All auto-detected fields are editable before final submit)
  const [pastedText, setPastedText] = useState('');
  const [qpCategory, setQpCategory] = useState<ListingCategory>('मकान किराए हेतु');
  const [qpAdPurpose, setQpAdPurpose] = useState<string>('मकान किराए से देना है (मकान मालिक)');
  const [qpConfig, setQpConfig] = useState<string>('विवरण अनुसार');
  const [qpCustomConfig, setQpCustomConfig] = useState<string>('');
  const [qpFloor, setQpFloor] = useState<string>('');
  const [qpColony, setQpColony] = useState<string>('');
  const [qpLandmark, setQpLandmark] = useState<string>('');
  const [qpPhone, setQpPhone] = useState<string>('');
  const [qpRent, setQpRent] = useState<string>('');
  const [qpPriceDisplay, setQpPriceDisplay] = useState<string>('');
  const [qpPriceType, setQpPriceType] = useState<string>('प्रति माह');
  const [qpHouseNumber, setQpHouseNumber] = useState<string>('');
  const [qpFeatures, setQpFeatures] = useState<string[]>([]);
  const [qpNewFeatureInput, setQpNewFeatureInput] = useState<string>('');
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});

  // Sync initialAdText when provided
  useEffect(() => {
    if (isOpen && initialAdText) {
      setDirtyFields({});
      setPastedText(initialAdText);
      setActiveTab('quick_paste');
    }
  }, [isOpen, initialAdText]);

  // Detailed Form States
  const [listingCategory, setListingCategory] = useState<ListingCategory>('मकान किराए हेतु');
  const [adPurpose, setAdPurpose] = useState<string>('मकान किराए से देना है (मकान मालिक)');
  const [title, setTitle] = useState('');
  const [colony, setColony] = useState(NEEMUCH_COLONIES[0]);
  const [customColony, setCustomColony] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [config, setConfig] = useState<PropertyConfig | string>('2BHK');
  const [customDetailConfig, setCustomDetailConfig] = useState('');
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
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [lastPostedTitle, setLastPostedTitle] = useState('');

  // Real-time parsed output for quick paste tab
  const parsedAd: ParsedAdResult = useMemo(() => {
    return parsePastedAdText(pastedText);
  }, [pastedText]);

  const allQuickSelectConfigs = useMemo(
    () => [...PROPERTY_CONFIG_OPTIONS, 'पूरा मकान सेपरेट'] as string[],
    []
  );

  // Sync unedited fields from live AI/text auto-detection
  useEffect(() => {
    if (!dirtyFields.category) {
      setQpCategory(parsedAd.category);
    }
    if (!dirtyFields.adPurpose) {
      setQpAdPurpose(parsedAd.adPurpose);
    }
    if (!dirtyFields.config) {
      if (allQuickSelectConfigs.includes(parsedAd.config)) {
        setQpConfig(parsedAd.config);
        setQpCustomConfig('');
      } else {
        setQpConfig('__custom__');
        setQpCustomConfig(parsedAd.config);
      }
    }
    if (!dirtyFields.floor) {
      setQpFloor(parsedAd.floor);
    }
    if (!dirtyFields.colony) {
      setQpColony(parsedAd.colony);
    }
    if (!dirtyFields.landmark) {
      setQpLandmark(parsedAd.landmark);
    }
    if (!dirtyFields.phone) {
      setQpPhone(parsedAd.contactNumber ? parsedAd.contactNumber.replace('+91-', '') : '');
    }
    if (!dirtyFields.rent) {
      setQpRent(parsedAd.rent > 0 ? String(parsedAd.rent) : '');
    }
    if (!dirtyFields.priceDisplay) {
      setQpPriceDisplay(parsedAd.priceDisplay || '');
    }
    if (!dirtyFields.priceType) {
      setQpPriceType(parsedAd.priceType || 'प्रति माह');
    }
    if (!dirtyFields.houseNumber) {
      setQpHouseNumber(parsedAd.houseNumber || '');
    }
    if (!dirtyFields.features) {
      setQpFeatures(parsedAd.features);
    }
  }, [parsedAd, dirtyFields, allQuickSelectConfigs]);

  if (!isOpen) return null;

  const markDirty = (field: string) => {
    setDirtyFields((prev) => ({ ...prev, [field]: true }));
  };

  // Re-detect all fields from pasted text (resets manual overrides)
  const handleRedetectFromText = () => {
    setDirtyFields({});
  };

  // Handle Loading Demo Template
  const handleLoadSample = () => {
    setDirtyFields({});
    setPastedText(SAMPLE_USER_AD);
    setErrorMsg('');
  };

  // Handle Clipboard Paste
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setDirtyFields({});
          setPastedText(text);
          setErrorMsg('');
        }
      }
    } catch (err) {
      console.warn('Clipboard read failed or permission denied:', err);
    }
  };

  // Quick Paste Submit Handler (uses user-edited box values!)
  const handleQuickPasteSubmit = async () => {
    setErrorMsg('');

    const raw = pastedText.trim();
    if (!raw) {
      setErrorMsg('कृपया अपने व्हाट्सएप या नोटबुक से विज्ञापन यहाँ पेस्ट करें, या "डेमो विज्ञापन भरें" बटन दबाएं।');
      return;
    }

    const finalPhone = (qpPhone.trim() || parsedAd.contactNumber || '').replace(/[^0-9]/g, '');
    if (!finalPhone || finalPhone.length < 10) {
      setErrorMsg('कृपया अपना 10 अंकों का संपर्क मोबाइल नंबर दर्ज करें ताकि लोग आपसे बात कर सकें।');
      return;
    }

    const cleanContact = `+91-${finalPhone.slice(-10)}`;
    const cleanWa = `91${finalPhone.slice(-10)}`;
    const finalColony = qpColony.trim() || parsedAd.colony || 'नीमच शहर (Neemuch City)';
    const resolvedConfig = (qpConfig === '__custom__' ? qpCustomConfig.trim() : qpConfig.trim()) || 'विवरण अनुसार';
    const finalConfig = resolvedConfig.slice(0, 28);
    const finalFloor = qpFloor.trim();
    const finalLandmark = qpLandmark.trim();

    const activePurposes = AD_PURPOSE_OPTIONS[qpCategory] || [];
    const matchedPurposeObj = activePurposes.find((p) => p.label === qpAdPurpose);
    const isFinalSeeker =
      qpCategory === 'मकान खरीदना है' ||
      (matchedPurposeObj ? matchedPurposeObj.role === 'seeker' : parsedAd.isSeeker);

    const finalHouseNumber =
      qpHouseNumber.trim() ||
      (qpCategory === 'मकान खरीदना है'
        ? 'खरीदार (वांछित)'
        : isFinalSeeker
        ? 'किराएदार (वांछित)'
        : qpCategory === 'दुकान'
        ? 'दुकान'
        : 'H.N. -');

    const numericRent = Number(qpRent);
    const finalRent = !Number.isNaN(numericRent) && numericRent > 0 ? numericRent : 0;
    const rawPriceDisplay = qpPriceDisplay.trim();
    const finalPriceDisplay = rawPriceDisplay
      ? (/^[₹0-9]/.test(rawPriceDisplay) ? (rawPriceDisplay.startsWith('₹') ? rawPriceDisplay : `₹${rawPriceDisplay}`) : rawPriceDisplay)
      : '';

    let finalPriceType = qpPriceType.trim() || 'प्रति माह';
    if (!qpPriceType.trim()) {
      if (qpCategory === 'मकान खरीदना है') finalPriceType = 'बजट';
      else if (qpCategory === 'गिरवी मकान') finalPriceType = 'गिरवी राशि';
      else if (qpCategory === 'मकान बेचना है') finalPriceType = 'बिक्री मूल्य';
    }

    const shortArea = finalColony.split('(')[0].trim() || finalColony;
    const configInTitle = finalConfig && finalConfig !== 'विवरण अनुसार' ? ` ${finalConfig}` : '';
    const generatedTitle = `[${qpAdPurpose.split('(')[0].trim()}]${configInTitle} - ${shortArea}`.slice(0, 140);

    const propertyPayload: Omit<Property, 'id'> = {
      title: generatedTitle,
      listingCategory: qpCategory,
      adPurpose: qpAdPurpose,
      colony: finalColony,
      houseNumber: finalHouseNumber,
      config: finalConfig,
      floor: finalFloor,
      rent: finalRent,
      priceDisplay: finalPriceDisplay,
      priceType: finalPriceType,
      contactNumber: cleanContact,
      whatsappNumber: cleanWa,
      description: raw, // Full verbatim original text as typed by user
      imageUrl: '',
      photos: uploadedPhotos,
      aiDetected: false,
      aiConfidence: 1.0,
      aiTags: [
        'पब्लिक विज्ञापन',
        'क्विक पेस्ट',
        qpCategory,
        qpAdPurpose,
        isFinalSeeker ? 'किराएदार / खरीदार' : 'मालिक',
        shortArea.split(' ')[0]
      ],
      features: qpFeatures.length > 0 ? qpFeatures : ['बिजली-पानी व्यवस्था'],
      landmark: finalLandmark,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      setIsSubmitting(true);
      await onPostAd(propertyPayload);
      setLastPostedTitle(propertyPayload.title);
      setIsSubmittedSuccess(true);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Failed to post pasted ad:', err);
      setErrorMsg(err.message || 'विज्ञापन पोस्ट करने में समस्या हुई। कृपया पुनः प्रयास करें।');
      setIsSubmitting(false);
    }
  };

  // Detailed Form Handlers
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
      setConfig('विवरण अनुसार');
      setFloor('स्वतंत्र मकान');
    } else if (cat === 'मकान खरीदना है') {
      setConfig('विवरण अनुसार');
      setFloor('');
    } else {
      setConfig('विवरण अनुसार');
      setFloor('');
    }
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleDetailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalColony = colony === 'अन्य (Other)' ? customColony.trim() : colony;
    if (!finalColony) {
      setErrorMsg('कृपया कॉलोनी का नाम चुनें या दर्ज करें।');
      return;
    }

    if (!contactNumber.trim()) {
      setErrorMsg('कृपया संपर्क नंबर (मोबाइल नंबर) दर्ज करें।');
      return;
    }

    const cleanContact = contactNumber.trim();
    const cleanWaRaw = (whatsappNumber.trim() || cleanContact).replace(/[^0-9]/g, '');
    const cleanWa = cleanWaRaw.length === 10 ? `91${cleanWaRaw}` : cleanWaRaw;

    let priceType = 'प्रति माह';
    if (listingCategory === 'मकान खरीदना है') priceType = 'बजट';
    else if (listingCategory === 'गिरवी मकान') priceType = 'गिरवी राशि';
    else if (listingCategory === 'मकान बेचना है') priceType = 'बिक्री मूल्य';

    const resolvedDetailConfig = (
      config === '__custom__'
        ? customDetailConfig.trim()
        : config
    ) || (listingCategory === 'दुकान' ? 'दुकान ग्राउंड फ्लोर' : 'विवरण अनुसार');

    const configPart = resolvedDetailConfig !== 'विवरण अनुसार' ? ` ${resolvedDetailConfig}` : '';
    const finalTitle =
      title.trim() ||
      `[${adPurpose.split('(')[0].trim()}]${configPart} - ${finalColony.split(' ')[0]} ${houseNumber ? `(${houseNumber})` : ''}`.trim();

    const rentNumber = typeof rent === 'number' && rent > 0 ? rent : 0;

    const propertyPayload: Omit<Property, 'id'> = {
      title: finalTitle.slice(0, 140),
      listingCategory: listingCategory,
      adPurpose: adPurpose,
      colony: finalColony,
      houseNumber:
        houseNumber.trim() ||
        (listingCategory === 'मकान खरीदना है'
          ? 'खरीदार (वांछित)'
          : isSeeker
          ? 'किराएदार / वांछित क्षेत्र'
          : listingCategory === 'दुकान'
          ? 'दुकान'
          : 'H.N. -'),
      config: resolvedDetailConfig.slice(0, 28),
      floor: floor.trim(),
      rent: rentNumber,
      priceType: priceType,
      contactNumber: cleanContact,
      whatsappNumber: cleanWa,
      description:
        description.trim() ||
        `${adPurpose}: ${finalColony} (नीमच)।`,
      imageUrl: '',
      photos: uploadedPhotos,
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
      setLastPostedTitle(propertyPayload.title);
      setIsSubmittedSuccess(true);
      setIsSubmitting(false);
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
    { label: 'मकान बेचना है', value: 'मकान बेचना है', icon: <Tag className="w-4 h-4" />, desc: 'विक्रेता' },
    { label: 'मकान खरीदना है', value: 'मकान खरीदना है', icon: <Tag className="w-4 h-4" />, desc: 'खरीदार' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/80 via-slate-950 to-teal-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  अपना विज्ञापन खुद पोस्ट करें
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                  100% फ्री
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-300 font-medium mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>कोई log in या OTP की जरूरत नहीं, विज्ञापन तुरंत लाइव करें!</span>
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

        {/* Tab Selection: Quick Paste vs Detailed Form */}
        <div className="bg-slate-950/90 px-5 pt-3 border-b border-slate-800/80 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('quick_paste')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t border-x cursor-pointer ${
              activeTab === 'quick_paste'
                ? 'bg-slate-900 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/5'
                : 'bg-slate-950/40 text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-4 h-4 text-amber-400" />
            <span>📋 कॉपी-पेस्ट विज्ञापन (नो फॉर्म)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
              फास्ट
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('detailed_form')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-t border-x cursor-pointer ${
              activeTab === 'detailed_form'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                : 'bg-slate-950/40 text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>✍️ स्टेप-बाय-स्टेप फॉर्म</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {isSubmittedSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  बधाई! आपका विज्ञापन तुरंत लाइव हो चुका है! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  {lastPostedTitle || 'आपका विज्ञापन अब नीमच क्लासिफाइड पर सभी को दिखाई दे रहा है।'}
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  होमपेज पर विज्ञापन देखें ✓
                </button>
              </div>
            </div>
          ) : activeTab === 'quick_paste' ? (
            /* TAB 1: QUICK PASTE (NO FORM!) */
            <div className="space-y-4">
              {/* Instructions banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/40 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-1.5">
                    <span>💡 सिर्फ कॉपी करके यहाँ पेस्ट करें — कोई फॉर्म नहीं भरना है!</span>
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    10 सेकंड में लाइव
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  आप अपने मोबाइल के नोट बुक या व्हाट्सएप पर जो विज्ञापन लिखकर रखते हैं, उसे बस नीचे दिए गए बॉक्स में पेस्ट कर दें।
                </p>
              </div>

              {/* Textarea Toolbar: Demo Sample / Paste / Clear */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>अपना विज्ञापन यहाँ पेस्ट करें (Ad Text Box):</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                    title="डेमो विज्ञापन टेक्स्ट लोड करें"
                  >
                    <span>📋 डेमो विज्ञापन भरें</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold transition-all cursor-pointer hover:scale-[1.02]"
                    title="क्लिपबोर्ड से पेस्ट करें"
                  >
                    <Clipboard className="w-3 h-3 text-cyan-400" />
                    <span>पेस्ट करें</span>
                  </button>

                  {pastedText && (
                    <button
                      type="button"
                      onClick={() => {
                        setDirtyFields({});
                        setPastedText('');
                        setErrorMsg('');
                      }}
                      className="px-2 py-1 rounded-lg text-slate-400 hover:text-rose-300 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      साफ़ करें
                    </button>
                  )}
                </div>
              </div>

              {/* Main Paste Textarea with clear demo placeholder */}
              <div className="relative">
                <textarea
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  rows={8}
                  placeholder={`यहाँ अपना विज्ञापन पेस्ट करें... जैसे:\n\nनीमच म. प्र.\nमकान किराए से देना है \nएक हॉल अटैच किचन लेट्रिन-बाथ फर्नीचर सहित \nलोकेशन :- भगवानपुरा चौराहा,\nसम्पर्क :- 99260XXXXX`}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-slate-500 text-xs sm:text-sm leading-relaxed outline-none transition-all resize-y shadow-inner font-sans"
                />
              </div>

              {/* Real-Time Live Extraction Card - ALL BOXES DIRECTLY EDITABLE */}
              {pastedText.trim().length > 5 && (
                <div className="p-4 rounded-2xl bg-slate-950/95 border border-emerald-500/40 space-y-3.5 animate-in fade-in duration-200 shadow-lg">
                  <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800 pb-2.5">
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                        <span>विज्ञापन स्वतः विश्लेषण (Live Auto-Detection — जांचें व एडिट करें):</span>
                      </span>
                      <p className="text-[11px] text-amber-300/90 mt-0.5 flex items-center gap-1">
                        <Edit3 className="w-3 h-3 shrink-0" />
                        <span>अगर AI द्वारा कोई जानकारी गलत भरी गई हो, तो नीचे किसी भी बॉक्स में सीधे बदलकर ही सबमिट करें।</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRedetectFromText}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                      title="टेक्स्ट से सभी बॉक्स पुनः स्वतः भरें"
                    >
                      <RotateCcw className="w-3 h-3 text-emerald-400" />
                      <span>पुनः ऑटो-भरें</span>
                    </button>
                  </div>

                  {/* Editable Boxes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Box 1: विज्ञापन प्रकार (Category & Ad Purpose - Editable) */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>विज्ञापन श्रेणी व प्रकार:</span>
                        </label>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          एडिट योग्य
                        </span>
                      </div>
                      <select
                        value={qpCategory}
                        onChange={(e) => {
                          const newCat = e.target.value as ListingCategory;
                          setQpCategory(newCat);
                          markDirty('category');
                          const opts = AD_PURPOSE_OPTIONS[newCat] || [];
                          if (opts.length > 0) {
                            setQpAdPurpose(opts[0].label);
                            markDirty('adPurpose');
                          }
                          if (newCat === 'मकान खरीदना है') {
                            setQpPriceType('बजट');
                            markDirty('priceType');
                          } else if (newCat === 'मकान बेचना है') {
                            setQpPriceType('बिक्री मूल्य');
                            markDirty('priceType');
                          } else if (newCat === 'गिरवी मकान') {
                            setQpPriceType('गिरवी राशि');
                            markDirty('priceType');
                          } else {
                            setQpPriceType('प्रति माह');
                            markDirty('priceType');
                          }
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 text-amber-300 font-bold text-xs outline-none"
                      >
                        <option value="मकान किराए हेतु">मकान किराए हेतु</option>
                        <option value="गिरवी मकान">गिरवी मकान</option>
                        <option value="दुकान">दुकान (Shop / गोडाउन / ऑफिस)</option>
                        <option value="मकान बेचना है">मकान बेचना है (विक्रेता)</option>
                        <option value="मकान खरीदना है">मकान खरीदना है (खरीदार)</option>
                      </select>

                      <select
                        value={qpAdPurpose}
                        onChange={(e) => {
                          setQpAdPurpose(e.target.value);
                          markDirty('adPurpose');
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 text-cyan-300 font-semibold text-xs outline-none"
                      >
                        {(AD_PURPOSE_OPTIONS[qpCategory] || []).map((opt) => (
                          <option key={opt.label} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Box 2: कमरे / कॉन्फ़िगरेशन व फ्लोर (Config & Floor - Editable) */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-emerald-400" />
                          <span>कमरे / कॉन्फ़िगरेशन व फ्लोर:</span>
                        </label>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          एडिट योग्य
                        </span>
                      </div>

                      <select
                        value={qpConfig}
                        onChange={(e) => {
                          setQpConfig(e.target.value);
                          markDirty('config');
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white font-bold text-xs outline-none"
                      >
                        {PROPERTY_CONFIG_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        <option value="पूरा मकान सेपरेट">पूरा मकान सेपरेट</option>
                        <option value="__custom__">अन्य (खुद टाइप करें)...</option>
                      </select>

                      {qpConfig === '__custom__' && (
                        <input
                          type="text"
                          maxLength={28}
                          value={qpCustomConfig}
                          onChange={(e) => {
                            setQpCustomConfig(e.target.value);
                            markDirty('config');
                          }}
                          placeholder="जैसे: एक हॉल अटैच किचन"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-amber-500/50 text-white text-xs outline-none"
                        />
                      )}

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 shrink-0">फ्लोर:</span>
                        <input
                          type="text"
                          list="qp-floor-options"
                          value={qpFloor}
                          onChange={(e) => {
                            setQpFloor(e.target.value);
                            markDirty('floor');
                          }}
                          placeholder="उदा: ग्राउंड फ्लोर, 1st फ्लोर"
                          className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-400 text-slate-200 text-xs outline-none"
                        />
                        <datalist id="qp-floor-options">
                          {FLOOR_OPTIONS.map((f) => (
                            <option key={f} value={f} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Box 3: लोकेशन / कॉलोनी व लैंडमार्क (Location & Landmark - Editable) */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>लोकेशन / कॉलोनी व पहचान:</span>
                        </label>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          एडिट योग्य
                        </span>
                      </div>

                      <input
                        type="text"
                        list="qp-colony-options"
                        value={qpColony}
                        onChange={(e) => {
                          setQpColony(e.target.value);
                          markDirty('colony');
                        }}
                        placeholder="कॉलोनी / क्षेत्र लिखें या चुनें"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 text-rose-200 font-semibold text-xs outline-none"
                      />
                      <datalist id="qp-colony-options">
                        {NEEMUCH_COLONIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>

                      <input
                        type="text"
                        value={qpLandmark}
                        onChange={(e) => {
                          setQpLandmark(e.target.value);
                          markDirty('landmark');
                        }}
                        placeholder="आस-पास / पता (उदा: ट्रीनिटी हॉस्टल के पीछे)"
                        className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 text-slate-300 text-xs outline-none"
                      />
                    </div>

                    {/* Box 4: संपर्क नंबर, किराया/बजट रेंज, प्रकार व मकान/दुकान नं. (Editable) */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>मोबाइल नंबर, बजट/कीमत व नं.:</span>
                        </label>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          एडिट योग्य
                        </span>
                      </div>

                      <input
                        type="tel"
                        maxLength={10}
                        value={qpPhone}
                        onChange={(e) => {
                          setQpPhone(e.target.value.replace(/[^0-9]/g, ''));
                          markDirty('phone');
                        }}
                        placeholder="10 अंकों का मोबाइल नंबर *"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 focus:border-emerald-400 text-emerald-400 font-black font-mono text-xs outline-none"
                      />

                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="relative">
                          <IndianRupee className="w-3 h-3 text-amber-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={qpPriceDisplay || qpRent}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^\d+$/.test(val.trim())) {
                                setQpRent(val.trim());
                                setQpPriceDisplay('');
                              } else {
                                setQpPriceDisplay(val);
                              }
                              markDirty('priceDisplay');
                              markDirty('rent');
                            }}
                            placeholder="बजट/किराया (उदा: 28-30 लाख)"
                            className="w-full pl-6 pr-2 py-1 rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 text-slate-200 text-xs outline-none"
                          />
                        </div>

                        <select
                          value={qpPriceType}
                          onChange={(e) => {
                            setQpPriceType(e.target.value);
                            markDirty('priceType');
                          }}
                          className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 text-amber-300 text-xs outline-none"
                        >
                          <option value="प्रति माह">प्रति माह</option>
                          <option value="बजट">बजट (Budget)</option>
                          <option value="किराया बजट">किराया बजट</option>
                          <option value="बिक्री मूल्य">बिक्री मूल्य (डिमांड)</option>
                          <option value="गिरवी राशि">गिरवी राशि</option>
                          <option value="गिरवी बजट">गिरवी बजट</option>
                        </select>
                      </div>

                      <div className="relative">
                        <Hash className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={qpHouseNumber}
                          onChange={(e) => {
                            setQpHouseNumber(e.target.value);
                            markDirty('houseNumber');
                          }}
                          placeholder="मकान/दुकान नं. या पहचान"
                          className="w-full pl-6 pr-2 py-1 rounded-lg bg-slate-950 border border-slate-700 focus:border-amber-400 text-slate-200 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Box 5: पहचानी गई / चयनित सुविधाएं (Editable Amenities Tags) */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                        <Edit3 className="w-3 h-3 text-cyan-400" />
                        <span>सुविधाएं (पहचानी गई / एडिट करें — {qpFeatures.length}):</span>
                      </span>
                      <span className="text-[10px] text-slate-400">हटाने के लिए × दबाएं या नई जोड़ें</span>
                    </div>

                    {qpFeatures.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {qpFeatures.map((feat, idx) => (
                          <span
                            key={`${feat}-${idx}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium"
                          >
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setQpFeatures(qpFeatures.filter((_, i) => i !== idx));
                                markDirty('features');
                              }}
                              className="ml-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                              title="सुविधा हटाएं"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <select
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !qpFeatures.includes(val)) {
                            setQpFeatures([...qpFeatures, val]);
                            markDirty('features');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 text-[11px] outline-none"
                      >
                        <option value="">+ सूची से सुविधा जोड़ें...</option>
                        {COMMON_FEATURES.filter((f) => !qpFeatures.includes(f)).map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 flex-1 min-w-[160px]">
                        <input
                          type="text"
                          value={qpNewFeatureInput}
                          onChange={(e) => setQpNewFeatureInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = qpNewFeatureInput.trim();
                              if (val && !qpFeatures.includes(val)) {
                                setQpFeatures([...qpFeatures, val]);
                                setQpNewFeatureInput('');
                                markDirty('features');
                              }
                            }
                          }}
                          placeholder="कोई अन्य सुविधा लिखें..."
                          className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = qpNewFeatureInput.trim();
                            if (val && !qpFeatures.includes(val)) {
                              setQpFeatures([...qpFeatures, val]);
                              setQpNewFeatureInput('');
                              markDirty('features');
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold inline-flex items-center gap-0.5 cursor-pointer shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                          <span>जोड़ें</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Optional House Photos Uploader with Right-Checkmark Toggle */}
              <HousePhotosUploader
                photos={uploadedPhotos}
                onChange={setUploadedPhotos}
                maxPhotos={10}
                initiallyOpen={false}
              />

              {/* Submit Button for Quick Paste */}
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] text-slate-400">
                  * सबमिट होते ही विज्ञापन सभी यूज़र्स के लिए तुरंत लाइव हो जाएगा।
                </span>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleQuickPasteSubmit}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 border border-amber-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>विज्ञापन लाइव हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 विज्ञापन तुरंत लाइव करें (1-क्लिक सबमिट)</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: DETAILED STEP-BY-STEP FORM */
            <form onSubmit={handleDetailedSubmit} className="space-y-4">
              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  विज्ञापन श्रेणी चुनें (Select Category):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategorySelect(cat.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        listingCategory === cat.value
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        {cat.icon}
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{cat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Option Purpose & Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  आपकी आवश्यकता (आप मकान मालिक हैं या किराएदार/खरीदार):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentPurposes.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAdPurpose(p.label)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        adPurpose === p.label
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200 font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs">{p.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-medium">
                        {p.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  शीर्षक (Title):
                </label>
                <input
                  type="text"
                  maxLength={140}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`उदा: [${adPurpose.split('(')[0].trim()}] 2BHK स्वतंत्र मकान, शिक्षक कालोनी`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-xs outline-none"
                />
              </div>

              {/* Colony & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">कॉलोनी / क्षेत्र:</label>
                  <select
                    value={colony}
                    onChange={(e) => setColony(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                  >
                    {NEEMUCH_COLONIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="अन्य (Other)">अन्य (Other)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">पहचान / लैंडमार्क (Landmark):</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="उदा: LIC चौराहे के पास, मंदिर निकट"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* Config & Floor & Rent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">कमरे / कॉन्फ़िगरेशन:</label>
                  <select
                    value={allQuickSelectConfigs.includes(String(config)) ? String(config) : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomDetailConfig(String(config));
                        setConfig('__custom__');
                      } else {
                        setConfig(e.target.value);
                        setCustomDetailConfig('');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                  >
                    {PROPERTY_CONFIG_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="पूरा मकान सेपरेट">पूरा मकान सेपरेट</option>
                    <option value="__custom__">अन्य (खुद लिखें)...</option>
                  </select>
                  {config === '__custom__' && (
                    <input
                      type="text"
                      maxLength={28}
                      value={customDetailConfig}
                      onChange={(e) => setCustomDetailConfig(e.target.value)}
                      placeholder="उदा: एक हॉल अटैच किचन"
                      className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-white text-xs outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    किराया / बजट (₹) (वैकल्पिक):
                  </label>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="उदा: 6000 (छोड़ने पर बातचीत अनुसार)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  संपर्क मोबाइल नंबर (Contact Number) *:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="उदा: 1234567890 या 98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-xs outline-none font-mono"
                  />
                </div>
              </div>

              {/* Amenities Selection (17 separated options) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  उपलब्ध / वांछित सुविधाएं ({selectedFeatures.length} चयनित):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {COMMON_FEATURES.map((feat) => {
                    const isSelected = selectedFeatures.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-medium transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                            isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{feat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  अन्य विवरण (Description):
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="मकान/दुकान की अन्य कोई विशेष जानकारी लिखें..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none resize-none"
                />
              </div>

              {/* Optional House Photos Uploader with Right-Checkmark Toggle */}
              <HousePhotosUploader
                photos={uploadedPhotos}
                onChange={setUploadedPhotos}
                maxPhotos={10}
                initiallyOpen={false}
              />

              {/* Detailed Form Submit */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'पोस्ट हो रहा है...' : '✓ विज्ञापन सबमिट करें'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
