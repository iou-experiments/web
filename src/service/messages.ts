import { handleResponse, BASE_URL } from "./utils";

export const readUserMessages = async (username: string) => {
  const response = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  return handleResponse(response);
};

// Send a message
export const sendMessage = async (messageData: any) => {
  const response = await fetch(`${BASE_URL}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData),
  });
  return handleResponse(response);
};