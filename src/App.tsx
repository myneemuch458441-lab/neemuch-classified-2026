/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Plus,
  Sparkles,
  Phone,
  MessageCircle,
  Database,
  Building,
  RefreshCw,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Store,
  Shield,
  Tag,
  Key,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Property, PropertyConfig, ListingCategory, PosterAd } from './types/property';
import { NEEMUCH_COLONIES, LISTING_CATEGORIES } from './data/seedProperties';
import { matchesConfigFilter } from './utils/adTextParser';
import {
  subscribeToProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  wipeAllPropertiesFromFirestore,
  resetAllRentsInFirestore,
  restoreDefaultSeedInFirestore,
  updatePropertyPosterAd,
  updatePropertyPhotos
} from './services/propertyService';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PropertyCard } from './components/PropertyCard';
import { AddEditPropertyModal } from './components/AddEditPropertyModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { AdminDeleteModal } from './components/AdminDeleteModal';
import { AdminMasterResetModal } from './components/AdminMasterResetModal';
import { AdminEditAuthModal } from './components/AdminEditAuthModal';
import { AdminShutterToggleModal } from './components/AdminShutterToggleModal';
import { AdminAddAuthModal } from './components/AdminAddAuthModal';
import { PostUserAdModal } from './components/PostUserAdModal';
import { AdminOcrModal } from './components/AdminOcrModal';
import { PublicPosterUploadModal } from './components/PublicPosterUploadModal';
import { AdminDeletePosterModal } from './components/AdminDeletePosterModal';
import { PropertyPhotoGalleryModal } from './components/PropertyPhotoGalleryModal';
import { UploadHousePhotosModal } from './components/UploadHousePhotosModal';
import { VisitorCountBar } from './components/VisitorCountBar';
import {
  subscribeToVisitorStats,
  recordVisitorHit,
  getLocalVisitorStats,
  VisitorStats
} from './services/visitorService';

