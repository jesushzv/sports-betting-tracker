# BetTracker - Production Deployment Guide

This guide covers deploying BetTracker to production using Vercel and Neon PostgreSQL.

## Prerequisites

- GitHub repository with the code
- Vercel account
- Neon account (or other PostgreSQL provider)
- OAuth provider accounts (Google, Discord)

## 1. Database Setup (Neon)

### Create Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string
4. Set up database branching for staging/production

### Environment-Specific Databases

```bash
# Development
DATABASE_URL="postgresql://user:pass@localhost:5432/bettracker_dev"

# Staging
DATABASE_URL="postgresql://user:pass@staging.neon.tech/bettracker_staging"

# Production
DATABASE_URL="postgresql://user:pass@prod.neon.tech/bettracker_prod"
```

### Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

## 2. OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://staging.bettracker.com/api/auth/callback/google` (staging)
   - `https://bettracker.com/api/auth/callback/google` (production)

### Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 settings
4. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/discord` (dev)
   - `https://staging.bettracker.com/api/auth/callback/discord` (staging)
   - `https://bettracker.com/api/auth/callback/discord` (production)

## 3. Vercel Deployment

### Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Environment Variables

Set the following environment variables in Vercel:

#### Required Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

#### Optional Variables

```bash
# Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-token"

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-analytics-id"
```

### Custom Domain

1. In Vercel dashboard, go to your project
2. Go to Settings > Domains
3. Add your custom domain
4. Configure DNS records as instructed

## 4. CI/CD Setup

### GitHub Actions Secrets

Add these secrets to your GitHub repository:

```bash
# Vercel
VERCEL_TOKEN="your-vercel-token"
VERCEL_ORG_ID="your-org-id"
VERCEL_PROJECT_ID="your-project-id"

# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://yourdomain.com"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Monitoring
SLACK_WEBHOOK="your-slack-webhook-url"
```

### Branch Strategy

- `main` → Production deployment
- `develop` → Staging deployment
- Feature branches → Development testing

## 5. Monitoring Setup

### Sentry Configuration

1. Create Sentry project
2. Install Sentry CLI
3. Configure source maps upload

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Configure Sentry
sentry-cli login
sentry-cli projects list
```

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Add analytics ID to environment variables

## 6. Security Configuration

### Security Headers

The `vercel.json` file includes security headers:

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Rate Limiting

Consider implementing rate limiting for API endpoints:

```typescript
// Example rate limiting middleware
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
```

## 7. Performance Optimization

### Database Optimization

1. Add database indexes for frequently queried fields
2. Use connection pooling
3. Monitor query performance

### Next.js Optimization

1. Enable static generation where possible
2. Use Next.js Image optimization
3. Implement proper caching strategies

## 8. Backup Strategy

### Database Backups

Neon provides automatic daily backups. For additional safety:

1. Set up automated database dumps
2. Store backups in cloud storage
3. Test restore procedures regularly

### Code Backups

- GitHub provides code backup
- Consider additional backup solutions for critical data

## 9. Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] OAuth providers configured
- [ ] Domain DNS configured
- [ ] SSL certificates valid

### Post-Deployment

- [ ] Health check endpoint responding
- [ ] Authentication working
- [ ] Database connections stable
- [ ] Error monitoring active
- [ ] Analytics tracking
- [ ] Performance metrics normal

## 10. Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check connection limits

2. **OAuth Issues**
   - Verify redirect URIs match exactly
   - Check client ID/secret
   - Ensure OAuth app is active

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Check for TypeScript errors

4. **Performance Issues**
   - Monitor database query performance
   - Check for memory leaks
   - Optimize images and assets

### Monitoring

- Check Vercel function logs
- Monitor Sentry error reports
- Review Vercel Analytics
- Database performance metrics

## 11. Scaling Considerations

### Database Scaling

- Use read replicas for analytics queries
- Implement database sharding if needed
- Monitor connection pool usage

### Application Scaling

- Vercel automatically scales serverless functions
- Consider edge functions for global performance
- Implement caching strategies

### Cost Optimization

- Monitor Vercel usage and costs
- Optimize database queries
- Use appropriate instance sizes
- Implement efficient caching

## Support

For deployment issues:

1. Check Vercel documentation
2. Review GitHub Actions logs
3. Monitor Sentry for errors
4. Check database logs
5. Contact support if needed
