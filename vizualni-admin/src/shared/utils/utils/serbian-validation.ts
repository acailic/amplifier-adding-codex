/**
 * Serbian validation utilities
 * Алатке за валидацију српских података
 */

import type { SerbianValidationResult, SerbianFormData } from '../types/serbian';
import { detectScript, containsSerbianChars } from './serbian-text';
import { formatSerbianJMBG, formatSerbianPIB, formatSerbianPhoneNumber } from './serbian-formatting';

// Serbian administrative divisions
export const SERBIAN_MUNICIPALITIES_CYRILLIC = new Set([
  // Београд
  'Београд', 'Нови Београд', 'Палилула', 'Раковица', 'Савски Венац',
  'Стари Град', 'Вождовац', 'Врачар', 'Земун', 'Звездара', 'Барајево',
  'Гроцка', 'Лазаревац', 'Младеновац', 'Обреновац', 'Сопот', 'Сурчин',

  // Војводина
  'Нови Сад', 'Суботица', 'Зрењанин', 'Панчево', 'Сомбор', 'Кикинда',
  'Србобран', 'Врбас', 'Бачка Паланка', 'Инђија', 'Вршац', 'Рума',
  'Бачка Топола', 'Апатин', 'Тител', 'Жабаљ', 'Кула', 'Оџаци', 'Алибунар',
  'Бела Црква', 'Нови Кнежевац', 'Кањижа', 'Сента', 'Ада', 'Чока',
  'Нова Црња', 'Пландиште', 'Бечеј', 'Темерин', 'Беочин', 'Сремска Митровица',
  'Стара Пазова', 'Шид', 'Печинци', 'Локве', 'Петроварадин',

  // Шумадија и Западна Србија
  'Крагујевац', 'Чачак', 'Краљево', 'Ужице', 'Ваљево', 'Шабац', 'Лозница',
  'Ариље', 'Бајина Башта', 'Кошељев', 'Пожега', 'Ивањица', 'Лучани', 'Горњи Милановац',
  'Аранђеловац', 'Топола', 'Рача', 'Баточина', 'Кнић', 'Лапово', 'Ресник',
  'Осећина', 'Љубовија', 'Мали Зворник', 'Крупањ', 'Љиг', 'Мионица',
  'Голубац', 'Велико Градиште', 'Кучево', 'Жагубица', 'Петровац на Млави',
  'Костолац', 'Деспотовац', 'Бор', 'Зајечар', 'Болевац', 'Књажевац',
  'Соко Бања', 'Неготин', 'Кладово', 'Мајданпек',

  // Јужна и Источна Србија
  'Ниш', 'Лесковац', 'Врање', 'Крушевац', 'Пожаревац', 'Јагодина',
  'Смедерево', 'Параћин', 'Ужице', 'Пирот', 'Зајечар', 'Прокупље',
  'Блаце', 'Куршумлија', 'Житорагље', 'Бабушница', 'Бела Паланка',
  'Димитровград', 'Сврљиг', 'Гаджињ Хан', 'Мерошина', 'Долевац', 'Алексинац',
  'Рашка', 'Нови Пазар', 'Тутин', 'Врњачка Бања', 'Рашка', 'Краљево',
  'Лесковац', 'Бојник', 'Власотинце', 'Лебане', 'Медвеђа', 'Црна Трава',

  // Косово и Метохија (технички)
  'Приштина', 'Косовска Митровица', 'Пећ', 'Ђаковица', 'Призрен',
  'Урошевац', 'Косовско Поље', 'Глоговац', 'Липљан', 'Вучитрн',
  'Обиличи', 'Ораховац', 'Ново Брдо', 'Качаник', 'Штимље', 'Штрпце',
  'Дечани', 'Звечан', 'Лепосавић', 'Зубин Поток', 'Исток', 'Србица',
  'Витина', 'Клина', 'Гњилане'
]);

