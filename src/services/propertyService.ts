import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import { Property, ListingCategory, PosterAd } from '../types/property';
import { INITIAL_NEEMUCH_PROPERTIES } from '../data/seedProperties';

const COLLECTION_NAME = 'properties';

export function subscribeToProperties(
  onData: (properties: Property[]) => void,
  onError?: (error: unknown) => void
) {
  // Test connection once silently
  testConnection();

  return onSnapshot(
    collection(db, COLLECTION_NAME),
    async (snapshot) => {
      // If collection is empty, only seed if admin hasn't explicitly wiped it
      if (snapshot.empty) {
        const hasExplicitlyCleared = typeof window !== 'undefined' && localStorage.getItem('neemuch_cleared_by_admin');
        if (!hasExplicitlyCleared) {
          console.log('Properties collection empty. Seeding initial Neemuch listings...');
          try {
            const batch = writeBatch(db);
            for (const item of INITIAL_NEEMUCH_PROPERTIES) {
              const docRef = doc(collection(db, COLLECTION_NAME));
              batch.set(docRef, { ...item, imageUrl: '', rent: 0 }); // rent 0 by default
            }
            await batch.commit();
            return;
          } catch (e) {
            console.warn('Auto-seed batch error:', e);
          }
        }
      }

      // Check if any existing documents have any saved imageUrl and wipe them completely
      // as photos are only for data extraction and should NOT be stored or displayed on screen
      const docsWithPhotos = snapshot.docs.filter((d) => {
        const url = d.data().imageUrl;
        return typeof url === 'string' && url.length > 0;
      });

      if (docsWithPhotos.length > 0) {
        (async () => {
          try {
            const batch = writeBatch(db);
            for (const d of docsWithPhotos) {
              batch.update(d.ref, { imageUrl: '' });
            }
            await batch.commit();
            console.log(`Cleaned image URLs from ${docsWithPhotos.length} listings in Firestore`);
          } catch (err) {
            console.warn('Could not clean image URLs from batch:', err);
          }
        })();
      }

      const items: Property[] = snapshot.docs.map((d) => {
        const data = d.data();

        // Auto-detect or preserve category accurately (never conflate खरीदना with बेचना!)
        let category: ListingCategory = data.listingCategory || 'मकान किराए हेतु';
        const titleLower = (data.title || '').toLowerCase();
        const purposeLower = (data.adPurpose || '').toLowerCase();
        const descLower = (data.description || '').toLowerCase();

        if (
          category === 'मकान खरीदना है' ||
          purposeLower.includes('खरीदना') ||
          titleLower.includes('खरीदना') ||
          (category === 'मकान बेचना है' && descLower.includes('खरीदना है'))
        ) {
          category = 'मकान खरीदना है';
        } else if (titleLower.includes('गिरवी')) {
          category = 'गिरवी मकान';
        } else if (titleLower.includes('दुकान') || titleLower.includes('shop')) {
          category = 'दुकान';
        } else if (titleLower.includes('बेचना') || titleLower.includes('बिकाऊ') || titleLower.includes('for sale')) {
          category = 'मकान बेचना है';
        }

        let defaultPriceType = data.priceType;
        if (category === 'मकान खरीदना है' && (!defaultPriceType || defaultPriceType === 'बिक्री मूल्य')) {
          defaultPriceType = 'बजट';
        } else if (!defaultPriceType) {
          if (category === 'गिरवी मकान') defaultPriceType = 'गिरवी राशि';
          else if (category === 'मकान बेचना है') defaultPriceType = 'बिक्री मूल्य';
          else defaultPriceType = 'प्रति माह';
        }

        const rentVal = Number(data.rent) || 0;
        const aiTagsArr: string[] = Array.isArray(data.aiTags) ? data.aiTags : [];
        const isQuickPasteOrRaw = Boolean(data.isRawAd) || aiTagsArr.includes('क्विक पेस्ट');

        // Clean any legacy "वांछित" word anywhere in stored fields
        const cleanVanchhit = (val: string) =>
          (val || '')
            .replace(/किराएदार\s*\(?\s*वांछित\s*(?:मकान)?\s*\)?/gi, 'किराएदार हेतु')
            .replace(/खरीदार\s*\(?\s*वांछित\s*(?:मकान)?\s*\)?/gi, 'खरीदार हेतु')
            .replace(/\(?\s*वांछित\s*(?:मकान|क्षेत्र)?\s*\)?/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();

        let cleanedHouseNum = cleanVanchhit(data.houseNumber || '');
        let cleanedTitle = cleanVanchhit(data.title || '');
        let cleanedColony = data.colony || '';
        let cleanedLandmark = data.landmark || '';
        let cleanedConfig = data.config || 'विवरण अनुसार';
        let cleanedFloor = data.floor || '';
        const descStr = data.description || '';

        if (isQuickPasteOrRaw) {
          // If colony or landmark got polluted with room/kitchen text, replace cleanly
          const roomNoiseRegex = /(?:रूम|किचन|लैट|लेट|बाथ|bhk|फैमिली|फेमिली|संपर्क|सम्पर्क)/i;
          if (roomNoiseRegex.test(cleanedColony)) {
            cleanedColony = 'नीमच (मूल विज्ञापन देखें)';
          }
          if (roomNoiseRegex.test(cleanedLandmark)) {
            cleanedLandmark = '';
          }
          // If config was auto-guessed as 2BHK/1RK when NOT actually written in description, drop fake config
          if (/^2\s*bhk$/i.test(cleanedConfig) && !/2\s*(?:bhk|बीएचके)/i.test(descStr)) {
            cleanedConfig = 'मूल विज्ञापन';
          }
          if (/^ग्राउंड\s*फ्लोर$/i.test(cleanedFloor) && !/(?:ग्राउंड\s*फ्लोर|ground\s*floor)/i.test(descStr)) {
            cleanedFloor = '';
          }
        }

        return {
          id: d.id,
          title: cleanedTitle,
          listingCategory: category,
          adPurpose: cleanVanchhit(data.adPurpose || ''),
          colony: cleanedColony,
          houseNumber: cleanedHouseNum,
          config: cleanedConfig,
          floor: cleanedFloor,
          rent: rentVal,
          priceDisplay: data.priceDisplay || '',
          priceType: defaultPriceType,
          contactNumber: data.contactNumber || '+91-7999646575',
          whatsappNumber: data.whatsappNumber || '917999646575',
          description: descStr,
          imageUrl: '', // Always empty - no photos on screen
          aiDetected: Boolean(data.aiDetected),
          aiConfidence: data.aiConfidence ? Number(data.aiConfidence) : undefined,
          aiTags: aiTagsArr,
          isRawAd: isQuickPasteOrRaw,
          features: Array.isArray(data.features) ? data.features : [],
          landmark: cleanedLandmark,
          photos: Array.isArray(data.photos) ? data.photos : [],
          posterAd: data.posterAd || undefined,
          available: data.available !== false && String(data.available).toLowerCase() !== 'false' && data.status !== 'booked',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      });

      // Sort by creation time desc
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      console.error('Subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
}

export async function addProperty(propertyData: Omit<Property, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...propertyData,
      imageUrl: '', // Enforce no legacy photo stored
      photos: Array.isArray(propertyData.photos) ? propertyData.photos : [],
      createdAt: propertyData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const sanitizedUpdates: Record<string, any> = {
      ...updates,
      imageUrl: '', // Enforce no legacy photo stored
      updatedAt: new Date().toISOString(),
    };
    if (updates.photos !== undefined) {
      sanitizedUpdates.photos = Array.isArray(updates.photos) ? updates.photos : [];
    }
    await updateDoc(docRef, sanitizedUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
    throw error;
  }
}

export async function updatePropertyPhotos(id: string, photos: string[]): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      photos: Array.isArray(photos) ? photos : [],
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
    throw error;
  }
}

export async function updatePropertyPosterAd(id: string, posterAd: PosterAd | null): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    if (posterAd) {
      const cleanPoster: Record<string, any> = {
        imageUrl: posterAd.imageUrl,
        updatedAt: posterAd.updatedAt || new Date().toISOString(),
      };
      if (posterAd.shopName) cleanPoster.shopName = posterAd.shopName;
      if (posterAd.contactNumber) cleanPoster.contactNumber = posterAd.contactNumber;
      if (posterAd.tagline) cleanPoster.tagline = posterAd.tagline;

      await updateDoc(docRef, {
        posterAd: cleanPoster,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(docRef, {
        posterAd: null,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
    throw error;
  }
}

export async function deleteProperty(id: string): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
    throw error;
  }
}

export async function clearAllPhotosFromFirestore(): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const batch = writeBatch(db);
    let count = 0;

    for (const d of snapshot.docs) {
      const currentUrl = d.data().imageUrl || '';
      if (currentUrl.length > 0) {
        batch.update(d.ref, { imageUrl: '' });
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    throw error;
  }
}

/**
 * MASTER RESET 1: Completely wipe all documents from Firestore properties collection
 */
export async function wipeAllPropertiesFromFirestore(): Promise<number> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('neemuch_cleared_by_admin', 'true');
    }
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const CHUNK_SIZE = 400;
    let deletedCount = 0;

    for (let i = 0; i < snapshot.docs.length; i += CHUNK_SIZE) {
      const chunk = snapshot.docs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const d of chunk) {
        batch.delete(d.ref);
      }
      await batch.commit();
      deletedCount += chunk.length;
    }

    return deletedCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
    throw error;
  }
}

