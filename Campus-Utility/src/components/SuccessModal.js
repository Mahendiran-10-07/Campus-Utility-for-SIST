import React from 'react';
import './SuccessModal.css';

function SuccessModal({ message }) { // The onClose prop is no longer needed here
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon">✓</div>
        <p>{message}</p>
        {/* The OK button has been removed */}
      </div>
    </div>
  );
}

export default SuccessModal;