export const SERBIAN_MUNICIPALITIES_LATIN = new Set([
  // Beograd
  'Beograd', 'Novi Beograd', 'Palilula', 'Rakovica', 'Savski Venac',
  'Stari Grad', 'Voždovac', 'Vračar', 'Zemun', 'Zvezdara', 'Barajevo',
  'Grocka', 'Lazarevac', 'Mladenovac', 'Obrenovac', 'Sopot', 'Surčin',

  // Vojvodina
  'Novi Sad', 'Subotica', 'Zrenjanin', 'Pančevo', 'Sombor', 'Kikinda',
  'Srbobran', 'Vrbas', 'Bačka Palanka', 'Inđija', 'Vršac', 'Ruma',
  'Bačka Topola', 'Apatin', 'Titel', 'Žabalj', 'Kula', 'Odžaci', 'Alibunar',
  'Bela Crkva', 'Novi Kneževac', 'Kanjiža', 'Senta', 'Ada', 'Čoka',
  'Nova Crnja', 'Plandište', 'Bečej', 'Temerin', 'Beočin', 'Sremska Mitrovica',
  'Stara Pazova', 'Šid', 'Pećinci', 'Lokve', 'Petrovaradin',

  // Šumadija i Zapadna Srbija
  'Kragujevac', 'Čačak', 'Kraljevo', 'Užice', 'Valjevo', 'Šabac', 'Loznica',
  'Arilje', 'Bajina Bašta', 'Kosjerić', 'Požega', 'Ivanjica', 'Lučani', 'Gornji Milanovac',
  'Aranđelovac', 'Topola', 'Rača', 'Batočina', 'Knić', 'Lapovo', 'Resnik',
  'Osečina', 'Ljubovija', 'Mali Zvornik', 'Krupanj', 'Ljig', 'Mionica',
  'Golubac', 'Veliko Gradište', 'Kučevo', 'Žagubica', 'Petrovac na Mlavi',
  'Kostolac', 'Despotovac', 'Bor', 'Zaječar', 'Boljevac', 'Knjaževac',
  'Soko Banja', 'Negotin', 'Kladovo', 'Majdanpek',

  // Južna i Istočna Srbija
  'Niš', 'Leskovac', 'Vranje', 'Kruševac', 'Požarevac', 'Jagodina',
  'Smederevo', 'Paraćin', 'Užice', 'Pirot', 'Zaječar', 'Prokuplje',
  'Blace', 'Kuršumlija', 'Žitorađe', 'Babušnica', 'Bela Palanka',
  'Dimitrovgrad', 'Svrljig', 'Gadžin Han', 'Merošina', 'Doljevac', 'Aleksinac',
  'Raška', 'Novi Pazar', 'Tutin', 'Vrnjačka Banja', 'Raška', 'Kraljevo',
  'Leskovac', 'Bojnik', 'Vlasotince', 'Lebane', 'Medveđa', 'Crna Trava',

  // Kosovo i Metohija (tehnički)
  'Priština', 'Kosovska Mitrovica', 'Peć', 'Đakovica', 'Prizren',
  'Uroševac', 'Kosovsko Polje', 'Glogovac', 'Lipljan', 'Vučitrn',
  'Obilić', 'Orahovac', 'Novo Brdo', 'Kačanik', 'Štimlje', 'Štrpce',
  'Dečani', 'Zvečan', 'Leposavić', 'Zubin Potok', 'Istok', 'Srbica',
  'Vitina', 'Klina', 'Gnjilane'
]);

// Serbian government institutions
export const SERBIAN_INSTITUTIONS = new Set([
  'Народна скупштина Републике Србије',
  'Влада Републике Србије',
  'Председник Републике Србије',
  'Уставни суд Републике Србије',
  'Народна банка Србије',
  'Републички завод за статистику',
  'Повељање за заштиту података о личности',
  'Агенција за привредне регистре',
  'Пореска управа',
  'Царинска управа',
  'Управа за тржиште финансија',
  'Агенција за лиценцирање'
]);

/**
 * Validate JMBG (Unique Master Citizen Number)
 */
export function validateJMBG(jmbg: string): boolean {
  const result = formatSerbianJMBG(jmbg);
  return result.isValid;
}

/**
 * Validate PIB (Tax Identification Number)
 */
export function validatePIB(pib: string): boolean {
  const result = formatSerbianPIB(pib);
  return result.isValid;
}

/**
 * Validate Serbian phone number
 */
export function validateSerbianPhone(phone: string): boolean {
  const result = formatSerbianPhoneNumber(phone);
  return result.isValid;
}

/**
 * Validate Serbian municipality name
 */
export function validateSerbianMunicipality(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const normalizedName = name.trim().toLowerCase();

  // Check in both Cyrillic and Latin sets
  return Array.from(SERBIAN_MUNICIPALITIES_CYRILLIC).some(municipality =>
    municipality.toLowerCase() === normalizedName
  ) || Array.from(SERBIAN_MUNICIPALITIES_LATIN).some(municipality =>
    municipality.toLowerCase() === normalizedName
  );
}

/**
 * Validate Serbian address
 */
