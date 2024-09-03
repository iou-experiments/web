import { useState, useEffect, useCallback } from 'react';
import init, { WasmIVCNotes, WasmAuth, initSync } from './ivcnotes_wasm_bg.js';

const STORAGE_KEYS = {
  AUTH: 'ivcnotes_auth',
  ISSUED_NOTES: 'ivcnotes_issued_notes',
  TRANSFERRED_NOTES: 'ivcnotes_transferred_notes',
};

export function useIVCNotes() {
  const [state, setState] = useState({
    isLoaded: false,
    error: null,
    ivcNotes: null,
  });

  useEffect(() => {
    async function initWasm() {
      try {
        await init();
        await initSync();
        setState(prevState => ({ ...prevState, isLoaded: true }));
      } catch (err) {
        console.error('Failed to initialize WASM module:', err);
        setState(prevState => ({ ...prevState, error: err }));
      }
    }
    initWasm();
  }, []);

  const saveToLocalStorage = useCallback((key, data) => {
    try {
      const existingData = JSON.parse(localStorage.getItem(key) || '[]');
      existingData.push(data);
      localStorage.setItem(key, JSON.stringify(existingData));
    } catch (e) {
      console.error(`Error saving to localStorage (${key}):`, e);
    }
  }, []);

  const getFromLocalStorage = useCallback((key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      console.error(`Error reading from localStorage (${key}):`, e);
      return [];
    }
  }, []);

  const generateAuth = useCallback((username) => {
    if (!state.isLoaded) throw new Error('WASM module not loaded');

    const auth = WasmIVCNotes.generate_auth();
    saveToLocalStorage(STORAGE_KEYS.AUTH, { username, auth });
    return auth;
  }, [state.isLoaded, saveToLocalStorage]);

  const createNewIVCNotes = useCallback((pk, vk) => {
    if (!state.isLoaded) throw new Error('WASM module not loaded');

    try {
      const newIvc = WasmIVCNotes.new_unchecked(pk, vk);
      setState(prevState => ({ ...prevState, ivcNotes: newIvc }));
      return newIvc;
    } catch (e) {
      console.error('Error creating new IVCNotes:', e);
      throw e;
    }
  }, [state.isLoaded]);

  const issueNote = useCallback((auth, receiver, value) => {
    if (!state.ivcNotes) throw new Error('IVCNotes not initialized');

    try {
      const authjs = WasmAuth.from_js(auth);
      const noteHistory = state.ivcNotes.issue(authjs, '8e2bb3f867e21518954645afa35000d37d029be0c99f95832700f5e32645d12b', value);
      saveToLocalStorage(STORAGE_KEYS.ISSUED_NOTES, { auth: authjs, receiver, value, noteHistory });
      return noteHistory;
    } catch (e) {
      console.error('Error issuing note:', e);
      throw e;
    }
  }, [state.ivcNotes, saveToLocalStorage]);

  const transferNote = useCallback((auth, noteHistory, receiver, value) => {
    if (!state.ivcNotes) throw new Error('IVCNotes not initialized');

    const newNoteHistory = state.ivcNotes.transfer(auth, noteHistory, receiver, value);
    saveToLocalStorage(STORAGE_KEYS.TRANSFERRED_NOTES, { auth, noteHistory: newNoteHistory, receiver, value });
    return newNoteHistory;
  }, [state.ivcNotes, saveToLocalStorage]);

  const verifyNote = useCallback((noteHistory) => {
    if (!state.ivcNotes) throw new Error('IVCNotes not initialized');
    return state.ivcNotes.verify(noteHistory);
  }, [state.ivcNotes]);

  const authToJs = useCallback((auth) => {
    if (!state.isLoaded) throw new Error('WASM module not loaded');
    return auth.as_js();
  }, [state.isLoaded]);

  const noteHistoryToJs = useCallback((noteHistory) => {
    if (!state.isLoaded) throw new Error('WASM module not loaded');
    return noteHistory.as_js();
  }, [state.isLoaded]);

  return {
    ...state,
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