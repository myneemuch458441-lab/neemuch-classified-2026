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
  priceDisplay: string;
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

  // Gokul Dham Colony
  { regex: /(?:गोकुल\s*धाम(?:\s*(?:कालोनी|कॉलोनी))?|gokul\s*dham)/i, value: 'गोकुल धाम कॉलोनी (Gokul Dham)', label: 'गोकुल धाम' },

  // Bhagwanpura
  { regex: /(?:भगवान\s*पुरा|भगवानपुरा|bhagwanpura)/i, value: 'भगवानपुरा (Bhagwanpura)', label: 'भगवानपुरा' },

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

  // Teacher's / Shikshak Colony (ONLY when explicitly written - supports टीचर/टिचर्स)
  { regex: /(?:टिचर्स?\s*(?:कालोनी|कॉलोनी|नगर)?|टीचर्स?\s*(?:कालोनी|कॉलोनी|नगर)?|शिक्षक\s*(?:कालोनी|कॉलोनी|नगर)?|teacher(?:'s)?\s*colony)/i, value: 'शिक्षक कालोनी (Teacher\'s Colony)', label: 'शिक्षक कालोनी' },

  // Jawahar Nagar
  { regex: /(?:जवाहर\s*नगर|jawahar\s*nagar)/i, value: 'जवाहर नगर (Jawahar Nagar)', label: 'जवाहर नगर' },

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

  // Tilak Nagar
  { regex: /(?:तिलक\s*नगर|tilak\s*nagar)/i, value: 'तिलक नगर (Tilak Nagar)', label: 'तिलक नगर' },

  // Gyan Mandir Road
  { regex: /(?:ज्ञान\s*मंदिर\s*(?:रोड)?|gyan\s*mandir)/i, value: 'ज्ञान मंदिर रोड (Gyan Mandir Road)', label: 'ज्ञान मंदिर रोड' },

  // Ram Nagar & Indira Nagar
  { regex: /(?:राम\s*नगर|ram\s*nagar)/i, value: 'राम नगर (Ram Nagar)', label: 'राम नगर' },
  { regex: /(?:इंदिरा\s*नगर|indira\s*nagar)/i, value: 'इंदिरा नगर (Indira Nagar)', label: 'इंदिरा नगर' },

  // Neemuch City
  { regex: /(?:नीमच\s*सिटी|neemuch\s*city|सिटी\s*थाना)/i, value: 'नीमच सिटी (Neemuch City)', label: 'नीमच सिटी' },

  // Kanawati Road
  { regex: /(?:कनावटी\s*रोड|kanawati)/i, value: 'कनावटी रोड (Kanawati Road)', label: 'कनावटी रोड' },

  // Moolchand Marg, Book Bazar, Station Road, Fawara Chowk, Vijay Talkies, Gwal Toli, CRPF
  { regex: /(?:मूलचंद\s*मार्ग|moolchand)/i, value: 'मूलचंद मार्ग (Moolchand Marg)', label: 'मूलचंद मार्ग' },
  { regex: /(?:पुस्तक\s*बाजार|pustak\s*bazar)/i, value: 'पुस्तक बाजार (Pustak Bazar)', label: 'पुस्तक बाजार' },
  { regex: /(?:स्टेशन\s*रोड|station\s*road)/i, value: 'स्टेशन रोड (Station Road)', label: 'स्टेशन रोड' },
  { regex: /(?:फव्वारा\s*चौक|fawara\s*chowk)/i, value: 'फव्वारा चौक (Fawara Chowk)', label: 'फव्वारा चौक' },
  { regex: /(?:विजय\s*टॉकीज|vijay\s*talkies)/i, value: 'विजय टॉकीज चौराहा (Vijay Talkies)', label: 'विजय टॉकीज' },
  { regex: /(?:ग्वालटोली|ग्वाल\s*टोली|gwaltoli)/i, value: 'ग्वालटोली (Gwaltoli)', label: 'ग्वालटोली' },
  { regex: /(?:सीआरपीएफ|crpf|बंगला\s*(?:नं|नंबर))/i, value: 'सीआरपीएफ रोड / बंगला क्षेत्र', label: 'सीआरपीएफ क्षेत्र' }
];

export function parsePastedAdText(rawText: string): ParsedAdResult {
  const text = (rawText || '').trim();
  const normalizedText = text.replace(/\s+/g, ' ');
  const lower = normalizedText.toLowerCase();

  // 1. Detect Category & Purpose (Seeker vs Owner)
  let category: ListingCategory = 'मकान किराए हेतु';
  let adPurpose = 'मकान किराए से चाहिए (किराएदार)';
  let isSeeker = true;

  const needWordRegex = /(?:चाहिए|चाहिये|चाहीए|चहिये|चहिए|चहिएं|जरूरत|आवश्यकता)/i;

  const isRentSeeker =
    needWordRegex.test(normalizedText) ||
    lower.includes('किराएदार') ||
    lower.includes('need house') ||
    lower.includes('want rent') ||
    lower.includes('tenant');

  const isRentOwner =
    lower.includes('किराए से देना') ||
    lower.includes('किराये से देना') ||
    lower.includes('किराए पर देना') ||
    lower.includes('किराये पर देना') ||
    lower.includes('खाली है') ||
    lower.includes('उपलब्ध है') ||
    lower.includes('to let') ||
    lower.includes('मकान मालिक');

  const isGirviSeeker =
    /(?:गिरवी.*(?:चाहिए|चाहिये|चाहीए|चहिये|चहिए|लेना\s*है)|(?:चाहिए|चहिये).*गिरवी)/i.test(normalizedText);

  const isGirviOwner =
    lower.includes('गिरवी देना') ||
    lower.includes('गिरवी पर देना') ||
    (lower.includes('गिरवी') && !isGirviSeeker);

  const isCommercialKeyword =
    lower.includes('दुकान') ||
    lower.includes('शोरूम') ||
    lower.includes('गोडाउन') ||
    lower.includes('गोदाम') ||
    lower.includes('godown') ||
    lower.includes('warehouse') ||
    lower.includes('ऑफिस स्पेस') ||
    lower.includes('office space');

  const isShopSeeker =
    /(?:दुकान.*(?:चाहिए|चाहिये|चहिये|चहिए)|shop\s*need)/i.test(normalizedText) ||
    (isCommercialKeyword && isRentSeeker);

  const isShopOwner =
    lower.includes('दुकान किराए से देना') ||
    lower.includes('दुकान देना है') ||
    lower.includes('दुकान खाली') ||
    lower.includes('दुकान बेचना') ||
    lower.includes('shop for rent') ||
    (isCommercialKeyword && !isShopSeeker);

  const isBuySeeker =
    lower.includes('मकान खरीदना') ||
    lower.includes('मकान ख़रीदना') ||
    lower.includes('घर खरीदना') ||
    lower.includes('फ्लैट खरीदना') ||
    lower.includes('फ्लेट खरीदना') ||
    lower.includes('खरीदना है') ||
    lower.includes('ख़रीदना है') ||
    lower.includes('प्लॉट खरीदना') ||
    lower.includes('plot खरीदना') ||
    lower.includes('want to buy') ||
    lower.includes('looking to buy');

  const isSaleOwner =
    lower.includes('मकान बेचना') ||
    lower.includes('फ्लैट बेचना') ||
    lower.includes('फ्लेट बेचना') ||
    lower.includes('बेचना है') ||
    lower.includes('बिकाऊ') ||
    lower.includes('फॉर सेल') ||
    lower.includes('for sale') ||
    lower.includes('sell');

  if (isBuySeeker) {
    category = 'मकान खरीदना है';
    adPurpose = 'मकान खरीदना है (खरीदार)';
    isSeeker = true;
  } else if (isSaleOwner) {
    category = 'मकान बेचना है';
    adPurpose = 'मकान बेचना है (विक्रेता)';
    isSeeker = false;
  } else if (isShopSeeker || isShopOwner) {
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
  } else {
    category = 'मकान किराए हेतु';
    if (isRentOwner && !isRentSeeker) {
      adPurpose = 'मकान किराए से देना है (मकान मालिक)';
      isSeeker = false;
    } else if (isRentSeeker) {
      adPurpose = 'मकान किराए से चाहिए (किराएदार)';
      isSeeker = true;
    } else {
      adPurpose = 'मकान किराए से देना है (मकान मालिक)';
      isSeeker = false;
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

  // Step 3A: Check explicit address / location label on the SAME line (never swallow newlines!)
  const addressLineMatch = text.match(/(?:^|\n)[ \t]*(?:एड्रेस|एड्रैस|ऐड्रेस|address|लोकेशन|location|स्थान|पता|एरिया|area|जगह)[ \t]*[:.\-–=]*[ \t]*([^\n]+)/i);

  if (addressLineMatch && addressLineMatch[1]) {
    // Strip trailing budget/rent/note/contact clauses from location line
    const rawLoc = addressLineMatch[1]
      .replace(/[,\s]*(?:बजट|किराया|रेंट|मूल्य|कीमत|डिमांड|विशेष\s*नोट|नोट|सम्पर्क|संपर्क|मोबाइल|फोन|contact|budget|rent|price).*$/i, '')
      .trim()
      .replace(/[,.\s]+$/, '');

    for (const cp of NEEMUCH_LOCALITY_PATTERNS) {
      if (cp.regex.test(rawLoc)) {
        matchedColony = cp.value;
        detectedColonyLabel = cp.label;
        landmark = rawLoc;
        break;
      }
    }

    if (!matchedColony && rawLoc) {
      const cleanedArea = rawLoc.replace(/\s*(?:के\s*(?:आस\s*)?पास|के\s*सामने|के\s*पीछे|निकट|near).*$/i, '').trim();
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

  // Step 3B: Scan full normalized text (handles line breaks inside locality names like "भगवानपुरा\nचौराहा")
  if (!matchedColony) {
    for (const cp of NEEMUCH_LOCALITY_PATTERNS) {
      if (cp.regex.test(normalizedText)) {
        matchedColony = cp.value;
        detectedColonyLabel = cp.label;
        break;
      }
    }
  }

  // Step 3C: Dynamic pattern match for any custom "... नगर", "... कालोनी", "... रोड", "... मार्ग", "... चौराहा", "... पुरा"
  if (!matchedColony) {
    const genericAreaMatch = normalizedText.match(/([A-Za-z\u0900-\u097F0-9\s]{2,22}(?:नगर\s*विस्तार|नगर|कालोनी|कॉलोनी|रोड|मार्ग|विस्तार|क्षेत्र|चौराहा))/i);
    if (genericAreaMatch && genericAreaMatch[1]) {
      const found = genericAreaMatch[1].trim();
      matchedColony = found;
      detectedColonyLabel = found;
    }
  }

  // Step 3D: Final fallback
  if (!matchedColony) {
    matchedColony = 'नीमच शहर (Neemuch City)';
    detectedColonyLabel = 'नीमच शहर';
  }

  // Landmark detection from text if not already captured
  if (!landmark) {
    const cleanTextForLandmark = normalizedText
      .replace(/(?:सम्पर्क|संपर्क|मोबाइल|फोन|कांटेक्ट|contact|phone|mob|whatsapp)\s*[:\-–=]*.*$/i, '')
      .trim();
    const landmarkPhraseMatch = cleanTextForLandmark.match(
      /([^,।\n]{2,45}(?:के\s*(?:आस\s*)?पास|के\s*सामने|के\s*पीछे|निकट|चौराहा|हॉस्टल|मंदिर|पार्क|स्कूल|चौक)(?:\s*,\s*[^,।\n]{2,45}(?:के\s*(?:आस\s*)?पास|के\s*सामने|के\s*पीछे|निकट|चौराहा|हॉस्टल|मंदिर|पार्क|स्कूल|चौक))?)/i
    );
    if (landmarkPhraseMatch && landmarkPhraseMatch[1]) {
      landmark = landmarkPhraseMatch[1].trim().replace(/^[,.\s]+|[,.\s]+$/g, '');
    } else if (lower.includes('lic') || lower.includes('एलआईसी')) {
      landmark = 'LIC चौराहे के आस पास';
    } else if (lower.includes('फव्वारा')) {
      landmark = 'फव्वारा चौक के पास';
    } else if (lower.includes('फोर जीरो') || lower.includes('40 चौराहा')) {
      landmark = 'फोर जीरो चौराहे के पास';
    } else if (lower.includes('लायंस पार्क') || lower.includes('lions park')) {
      landmark = 'लायंस पार्क के पास';
    }
  }

  // 4. Extract Configuration accurately (checking specific Hindi & English patterns first)
  let config = '';

  // Commercial / Godown / Office / Tower / Multi-floor patterns first
  if (/मल्टी\s*फ्लोर\s*(?:गोडाउन|गोदाम)|multi\s*floor\s*(?:godown|warehouse)/i.test(normalizedText)) {
    config = 'मल्टी फ्लोर गोडाउन';
  } else if (/गोडाउन|गोदाम|godown|warehouse/i.test(normalizedText)) {
    config = 'गोडाउन';
  } else if (/(?:बड़ा|बड़ा|big|large)\s*(?:हॉल|हाल)\s*(?:दुकान|व्यापार|कमर्शियल)?|दुकान\s*के\s*लिए\s*(?:बड़ा|बड़ा)?\s*(?:हॉल|हाल)/i.test(normalizedText)) {
    config = 'बड़ा हॉल दुकान के लिए';
  } else if (/ऑफिस\s*स्पेस|office\s*space|ऑफिस\s*(?:हेतु|के\s*लिए|किराए)/i.test(normalizedText)) {
    config = 'ऑफिस स्पेस';
  } else if (category === 'दुकान' && /(?:1st|फर्स्ट|पहली\s*मंजिल|first\s*floor)/i.test(normalizedText)) {
    config = 'दुकान 1st फ्लोर';
  } else if (category === 'दुकान' && /(?:ग्राउंड\s*फ्लोर|ground\s*floor|नीचे)/i.test(normalizedText)) {
    config = 'दुकान ग्राउंड फ्लोर';
  } else if (category === 'दुकान') {
    config = 'दुकान ग्राउंड फ्लोर';
  } else if (/टावर\s*(?:मे|में)?\s*(?:फ्लेट|फ्लैट)|tower\s*flat/i.test(normalizedText)) {
    config = 'टावर मे फ्लेट';
  } else if (/मल्टी\s*(?:मे|में)?\s*(?:फ्लेट|फ्लैट)|multi\s*flat/i.test(normalizedText)) {
    config = 'मल्टी मे फ्लेट';
  } else {
    // Check Hall + Attach Kitchen BEFORE generic rooms or BHK!
    const configsFound: string[] = [];

    if (/(?<!\d)(?:1|एक|वन|सिंगल|one|single|ek)\s*(?:हॉल|हाल|hall|haal|hal)\s*(?:अटैच|attach(?:ed)?|विथ|with|सहित|\+|और)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen|kitchn)|(?:हॉल|हाल|hall|haal)\s*(?:अटैच|attach(?:ed)?)\s*(?:किचन|रसोई|kitchen|kitchan|kichen)/i.test(normalizedText)) {
      configsFound.push('एक हॉल अटैच किचन');
    } else if (/(?<!\d)(?:1|एक|वन|सिंगल|one|single|ek)\s*(?:हॉल|हाल|hall|haal|hal)(?![a-zA-Z\u0900-\u097F])/i.test(normalizedText)) {
      configsFound.push('एक हॉल');
    }

    if (/(?<!\d)(?:4|चार|four|char)\s*(?:कमरे|कमरा|रूम|rooms?|kamre|kamra)\s*(?:\+|अटैच|विथ|with|और|सहित)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen)/i.test(normalizedText)) {
      configsFound.push('4 कमरे किचन');
    }
    if (/(?<!\d)(?:3|तीन|three|teen)\s*(?:कमरे|कमरा|रूम|rooms?|kamre|kamra)\s*(?:\+|अटैच|विथ|with|और|सहित)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen)/i.test(normalizedText)) {
      configsFound.push('3 कमरे किचन');
    }
    if (/(?<!\d)(?:2|दो|two|do)\s*(?:कमरे|कमरा|रूम|rooms?|kamre|kamra)\s*(?:\+|अटैच|विथ|with|और|सहित)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen)/i.test(normalizedText)) {
      configsFound.push('2 कमरे किचन');
    }
    if (/(?<!\d)(?:1|एक|वन|सिंगल|one|single|ek)\s*(?:कमरा|कमरे|रूम|room|kamra|rm)\s*(?:\+|अटैच|विथ|with|और|सहित)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen)|(?<!\d)1\s*rk(?![a-zA-Z0-9])/i.test(normalizedText)) {
      configsFound.push('एक कमरा किचन');
    }
    if (/(?<!\d)5\s*(?:bhk|बीएचके)/i.test(normalizedText)) configsFound.push('5BHK');
    if (/(?<!\d)4\s*(?:bhk|बीएचके)/i.test(normalizedText)) configsFound.push('4BHK');
    if (/(?<!\d)3\s*(?:bhk|बीएचके)/i.test(normalizedText)) configsFound.push('3BHK');
    if (/(?<!\d)2\s*(?:bhk|बीएचके)/i.test(normalizedText)) configsFound.push('2BHK');
    if (/(?<!\d)1\s*(?:bhk|बीएचके)/i.test(normalizedText)) configsFound.push('1BHK');
    if (
      (/(?<!\d)(?:1|एक|वन|सिंगल|one|single|ek)\s*(?:कमरा|रूम|room|kamra|rm)(?![a-zA-Z\u0900-\u097F])|(?<!\d)1\s*r(?![a-zA-Z0-9])/i.test(normalizedText)) &&
      !configsFound.includes('एक कमरा किचन')
    ) {
      configsFound.push('एक कमरा');
    }

    // Double / Triple story houses (e.g. "2 मंजिला मकान", "डबल स्टोरी")
    if (/(?<!\d)(?:3|तीन|ट्रिपल|triple)\s*(?:मंजिला|मंज़िला|मंजिल|मंज़िल|स्टोरी|story|storey)/i.test(normalizedText)) {
      configsFound.push('3 मंजिला मकान');
    } else if (/(?<!\d)(?:2|दो|डबल|double)\s*(?:मंजिला|मंज़िला|मंजिल|मंज़िल|स्टोरी|story|storey)/i.test(normalizedText)) {
      configsFound.push('2 मंजिला मकान');
    }

    if (/पूरा\s*मकान|सेपरेट\s*मकान|स्वतंत्र\s*मकान/i.test(normalizedText) && configsFound.length === 0) {
      configsFound.push('पूरा मकान सेपरेट');
    }

    if (configsFound.length === 1) {
      config = configsFound[0];
    } else if (configsFound.length > 1) {
      // If user pasted multiple options (e.g. seeker ad listing options), join up to 28 chars cleanly
      const joined = configsFound.slice(0, 2).join(' / ');
      config = joined.length <= 28 ? joined : configsFound[0];
    } else {
      // Check sqft range or area size (e.g. "1200 sqft. से 1400 sqft") BEFORE neutral fallback
      const sqftRangeMatch = normalizedText.match(
        /(\d{3,5})\s*(?:sqft|sq\.?\s*ft|वर्ग\s*फीट|स्क्वायर\s*फीट)?\.?\s*(?:से|to|[-–])\s*(\d{3,5})\s*(?:sqft|sq\.?\s*ft|वर्ग\s*फीट|स्क्वायर\s*फीट)/i
      );
      const sqftSingleMatch = normalizedText.match(/(\d{3,5})\s*(?:sqft|sq\.?\s*ft|वर्ग\s*फीट|स्क्वायर\s*फीट)/i);

      if (sqftRangeMatch) {
        config = `${sqftRangeMatch[1]}-${sqftRangeMatch[2]} sqft`;
      } else if (sqftSingleMatch) {
        config = `${sqftSingleMatch[1]} sqft`;
      } else if (/(?:3rd|थर्ड|तीसरी\s*मंजिल|तीसरा\s*फ्लोर)/i.test(normalizedText)) {
        config = '3rd फ्लोर';
      } else if (/(?:2nd|सेकंड|दूसरी\s*मंजिल|दूसरा\s*फ्लोर)/i.test(normalizedText)) {
        config = '2nd फ्लोर';
      } else if (/(?:1st|फर्स्ट|पहली\s*मंजिल|पहला\s*फ्लोर)/i.test(normalizedText)) {
        config = '1st फ्लोर';
      } else if (/(?:ग्राउंड\s*फ्लोर|ground\s*floor)/i.test(normalizedText)) {
        config = 'ग्राउंड फ्लोर';
      } else {
        // Zero-hallucination neutral fallback: NEVER invent 2BHK or एक कमरा if not mentioned!
        config = 'विवरण अनुसार';
      }
    }
  }

  // 5. Floor description (ONLY populate if explicitly mentioned — never invent 'ग्राउंड फ्लोर')
  let floor = '';
  if (category === 'दुकान') {
    if (/(?:1st|फर्स्ट|पहली\s*मंजिल|first\s*floor)/i.test(normalizedText)) {
      floor = '1st फ्लोर';
    } else if (/मल्टी\s*फ्लोर/i.test(normalizedText)) {
      floor = 'मल्टी फ्लोर';
    } else if (/ग्राउंड\s*फ्लोर|ground\s*floor|शटर/i.test(normalizedText)) {
      floor = 'ग्राउंड फ्लोर शटर';
    }
  } else if (/(?:3|तीन|ट्रिपल|triple)\s*(?:मंजिला|मंज़िला|मंजिल|मंज़िल|स्टोरी|story|storey)/i.test(normalizedText)) {
    floor = '3 मंजिला';
  } else if (/(?:2|दो|डबल|double)\s*(?:मंजिला|मंज़िला|मंजिल|मंज़िल|स्टोरी|story|storey)/i.test(normalizedText)) {
    floor = 'डबल स्टोरी (2 मंजिला)';
  } else if (/(?:3rd|थर्ड|तीसरी\s*मंजिल|तीसरा\s*फ्लोर)/i.test(normalizedText)) {
    floor = '3rd फ्लोर';
  } else if (/(?:2nd|सेकंड|दूसरी\s*मंजिल|दूसरा\s*फ्लोर)/i.test(normalizedText)) {
    floor = '2nd फ्लोर';
  } else if (/(?:1st|फर्स्ट|पहली\s*मंजिल|पहला\s*फ्लोर)/i.test(normalizedText)) {
    floor = '1st फ्लोर';
  } else if (/(?:ग्राउंड\s*फ्लोर|ground\s*floor)/i.test(normalizedText)) {
    floor = 'ग्राउंड फ्लोर';
  } else if (lower.includes('पूरा मकान') || lower.includes('स्वतंत्र')) {
    floor = 'स्वतंत्र मकान (सेपरेट)';
  }

  // 6. Rent / Budget / Price (supports ranges like "28 से 30 लाख" or "28/30 लाख")
  let rent = 0;
  let priceDisplay = '';
  const priceMatch = normalizedText.match(
    /(?:किराया|रेंट|बजट|राशि|मूल्य|कीमत|डिमांड|demand|rent|price|budget|rs\.?|inr|₹)[\s:.\-–=]*(?:लगभग|करीब|approx|around|up\s*to)?\s*(\d+(?:\.\d+)?)\s*(?:(?:से|to|[-/–])\s*(\d+(?:\.\d+)?))?\s*(लाख|lakh|lac|हजार|thousand|k|करोड़|crore|cr)?/i
  );

  if (priceMatch && priceMatch[1]) {
    const num1 = parseFloat(priceMatch[1]);
    const num2 = priceMatch[2] ? parseFloat(priceMatch[2]) : null;
    const rawUnit = (priceMatch[3] || '').toLowerCase();

    let multiplier = 1;
    let displayUnit = '';
    if (/लाख|lakh|lac/.test(rawUnit)) {
      multiplier = 100000;
      displayUnit = 'लाख';
    } else if (/करोड़|crore|cr/.test(rawUnit)) {
      multiplier = 10000000;
      displayUnit = 'करोड़';
    } else if (/हजार|thousand|^k$/.test(rawUnit)) {
      multiplier = 1000;
      displayUnit = 'हजार';
    }

    if (num1 > 0) {
      rent = Math.round(num1 * multiplier);
      if (num2 && num2 > 0) {
        priceDisplay = displayUnit ? `₹${num1}-${num2} ${displayUnit}` : `₹${num1}-${num2}`;
      } else if (displayUnit) {
        priceDisplay = `₹${num1} ${displayUnit}`;
      }
    }
  }

  let priceType = 'प्रति माह';
  const mentionsBudget = /बजट|budget/i.test(normalizedText);
  if (category === 'मकान खरीदना है' || (isBuySeeker && mentionsBudget)) {
    priceType = 'बजट';
  } else if (category === 'गिरवी मकान') {
    priceType = isSeeker && mentionsBudget ? 'गिरवी बजट' : 'गिरवी राशि';
  } else if (category === 'मकान बेचना है') {
    priceType = mentionsBudget ? 'बजट' : 'बिक्री मूल्य';
  } else if (isSeeker && mentionsBudget) {
    priceType = 'किराया बजट';
  }

  // 7. Amenities / Features Detection (supporting Hindi spelling variants)
  const features: string[] = [];
  if (/कार\s*पार्किंग|car\s*parking/i.test(normalizedText)) features.push('कार पार्किंग स्पेस उपलब्ध');
  if (/बाइक\s*पार्किंग|bike\s*parking|two\s*wheeler/i.test(normalizedText)) features.push('बाइक पार्किंग स्पेस उपलब्ध');
  if (/टेरिस|छत|terrace/i.test(normalizedText)) features.push('टेरिस उपलब्ध');
  if (/24\s*(?:ऑवर|घंटे)?\s*(?:वाटर|पानी)|24\s*hour\s*water|पानी\s*की\s*सुविधा|नल/i.test(normalizedText)) features.push('24 ऑवर वाटर');
  if (/नगर\s*पालिका|नर्मदा/i.test(normalizedText)) features.push('नगर पालिका नल कनेक्शन');
  if (/बोरवेल|बोर/i.test(normalizedText)) features.push('बोरवेल');
  if (/सेपरेट\s*(?:बिजली|इलेक्ट्रिक)?\s*मीटर|separate\s*meter/i.test(normalizedText)) features.push('सेपरेट बिजली मीटर');
  if (/सब\s*मीटर|sub\s*meter/i.test(normalizedText)) features.push('सब मीटर');
  if (/पालतू\s*जानवर|डॉग|कैट|pet|कुत्ता|बिल्ली/i.test(normalizedText)) features.push('पेट फ्रेंडली (पालतू जानवर)');
  if (/सीसीटीवी|cctv|कैमरा/i.test(normalizedText)) features.push('सीसीटीवी कैमरे उपलब्ध');
  if (/बालकनी|balcony/i.test(normalizedText)) features.push('बालकनी उपलब्ध');
  if (/मॉडुलर\s*किचन|modular\s*kitchen/i.test(normalizedText)) features.push('मॉडुलर किचन उपलब्ध');
  if (/फर्नीश्ड|फर्निश्ड|फर्नीचर|फर्निचर|furnished/i.test(normalizedText)) {
    if (/सेमी|semi/i.test(normalizedText)) features.push('सेमी फर्नीश्ड मकान उपलब्ध');
    else features.push('फर्नीश्ड मकान उपलब्ध');
  }
  if (/लेट्रिन[\s-]*बाथ|लैट्रिन[\s-]*बाथ|लेट[\s-]*बाथ|लैट[\s-]*बाथ|बाथरूम|toilet|washroom/i.test(normalizedText)) {
    features.push('अटैच लेट-बाथ');
  }
  if (/मंदिर\s*(?:के\s*)?पास|मंदिर\s*निकट|temple/i.test(normalizedText)) features.push('मंदिर निकट');
  if (/गार्डन|बगीचा|garden/i.test(normalizedText)) features.push('गार्डन लोकेशन मकान');
  if (/मेन\s*रोड|main\s*road/i.test(normalizedText)) features.push('मेन रोड फेसिंग मकान');

  const sqftFeatureRange = normalizedText.match(
    /(\d{3,5})\s*(?:sqft|sq\.?\s*ft|वर्ग\s*फीट|स्क्वायर\s*फीट)?\.?\s*(?:से|to|[-–])\s*(\d{3,5})\s*(?:sqft|sq\.?\s*ft|वर्ग\s*फीट|स्क्वायर\s*फीट)/i
  );
  const sqftFeatureSingle = normalizedText.match(/(\d{3,5})\s*(?:sqft|sq\.?\s*ft|वर्ग\s*फीट|स्क्वायर\s*फीट)/i);
  if (sqftFeatureRange) {
    features.push(`साइज: ${sqftFeatureRange[1]}-${sqftFeatureRange[2]} sqft`);
  } else if (sqftFeatureSingle) {
    features.push(`साइज: ${sqftFeatureSingle[1]} sqft`);
  }

  // 8. House / Reference Identifier (never use "वांछित")
  let houseNumber =
    category === 'मकान खरीदना है'
      ? 'खरीदार हेतु'
      : isSeeker
      ? 'किराएदार हेतु'
      : category === 'दुकान'
      ? 'दुकान'
      : 'H.N. -';
  const hnMatch = text.match(/(?:h\.?n\.?|मकान\s*नं(?:बर)?\.?|दुकान\s*नं(?:बर)?\.?|house\s*no\.?|plot\s*no\.?)[\s:.-]*([a-zA-Z0-9\/-]+)/i);
  if (hnMatch && hnMatch[1]) {
    houseNumber = hnMatch[1];
  }

  // 9. Formulate Clear Headline Title (Under 140 chars for firestore rule validation)
  const areaPart = detectedColonyLabel || matchedColony.split(' ')[0];
  const configPart = config && config !== 'विवरण अनुसार' ? ` ${config}` : '';
  const title = `[${adPurpose.split('(')[0].trim()}]${configPart} - ${areaPart}`.slice(0, 140);

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
    priceDisplay,
    priceType,
    contactNumber: finalContact,
    whatsappNumber: finalWa,
    features,
    title,
    description,
    houseNumber
  };
}

