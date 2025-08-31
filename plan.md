# CarsCanada - Car Sales Classified Platform

## Project Overview
A comprehensive car sales classified platform for the Canadian market consisting of:
- **Web Application**: React-based responsive web app
- **Mobile Application**: React Native cross-platform app (iOS & Android)
- **API Service**: Node.js/Express REST API
- **Database**: PostgreSQL with Redis for caching
- **Hosting**: Railway platform

## Tech Stack

### API Service
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (primary), Redis (caching/sessions)
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 (or Railway volumes for budget option)
- **Real-time**: Socket.io for chat
- **Email**: SendGrid or AWS SES
- **Payment**: Stripe for featured listings
- **Search**: Elasticsearch or PostgreSQL full-text search
- **Queue**: Bull (Redis-based) for background jobs
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI

### Web Application
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand or TanStack Query
- **Forms**: React Hook Form + Zod
- **Maps**: Mapbox or Google Maps
- **Image Optimization**: Next.js Image component
- **SEO**: Next.js built-in SEO features
- **Analytics**: Google Analytics / Plausible
- **Chat UI**: Custom with Socket.io client

### Mobile Application
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Zustand or Redux Toolkit
- **UI Components**: React Native Elements or Tamagui
- **Forms**: React Hook Form
- **Maps**: React Native Maps
- **Push Notifications**: Expo Push Notifications
- **Image Handling**: Expo Image Picker
- **Chat**: Socket.io client
- **Storage**: AsyncStorage for local data

## Project Structure

```
carscanada/
├── apps/
│   ├── api/                    # Express API Service
│   │   ├── src/
│   │   │   ├── config/         # Configuration files
│   │   │   ├── controllers/    # Route controllers
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── models/         # Database models
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── validators/     # Request validators
│   │   │   ├── websockets/     # Socket.io handlers
│   │   │   ├── jobs/           # Background jobs
│   │   │   └── app.ts          # Express app setup
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── migrations/     # Database migrations
│   │   ├── tests/              # API tests
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                    # Next.js Web App
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilities & API client
│   │   │   ├── stores/         # State management
│   │   │   ├── styles/         # Global styles
│   │   │   └── types/          # TypeScript types
│   │   ├── public/             # Static assets
│   │   ├── .env.example
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                 # React Native App
│       ├── src/
│       │   ├── screens/        # Screen components
│       │   ├── components/     # Reusable components
│       │   ├── navigation/     # Navigation setup
│       │   ├── services/       # API services
│       │   ├── stores/         # State management
│       │   ├── hooks/          # Custom hooks
│       │   ├── utils/          # Utilities
│       │   └── types/          # TypeScript types
│       ├── assets/             # Images, fonts, etc.
│       ├── app.json            # Expo config
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                   # Shared packages
│   ├── shared-types/          # Shared TypeScript types
│   ├── validators/            # Shared validation schemas
│   └── utils/                 # Shared utilities
│
├── docs/                      # Documentation
├── scripts/                   # Build & deployment scripts
├── .gitignore
├── turbo.json                 # Turborepo config
├── package.json               # Root package.json
└── README.md
```

## Database Schema

### Core Tables