export function validateSerbianAddress(address: string): {
  isValid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;

  if (!address || address.trim().length === 0) {
    return { isValid: false, score: 0, issues: ['Address is required'] };
  }

  // Check for Serbian characters
  if (containsSerbianChars(address)) {
    score += 0.3;
  }

  // Check for address patterns
  const addressPatterns = [
    /\b(улица|булевар|трг|сквер|насеље|населље)\b/i, // Cyrillic
    /\b(ulica|bulevar|trg|skver|naselje)\b/i, // Latin
    /\b(ул\.|бул\.|трг\.|скв\.)\b/i, // Cyrillic abbreviations
    /\b(ul\.|bul\.|trg\.|skv\.)\b/i, // Latin abbreviations
    /\d+[A-Za-zА-Ша-ш]?(\s*\/\s*\d+)?/, // House numbers
  ];

  for (const pattern of addressPatterns) {
    if (pattern.test(address)) {
      score += 0.2;
      break;
    }
  }

  // Check for municipality
  const words = address.split(/\s+/);
  for (const word of words) {
    if (validateSerbianMunicipality(word)) {
      score += 0.3;
      break;
    }
  }

  // Check for postal code pattern (5 digits)
  if (/\b\d{5}\b/.test(address)) {
    score += 0.2;
  }

  if (score < 0.5) {
    issues.push('Address format seems invalid');
  }

  return {
    isValid: score >= 0.5,
    score: Math.min(score, 1.0),
    issues
  };
}

/**
 * Validate Serbian email
 */
export function validateSerbianEmail(email: string): {
  isValid: boolean;
  isSerbianDomain: boolean;
  suggestions: string[];
} {
  const suggestions: string[] = [];

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      isSerbianDomain: false,
      suggestions: ['Invalid email format']
    };
  }

  const [, domain] = email.split('@');
  const isSerbianDomain = ['.rs', '.rs.ba', '.org.rs', '.edu.rs', '.ac.rs', '.gov.rs'].some(tld =>
    domain.toLowerCase().endsWith(tld)
  );

  if (!isSerbianDomain && domain.toLowerCase().endsWith('.com')) {
    suggestions.push('Consider using a .rs domain for Serbian entities');
  }

  return {
    isValid: true,
    isSerbianDomain,
    suggestions
  };
}

/**
 * Comprehensive Serbian dataset validation
 */
export function validateSerbianDataset(
  records: any[],
  textColumns: string[] = []
): SerbianValidationResult {
  if (!records || records.length === 0) {
    return {
      script_detected: null,
      script_consistency: 0.0,
      has_serbian_chars: false,
      place_names_found: [],
      valid_municipalities: [],
      invalid_municipalities: [],
      jmbg_valid: false,
      pib_valid: false,
      address_format_score: 0.0,
      serbian_language_confidence: 0.0
    };
  }

  if (textColumns.length === 0) {
    textColumns = Object.keys(records[0]);
  }

  const allTexts: string[] = [];
  const placeNames: string[] = [];
  const validMunicipalities: string[] = [];
  const invalidMunicipalities: string[] = [];
  const addressScores: number[] = [];
  const jmbgValues: string[] = [];
  const pibValues: string[] = [];

  // Collect all text data
  for (const record of records) {
    for (const column of textColumns) {
      const value = record[column];
      if (typeof value === 'string' && value.trim().length > 0) {
        const trimmedValue = value.trim();
        allTexts.push(trimmedValue);

        // Check for Serbian characters
        if (containsSerbianChars(trimmedValue)) {
          placeNames.push(trimmedValue);
        }

        // Check for municipalities
        if (validateSerbianMunicipality(trimmedValue)) {
          validMunicipalities.push(trimmedValue);
        }

        // Validate addresses
        if (column.toLowerCase().includes('адреса') || column.toLowerCase().includes('address')) {
          const addressValidation = validateSerbianAddress(trimmedValue);
          addressScores.push(addressValidation.score);
        }

        // Extract JMBG values
        if (column.toLowerCase().includes('jmbg') || column.toLowerCase().includes('матични')) {
          const cleanJMBG = trimmedValue.replace(/[.\-]/g, '');
          if (/^\d{13}$/.test(cleanJMBG)) {
            jmbgValues.push(cleanJMBG);
          }
        }

        // Extract PIB values
        if (column.toLowerCase().includes('pib') || column.toLowerCase().includes('пиб')) {
          const cleanPIB = trimmedValue.replace(/[.\-]/g, '');
          if (/^\d{9}$/.test(cleanPIB)) {
            pibValues.push(cleanPIB);
          }
        }
      }
    }
  }

  // Analyze script distribution
  const scriptCounts = { cyrillic: 0, latin: 0, mixed: 0, none: 0 };
  for (const text of allTexts.slice(0, 1000)) {
    const script = detectScript(text);
    scriptCounts[script]++;
  }

  const dominantScript = Object.entries(scriptCounts)
    .sort(([, a], [, b]) => b - a)[0][0] as any;

  // Calculate script consistency
  const totalScripts = scriptCounts.cyrillic + scriptCounts.latin;
  const scriptConsistency = totalScripts > 0
    ? Math.max(scriptCounts.cyrillic, scriptCounts.latin) / totalScripts
    : 0;

  // Validate JMBG and PIB
  const validJMBGCount = jmbgValues.filter(validateJMBG).length;
  const validPIBCount = pibValues.filter(validatePIB).length;

  // Calculate address format score
  const addressFormatScore = addressScores.length > 0
    ? addressScores.reduce((a, b) => a + b, 0) / addressScores.length
    : 0;

  // Calculate Serbian language confidence
  const serbianTextCount = placeNames.length;
  const serbianLanguageConfidence = allTexts.length > 0
    ? serbianTextCount / allTexts.length
    : 0;

  return {
    script_detected: dominantScript,
    script_consistency: scriptConsistency,
    has_serbian_chars: serbianTextCount > 0,
    place_names_found: [...new Set(placeNames)],
    valid_municipalities: [...new Set(validMunicipalities)],
    invalid_municipalities: [...new Set(invalidMunicipalities)],
    jmbg_valid: jmbgValues.length > 0 && validJMBGCount / Math.max(jmbgValues.length, 1) > 0.8,
    pib_valid: pibValues.length > 0 && validPIBCount / Math.max(pibValues.length, 1) > 0.8,
    address_format_score: addressFormatScore,
    serbian_language_confidence: Math.min(serbianLanguageConfidence, 1.0)
  };
}

