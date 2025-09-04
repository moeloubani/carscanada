import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3001}/api`;

// Test user credentials
const testUser = {
  email: 'payment.test@example.com',
  password: 'TestPass123!',
  firstName: 'Payment',
  lastName: 'Tester',
  phone: '555-0123',
};

// Test listing data
const testListing = {
  title: '2020 Honda Civic - Test Payment',
  make: 'Honda',
  model: 'Civic',
  year: 2020,
  price: 25000,
  mileageKm: 45000,
  bodyType: 'Sedan',
  transmission: 'Automatic',
  fuelType: 'Gasoline',
  drivetrain: 'FWD',
  exteriorColor: 'Blue',
  interiorColor: 'Black',
  engine: '2.0L 4-Cylinder',
  description: 'Test listing for payment integration',
  condition: 'USED',
  province: 'ON',
  city: 'Toronto',
  postalCode: 'M5V 3A8',
};

let authToken: string;
let userId: string;
let listingId: string;

async function registerAndLogin() {
  try {
    // Try to register (might fail if user exists)
    try {
      await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('✅ User registered successfully');
    } catch (error: any) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ User already exists, proceeding to login');
      } else {
        throw error;
      }
    }

    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    authToken = loginResponse.data.data.accessToken;
    userId = loginResponse.data.data.user.id;
    console.log('✅ Logged in successfully');
    console.log('User ID:', userId);
  } catch (error: any) {
    console.error('❌ Registration/Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function createTestListing() {
  try {
    const response = await axios.post(
      `${API_URL}/listings`,
      testListing,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    listingId = response.data.data.id;
    console.log('✅ Test listing created');
    console.log('Listing ID:', listingId);
  } catch (error: any) {
    console.error('❌ Failed to create listing:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetPackages() {
  console.log('\n📦 Testing GET /packages...');
  
  try {
    // Get all packages
    const response = await axios.get(`${API_URL}/payments/packages`);
    console.log('✅ Fetched packages:', response.data.data.length);
    
    response.data.data.forEach((pkg: any) => {
      console.log(`  - ${pkg.name}: $${pkg.price} CAD (${pkg.durationDays} days)`);
    });

    // Get active packages only
    const activeResponse = await axios.get(`${API_URL}/payments/packages?isActive=true`);
    console.log('✅ Active packages:', activeResponse.data.data.length);

    return response.data.data;
  } catch (error: any) {
    console.error('❌ Failed to get packages:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetPackageById(packageId: string) {
  console.log(`\n📦 Testing GET /packages/${packageId}...`);
  
  try {
    const response = await axios.get(`${API_URL}/payments/packages/${packageId}`);
    console.log('✅ Package details:');
    console.log(`  Name: ${response.data.data.name}`);
    console.log(`  Price: $${response.data.data.price} CAD`);
    console.log(`  Duration: ${response.data.data.durationDays} days`);
    console.log(`  Features: ${response.data.data.features.length}`);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Failed to get package:', error.response?.data || error.message);
    throw error;
  }
}

async function testCreateCheckoutSession(packageId: string) {
  console.log('\n💳 Testing POST /checkout...');
  
  try {
    const response = await axios.post(
      `${API_URL}/payments/checkout`,
      {
        packageId,
        listingId,
        successUrl: 'http://localhost:3000/payment/success',
        cancelUrl: 'http://localhost:3000/payment/cancel',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log('✅ Checkout session created');
    console.log(`  Session ID: ${response.data.data.sessionId}`);
    console.log(`  Transaction ID: ${response.data.data.transactionId}`);
    console.log(`  Checkout URL: ${response.data.data.url}`);
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Failed to create checkout session:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetTransactions() {
  console.log('\n📊 Testing GET /transactions...');
  
  try {
    const response = await axios.get(
      `${API_URL}/payments/transactions?page=1&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log('✅ User transactions:');
    console.log(`  Total: ${response.data.pagination.total}`);
    console.log(`  Page: ${response.data.pagination.page}/${response.data.pagination.totalPages}`);
    
    if (response.data.data.length > 0) {
      response.data.data.forEach((tx: any) => {
        console.log(`  - ${tx.id}: $${tx.amount} ${tx.currency} - ${tx.status}`);
      });
    } else {
      console.log('  No transactions found');
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Failed to get transactions:', error.response?.data || error.message);
    throw error;
  }
}

async function testInvalidRequests() {
  console.log('\n🔒 Testing validation and error handling...');
  
  // Test invalid package ID
  try {
    await axios.get(`${API_URL}/payments/packages/invalid-id`);
    console.error('❌ Should have failed with invalid package ID');
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid package ID rejected correctly');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  // Test checkout without authentication
  try {
    await axios.post(`${API_URL}/payments/checkout`, {
      packageId: 'some-id',
      listingId: 'some-id',
    });
    console.error('❌ Should have failed without authentication');
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthenticated request rejected correctly');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  // Test checkout with invalid data
  try {
    await axios.post(
      `${API_URL}/payments/checkout`,
      {
        packageId: 'not-a-uuid',
        listingId: 'not-a-uuid',
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.error('❌ Should have failed with invalid UUIDs');
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid checkout data rejected correctly');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function testWebhook() {
  console.log('\n🪝 Testing webhook endpoint...');
  
  // Note: This will fail without a valid Stripe signature
  // In production, this would be called by Stripe with proper signature
  try {
    const webhookData = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
            transactionId: 'test-transaction-id',
            listingId: 'test-listing-id',
            packageId: 'test-package-id',
          },
          payment_intent: 'pi_test_123',
        },
      },
    };

    await axios.post(
      `${API_URL}/payments/webhook`,
      webhookData,
      {
        headers: {
          'stripe-signature': 'invalid-signature',
        },
      }
    );
    console.error('❌ Should have failed with invalid signature');
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid webhook signature rejected correctly');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Payment API Tests\n');
  
  try {
    // Setup
    await registerAndLogin();
    await createTestListing();

    // Test package endpoints
    const packages = await testGetPackages();
    if (packages.length > 0) {
      await testGetPackageById(packages[0].id);
      
      // Test checkout (Note: This requires valid Stripe keys in .env)
      if (process.env.STRIPE_SECRET_KEY) {
        await testCreateCheckoutSession(packages[0].id);
      } else {
        console.log('⚠️ Skipping checkout test - STRIPE_SECRET_KEY not configured');
      }
    }

    // Test transaction endpoints
    await testGetTransactions();

    // Test validation and errors
    await testInvalidRequests();

    // Test webhook
    await testWebhook();

    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);