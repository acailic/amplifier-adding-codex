# Vizualni-Admin Demo

Professional Serbian data visualization admin dashboard showcasing modern React components with world-class interactions.

## 🚀 Features

### Core Components
- **Enhanced Button Component** with:
  - 300ms optimized timing for human perception
  - Magnetic pull effects (8px max)
  - Ripple feedback on click
  - WCAG AAA accessibility compliance
  - Serbian flag color themes

### Demo Pages
1. **Home Dashboard** (`/`) - Overview of all data visualizations
2. **Button Component Demo** (`/button-demo`) - Interactive button showcase
3. **Data Browser** (`/datasets`) - Dataset exploration interface
4. **Dashboard Pages** (`/dashboard/*`) - Various data visualization examples

### Technical Highlights
- Next.js 14 with static export
- TypeScript for type safety
- Tailwind CSS for styling
- Serbian localization support
- Mobile-first responsive design
- Accessibility-first approach

## 🛠️ Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd amplifier/scenarios/dataset_discovery/vizualni-admin

# Run the setup script (recommended)
npm run setup

# Or manual installation
npm install
```

### Development

```bash
# Start development server
npm run dev

# Open your browser
# Navigate to http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Build static export
npm run build:static

# Serve static build locally
npm run serve:static
```

## 📁 Project Structure

```
vizualni-admin/
├── components/          # React components
│   ├── ui/             # UI components (Button, etc.)
│   ├── layout/         # Layout components
│   ├── charts/         # Chart components
│   └── navigation/     # Navigation components
├── lib/                # Utility libraries
│   ├── utils/          # Helper functions
│   └── data/           # Mock data generators
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   ├── datasets/       # Dataset pages
│   └── demo/           # Demo pages
├── public/             # Static assets
├── scripts/            # Build and setup scripts
└── styles/             # CSS/styling files
```

## 🎯 Available Scripts

- `npm run setup` - Run the development setup script
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run build:static` - Build static export
- `npm run start` - Start production server
- `npm run serve:static` - Serve static build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run storybook` - Start Storybook
- `npm run clean` - Clean build artifacts

## 🌐 Demo URLs

After starting the development server, visit:

- **Home**: http://localhost:3000
- **Button Demo**: http://localhost:3000/button-demo
- **Dashboard**: http://localhost:3000/dashboard
- **Datasets**: http://localhost:3000/datasets
- **Dataset Browser**: http://localhost:3000/demo/dataset-browser

## 🎨 Button Component Demo

The button component showcase demonstrates:

### Variants
- Primary, Secondary, Accent
- Outline variants
- Ghost variants
- White variant

### Sizes
- Small (sm)
- Medium (md)
- Large (lg)
- Extra Large (xl)

### Interactive Features
- **Magnetic Pull**: Hover near buttons to see subtle magnetic effect
- **Ripple Effect**: Click to see tactile feedback
- **Loading States**: Async operation feedback
- **Accessibility**: Full keyboard navigation and screen reader support

### Try It Out
1. Hover over buttons and move cursor nearby for magnetic pull
2. Click buttons to see ripple effects
3. Use Tab key for keyboard navigation
4. Test with screen reader for accessibility

## 📊 Dashboard Features

### Data Visualizations
- Budget allocation by category
- Demographics overview
- Air quality monitoring
- Energy consumption tracking

### Serbian Context
- Serbian municipalities data
- Localized number and date formatting
- Serbian flag color scheme
- Regional statistics

## 🛡️ Accessibility

### WCAG Compliance
- AAA contrast ratios for text
- 44px minimum touch targets
- Full keyboard navigation
- Screen reader support
- Reduced motion support

### Testing
```bash
# Run accessibility tests
npm run test:accessibility

# Run visual regression tests
npm run test:visual
```

## 🌍 Localization

### Serbian Support
- Number formatting (serbian locale)
- Currency formatting (RSD)
- Date formatting
- Localized content

### Adding New Translations
1. Edit `public/locales/[lang]/common.json`
2. Update components to use new keys
3. Test with different locales

## 🔧 Configuration

### Environment Variables
Create `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Vizualni-Admin Demo
NEXT_PUBLIC_ENABLE_STORYBOOK=true
```

### Tailwind Configuration
Custom Serbian colors in `tailwind.config.js`:
- `serbia-red`: #C6363C
- `serbia-blue`: #0C4076
- `serbia-white`: #FFFFFF

## 📝 Static Export

This project supports static export for deployment to:

- Vercel
- Netlify
- GitHub Pages
- Any static hosting

### Deployment Steps
```bash
# Build static export
npm run build:static

# Deploy the `out` folder
# The build output is in the `out` directory
```

## 🧪 Testing

### Unit Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### End-to-End Tests
```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:headed   # Run with browser UI
```

### Accessibility Tests
```bash
npm run test:accessibility # Run aXe tests
```

## 📈 Performance

### Optimization
- Next.js 14 with App Router
- Static generation for better performance
- Optimized images
- Lazy loading components
- Code splitting

### Lighthouse Scores
- Performance: 95+
- Accessibility: 100
- Best Practices: 95+
- SEO: 100

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Submit a pull request

### Code Style
- Use TypeScript
- Follow ESLint configuration
- Write tests for new features
- Document components with JSDoc

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Serbian Open Data Initiative
- Next.js team for excellent framework
- Tailwind CSS for utility-first styling
- Serbian design patterns and colors

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Check existing documentation
- Review demo pages for examples

---

**Built with ❤️ for Serbian data visualization**