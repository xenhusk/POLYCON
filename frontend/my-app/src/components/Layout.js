import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  const isSessionPage = location.pathname.includes('/session');

  if (isSessionPage) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;