```sql
-- Users
users
- id (UUID)
- email
- password_hash
- phone
- first_name
- last_name
- province
- city
- postal_code
- avatar_url
- email_verified
- phone_verified
- is_dealer
- dealer_name
- created_at
- updated_at

-- Listings
listings
- id (UUID)
- user_id (FK)
- title
- make
- model
- year
- price
- mileage_km
- vin
- body_type
- transmission
- fuel_type
- drivetrain
- exterior_color
- interior_color
- engine
- description
- condition
- province
- city
- postal_code
- latitude
- longitude
- status (active/sold/expired/draft)
- is_featured
- featured_until
- views_count
- created_at
- updated_at
- expires_at

-- Listing Images
listing_images
- id
- listing_id (FK)
- image_url
- thumbnail_url
- position
- is_primary
- created_at

-- Saved Listings (Favorites)
saved_listings
- id
- user_id (FK)
- listing_id (FK)
- created_at

-- Conversations
conversations
- id
- listing_id (FK)
- buyer_id (FK)
- seller_id (FK)
- last_message_at
- created_at
- updated_at

-- Messages
messages
- id
- conversation_id (FK)
- sender_id (FK)
- content
- is_read
- created_at

-- Search Alerts
search_alerts
- id
- user_id (FK)
- name
- filters (JSONB)
- frequency
- is_active
- last_sent_at
- created_at

-- Featured Packages
featured_packages
- id
- name
- description
- price
- duration_days
- features (JSONB)
- is_active

-- Transactions
transactions
- id
- user_id (FK)
- listing_id (FK)
- package_id (FK)
- amount
- currency
- stripe_payment_id
- status
- created_at
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar
- `DELETE /api/users/account` - Delete account

### Listings
- `GET /api/listings` - Search/filter listings
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `POST /api/listings/:id/images` - Upload images
- `DELETE /api/listings/:id/images/:imageId` - Delete image
- `POST /api/listings/:id/feature` - Make listing featured
- `POST /api/listings/:id/mark-sold` - Mark as sold
- `GET /api/listings/user/:userId` - Get user's listings

### Saved Listings
- `GET /api/saved-listings` - Get saved listings
- `POST /api/saved-listings/:listingId` - Save listing
- `DELETE /api/saved-listings/:listingId` - Remove saved listing

### Conversations & Messages
- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/conversations` - Start conversation
- `POST /api/conversations/:id/messages` - Send message
- `PUT /api/conversations/:id/read` - Mark messages as read

### Search & Filters
- `GET /api/search/suggestions` - Auto-complete suggestions
- `POST /api/search/alerts` - Create search alert
- `GET /api/search/alerts` - Get user's alerts
- `DELETE /api/search/alerts/:id` - Delete alert

### Payments
- `GET /api/packages` - Get featured packages
- `POST /api/payments/checkout` - Create checkout session
- `POST /api/payments/webhook` - Stripe webhook

### Analytics
- `GET /api/analytics/listings/:id` - Get listing analytics
- `POST /api/analytics/view/:listingId` - Track listing view

## Key Features

### Core Features
1. **User Management**
   - Registration/Login with email verification
   - Profile management
   - Dealer accounts with enhanced features

2. **Listing Management**
   - Create/Edit/Delete listings
   - Multiple image uploads with optimization
   - Advanced search and filtering
   - Location-based search
   - VIN decoder integration

3. **Communication**
   - Real-time chat between buyers and sellers
   - Push notifications for new messages
   - Email notifications

4. **Monetization**
   - Featured listings
   - Dealer subscriptions
   - Premium placement options

5. **User Experience**
   - Saved searches and alerts
   - Favorite listings
   - Recently viewed
   - Compare listings
   - Share listings

### Canadian-Specific Features
- Province/territory selection
- Bilingual support (English/French)
- Canadian postal code validation
- Integration with CARFAX Canada
- Provincial tax calculations
- Weather/road condition warnings

## Deployment Strategy

### Railway Configuration

#### Services Setup
1. **API Service**
   - Node.js service from API directory
   - Environment variables for secrets
   - Health check endpoint
   - Auto-scaling configuration

2. **Web Application**
   - Next.js service
   - Static asset optimization
   - CDN configuration

3. **Database**
   - PostgreSQL instance
   - Automated backups
   - Read replicas for scaling

4. **Redis**
   - Caching layer
   - Session storage
   - Queue management

5. **Background Jobs**
   - Separate worker service
   - Handles email sending, image processing

### Environment Variables

#### API Service
```env
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=
SOCKET_IO_SECRET=
```

