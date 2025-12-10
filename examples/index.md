# Examples

This directory contains example implementations of the @acailic/vizualni-admin package.

## 📁 Structure

- **`basic/`** - Simple implementation examples
- **`advanced/`** - Complex use cases with filtering and analytics
- **`typescript/`** - TypeScript-specific examples with type safety

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view examples

## 📋 Examples Overview

### Basic Dashboard (`basic/BasicDashboard.tsx`)

Shows:
- How to use the `PriceDashboardWrapper` component
- Individual chart components
- Basic data structure
- Simple styling with Tailwind CSS

### Advanced Analytics (`advanced/AnalyticsExample.tsx`)

Shows:
- Using the `PriceAnalyticsDashboard` component
- Implementing custom filters
- Data filtering and state management
- Real-time analytics updates
- Advanced chart configurations

### TypeScript Implementation (`typescript/TypedExample.tsx`)

Shows:
- Full TypeScript usage
- Custom type extensions
- Type-safe filtering with hooks
- Locale configuration
- Custom chart configurations

## 🛠️ Running Examples Locally

### Using Create React App

```bash
npx create-react-app my-app --template typescript
cd my-app
npm install @acailic/vizualni-admin tailwindcss
# Copy an example file to src/
npm start
```

### Using Next.js

```bash
npx create-next-app@latest my-app --typescript
cd my-app
npm install @acailic/vizualni-admin tailwindcss
# Copy an example file to pages/
npm run dev
```

### Using Vite

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install @acailic/vizualni-admin tailwindcss
# Copy an example file to src/
npm run dev
```

## 📝 Notes

- All examples use Tailwind CSS for styling
- Remember to configure Tailwind CSS in your project
- The sample data is for demonstration purposes only
- Replace with your actual price data for production use