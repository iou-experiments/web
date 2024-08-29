import React, { useState, useEffect } from 'react';
import { useIVCNotes } from '../hooks/useWasm';

function IVCNotesComponent() {
  const {
    isLoaded,
    error,
    generateAuth,
    createNewIVCNotes,
    issueNote,
    transferNote,
    verifyNote,
    authToJs,
    loadG16Files,
    noteHistoryToJs,
  } = useIVCNotes();

  const [auth, setAuth] = useState(null);
  const [noteHistory, setNoteHistory] = useState(null);
  const [ivcNotes, setIvcNotes] = useState(null);


  useEffect(() => {
    if (isLoaded) {
      initializeIVCNotes();
    }
  }, [isLoaded]);

  if (error) {
    return <div>Error loading WASM module: {error.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading WASM module...</div>;
  }


  const initializeIVCNotes = async () => {
    try {
      const newIvcNotes = await loadG16Files('../../keys/pk.g16', '../../keys/vk.g16');
      setIvcNotes(newIvcNotes);
      console.log('IVCNotes initialized successfully');
    } catch (err) {
      console.error('Error initializing IVCNotes:', err);
    }
  };


  const handleGenerateAuth = async () => {
    try {
      const newAuth = await generateAuth();
      setAuth(newAuth);
      console.log('Generated auth:', authToJs(newAuth));
    } catch (err) {
      console.error('Error generating auth:', err);
    }
  };

  const handleIssueNote = async () => {
    if (!auth) {
      console.error('Auth not generated');
      return;
    }
    try {
      const newNoteHistory = await issueNote(auth, 'receiver_address', 100);
      setNoteHistory(newNoteHistory);
      console.log('Issued note:', noteHistoryToJs(newNoteHistory));
    } catch (err) {
      console.error('Error issuing note:', err);
    }
  };

  const handleTransferNote = () => {
    if (!auth || !noteHistory) {
      console.error('Auth or note history not available');
      return;
    }
    try {
      const transferOutput = transferNote(auth, noteHistory, 'new_receiver_address', 50);
      console.log('Transfer output:', transferOutput);
      // You might want to update noteHistory here based on the transfer output
    } catch (err) {
      console.error('Error transferring note:', err);
    }
  };

  const handleVerifyNote = () => {
    if (!noteHistory) {
      console.error('Note history not available');
      return;
    }
    try {
      verifyNote(noteHistory);
      console.log('Note verified successfully');
    } catch (err) {
      console.error('Error verifying note:', err);
    }
  };

  return (
    <div>
      <h1>IVC Notes Operations</h1>
      <button onClick={handleGenerateAuth}>Generate Auth</button>
      <button onClick={handleIssueNote}>Issue Note</button>
      <button onClick={handleTransferNote}>Transfer Note</button>
      <button onClick={handleVerifyNote}>Verify Note</button>
    </div>
  );
}

export default IVCNotesComponent;