/**
 * Smart matching helper for FilterBar configuration filters.
 * Matches exact config, synonyms (e.g. 1R -> एक कमरा, 1RK -> एक कमरा किचन),
 * floor keywords, and keywords inside title/description so AI-parsed & user-edited ads match seamlessly.
 */
export function matchesConfigFilter(item: Property, selectedConfig: string): boolean {
  if (!selectedConfig || selectedConfig === 'All') return true;

  const target = selectedConfig.toLowerCase().trim();
  const itemConfig = (item.config || '').toLowerCase().trim();
  const itemFloor = (item.floor || '').toLowerCase().trim();
  const itemCat = (item.listingCategory || '').toLowerCase().trim();
  const itemPurpose = (item.adPurpose || '').toLowerCase().trim();
  const itemTags = Array.isArray(item.aiTags) ? item.aiTags.join(' ').toLowerCase() : '';
  const itemFeatures = Array.isArray(item.features) ? item.features.join(' ').toLowerCase() : '';

  const combined = `${itemConfig} ${itemFloor} ${itemCat} ${itemPurpose} ${(item.title || '').toLowerCase()} ${(item.description || '').toLowerCase()} ${itemTags} ${itemFeatures}`.replace(/\s+/g, ' ');

  if (itemConfig === target) return true;

  switch (selectedConfig) {
    case 'एक कमरा':
      return (
        itemConfig === '1r' ||
        itemConfig === '1 room' ||
        (itemConfig.includes('एक कमरा') && !/(?:किचन|kitchen|kitchan|kichen)/i.test(itemConfig)) ||
        /(?<!\d)(?:एक|1|वन|सिंगल|one|single|ek)\s*(?:कमरा|रूम|room|kamra|rm)(?![a-zA-Z\u0900-\u097F]|\s*(?:\+|विथ|with|सहित|और|अटैच|attach(?:ed)?)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen|kitchn))/i.test(combined) ||
        /(?<!\d)(?<!(?:दो|तीन|चार|पांच|2|3|4|5)\s*)(?:कमरा|रूम)\s*(?:किराए|किराये|खाली|उपलब्ध|चाहिए|चाहिये|चहिये|चहिए|देना|लेना|अटैच\s*(?:लेट|लैट|बाथ))/i.test(combined) ||
        /(?<!\d)1\s*r(?![a-zA-Z0-9])/i.test(itemConfig)
      );
    case 'एक कमरा किचन':
      return (
        itemConfig === '1rk' ||
        itemConfig.includes('1 room+kitchen') ||
        itemConfig.includes('एक कमरा किचन') ||
        /(?<!\d)(?:1|एक|वन|सिंगल|one|single|ek)\s*(?:कमरा|कमरे|रूम|room|kamra|rm)\s*(?:\+|विथ|with|और|सहित|अटैच|attach(?:ed)?)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen|kitchn)|(?<!\d)1\s*rk(?![a-zA-Z0-9])/i.test(combined)
      );
    case 'एक हॉल':
      return (
        itemConfig === 'एक हॉल' ||
        itemConfig === 'एक हाल' ||
        (!/(?:दुकान|shop|dukan)/i.test(itemConfig) &&
          /(?<!\d)(?:1|एक|वन|सिंगल|one|single|ek)\s*(?:हॉल|हाल|hall|haal|hal)(?![a-zA-Z\u0900-\u097F]|\s*(?:\+|विथ|with|सहित|और|अटैच|attach(?:ed)?)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen|kitchn))/i.test(combined))
      );
    case 'एक हॉल अटैच किचन':
      return (
        itemConfig.includes('एक हॉल अटैच किचन') ||
        itemConfig.includes('एक हाल किचन') ||
        /(?<!\d)(?:1|एक|वन|सिंगल|one|single|ek)\s*(?:हॉल|हाल|hall|haal|hal)\s*(?:\+|विथ|with|और|सहित|अटैच|attach(?:ed)?)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen|kitchn)|(?:हॉल|हाल|hall|haal)\s*(?:अटैच|attach(?:ed)?)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen|kitchn)/i.test(combined)
      );
    case '2 कमरे किचन':
      return (
        itemConfig.includes('2 कमरे किचन') ||
        itemConfig.includes('2 room+kitchen') ||
        /(?<!\d)(?:2|दो|two|do)\s*(?:कमरे|कमरा|रूम|rooms?|kamre|kamra)(?:\s*(?:\+|विथ|with|और|सहित|अटैच|attach(?:ed)?)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen|kitchn))(?![a-zA-Z0-9])/i.test(combined) ||
        /(?<!\d)(?:2|दो|two|do)\s*(?:कमरे|कमरा|रूम|rooms?|kamre)(?![a-zA-Z\u0900-\u097F]|\s*(?:मंजिल|स्टोरी|bhk))/i.test(combined)
      );
    case '3 कमरे किचन':
      return (
        itemConfig.includes('3 कमरे किचन') ||
        itemConfig.includes('3 room+kitchen') ||
        /(?<!\d)(?:3|तीन|three|teen)\s*(?:कमरे|कमरा|रूम|rooms?|kamre|kamra)(?:\s*(?:\+|विथ|with|और|सहित|अटैच|attach(?:ed)?)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen|kitchn))(?![a-zA-Z0-9])/i.test(combined) ||
        /(?<!\d)(?:3|तीन|three|teen)\s*(?:कमरे|कमरा|रूम|rooms?|kamre)(?![a-zA-Z\u0900-\u097F]|\s*(?:मंजिल|स्टोरी|bhk))/i.test(combined)
      );
    case '4 कमरे किचन':
      return (
        itemConfig.includes('4 कमरे किचन') ||
        itemConfig.includes('4 room+kitchen') ||
        /(?<!\d)(?:4|चार|four|char)\s*(?:कमरे|कमरा|रूम|rooms?|kamre|kamra)(?:\s*(?:\+|विथ|with|और|सहित|अटैच|attach(?:ed)?)?\s*(?:किचन|रसोई|kitchen|kitchan|kichen|kitchn))(?![a-zA-Z0-9])/i.test(combined) ||
        /(?<!\d)(?:4|चार|four|char)\s*(?:कमरे|कमरा|रूम|rooms?|kamre)(?![a-zA-Z\u0900-\u097F]|\s*(?:मंजिल|स्टोरी|bhk))/i.test(combined)
      );
    case '1BHK':
      return /(?<!\d)1\s*(?:bhk|बीएचके|बी\.एच\.के)/i.test(combined);
    case '2BHK':
      return /(?<!\d)2\s*(?:bhk|बीएचके|बी\.एच\.के)/i.test(combined);
    case '3BHK':
      return /(?<!\d)3\s*(?:bhk|बीएचके|बी\.एच\.के)/i.test(combined);
    case '4BHK':
      return /(?<!\d)4\s*(?:bhk|बीएचके|बी\.एच\.के)/i.test(combined);
    case '5BHK':
      return /(?<!\d)5\s*(?:bhk|बीएचके|बी\.एच\.के)/i.test(combined);
    case '2 मंजिला मकान':
      return /(?<!\d)(?:2|दो|डबल|double)\s*(?:मंजिला|मंज़िला|मंजिल|मंज़िल|स्टोरी|story|storey|manjil|manjila)/i.test(combined);
    case '3 मंजिला मकान':
      return /(?<!\d)(?:3|तीन|ट्रिपल|triple)\s*(?:मंजिला|मंज़िला|मंजिल|मंज़िल|स्टोरी|story|storey|manjil|manjila)/i.test(combined);
    case 'ग्राउंड फ्लोर':
      return /ग्राउंड\s*फ्लोर|ground\s*floor/i.test(combined);
    case '1st फ्लोर':
      return /(?<!\d)1st\s*(?:फ्लोर|floor)|फर्स्ट\s*फ्लोर|first\s*floor|पहली\s*मंजिल|पहला\s*फ्लोर/i.test(combined);
    case '2nd फ्लोर':
      return /(?<!\d)2nd\s*(?:फ्लोर|floor)|सेकंड\s*फ्लोर|सेकण्ड\s*फ्लोर|second\s*floor|दूसरी\s*मंजिल|दूसरा\s*फ्लोर/i.test(combined);
    case '3rd फ्लोर':
      return /(?<!\d)3rd\s*(?:फ्लोर|floor)|थर्ड\s*फ्लोर|third\s*floor|तीसरी\s*मंजिल|तीसरा\s*फ्लोर/i.test(combined);
    case 'ऑफिस स्पेस':
      return /ऑफिस|ऑफ़िस|office/i.test(combined);
    case 'दुकान ग्राउंड फ्लोर':
      return (
        itemConfig === 'दुकान ग्राउंड फ्लोर' ||
        ((itemCat === 'दुकान' || /दुकान|shop|dukan|शॉप/i.test(combined)) && /ग्राउंड\s*फ्लोर|ground\s*floor|शटर/i.test(combined))
      );
    case 'दुकान 1st फ्लोर':
      return (
        itemConfig === 'दुकान 1st फ्लोर' ||
        ((itemCat === 'दुकान' || /दुकान|shop|dukan|शॉप/i.test(combined)) && /(?<!\d)1st|फर्स्ट|first\s*floor|पहली\s*मंजिल/i.test(combined))
      );
    case 'बड़ा हॉल दुकान के लिए':
      return (
        itemConfig.includes('बड़ा हॉल दुकान') ||
        itemConfig.includes('बड़ा हॉल दुकान') ||
        /(?:बड़ा|बड़ा|big|large|विशाल)\s*(?:हॉल|हाल|hall|haal).*(?:दुकान|शोरूम|कमर्शियल|shop|dukan)|(?:दुकान|शोरूम|कमर्शियल|shop|dukan).*(?:हॉल|हाल|hall|haal)/i.test(combined)
      );
    case 'गोडाउन':
      return /गोडाउन|गोदाम|godown|warehouse/i.test(combined);
    case 'मल्टी फ्लोर गोडाउन':
      return /(?:मल्टी\s*(?:फ्लोर|मंजिल)|multi\s*floor).*(?:गोडाउन|गोदाम|godown|warehouse)|(?:गोडाउन|गोदाम|godown|warehouse).*(?:मल्टी|multi|फ्लोर|मंजिल)/i.test(combined);
    case 'मल्टी मे फ्लेट':
      return /मल्टी\s*(?:मे|में)?\s*(?:फ्लेट|फ्लैट|flat|flet)|multi\s*(?:me|mein)?\s*(?:flat|flet)/i.test(combined);
    case 'टावर मे फ्लेट':
      return /टावर\s*(?:मे|में)?\s*(?:फ्लेट|फ्लैट|flat|flet)|tower\s*(?:me|mein)?\s*(?:flat|flet)/i.test(combined);
    case 'दुकान (Shop)':
      return itemCat === 'दुकान' || /दुकान|shop|dukan|शॉप/i.test(combined);
    case 'कमर्शियल स्पेस':
      return itemCat === 'दुकान' || /कमर्शियल|कॉमरशियल|commercial|शोरूम|showroom|गोडाउन|गोदाम|ऑफिस|दुकान|shop|dukan/i.test(combined);
    default:
      return combined.includes(target);
  }
}

/**
 * Matches property against selected colonies by checking stored colony field
 * as well as Hindi/English locality aliases inside description/title/landmark
 * so As-It-Is raw ads mentioning multiple colonies match all relevant filters.
 */
export function matchesColonyFilter(item: Property, selectedColonies: string[]): boolean {
  if (!selectedColonies || selectedColonies.length === 0) return true;

  const itemColony = (item.colony || '').toLowerCase();
  const fullText = `${item.colony || ''} ${item.landmark || ''} ${item.title || ''} ${item.description || ''}`.toLowerCase();

  return selectedColonies.some((col) => {
    const colLower = col.toLowerCase();
    if (itemColony.includes(colLower) || colLower.includes(itemColony)) {
      return true;
    }

    const baseHindi = col.split('(')[0].trim().toLowerCase();
    if (baseHindi && fullText.includes(baseHindi)) {
      return true;
    }

    const engMatch = col.match(/\(([^)]+)\)/);
    if (engMatch && engMatch[1] && fullText.includes(engMatch[1].trim().toLowerCase())) {
      return true;
    }

    // Check rich alias patterns (e.g. टिचर्स -> शिक्षक कालोनी, इंदिरानगर -> इंदिरा नगर)
    const pattern = NEEMUCH_LOCALITY_PATTERNS.find((p) => p.value === col);
    if (pattern && pattern.regex.test(fullText)) {
      return true;
    }

    return false;
  });
}

