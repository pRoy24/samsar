import React, { useState, useContext, createContext, useEffect } from 'react';

// Step 2: Define the ColorModeContext 
const ColorModeContext = createContext({
  colorMode: 'light',
  setColorMode: (mode) => { },
  toggleColorMode: () => { }
});

// Step 3: Create the Context Provider
export const ColorModeProvider = ({ children }) => {
  const [colorMode, setColorMode] = useState('dark'); // Default to 'light'

  useEffect(() => {

    const handleStorageChange = () => {
      // Check the value from localStorage and update colorMode accordingly
      const colorMode = localStorage.getItem('colorMode')  || 'dark';
      setColorMode(colorMode);
    };

    // Add event listener to storage change
    window.addEventListener('storage', handleStorageChange);

    handleStorageChange();

    // Cleanup the event listener when the component unmounts
   // return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleColorMode = () => {
    // Toggle the color mode and update localStorage
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    localStorage.setItem('colorMode', newMode);
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, setColorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};

// Custom hook to use the ColorModeContext
export const useColorMode = () => useContext(ColorModeContext);
