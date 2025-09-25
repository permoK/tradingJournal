# TradeFlow Deployment Guide

## Environment Configuration

### Development
- Port: 3000 (fixed, no auto-switching)
- URL: http://localhost:3000
- Database: Neon PostgreSQL (development)

### Production
- Port: Configurable via environment or hosting platform
- URL: Your production domain (e.g., https://yourdomain.com)
- Database: Neon PostgreSQL (production)

## Environment Variables

### Required for All Environments
```bash
# Database
DATABASE_URL=your-database-connection-string

# NextAuth.js
NEXTAUTH_URL=your-app-url
NEXTAUTH_SECRET=your-secure-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Site URL
NEXT_PUBLIC_SITE_URL=your-app-url

# TinyMCE
NEXT_PUBLIC_TINYMCE_API_KEY=your-tinymce-key
```

### Development (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PORT=3000
```

### Production (.env.production)
```bash
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

## Deployment Steps

### 1. Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 2. Other Platforms
1. Build the application: `npm run build`
2. Start production server: `npm run start:prod`
3. Ensure all environment variables are set

## Google OAuth Configuration

### Development
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### Production
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`

## Database Migration

Run migrations before deployment:
```bash
npm run db:migrate
```

## Security Considerations

1. **NEXTAUTH_SECRET**: Generate a strong, unique secret for production
2. **Database**: Use connection pooling and SSL in production
3. **CORS**: Configure proper CORS settings for your domain
4. **Headers**: Security headers are configured in next.config.js

## Port Configuration

- **Development**: Fixed to port 3000 (no auto-switching)
- **Production**: Uses platform default or PORT environment variable
- **Local Production Test**: Use `npm run start` (port 3000)

## Troubleshooting

### Port Issues
- Development always uses port 3000
- If port 3000 is busy, kill the process: `fuser -k 3000/tcp`
- Check running processes: `lsof -i :3000`

### Authentication Issues
- Verify NEXTAUTH_URL matches your actual domain
- Check Google OAuth redirect URIs
- Ensure NEXTAUTH_SECRET is set and secure

### Database Issues
- Verify DATABASE_URL is correct
- Run migrations: `npm run db:migrate`
- Check database connectivity
