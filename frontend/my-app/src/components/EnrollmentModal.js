import React, { useState, useEffect, useRef } from 'react';

function EnrollmentModal({ closeModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const searchTimeout = useRef(null);
  const teacherID = localStorage.getItem('teacherID');

  const debouncedSearch = (term) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setIsSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5001/search/students?query=${encodeURIComponent(term.toLowerCase())}`);
        const data = await res.json();
        setStudentResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearchLoading(false);
      }
    }, 200);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const submitEnrollment = async () => {
    if (!teacherID || selectedStudents.length === 0) {
      setMessage({ type: 'error', content: "Please select at least one student." });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/enrollment/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherID,
          studentIDs: selectedStudents.map(s => s.id)
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', content: "Students enrolled successfully!" });
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        setMessage({ type: 'error', content: data.error || "Enrollment failed." });
      }
    } catch (error) {
      setMessage({ type: 'error', content: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Enroll Students</h2>
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
            placeholder="Search students..."
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
          />
          {isInputFocused && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded max-h-60 overflow-y-auto">
              {isSearchLoading ? (
                <li className="p-2 text-center">Loading...</li>
              ) : studentResults.length === 0 ? (
                <li className="p-2 text-center text-gray-500">No students found</li>
              ) : (
                studentResults
                  .filter(student => !selectedStudents.some(s => s.id === student.id))
                  .map(student => (
                    <li
                      key={student.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => {
                        setSelectedStudents([...selectedStudents, student]);
                        setSearchTerm('');
                      }}
                    >
                      {student.firstName} {student.lastName}
                    </li>
                  ))
              )}
            </ul>
          )}
        </div>
        <div className="mb-4">
          {selectedStudents.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map(student => (
                <div key={student.id} className="bg-blue-500 text-white px-2 py-1 rounded flex items-center">
                  <span>
                    {student.firstName} {student.lastName}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id))
                    }
                    className="ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {message.content && (
          <div
            className={`mb-4 p-2 rounded ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message.content}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button onClick={closeModal} className="bg-gray-300 text-black px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={submitEnrollment}
            disabled={isLoading}
            className={`bg-blue-500 text-white px-4 py-2 rounded ${isLoading && 'opacity-50'}`}
          >
            {isLoading ? 'Processing...' : 'Enroll Students'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentModal;
