# CarsCanada Railway Deployment Details

## Project Information
- **Project Name**: CarsCanada
- **Project ID**: `54c86933-b1bd-4b6c-8b98-02d9c4ddd39d`
- **Environment**: production
- **Environment ID**: `caebf5c1-bd27-4d99-a6e1-6f0b0c9821d2`

## Services

### 1. PostgreSQL Database
- **Service Name**: carscanada-db
- **Service ID**: `aebc482c-555c-418c-a420-e47914923788`
- **Image**: postgres:16-alpine
- **Internal URL**: `carscanada-db.railway.internal:5432`
- **Database Name**: carscanada
- **Username**: carscanada

### 2. Redis Cache
- **Service Name**: carscanada-redis
- **Service ID**: `35f9a590-b421-45dd-9f1a-17a6abc5eaef`
- **Image**: redis:7-alpine
- **Internal URL**: `carscanada-redis.railway.internal:6379`

### 3. API Service
- **Service Name**: carscanada-api
- **Service ID**: `95a658c4-a56e-49e8-a4a2-f29b1a08f068`
- **Repository**: moeloubani/carscanada
- **Root Directory**: apps/api
- **Public URL**: https://carscanada-api-production.up.railway.app
- **Domain ID**: `dc1992fb-7e4e-4250-8943-3e3aec50458a`
- **Port**: 3001

### 4. Web Application
- **Service Name**: carscanada-web
- **Service ID**: `55d1a74e-d9d5-4ecd-9a51-5099666dba60`
- **Repository**: moeloubani/carscanada
- **Root Directory**: apps/web
- **Public URL**: https://carscanada-web-production.up.railway.app
- **Domain ID**: `1b769c07-c470-4ece-9810-54df25ae1081`

## Environment Variables Configured

### API Service
- DATABASE_URL (connected to PostgreSQL)
- REDIS_URL (connected to Redis)
- PORT: 3001
- NODE_ENV: production
- JWT_SECRET (configured)
- JWT_REFRESH_SECRET (configured)
- JWT_EXPIRE_TIME: 15m
- JWT_REFRESH_EXPIRE_TIME: 7d
- FRONTEND_URL: https://carscanada-web-production.up.railway.app
- SOCKET_IO_SECRET (configured)
- RATE_LIMIT_WINDOW_MS: 900000
- RATE_LIMIT_MAX_REQUESTS: 100

### Web Application
- NEXT_PUBLIC_API_URL: https://carscanada-api-production.up.railway.app/api
- NEXT_PUBLIC_SOCKET_URL: https://carscanada-api-production.up.railway.app

### PostgreSQL Database
- POSTGRES_DB: carscanada
- POSTGRES_USER: carscanada
- POSTGRES_PASSWORD (configured)

## Access URLs
- **Web Application**: https://carscanada-web-production.up.railway.app
- **API Health Check**: https://carscanada-api-production.up.railway.app/health

## Deployment Status
All services have been successfully deployed and configured on Railway with:
- Automatic deployments from GitHub repository
- Internal networking between services
- Public domains for web and API services
- Environment variables properly configured
- Database and cache services running

## Next Steps
1. Monitor deployment status in Railway dashboard
2. Run database migrations once API service is deployed
3. Configure additional environment variables as needed (Stripe, SendGrid, AWS S3, etc.)
4. Set up custom domains if desired

## Notes
- All services are configured to auto-deploy on push to the main branch
- Internal service communication uses Railway's private network
- Database and Redis are only accessible internally
- API and Web services have public URLs for external access

Last Updated: 2025-09-03