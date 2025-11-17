import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './LostFormPage.css'; // Reuses the same glass theme stylesheet
import backgroundImage from '../lost-and-found-background.jpg'; // Import the background image

function EditBorrowRequestPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  
  const [itemName, setItemName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!currentUser) return;
      const docRef = doc(db, 'borrowRequests', postId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().creatorId === currentUser.uid) {
        const data = docSnap.data();
        setItemName(data.itemName);
        setStartTime(data.startTime);
        setReturnTime(data.returnTime);
        setUserName(data.requesterName);
        setDepartment(data.requesterDept);
        setPhone(data.requesterPhone);
      } else {
        showToast("Request not found or you don't have permission to edit it.", "error");
        navigate('/my-posts');
      }
      setLoading(false);
    };
    fetchRequest();
  }, [postId, currentUser, navigate, showToast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const postRef = doc(db, 'borrowRequests', postId);
    try {
      await updateDoc(postRef, {
        itemName,
        startTime,
        returnTime,
        requesterName: userName,
        requesterDept: department,
        requesterPhone: phone
      });
      showToast("Borrow request updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error updating document: ", error);
      showToast("Failed to update request.", "error");
    }
  };
  
  if (loading) return <div className="loading-container">Loading request...</div>;

  return (
    <div 
      className="form-page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="form-glass-card">
        <h2>Edit Your Borrow Request</h2>
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
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Item Needed</label>
                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Required From</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Will be Returned By</label>
                <input type="datetime-local" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} required />
            </div>
            <button type="submit" className="submit-btn">Update Request</button>
        </form>
      </div>
    </div>
  );
}

export default EditBorrowRequestPage;