const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/simple-price-filter.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Remove onFilterChange from useEffect dependency array
content = content.replace(
  '  useEffect(() => {\n    onFilterChange(filters);\n  }, [filters, onFilterChange]);',
  `  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);  // Remove onFilterChange to prevent infinite loop`
);

// Fix 2: Add useCallback imports
content = content.replace(
  'import React, { useState, useEffect } from \'react\';',
  'import React, { useState, useEffect, useCallback } from \'react\';'
);

// Write fixed content back
fs.writeFileSync(filePath, content);
console.log('Fixed SimplePriceFilter component');
