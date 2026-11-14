export type ListingCategory = 
  | 'मकान किराए हेतु'
  | 'गिरवी मकान'
  | 'दुकान'
  | 'मकान बेचना है'
  | 'मकान खरीदना है';

export const PROPERTY_CONFIG_OPTIONS = [
  'एक कमरा',
  'एक कमरा किचन',
  'एक हॉल',
  'एक हॉल अटैच किचन',
  '2 कमरे किचन',
  '3 कमरे किचन',
  '4 कमरे किचन',
  '1BHK',
  '2BHK',
  '3BHK',
  '4BHK',
  '5BHK',
  '2 मंजिला मकान',
  '3 मंजिला मकान',
  'ग्राउंड फ्लोर',
  '1st फ्लोर',
  '2nd फ्लोर',
  '3rd फ्लोर',
  'ऑफिस स्पेस',
  'दुकान ग्राउंड फ्लोर',
  'दुकान 1st फ्लोर',
  'बड़ा हॉल दुकान के लिए',
  'गोडाउन',
  'मल्टी फ्लोर गोडाउन',
  'मल्टी मे फ्लेट',
  'टावर मे फ्लेट',
  'दुकान (Shop)',
  'कमर्शियल स्पेस',
  'विवरण अनुसार',
] as const;

export const FLOOR_OPTIONS = [
  'ग्राउंड फ्लोर',
  '1st फ्लोर',
  '2nd फ्लोर',
  '3rd फ्लोर',
  'डबल स्टोरी (2 मंजिला)',
  '3 मंजिला',
  'स्वतंत्र मकान (सेपरेट)',
  'ग्राउंड फ्लोर शटर',
  'मल्टी फ्लोर',
] as const;

export type PropertyConfig =
  | (typeof PROPERTY_CONFIG_OPTIONS)[number]
  | '1R'
  | '1RK'
  | 'पूरा मकान सेपरेट';

export interface PosterAd {
  imageUrl: string; // Base64 data URI (2:1 landscape banner ratio)
  shopName?: string; // दुकान / व्यवसाय का नाम
  contactNumber?: string; // संपर्क नंबर (कॉल / व्हाट्सएप)
  tagline?: string; // ऑफर या मुख्य विवरण
  updatedAt?: string;
}

export interface Property {
  id: string;
  title: string;
  listingCategory?: ListingCategory;
  adPurpose?: string;
  colony: string;
  houseNumber: string;
  config: PropertyConfig | string;
  floor: string;
  rent: number;
  priceDisplay?: string; // सटीक बजट/मूल्य रेंज जैसे '₹28-30 लाख'
  priceType?: string; // 'प्रति माह' | 'गिरवी राशि' | 'बिक्री मूल्य' | 'बजट' | 'किराया बजट'
  contactNumber: string;
  whatsappNumber: string;
  description: string;
  imageUrl: string;
  photos?: string[]; // मकान के फोटो (वैकल्पिक - अधिकतम 10 फोटो)
  posterAd?: PosterAd; // हर विज्ञापन के नीचे 2:1 साइज पोस्टर विज्ञापन
  aiDetected?: boolean;
  aiConfidence?: number;
  aiTags?: string[];
  isRawAd?: boolean; // मूल विज्ञापन जैसा का तैसा (बिना किसी AI बदलाव के)
  features?: string[];
  landmark?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}
