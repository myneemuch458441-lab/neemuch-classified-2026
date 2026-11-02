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
  aiDetected?: boolean;
  aiConfidence?: number;
  aiTags?: string[];
  features?: string[];
  landmark?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BulkUploadItem {
  id: string;
  file?: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  extractedData?: Partial<Property>;
  rawNotes?: string;
  error?: string;
}
