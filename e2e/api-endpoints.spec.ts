import { test, expect } from '@playwright/test';

test.describe('API Endpoints Suite', () => {
  test('GET /api/price-data should return valid data', async ({ request }) => {
    const response = await request.get('/api/price-data');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('lastUpdated');
    
    // Check data structure
    expect(Array.isArray(data.data)).toBe(true);
    expect(typeof data.total).toBe('number');
    expect(typeof data.lastUpdated).toBe('string');
    
    if (data.data.length > 0) {
      const firstItem = data.data[0];
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('productName');
      expect(firstItem).toHaveProperty('price');
      expect(firstItem).toHaveProperty('currency');
      expect(firstItem).toHaveProperty('category');
    }
  });

  test('GET /api/price-data with category filter', async ({ request }) => {
    const response = await request.get('/api/price-data?category=Electronics');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.data.every(item => 
      item.category.toLowerCase().includes('electronics') ||
      item.categorySr?.toLowerCase().includes('electronics')
    )).toBe(true);
  });

  test('GET /api/price-data with price range filter', async ({ request }) => {
    const response = await request.get('/api/price-data?minPrice=50000&maxPrice=100000');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.data.every(item => 
      item.price >= 50000 && item.price <= 100000
    )).toBe(true);
  });

  test('GET /api/price-data with brand filter', async ({ request }) => {
    const response = await request.get('/api/price-data?brand=Dell');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.data.every(item => 
      item.brand?.toLowerCase().includes('dell')
    )).toBe(true);
  });

  test('API should handle invalid parameters gracefully', async ({ request }) => {
    const response = await request.get('/api/price-data?minPrice=invalid');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('API should return consistent data structure', async ({ request }) => {
    const response1 = await request.get('/api/price-data');
    const response2 = await request.get('/api/price-data');
    
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    
    const data1 = await response1.json();
    const data2 = await response2.json();
    
    // Check structure consistency
    expect(typeof data1.total).toBe(typeof data2.total);
    expect(Array.isArray(data1.data)).toBe(Array.isArray(data2.data));
  });
});
