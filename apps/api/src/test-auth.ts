/**
 * Simple test script to verify authentication endpoints
 * Run with: npx tsx src/test-auth.ts
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const testUser: TestUser = {
  email: `test.user.${Date.now()}@example.com`,
  password: 'TestPassword123',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890'
};

let accessToken: string = '';
let refreshToken: string = '';

async function testRegister() {
  console.log('\n1. Testing Registration...');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', {
      status: response.status,
      user: response.data.data.user.email,
      hasTokens: !!(response.data.data.accessToken && response.data.data.refreshToken)
    });
    accessToken = response.data.data.accessToken;
    refreshToken = response.data.data.refreshToken;
    return true;
  } catch (error: any) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n2. Testing Login...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', {
      status: response.status,
      user: response.data.data.user.email,
      hasTokens: !!(response.data.data.accessToken && response.data.data.refreshToken)
    });
    accessToken = response.data.data.accessToken;
    refreshToken = response.data.data.refreshToken;
    return true;
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetProfile() {
  console.log('\n3. Testing Get Profile (Protected Route)...');
  try {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Profile fetched successfully:', {
      status: response.status,
      email: response.data.data.user.email,
      firstName: response.data.data.user.firstName,
      lastName: response.data.data.user.lastName
    });
    return true;
  } catch (error: any) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
    return false;
  }
}

async function testRefreshToken() {
  console.log('\n4. Testing Refresh Token...');
  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    console.log('✅ Token refreshed successfully:', {
      status: response.status,
      hasNewTokens: !!(response.data.data.accessToken && response.data.data.refreshToken)
    });
    accessToken = response.data.data.accessToken;
    refreshToken = response.data.data.refreshToken;
    return true;
  } catch (error: any) {
    console.error('❌ Token refresh failed:', error.response?.data || error.message);
    return false;
  }
}

async function testChangePassword() {
  console.log('\n5. Testing Change Password...');
  try {
    const response = await axios.post(`${API_URL}/auth/change-password`, {
      oldPassword: testUser.password,
      newPassword: 'NewTestPassword123'
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Password changed successfully:', {
      status: response.status,
      message: response.data.message
    });
    testUser.password = 'NewTestPassword123';
    return true;
  } catch (error: any) {
    console.error('❌ Change password failed:', error.response?.data || error.message);
    return false;
  }
}

async function testForgotPassword() {
  console.log('\n6. Testing Forgot Password...');
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testUser.email
    });
    console.log('✅ Password reset requested:', {
      status: response.status,
      message: response.data.message
    });
    return true;
  } catch (error: any) {
    console.error('❌ Forgot password failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLogout() {
  console.log('\n7. Testing Logout...');
  try {
    const response = await axios.post(`${API_URL}/auth/logout`, {
      refreshToken: refreshToken
    });
    console.log('✅ Logout successful:', {
      status: response.status,
      message: response.data.message
    });
    return true;
  } catch (error: any) {
    console.error('❌ Logout failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication System Tests...');
  console.log('====================================');
  
  let allTestsPassed = true;
  
  // Test registration
  if (!await testRegister()) {
    allTestsPassed = false;
  }
  
  // Test login
  if (!await testLogin()) {
    allTestsPassed = false;
  }
  
  // Test protected route
  if (!await testGetProfile()) {
    allTestsPassed = false;
  }
  
  // Test token refresh
  if (!await testRefreshToken()) {
    allTestsPassed = false;
  }
  
  // Test change password
  if (!await testChangePassword()) {
    allTestsPassed = false;
  }
  
  // Test forgot password
  if (!await testForgotPassword()) {
    allTestsPassed = false;
  }
  
  // Test logout
  if (!await testLogout()) {
    allTestsPassed = false;
  }
  
  console.log('\n====================================');
  if (allTestsPassed) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
runTests().catch(console.error);