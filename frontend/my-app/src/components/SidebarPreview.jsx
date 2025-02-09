import React from 'react';
import Sidebar from './Sidebar'; // or SidebarRoleBased if you want to test that one

const SidebarPreview = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="main-content p-4">
        <h1 className="text-2xl font-bold">Sidebar Preview</h1>
        <p>This is a preview of the Sidebar component.</p>
      </div>
    </div>
  );
};

export default SidebarPreview;
