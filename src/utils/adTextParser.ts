import { Property, ListingCategory, PropertyConfig } from '../types/property';
import { NEEMUCH_COLONIES } from '../data/seedProperties';

export interface ParsedAdResult {
  category: ListingCategory;
  adPurpose: string;
  isSeeker: boolean;
  colony: string;
  landmark: string;
  config: string;
  floor: string;
  rent: number;
  priceType: string;
  contactNumber: string;
  whatsappNumber: string;
  features: string[];
  title: string;
  description: string;
  houseNumber: string;
}

// Comprehensive Neemuch locality patterns with Hindi and English aliases
const NEEMUCH_LOCALITY_PATTERNS: { regex: RegExp; value: string; label: string }[] = [
  // Shakti Nagar & Vistar (Explicitly at the top!)
  { regex: /(?:शक्ति\s*नगर\s*विस्तार|shakti\s*nagar\s*vistar)/i, value: 'शक्ति नगर विस्तार (Shakti Nagar Vistar)', label: 'शक्ति नगर विस्तार' },
  { regex: /(?:शक्ति\s*नगर|shakti\s*nagar)/i, value: 'शक्ति नगर (Shakti Nagar)', label: 'शक्ति नगर' },

  // Vikas Nagar
  { regex: /(?:विकास\s*नगर\s*(?:विस्तार|एक्सटेंशन|1|2)?|vikas\s*nagar)/i, value: 'विकास नगर (Vikas Nagar)', label: 'विकास नगर' },

  // Jain Colony
  { regex: /(?:जैन\s*कालोनी|जैन\s*कॉलोनी|jain\s*colony)/i, value: 'जैन कालोनी (Jain Colony)', label: 'जैन कालोनी' },

  // Tagore Nagar
  { regex: /(?:टैगोर\s*नगर|tagore\s*nagar)/i, value: 'टैगोर नगर (Tagore Nagar)', label: 'टैगोर नगर' },

  // Schemes
  { regex: /(?:स्कीम\s*(?:नं(?:बर)?\.?)?\s*36|scheme\s*36)/i, value: 'स्कीम नंबर 36 (Scheme 36)', label: 'स्कीम नंबर 36' },
  { regex: /(?:स्कीम\s*(?:नं(?:बर)?\.?)?\s*9|scheme\s*9)/i, value: 'स्कीम नंबर 9 (Scheme 9)', label: 'स्कीम नंबर 9' },

  // Baghana
  { regex: /(?:बघाना|baghana)/i, value: 'बघाना मुख्य क्षेत्र (Baghana)', label: 'बघाना' },

  // Cantt
  { regex: /(?:कैंट|छावनी|cantt)/i, value: 'कैंट क्षेत्र (Neemuch Cantt)', label: 'कैंट क्षेत्र' },

  // Teacher's / Shikshak Colony (ONLY when explicitly written)
  { regex: /(?:टीचर\s*(?:कालोनी|कॉलोनी|नगर)?|शिक्षक\s*(?:कालोनी|कॉलोनी|नगर)?|teacher(?:'s)?\s*colony)/i, value: 'शिक्षक कालोनी (Teacher\'s Colony)', label: 'शिक्षक कालोनी' },

  // Shivaji Nagar
  { regex: /(?:शिवाजी\s*नगर|shivaji\s*nagar)/i, value: 'शिवाजी नगर (Shivaji Nagar)', label: 'शिवाजी नगर' },

  // Gomabai Road
  { regex: /(?:गोमाबाई\s*(?:रोड|नेत्रालय)?|gomabai)/i, value: 'गोमाबाई रोड (Gomabai Road)', label: 'गोमाबाई रोड' },

  // Manasa Road
  { regex: /(?:मनासा\s*रोड|manasa\s*road)/i, value: 'मनासा रोड (Manasa Road)', label: 'मनासा रोड' },

  // HUDCO
  { regex: /(?:हुडको\s*(?:कालोनी|कॉलोनी)?|hudco)/i, value: 'हुडको कालोनी (HUDCO Colony)', label: 'हुडको कालोनी' },

  // Ambedkar Colony
  { regex: /(?:अंबेडकर\s*(?:कालोनी|कॉलोनी|नगर)?|ambedkar)/i, value: 'अंबेडकर कालोनी (Ambedkar Colony)', label: 'अंबेडकर कालोनी' },

  // Gandhi Nagar
  { regex: /(?:गांधी\s*नगर|gandhi\s*nagar)/i, value: 'गांधी नगर (Gandhi Nagar)', label: 'गांधी नगर' },

  // Gyan Mandir Road
  { regex: /(?:ज्ञान\s*मंदिर\s*(?:रोड)?|gyan\s*mandir)/i, value: 'ज्ञान मंदिर रोड (Gyan Mandir Road)', label: 'ज्ञान मंदिर रोड' },

  // Ram Nagar & Indira Nagar
  { regex: /(?:राम\s*नगर|ram\s*nagar)/i, value: 'राम नगर (Ram Nagar)', label: 'राम नगर' },
  { regex: /(?:इंदिरा\s*नगर|indira\s*nagar)/i, value: 'इंदिरा नगर (Indira Nagar)', label: 'इंदिरा नगर' },

  // Neemuch City
  { regex: /(?:नीमच\s*सिटी|neemuch\s*city|सिटी\s*थाना)/i, value: 'नीमच सिटी (Neemuch City)', label: 'नीमच सिटी' },

  // Kanawati Road
  { regex: /(?:कनावटी\s*रोड|kanawati)/i, value: 'कनावटी रोड (Kanawati Road)', label: 'कनावटी रोड' },

  // Moolchand Marg & Book Bazar
  { regex: /(?:मूलचंद\s*मार्ग|moolchand)/i, value: 'मूलचंद मार्ग (Moolchand Marg)', label: 'मूलचंद मार्ग' },
  { regex: /(?:पुस्तक\s*बाजार|pustak\s*bazar)/i, value: 'पुस्तक बाजार (Pustak Bazar)', label: 'पुस्तक बाजार' }
];

export function parsePastedAdText(rawText: string): ParsedAdResult {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();

  // 1. Detect Category & Purpose (Seeker vs Owner)
  let category: ListingCategory = 'मकान किराए हेतु';
  let adPurpose = 'मकान किराए से चाहिए (किराएदार)';
  let isSeeker = true;

  const isRentSeeker =
    lower.includes('किराए से चाहिए') ||
    lower.includes('किराये से चाहिए') ||
    lower.includes('किराया चाहिए') ||
    lower.includes('रूम चाहिए') ||
    lower.includes('मकान चाहिए') ||
    lower.includes('चाहिए') ||
    lower.includes('किराएदार') ||
    lower.includes('need house') ||
    lower.includes('want rent') ||
    lower.includes('tenant');

  const isRentOwner =
    lower.includes('किराए से देना') ||
    lower.includes('किराये से देना') ||
    lower.includes('किराए पर देना') ||
    lower.includes('खाली है') ||
    lower.includes('to let') ||
    lower.includes('मकान मालिक');

  const isGirviSeeker =
    lower.includes('गिरवी चाहिए') ||
    lower.includes('गिरवी लेना है');

  const isGirviOwner =
    lower.includes('गिरवी देना') ||
    lower.includes('गिरवी पर देना') ||
    (lower.includes('गिरवी') && !isGirviSeeker);

  const isShopSeeker =
    lower.includes('दुकान चाहिए') ||
    lower.includes('दुकान किराए से चाहिए') ||
    lower.includes('shop need') ||
    lower.includes('दुकान गिरवी चाहिए');

  const isShopOwner =
    lower.includes('दुकान किराए से देना') ||
    lower.includes('दुकान देना है') ||
    lower.includes('दुकान खाली') ||
    lower.includes('दुकान बेचना') ||
    lower.includes('shop for rent') ||
    (lower.includes('दुकान') && !isShopSeeker);

  const isBuySeeker =
    lower.includes('मकान खरीदना') ||
    lower.includes('खरीदना है') ||
    lower.includes('प्लॉट खरीदना') ||
    lower.includes('plot खरीदना');

  const isSaleOwner =
    lower.includes('मकान बेचना') ||
    lower.includes('बेचना है') ||
    lower.includes('बिकाऊ') ||
    lower.includes('फॉर सेल') ||
    lower.includes('sale') ||
    lower.includes('sell');

  if (isShopSeeker || isShopOwner) {
    category = 'दुकान';
    if (lower.includes('गिरवी चाहिए')) {
      adPurpose = 'दुकान गिरवी चाहिए (किराएदार)';
      isSeeker = true;
    } else if (lower.includes('गिरवी')) {
      adPurpose = 'दुकान गिरवी देना है (दुकान मालिक)';
      isSeeker = false;
    } else if (isShopSeeker) {
      adPurpose = 'दुकान किराए से चाहिए (किराएदार)';
      isSeeker = true;
    } else {
      adPurpose = 'दुकान किराए से देना है (दुकान मालिक)';
      isSeeker = false;
    }
  } else if (isGirviSeeker || isGirviOwner) {
    category = 'गिरवी मकान';
    if (isGirviSeeker) {
      adPurpose = 'मकान गिरवी चाहिए (किराएदार)';
      isSeeker = true;
    } else {
      adPurpose = 'मकान गिरवी देना है (मकान मालिक)';
      isSeeker = false;
    }
  } else if (isBuySeeker || isSaleOwner) {
    category = 'मकान बेचना है';
    if (isBuySeeker) {
      adPurpose = 'मकान खरीदना है';
      isSeeker = true;
    } else {
      adPurpose = 'मकान बेचना है';
      isSeeker = false;
    }
  } else {
    category = 'मकान किराए हेतु';
    if (isRentSeeker) {
      adPurpose = 'मकान किराए से चाहिए (किराएदार)';
      isSeeker = true;
    } else if (isRentOwner) {
      adPurpose = 'मकान किराए से देना है (मकान मालिक)';
      isSeeker = false;
    } else {
      adPurpose = 'मकान किराए से चाहिए (किराएदार)';
      isSeeker = true;
    }
  }

  // 2. Extract Contact Phone Number (Indian mobile format: 10 digits, starts with 6-9, or any 10-digit sequence)
  let contactNumber = '';
  const contactKeywordMatch = text.match(/(?:सम्पर्क|संपर्क|मोबाइल|फोन|contact|phone|call|whatsapp|wa|mob)[\s:.-]*([+]?91[\s-]?)?([6-9]\d{9}|\d{10})/i);
  if (contactKeywordMatch) {
    contactNumber = contactKeywordMatch[2];
  } else {
    const genericPhoneMatch = text.match(/\b([6-9]\d{9})\b/) || text.match(/\b(\d{10})\b/);
    if (genericPhoneMatch) {
      contactNumber = genericPhoneMatch[1];
    }
  }

  const cleanDigits = contactNumber.replace(/[^0-9]/g, '');
  const finalContact = cleanDigits ? (cleanDigits.length === 10 ? `+91-${cleanDigits}` : cleanDigits) : '';
  const finalWa = cleanDigits ? (cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits) : '';

  // 3. Extract Colony / Location & Landmark ACCURATELY
  let matchedColony = '';
  let detectedColonyLabel = '';
  let landmark = '';

  // Step 3A: Check explicit address / location line in the text
  // Supports: एड्रेस, एड्रैस, ऐड्रेस, address, लोकेशन, location, स्थान, पता, एरिया, area, कॉलोनी, कालोनी, जगह
  const addressLineMatch = text.match(/(?:एड्रेस|एड्रैस|ऐड्रेस|address|लोकेशन|location|स्थान|पता|एरिया|area|कॉलोनी|कालोनी|colony|जगह)[\s:.-]*([^\n,]+)/i);

  if (addressLineMatch && addressLineMatch[1]) {
    const rawLoc = addressLineMatch[1].trim();

    // Check if rawLoc matches any known locality
    for (const cp of NEEMUCH_LOCALITY_PATTERNS) {
      if (cp.regex.test(rawLoc)) {
        matchedColony = cp.value;
        detectedColonyLabel = cp.label;
        landmark = rawLoc;
        break;
      }
    }

    // If not matched to known list, strip landmark suffixes like "के पास", "के सामने", "निकट", "near" to get the colony
    if (!matchedColony) {
      const cleanedArea = rawLoc.replace(/\s*(?:के\s*(?:आस\s*)?पास|के\s*सामने|निकट|near).*$/i, '').trim();
      if (cleanedArea) {
        matchedColony = cleanedArea;
        detectedColonyLabel = cleanedArea;
        landmark = rawLoc;
      } else {
        matchedColony = rawLoc;
        detectedColonyLabel = rawLoc;
        landmark = rawLoc;
      }
    }
  }

  // Step 3B: If no address line matched or colony still not determined, scan full text for known Neemuch colonies
  if (!matchedColony) {
    for (const cp of NEEMUCH_LOCALITY_PATTERNS) {
      if (cp.regex.test(text)) {
        matchedColony = cp.value;
        detectedColonyLabel = cp.label;
        break;
      }
    }
  }

  // Step 3C: Dynamic pattern match for any custom "... नगर", "... कालोनी", "... रोड", "... विस्तार"
  if (!matchedColony) {
    const genericAreaMatch = text.match(/([A-Za-z\u0900-\u097F0-9\s]{2,20}(?:नगर\s*विस्तार|नगर|कालोनी|कॉलोनी|रोड|मार्ग|विस्तार|क्षेत्र))/i);
    if (genericAreaMatch && genericAreaMatch[1]) {
      const found = genericAreaMatch[1].trim();
      matchedColony = found;
      detectedColonyLabel = found;
    }
  }

  // Step 3D: Final fallback (Neutral Neemuch - NEVER hardcoded to Teacher's Colony!)
  if (!matchedColony) {
    matchedColony = 'नीमच शहर (Neemuch City)';
    detectedColonyLabel = 'नीमच शहर';
  }

  // Landmark detection from text if not already captured
  if (!landmark) {
    if (lower.includes('lic') || lower.includes('एलआईसी')) {
      landmark = 'LIC चौराहे के आस पास';
    } else if (lower.includes('फव्वारा')) {
      landmark = 'फव्वारा चौक के पास';
    } else if (lower.includes('फोर जीरो') || lower.includes('40 चौराहा')) {
      landmark = 'फोर जीरो चौराहे के पास';
    } else if (lower.includes('लायंस पार्क') || lower.includes('lions park')) {
      landmark = 'लायंस पार्क के पास';
    }
  }

  // 4. Extract Configuration (BHK / Rooms)
  let config = '2BHK';
  if (category === 'दुकान') {
    config = 'दुकान (Shop)';
  } else {
    const configsFound: string[] = [];
    if (/1\s*room\s*\+\s*kitchen|1room\+kitchen|1\s*कमरा\s*रसोई/i.test(text)) configsFound.push('1 room+kitchen');
    if (/2\s*room\s*\+\s*kitchen|2room\+kitchen/i.test(text)) configsFound.push('2 room+kitchen');
    if (/पूरा\s*मकान|सेपरेट\s*मकान|स्वतंत्र\s*मकान/i.test(text)) configsFound.push('पूरा मकान सेपरेट');
    if (/4\s*bhk/i.test(text)) configsFound.push('4BHK');
    if (/3\s*bhk/i.test(text)) configsFound.push('3BHK');
    if (/2\s*bhk/i.test(text)) configsFound.push('2BHK');
    if (/1\s*bhk/i.test(text)) configsFound.push('1BHK');
    if (/1\s*rk/i.test(text)) configsFound.push('1RK');
    if (/1\s*room\b|सिंगल\s*रूम/i.test(text) && !configsFound.includes('1 room+kitchen')) configsFound.push('1 Room');

    if (configsFound.length > 0) {
      config = configsFound.slice(0, 2).join(' / ');
      if (config.length > 28) {
        config = configsFound[0];
      }
    }
  }

  // 5. Floor description
  let floor = 'ग्राउंड फ्लोर';
  if (category === 'दुकान') {
    floor = 'ग्राउंड फ्लोर शटर';
  } else if (lower.includes('ग्राउंड फ्लोर') || lower.includes('ground floor')) {
    floor = 'ग्राउंड फ्लोर';
  } else if (lower.includes('1st') || lower.includes('फर्स्ट') || lower.includes('पहली मंजिल')) {
    floor = '1st फ्लोर';
  } else if (lower.includes('2nd') || lower.includes('सेकंड') || lower.includes('दूसरी मंजिल')) {
    floor = '2nd फ्लोर';
  } else if (lower.includes('पूरा मकान') || lower.includes('स्वतंत्र')) {
    floor = 'स्वतंत्र मकान (सेपरेट)';
  }

  // 6. Rent / Budget / Price
  let rent = 0;
  const rentMatch = text.match(/(?:किराया|रेंट|बजट|राशि|मूल्य|कीमत|rent|price|budget|rs|inr|₹)[\s:.-]*(\d+)/i);
  if (rentMatch && rentMatch[1]) {
    rent = parseInt(rentMatch[1], 10);
  }

  let priceType = 'प्रति माह';
  if (category === 'गिरवी मकान') priceType = 'गिरवी राशि';
  else if (category === 'मकान बेचना है') priceType = 'बिक्री मूल्य';

  // 7. Amenities / Features Detection
  const features: string[] = [];
  if (/कार\s*पार्किंग|car\s*parking/i.test(text)) features.push('कार पार्किंग स्पेस उपलब्ध');
  if (/बाइक\s*पार्किंग|bike\s*parking|two\s*wheeler/i.test(text)) features.push('बाइक पार्किंग स्पेस उपलब्ध');
  if (/टेरिस|छत|terrace/i.test(text)) features.push('टेरिस उपलब्ध');
  if (/24\s*(?:ऑवर|घंटे)?\s*वाटर|24\s*hour\s*water|पानी|नल/i.test(text)) features.push('24 ऑवर वाटर');
  if (/नगर\s*पालिका|नर्मदा/i.test(text)) features.push('नगर पालिका नल कनेक्शन');
  if (/बोरवेल|बोर/i.test(text)) features.push('बोरवेल');
  if (/सेपरेट\s*(?:बिजली|इलेक्ट्रिक)?\s*मीटर|separate\s*meter/i.test(text)) features.push('सेपरेट बिजली मीटर');
  if (/सब\s*मीटर|sub\s*meter/i.test(text)) features.push('सब मीटर');
  if (/पालतू\s*जानवर|डॉग|कैट|pet|कुत्ता|बिल्ली/i.test(text)) features.push('पेट फ्रेंडली (पालतू जानवर)');
  if (/सीसीटीवी|cctv|कैमरा/i.test(text)) features.push('सीसीटीवी कैमरे उपलब्ध');
  if (/बालकनी|balcony/i.test(text)) features.push('बालकनी उपलब्ध');
  if (/मॉडुलर\s*किचन|modular\s*kitchen/i.test(text)) features.push('मॉडुलर किचन उपलब्ध');
  if (/फर्नीश्ड|furnished/i.test(text)) {
    if (/सेमी|semi/i.test(text)) features.push('सेमी फर्नीश्ड मकान उपलब्ध');
    else features.push('फर्नीश्ड मकान उपलब्ध');
  }
  if (/मंदिर\s*(?:के\s*)?पास|मंदिर\s*निकट|temple/i.test(text)) features.push('मंदिर निकट');
  if (/गार्डन|बगीचा|garden/i.test(text)) features.push('गार्डन लोकेशन मकान');
  if (/मेन\s*रोड|main\s*road/i.test(text)) features.push('मेन रोड फेसिंग मकान');
  if (/साइज|sqft|स्क्वायर\s*फीट/i.test(text)) {
    const sizeMatch = text.match(/(?:साइज|size)[\s:.-]*([0-9a-zA-Z\s.]+)/i);
    if (sizeMatch && sizeMatch[1]) {
      features.push(`साइज: ${sizeMatch[1].trim().slice(0, 15)}`);
    }
  }

  // 8. House / Reference Identifier
  let houseNumber = isSeeker ? 'किराएदार (वांछित मकान)' : (category === 'दुकान' ? 'दुकान' : 'H.N. -');
  const hnMatch = text.match(/(?:h\.?n\.?|मकान\s*नं(?:बर)?\.?|दुकान\s*नं(?:बर)?\.?|house\s*no\.?|plot\s*no\.?)[\s:.-]*([a-zA-Z0-9\/-]+)/i);
  if (hnMatch && hnMatch[1]) {
    houseNumber = hnMatch[1];
  }

  // 9. Formulate Clear Headline Title (Under 140 chars for firestore rule validation)
  const areaPart = detectedColonyLabel || matchedColony.split(' ')[0];
  const title = `[${adPurpose.split('(')[0].trim()}] ${config} - ${areaPart}`.slice(0, 140);

  // 10. Description: Keep full original text typed by user so nothing is omitted
  const description = text;

  return {
    category,
    adPurpose,
    isSeeker,
    colony: matchedColony,
    landmark,
    config,
    floor,
    rent,
    priceType,
    contactNumber: finalContact,
    whatsappNumber: finalWa,
    features,
    title,
    description,
    houseNumber
  };
}

export const SAMPLE_USER_AD = `नीमच म. प्र.
मकान किराए से चाहिए 
1room /1 room+kitchen /2 room + kitchen / 1BHK / 2BHK / 3BHK / 4 BHK / पूरा मकान सेपरेट 
लोकेशन :- टीचर कालोनी  LIC चौराहे के आस पास,
सम्पर्क :- 1234567890
अन्य सुविधाए :- अगर कुछ और चाहिए तो जैसे कार पार्किंग, बाइक पार्किंग, टेरिस, 24 ऑवर वाटर, सेपरेट इलेक्ट्रिक मीटर, पालतू जानवर डॉग/ कैट भी हे, सीसीटीवी चाहिए,`;