#### Web Application
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
NEXT_PUBLIC_GA_ID=
```

#### Mobile Application
```env
API_URL=
SOCKET_URL=
MAPBOX_TOKEN=
SENTRY_DSN=
```

## Development Workflow

### Local Development
1. Use Docker Compose for local services
2. Hot reloading for all applications
3. Shared TypeScript types package
4. Turborepo for monorepo management

### Git Workflow
- `main` - Production branch
- `develop` - Development branch
- Feature branches from develop
- PR reviews required

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for search

### CI/CD Pipeline
1. GitHub Actions for CI
2. Automated testing on PR
3. Railway deployments on merge
4. Staging environment for testing

## Performance Considerations

### Optimization Strategies
1. **Database**
   - Proper indexing on search fields
   - Query optimization
   - Connection pooling

2. **Caching**
   - Redis for session management
   - CDN for static assets
   - API response caching

3. **Images**
   - Lazy loading
   - Progressive loading
   - Multiple resolutions
   - WebP format support

4. **Search**
   - Elasticsearch for complex queries
   - Faceted search
   - Search suggestions caching

## Security Measures

1. **Authentication**
   - JWT with short expiry
   - Refresh token rotation
   - Rate limiting on auth endpoints

2. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens

3. **File Uploads**
   - File type validation
   - Size limits
   - Virus scanning
   - Secure S3 buckets

4. **API Security**
   - Rate limiting
   - API key for mobile apps
   - Request signing
   - CORS configuration

## Monitoring & Analytics

1. **Application Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Uptime monitoring

2. **Business Analytics**
   - User behavior tracking
   - Listing performance metrics
   - Conversion tracking
   - Revenue analytics

## MVP Features (Phase 1)

### Priority Features for Launch
1. User registration/login
2. Basic listing creation with images
3. Search and filtering
4. Listing details page
5. Contact seller (email only)
6. Basic user dashboard
7. Mobile responsive web

### Phase 2 Features
1. Real-time chat
2. Mobile apps
3. Featured listings
4. Saved searches
5. Advanced filtering
6. Dealer accounts

### Phase 3 Features
1. VIN decoder
2. CARFAX integration
3. Advanced analytics
4. AI-powered pricing suggestions
5. Video listings
6. Virtual tours

## Estimated Timeline

### Phase 1 (MVP) - 8-10 weeks
- Weeks 1-2: Setup and database design
- Weeks 3-5: API development
- Weeks 6-7: Web application
- Week 8: Testing and deployment
- Weeks 9-10: Bug fixes and launch

### Phase 2 - 6-8 weeks
- Weeks 1-3: Mobile app development
- Weeks 4-5: Chat implementation
- Weeks 6-7: Payment integration
- Week 8: Testing and deployment

### Phase 3 - 8-10 weeks
- Based on user feedback and metrics

## Budget Considerations

### Railway Hosting (Monthly)
- Starter: ~$20-50/month (MVP)
- Growth: ~$100-200/month (with traffic)
- Scale: ~$500+/month (high traffic)

### Third-Party Services (Monthly)
- AWS S3: ~$50-100
- SendGrid: ~$20-50
- Stripe: 2.9% + 30¢ per transaction
- Mapbox: ~$50-100
- Monitoring: ~$50-100

### Development Costs
- Initial development: 200-300 hours
- Ongoing maintenance: 20-40 hours/month

## Success Metrics

### Technical KPIs
- Page load time < 2 seconds
- API response time < 200ms
- 99.9% uptime
- Mobile app crash rate < 1%

### Business KPIs
- User registration rate
- Listing creation rate
- User engagement (messages sent)
- Featured listing conversion
- Monthly active users
- Average session duration

## Conclusion

This plan provides a solid foundation for building a scalable car sales classified platform for the Canadian market. The modular architecture allows for iterative development and easy scaling as the platform grows. Starting with an MVP and gradually adding features based on user feedback will ensure product-market fit while managing development costs effectively.