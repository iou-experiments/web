export const BASE_URL = 'http://167.172.25.99';

// Helper function to handle API responses
export const handleResponse = async (response: any) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }
  return response.json();
};