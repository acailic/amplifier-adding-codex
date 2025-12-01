# Developer Birth Chart - PWA

A Progressive Web App that analyzes GitHub profiles to generate astrological-style personality insights for developers. Built with React, TypeScript, and mobile-first design principles.

## ✨ Features

### 🚀 Core Features
- **GitHub Profile Analysis**: Analyze coding patterns, languages, and activity
- **Personality Insights**: Generate astrological-style personality profiles
- **Interactive Constellations**: Beautiful data visualization of developer DNA
- **Team Compatibility**: Compare developers and analyze team dynamics
- **Career Path Analysis**: Predict future growth and opportunities

### 📱 PWA Features
- **Mobile-First Design**: Optimized for touch interactions and gestures
- **Offline Support**: Core functionality works without internet connection
- **App Installation**: Install on home screen for native app experience
- **Push Notifications**: Get alerts for cosmic code events and updates
- **Background Sync**: Automatically sync data when connection returns
- **Share Integration**: Native share sheets for charts and insights

### ⚡ Performance
- **Progressive Loading**: Skeleton screens and lazy loading
- **Smart Caching**: GitHub API responses cached for offline use
- **Code Splitting**: Optimized bundle sizes with dynamic imports
- **Image Optimization**: Responsive images with WebP support
- **Touch-Optimized**: 60fps animations and haptic feedback

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with mobile-first approach
- **Animations**: Framer Motion for smooth interactions
- **Data Visualization**: D3.js for constellation charts
- **State Management**: Zustand for local state
- **Data Fetching**: TanStack Query with caching
- **PWA**: Vite PWA plugin with Workbox
- **UI Components**: Radix UI for accessibility

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn or pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/developer-birth-chart.git
cd developer-birth-chart
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your GitHub Personal Access Token
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**
```bash
# Navigate to http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# GitHub API
VITE_GITHUB_TOKEN=your_github_personal_access_token
VITE_GITHUB_API_URL=https://api.github.com

# Analytics (Optional)
VITE_GA_TRACKING_ID=your_google_analytics_id

# Push Notifications (Optional)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### GitHub Personal Access Token

Create a GitHub Personal Access Token with these permissions:
- `public_repo` (Access public repositories)
- `read:org` (Read org membership - optional)

## 📱 Mobile Features

### Touch Interactions
- **Swipe Navigation**: Left/right swipe between pages
- **Pinch to Zoom**: Zoom in/out on constellation charts
- **Long Press**: Context menus and additional options
- **Pull to Refresh**: Sync latest GitHub data

### Haptic Feedback
- **Chart Generation**: Feedback when analysis completes
- **Button Presses**: Subtle vibration for interactions
- **Error Alerts**: Distinct patterns for different error types

### Mobile Sharing
- **Instagram Stories**: Share charts as Instagram story templates
- **Native Share**: Share insights via system share sheet
- **WhatsApp**: Direct sharing to WhatsApp contacts
- **Email**: Export charts and analysis via email

## 🔒 Security & Privacy

- **Client-Side Processing**: Analysis happens in your browser
- **No Data Storage**: We don't store your GitHub data on our servers
- **Public Data Only**: Only accesses publicly available GitHub information
- **Privacy First**: GDPR compliant with minimal data collection
- **Secure Storage**: Local storage encrypted for saved charts

## 📊 Performance Metrics

- **First Contentful Paint**: < 1.5s on 3G
- **Largest Contentful Paint**: < 2.5s on 3G
- **Time to Interactive**: < 3s on 3G
- **Bundle Size**: < 200KB gzipped
- **Lighthouse Score**: 95+ across all categories

## 🌐 Browser Support

- **Chrome 88+** (Recommended)
- **Firefox 85+**
- **Safari 14+**
- **Edge 88+

**Mobile Support**:
- **iOS Safari 14+**
- **Chrome Mobile 88+**
- **Samsung Internet 15+**

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Preview Build

```bash
npm run preview
# or
yarn preview
```

### Deploy to Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variables

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on mobile and desktop
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: https://devbirthchart.com
- **API Documentation**: https://docs.devbirthchart.com
- **Support**: https://github.com/your-username/developer-birth-chart/issues
- **Discord Community**: https://discord.gg/devbirthchart

## 🙏 Acknowledgments

- GitHub API for providing developer data
- D3.js for amazing data visualization capabilities
- Vercel for excellent hosting and deployment experience
- The PWA community for inspiration and best practices

---

**Developer Birth Chart** - Discover your developer personality through the cosmic patterns of your code. 🌟