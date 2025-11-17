import React from 'react';
import './ConfirmModal.css';

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="confirm-modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button onClick={onCancel} className="modal-cancel-btn">Cancel</button>
          <button onClick={onConfirm} className="modal-confirm-btn">Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;