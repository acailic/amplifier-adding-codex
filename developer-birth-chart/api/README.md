# Developer Birth Chart API

A comprehensive API for the Personalized Developer Birth Chart project, featuring viral sharing, team analysis, premium monetization, and third-party integrations.

## 🚀 Features

### Core Functionality
- **Birth Chart Generation**: Advanced personality analysis based on GitHub profiles
- **Team Analysis**: Compatibility assessments and team dynamics insights
- **Social Media Integration**: Automated sharing across multiple platforms
- **Marketplace**: Developer services marketplace with Stripe Connect
- **Premium Subscriptions**: Tiered access with advanced features
- **Real-time Analytics**: Comprehensive tracking and insights
- **Error Monitoring**: Production-ready error handling with Sentry

### Social Media Integrations
- **Twitter**: Automated tweet generation with viral messaging
- **LinkedIn**: Professional sharing with career-focused content
- **Discord**: Interactive bot for team analysis and engagement
- **Image Generation**: Dynamic chart images for social sharing

### Enhanced GitHub Integration
- **Deep Analysis**: Comprehensive repository and contribution analysis
- **GitHub App**: Seamless authentication and webhook handling
- **GitHub Actions**: Workflow analysis for team insights
- **GitHub Sponsors**: Monetization through sponsor integrations

### Payment & Monetization
- **Stripe Connect**: Marketplace for developer services
- **Subscription Management**: Tiered plans with flexible billing
- **Transaction Processing**: Secure payment handling and receipts
- **Marketplace**: Connect developers with consulting opportunities

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Monitoring](#monitoring)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🛠 Installation

```bash
# Clone the repository
git clone https://github.com/your-org/developer-birth-chart.git
cd developer-birth-chart/api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/developer_birthchart
REDIS_URL=redis://localhost:6379

# Authentication
GITHUB_APP_ID=your_github_app_id
GITHUB_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
# your private key here
-----END PRIVATE KEY-----
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Social Media
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=https://your-app.com/api/linkedin/callback

DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_GUILD_ID=your_discord_guild_id
DISCORD_CHANNEL_ID=your_discord_channel_id

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# Email Service
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.your_api_key
EMAIL_FROM_EMAIL=noreply@developerbirthchart.com
EMAIL_FROM_NAME=Developer Birth Chart

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
MIXPANEL_TOKEN=your-mixpanel-token
GOOGLE_ANALYTICS_ID=GA-XXXXXXXX

# External Services
NEXT_PUBLIC_API_URL=https://api.developerbirthchart.com
NEXT_PUBLIC_APP_URL=https://developerbirthchart.com
NEXT_PUBLIC_APP_TWITTER=@devbirthchart
```

### Database Setup

```sql
-- Create database
CREATE DATABASE developer_birth_chart;

-- Create user table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) UNIQUE,
  github_username VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create birth_charts table
CREATE TABLE birth_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  github_username VARCHAR(255),
  birth_date TIMESTAMP,
  personality_data JSONB,
  skills_data JSONB,
  career_data JSONB,
  social_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_analyses table
CREATE TABLE team_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name VARCHAR(255),
  usernames TEXT[],
  analysis_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_github_username ON users(github_username);
CREATE INDEX idx_birth_charts_user_id ON birth_charts(user_id);
CREATE INDEX idx_birth_charts_username ON birth_charts(github_username);
```

## 📚 API Documentation

### Base URL
```
https://api.developerbirthchart.com/v1
```

### Core Endpoints

#### Birth Charts
- `POST /chart/generate` - Generate birth chart
- `GET /chart/{chartId}` - Get birth chart

#### Team Analysis
- `POST /team/analyze` - Analyze team compatibility
- `POST /team/build` - Build optimal team

#### Social Media
- `POST /share/{platform}` - Share to social media
- `GET /social/image/{chartId}` - Generate shareable image

#### Subscriptions
- `GET /subscriptions/plans` - Get available plans
- `POST /subscriptions/create` - Create subscription
- `POST /subscriptions/cancel` - Cancel subscription

#### Marketplace
- `GET /marketplace/products` - Get marketplace products
- `POST /marketplace/purchase` - Purchase product

### Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.developerbirthchart.com/v1/chart/generate
```

### Example Requests

#### Generate Birth Chart
```bash
curl -X POST https://api.developerbirthchart.com/v1/chart/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "octocat",
    "analysisDepth": "comprehensive",
    "includeHistoricalData": true
  }'
