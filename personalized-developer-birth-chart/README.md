# Personalized Developer Birth Chart - Backend API

A comprehensive backend system for generating personalized "birth charts" for developers based on their GitHub activity patterns, with advanced monetization and viral growth features.

## 🚀 Features

### Core Functionality
- **GitHub Profile Analysis**: Deep analysis of developer patterns, coding styles, and collaboration behaviors
- **Birth Chart Generation**: Astrology-inspired personality mapping based on development patterns
- **Team Constellation Analysis**: Advanced team dynamics and compatibility scoring
- **Real-time Chart Generation**: Fast, scalable chart generation with caching

### Monetization System
- **5-Tier Subscription Model**: Free, Starter ($5/mo), Pro ($15/mo), Team ($49/mo), Enterprise (Custom)
- **Usage-Based Feature Gating**: Dynamic access control based on subscription tier
- **Stripe Integration**: Complete payment processing with webhooks
- **Subscription Management**: Upgrade, downgrade, pause, cancel functionality
- **Automatic Billing**: Seamless subscription lifecycle management

### Viral Growth System
- **Referral Tracking**: Unique referral codes with reward system
- **Viral Coefficient Analytics**: Comprehensive viral metrics tracking
- **Multi-Platform Sharing**: Built-in sharing with tracking for Twitter, LinkedIn, email
- **Conversion Funnel Analysis**: Detailed referral conversion tracking
- **Reward System**: Tiered rewards based on referrer's subscription level

### Advanced Features
- **Team Management**: Create teams, invite members, constellation analysis
- **Achievement System**: Unlock achievements based on usage and referrals
- **Usage Analytics**: Detailed usage tracking and limits
- **Export Capabilities**: Multiple export formats (PNG, SVG, PDF) for premium users
- **Social Media Asset Generation**: Automated social sharing assets

## 🏗️ Architecture

### Database (Supabase)
- **PostgreSQL** with **Row Level Security (RLS)**
- **Real-time subscriptions** for live updates
- **Automated backups** and point-in-time recovery
- **Edge functions** for global distribution

### Authentication & Security
- **JWT-based authentication** with refresh tokens
- **Rate limiting** with Redis-backed storage
- **Input validation** using Zod schemas
- **CORS configuration** for cross-origin requests
- **Audit logging** for security monitoring

### API Design
- **RESTful endpoints** with consistent response format
- **OpenAPI documentation** for all endpoints
- **Error handling** with proper HTTP status codes
- **Middleware pattern** for auth, rate limiting, and feature gating
- **Type-safe** with TypeScript throughout

### Integration Services
- **GitHub API** for developer data analysis
- **Stripe** for payment processing
- **Redis** for caching and session management
- **Canvas/Sharp** for image generation and export

## 📊 Database Schema

### Core Tables
```sql
users                    -- User profiles and authentication
subscriptions            -- Subscription management
developer_charts        -- Generated birth charts
teams                   -- Team management
team_members            -- Team membership relationships
referrals               -- Referral tracking and rewards
viral_metrics          -- Viral growth analytics
usage_tracking          -- Usage analytics and limits
achievements           -- Achievement system
sharing_events        -- Social sharing tracking
```

### Key Relationships
- Users → Subscriptions (1:1)
- Users → Developer Charts (1:N)
- Users → Teams (1:N)
- Teams → Team Members (1:N)
- Users → Referrals (1:N)
- Users → Achievements (1:N)

## 🔧 API Endpoints

### Charts Management
```
POST   /api/charts              -- Generate new birth chart
GET    /api/charts              -- Get user's charts
GET    /api/charts/[id]         -- Get specific chart
POST   /api/charts/[id]         -- Export/share chart
```

### Subscriptions
```
POST   /api/subscriptions       -- Create subscription checkout
GET    /api/subscriptions       -- Get current subscription
PUT    /api/subscriptions       -- Update subscription
GET    /api/subscriptions/plans -- Get pricing plans
```

### Teams
```
POST   /api/teams              -- Create team
GET    /api/teams              -- Get user's teams
GET    /api/teams/[id]         -- Get team details
PUT    /api/teams/[id]         -- Update team
POST   /api/teams/[id]/members -- Add members
```

### Referrals & Analytics
```
POST   /api/referrals           -- Generate referral code
GET    /api/referrals           -- Get user's referrals
PUT    /api/referrals           -- Apply referral code
GET    /api/referrals/stats     -- Get referral statistics
```

### Webhooks
```
POST   /api/webhooks/stripe     -- Stripe webhook handler
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Supabase account
- Stripe account
- GitHub Personal Access Token

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd personalized-developer-birth-chart
npm install
```

