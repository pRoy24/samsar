import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark'); // Default theme

  useEffect(() => {
    document.body.className = theme;

  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const setNewTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }
  
  return (
    <div className="theme-toggle">
      <button className={`btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setNewTheme('dark')}>Dark Mode</button>
      <button className={`btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setNewTheme('light')}>Light Mode</button>
    </div>
  );
};

export default ThemeToggle;

