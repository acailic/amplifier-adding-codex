import { NextApiRequest, NextApiResponse } from 'next';
import { pythonRunner } from '../../../lib/python-runner';
import { APIError } from '../../../types/datasets';

interface CategoryInfo {
  name: string;
  displayName: string;
  description: string;
  keywords: string[];
  exampleQueries: string[];
}

interface CategoriesResponse {
  success: boolean;
  data: CategoryInfo[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CategoriesResponse | APIError>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // Get categories from the Python discovery tool
    const result = await pythonRunner.listCategories();

    if (!result.success) {
      console.error('Failed to get categories:', result.stderr);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        code: 'CATEGORIES_FETCH_FAILED',
        details: result.stderr
      });
    }

    // Parse the stdout to extract category information
    // The Python script outputs category info in a specific format
    const categories: CategoryInfo[] = [];

    // Known categories with their descriptions (can be extended)
    const categoryInfo: Record<string, Omit<CategoryInfo, 'name'>> = {
      budget: {
        displayName: 'Буџет и финансије',
        description: 'Подаци о државном и локалним буџетима, јавним финансијама и фискалној политици',
        keywords: ['budžet', 'finansije', 'prihodi', 'rashodi', 'javne nabavke'],
        exampleQueries: ['budžet srbije', 'javne nabavke', 'finansijski izveštaj']
      },
      demographics: {
        displayName: 'Демографија',
        description: 'Статистички подаци о становништву, попису, миграцијама и демографским тенденцијама',
        keywords: ['stanovništvo', 'popis', 'demografija', 'migracije', 'rodna struktura'],
        exampleQueries: ['popis stanovništva', 'demografske promene', 'migracije']
      },
      air_quality: {
        displayName: 'Квалитет ваздуха',
        description: 'Подаци о загађењу ваздуха, емисијама и меренју квалитета ваздуха',
        keywords: ['kvalitet vazduha', 'zagađenje', 'emisije', 'PM10', 'PM2.5', 'SO2', 'NO2'],
        exampleQueries: ['kvalitet vazduha beograd', 'PM10 koncentracija', 'emisije gasova']
      },
      energy: {
        displayName: 'Енергетика',
        description: 'Подаци о производњи и потрошњи енергије, обновљивим изворима и енергетској ефикасности',
        keywords: ['energija', 'struja', 'gas', 'nafta', 'obnovljivi izvori', 'električna energija'],
        exampleQueries: ['proizvodnja struje', 'potrošnja energije', 'obnovljivi izvori']
      },
      health: {
        displayName: 'Здравље',
        description: 'Здравствени подаци, статистика болести, капацитети здравственог система',
        keywords: ['zdravlje', 'bolnice', 'lekovi', 'osiguranje', 'epidemiologija'],
        exampleQueries: ['zdravstvene statistike', 'bolnički kapaciteti', 'epidemiološke mere']
      },
      education: {
        displayName: 'Образовање',
        description: 'Подаци о образовању, школама, универзитетима и образовним институцијама',
        keywords: ['obrazovanje', 'škole', 'univerziteti', 'učenici', 'studenti'],
        exampleQueries: ['osnovne škole', 'srednje obrazovanje', 'univerziteti']
      },
      transport: {
        displayName: 'Саобраћај',
        description: 'Подаци о друмском, железничком, ваздушном и водном саобраћају',
        keywords: ['saobraćaj', 'putevi', 'željeznica', 'aerodromi', 'transport'],
        exampleQueries: ['saobraćajna gustina', 'javni prevoz', 'puteva mreža']
      },
      environment: {
        displayName: 'Животна средина',
        description: 'Еколошки подаци, заштита природе, отпад и водни ресурси',
        keywords: ['životna sredina', 'ekologija', 'otpad', 'vode', 'priroda'],
        exampleQueries: ['otpadno gospodarstvo', 'kvalitet vode', 'zaštita prirode']
      },
      agriculture: {
        displayName: 'Пољопривреда',
        description: 'Подаци о пољопривредној производњи, сточарству и прехрамбеној индустрији',
        keywords: ['poljoprivreda', 'stočarstvo', 'žetva', 'usevi', 'hrana'],
        exampleQueries: ['poljoprivredna proizvodnja', 'žetveni prinosi', 'stočarstvo']
      },
      tourism: {
        displayName: 'Туризам',
        description: 'Подаци о туристичким капацитетима, посетама и туристичкој понуди',
        keywords: ['turizam', 'hoteli', 'smestaj', 'posetioci', 'atributi'],
        exampleQueries: ['turistički smestaj', 'broj noćenja', 'turističke atrakcije']
      }
    };

    // Extract categories from stdout or use predefined categories
    const stdout = result.stdout;
    const extractedCategories: string[] = [];

    // Try to extract categories from the Python script output
    const categoryMatches = stdout.match(/\s{2}(\w+):\s*\n/g);
    if (categoryMatches) {
      categoryMatches.forEach(match => {
        const category = match.trim().replace(':', '').toLowerCase();
        extractedCategories.push(category);
      });
    }

    // If extraction failed, use predefined categories
    const categoriesToUse = extractedCategories.length > 0
      ? extractedCategories
      : Object.keys(categoryInfo);

    // Build the response
    categoriesToUse.forEach(categoryName => {
      const info = categoryInfo[categoryName];
      if (info) {
        categories.push({
          name: categoryName,
          ...info
        });
      } else {
        // Add unknown category with minimal info
        categories.push({
          name: categoryName,
          displayName: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
          description: `Podaci vezani za ${categoryName}`,
          keywords: [categoryName],
          exampleQueries: [categoryName]
        });
      }
    });

    // Sort categories by display name
    categories.sort((a, b) => a.displayName.localeCompare(b.displayName, 'sr'));

    const response: CategoriesResponse = {
      success: true,
      data: categories
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Categories endpoint error:', error);

    const errorResponse: APIError = {
      success: false,
      error: 'Failed to fetch categories',
      code: 'CATEGORIES_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    return res.status(500).json(errorResponse);
  }
}