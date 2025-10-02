// HelpContext.jsx
import React, { createContext, useState } from 'react';

export const HelpContext = createContext(null);

export const HelpProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <HelpContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </HelpContext.Provider>
  );
};