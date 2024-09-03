import { useState, useEffect } from 'react';
import init, { WasmIVCNotes, WasmAuth, WasmNoteHistory, initSync } from './ivcnotes_wasm_bg.js';

const STORAGE_KEYS = {
  AUTH: 'ivcnotes_auth',
  ISSUED_NOTES: 'ivcnotes_issued_notes',
  TRANSFERRED_NOTES: 'ivcnotes_transferred_notes',
};

export function useIVCNotes() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [ivcNotes, setIvcNotes] = useState(null);

  useEffect(() => {
    async function initWasm() {
      try {
        await init();
        await initSync();
        console.log('success')
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to initialize WASM module:', err);
        setError(err);
      }
    }
    initWasm();
  }, []);

  // useEffect(() => {
  //   if (isLoaded) {
  //     setIvcNotes(new WasmIVCNotes());
  //     console.log(ivcNotes);
  //   }
  // }, [isLoaded]);


  const generateAuth = (username) => {
    if (!isLoaded) {
      throw new Error('WASM module not loaded');
    }

    const auth = WasmIVCNotes.generate_auth();
    // Store the auth in local storage
    const storedAuths = JSON.parse(localStorage.getItem('iouAuths')) || [];
    storedAuths.push({ username, auth });
    localStorage.setItem('iouAuths', JSON.stringify(storedAuths));
    
    return auth;
  };

  const issueNote = (auth, receiver, value) => {
    if (!ivcNotes) {
      throw new Error('IVCNotes not initialized');
    }
    try {
      const authjs = WasmAuth.from_js(auth)
      const noteHistory = ivcNotes.issue(authjs, '8e2bb3f867e21518954645afa35000d37d029be0c99f95832700f5e32645d12b', value);
      console.log('1')
      // Store the issued note in local storage
      const issuedNotes = JSON.parse(localStorage.getItem('issuedNotes')) || [];
      console.log('2')
      issuedNotes.push({ auth: authjs, receiver, value, noteHistory });
      console.log('3')
      localStorage.setItem('issuedNotes', JSON.stringify(issuedNotes));
      
      return noteHistory;
    } catch (e) {
      console.log('e', e);
    }
  };

  const transferNote = (auth, noteHistory, receiver, value) => {
    if (!ivcNotes) {
      throw new Error('IVCNotes not initialized');
    }
    const newNoteHistory = ivcNotes.transfer(auth, noteHistory, receiver, value);
    
    // Store the transferred note in local storage
    const transferredNotes = JSON.parse(localStorage.getItem('transferredNotes')) || [];
    transferredNotes.push({ auth, noteHistory: newNoteHistory, receiver, value });
    localStorage.setItem('transferredNotes', JSON.stringify(transferredNotes));
    
    return newNoteHistory;
  };
  const createNewIVCNotes = (pk, vk) => {
    if (!isLoaded) {
      console.log(pk, vk);
      throw new Error('WASM module not loaded');
    }
    try {
      // const newIvc = WasmIVCNotes.new(pk, vk);
      // return newIvc;
    } catch (e) {
      console.log('Error creating new IVCNotes:', e);
      throw e;
    }
  };

  const verifyNote = (noteHistory) => {
    if (!ivcNotes) {
      throw new Error('IVCNotes not initialized');
    }
    return ivcNotes.verify(noteHistory);
  };

  const authToJs = (auth) => {
    if (!isLoaded) {
      throw new Error('WASM module not loaded');
    }
    return auth.as_js();
  };

  const noteHistoryToJs = (noteHistory) => {
    if (!isLoaded) {
      throw new Error('WASM module not loaded');
    }
    return noteHistory.as_js();
  };

  const saveToLocalStorage = (key, data) => {
    try {
      const existingData = JSON.parse(localStorage.getItem(key) || '[]');
      existingData.push(data);
      localStorage.setItem(key, JSON.stringify(existingData));
    } catch (e) {
      console.error(`Error saving to localStorage (${key}):`, e);
    }
  };

  const getFromLocalStorage = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      console.error(`Error reading from localStorage (${key}):`, e);
      return [];
    }
  };

  return {
    isLoaded,
    error,
    generateAuth,
    createNewIVCNotes,
    issueNote,
    transferNote,
    verifyNote,
    authToJs,
    noteHistoryToJs,
    getAuthHistory: () => getFromLocalStorage(STORAGE_KEYS.AUTH),
    getIssuedNotes: () => getFromLocalStorage(STORAGE_KEYS.ISSUED_NOTES),
    getTransferredNotes: () => getFromLocalStorage(STORAGE_KEYS.TRANSFERRED_NOTES),
  };
}