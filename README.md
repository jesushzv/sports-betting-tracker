# BetTracker - Sports Betting Tracker

A comprehensive web application for professional and amateur sports bettors to track their picks, record wins/losses, and monitor monetary performance across NFL, NBA, MLB, NHL, and UFC.

## Features

### Core Functionality

- **Pick Management**: Record and track betting picks with support for spreads, moneylines, over/under, and parlays
- **Performance Tracking**: Monitor win rates, profit/loss, and ROI across different sports and bet types
- **Bankroll Management**: Track deposits, withdrawals, and transaction history
- **Analytics Dashboard**: Detailed performance analysis with charts and insights
- **Demo Mode**: Try the app with realistic sample data before signing up
- **Multiple Authentication**: Sign up with email/password or OAuth providers (Google, Discord)

### Supported Sports

- NFL (National Football League)
- NBA (National Basketball Association)
- MLB (Major League Baseball)
- NHL (National Hockey League)
- UFC (Ultimate Fighting Championship)

### Bet Types

- Spread betting
- Moneyline betting
- Over/Under totals
- Parlay betting (coming soon)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers (Google, Discord) and email/password authentication
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or cloud)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sports-betting-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   Required environment variables:

   ```env
   # Database
   DATABASE_URL="your-postgresql-connection-string"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # OAuth Providers (Optional - email/password works without these)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   DISCORD_CLIENT_ID="your-discord-client-id"
   DISCORD_CLIENT_SECRET="your-discord-client-secret"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

   You can immediately explore the app in demo mode with realistic sample data, or sign up to start tracking your own bets!

## Authentication Setup

### Email/Password Authentication

Email/password authentication works out of the box with no additional setup required. Users can sign up with their email and password, and the system will handle password hashing and validation automatically.

### OAuth Setup (Optional)

OAuth providers are optional but provide a convenient sign-in experience for users.

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

#### Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/discord` (development)
   - `https://yourdomain.com/api/auth/callback/discord` (production)

## Database Schema

The application uses the following main entities:

- **Users**: User accounts with authentication (OAuth and email/password)
- **Picks**: Individual betting picks
- **Parlays**: Multi-leg betting combinations
- **ParlayLegs**: Links between parlays and individual picks
- **BankrollHistory**: Transaction history for deposits, withdrawals, wins, and losses

## API Endpoints

### Picks

- `GET /api/picks` - Get all picks for authenticated user (returns demo data for unauthenticated users)
- `POST /api/picks` - Create a new pick (requires authentication)
- `GET /api/picks/[id]` - Get specific pick (returns demo data for unauthenticated users)
- `PUT /api/picks/[id]` - Update pick (including settlement, requires authentication)
- `DELETE /api/picks/[id]` - Delete pick (requires authentication)

### Statistics

- `GET /api/stats` - Get user statistics and analytics data (returns demo data for unauthenticated users)

### Authentication

- `POST /api/auth/signup` - Create new account with email/password

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Set up database**
   - Use Vercel Postgres, Neon, or Supabase
   - Update `DATABASE_URL` in Vercel environment variables
   - Run migrations: `npx prisma db push`

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Usage

### Getting Started

1. **Try Demo Mode**: Visit the app and explore with realistic sample data
2. **Sign Up**: Create an account with email/password or use OAuth providers
3. **Start Tracking**: Begin recording your own betting picks

### Adding Picks

1. Sign in with your account (email/password, Google, or Discord)
2. Navigate to "Add Pick" from the dashboard
3. Fill in the pick details:
   - Sport (NFL, NBA, MLB, NHL, UFC)
   - Bet type (Spread, Moneyline, Over/Under)
   - Description (e.g., "Lakers -5.5")
   - Odds (American format: -110, +150)
   - Stake amount
   - Game date and time
4. The potential winnings are calculated automatically

### Managing Picks

1. View all picks on the "All Picks" page
2. Filter by sport, bet type, or status
3. Settle pending picks by marking them as Won, Lost, or Push
4. View detailed analytics on the Analytics page

### Analytics

- Overview statistics (win rate, profit/loss, ROI)
- Performance breakdown by sport and bet type
- Visual charts showing trends and distributions
- Bankroll history tracking

## Testing

### Prerequisites
Before running E2E tests, ensure Playwright browsers are installed:

```bash
npm run test:e2e:install
```

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# Smoke tests only
npm run test:smoke

# All tests
npm run test:all
```

### Test Setup
- Unit and integration tests use Jest with jsdom environment
- E2E tests use Playwright across multiple browser configurations (Chrome, Firefox, Safari, Mobile)
- Tests are configured with appropriate timeouts and retry strategies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Phase 1 (Current)

- ✅ Core pick management
- ✅ Basic analytics
- ✅ User authentication (OAuth + email/password)
- ✅ Dashboard
- ✅ Demo mode for visitors
- ✅ Parlay system
- ✅ Bankroll management

### Phase 2 (Planned)

- 🔄 Profile settings
- 🔄 Export functionality
- 🔄 Advanced analytics
- 🔄 Mobile optimization

### Phase 3 (Future)

- 📋 Social features (leaderboards, sharing)
- 📋 Mobile app
- 📋 Advanced analytics
- 📋 Betting tips integration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@bettracker.com or create an issue in the GitHub repository.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Database management with [Prisma](https://prisma.io/)
