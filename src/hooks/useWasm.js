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
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to initialize WASM module:', err);
        setError(err);
      }
    }
    initWasm();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setIvcNotes(new WasmIVCNotes());
    }
  }, [isLoaded]);

  const loadG16Files = async (pkPath, vkPath) => {
    if (!isLoaded) {
      throw new Error('WASM module not loaded');
    }
    try {
      const pkResponse = await fetch(pkPath);
      const vkResponse = await fetch(vkPath);
      const pkBuffer = await pkResponse.arrayBuffer();
      const vkBuffer = await vkResponse.arrayBuffer();
      const pk = new Uint8ClampedArray(pkBuffer);
      const vk = new Uint8ClampedArray(vkBuffer);
      return createNewIVCNotes(pk, vk);
    } catch (error) {
      console.error('Error loading G16 files:', error);
      throw error;
    }
  };

  const generateAuth = () => {
    if (!isLoaded) {
      throw new Error('WASM module not loaded');
    }
    const auth = WasmIVCNotes.generate_auth();
    const authJs = auth.as_js();
    saveToLocalStorage(STORAGE_KEYS.AUTH, authJs);
    return auth;
  };

  const createNewIVCNotes = (pk, vk) => {
    if (!isLoaded || !pk || !vk) {
      console.log(pk, vk);
      throw new Error('WASM module not loaded');
    }
    try {
      return WasmIVCNotes.new(pk, vk);
    } catch (e) {
      console.log('Error creating new IVCNotes:', e);
      throw e;
    }
  };

  const issueNote = (auth, receiver, value) => {
    if (!ivcNotes) {
      throw new Error('IVCNotes not initialized');
    }
    try {
      const note = ivcNotes.issue(auth, "8e2bb3f867e21518954645afa35000d37d029be0c99f95832700f5e32645d12b", value);
      const noteJs = note.as_js();
      saveToLocalStorage(STORAGE_KEYS.ISSUED_NOTES, noteJs);
      return note;
    } catch (e) {
      console.log('Error issuing note:', e);
      throw e;
    }
  };

  const transferNote = (auth, noteHistory, receiver, value) => {
    if (!ivcNotes) {
      throw new Error('IVCNotes not initialized');
    }
    try {
      const transferredNote = ivcNotes.transfer(auth, noteHistory, receiver, value);
      const transferredNoteJs = transferredNote.as_js();
      saveToLocalStorage(STORAGE_KEYS.TRANSFERRED_NOTES, transferredNoteJs);
      return transferredNote;
    } catch (e) {
      console.log('Error transferring note:', e);
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
    loadG16Files,
    transferNote,
    verifyNote,
    authToJs,
    noteHistoryToJs,
    getAuthHistory: () => getFromLocalStorage(STORAGE_KEYS.AUTH),
    getIssuedNotes: () => getFromLocalStorage(STORAGE_KEYS.ISSUED_NOTES),
    getTransferredNotes: () => getFromLocalStorage(STORAGE_KEYS.TRANSFERRED_NOTES),
  };
}