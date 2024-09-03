import { handleResponse, BASE_URL } from "./utils";

// Verify a nullifier
export const verifyNullifier = async (nullifier: any, state: any) => {
  const response = await fetch(`${BASE_URL}/nullifier/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nullifier, state }),
  });
  return handleResponse(response);
};

// Store a new nullifier
export const storeNullifier = async (nullifierData: any) => {
  const response = await fetch(`${BASE_URL}/nullifier/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nullifierData),
  });
  return handleResponse(response);
};