import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SuccessModal from '../components/SuccessModal.js';
import './LostFormPage.css'; // Reuse the same form styles
import backgroundImage from '../lost-and-found-background.jpg'; // Import the background

function BorrowFormPage() {
  const { currentUser, showToast } = useAuth();
  const navigate = useNavigate();

  const [itemName, setItemName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]{0,10}$/.test(value)) {
      setPhone(value);
    }
  };
  
  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false);
    navigate('/borrow');
  }, [navigate]);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        handleModalClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, handleModalClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "borrowRequests"), {
        creatorId: currentUser.uid,
        requesterName: userName,
        requesterDept: department,
        requesterPhone: phone,
        itemName: itemName,
        startTime: startTime,
        returnTime: returnTime,
        createdAt: serverTimestamp(),
        status: 'active'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating borrow request: ", error);
      showToast("Failed to create request. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="form-page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {showSuccessModal && (
        <SuccessModal 
          message="Your borrow request has been posted successfully!"
          onClose={handleModalClose}
        />
      )}
      <div className="form-glass-card">
        <h2>Request an Item to Borrow</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
            <label>Your Name</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
            </div>
            <div className="form-group">
            <label>Your Department</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required />
            </div>
            <div className="form-group">
            <label>Your Phone Number</label>
            <input type="tel" value={phone} onChange={handlePhoneChange} pattern="[0-9]{10}" title="Please enter a 10-digit phone number" required />
            </div>
            <div className="form-group">
            <label>Item Needed (e.g., Drafter, Calculator)</label>
            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            </div>
            <div className="form-group">
            <label>Required From (Date and Time)</label>
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="form-group">
            <label>Will be Returned By (Date and Time)</label>
            <input type="datetime-local" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} required />
            </div>
            <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
        </form>
      </div>
    </div>
  );
}

export default BorrowFormPage;