import { handleResponse, BASE_URL } from "./utils";

// Get user by username or address
export const getUser = async (identifier: any) => {
  const response = await fetch(`${BASE_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });
  return handleResponse(response);
};

// Create a new user
export const createUser = async (userData: any) => {

  const defaultData = {
    username: '',
    pubkey: '',
    address: '',
    nonce: '0',
    messages: [],
    notes: [],
    has_double_spent: false
  };

  const requestData = { ...defaultData, ...userData };

  const response = await fetch(`${BASE_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });

  return handleResponse(response);
};