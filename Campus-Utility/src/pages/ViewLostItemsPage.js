import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './ViewLostItemsPage.css';
import backgroundImage from '../lost-and-found-background.jpg';

function ViewLostItemsPage() {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser, role, showToast } = useAuth();
  
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyPhone, setReplyPhone] = useState("");
  
  const [confirmingDelete, setConfirmingDelete] = useState(null); 
  const [viewingRepliesFor, setViewingRepliesFor] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // UPDATED: This query now only fetches items with a "lost" status
        const q = query(
            collection(db, "lostItems"), 
            where("status", "==", "lost"), 
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const itemsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllItems(itemsList);
        setFilteredItems(itemsList);
      } catch (error) {
        console.error("Error fetching lost items: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const results = allItems.filter(item =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastSeen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(results);
  }, [searchTerm, allItems]);
  
  const handleViewReplies = async (postId) => {
    setReplyingTo(null);
    setLoadingReplies(true);
    setViewingRepliesFor(postId);
    try {
        const repliesQuery = query(collection(db, "lostItems", postId, "replies"), orderBy("createdAt", "asc"));
        const repliesSnapshot = await getDocs(repliesQuery);
        const repliesList = repliesSnapshot.docs.map(doc => doc.data());
        setReplies(repliesList);
    } catch (error) {
        console.error("Error fetching replies: ", error);
    } finally {
        setLoadingReplies(false);
    }
  };

  const handleAdminReplyClick = (itemId) => {
    setViewingRepliesFor(null);
    setReplyingTo(itemId);
  };

  const handleDeleteClick = (itemId) => { setConfirmingDelete(itemId); };
  const cancelDelete = () => { setConfirmingDelete(null); };

  const confirmDelete = async (itemId) => {
    try {
      await deleteDoc(doc(db, "lostItems", itemId));
      setAllItems(allItems.filter(item => item.id !== itemId));
      showToast("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
      showToast("Failed to delete post.", "error");
    } finally {
      setConfirmingDelete(null);
    }
  };

  const handleReplySubmit = async (e, item) => {
    e.preventDefault();
    if (!replyMessage.trim() || (role !== 'admin' && !replyPhone.trim())) {
        showToast("Please fill out all required fields.", "error");
        return;
    }
    try {
        const replyData = {
            message: replyMessage,
            replierPhone: role === 'admin' ? 'N/A' : replyPhone,
            replierId: currentUser.uid,
            replierEmail: currentUser.email,
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "lostItems", item.id, "replies"), replyData);
        await addDoc(collection(db, "notifications"), {
            recipientId: item.creatorId,
            postId: item.id,
            postItemName: item.itemName,
            message: replyMessage,
            replierPhone: role === 'admin' ? 'N/A' : replyPhone,
            read: false,
            createdAt: serverTimestamp()
        });
        
        showToast("Your reply has been sent privately!");
        setReplyingTo(null);
        setReplyMessage("");
        setReplyPhone("");
    } catch (error) {
        console.error("Error sending reply: ", error);
        showToast("Failed to send reply. Please try again.", "error");
    }
  };
  
  const handleReplyPhoneChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]{0,10}$/.test(value)) {
      setReplyPhone(value);
    }
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div 
      className="view-items-page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <span className="modal-close-btn">&times;</span>
          <img src={selectedImage} alt="Full size view" className="modal-image" />
        </div>
      )}

      <div className="glass-container">
        <h1>Lost Item Reports</h1>
        <input
          type="text"
          className="search-bar"
          placeholder="Search by item name, location, or reporter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="items-list">
          {filteredItems.map(item => (
            <div key={item.id} className={`item-card ${item.imageUrl ? 'with-image' : 'without-image'}`}>
              <div>
                <p className="timestamp">
                Reported on: {new Date(item.createdAt?.toDate()).toLocaleString()}
                </p>
              </div>
              <div className="card-content-wrapper">
                  <div className="item-details">
                      {role === 'admin' && (
                          <div className="admin-actions">
                          {confirmingDelete === item.id ? (
                              <div className="confirm-delete-box">
                              <p>Are you sure?</p>
                              <button onClick={() => confirmDelete(item.id)} className="confirm-yes-btn">Yes</button>
                              <button onClick={cancelDelete} className="confirm-cancel-btn">No</button>
                              </div>
                          ) : (
                              <button onClick={() => handleDeleteClick(item.id)} className="delete-btn">Delete</button>
                          )}
                          </div>
                      )}
                      <h2>{item.itemName}</h2>
                      <p><strong>Last Seen:</strong> {item.lastSeen}</p>
                      <p><strong>Reported By:</strong> {item.name} ({item.department})</p>
                      <p className="contact-info"><strong>Contact:</strong> <a href={`tel:${item.phone}`}>📞 {item.phone}</a></p>
                  </div>
              </div>

              <div>
                {item.imageUrl && (
                  <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  className="item-thumbnail"
                  onClick={() => setSelectedImage(item.imageUrl)}
                  />
                )}
                <div className="card-actions">
                  {role !== 'admin' && (
                    <button onClick={() => setReplyingTo(item.id)} className="reply-btn">Reply to this Post</button>
                  )}
                  {role === 'admin' && (
                    <>
                      <button onClick={() => handleViewReplies(item.id)} className="view-replies-btn">View Replies</button>
                      <button onClick={() => handleAdminReplyClick(item.id)} className="admin-reply-btn">Reply as Admin</button>
                    </>
                  )}
                </div>
              </div>

              {replyingTo === item.id && (
                <form onSubmit={(e) => handleReplySubmit(e, item)} className="reply-form">
                  {role !== 'admin' && (
                    <div className="form-group">
                        <label>Your Phone Number</label>
                        <input 
                          type="tel" 
                          value={replyPhone} 
                          onChange={handleReplyPhoneChange} 
                          pattern="[0-9]{10}"
                          title="Please enter a 10-digit phone number"
                          placeholder="Your 10-digit phone number"
                          required 
                        />
                    </div>
                  )}
                  <div className="form-group">
                      <label>Message</label>
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Write your private reply here..."
                        required
                      ></textarea>
                  </div>
                  <div className="reply-actions">
                    <button type="submit">Send Reply</button>
                    <button type="button" onClick={() => { setReplyingTo(null); setReplyPhone(''); }}>Cancel</button>
                  </div>
                </form>
              )}
              {viewingRepliesFor === item.id && (
                  <div className="admin-replies-viewer">
                      <h3>Replies for "{item.itemName}"</h3>
                      {loadingReplies ? <p>Loading replies...</p> :
                          replies.length > 0 ? (
                              replies.map((reply, index) => (
                                  <div key={index} className="admin-reply-card">
                                      <p className="reply-message">"{reply.message}"</p>
                                      <div className="reply-footer">
                                          <span className="reply-author">- from {reply.replierEmail}</span>
                                          <span className="reply-timestamp">
                                              {new Date(reply.createdAt?.toDate()).toLocaleString()}
                                          </span>
                                      </div>
                                  </div>
                              ))
                          ) : <p>No replies for this post.</p>
                      }
                      <button onClick={() => setViewingRepliesFor(null)} className="close-replies-btn">Close</button>
                  </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewLostItemsPage;