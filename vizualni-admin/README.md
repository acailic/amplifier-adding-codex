# Vizualni Admin - World-Class Serbian Support

**Визуелни Админ - Светска подршка за српски језик**

A modern React administrative library with comprehensive Serbian language support, including both Cyrillic and Latin scripts, perfect formatting, validation, and typography.

## ✨ Features

### 🌍 **Dual Script Support**
- **Cyrillic Script** (Ћирилица) - Full support for Serbian Cyrillic characters
- **Latin Script** (Latinica) - Complete Serbian Latin character support
- **Auto-Detection** - Intelligent script detection and consistent handling
- **Script Conversion** - Bidirectional conversion between Cyrillic and Latin

### 📊 **Serbian Formatting**
- **Date Formatting** - Serbian date formats (`01.01.2024.`, `1. јануар 2024. године`)
- **Number Formatting** - Serbian number formats with proper decimal separators
- **Currency Formatting** - RSD, EUR, USD with Serbian symbols
- **Phone Numbers** - Serbian phone number validation and formatting
- **JMBG Validation** - Unique Master Citizen Number validation with checksum
- **PIB Validation** - Tax Identification Number validation

### ✅ **Serbian Validation**
- **Municipality Validation** - Complete list of Serbian municipalities
- **Address Validation** - Serbian address format validation
- **Government Institution Detection** - Serbian government entities
- **Form Validation** - Comprehensive Serbian form validation
- **Dataset Validation** - Bulk validation of Serbian datasets

### 🎨 **Serbian Typography**
- **Optimized Fonts** - Fonts specifically chosen for Serbian text rendering
- **Ligatures & Kerning** - Advanced typography features for Serbian
- **Script-Specific Optimization** - Different optimizations for Cyrillic vs Latin
- **Accessibility Support** - WCAG compliant Serbian typography
- **Responsive Typography** - Mobile-first Serbian text rendering

### ⌨️ **Input Methods**
- **Serbian Keyboard Support** - Full Serbian keyboard layouts
- **Auto-Completion** - Serbian text suggestions
- **Script Toggle** - Easy switching between scripts
- **Real-time Validation** - Live Serbian validation feedback

### 🌐 **Internationalization**
- **Lingui Integration** - Modern i18n framework support
- **3 Locales**: Serbian Cyrillic (`sr`), Serbian Latin (`sr-Latn`), English (`en`)
- **Pluralization** - Correct Serbian plural rules
- **RTL/LTR Support** - Proper text direction handling

## 🚀 Quick Start

### Installation

```bash
npm install vizualni-admin
# or
yarn add vizualni-admin
```

### Basic Setup

```tsx
import React from 'react';
import { initializeI18n, SerbianTextInput, useSerbianForm } from 'vizualni-admin';
import 'vizualni-admin/styles';

// Initialize Serbian i18n
initializeI18n();

function App() {
  const { formData, errors, updateField, validateForm } = useSerbianForm();

  return (
    <div className="serbian-text">
      <h1 className="serbian-heading">Администрациона контролна табла</h1>

      <SerbianTextInput
        label="Име"
        value={formData.ime}
        onChange={(value) => updateField('ime', value)}
        required
        scriptToggle
      />

      <SerbianTextInput
        label="Адреса"
        value={formData.adresa}
        onChange={(value) => updateField('adresa', value)}
        placeholder="Унесите пуну адресу"
      />

      <button onClick={() => validateForm(formData)}>
        Валидирај форму
      </button>
    </div>
  );
}
```

### Script Conversion

```tsx
import { convertScript, detectScript } from 'vizualni-admin';

function TextConverter() {
  const [text, setText] = useState('Здраво свете');
  const [targetScript, setTargetScript] = useState<'cyrillic' | 'latin'>('latin');

  const detectedScript = detectScript(text);
  const convertedText = convertScript(text, targetScript);

  return (
    <div>
      <p>Original: {text} ({detectedScript})</p>
      <p>Converted: {convertedText}</p>
      <button onClick={() => setTargetScript(targetScript === 'cyrillic' ? 'latin' : 'cyrillic')}>
        Convert to {targetScript === 'cyrillic' ? 'Latin' : 'Cyrillic'}
      </button>
    </div>
  );
}
```

### Date and Number Formatting

```tsx
import { formatSerbianDate, formatSerbianNumber, formatSerbianCurrency } from 'vizualni-admin';

function FormattingExample() {
  const today = new Date();
  const amount = 1234567.89;

  return (
    <div className="serbian-text">
      <p>Date: {formatSerbianDate(today, 'long')}</p>
      {/* Output: 1. јануар 2024. године */}

      <p>Number: {formatSerbianNumber(amount)}</p>
      {/* Output: 1.234.567,89 */}

      <p>Currency: {formatSerbianCurrency(amount, 'RSD')}</p>
      {/* Output: 1.234.568 дин. */}
    </div>
  );
}
```

### Data Validation

```tsx
import { SerbianDataValidator } from 'vizualni-admin';

function DataValidationExample() {
  const serbianData = [
    { ime: 'Петар', prezime: 'Петровић', jmbg: '0101990710006', opstina: 'Београд' },
    // ... more records
  ];

  return (
    <SerbianDataValidator
      data={serbianData}
      textColumns={['ime', 'prezime', 'opstina']}
      onValidationComplete={(result) => {
        console.log('Validation result:', result);
      }}
      showDetails
    />
  );
}
```

## 📋 API Reference

### Hooks

