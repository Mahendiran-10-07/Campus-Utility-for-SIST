import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import imageCompression from 'browser-image-compression';
import './LostFormPage.css';
import backgroundImage from '../lost-and-found-background.jpg';

function EditPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();

  const CLOUDINARY_CLOUD_NAME = "diggtwer2";
  const CLOUDINARY_UPLOAD_PRESET = "campus_app_unsigned";

  const [itemName, setItemName] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!currentUser) return;
      const docRef = doc(db, 'lostItems', postId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().creatorId === currentUser.uid) {
        const data = docSnap.data();
        setItemName(data.itemName);
        setLastSeen(data.lastSeen);
        setUserName(data.name);
        setDepartment(data.department);
        setPhone(data.phone);
        setCurrentImageUrl(data.imageUrl || '');
      } else {
        showToast("Post not found or you don't have permission to edit it.", "error");
        navigate('/my-posts');
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId, currentUser, navigate, showToast]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
    try {
      const compressedFile = await imageCompression(file, options);
      setNewImageFile(compressedFile);
      setCurrentImageUrl(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Error compressing image: ", error);
      showToast("Error compressing image.", "error");
    }
  };

  const handleRemoveImage = () => {
      setCurrentImageUrl('');
      setNewImageFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const postRef = doc(db, 'lostItems', postId);

    try {
      let updatedImageUrl = currentImageUrl;

      if (newImageFile) {
        const formData = new FormData();
        formData.append('file', newImageFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message || 'Cloudinary upload failed');
        updatedImageUrl = data.secure_url;
      }

      await updateDoc(postRef, {
        itemName,
        lastSeen,
        name: userName,
        department,
        phone,
        imageUrl: updatedImageUrl,
      });

      showToast("Post updated successfully!");
      navigate(-1);

    } catch (error) {
      console.error("Error updating document: ", error);
      showToast("Failed to update post.", "error");
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading post...</div>;

  return (
    <div 
      className="form-page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="form-glass-card">
        <h2>Edit Your Lost Item Report</h2>
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
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Image</label>
            {currentImageUrl && (
              <div className="image-preview">
                <img src={currentImageUrl} alt="Current item" />
                <button type="button" onClick={handleRemoveImage} className="remove-image-btn">Remove Image</button>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Post'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPostPage;