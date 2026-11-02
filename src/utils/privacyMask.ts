/**
 * Privacy protection utility for Neemuch Classified.
 * Ensures owner phone numbers, WhatsApp numbers, and house numbers are strictly hidden/blurred
 * whenever a property is marked as 'booked' ('मकान बुक हो चुका').
 */

export function maskPhoneNumbers(text: string): string {
  if (!text) return '';
  let result = text;

  // 1. Remove/mask phrases like "संपर्क करें: 7999646575", "मो - 7725844143", "फोन: 98260...", "कॉल करें: ..."
  result = result.replace(
    /(?:संपर्क\s*(?:करें)?|कॉल\s*(?:करें)?|contact(?:\s*us)?|call|mobile|phone|मो\s*[-:]|फ़ोन|फोन|मोबाइल|व्हाट्सएप|whatsapp)\s*[:\-]?\s*(?:\+?91[\s-]?)?[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}/gi,
    '🔒 (संपर्क नंबर गोपनीय/हाइड है)'
  );

  // 2. Mask Indian mobile numbers (+91-98260XXXXX or 98260XXXXX or 7999646575)
  result = result.replace(
    /(?:\+?91[\s-]?)?[6-9]\d{9}\b/g,
    '••••••••••'
  );

  // 3. Mask any 10-digit number sequence
  result = result.replace(
    /\b\d{10}\b/g,
    '••••••••••'
  );

  // 4. Mask spaced out phone numbers (e.g. 98260 12345 or 79996 46575)
  result = result.replace(
    /\b[6-9]\d{4}\s+\d{5}\b/g,
    '••••••••••'
  );

  return result;
}

export function maskHouseNumber(text: string, houseNumber?: string): string {
  if (!text) return '';
  if (!houseNumber || houseNumber.trim().length <= 1 || houseNumber === 'H.N. -') {
    return text;
  }

  const trimmed = houseNumber.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '••••');
}

/**
 * Sanitizes any text string (title, description, landmark) when a property is booked.
 */
export function sanitizeTextForBookedProperty(
  text: string,
  isBooked: boolean,
  houseNumber?: string,
  contactNumber?: string,
  whatsappNumber?: string
): string {
  if (!text) return '';
  if (!isBooked) return text;

  let cleaned = text;

  // Mask exact known contact number
  if (contactNumber) {
    const rawDigits = contactNumber.replace(/[^0-9]/g, '');
    if (rawDigits.length >= 7) {
      cleaned = cleaned.split(contactNumber).join('••••••••••');
      cleaned = cleaned.split(rawDigits).join('••••••••••');
    }
  }

  // Mask exact known WhatsApp number
  if (whatsappNumber) {
    const rawDigits = whatsappNumber.replace(/[^0-9]/g, '');
    if (rawDigits.length >= 7) {
      cleaned = cleaned.split(whatsappNumber).join('••••••••••');
      cleaned = cleaned.split(rawDigits).join('••••••••••');
    }
  }

  // General phone number masking in text
  cleaned = maskPhoneNumbers(cleaned);

  // House number masking
  cleaned = maskHouseNumber(cleaned, houseNumber);

  return cleaned;
}