/**
 * Matches free-text search queries across Hindi and Hinglish room/locality synonyms.
 */
export function matchesSearchQuery(item: Property, rawTerm: string): boolean {
  const term = (rawTerm || '').toLowerCase().trim();
  if (!term) return true;

  const haystack = [
    item.title,
    item.listingCategory,
    item.adPurpose,
    item.colony,
    item.houseNumber,
    item.config,
    item.floor,
    item.contactNumber,
    item.whatsappNumber,
    item.description,
    item.landmark,
    ...(Array.isArray(item.features) ? item.features : []),
    ...(Array.isArray(item.aiTags) ? item.aiTags : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (haystack.includes(term)) return true;

  // Cross-match common Hindi <-> English/Hinglish search terms
  if (/^(?:1\s*room|1\s*r|1\s*kamra|ek\s*kamra|एक\s*कमरा|1\s*कमरा|1\s*रूम|एक\s*रूम)$/i.test(term)) {
    return matchesConfigFilter(item, 'एक कमरा');
  }
  if (/^(?:1\s*rk|1\s*room\s*kitch[ae]n|एक\s*कमरा\s*किचन|1\s*रूम\s*किचन)$/i.test(term)) {
    return matchesConfigFilter(item, 'एक कमरा किचन');
  }
  if (/^(?:1\s*ha?al|1\s*hall|ek\s*ha?al|एक\s*ह[ॉा]ल)$/i.test(term)) {
    return matchesConfigFilter(item, 'एक हॉल');
  }
  if (/^(?:1\s*ha?al\s*kitch[ae]n|1\s*hall\s*kitch[ae]n|एक\s*ह[ॉा]ल\s*(?:अटैच\s*)?किचन)$/i.test(term)) {
    return matchesConfigFilter(item, 'एक हॉल अटैच किचन');
  }
  if (/^(?:2\s*room\s*kitch[ae]n|2\s*कमरे\s*किचन)$/i.test(term)) {
    return matchesConfigFilter(item, '2 कमरे किचन');
  }
  if (/^(?:3\s*room\s*kitch[ae]n|3\s*कमरे\s*किचन)$/i.test(term)) {
    return matchesConfigFilter(item, '3 कमरे किचन');
  }
  if (/^(?:4\s*room\s*kitch[ae]n|4\s*कमरे\s*किचन)$/i.test(term)) {
    return matchesConfigFilter(item, '4 कमरे किचन');
  }
  if (/^(?:shop|dukan|दुकान)$/i.test(term)) {
    return matchesConfigFilter(item, 'दुकान (Shop)');
  }
  if (/^(?:godown|गोडाउन|गोदाम)$/i.test(term)) {
    return matchesConfigFilter(item, 'गोडाउन');
  }
  if (/^(?:office|ऑफिस)$/i.test(term)) {
    return matchesConfigFilter(item, 'ऑफिस स्पेस');
  }

  return false;
}

export const SAMPLE_USER_AD = `नीमच म. प्र.
मकान किराए से चाहिए 
1room /1 room+kitchen /2 room + kitchen / 1BHK / 2BHK / 3BHK / 4 BHK / पूरा मकान सेपरेट 
लोकेशन :- टीचर कालोनी  LIC चौराहे के आस पास,
सम्पर्क :- 1234567890
अन्य सुविधाए :- अगर कुछ और चाहिए तो जैसे कार पार्किंग, बाइक पार्किंग, टेरिस, 24 ऑवर वाटर, सेपरेट इलेक्ट्रिक मीटर, पालतू जानवर डॉग/ कैट भी हे, सीसीटीवी चाहिए,`;