/**
 * Validate complete Serbian form data
 */
export function validateSerbianForm(data: SerbianFormData): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // Validate JMBG
  if (data.jmbg) {
    if (!validateJMBG(data.jmbg)) {
      errors.jmbg = 'Неважећи ЈМБГ';
    }
  }

  // Validate PIB
  if (data.pib) {
    if (!validatePIB(data.pib)) {
      errors.pib = 'Неважећи ПИБ';
    }
  }

  // Validate address
  if (data.address) {
    const addressValidation = validateSerbianAddress(data.address);
    if (!addressValidation.isValid) {
      errors.address = 'Формат адресе је неважећи';
    } else if (addressValidation.score < 0.8) {
      warnings.address = 'Формат адресе треба проверити';
    }
  }

  // Validate municipality
  if (data.municipality) {
    if (!validateSerbianMunicipality(data.municipality)) {
      errors.municipality = 'Непозната општина';
    }
  }

  // Validate postal code
  if (data.postalCode) {
    if (!/^\d{5}$/.test(data.postalCode)) {
      errors.postalCode = 'Поштански број треба имати 5 цифара';
    }
  }

  // Validate phone
  if (data.phone) {
    if (!validateSerbianPhone(data.phone)) {
      warnings.phone = 'Формат телефона треба проверити';
    }
  }

  // Validate email
  if (data.email) {
    const emailValidation = validateSerbianEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = 'Формат е-поште је неважећи';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}

/**
 * Check if text is in Serbian language
 */
export function isSerbianText(text: string): {
  isSerbian: boolean;
  confidence: number;
  script: 'cyrillic' | 'latin' | 'mixed';
} {
  if (!text || text.trim().length === 0) {
    return { isSerbian: false, confidence: 0, script: 'latin' };
  }

  const script = detectScript(text);
  const hasSerbianChars = containsSerbianChars(text);

  // Calculate confidence based on Serbian-specific characters and patterns
  let confidence = 0;
  const words = text.split(/\s+/);
  const wordCount = words.length;

  if (hasSerbianChars) {
    confidence += 0.4;
  }

  // Check for Serbian-specific words
  const serbianWords = ['и', 'у', 'на', 'са', 'по', 'за', 'од', 'до', 'код', 'кад', 'где'];
  const serbianWordCount = words.filter(word =>
    serbianWords.includes(word.toLowerCase())
  ).length;

  if (serbianWordCount > 0) {
    confidence += (serbianWordCount / wordCount) * 0.3;
  }

  // Check for Serbian place names
  const serbianPlaceCount = words.filter(word =>
    validateSerbianMunicipality(word)
  ).length;

  if (serbianPlaceCount > 0) {
    confidence += (serbianPlaceCount / wordCount) * 0.3;
  }

  return {
    isSerbian: confidence > 0.5,
    confidence: Math.min(confidence, 1.0),
    script: script === 'cyrillic' ? 'cyrillic' : 'latin'
  };
}