import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LostFormPage.css';
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import imageCompression from 'browser-image-compression';
import SuccessModal from '../components/SuccessModal.js';
import backgroundImage from '../lost-and-found-background.jpg';

function LostFormPage() {
  const CLOUDINARY_CLOUD_NAME = "diggtwer2"; 
  const CLOUDINARY_UPLOAD_PRESET = "campus_app_unsigned";

  const [itemName, setItemName] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleModalClose = useCallback(() => {
    setShowSuccessModal(false);
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        handleModalClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, handleModalClose]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      setImage(compressedFile);
    } catch (error) {
      console.error("Error compressing image: ", error);
      setImage(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) {
        alert("You must be logged in to post an item.");
        return;
    }
    setUploading(true);
    try {
      let imageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message || 'Cloudinary upload failed');
        imageUrl = data.secure_url;
      }
      await addDoc(collection(db, "lostItems"), {
        name: userName,
        department: department,
        phone: phone,
        itemName: itemName,
        lastSeen: lastSeen,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        status: 'lost',
        creatorId: currentUser.uid
      });
      setShowSuccessModal(true);
    } catch (e) {
      console.error("Error submitting form: ", e);
      alert(`There was an error submitting your report: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]{0,10}$/.test(value)) {
      setPhone(value);
    }
  };

  return (
    <div 
      className="form-page-container" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {showSuccessModal && (
        <SuccessModal 
          message="Your lost item report has been successfully submitted!"
        />
      )}
      <div className="form-glass-card">
        <h2>Report a Lost Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>What item did you lose?</label>
            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Where was it last seen?</label>
            <input type="text" value={lastSeen} onChange={(e) => setLastSeen(e.target.value)} required />
          </div>
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
            <label>Any Image?(Optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <button type="submit" className="submit-btn" disabled={uploading}>
            {uploading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LostFormPage;