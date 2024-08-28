import { useState, useEffect } from 'react';
import init, { WasmIVCNotes, WasmAuth, WasmNoteHistory } from './ivcnotes_wasm_bg.js';

export function useIVCNotes() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [ivcNotes, setIvcNotes] = useState(null);

  const loadG16Files = async (pkPath, vkPath) => {
    if (!isLoaded) {
      throw new Error('WASM module not loaded');
    }

    try {
      const [pkResponse, vkResponse] = await Promise.all([
        fetch(pkPath),
        fetch(vkPath)
      ]);

      console.log(pkResponse, vkResponse);

      const [pkBuffer, vkBuffer] = await Promise.all([
        pkResponse.arrayBuffer(),
        vkResponse.arrayBuffer()
      ]);

      const pk = new Uint8Array(pkBuffer);
      const vk = new Uint8Array(vkBuffer);

      console.log(pk, vk)

      return createNewIVCNotes(pk, vk);
    } catch (error) {
      console.error('Error loading G16 files:', error);
      throw error;
    }
  };


  useEffect(() => {
    async function initWasm() {
      try {
        await init();
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

  const generateAuth = () => {
    if (!isLoaded) {
      throw new Error('WASM module not loaded');
    }
    return WasmIVCNotes.generate_auth();
  };

  const createNewIVCNotes = (pk, vk) => {
    if (!isLoaded) {
      throw new Error('WASM module not loaded');
    }
    try {
      return WasmIVCNotes.new(pk, vk);
    } catch (e) {
      console.log('E', e)
    }
  } 

  const issueNote = (auth, receiver, value) => {
    if (!ivcNotes) {
      throw new Error('IVCNotes not initialized');
    }
    try {
      return ivcNotes.issue(auth, receiver, value);
    } catch (e) {
      console.log('e', e)
    }
  }

  const transferNote = (auth, noteHistory, receiver, value) => {
    if (!ivcNotes) {
      throw new Error('IVCNotes not initialized');
    }
    return ivcNotes.transfer(auth, noteHistory, receiver, value);
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
  };
}