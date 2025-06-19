// src/components/ExportModal.tsx
import React from "react";

interface ExportModalProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  show,
  message,
  onClose,
}) => {
  if (!show) return null;
  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50'>
      <div className='bg-[#013503] p-6 rounded-lg shadow-xl text-center border-2 border-green-500'>
        <h3 className='text-xl font-bold text-lime-500 mb-4'>Export Status</h3>
        <p className='text-gray-200 mb-6'>{message}</p>
        <button
          onClick={onClose}
          className='px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200'
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ExportModal;
