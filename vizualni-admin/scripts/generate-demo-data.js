/**
 * Generate Cyrillic Demo Data Script
 * Скрипта за генерисање ћириличних демо података
 */

const fs = require('fs');
const path = require('path');

// Serbian first names (Cyrillic)
const firstNames = [
  'Петар', 'Марина', 'Никола', 'Јелена', 'Душан', 'Ана', 'Милош', 'Снежана',
  'Марко', 'Ђорђе', 'Мирјана', 'Иван', 'Ивана', 'Ненад', 'Маја', 'Жељко',
  'Тијана', 'Младен', 'Даница', 'Бранислав', 'Мирослав', 'Зоран', 'Гордана',
  'Драган', 'Биљана', 'Владимир', 'Јасмина', 'Срђан', 'Милена', 'Александар',
  'Мирољуб', 'Миланка', 'Дејан', 'Марија', 'Небојша', 'Тамара', 'Борислав'
];

// Serbian last names (Cyrillic)
const lastNames = [
  'Петровић', 'Јовановић', 'Радосављевић', 'Станковић', 'Милошевић', 'Миловановић',
  'Вуковић', 'Петровић', 'Антонијевић', 'Симић', 'Тодоровић', 'Павловић', 'Васић',
  'Томић', 'Ракић', 'Филиповић', 'Михајловић', 'Николић', 'Ђорђевић', 'Бранковић',
  'Гавриловић', 'Марковић', 'Стевановић', 'Стојановић', 'Савић', 'Илић', 'Васиљевић',
  'Драгић', 'Матић', 'Лазић', 'Митић', 'Бошковић', 'Костић', 'Стаменковић'
];

// Serbian municipalities (Cyrillic)
const municipalities = [
  'Београд', 'Нови Сад', 'Ниш', 'Крагујевац', 'Суботица', 'Зрењанин', 'Панчево',
  'Чачак', 'Нови Пазар', 'Краљево', 'Смедерево', 'Лесковац', 'Ужице', 'Вршац',
  'Пожаревац', 'Шабац', 'Крушевац', 'Врање', 'Пожега', 'Сомбор', 'Лозница',
  'Ваљево', 'Сремска Митровица', 'Бор', 'Зајечар', 'Прокупље', 'Пирот', 'Ариље',
  'Бајина Башта', 'Косјерић', 'Ивањица', 'Лучани', 'Горњи Милановац', 'Аранђеловац'
];

// Serbian streets (Cyrillic)
const streets = [
  'Кнеза Михаила', 'Краља Александра', 'Карађорђева', 'Цара Душана', 'Булевар револуције',
  'Булевар ослобођења', 'Реск reimска', 'Неманињина', 'Цара Лазара', 'Вука Караџића',
  'Његошева', 'Душанова', 'Светог Саве', 'Милана Топлице', 'Принца Евгенија',
  'Таковска', 'Кружни пут', 'Војводе Мишића', 'Вука Караџића', 'Јована Цвијића',
  'Гаврила Принципа', 'Михајла Пупина', 'Николе Тесле', 'Стевана Сремца', 'Бранка Радичевића'
];

// Government institutions
const institutions = [
  'Народна скупштина Републике Србије',
  'Влада Републике Србије',
  'Министарство финансија',
  'Министарство унутрашњих послова',
  'Министарство здравља',
  'Министарство просвете',
  'Пореска управа',
  'Народна банка Србије',
  'Републички завод за статистику',
  'Агенција за привредне регистре'
];

// Generate valid JMBG
function generateJMBG() {
  // Random date between 1950 and 2005
  const year = Math.floor(Math.random() * 56) + 1950;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;

  const dateStr = `${day.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${year.toString().padStart(3, '0')}`;

  // Political region (70-89 for Serbia)
  const region = Math.floor(Math.random() * 20) + 70;
  const gender = Math.floor(Math.random() * 1000);

  const base = dateStr + region.toString().padStart(2, '0') + gender.toString().padStart(3, '0');

  // Calculate control digit
  const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let checksum = 0;
  for (let i = 0; i < 12; i++) {
    checksum += parseInt(base[i]) * weights[i];
  }
  const remainder = checksum % 11;
  const controlDigit = (11 - remainder) % 10;

  return base + controlDigit;
}

// Generate valid PIB
function generatePIB() {
  // 8 digits for PIB
  let pib = '';
  for (let i = 0; i < 8; i++) {
    pib += Math.floor(Math.random() * 10);
  }

  // Calculate control digit
  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(pib[i]) * weights[i];
  }
  const remainder = sum % 11;
  const controlDigit = remainder === 0 ? 0 : 11 - remainder;

  return pib + controlDigit;
}

// Generate phone number
function generatePhoneNumber() {
  const prefixes = ['064', '065', '066', '060', '061', '062', '063', '069'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  let number = '';
  for (let i = 0; i < 7; i++) {
    number += Math.floor(Math.random() * 10);
  }

  return `${prefix}/${number}`;
}

// Generate email
function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'eunet.rs', 'ptt.rs'];
  const separators = ['.', '_', '-'];
  const separator = separators[Math.floor(Math.random() * separators.length)];

  const base = `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}`;
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomNum = Math.random() > 0.5 ? Math.floor(Math.random() * 100) : '';

  return `${base}${randomNum}@${domain}`;
}