export default function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<PropertyConfig | 'All'>('All');
  const [selectedColonies, setSelectedColonies] = useState<string[]>([...NEEMUCH_COLONIES]);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'booked'>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isPostUserAdModalOpen, setIsPostUserAdModalOpen] = useState(false);
  const [prefilledAdText, setPrefilledAdText] = useState('');
  const [isAdminOcrModalOpen, setIsAdminOcrModalOpen] = useState(false);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [shareProperty, setShareProperty] = useState<Property | null>(null);

  // Admin Delete Modal state (Password: 3252)
  const [adminDeleteProperty, setAdminDeleteProperty] = useState<Property | null>(null);
  const [isAdminDeleteModalOpen, setIsAdminDeleteModalOpen] = useState(false);

  // Admin Edit Auth Modal state (Password: 3252)
  const [adminEditProperty, setAdminEditProperty] = useState<Property | null>(null);
  const [isAdminEditAuthModalOpen, setIsAdminEditAuthModalOpen] = useState(false);

  // Admin Shutter Toggle Modal state (Password: 3252)
  const [adminToggleProperty, setAdminToggleProperty] = useState<Property | null>(null);
  const [isAdminToggleModalOpen, setIsAdminToggleModalOpen] = useState(false);

  // Admin Add Auth Modal state (Password: 3252)
  const [isAdminAddAuthModalOpen, setIsAdminAddAuthModalOpen] = useState(false);

  // Master Reset Modal state (Password: 3252)
  const [isMasterResetModalOpen, setIsMasterResetModalOpen] = useState(false);

  // Public 1:1 Poster Upload Modal state (100% public, no password required)
  const [posterProperty, setPosterProperty] = useState<Property | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  // Admin Delete Poster Modal state (Password: 3252 protected)
  const [adminDeletePosterProperty, setAdminDeletePosterProperty] = useState<Property | null>(null);
  const [isAdminDeletePosterModalOpen, setIsAdminDeletePosterModalOpen] = useState(false);

  // House Photo Gallery Modal state (बाहर मेन पेज से फोटो देखने हेतु)
  const [photoGalleryProperty, setPhotoGalleryProperty] = useState<Property | null>(null);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);

  // Upload/Edit House Photos Modal state (वैकल्पिक - अधिकतम 10 फोटो)
  const [uploadPhotosProperty, setUploadPhotosProperty] = useState<Property | null>(null);
  const [isUploadPhotosOpen, setIsUploadPhotosOpen] = useState(false);

  // Visitor stats state (Live visitor counter bar with 15-20 daily auto increment)
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(() => getLocalVisitorStats());

  // Subscribe to real-time Firestore collection & Live Visitor Counter
  useEffect(() => {
    setIsLoading(true);
    const unsubscribeProps = subscribeToProperties(
      (data) => {
        setProperties(data);
        setIsLoading(false);
        setFirebaseConnected(true);
      },
      (error) => {
        console.error('Firebase sync error:', error);
        setIsLoading(false);
        setFirebaseConnected(false);
      }
    );

    // Record session visit and subscribe to live visitor count updates
    recordVisitorHit();
    const unsubscribeVisitors = subscribeToVisitorStats((stats) => {
      setVisitorStats(stats);
    });

    return () => {
      unsubscribeProps();
      unsubscribeVisitors();
    };
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: properties.length,
      'मकान किराए हेतु': 0,
      'गिरवी मकान': 0,
      'दुकान': 0,
      'मकान बेचना है': 0,
      'मकान खरीदना है': 0,
    };

    for (const p of properties) {
      const cat = p.listingCategory || 'मकान किराए हेतु';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [properties]);

  // Filter properties based on category, search query, config, colony, and availability
  const filteredProperties = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return properties.filter((item) => {
      // Category Filter (मकान किराए हेतु, गिरवी मकान, दुकान, मकान बेचना है)
      if (selectedCategory !== 'All') {
        const itemCat = item.listingCategory || 'मकान किराए हेतु';
        if (itemCat !== selectedCategory) {
          return false;
        }
      }

      // Configuration Filter (smart matching across config, floor, title & description)
      if (selectedConfig !== 'All') {
        if (!matchesConfigFilter(item, selectedConfig)) {
          return false;
        }
      }

      // Colony Filter
      if (selectedColonies.length > 0 && selectedColonies.length < NEEMUCH_COLONIES.length) {
        const matchesColony = selectedColonies.some(
          (c) => item.colony.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(item.colony.toLowerCase())
        );
        if (!matchesColony) return false;
      }

      // Availability Filter ('all', 'available', 'booked')
      const isItemBooked =
        item.available === false ||
        String(item.available).toLowerCase() === 'false' ||
        (item as any).status === 'booked';

      if (availabilityFilter === 'available' && isItemBooked) {
        return false;
      }
      if (availabilityFilter === 'booked' && !isItemBooked) {
        return false;
      }

      // Search Query Filter
      if (term) {
        const titleMatch = item.title?.toLowerCase().includes(term);
        const catMatch = (item.listingCategory || '').toLowerCase().includes(term);
        const colonyMatch = item.colony?.toLowerCase().includes(term);
        const houseMatch = item.houseNumber?.toLowerCase().includes(term);
        const configMatch = item.config?.toLowerCase().includes(term);
        const phoneMatch = item.contactNumber?.toLowerCase().includes(term) || item.whatsappNumber?.includes(term);
        const descMatch = item.description?.toLowerCase().includes(term);
        const landmarkMatch = item.landmark?.toLowerCase().includes(term);

        if (!titleMatch && !catMatch && !colonyMatch && !houseMatch && !configMatch && !phoneMatch && !descMatch && !landmarkMatch) {
          return false;
        }
      }

      return true;
    });
  }, [properties, selectedCategory, searchTerm, selectedConfig, selectedColonies, availabilityFilter]);

  // Handler: Save (Add / Edit) property
  const handleSaveProperty = async (data: Omit<Property, 'id'>, id?: string) => {
    if (id) {
      await updateProperty(id, data);
      showNotification('लिस्टिंग विवरण सफलतापूर्वक अपडेट कर दिया गया है!');
    } else {
      await addProperty(data);
      showNotification('नई लिस्टिंग Firebase में स्थायी रूप से जोड़ दी गई है!');
    }
  };

  // Handler: Self-service user ad posting (Free, without admin password)
  const handlePostUserAd = async (data: Omit<Property, 'id'>) => {
    await addProperty(data);
    showNotification('🎉 बधाई! आपका विज्ञापन नीमच क्लासिफाइड पर सफलतापूर्वक लाइव हो गया है।');
    setSelectedCategory('All');
    setAvailabilityFilter('all');
  };

  // Handler: Delete property with Admin verification
  const handleDeleteProperty = async (id: string) => {
    await deleteProperty(id);
    showNotification('लिस्टिंग Firebase डेटाबेस से हमेशा के लिए डिलीट कर दी गई है!');
  };

  // Handler: Trigger Admin Delete modal for a property
  const handleRequestDelete = (property: Property) => {
    setAdminDeleteProperty(property);
    setIsAdminDeleteModalOpen(true);
  };

  // Handler: Trigger Admin Edit Authentication modal for a property
  const handleRequestEdit = (property: Property) => {
    setAdminEditProperty(property);
    setIsAdminEditAuthModalOpen(true);
  };

  // Handler: When Admin Edit PIN is successfully verified
  const handleEditAuthenticated = (property: Property) => {
    setEditingProperty(property);
    setIsAddEditModalOpen(true);
  };

  // Handler: Master Reset 1 - Wipe all properties to 0
  const handleWipeAll = async () => {
    const count = await wipeAllPropertiesFromFirestore();
    showNotification(`Firebase डेटाबेस से सभी ${count} लिस्टिंग्स हमेशा के लिए खाली कर दी गईं।`);
    setDetailProperty(null);
    return count;
  };

  // Handler: Master Reset 2 - Reset all rents to 0 ('रेंट की जानकारी उपलब्ध नहीं है')
  const handleResetRents = async () => {
    const count = await resetAllRentsInFirestore();
    showNotification(`सफलता: सभी ${count} लिस्टिंग्स से रेंट हटाकर 'रेंट की जानकारी उपलब्ध नहीं है' सेट कर दिया गया।`);
    return count;
  };

  // Handler: Master Reset 3 - Restore default clean seed listings
  const handleRestoreSeed = async () => {
    const count = await restoreDefaultSeedInFirestore();
    showNotification(`सफलता: डिफ़ॉल्ट नीमच लिस्टिंग्स रीस्टोर कर दी गईं।`);
    setDetailProperty(null);
    return count;
  };


  // Handler: Request Shutter Toggle with Admin Password Verification (PIN: 3252)
  const handleRequestToggleAvailability = (property: Property) => {
    setAdminToggleProperty(property);
    setIsAdminToggleModalOpen(true);
  };

  // Handler: Confirm Shutter Toggle after Admin PIN 3252 verification
  const handleConfirmToggleAvailability = async (property: Property, nextState: boolean) => {
    // Immediate optimistic local update so cards reflect instantly
    setProperties((prev) =>
      prev.map((p) => (p.id === property.id ? { ...p, available: nextState } : p))
    );
    await updateProperty(property.id, { available: nextState });
    setDetailProperty((prev) => (prev && prev.id === property.id ? { ...prev, available: nextState } : prev));
    showNotification(
      nextState
        ? 'शटर खोला गया: मकान अब "मकान उपलब्ध है" (ग्रीन) मार्क हो गया है।'
        : 'शटर बंद किया गया: मकान अब "मकान बुक हो चुका" (रेड) मार्क हो गया है और पर्सनल विवरण (मकान नं. व मोबाइल) हाइड कर दिए गए हैं।'
    );
  };

  // Handler: Request Add New Property with Admin Password Verification
  const handleRequestAdd = () => {
    setIsAdminAddAuthModalOpen(true);
  };

  // Handler: When Admin Add PIN is verified
  const handleAddAuthenticated = () => {
    setEditingProperty(null);
    setIsAddEditModalOpen(true);
  };

  // Handler: Open Public 1:1 Poster Upload Modal (No Password required)
  const handleOpenPosterModal = (property: Property) => {
    setPosterProperty(property);
    setIsPosterModalOpen(true);
  };

  // Handler: Save or Remove 1:1 Poster Ad
  const handleSavePoster = async (propertyId: string, poster: PosterAd | null) => {
    // Optimistic local state update
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, posterAd: poster || undefined } : p))
    );
    if (detailProperty && detailProperty.id === propertyId) {
      setDetailProperty((prev) => (prev ? { ...prev, posterAd: poster || undefined } : null));
    }
    await updatePropertyPosterAd(propertyId, poster);
    showNotification(
      poster
        ? '🎉 2:1 दुकान पोस्टर विज्ञापन सफलतापूर्वक लाइव हो गया है!'
        : 'पोस्टर विज्ञापन हटा दिया गया है।'
    );
  };

  // Handler: Request Admin Delete for Poster (PIN protected)
  const handleRequestDeletePoster = (property: Property) => {
    setAdminDeletePosterProperty(property);
    setIsAdminDeletePosterModalOpen(true);
  };

  // Handler: Confirm Admin Delete for Poster (PIN verified)
  const handleConfirmDeletePoster = async (propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, posterAd: undefined } : p))
    );
    if (detailProperty && detailProperty.id === propertyId) {
      setDetailProperty((prev) => (prev ? { ...prev, posterAd: undefined } : null));
    }
    await updatePropertyPosterAd(propertyId, null);
    showNotification('पोस्टर विज्ञापन सफलतापूर्वक डिलीट कर दिया गया है!');
  };

  // Handler: Open House Photo Gallery Modal
  const handleViewPhotos = (property: Property) => {
    setPhotoGalleryProperty(property);
    setIsPhotoGalleryOpen(true);
  };

  // Handler: Open House Photo Upload Modal
  const handleOpenUploadPhotos = (property: Property) => {
    setUploadPhotosProperty(property);
    setIsUploadPhotosOpen(true);
  };

  // Handler: Save House Photos (up to 10 photos)
  const handleSavePropertyPhotos = async (propertyId: string, photos: string[]) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, photos } : p))
    );
    if (detailProperty && detailProperty.id === propertyId) {
      setDetailProperty((prev) => (prev ? { ...prev, photos } : null));
    }
    if (photoGalleryProperty && photoGalleryProperty.id === propertyId) {
      setPhotoGalleryProperty((prev) => (prev ? { ...prev, photos } : null));
    }
    await updatePropertyPhotos(propertyId, photos);
    showNotification(
      photos.length > 0
        ? `🎉 ${photos.length} मकान के फोटो सफलतापूर्वक अपडेट हो गए हैं!`
        : 'मकान के फोटो हटा दिए गए हैं।'
    );
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setSelectedConfig('All');
    setSelectedColonies([...NEEMUCH_COLONIES]);
    setAvailabilityFilter('all');
  };

  const availableCount = properties.filter(
    (p) => p.available !== false && String(p.available).toLowerCase() !== 'false'
  ).length;
  const bookedCount = properties.length - availableCount;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <Header
        totalCount={properties.length}
        availableCount={availableCount}
        visitorCount={visitorStats.totalVisitors}
        activeCount={visitorStats.activeNow}
        onOpenAddModal={handleRequestAdd}
        onOpenPostUserAdModal={() => {
          setPrefilledAdText('');
          setIsPostUserAdModalOpen(true);
        }}
        onOpenMasterResetModal={() => setIsMasterResetModalOpen(true)}
        onOpenOcrModal={() => setIsAdminOcrModalOpen(true)}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border border-emerald-400/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Live Visitor Count Bar Screen (15-20 Daily Growth + Live Active Analytics) */}
        <VisitorCountBar stats={visitorStats} totalListingsCount={properties.length} />

        {/* Banner Section with Categories overview */}
        <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/70 p-5 sm:p-7 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  नीमच (म.प्र.) प्रॉपर्टी डायरेक्टरी
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  स्थायी क्लाउड डेटाबेस (Firebase Sync)
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  सुरक्षित एडमिन नियंत्रण
                </span>
                <button
                  onClick={() => setIsMasterResetModalOpen(true)}
                  className="px-2.5 py-0.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  title="एडमिन मास्टर रिसेट"
                >
                  <RotateCcw className="w-3 h-3 text-rose-400" />
                  <span>एडमिन मास्टर रिसेट</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                नीमच में किराए का मकान, गिरवी, दुकान या बिकाऊ प्रॉपर्टी
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                विकास नगर, जैन कालोनी, स्कीम 36, कैंट, टैगोर नगर, बघाना में <span className="text-amber-400 font-semibold">गिरवी मकान</span>, <span className="text-cyan-400 font-semibold">दुकानें</span>, <span className="text-emerald-400 font-semibold">बिकाऊ मकान</span> व <span className="text-teal-400 font-semibold">किराया लिस्टिंग्स</span> खोजें एवं सीधे व्हाट्सएप व कॉल पर संपर्क करें।
              </p>

              {/* Direct Banner CTA for public ad posting */}
              <div className="pt-1 flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setPrefilledAdText('');
                    setIsPostUserAdModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 border border-amber-300/50 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="text-base animate-bounce">📋</span>
                  <span>कॉपी-पेस्ट से डायरेक्ट विज्ञापन लगाएं (नो फॉर्म)</span>
                </button>

                <button
                  onClick={() => setIsAdminOcrModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-lg"
                  title="अख़बार या बोर्ड की फोटो से टेक्स्ट बनाएं (एडमिन पासवर्ड 3252)"
                >
                  <span className="text-sm">📰</span>
                  <span>फोटो से टेक्स्ट निकालें (OCR)</span>
                </button>

                <span className="text-xs sm:text-[13px] text-amber-300 font-semibold bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>व्हाट्सएप या नोट से सिर्फ पेस्ट करें और 10 सेकंड में तुरंत लाइव करें!</span>
                </span>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0">
              <div
                onClick={() => setSelectedCategory('मकान किराए हेतु')}
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-2.5 text-center cursor-pointer transition-colors"
              >
                <span className="text-xl font-black text-teal-400 block">
                  {categoryCounts['मकान किराए हेतु'] || 0}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                  <Key className="w-2.5 h-2.5" />
                  किराए हेतु
                </span>
              </div>

              <div
                onClick={() => setSelectedCategory('गिरवी मकान')}
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-2.5 text-center cursor-pointer transition-colors"
              >
                <span className="text-xl font-black text-amber-400 block">
                  {categoryCounts['गिरवी मकान'] || 0}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                  <Shield className="w-2.5 h-2.5" />
                  गिरवी मकान
                </span>
              </div>

              <div
                onClick={() => setSelectedCategory('दुकान')}
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-2.5 text-center cursor-pointer transition-colors"
              >
                <span className="text-xl font-black text-cyan-400 block">
                  {categoryCounts['दुकान'] || 0}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                  <Store className="w-2.5 h-2.5" />
                  दुकानें (Shops)
                </span>
              </div>

              <div
                onClick={() => setSelectedCategory('मकान बेचना है')}
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-2.5 text-center cursor-pointer transition-colors"
              >
                <span className="text-xl font-black text-emerald-400 block">
                  {categoryCounts['मकान बेचना है'] || 0}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                  <Tag className="w-2.5 h-2.5" />
                  मकान बेचना है
                </span>
              </div>

              <div
                onClick={() => setSelectedCategory('मकान खरीदना है')}
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-2.5 text-center cursor-pointer transition-colors col-span-2 sm:col-span-1"
              >
                <span className="text-xl font-black text-sky-400 block">
                  {categoryCounts['मकान खरीदना है'] || 0}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                  <Tag className="w-2.5 h-2.5" />
                  मकान खरीदना है
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedConfig={selectedConfig}
          onConfigChange={setSelectedConfig}
          selectedColonies={selectedColonies}
          onColoniesChange={setSelectedColonies}
          availabilityFilter={availabilityFilter}
          onAvailabilityFilterChange={setAvailabilityFilter}
          onResetFilters={handleResetFilters}
          totalFilteredCount={filteredProperties.length}
          categoryCounts={categoryCounts}
          availableCount={availableCount}
          bookedCount={bookedCount}
        />

        {/* Properties Grid Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm font-medium">नीमच क्लासिफाइड डेटा लोड हो रहा है...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelect={(prop) => setDetailProperty(prop)}
                onEdit={handleRequestEdit}
                onShare={(prop) => setShareProperty(prop)}
                onDeleteRequest={handleRequestDelete}
                onToggleAvailabilityRequest={handleRequestToggleAvailability}
                onOpenPosterUpload={handleOpenPosterModal}
                onRequestDeletePoster={handleRequestDeletePoster}
                onViewPhotos={handleViewPhotos}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-center flex flex-col items-center justify-center gap-3 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">कोई लिस्टिंग नहीं मिली</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {selectedCategory !== 'All' ? `"${selectedCategory}" श्रेणी में ` : ''}
              आपके सर्च के अनुसार कोई परिणाम नहीं मिला। कृपया फ़िल्टर बदलें या नई लिस्टिंग जोड़ें।
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                सभी फ़िल्टर साफ़ करें
              </button>
              <button
                onClick={handleRequestAdd}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
              >
                + नई लिस्टिंग जोड़ें
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Buttons for Mobile */}
      <div className="fixed bottom-5 left-5 z-30 md:hidden flex items-center gap-2">
        <button
          onClick={() => setIsPostUserAdModalOpen(true)}
          className="px-3.5 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-2xl shadow-amber-500/40 flex items-center gap-1.5 border border-amber-300"
          title="अपना विज्ञापन खुद पोस्ट करें"
        >
          <span>📢</span>
          <span>विज्ञापन पोस्ट करें</span>
        </button>

        <button
          onClick={handleRequestAdd}
          className="p-3 rounded-full bg-emerald-500 text-slate-950 font-bold shadow-2xl shadow-emerald-500/40 flex items-center justify-center"
          title="एडमिन लिस्टिंग जोड़ें"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-slate-950 border-t border-slate-800 py-6 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
              नी
            </div>
            <span className="font-bold text-white">नीमच क्लासिफाइड (Neemuch Classified)</span>
            <span className="text-slate-600">|</span>
            <span>मकान किराए, गिरवी मकान, दुकान व बिक्री डायरेक्टरी</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <a
              href="tel:+917999646575"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              +91-7999646575
            </a>
            <a
              href="https://wa.me/917999646575"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              व्हाट्सएप
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddEditPropertyModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        onDelete={handleDeleteProperty}
        initialProperty={editingProperty}
      />

      <PropertyDetailModal
        property={detailProperty}
        onClose={() => setDetailProperty(null)}
        onEdit={(prop) => {
          setDetailProperty(null);
          handleRequestEdit(prop);
        }}
        onShare={(prop) => setShareProperty(prop)}
        onToggleAvailability={async (prop) => handleRequestToggleAvailability(prop)}
        onDeleteRequest={handleRequestDelete}
        onOpenPosterUpload={handleOpenPosterModal}
        onRequestDeletePoster={handleRequestDeletePoster}
        onOpenUploadPhotos={handleOpenUploadPhotos}
      />

      <WhatsAppShareModal
        property={shareProperty}
        onClose={() => setShareProperty(null)}
      />

      {/* Admin Delete Verification Modal (Password: 3252) */}
      <AdminDeleteModal
        isOpen={isAdminDeleteModalOpen}
        property={adminDeleteProperty}
        onClose={() => {
          setIsAdminDeleteModalOpen(false);
          setAdminDeleteProperty(null);
        }}
        onConfirmDelete={async (id) => {
          await handleDeleteProperty(id);
          setDetailProperty(null);
        }}
      />

      {/* Admin Edit Authentication Modal (Password: 3252) */}
      <AdminEditAuthModal
        isOpen={isAdminEditAuthModalOpen}
        property={adminEditProperty}
        onClose={() => {
          setIsAdminEditAuthModalOpen(false);
          setAdminEditProperty(null);
        }}
        onAuthenticated={handleEditAuthenticated}
      />

      {/* Admin Master Reset Modal (Password: 3252) */}
      <AdminMasterResetModal
        isOpen={isMasterResetModalOpen}
        totalCount={properties.length}
        onClose={() => setIsMasterResetModalOpen(false)}
        onWipeAll={handleWipeAll}
        onResetRents={handleResetRents}
        onRestoreSeed={handleRestoreSeed}
      />

      {/* Admin Shutter Toggle Modal (Password: 3252) */}
      <AdminShutterToggleModal
        isOpen={isAdminToggleModalOpen}
        property={adminToggleProperty}
        onClose={() => {
          setIsAdminToggleModalOpen(false);
          setAdminToggleProperty(null);
        }}
        onConfirmToggle={handleConfirmToggleAvailability}
      />

      {/* Admin Add New Property Authentication Modal (Password: 3252) */}
      <AdminAddAuthModal
        isOpen={isAdminAddAuthModalOpen}
        onClose={() => setIsAdminAddAuthModalOpen(false)}
        onAuthenticated={handleAddAuthenticated}
      />

      {/* Self-Service User Ad Posting Modal (No Admin Password required) */}
      <PostUserAdModal
        isOpen={isPostUserAdModalOpen}
        onClose={() => {
          setIsPostUserAdModalOpen(false);
          setPrefilledAdText('');
        }}
        onPostAd={handlePostUserAd}
        initialAdText={prefilledAdText}
      />

      {/* Admin OCR Newspaper & Photo to Text Modal (Password: 3252) */}
      <AdminOcrModal
        isOpen={isAdminOcrModalOpen}
        onClose={() => setIsAdminOcrModalOpen(false)}
        onUseForAd={(extractedText) => {
          setPrefilledAdText(extractedText);
          setIsAdminOcrModalOpen(false);
          setIsPostUserAdModalOpen(true);
        }}
      />

      {/* Public 1:1 Shop Poster Advertisement Modal (100% Free, No Password Required) */}
      <PublicPosterUploadModal
        isOpen={isPosterModalOpen}
        property={posterProperty}
        onClose={() => {
          setIsPosterModalOpen(false);
          setPosterProperty(null);
        }}
        onSavePoster={handleSavePoster}
        onRequestDeletePoster={handleRequestDeletePoster}
      />

      {/* Admin Delete Poster Verification Modal (Password: 3252 Protected) */}
      <AdminDeletePosterModal
        isOpen={isAdminDeletePosterModalOpen}
        property={adminDeletePosterProperty}
        onClose={() => {
          setIsAdminDeletePosterModalOpen(false);
          setAdminDeletePosterProperty(null);
        }}
        onConfirmDeletePoster={handleConfirmDeletePoster}
      />

      {/* House Photo Gallery Modal (बाहर मेन पेज से फोटो देखने हेतु) */}
      <PropertyPhotoGalleryModal
        property={photoGalleryProperty}
        isOpen={isPhotoGalleryOpen}
        onClose={() => {
          setIsPhotoGalleryOpen(false);
          setPhotoGalleryProperty(null);
        }}
        onOpenUploadPhotos={handleOpenUploadPhotos}
      />

      {/* Upload/Edit House Photos Modal (अधिकतम 10 फोटो) */}
      <UploadHousePhotosModal
        property={uploadPhotosProperty}
        isOpen={isUploadPhotosOpen}
        onClose={() => {
          setIsUploadPhotosOpen(false);
          setUploadPhotosProperty(null);
        }}
        onSavePhotos={handleSavePropertyPhotos}
      />
    </div>
  );
}
