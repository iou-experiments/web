import IVCNotesComponent from './components/wasm';
import './App.css';
import { useState } from 'react';

function App() {
  const [view, setView] = useState('Register');
  const [auth, setAuth] = useState();

  return (
    <div className="App">
      <IVCNotesComponent />
    </div>
  );
}

export default App;
