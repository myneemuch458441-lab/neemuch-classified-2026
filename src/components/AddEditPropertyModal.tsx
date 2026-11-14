import React, { useState, useEffect } from 'react';
import {
  X,
  Home,
  Phone,
  MapPin,
  IndianRupee,
  Layers,
  Sparkles,
  Trash2,
  Check,
  Store,
  Shield,
  Tag,
  Key,
  Camera
} from 'lucide-react';
import { Property, PropertyConfig, ListingCategory, PROPERTY_CONFIG_OPTIONS } from '../types/property';
import { NEEMUCH_COLONIES } from '../data/seedProperties';
import { HousePhotosUploader } from './HousePhotosUploader';

interface AddEditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyData: Omit<Property, 'id'>, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialProperty?: Property | null;
}

export const AddEditPropertyModal: React.FC<AddEditPropertyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialProperty,
}) => {
  const isEditMode = Boolean(initialProperty);

  const [listingCategory, setListingCategory] = useState<ListingCategory>('मकान किराए हेतु');
  const [title, setTitle] = useState('');
  const [colony, setColony] = useState(NEEMUCH_COLONIES[0]);
  const [customColony, setCustomColony] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [config, setConfig] = useState<PropertyConfig | string>('विवरण अनुसार');
  const [floor, setFloor] = useState('');
  const [rent, setRent] = useState<number | ''>('');
  const [priceDisplay, setPriceDisplay] = useState('');
  const [priceType, setPriceType] = useState('प्रति माह');
  const [contactNumber, setContactNumber] = useState('+91-7999646575');
  const [whatsappNumber, setWhatsappNumber] = useState('917999646575');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [landmark, setLandmark] = useState('');
  const [available, setAvailable] = useState(true);
  const [isAiDetected, setIsAiDetected] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (initialProperty) {
      setListingCategory(initialProperty.listingCategory || 'मकान किराए हेतु');
      setTitle(initialProperty.title || '');
      if (NEEMUCH_COLONIES.includes(initialProperty.colony)) {
        setColony(initialProperty.colony);
        setCustomColony('');
      } else {
        setColony('अन्य (Other)');
        setCustomColony(initialProperty.colony || '');
      }
      setHouseNumber(initialProperty.houseNumber || '');
      setConfig(initialProperty.config || 'विवरण अनुसार');
      setFloor(initialProperty.floor || '');
      setRent(initialProperty.rent && initialProperty.rent > 0 ? initialProperty.rent : '');
      setPriceDisplay(initialProperty.priceDisplay || '');
      setPriceType(initialProperty.priceType || 'प्रति माह');
      setContactNumber(initialProperty.contactNumber || '+91-7999646575');
      setWhatsappNumber(initialProperty.whatsappNumber || '917999646575');
      setDescription(initialProperty.description || '');
      setImageUrl('');
      setFeaturesInput(initialProperty.features ? initialProperty.features.join(', ') : '');
      setLandmark(initialProperty.landmark || '');
      setAvailable(initialProperty.available !== false);
      setIsAiDetected(Boolean(initialProperty.aiDetected));
      setPhotos(initialProperty.photos || []);
    } else {
      // Default new form - rent is empty by default unless user knows it
      setListingCategory('मकान किराए हेतु');
      setTitle('');
      setColony(NEEMUCH_COLONIES[0]);
      setCustomColony('');
      setHouseNumber('');
      setConfig('विवरण अनुसार');
      setFloor('');
      setRent('');
      setPriceDisplay('');
      setPriceType('प्रति माह');
      setContactNumber('+91-7999646575');
      setWhatsappNumber('917999646575');
      setDescription('नीमच में सुविधाजनक स्थान, पानी-बिजली की उत्तम व्यवस्था, शांतिपूर्ण इलाका।');
      setImageUrl('');
      setFeaturesInput('कार/बाइक पार्किंग, 24 घंटे पानी, अलग मीटर, बालकनी');
      setLandmark('');
      setAvailable(true);
      setIsAiDetected(false);
      setPhotos([]);
    }
    setShowDeletePrompt(false);
    setDeletePassword('');
    setErrorMsg('');
  }, [initialProperty, isOpen]);

  if (!isOpen) return null;

  // Change defaults when category changes - DO NOT fabricate fake rent
  const handleCategoryChange = (newCat: ListingCategory) => {
    setListingCategory(newCat);
    if (newCat === 'गिरवी मकान') {
      setPriceType('गिरवी राशि');
      setConfig('विवरण अनुसार');
      setFloor('स्वतंत्र मकान (2 वर्ष लीज)');
    } else if (newCat === 'दुकान') {
      setPriceType('प्रति माह');
      setConfig('दुकान (Shop)');
      setFloor('ग्राउंड फ्लोर शटर');
    } else if (newCat === 'मकान बेचना है') {
      setPriceType('बिक्री मूल्य');
      setConfig('विवरण अनुसार');
      setFloor('स्वतंत्र मकान');
    } else if (newCat === 'मकान खरीदना है') {
      setPriceType('बजट');
      setConfig('विवरण अनुसार');
      setFloor('');
    } else {
      setPriceType('प्रति माह');
      setConfig('विवरण अनुसार');
      setFloor('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalColony = colony === 'अन्य (Other)' ? customColony.trim() : colony;
    if (!finalColony) {
      setErrorMsg('कृपया कॉलोनी का नाम दर्ज करें।');
      return;
    }

    if (!contactNumber.trim()) {
      setErrorMsg('कृपया संपर्क नंबर दर्ज करें।');
      return;
    }

    // Auto-generate title if empty
    const finalTitle =
      title.trim() ||
      `${listingCategory} - ${config}, ${finalColony.split(' ')[0]} (${houseNumber || 'नीमच'})`;

    const featuresList = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const cleanWa = whatsappNumber.replace(/[^0-9]/g, '') || contactNumber.replace(/[^0-9]/g, '');

    const propertyPayload: Omit<Property, 'id'> = {
      title: finalTitle,
      listingCategory: listingCategory,
      adPurpose:
        listingCategory === 'मकान खरीदना है'
          ? 'मकान खरीदना है (खरीदार)'
          : initialProperty?.adPurpose || '',
      colony: finalColony,
      houseNumber: houseNumber.trim() || (listingCategory === 'दुकान' ? 'दुकान' : 'H.N. -'),
      config: config || (listingCategory === 'दुकान' ? 'दुकान (Shop)' : 'विवरण अनुसार'),
      floor: floor.trim(),
      rent: typeof rent === 'number' && rent > 0 ? rent : 0,
      priceDisplay: priceDisplay.trim(),
      priceType: priceType,
      contactNumber: contactNumber.trim(),
      whatsappNumber: cleanWa.length === 10 ? `91${cleanWa}` : cleanWa,
      description: description.trim(),
      imageUrl: '', // Always empty - no photos on screen
      photos,
      aiDetected: isAiDetected,
      aiConfidence: isAiDetected ? 0.95 : undefined,
      aiTags: isAiDetected ? [config, listingCategory, finalColony.split(' ')[0], 'AI सत्यापित'] : [listingCategory],
      features: featuresList,
      landmark: landmark.trim(),
      available,
      createdAt: initialProperty?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      setIsSubmitting(true);
      await onSave(propertyPayload, initialProperty?.id);
      onClose();
    } catch (err: any) {
      console.error('Failed to save property:', err);
      setErrorMsg(err.message || 'प्रॉपर्टी सेव करने में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialProperty?.id || !onDelete) return;
    if (deletePassword.trim() !== '3252') {
      setErrorMsg('अमान्य एडमिन पिन! कृपया सही पिन दर्ज करें।');
      return;
    }
    try {
      setIsSubmitting(true);
      await onDelete(initialProperty.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'डिलीट करने में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditMode ? 'विवरण अपडेट करें' : '+ नई लिस्टिंग जोड़ें (नीमच क्लासिफाइड)'}
              </h2>
              <p className="text-xs text-slate-400">
                मकान, दुकान, गिरवी या बिक्री - हमेशा के लिए Firebase डेटाबेस में सुरक्षित।
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Category Selector Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              लिस्टिंग की श्रेणी (Category) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('मकान किराए हेतु')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  listingCategory === 'मकान किराए हेतु'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>किराए हेतु</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('गिरवी मकान')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  listingCategory === 'गिरवी मकान'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>गिरवी मकान</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('दुकान')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  listingCategory === 'दुकान'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>दुकान (Shop)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('मकान बेचना है')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  listingCategory === 'मकान बेचना है'
                    ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>मकान बेचना है</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('मकान खरीदना है')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  listingCategory === 'मकान खरीदना है'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>मकान खरीदना है</span>
              </button>
            </div>
          </div>

          {/* Row 1: House/Shop Number & Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {listingCategory === 'दुकान' ? 'दुकान नंबर / पहचान *' : 'मकान नंबर (House/Plot No.) *'}
              </label>
              <input
                type="text"
                required
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder={listingCategory === 'दुकान' ? 'उदा. Shop No. 12, Corner Shop' : 'उदा. H.N. 42, Plot 108, B-12'}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                कॉन्फ़िगरेशन / प्रकार *
              </label>
              <select
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
              >
                {PROPERTY_CONFIG_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="पूरा मकान सेपरेट">पूरा मकान सेपरेट</option>
                <option value="1R">1R (सिंगल रूम)</option>
                <option value="1RK">1RK (कमरा + किचन)</option>
                {!PROPERTY_CONFIG_OPTIONS.includes(config as any) &&
                  config !== 'पूरा मकान सेपरेट' &&
                  config !== '1R' &&
                  config !== '1RK' &&
                  config && (
                    <option value={config}>{config}</option>
                  )}
              </select>
            </div>
          </div>

          {/* Row 2: Colony & Custom Colony */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                कॉलोनी / स्थान (Neemuch Location) *
              </label>
              <select
                value={colony}
                onChange={(e) => setColony(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
              >
                {NEEMUCH_COLONIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="अन्य (Other)">अन्य कॉलोनी दर्ज करें...</option>
              </select>
            </div>

            {colony === 'अन्य (Other)' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  कॉलोनी का नाम टाइप करें *
                </label>
                <input
                  type="text"
                  required
                  value={customColony}
                  onChange={(e) => setCustomColony(e.target.value)}
                  placeholder="कॉलोनी का नाम लिखें"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  फ्लोर या साइज़ (Floor / Size)
                </label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder={listingCategory === 'दुकान' ? 'उदा. 12x20 फीट, ग्राउंड फ्लोर' : 'उदा. ग्राउंड फ्लोर, 1st फ्लोर, डुप्लेक्स'}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
                />
              </div>
            )}
          </div>

          {/* Row 3: Rent / Price & Price Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {listingCategory === 'मकान खरीदना है'
                  ? 'बजट (₹ या रेंज जैसे 28-30 लाख) - वैकल्पिक'
                  : listingCategory === 'गिरवी मकान'
                  ? 'गिरवी राशि (सुरक्षा निधि ₹) - वैकल्पिक'
                  : listingCategory === 'मकान बेचना है'
                  ? 'कुल बिक्री मूल्य (₹) - वैकल्पिक'
                  : 'मासिक किराया (₹) - यदि उपलब्ध हो (वैकल्पिक)'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                </span>
                <input
                  type="text"
                  value={priceDisplay || rent}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setRent('');
                      setPriceDisplay('');
                    } else if (/^\d+$/.test(val.trim())) {
                      setRent(Number(val.trim()));
                      setPriceDisplay('');
                    } else {
                      setPriceDisplay(val);
                    }
                  }}
                  placeholder="उदा: 28-30 लाख या 6000 (खाली भी छोड़ सकते हैं)"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                * खाली छोड़ने पर बातचीत अनुसार प्रदर्शित होगा।
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                मूल्य का प्रकार (Price Label)
              </label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
              >
                <option value="प्रति माह">प्रति माह (Per Month Rent)</option>
                <option value="बजट">बजट (Buyer Budget)</option>
                <option value="किराया बजट">किराया बजट (Tenant Budget)</option>
                <option value="गिरवी राशि">गिरवी राशि (Refundable Deposit)</option>
                <option value="गिरवी बजट">गिरवी बजट</option>
                <option value="बिक्री मूल्य">बिक्री मूल्य (Total Sale Price)</option>
                <option value="परक्राम्य (Negotiable)">परक्राम्य (Negotiable)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Contact Number & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                संपर्क मोबाइल नंबर (Contact Mobile) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </span>
                <input
                  type="text"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91-7999646575"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                लैंडमार्क / पहचान स्थल
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="उदा. लायंस पार्क के पास, मंडी गेट के सामने"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              शीर्षक (Title - खाली छोड़ने पर स्वतः बनेगा)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. 2BHK स्वतंत्र गिरवी मकान, विकास नगर या मुख्य बाजार दुकान"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
            />
          </div>

          {/* Architectural Layout Note - NO PHOTOS on cards */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-200">डार्क ब्लू-प्रिंट डिस्प्ले:</strong> यह लिस्टिंग बिना फ़ोटो के साफ़-सुथरे आर्किटेक्चरल कार्ड लेआउट में प्रदर्शित होगी।
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              विस्तृत विवरण (Description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="विशेषताएं, लीज अवधि, पानी-बिजली, चौड़ा रास्ता, रजिस्ट्री स्थिति आदि..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
            />
          </div>

          {/* Features / Highlights */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              सुविधाएं / टैग्स (कोमा से अलग करें)
            </label>
            <input
              type="text"
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              placeholder="रोलिंग शटर, 2 साल एग्रीमेंट, रजिस्ट्री पूर्ण, लोन उपलब्ध"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white text-sm outline-none"
            />
          </div>

          {/* Switches */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>यह लिस्टिंग वर्तमान में उपलब्ध है (Available)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-indigo-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAiDetected}
                onChange={(e) => setIsAiDetected(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                AI सत्यापित मार्क
              </span>
            </label>
          </div>

          {/* Optional House Photos Uploader with Right-Checkmark Toggle */}
          <HousePhotosUploader
            photos={photos}
            onChange={setPhotos}
            maxPhotos={10}
            initiallyOpen={Boolean(initialProperty?.photos && initialProperty.photos.length > 0)}
          />

          {/* Form Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isEditMode && onDelete ? (
              showDeletePrompt ? (
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-rose-500/40">
                  <input
                    type="password"
                    placeholder="एडमिन पिन"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-28 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting || !deletePassword}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    पुष्टि
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeletePrompt(false);
                      setDeletePassword('');
                    }}
                    className="px-1.5 py-1 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeletePrompt(true)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
                  title="एडमिन डिलीट"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>एडमिन डिलीट</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                रद्द करें
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isSubmitting ? 'डेटाबेस में सेव हो रहा है...' : 'Firebase में स्थायी सेव करें'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
