// src/components/Toast.js
import React from 'react';
import './Toast.css';

function Toast({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div className={`toast-notification ${type}`}>
      {message}
      <button onClick={onClose} className="toast-close-btn">&times;</button>
    </div>
  );
}

export default Toast;