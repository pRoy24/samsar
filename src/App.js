import logo from './logo.svg';
import './App.css';
import { UserProvider } from './contexts/UserContext';
import { AlertDialogProvider } from './contexts/AlertDialogContext';
import Home from './components/landing/Home.tsx'

import { ColorModeProvider  } from './contexts/ColorMode.js';
import { BrowserRouter } from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <UserProvider>
            <AlertDialogProvider>
              <ColorModeProvider>
                  <Home />
              </ColorModeProvider>
            </AlertDialogProvider>
          </UserProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
