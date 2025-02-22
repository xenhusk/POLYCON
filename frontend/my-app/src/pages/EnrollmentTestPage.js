import React, { useState } from 'react';
import EnrollmentModal from '../components/EnrollmentModal';

function EnrollmentTestPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Enrollment Modal Test</h1>
      <button 
        onClick={() => setModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Open Enrollment Modal
      </button>
      {modalOpen && <EnrollmentModal closeModal={() => setModalOpen(false)} />}
    </div>
  );
}

export default EnrollmentTestPage;
