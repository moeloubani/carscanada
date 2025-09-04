import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001';
let authToken: string = '';
let testUserId: string = '';
let testListingId: string = '';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// Helper function to handle API errors
function handleError(error: unknown) {
  if (error instanceof AxiosError) {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Validation details:', error.response.data.details);
    }
  } else {
    console.error('Error:', error);
  }
}

// Test user credentials
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123',
  firstName: 'Test',
  lastName: 'User',
  phone: '+16475551234'
};

// Test listing data
const testListing = {
  title: '2022 Toyota Camry SE - Low Mileage, One Owner',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  price: 32500,
  mileageKm: 25000,
  vin: 'JTDBE40E029012345', // Sample VIN
  bodyType: 'Sedan',
  transmission: 'Automatic',
  fuelType: 'Gasoline',
  drivetrain: 'FWD',
  exteriorColor: 'Silver',
  interiorColor: 'Black',
  engine: '2.5L 4-Cylinder',
  description: 'Excellent condition, one owner vehicle with full service history. No accidents, non-smoker, garage kept. Features include backup camera, Apple CarPlay, Android Auto, and advanced safety features.',
  condition: 'Used',
  province: 'ON',
  city: 'Toronto',
  postalCode: 'M5V 3A8'
};

async function testAuth() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Register user
    console.log('Registering new user...');
    const registerResponse = await axios.post<ApiResponse>(`${API_URL}/api/auth/register`, testUser);
    console.log('✅ Registration successful');
    testUserId = registerResponse.data.data.user.id;
    
    // Login
    console.log('Logging in...');
    const loginResponse = await axios.post<ApiResponse>(`${API_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    console.log('User ID:', testUserId);
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testGetEnums() {
  console.log('\n📋 Testing Get Listing Enums...');
  
  try {
    const response = await axios.get<ApiResponse>(`${API_URL}/api/listings/enums`);
    console.log('✅ Enums retrieved successfully');
    console.log('Available body types:', response.data.data.bodyTypes);
    console.log('Available provinces:', response.data.data.provinces);
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testCreateListing() {
  console.log('\n📝 Testing Create Listing...');
  
  try {
    const response = await axios.post<ApiResponse>(
      `${API_URL}/api/listings`,
      testListing,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    testListingId = response.data.data.id;
    console.log('✅ Listing created successfully');
    console.log('Listing ID:', testListingId);
    console.log('Status:', response.data.data.status);
    console.log('Expires at:', response.data.data.expiresAt);
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testGetListing() {
  console.log('\n👁️ Testing Get Single Listing...');
  
  try {
    const response = await axios.get<ApiResponse>(`${API_URL}/api/listings/${testListingId}`);
    console.log('✅ Listing retrieved successfully');
    console.log('Title:', response.data.data.title);
    console.log('Price:', response.data.data.price);
    console.log('Views:', response.data.data.viewsCount);
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testUpdateListing() {
  console.log('\n✏️ Testing Update Listing...');
  
  try {
    const updateData = {
      price: 31000,
      description: testListing.description + ' Price reduced for quick sale!'
    };
    
    const response = await axios.put<ApiResponse>(
      `${API_URL}/api/listings/${testListingId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('✅ Listing updated successfully');
    console.log('New price:', response.data.data.price);
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testTrackView() {
  console.log('\n👀 Testing Track View...');
  
  try {
    const response = await axios.post<ApiResponse>(`${API_URL}/api/listings/${testListingId}/view`);
    console.log('✅ View tracked successfully');
    
    // Get listing again to check view count
    const listingResponse = await axios.get<ApiResponse>(`${API_URL}/api/listings/${testListingId}`);
    console.log('Updated view count:', listingResponse.data.data.viewsCount);
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testGetListings() {
  console.log('\n📋 Testing Get All Listings...');
  
  try {
    const response = await axios.get<ApiResponse>(`${API_URL}/api/listings`, {
      params: {
        make: 'Toyota',
        priceMin: 20000,
        priceMax: 50000,
        page: 1,
        pageSize: 10
      }
    });
    
    console.log('✅ Listings retrieved successfully');
    console.log('Total listings:', response.data.pagination.totalCount);
    console.log('Current page:', response.data.pagination.page);
    console.log('Total pages:', response.data.pagination.totalPages);
    console.log('Listings on this page:', response.data.data.length);
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testGetUserListings() {
  console.log('\n👤 Testing Get User Listings...');
  
  try {
    const response = await axios.get<ApiResponse>(`${API_URL}/api/listings/user/${testUserId}`);
    console.log('✅ User listings retrieved successfully');
    console.log('Total user listings:', response.data.pagination.totalCount);
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testMarkAsSold() {
  console.log('\n✅ Testing Mark Listing as Sold...');
  
  try {
    const response = await axios.post<ApiResponse>(
      `${API_URL}/api/listings/${testListingId}/mark-sold`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('✅ Listing marked as sold');
    console.log('Status:', response.data.data.status);
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testMakeFeatured() {
  console.log('\n⭐ Testing Make Listing Featured...');
  
  try {
    const response = await axios.post<ApiResponse>(
      `${API_URL}/api/listings/${testListingId}/feature`,
      { durationDays: 7 },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('✅ Listing made featured');
    console.log('Featured until:', response.data.data.featuredUntil);
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

async function testDeleteListing() {
  console.log('\n🗑️ Testing Delete Listing...');
  
  try {
    const response = await axios.delete<ApiResponse>(
      `${API_URL}/api/listings/${testListingId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('✅ Listing deleted successfully');
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting CarsCanada Listing API Tests');
  console.log('=====================================');
  
  // Ensure the server is running
  try {
    await axios.get(`${API_URL}/api/health`);
  } catch (error) {
    console.error('❌ Server is not running at', API_URL);
    console.error('Please start the server with: npm run dev');
    process.exit(1);
  }
  
  // Run tests in sequence
  const tests = [
    { name: 'Authentication', fn: testAuth },
    { name: 'Get Enums', fn: testGetEnums },
    { name: 'Create Listing', fn: testCreateListing },
    { name: 'Get Single Listing', fn: testGetListing },
    { name: 'Update Listing', fn: testUpdateListing },
    { name: 'Track View', fn: testTrackView },
    { name: 'Get All Listings', fn: testGetListings },
    { name: 'Get User Listings', fn: testGetUserListings },
    { name: 'Make Featured', fn: testMakeFeatured },
    { name: 'Mark as Sold', fn: testMarkAsSold },
    { name: 'Delete Listing', fn: testDeleteListing }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const test of tests) {
    const success = await test.fn();
    if (success) {
      passedTests++;
    } else {
      failedTests++;
      console.log(`❌ ${test.name} test failed`);
    }
  }
  
  // Summary
  console.log('\n=====================================');
  console.log('📊 Test Summary');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${tests.length}`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed successfully!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runTests().catch(console.error);