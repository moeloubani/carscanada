# Payment Integration Documentation

## Overview
The CarsCanada API includes a complete Stripe payment integration for featured listings. Users can purchase featured packages to promote their listings with enhanced visibility.

## Features
- Multiple featured packages (Basic, Standard, Premium)
- Secure Stripe checkout sessions
- Webhook handling for payment events
- Transaction history tracking
- Automatic listing promotion upon successful payment
- Refund processing
- Canadian dollar (CAD) support

## Available Packages

### Basic Package - $9.99 CAD
- 7 days of featured visibility
- Featured badge on listing
- Priority in search results
- Highlighted in category pages
- Basic analytics

### Standard Package - $29.99 CAD
- 30 days of featured visibility
- All Basic features plus:
- Homepage carousel placement
- Detailed analytics dashboard
- Social media promotion
- 2x more views on average

### Premium Package - $49.99 CAD
- 60 days of featured visibility
- All Standard features plus:
- Top priority in search results
- Premium homepage placement
- Advanced analytics & insights
- Email blast to interested buyers
- 3x more views on average
- Dedicated support

## API Endpoints

### Public Endpoints

#### GET /api/payments/packages
Get all available featured packages.

Query Parameters:
- `isActive` (optional): Filter by active status (true/false)

#### GET /api/payments/packages/:id
Get details for a specific package.

### Authenticated Endpoints

#### POST /api/payments/checkout
Create a Stripe checkout session for purchasing a featured package.

Request Body:
```json
{
  "packageId": "uuid",
  "listingId": "uuid",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/...",
    "transactionId": "uuid"
  }
}
```

#### GET /api/payments/transactions
Get user's transaction history.

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (PENDING, COMPLETED, FAILED, REFUNDED)

#### GET /api/payments/transactions/:id
Get details for a specific transaction.

### Webhook Endpoint

#### POST /api/payments/webhook
Stripe webhook endpoint for payment events.

Headers:
- `stripe-signature`: Webhook signature for verification

Handled Events:
- `checkout.session.completed`: Payment successful
- `payment_intent.succeeded`: Payment confirmed
- `payment_intent.payment_failed`: Payment failed
- `charge.refunded`: Refund processed

## Setup Instructions

### 1. Environment Variables
Add the following to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Database Setup
Run migrations to create the necessary tables:

```bash
npm run db:migrate
npm run db:generate
```

### 3. Seed Featured Packages
Create the default featured packages:

```bash
npm run seed:packages
```

### 4. Configure Stripe Webhook
1. Go to your Stripe Dashboard
2. Navigate to Developers > Webhooks
3. Add endpoint: `https://your-domain.com/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the webhook secret and add to `.env`

## Testing

### Run Payment Tests
```bash
npx tsx src/test/test-payment.ts
```

### Test Stripe Integration
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

## Frontend Integration

### 1. Install Stripe.js
```bash
npm install @stripe/stripe-js
```

### 2. Create Checkout Session
```javascript
const response = await fetch('/api/payments/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    packageId: selectedPackage.id,
    listingId: listing.id,
    successUrl: `${window.location.origin}/payment/success`,
    cancelUrl: `${window.location.origin}/payment/cancel`
  })
});

const { data } = await response.json();

// Redirect to Stripe Checkout
window.location.href = data.url;
```

### 3. Handle Success Page
```javascript
// On success page, check session status
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

// Verify payment and show confirmation
```

## Security Considerations

1. **Webhook Verification**: All webhook requests are verified using Stripe signatures
2. **Authentication**: Checkout sessions require authenticated users
3. **Ownership Validation**: Users can only feature their own listings
4. **Idempotency**: Payment processing is idempotent to prevent duplicate charges
5. **HTTPS Only**: All payment endpoints should be accessed over HTTPS in production

## Admin Features

### Package Management
Admin endpoints are available for managing featured packages:

- `POST /api/payments/admin/packages`: Create new package
- `PUT /api/payments/admin/packages/:id`: Update package
- `GET /api/payments/admin/statistics`: View payment statistics
- `POST /api/payments/admin/refund/:paymentIntentId`: Process refund

Note: Admin middleware needs to be implemented for these endpoints.

## Error Handling

The API returns appropriate error responses:

- `400 Bad Request`: Invalid input or validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Support

For issues or questions about the payment integration:
1. Check the test file: `src/test/test-payment.ts`
2. Review Stripe documentation: https://stripe.com/docs
3. Check webhook logs in Stripe Dashboard