2. **Environment configuration**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Database setup**
```bash
# Run Supabase migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

4. **Start development server**
```bash
npm run dev
```

### Environment Variables

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# GitHub
GITHUB_TOKEN=ghp_...

# Redis
REDIS_URL=redis://localhost:6379

# Application
NEXT_PUBLIC_APP_URL=https://your-app.com
API_URL=https://your-api.com

# Security
JWT_SECRET=your-super-secret-jwt-key

# Features
ENABLE_TEAM_FEATURES=true
ENABLE_ADVANCED_ANALYTICS=true
ENABLE_REAL_TIME_UPDATES=true
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
npm run test:load
```

### Coverage Report
```bash
npm run test:coverage
```

## 📈 Usage & Analytics

### Key Metrics Tracked
- **Chart Generation**: Usage by tier, popular GitHub usernames
- **Team Analysis**: Team sizes, constellation patterns
- **Referral Performance**: Conversion rates, viral coefficient
- **Subscription Metrics**: Churn, LTV, upgrade/downgrade patterns
- **Feature Adoption**: Premium feature usage rates

### Analytics Dashboards
- **User Analytics**: Active users, chart generation trends
- **Revenue Analytics**: MRR, subscription distribution
- **Viral Analytics**: Referral performance, sharing patterns
- **Team Analytics**: Team creation, member growth

## 🔒 Security Features

### Authentication & Authorization
- **JWT tokens** with expiration and refresh
- **Role-based access control** (RBAC)
- **Team membership** validation
- **Feature-level gating** based on subscription

### Rate Limiting
- **IP-based limiting** for anonymous users
- **User-based limiting** for authenticated users
- **Endpoint-specific limits** (auth, API calls, exports)
- **Usage-based throttling** for premium features

### Data Protection
- **Input validation** with Zod schemas
- **SQL injection prevention** with parameterized queries
- **Row-level security** in database
- **Audit logging** for sensitive operations

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build image
docker build -t dev-birth-chart .

# Run container
docker run -p 3000:3000 dev-birth-chart
```

### Environment-Specific Configuration
- **Development**: Local database, test Stripe keys
- **Staging**: Staging database, test Stripe environment
- **Production**: Production database, live Stripe environment

## 📚 API Documentation

### Authentication
All API endpoints (except auth endpoints) require a Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": { ... },
    "usage": { ... }
  }
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## 🔄 Webhook Integration

### Stripe Webhooks
Configure these webhook endpoints in your Stripe dashboard:
- **Customer Created**: `api/webhooks/stripe`
- **Subscription Created**: `api/webhooks/stripe`
- **Subscription Updated**: `api/webhooks/stripe`
- **Subscription Deleted**: `api/webhooks/stripe`
- **Invoice Paid**: `api/webhooks/stripe`
- **Invoice Failed**: `api/webhooks/stripe`

### Webhook Security
- Signature verification using Stripe secret
- Idempotency handling for duplicate events
- Error logging and retry mechanisms

## 🎯 Monetization Strategy

### Pricing Tiers
- **Free**: 3 charts/month, basic features
- **Starter**: $5/mo, 25 charts/month, 3 team members
- **Pro**: $15/mo, 250 charts/month, 10 team members, advanced features
- **Team**: $49/mo, 1000 charts/month, 25 team members, priority support
- **Enterprise**: Custom pricing, unlimited everything

### Revenue Optimization
- **Freemium funnel**: Free tier drives premium upgrades
- **Team features**: B2B revenue through team plans
- **Referral program**: Viral growth with reward incentives
- **Usage-based upgrades**: Natural upgrade paths as usage grows

## 🔍 Monitoring & Observability

### Application Metrics
- **Response times** and error rates
- **Database query performance**
- **Cache hit rates**
- **Authentication success/failure rates**

### Business Metrics
- **Chart generation volume**
- **Subscription conversion rates**
- **Referral conversion rates**
- **Team creation and growth**

### Monitoring Tools
- **Application logs** with structured JSON
- **Error tracking** and alerting
- **Performance monitoring** with APM
- **Database monitoring** with query analysis

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes with tests
4. **Ensure** all tests pass
5. **Submit** a pull request

### Code Standards
- **TypeScript** with strict mode
- **ESLint** and **Prettier** formatting
- **100% test coverage** for new features
- **Documentation** for all public APIs

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For technical support or questions:
- **Documentation**: Check this README and inline code documentation
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@devbirthchart.com for enterprise inquiries

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core chart generation
- ✅ Subscription system
- ✅ Team management
- ✅ Referral system

### Phase 2 (Q1 2024)
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app integration
- 🔄 API v2 with GraphQL
- 🔄 Enhanced export features

### Phase 3 (Q2 2024)
- 📅 AI-powered insights
- 📅 Integration with additional platforms
- 📅 Enterprise SSO
- 📅 Advanced team analytics

---

Built with ❤️ using Next.js, TypeScript, Supabase, and Stripe.