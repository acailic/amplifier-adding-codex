#!/bin/bash

# Bundle size check script for vizualni-admin
# This script checks if the bundle size exceeds defined limits

set -e

# Configuration
MAX_BUNDLE_SIZE_KB=500  # Maximum bundle size in KB
MAX_CHUNK_SIZE_KB=150   # Maximum individual chunk size in KB

echo "🔍 Checking bundle sizes..."

# Navigate to the project directory
cd "$(dirname "$0")/.."

# Build the project if dist doesn't exist
if [ ! -d "dist" ]; then
    echo "🏗️ Building project..."
    npm run build
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found. Build failed."
    exit 1
fi

# Function to convert size to KB
function to_kb() {
    local size=$1
    echo $((size / 1024))
}

# Function to get human readable size
function human_size() {
    local size=$1
    if [ $size -lt 1024 ]; then
        echo "${size}B"
    elif [ $size -lt 1048576 ]; then
        echo "$((size / 1024))KB"
    else
        echo "$((size / 1048576))MB"
    fi
}

# Check individual bundle files
echo ""
echo "📦 Bundle file analysis:"

total_size=0
large_files=0

while IFS= read -r -d '' file; do
    if [[ "$file" == *.js || "$file" == *.css ]]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        size_kb=$(to_kb $size)
        total_size=$((total_size + size))

        relative_path=${file#dist/}
        human_readable=$(human_size $size)

        echo "  📄 $relative_path: $human_readable"

        if [ $size_kb -gt $MAX_CHUNK_SIZE_KB ]; then
            echo "    ⚠️  Large chunk detected: $size_kb KB (limit: $MAX_CHUNK_SIZE_KB KB)"
            large_files=$((large_files + 1))
        fi
    fi
done < <(find dist -type f \( -name "*.js" -o -name "*.css" \) -print0)

total_kb=$(to_kb $total_size)
total_human=$(human_size $total_size)

echo ""
echo "📊 Bundle size summary:"
echo "  Total size: $total_human ($total_kb KB)"
echo "  Large chunks: $large_files"

# Check total bundle size
if [ $total_kb -gt $MAX_BUNDLE_SIZE_KB ]; then
    echo "❌ Bundle size exceeds limit: $total_kb KB (limit: $MAX_BUNDLE_SIZE_KB KB)"

    # Provide recommendations
    echo ""
    echo "💡 Recommendations to reduce bundle size:"
    echo "  • Implement code splitting for large chunks"
    echo "  • Use dynamic imports for non-critical components"
    echo "  • Optimize imports (use tree-shaking)"
    echo "  • Compress assets and images"
    echo "  • Consider using a CDN for static assets"

    exit 1
else
    echo "✅ Bundle size within limits: $total_kb KB (limit: $MAX_BUNDLE_SIZE_KB KB)"
fi

# Check for potential optimization opportunities
echo ""
echo "🔍 Optimization opportunities:"

# Check for duplicate dependencies
if [ -f "package.json" ]; then
    echo "  📦 Checking for duplicate dependencies..."
    duplicates=$(npm ls --depth=0 --json 2>/dev/null | jq -r '.dependencies | keys | .[]' | sort | uniq -d || true)
    if [ -n "$duplicates" ]; then
        echo "    ⚠️  Potential duplicate dependencies found"
    else
        echo "    ✅ No obvious duplicate dependencies"
    fi
fi

# Check for unused exports (basic check)
echo "  🔍 Checking for potential unused exports..."
unused_exports=0

# Count exports vs actual usage
export_count=$(grep -r "export " src/ --include="*.ts" --include="*.tsx" | wc -l || echo "0")
if [ $export_count -gt 50 ]; then
    echo "    💡 Consider reviewing exports for potential tree-shaking opportunities"
fi

echo ""
echo "✅ Bundle size check completed successfully!"