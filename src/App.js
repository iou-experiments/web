import IVCNotesComponent from './components/wasm';
import RegisterPage from './components/Register';
import './App.css';
import { useState } from 'react';

function App() {
  const [view, setView] = useState('Register');
 

  return (
    <div className="App">
      {
        view === 'Register' ? <RegisterPage /> : <IVCNotesComponent />
      }
    </div>
  );
}

export default App;
