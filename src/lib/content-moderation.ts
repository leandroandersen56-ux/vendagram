/**
 * Content moderation utility — detects contact information
 * (phone numbers, emails, URLs, social handles) in user-generated text
 * to prevent off-platform transactions.
 */

// Phone patterns: Brazilian formats, international, obfuscated
const PHONE_PATTERNS = [
  // Standard Brazilian: (11) 99999-9999, 11999999999, +55 11 99999-9999
  /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/g,
  // Sequences of 8+ digits (possibly separated by spaces/dots/dashes)
  /\d[\d\s.\-()]{7,}\d/g,
  // Obfuscated: "nove nove um dois três..." written as words
  /(?:zero|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez)(?:\s*[-.,]?\s*(?:zero|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez)){5,}/gi,
  // Mixed obfuscation: 9 nove 1 dois 3...
  /\d\s*(?:zero|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove)\s*\d/gi,
  // Leetspeak/special chars: n0v3 n0v3...
  /(?:whats|wpp|zap|zapzap|whatsapp|whatts|wats)\s*[:.]?\s*[\d\s.\-()]{5,}/gi,
];

// Email patterns
const EMAIL_PATTERNS = [
  // Standard email
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  // Obfuscated: user [at] domain [dot] com
  /[a-zA-Z0-9._%+-]+\s*(?:\[?\s*(?:at|arroba|@)\s*\]?)\s*[a-zA-Z0-9.-]+\s*(?:\[?\s*(?:dot|ponto|\.)\s*\]?)\s*[a-zA-Z]{2,}/gi,
];

// URL patterns
const URL_PATTERNS = [
  // Standard URLs
  /https?:\/\/[^\s<>"']+/gi,
  // www URLs
  /www\.[^\s<>"']+/gi,
  // Common domains without protocol
  /[a-zA-Z0-9-]+\.(?:com|com\.br|net|org|io|me|app|dev|xyz|info|biz|cc|co)(?:\/[^\s]*)?/gi,
];

// Social media handle patterns
const SOCIAL_PATTERNS = [
  // @username mentions
  /@[a-zA-Z0-9_.]{3,30}/g,
  // "me chama no insta/face/twitter/telegram/discord..."
  /(?:me\s+(?:chama|add|adiciona|segue|manda\s+msg)|chama\s+(?:no|na)|segue\s+(?:no|na)|add\s+(?:no|na))\s*(?:insta|instagram|face|facebook|twitter|telegram|discord|snap|snapchat|tiktok|whats|whatsapp|wpp|zap)/gi,
  // "meu insta é X", "meu zap é X"
  /(?:meu|minha)\s+(?:insta|instagram|face|facebook|twitter|telegram|discord|snap|snapchat|tiktok|whats|whatsapp|wpp|zap|email|e-mail|numero|número|tel|telefone|cel|celular)\s*(?:é|eh|:)\s*\S+/gi,
  // Telegram links
  /t\.me\/[a-zA-Z0-9_]+/gi,
  // Discord tags
  /[a-zA-Z0-9_]{2,32}#\d{4}/g,
];

// Words that signal contact exchange intent
const INTENT_KEYWORDS = [
  /(?:vamos?\s+)?(?:negociar?|conversar?|combinar?|fechar?)\s+(?:por\s+)?(?:fora|privado|pv|dm|direct|inbox|particular)/gi,
  /(?:paga|pagamento|pago|pix)\s+(?:por\s+)?(?:fora|direto|particular)/gi,
  /(?:sem\s+)?(?:taxa|comissão|fee)\s+(?:da\s+)?(?:plataforma|froiv|site)/gi,
];

export interface ModerationResult {
  blocked: boolean;
  reasons: string[];
  detectedPatterns: string[];
}

/**
 * Normalizes text to catch obfuscation attempts:
 * - Removes zero-width chars, diacritics variations
 * - Converts common letter substitutions
 */
function normalizeText(text: string): string {
  return text
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
    // Normalize common substitutions
    .replace(/[0Oo]/g, '0')
    .replace(/[1lIi!|]/g, '1')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[@]/g, 'a');
}

/**
 * Checks text content for prohibited contact information.
 * Returns detailed moderation result.
 */
export function moderateText(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { blocked: false, reasons: [], detectedPatterns: [] };
  }

  const reasons: string[] = [];
  const detectedPatterns: string[] = [];
  const normalizedText = normalizeText(text);

  // Check phone patterns
  for (const pattern of PHONE_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern) || normalizedText.match(pattern);
    if (matches) {
      for (const match of matches) {
        // Filter out short numbers that might be prices or IDs
        const digits = match.replace(/\D/g, '');
        if (digits.length >= 8) {
          reasons.push('Número de telefone detectado');
          detectedPatterns.push(match.trim());
          break;
        }
      }
    }
  }

  // Check email patterns
  for (const pattern of EMAIL_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern) || normalizedText.match(pattern);
    if (matches) {
      reasons.push('E-mail detectado');
      detectedPatterns.push(...matches.map(m => m.trim()));
      break;
    }
  }

  // Check URL patterns
  for (const pattern of URL_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      // Allow froiv.com links
      const filtered = matches.filter(m => !m.toLowerCase().includes('froiv'));
      if (filtered.length > 0) {
        reasons.push('Link externo detectado');
        detectedPatterns.push(...filtered.map(m => m.trim()));
        break;
      }
    }
  }

  // Check social media patterns
  for (const pattern of SOCIAL_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern) || normalizedText.match(pattern);
    if (matches) {
      reasons.push('Perfil de rede social detectado');
      detectedPatterns.push(...matches.map(m => m.trim()));
      break;
    }
  }

  // Check intent keywords
  for (const pattern of INTENT_KEYWORDS) {
    pattern.lastIndex = 0;
    if (pattern.test(text) || pattern.test(normalizedText)) {
      reasons.push('Tentativa de negociação fora da plataforma');
      break;
    }
  }

  return {
    blocked: reasons.length > 0,
    reasons: [...new Set(reasons)],
    detectedPatterns: [...new Set(detectedPatterns)],
  };
}

/**
 * Quick check — returns true if content is safe (no contact info detected)
 */
export function isContentSafe(text: string): boolean {
  return !moderateText(text).blocked;
}

/**
 * Returns a user-friendly error message for blocked content
 */
export function getModerationMessage(result: ModerationResult): string {
  if (!result.blocked) return '';
  
  const reasonText = result.reasons.join(', ').toLowerCase();
  return `🚫 Conteúdo bloqueado: ${reasonText}. A troca de contatos fora da Froiv é proibida para a segurança de todos. Use o chat da transação para se comunicar.`;
}