#### `useSerbianScript`
Manages Serbian script detection and conversion.

```tsx
const {
  currentScript,
  setCurrentScript,
  toggleScript,
  convertText,
  getScriptVariants,
  detectTextScript
} = useSerbianScript('cyrillic');
```

#### `useSerbianForm`
Handles Serbian form validation.

```tsx
const {
  formData,
  errors,
  warnings,
  isValid,
  validateForm,
  updateField,
  clearErrors,
  resetForm
} = useSerbianForm(initialData);
```

#### `useSerbianDate`
Formats Serbian dates.

```tsx
const { formatted, fullFormat } = useSerbianDate(date, 'medium');
```

### Components

#### `SerbianTextInput`
Advanced Serbian text input with script support.

```tsx
<SerbianTextInput
  value={value}
  onChange={(value, script) => handleChange(value)}
  label="Име"
  placeholder="Унесите име"
  required
  scriptToggle
  autoDetectScript
  maxLength={50}
/>
```

#### `SerbianDataValidator`
Comprehensive Serbian dataset validator.

```tsx
<SerbianDataValidator
  data={records}
  textColumns={['column1', 'column2']}
  onValidationComplete={(result) => handleResult(result)}
  showDetails
/>
```

### Utilities

#### Text Processing
```typescript
import { detectScript, convertScript, getBothScriptVariants } from 'vizualni-admin';

const script = detectScript(text); // 'cyrillic' | 'latin' | 'mixed' | 'none'
const converted = convertScript(text, 'latin');
const variants = getBothScriptVariants(text); // { cyrillic: string, latin: string }
```

#### Formatting
```typescript
import { formatSerbianDate, formatSerbianNumber, formatSerbianJMBG } from 'vizualni-admin';

const date = formatSerbianDate(new Date(), 'long');
const number = formatSerbianNumber(1234.56);
const jmbg = formatSerbianJMBG('0101990710006'); // Validates and formats
```

#### Validation
```typescript
import { validateJMBG, validatePIB, validateSerbianMunicipality } from 'vizualni-admin';

const isValidJMBG = validateJMBG('0101990710006');
const isValidPIB = validatePIB('123456789');
const isValidMunicipality = validateSerbianMunicipality('Београд');
```

## 🎯 Advanced Usage

### Custom Serbian Validation

```tsx
import { validateSerbianDataset } from 'vizualni-admin';

const validationResult = validateSerbianDataset(data, ['ime', 'prezime', 'adresa']);

if (validationResult.script_consistency > 0.8) {
  console.log('Excellent script consistency!');
}
```

### Serbian Typography

```tsx
import { applySerbianTypography, DEFAULT_SERBIAN_TYPOGRAPHY } from 'vizualni-admin';

const elementRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (elementRef.current) {
    applySerbianTypography(elementRef.current, 'heading', 'cyrillic');
  }
}, []);
```

### Custom Locale Setup

```tsx
import { loadAndActivateLocale, getCurrentScript } from 'vizualni-admin';

// Switch to Serbian Latin
await loadAndActivateLocale('sr-Latn');

// Check current script
const script = getCurrentScript(); // 'latin'
```

## 🔧 Configuration

### Lingui Configuration

```javascript
// lingui.config.js
export default linguiConfig({
  locales: ['sr', 'sr-Latn', 'en'],
  sourceLocale: 'sr',
  fallbackLocale: 'en',
  catalogs: [
    {
      path: 'locales/{locale}',
      include: ['src/**/*.{ts,tsx}']
    }
  ]
});
```

### Typography Configuration

```tsx
import { generateSerbianFontCSS, SERBIAN_FONTS } from 'vizualni-admin';

// Generate custom CSS
const customCSS = generateSerbianFontCSS();

// Use custom fonts
const customFonts = {
  primary: ['Custom Serbian Font', ...SERBIAN_FONTS.primary],
  display: ['Custom Display Font', ...SERBIAN_FONTS.display]
};
```

## 📊 Demo Data

Generate realistic Serbian demo data:

```bash
npm run demo:data
```

This creates:
- `demo-data/serbian-demographics-cyrillic.csv`
- `demo-data/serbian-demographics-latin.csv`
- `demo-data/serbian-demographics-mixed.csv`

## 🧪 Testing

```bash
# Run tests
npm test

# Run Serbian-specific tests
npm test -- --testNamePattern="Serbian"

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md).

### Development

```bash
# Clone the repository
git clone https://github.com/your-org/vizualni-admin.git
cd vizualni-admin

# Install dependencies
npm install

# Start development
npm run dev

# Extract translations
npm run extract

# Compile translations
npm run compile
```

### Adding New Serbian Features

1. Add utilities to `src/utils/serbian-*.ts`
2. Create React hooks in `src/hooks/useSerbian.ts`
3. Build components in `src/components/`
4. Add types in `src/types/serbian.ts`
5. Update translations in `locales/`
6. Add comprehensive tests

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Serbian language institutions for guidance on proper formatting
- Serbian Unicode community for character encoding standards
- Lingui team for excellent i18n framework
- Serbian typography experts for font recommendations

## 📞 Support

- 📧 Email: team@vizualni-admin.com
- 🌐 Website: https://vizualni-admin.com
- 📖 Documentation: https://docs.vizualni-admin.com
- 🐛 Issues: https://github.com/your-org/vizualni-admin/issues

---

**Сачувајмо српски језик у дигиталном добу!**
*Let's preserve the Serbian language in the digital age!*