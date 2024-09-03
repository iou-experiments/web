import React, { useState, useEffect } from 'react';
import { useIVCNotes } from '../hooks/useWasm';
import LargeFileReader from './LargeFileReader';

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
    noteHistoryToJs,
  } = useIVCNotes();

  const [auth, setAuth] = useState(null);
  const [noteHistory, setNoteHistory] = useState(null);
  const [ivcNotes, setIvcNotes] = useState(null);
  const [pkb, setPKB] = useState(null);
  const [vkb, setVKB] = useState(null)

  useEffect(() => {
    if (pkb && vkb) {
      const ivc = createNewIVCNotes(pkb, vkb)
      setIvcNotes(ivc);
    }
  }, [pkb, vkb])

  if (error) {
    return <div>Error loading WASM module: {error.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading WASM module...</div>;
  }

  const handleGenerateAuth = async () => {
    try {
      const newAuth = await generateAuth();
      setAuth(authToJs(newAuth));
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
      const transferOutput = transferNote(auth, noteHistory, '8e2bb3f867e21518954645afa35000d37d029be0c99f95832700f5e32645d12b', 50);
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
      <LargeFileReader filePath="/keys/pk.bin" setData={setPKB} />
      <LargeFileReader filePath="/keys/vk.bin" setData={setVKB} />
      <button onClick={handleGenerateAuth}>Generate Auth</button>
      <button onClick={handleIssueNote}>Issue Note</button>
      <button onClick={handleTransferNote}>Transfer Note</button>
      <button onClick={handleVerifyNote}>Verify Note</button>
    </div>
  );
}

export default IVCNotesComponent;