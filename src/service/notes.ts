import { handleResponse, BASE_URL } from "./utils";

// Get notes for a user
export const getNotes = async (ownerPubKey: any, step = null) => {
  const payload = {
    owner_pub_key: ownerPubKey,
    step: step
  };
  
  const response = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

// Save a new note
export const saveNote = async (noteData: any) => {
  const response = await fetch(`${BASE_URL}/note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  return handleResponse(response);
};

// Create and transfer note history
export const createAndTransferNoteHistory = async (noteHistoryData: any) => {
  const response = await fetch(`${BASE_URL}/note-history/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteHistoryData),
  });
  return handleResponse(response);
};

// Get user note history
export const getUserNoteHistory = async (username: string) => {
  const response = await fetch(`${BASE_URL}/note-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  return handleResponse(response);
};