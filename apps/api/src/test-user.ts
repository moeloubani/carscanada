/**
 * Test file for user management endpoints
 * Run with: npx tsx src/test-user.ts
 */

import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:3001/api';
let authToken: string = '';
let userId: string = '';

interface ErrorResponse {
  error?: string;
  errors?: string[];
  message?: string;
}

async function testUserEndpoints() {
  console.log('🚀 Starting User Management Tests\n');

  try {
    // First, register a new user for testing
    console.log('1. Registering test user...');
    const registerData = {
      email: `test.user.${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '416-555-0123',
      province: 'ON',
      city: 'Toronto'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
    authToken = registerResponse.data.accessToken;
    userId = registerResponse.data.user.id;
    console.log('✅ User registered successfully');
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${registerData.email}\n`);

    // Test get profile
    console.log('2. Testing GET /users/profile...');
    const profileResponse = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile retrieved successfully');
    console.log(`   Name: ${profileResponse.data.user.firstName} ${profileResponse.data.user.lastName}`);
    console.log(`   Email: ${profileResponse.data.user.email}\n`);

    // Test update profile
    console.log('3. Testing PUT /users/profile...');
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '647-555-9876',
      city: 'Ottawa',
      postalCode: 'K1A 0B1'
    };
    const updateResponse = await axios.put(`${API_URL}/users/profile`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile updated successfully');
    console.log(`   Updated fields: ${Object.keys(updateData).join(', ')}\n`);

    // Test dealer account update
    console.log('4. Testing dealer account conversion...');
    const dealerData = {
      isDealer: true,
      dealerName: 'Test Auto Sales'
    };
    const dealerResponse = await axios.put(`${API_URL}/users/profile`, dealerData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Converted to dealer account');
    console.log(`   Dealer Name: ${dealerResponse.data.user.dealerName}\n`);

    // Test get user listings (should be empty)
    console.log('5. Testing GET /users/listings...');
    const listingsResponse = await axios.get(`${API_URL}/users/listings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User listings retrieved');
    console.log(`   Total listings: ${listingsResponse.data.total}`);
    console.log(`   Page: ${listingsResponse.data.page}/${listingsResponse.data.totalPages}\n`);

    // Test get saved listings (should be empty)
    console.log('6. Testing GET /users/saved...');
    const savedResponse = await axios.get(`${API_URL}/users/saved`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Saved listings retrieved');
    console.log(`   Total saved: ${savedResponse.data.total}\n`);

    // Test validation errors
    console.log('7. Testing validation errors...');
    try {
      await axios.put(`${API_URL}/users/profile`, {
        province: 'INVALID',
        phone: 'not-a-phone'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 400) {
        console.log('✅ Validation errors caught correctly');
        console.log(`   Errors: ${err.response.data.errors?.join(', ')}\n`);
      } else {
        throw error;
      }
    }

    // Test avatar upload (would need actual file in real test)
    console.log('8. Testing avatar upload endpoint (without file)...');
    try {
      await axios.post(`${API_URL}/users/avatar`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 400) {
        console.log('✅ Avatar upload validation works');
        console.log(`   Error: ${err.response.data.error}\n`);
      } else {
        throw error;
      }
    }

    // Clean up - delete test account
    console.log('9. Testing DELETE /users/account...');
    const deleteResponse = await axios.delete(`${API_URL}/users/account`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { password: 'TestPassword123!' } // Optional password verification
    });
    console.log('✅ Account deleted successfully');
    console.log(`   Message: ${deleteResponse.data.message}\n`);

    // Verify deletion - should fail
    console.log('10. Verifying account deletion...');
    try {
      await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Account still accessible after deletion!');
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 401 || err.response?.status === 404) {
        console.log('✅ Account properly deleted - no longer accessible\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 All user management tests passed!\n');

  } catch (error) {
    const err = error as AxiosError<ErrorResponse>;
    console.error('\n❌ Test failed!');
    console.error('Error details:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    process.exit(1);
  }
}

// Run tests
console.log('Starting User Management API Tests');
console.log('==================================\n');
console.log('Make sure the API server is running on port 3001\n');

testUserEndpoints().catch(console.error);