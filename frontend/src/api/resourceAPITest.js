// Test file to verify resource API endpoints
import { resourceAPI } from '../api/reportAPI.js';

// Test resource API functions
export const testResourceAPI = async () => {
  console.log('🧪 Testing Resource API...');
  
  try {
    // Test 1: Get resources
    console.log('📋 Test 1: Getting resources...');
    const resourcesResponse = await resourceAPI.getResources();
    console.log('✅ Get resources response:', resourcesResponse);
    
    // Test 2: Create resource
    console.log('➕ Test 2: Creating test resource...');
    const testResource = {
      name: 'Test Resource ' + Date.now(),
      type: 'safe-zone',
      lat: 40.4406,
      lng: -79.9959,
      address: 'Test Address, Pittsburgh, PA',
      capacity: 100,
      currentOccupancy: 0,
      availability: 'available',
      contact: {
        phone: '(412) 555-0123',
        email: 'test@example.com',
        inCharge: 'Test Manager'
      },
      description: 'Test resource for API validation'
    };
    
    const createResponse = await resourceAPI.createResource(testResource);
    console.log('✅ Create resource response:', createResponse);
    
    if (createResponse.success && createResponse.resource) {
      const resourceId = createResponse.resource._id;
      
      // Test 3: Update resource
      console.log('✏️ Test 3: Updating resource...');
      const updateData = {
        ...testResource,
        name: 'Updated Test Resource',
        capacity: 150,
        currentOccupancy: 25
      };
      
      const updateResponse = await resourceAPI.updateResource(resourceId, updateData);
      console.log('✅ Update resource response:', updateResponse);
      
      // Test 4: Delete resource
      console.log('🗑️ Test 4: Deleting resource...');
      const deleteResponse = await resourceAPI.deleteResource(resourceId);
      console.log('✅ Delete resource response:', deleteResponse);
    }
    
    console.log('🎉 All tests completed!');
    return true;
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return false;
  }
};

// Test individual endpoints
export const testGetResources = async () => {
  try {
    const response = await resourceAPI.getResources();
    console.log('Get Resources:', response);
    return response;
  } catch (error) {
    console.error('Get Resources Error:', error);
    throw error;
  }
};

export const testCreateResource = async (resourceData) => {
  try {
    const response = await resourceAPI.createResource(resourceData);
    console.log('Create Resource:', response);
    return response;
  } catch (error) {
    console.error('Create Resource Error:', error);
    throw error;
  }
};

export const testUpdateResource = async (id, resourceData) => {
  try {
    const response = await resourceAPI.updateResource(id, resourceData);
    console.log('Update Resource:', response);
    return response;
  } catch (error) {
    console.error('Update Resource Error:', error);
    throw error;
  }
};

export const testDeleteResource = async (id) => {
  try {
    const response = await resourceAPI.deleteResource(id);
    console.log('Delete Resource:', response);
    return response;
  } catch (error) {
    console.error('Delete Resource Error:', error);
    throw error;
  }
};

// Run quick API health check
export const checkAPIHealth = async () => {
  try {
    const response = await fetch('/api/resources');
    if (response.ok) {
      console.log('✅ Backend API is running and accessible');
      return true;
    } else {
      console.error('❌ Backend API returned error status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot connect to backend API:', error.message);
    return false;
  }
};