// Generate demo data
function generateDemoData(count = 1000) {
  const data = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const municipality = municipalities[Math.floor(Math.random() * municipalities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    const postalCode = Math.floor(Math.random() * 90000) + 10000;

    const record = {
      id: i + 1,
      jmbg: generateJMBG(),
      ime: firstName,
      prezime: lastName,
      pol: Math.random() > 0.5 ? 'мушки' : 'женски',
      godine: Math.floor(Math.random() * 50) + 20,
      opstina: municipality,
      datum_rodjenja: `${Math.floor(Math.random() * 28) + 1}.${Math.floor(Math.random() * 12) + 1}.${Math.floor(Math.random() * 40) + 1970}.`,
      adresa: `${street} ${streetNumber}`,
      telefon: generatePhoneNumber(),
      email: generateEmail(firstName, lastName),
      prihod: Math.floor(Math.random() * 200000) + 30000,
      jmbg_format: '',
      pib: Math.random() > 0.7 ? generatePIB() : '',
      institucija: Math.random() > 0.8 ? institutions[Math.floor(Math.random() * institutions.length)] : '',
      postanski_broj: postalCode.toString(),
      status: Math.random() > 0.2 ? 'активан' : 'неактиван',
      napomena: Math.random() > 0.7 ? 'Редован корисник услуга' : ''
    };

    // Format JMBG for display
    record.jmbg_format = `${record.jmbg.substring(0, 2)}.${record.jmbg.substring(2, 4)}.${record.jmbg.substring(4, 9)}-${record.jmbg.substring(9)}`;

    data.push(record);
  }

  return data;
}

// Create CSV content
function createCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvLines = [headers.join(',')];

  for (const record of data) {
    const values = headers.map(header => {
      let value = record[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvLines.push(values.join(','));
  }

  return csvLines.join('\n');
}

// Create JSON content
function createJSON(data) {
  return JSON.stringify(data, null, 2);
}

// Generate Latin version
function convertToLatin(text) {
  const mapping = {
    'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v', 'Г': 'G', 'г': 'g',
    'Д': 'D', 'д': 'd', 'Ђ': 'Đ', 'ђ': 'đ', 'Е': 'E', 'е': 'e', 'Ж': 'Ž', 'ж': 'ž',
    'З': 'Z', 'з': 'z', 'И': 'I', 'и': 'i', 'Ј': 'J', 'ј': 'j', 'К': 'K', 'к': 'k',
    'Л': 'L', 'л': 'l', 'Љ': 'Lj', 'љ': 'lj', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n',
    'Њ': 'Nj', 'њ': 'nj', 'О': 'O', 'о': 'o', 'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r',
    'С': 'S', 'с': 's', 'Т': 'T', 'т': 't', 'Ћ': 'Ć', 'ћ': 'ć', 'У': 'U', 'у': 'u',
    'Ф': 'F', 'ф': 'f', 'Х': 'H', 'х': 'h', 'Ц': 'C', 'ц': 'c', 'Ч': 'Č', 'ч': 'č',
    'Џ': 'Dž', 'џ': 'dž', 'Ш': 'Š', 'ш': 'š'
  };

  return text.replace(/[А-Ша-шЂђЈјКкЉљЊњЋћЏџ]/g, (match) => mapping[match] || match);
}

// Convert data to Latin script
function convertDataToLatin(data) {
  return data.map(record => {
    const latinRecord = {};
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') {
        latinRecord[key] = convertToLatin(value);
      } else {
        latinRecord[key] = value;
      }
    }
    return latinRecord;
  });
}

// Main execution
function main() {
  console.log('Генерисање српских демо података...');

  // Generate data
  const cyrillicData = generateDemoData(1000);
  const latinData = convertDataToLatin(cyrillicData);

  // Create output directory
  const outputDir = path.join(__dirname, '..', 'demo-data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save Cyrillic CSV
  const cyrillicCSV = createCSV(cyrillicData);
  fs.writeFileSync(path.join(outputDir, 'serbian-demographics-cyrillic.csv'), cyrillicCSV, 'utf-8');

  // Save Latin CSV
  const latinCSV = createCSV(latinData);
  fs.writeFileSync(path.join(outputDir, 'serbian-demographics-latin.csv'), latinCSV, 'utf-8');

  // Save Cyrillic JSON
  const cyrillicJSON = createJSON(cyrillicData);
  fs.writeFileSync(path.join(outputDir, 'serbian-demographics-cyrillic.json'), cyrillicJSON, 'utf-8');

  // Save Latin JSON
  const latinJSON = createJSON(latinData);
  fs.writeFileSync(path.join(outputDir, 'serbian-demographics-latin.json'), latinJSON, 'utf-8');

  // Create mixed script sample
  const mixedData = cyrillicData.slice(0, 100).map((record, index) => {
    if (index % 3 === 0) {
      // Mix Cyrillic and Latin in this record
      const mixed = { ...record };
      mixed.email = convertToLatin(mixed.email);
      return mixed;
    }
    return record;
  });

  const mixedCSV = createCSV(mixedData);
  fs.writeFileSync(path.join(outputDir, 'serbian-demographics-mixed.csv'), mixedCSV, 'utf-8');

  console.log(`✅ Генерисано ${cyrillicData.length} записа`);
  console.log(`📁 Фајлови су сачувани у: ${outputDir}`);
  console.log('');
  console.log('Генерисани фајлови:');
  console.log('  • serbian-demographics-cyrillic.csv');
  console.log('  • serbian-demographics-latin.csv');
  console.log('  • serbian-demographics-mixed.csv');
  console.log('  • serbian-demographics-cyrillic.json');
  console.log('  • serbian-demographics-latin.json');
  console.log('');
  console.log('📊 Подаци садрже:');
  console.log('  • ЈМБГ (валидни)');
  console.log('  • ПИБ (за неке записе)');
  console.log('  • Српска имена и презимена');
  console.log('  • Општине и адресе');
  console.log('  • Телфонске бројеве');
  console.log('  • Е-поште');
  console.log('  • Датуме и приходе');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateDemoData,
  generateJMBG,
  generatePIB,
  convertToLatin
};