```

#### Analyze Team
```bash
curl -X POST https://api.developerbirthchart.com/v1/team/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "usernames": ["user1", "user2", "user3"],
    "depth": "comprehensive",
    "organization": "acme-corp"
  }'
```

#### Share to Twitter
```bash
curl -X POST https://api.developerbirthchart.com/v1/share/twitter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "chartId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Check out my Developer Birth Chart!",
    "image": true
  }'
```

## 🔐 Authentication

### GitHub OAuth Flow

1. **Authorization**: Redirect users to GitHub for authorization
2. **Callback**: Handle GitHub callback with authorization code
3. **Token Exchange**: Exchange code for access token
4. **User Creation**: Create or update user record

### JWT Tokens

- **Access Token**: 15-minute lifetime
- **Refresh Token**: 7-day lifetime
- **Scope**: User permissions and access levels

### Rate Limits

- **Free Tier**: 100 requests per hour
- **Premium Tier**: 1,000 requests per hour
- **Enterprise Tier**: 5,000 requests per hour

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🛡️ Security

### API Security
- **HTTPS Required**: All API calls must use HTTPS
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers

### Data Privacy
- **Data Encryption**: All sensitive data is encrypted at rest
- **PII Protection**: Personal information is protected according to GDPR
- **Data Retention**: User data is retained according to our privacy policy
- **Right to Delete**: Users can request deletion of their data

### Security Headers
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## 📊 Monitoring

### Error Tracking
- **Sentry Integration**: Comprehensive error tracking and alerting
- **Error Context**: Request ID and user context for debugging
- **Performance Monitoring**: Track API response times and bottlenecks
- **Custom Dashboards**: Real-time monitoring dashboards

### Analytics
- **Mixpanel**: User behavior tracking and funnel analysis
- **Google Analytics**: Page views and user acquisition
- **Custom Events**: Business metrics and KPI tracking
- **Performance Metrics**: API performance and user experience

### Logging
- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Log Levels**: Debug, Info, Warning, Error, Critical
- **Log Aggregation**: Centralized log collection and analysis
- **Alert Integration**: Automated alerting for critical issues

## 🚀 Deployment

### Production Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Configuration

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=developer_birthchart
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run type checking
        run: npm run type-check
      - name: Run linting
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  deploy:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deployment commands
          echo "Deploying to production..."
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **TypeScript**: Type safety

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.js

# Watch mode for development
npm run test:watch
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: Add new team analysis endpoint
fix: Resolve GitHub API rate limiting issue
docs: Update API documentation
refactor: Optimize database queries
test: Add tests for social media integration
```

### Pull Request Process

1. **Description**: Clear description of changes
2. **Tests**: Include tests for new functionality
3. **Documentation**: Update relevant documentation
4. **Review**: Code review process
5. **Approval**: Maintainers approve changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://developerbirthchart.com/docs](https://developerbirthchart.com/docs)
- **Support Email**: support@developerbirthchart.com
- **Issues**: [GitHub Issues](https://github.com/your-org/developer-birth-chart/issues)
- **Discord**: [Community Server](https://discord.gg/developerbirthchart)

## 🌟� Acknowledgments

- **GitHub API**: For providing comprehensive developer data
- **Stripe**: For payment processing and marketplace functionality
- **SendGrid**: For email delivery services
- **Sentry**: For error monitoring and tracking
- **Open Source Community**: For inspiration and contributions

---

Built with ❤️ by the Developer Birth Chart team