import logo from './logo.svg';
import './App.css';
import { UserProvider } from './contexts/UserContext';
import { AlertDialogProvider } from './contexts/AlertDialogContext';
import Home from './components/landing/Home.tsx'
import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { ColorModeProvider  } from './contexts/ColorMode.js';
import { BrowserRouter } from 'react-router-dom';
const RPC_URL = process.env.REACT_APP_RPC_URL;

const config = {
  rpcUrl: RPC_URL,
  domain: 'samsar.gg',
  siweUri: 'https://samsar.gg/',
};


function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <UserProvider>
            <AlertDialogProvider>
              <ColorModeProvider>
                <AuthKitProvider config={config}>
                  <Home />
                </AuthKitProvider>
              </ColorModeProvider>
            </AlertDialogProvider>
          </UserProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
