const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages/cene.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add useCallback to imports
content = content.replace(
  'import React, { useState, useEffect } from \'react\';',
  'import React, { useState, useEffect, useCallback } from \'react\';'
);

// Fix 2: Wrap handleFilterChange in useCallback and add proper dependencies
const oldFunction = `  const handleFilterChange = (newFilters: PriceFilters) => {
    setFilters(newFilters);

    // Apply filters to data
    let filtered = priceData.filter(item => {
      // Category filter
      if (newFilters.categories.length > 0 && !newFilters.categories.includes(item.category)) {
        return false;
      }

      // Brand filter
      if (newFilters.brands.length > 0 && !newFilters.brands.includes(item.brand)) {
        return false;
      }

      // Price range filter
      if (item.currentPrice < newFilters.priceRange.min || item.currentPrice > newFilters.priceRange.max) {
        return false;
      }

      // Discount range filter
      const discountPercentage = ((item.originalPrice - item.currentPrice) / item.originalPrice) * 100;
      if (discountPercentage < newFilters.discountRange.min || discountPercentage > newFilters.discountRange.max) {
        return false;
      }

      // Date range filter
      if (newFilters.dateRange.start && item.lastUpdated < newFilters.dateRange.start) {
        return false;
      }
      if (newFilters.dateRange.end && item.lastUpdated > newFilters.dateRange.end) {
        return false;
      }

      return true;
    });

    setFilteredData(filtered);
  };`;

const newFunction = `  const handleFilterChange = useCallback((newFilters: PriceFilters) => {
    setFilters(newFilters);

    // Apply filters to data
    let filtered = priceData.filter(item => {
      // Category filter
      if (newFilters.categories.length > 0 && !newFilters.categories.includes(item.category)) {
        return false;
      }

      // Brand filter
      if (newFilters.brands.length > 0 && !newFilters.brands.includes(item.brand)) {
        return false;
      }

      // Price range filter
      if (item.currentPrice < newFilters.priceRange.min || item.currentPrice > newFilters.priceRange.max) {
        return false;
      }

      // Discount range filter
      const discountPercentage = ((item.originalPrice - item.currentPrice) / item.originalPrice) * 100;
      if (discountPercentage < newFilters.discountRange.min || discountPercentage > newFilters.discountRange.max) {
        return false;
      }

      // Date range filter
      if (newFilters.dateRange.start && item.lastUpdated < newFilters.dateRange.start) {
        return false;
      }
      if (newFilters.dateRange.end && item.lastUpdated > newFilters.dateRange.end) {
        return false;
      }

      return true;
    });

    setFilteredData(filtered);
  }, [priceData]);  // Add priceData as dependency`;

content = content.replace(oldFunction, newFunction);

// Write fixed content back
fs.writeFileSync(filePath, content);
console.log('Fixed pages/cene.tsx component');
