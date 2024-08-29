import React, { useState, useEffect } from 'react';
import { useIVCNotes } from '../hooks/useWasm'; // Assuming this is the hook you provided earlier

export default function RegisterPage() {
  const [storedAuths, setStoredAuths] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [ivcNotes, setIvcNotes] = useState();
  const {
    isLoaded,
    error,
    generateAuth,
    createNewIVCNotes,
    loadG16Files,
  } = useIVCNotes();

  const initializeIVCNotes = async () => {
    try {
      const newIvcNotes = await loadG16Files('../../keys/pk.g16', '../../keys/vk.g16');
      setIvcNotes(newIvcNotes);
      console.log('IVCNotes initialized successfully');
    } catch (err) {
      console.error('Error initializing IVCNotes:', err);
    }
  };
  useEffect(() => {
    let getK = async () => {
      if (isLoaded) {
        await initializeIVCNotes();
      }
    }
    getK()
  }, [isLoaded]);
  
  useEffect(() => {
    
    const auths = JSON.parse(localStorage.getItem('iouAuths')) || [];
    console.log(auths, '121');
    setStoredAuths(auths);
  }, []);

  if (error) {
    return <div>Error loading WASM module: {error.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading WASM module...</div>;
  }


  const handleNewAuth = () => {
    if (newUsername && isLoaded) {
      const auth = generateAuth();
      const authInfo = { username: newUsername, auth: auth };
      const updatedAuths = [...storedAuths, authInfo];
      localStorage.setItem('iouAuths', JSON.stringify(updatedAuths));
      setStoredAuths(updatedAuths);
      setNewUsername('');
    }
  };

  const handleExistingAuth = (auth) => {
    if (isLoaded) {
      createNewIVCNotes(auth);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">IOU</h1>
      
      {storedAuths?.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Existing Account:</h2>
          <div className="space-y-2">
            {storedAuths.map((authInfo, index) => (
              <button
                key={index}
                onClick={() => handleExistingAuth(authInfo.auth)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                {authInfo.username}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-lg mb-4">No existing accounts. Please register.</p>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Create New Account:</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter username"
            className="flex-grow border rounded py-2 px-3"
          />
          <button
            onClick={handleNewAuth}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}