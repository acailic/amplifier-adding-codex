import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Code,
  Database,
  BarChart3,
  Settings,
  Book,
  Download,
  Upload,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  subsections?: DocSection[];
}

export default function DocumentationPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const codeExamples = {
    basicUsage: `import { PriceData, PriceDashboard } from '../app/charts/price';

// Definišite podatke
const priceData: PriceData[] = [
  {
    id: '1',
    productId: 'prod-001',
    productName: 'iPhone 13 Pro',
    productNameSr: 'iPhone 13 Pro',
    retailer: 'gadget',
    retailerName: 'Gadget',
    price: 129990,
    originalPrice: 139990,
    currency: 'RSD',
    discount: 7.1,
    category: 'electronics',
    categorySr: 'Elektronika',
    brand: 'Apple',
    availability: 'in_stock',
    timestamp: '2024-01-15T10:00:00Z'
  }
];

// Koristite komponentu
<PriceDashboard data={priceData} />`,

    advancedFiltering: `import { usePriceData } from '../hooks/use-price-data';

function MyComponent() {
  const { data, loading, error, filters, setFilters } = usePriceData();

  const handleFilterChange = (newFilters) => {
    setFilters({
      categories: ['electronics', 'clothing'],
      priceRange: { min: 1000, max: 50000 },
      discountOnly: true,
      ...newFilters
    });
  };

  return (
    <div>
      <PriceFilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        categories={data?.categories || []}
        retailers={data?.retailers || []}
      />
      <PriceCharts data={data?.filtered || []} />
    </div>
  );
}`,

    apiIntegration: `// GET /api/price-data
// Query parameters:
// - category: Filter by category
// - retailer: Filter by retailer
// - minPrice: Minimum price
// - maxPrice: Maximum price
// - discountOnly: Only products with discounts
// - search: Search term
// - sort: Sort field (price, name, discount)
// - order: Sort order (asc, desc)
// - page: Page number
// - limit: Items per page
// - analytics: Return analytics instead of data (true/false)

const response = await fetch('/api/price-data?category=electronics&discountOnly=true&analytics=true');
const { success, data } = await response.json();`,

    customComponents: `import { SimplePriceTrendChart } from '../components/price-charts-simple';
import { EnhancedPriceTrendChart } from '../components/enhanced-price-charts';

// Prilagođena tema
const customTheme = {
  colors: {
    primary: '#1e40af',
    secondary: '#dc2626',
    success: '#16a34a',
    warning: '#d97706'
  },
  borderRadius: '12px',
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px'
  }
};

function CustomPriceDashboard({ data }) {
  return (
    <div className="space-y-6">
      <EnhancedPriceTrendChart
        data={data}
        timeRange="30d"
        showForecast={true}
      />
      <SimplePriceComparisonChart
        data={data.slice(0, 10)}
        theme={customTheme}
      />
    </div>
  );
}`
  };

  const sections: DocSection[] = [
    {
      id: 'overview',
      title: 'Pregled',
      icon: Book,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Cenovnici vizuelizacija sistem je sveobuhvatno rešenje za analizu, praćenje i vizuelizaciju cena proizvoda u Srbiji.
            Sistem pruža napredne alate za praćenje trendova, poređenje cena i analizu tržišta.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Ključne karakteristike</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Real-time praćenje cena</li>
                <li>• Više vrsta grafikona</li>
                <li>• Napredni filteri</li>
                <li>• Export podataka</li>
                <li>• Responsive dizajn</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Tehnologije</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Next.js 14+ / React 18</li>
                <li>• TypeScript</li>
                <li>• Recharts za vizuelizaciju</li>
                <li>• Tailwind CSS</li>
                <li>• Framer Motion animacije</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Početak rada',
      icon: Settings,
      subsections: [
        {
          id: 'installation',
          title: 'Instalacija',
          icon: Download,
          content: (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Instalacija zavisnosti</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`npm install recharts framer-motion lucide-react
# ili
yarn add recharts framer-motion lucide-react`}</code>
                </pre>
              </div>

              <h4 className="font-semibold text-gray-900 mt-6">Postavka projekta</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{`# Struktura direktorijuma
src/
├── app/charts/price/
│   ├── types.ts
│   ├── utils.ts
│   └── sample-data.ts
├── components/
│   ├── price-charts-simple.tsx
│   ├── enhanced-price-charts.tsx
│   └── price-analytics-dashboard.tsx
└── pages/
    ├── cene-demo.tsx
    └── api/
        └── price-data.ts`}</code>
                </pre>
              </div>
            </div>
          )
        },
        {
          id: 'basic-usage',
          title: 'Osnovna upotreba',
          icon: Code,
          content: (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Podaci o cenama</h4>
              <p className="text-gray-600">
                Svi podaci moraju slediti definiciju <code className="bg-gray-100 px-2 py-1 rounded">PriceData</code> interfejsa.
              </p>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{codeExamples.basicUsage}</code>
                </pre>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Napomena:</strong> Uverite se da svi obavezni polja (id, productName, price, category) su prisutni
                      u podacima. Komponente će automatski prilagoditi prikaz na osnovu dostupnih informacija.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'components',
      title: 'Komponente',
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">SimplePriceTrendChart</h4>
              <p className="text-sm text-gray-600 mb-3">
                Prikazuje trend cena kroz vreme sa linijama za trenutnu i originalnu cenu.
              </p>
              <div className="bg-gray-100 rounded p-2">
                <code className="text-xs text-gray-700">
                  {`<SimplePriceTrendChart data={priceData} />`}
                </code>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">EnhancedPriceTrendChart</h4>
              <p className="text-sm text-gray-600 mb-3">
                Napredna verzija sa prognozama i više vremenskih perioda.
              </p>
              <div className="bg-gray-100 rounded p-2">
                <code className="text-xs text-gray-700">
                  {`<EnhancedPriceTrendChart
  data={priceData}
  timeRange="30d"
  showForecast
/>`}
                </code>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">PriceScatterPlot</h4>
              <p className="text-sm text-gray-600 mb-3">
                Raspršeni grafikon za analizu odnosa cena i popusta.
              </p>
              <div className="bg-gray-100 rounded p-2">
                <code className="text-xs text-gray-700">
                  {`<PriceScatterPlot data={priceData} />`}
                </code>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">PriceAnalyticsDashboard</h4>
              <p className="text-sm text-gray-600 mb-3">
                Kompletni dashboard sa svim analitičkim prikazima.
              </p>
              <div className="bg-gray-100 rounded p-2">
                <code className="text-xs text-gray-700">
                  {`<PriceAnalyticsDashboard
  data={priceData}
  autoRefresh
/>`}
                </code>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: Database,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Endpoints</h4>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">GET /api/price-data</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Vraća paginirane podatke o cenama sa opcionalnim filtrima.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300">
                    <code>{codeExamples.apiIntegration}</code>
                  </pre>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Response format</h5>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300">
                    <code>{`{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "pages": 3,
    "hasMore": true,
    "filters": { ... }
  },
  "lastUpdated": "2024-01-15T10:00:00Z",
  "timestamp": "2024-01-15T10:30:00Z"
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Available Filters</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm"><code className="bg-gray-100 px-1 rounded">category</code></td>
                    <td className="px-4 py-2 text-sm">string|array</td>
                    <td className="px-4 py-2 text-sm">Filter by category</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm"><code className="bg-gray-100 px-1 rounded">retailer</code></td>
                    <td className="px-4 py-2 text-sm">string|array</td>
                    <td className="px-4 py-2 text-sm">Filter by retailer</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm"><code className="bg-gray-100 px-1 rounded">minPrice</code></td>
                    <td className="px-4 py-2 text-sm">number</td>
                    <td className="px-4 py-2 text-sm">Minimum price</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm"><code className="bg-gray-100 px-1 rounded">maxPrice</code></td>
                    <td className="px-4 py-2 text-sm">number</td>
                    <td className="px-4 py-2 text-sm">Maximum price</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm"><code className="bg-gray-100 px-1 rounded">discountOnly</code></td>
                    <td className="px-4 py-2 text-sm">boolean</td>
                    <td className="px-4 py-2 text-sm">Only discounted products</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm"><code className="bg-gray-100 px-1 rounded">analytics</code></td>
                    <td className="px-4 py-2 text-sm">boolean</td>
                    <td className="px-4 py-2 text-sm">Return analytics data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'examples',
      title: 'Primeri',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Advanced Filtering</h4>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{codeExamples.advancedFiltering}</code>
              </pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Custom Components</h4>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{codeExamples.customComponents}</code>
              </pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Export Functionality</h4>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{`function exportToCSV(data: PriceData[], filename: string) {
  const headers = [
    'Naziv', 'Kategorija', 'Prodavac', 'Cena', 'Originalna cena', 'Popust (%)'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      \`"\${item.productNameSr}"\`,
      \`"\${item.categorySr}"\`,
      \`"\${item.retailerName}"\`,
      item.price,
      item.originalPrice || '',
      item.originalPrice ?
        \`"\${((item.originalPrice - item.price) / item.originalPrice * 100).toFixed(2)}%"\` : ''
    ].join(','))
  ].join('\\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = \`\${filename}.csv\`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'best-practices',
      title: 'Najbolje prakse',
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Preporučeno
              </h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Koristite TypeScript za tip bezbednost</li>
                <li>• Implementirajte caching za API pozive</li>
                <li>• Dodajte loading stanja za bolji UX</li>
                <li>• Koristite lazy loading za velike dataset-ove</li>
                <li>• Optimizujte renderovanje grafikona</li>
                <li>• Dodajte error handling granice</li>
                <li>• Koristite Server Components gde je moguće</li>
                <li>• Implementirajte pagination za velike dataset-ove</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Izbegavajte
              </h4>
              <ul className="space-y-2 text-sm text-red-700">
                <li>• Ne učitavajte sve podatke odjednom</li>
                <li>• Ne koristite inline stileve za grafikone</li>
                <li> Ne zaboravite na cleanup useEffect-ova</li>
                <li>• Ne pravite hardkodirane vrednosti</li>
                <li>• Ne ignorišite error stanja</li>
                <li>• Ne koristite blocking operacije</li>
                <li>• Ne zaboravite na SEO optimizaciju</li>
                <li>• Ne testirajte samo na desktop-u</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Performance optimizacija
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-2">Data Loading</p>
                <ul className="space-y-1">
                  <li>• Koristite React.memo za komponente</li>
                  <li>• Implementirajte virtual scrolling</li>
                  <li>• Koristite Web Workers za obradu</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Chart Rendering</p>
                <ul className="space-y-1">
                  <li>• Limitirajte broj tačaka</li>
                  <li>• Koristite debouncing za filtere</li>
                  <li>• Implementirajte lazy loading</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Memory Management</p>
                <ul className="space-y-1">
                  <li>• Cleanup event listenere</li>
                  <li>• Koristite WeakMap za cache</li>
                  <li>• Optimizujte bundle veličinu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const renderSection = (section: DocSection, level = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const hasSubsections = section.subsections && section.subsections.length > 0;

    return (
      <div key={section.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div
          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
            isExpanded ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center space-x-3">
            <section.icon className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
          </div>
          {hasSubsections && (
            <ChevronRight
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          )}
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-2"
          >
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              {section.content}
            </div>

            {hasSubsections && (
              <div className="mt-4 space-y-2">
                {section.subsections!.map(subsection => renderSection(subsection, level + 1))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Dokumentacija - Cenovnici Vizualizacija</title>
        <meta name="description" content="Kompletna dokumentacija za cenovnici vizuelizacijski sistem" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dokumentacija
            </h1>
            <p className="text-lg text-gray-600">
              Sveobuhvodi vodič za Cenovnici vizuelizacijski sistem
            </p>
          </div>

          <div className="space-y-4">
            {sections.map(section => renderSection(section))}
          </div>

          <div className="mt-12 bg-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Potrebna pomoć?</h3>
            <p className="mb-4">
              Ako imate pitanja ili vam je potrebna dodatna podrška, slobodno nas kontaktirajte.
            </p>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors">
                Kontaktirajte nas
              </button>
              <a
                href="https://github.com/your-repo/cenovnici"
                className="px-4 py-2 border border-white rounded-md hover:bg-white/10 transition-colors"
              >
                GitHub Repository
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}