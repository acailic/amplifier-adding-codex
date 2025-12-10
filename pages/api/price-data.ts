import type { NextApiRequest, NextApiResponse } from 'next';
import { PriceData } from '../../app/charts/price/types';
import { samplePriceData } from '../../app/charts/price/sample-data';

// In a real application, this would read from your amplifier/output directory
// For now, we'll use the sample data and simulate data updates

interface AnalyticsResponse {
  totalProducts: number;
  averagePrice: number;
  totalValue: number;
  discountRate: number;
  averageDiscount: number;
  categories: Record<string, { count: number; avgPrice: number; totalValue: number }>;
  retailers: Record<string, { count: number; avgPrice: number; discountRate: number }>;
  priceRanges: { budget: number; midRange: number; premium: number };
  availability: Record<string, number>;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Simulate reading from amplifier/output directory
    // const dataDir = path.join(process.cwd(), 'amplifier/output');
    // const files = fs.readdirSync(dataDir);

    // For now, return sample data with simulated freshness
    const lastUpdated = new Date().toISOString();

    // Simulate some data variation
    const data = samplePriceData.map(item => ({
      ...item,
      currentPrice: item.currentPrice * (0.95 + Math.random() * 0.1), // ±5% variation
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
      id: item.id || Math.random().toString(36).substring(7)
    }));

    // Handle different endpoints
    const { analytics, category, retailer, minPrice, maxPrice, discountOnly, search, sort = 'price', order = 'asc', page = '1', limit = '50' } = req.query;

    // Return analytics if requested
    if (analytics === 'true') {
      const computedAnalytics = computeAnalytics(data);
      return res.status(200).json({
        success: true,
        data: computedAnalytics,
        timestamp: new Date().toISOString()
      });
    }

    // Apply filters
    let filteredData = [...data];

    if (category && typeof category === 'string') {
      const categories = Array.isArray(category) ? category : [category];
      filteredData = filteredData.filter(item => categories.includes(item.category));
    }

    if (retailer && typeof retailer === 'string') {
      const retailers = Array.isArray(retailer) ? retailer : [retailer];
      filteredData = filteredData.filter(item => retailers.includes(item.retailer));
    }

    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (!isNaN(min)) {
        filteredData = filteredData.filter(item => (item.currentPrice || item.price || 0) >= min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (!isNaN(max)) {
        filteredData = filteredData.filter(item => (item.currentPrice || item.price || 0) <= max);
      }
    }

    if (discountOnly === 'true') {
      filteredData = filteredData.filter(item =>
        item.originalPrice && (item.currentPrice || item.price) && item.originalPrice > (item.currentPrice || item.price)
      );
    }

    if (search && typeof search === 'string') {
      const searchTerm = search.toLowerCase();
      filteredData = filteredData.filter(item =>
        (item.productNameSr && item.productNameSr.toLowerCase().includes(searchTerm)) ||
        (item.descriptionSr && item.descriptionSr.toLowerCase().includes(searchTerm)) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm))
      );
    }

    // Sorting
    const sortField = sort as keyof PriceData;
    const sortOrder = order === 'desc' ? -1 : 1;

    filteredData.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle currentPrice/price field
      if (sortField === 'price' || sortField === 'currentPrice') {
        aValue = (a.currentPrice || a.price || 0) as number;
        bValue = (b.currentPrice || b.price || 0) as number;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * sortOrder;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * sortOrder;
      }

      return 0;
    });

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Meta information
    const meta = {
      total: filteredData.length,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(filteredData.length / limitNum),
      hasMore: endIndex < filteredData.length,
      filters: {
        category,
        retailer,
        minPrice,
        maxPrice,
        discountOnly,
        search,
        sort,
        order
      }
    };

    res.status(200).json({
      success: true,
      data: paginatedData,
      meta,
      lastUpdated,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching price data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price data',
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 50,
        pages: 0,
        hasMore: false,
        filters: {}
      },
      lastUpdated: new Date().toISOString(),
      timestamp: new Date().toISOString()
    });
  }
}

function computeAnalytics(data: PriceData[]): AnalyticsResponse {
  const totalProducts = data.length;
  const totalValue = data.reduce((sum, item) => sum + (item.currentPrice || item.price || 0), 0);
  const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;

  // Discount analytics
  const productsWithDiscount = data.filter(item =>
    item.originalPrice && (item.currentPrice || item.price) && item.originalPrice > (item.currentPrice || item.price)
  );
  const discountRate = (productsWithDiscount.length / totalProducts) * 100;
  const averageDiscount = productsWithDiscount.length > 0
    ? productsWithDiscount.reduce((sum, item) => {
        const discount = ((item.originalPrice! - (item.currentPrice || item.price)) / item.originalPrice!) * 100;
        return sum + discount;
      }, 0) / productsWithDiscount.length
    : 0;

  // Category analytics
  const categoryStats = data.reduce((acc, item) => {
    const category = item.categorySr || item.category || 'Ostalo';
    if (!acc[category]) {
      acc[category] = { count: 0, totalValue: 0, avgPrice: 0 };
    }
    acc[category].count++;
    acc[category].totalValue += (item.currentPrice || item.price || 0);
    acc[category].avgPrice = acc[category].totalValue / acc[category].count;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number; avgPrice: number }>);

  // Retailer analytics
  const retailerStats = data.reduce((acc, item) => {
    const retailer = item.retailerName || item.retailer || 'Ostalo';
    if (!acc[retailer]) {
      acc[retailer] = {
        count: 0,
        totalValue: 0,
        avgPrice: 0,
        discountCount: 0
      };
    }
    acc[retailer].count++;
    acc[retailer].totalValue += (item.currentPrice || item.price || 0);
    acc[retailer].avgPrice = acc[retailer].totalValue / acc[retailer].count;

    if (item.originalPrice && (item.currentPrice || item.price) && item.originalPrice > (item.currentPrice || item.price)) {
      acc[retailer].discountCount++;
    }

    return acc;
  }, {} as Record<string, { count: number; totalValue: number; avgPrice: number; discountCount: number }>);

  // Calculate additional retailer metrics
  const retailerStatsFinal = Object.keys(retailerStats).reduce((acc, retailer) => {
    const stats = retailerStats[retailer];
    acc[retailer] = {
      count: stats.count,
      avgPrice: stats.avgPrice,
      discountRate: stats.count > 0 ? (stats.discountCount / stats.count) * 100 : 0
    };
    return acc;
  }, {} as Record<string, { count: number; avgPrice: number; discountRate: number }>);

  // Price range analytics
  const priceRanges = {
    budget: data.filter(item => (item.currentPrice || item.price || 0) < 5000).length,
    midRange: data.filter(item => (item.currentPrice || item.price || 0) >= 5000 && (item.currentPrice || item.price || 0) < 20000).length,
    premium: data.filter(item => (item.currentPrice || item.price || 0) >= 20000).length
  };

  // Availability analytics
  const availabilityStats = data.reduce((acc, item) => {
    const status = item.availability || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalProducts,
    averagePrice,
    totalValue,
    discountRate,
    averageDiscount,
    categories: categoryStats,
    retailers: retailerStatsFinal,
    priceRanges,
    availability: availabilityStats
  };
}