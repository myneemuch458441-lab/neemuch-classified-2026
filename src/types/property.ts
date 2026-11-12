export type ListingCategory = 
  | 'मकान किराए हेतु'
  | 'गिरवी मकान'
  | 'दुकान'
  | 'मकान बेचना है';

export type PropertyConfig = 
  | '1R'
  | '1RK'
  | '1BHK'
  | '2BHK'
  | '3BHK'
  | '4BHK'
  | '1st फ्लोर'
  | '2nd फ्लोर'
  | 'दुकान (Shop)'
  | 'कमर्शियल स्पेस';

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
  priceType?: string; // 'प्रति माह' | 'गिरवी राशि' | 'बिक्री मूल्य'
  contactNumber: string;
  whatsappNumber: string;
  description: string;
  imageUrl: string;
  photos?: string[]; // मकान के फोटो (वैकल्पिक - अधिकतम 10 फोटो)
  posterAd?: PosterAd; // हर विज्ञापन के नीचे 2:1 साइज पोस्टर विज्ञापन
  aiDetected?: boolean;
  aiConfidence?: number;
  aiTags?: string[];
  features?: string[];
  landmark?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}