/**
 * MASTER RESET 2: Reset rent on ALL existing listings in Firestore to 0 ('किराया उपलब्ध नहीं')
 * Preserves the listing, colony, house number, and contact info while eliminating unwanted rent numbers.
 */
export async function resetAllRentsInFirestore(): Promise<number> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const CHUNK_SIZE = 400;
    let updatedCount = 0;

    for (let i = 0; i < snapshot.docs.length; i += CHUNK_SIZE) {
      const chunk = snapshot.docs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const d of chunk) {
        batch.update(d.ref, {
          rent: 0,
          updatedAt: new Date().toISOString()
        });
      }
      await batch.commit();
      updatedCount += chunk.length;
    }

    return updatedCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, COLLECTION_NAME);
    throw error;
  }
}

/**
 * MASTER RESET 3: Wipe all and restore clean seed listings (with rent: 0 by default)
 */
export async function restoreDefaultSeedInFirestore(): Promise<number> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neemuch_cleared_by_admin');
    }
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const deleteBatch = writeBatch(db);
    for (const d of snapshot.docs) {
      deleteBatch.delete(d.ref);
    }
    await deleteBatch.commit();

    const insertBatch = writeBatch(db);
    for (const item of INITIAL_NEEMUCH_PROPERTIES) {
      const docRef = doc(collection(db, COLLECTION_NAME));
      insertBatch.set(docRef, {
        ...item,
        imageUrl: '',
        rent: 0, // Zero rent by default so 'किराया उपलब्ध नहीं' is displayed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await insertBatch.commit();
    return INITIAL_NEEMUCH_PROPERTIES.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    throw error;
  }
}
