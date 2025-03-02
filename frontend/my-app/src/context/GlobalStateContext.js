import React, { createContext, useContext, useState } from 'react';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    userData: null,
    bookings: null,
    courses: null,
    grades: null,
    consultationHistory: null,
    lastUpdated: {
      userData: null,
      bookings: null,
      courses: null,
      grades: null,
      consultationHistory: null,
    }
  });

  const updateState = (key, data) => {
    setGlobalState(prevState => ({
      ...prevState,
      [key]: data,
      lastUpdated: {
        ...prevState.lastUpdated,
        [key]: new Date()
      }
    }));
  };

  return (
    <GlobalStateContext.Provider value={{ globalState, updateState, setGlobalState }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
