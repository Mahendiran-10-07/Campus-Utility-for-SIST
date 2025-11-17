import React, { useState, useEffect, useCallback } from 'react';
import { db, storage } from '../firebase.js';
import { collection, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './MyPostsPage.css';

function MyPostsPage() {
  const [allMyPosts, setAllMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const { currentUser, showToast } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);

  const fetchAllMyPosts = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    };
    setLoading(true);
    try {
      const lostItemsQuery = query(
        collection(db, "lostItems"),
        where("creatorId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const lostItemsSnapshot = await getDocs(lostItemsQuery);
      const lostPosts = lostItemsSnapshot.docs.map(doc => ({ id: doc.id, type: 'lost', ...doc.data() }));
      for (let post of lostPosts) {
        const repliesQuery = query(collection(db, "lostItems", post.id, "replies"), orderBy("createdAt", "asc"));
        const repliesSnapshot = await getDocs(repliesQuery);
        post.replies = repliesSnapshot.docs.map(doc => doc.data());
      }

      const borrowRequestsQuery = query(
        collection(db, "borrowRequests"),
        where("creatorId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const borrowRequestsSnapshot = await getDocs(borrowRequestsQuery);
      const borrowPosts = borrowRequestsSnapshot.docs.map(doc => ({ id: doc.id, type: 'borrow', ...doc.data() }));
      
      // NEW: Fetch offers for each borrow request
      for (let post of borrowPosts) {
        const offersQuery = query(collection(db, "borrowRequests", post.id, "offers"), orderBy("createdAt", "asc"));
        const offersSnapshot = await getDocs(offersQuery);
        post.offers = offersSnapshot.docs.map(doc => doc.data());
      }
      
      const combinedPosts = [...lostPosts, ...borrowPosts];
      combinedPosts.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      setAllMyPosts(combinedPosts);

    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAllMyPosts();
  }, [fetchAllMyPosts]);

  const handleDelete = async (postToDelete) => {
    const collectionName = postToDelete.type === 'lost' ? 'lostItems' : 'borrowRequests';
    try {
      if (postToDelete.imageUrl) {
        try {
            const imageRef = ref(storage, postToDelete.imageUrl);
            await deleteObject(imageRef);
        } catch (storageError) {
            console.warn("Could not delete image, it may be on Cloudinary.", storageError);
        }
      }
      const notifsQuery = query(collection(db, "notifications"), where("postId", "==", postToDelete.id));
      const notifsSnapshot = await getDocs(notifsQuery);
      notifsSnapshot.forEach(async (doc) => await deleteDoc(doc.ref));
      
      await deleteDoc(doc(db, collectionName, postToDelete.id));
      
      setAllMyPosts(allMyPosts.filter(post => post.id !== postToDelete.id));
      showToast("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post: ", error);
      showToast("Failed to delete post.", "error");
    } finally {
      setConfirmingDelete(null);
    }
  };
  
  const handleMarkAsFound = async (postId) => {
    const postRef = doc(db, "lostItems", postId);
    try {
      await updateDoc(postRef, { status: "resolved" });
      fetchAllMyPosts();
      showToast("Item Found!");
    } catch (error) {
      console.error("Error updating post status: ", error);
      showToast("Failed to update post status.", "error");
    }
  };

  const handleUndoMarkAsFound = async (postId) => {
    const postRef = doc(db, "lostItems", postId);
    try {
        await updateDoc(postRef, { status: "lost" });
        fetchAllMyPosts();
        showToast("Action undone.");
    } catch (error) {
        console.error("Error undoing post status: ", error);
        showToast("Failed to undo.", "error");
    }
  };

  const handleMarkAsGot = async (postId) => {
    const postRef = doc(db, "borrowRequests", postId);
    try {
      await updateDoc(postRef, { status: "resolved" });
      fetchAllMyPosts();
      showToast("Request marked as fulfilled!");
    } catch (error) {
        console.error("Error updating borrow status: ", error);
        showToast("Failed to update status.", "error");
    }
  };

  const handleUndoMarkAsGot = async (postId) => {
    const postRef = doc(db, "borrowRequests", postId);
    try {
        await updateDoc(postRef, { status: "active" });
        fetchAllMyPosts();
        showToast("Action undone.");
    } catch (error) {
        console.error("Error undoing borrow status: ", error);
        showToast("Failed to undo.", "error");
    }
  };

  const handleToggleReplies = (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
    }
  };

  if (loading) return <div className="loading-container">Loading your posts...</div>;

  return (
    <div className="my-posts-container">
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <span className="modal-close-btn">&times;</span>
          <img src={selectedImage} alt="Full size view" className="modal-image" />
        </div>
      )}

      <h1>My Posts & Requests</h1>
      {allMyPosts.map(post => (
        post.type === 'lost' ? (
          // --- RENDER LOST ITEM CARD ---
          <div key={post.id} className={`my-post-card ${post.status === 'resolved' ? 'resolved' : ''}`}>
            <div className="card-type-badge lost">Lost Report</div>
            <div className="my-post-details">
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.itemName} className="my-post-thumbnail" onClick={() => setSelectedImage(post.imageUrl)} />
              )}
              <div className="post-info">
                <h2>{post.itemName}</h2>
                <p><strong>Last Seen:</strong> {post.lastSeen}</p>
                <p className="timestamp">Posted on: {new Date(post.createdAt?.toDate()).toLocaleString()}</p>
              </div>
            </div>
            <div className="post-actions">
              {post.status !== 'resolved' && (
                <>
                  <Link to={`/edit-post/${post.id}`} className="action-btn edit-btn">Edit</Link>
                  {confirmingDelete === post.id ? (
                      <div className="confirm-delete">
                          <span>Are you sure?</span>
                          <button onClick={() => handleDelete(post)} className="confirm-yes">Yes</button>
                          <button onClick={() => setConfirmingDelete(null)} className="confirm-no">No</button>
                      </div>
                  ) : (
                      <button onClick={() => setConfirmingDelete(post.id)} className="action-btn delete-btn">Delete</button>
                  )}
                </>
              )}
              {post.status === 'resolved' ? (
                  <div className="resolved-actions">
                    <span className="resolved-badge">✔ Found</span>
                    <button onClick={() => handleUndoMarkAsFound(post.id)} className="action-btn undo-btn">Undo</button>
                  </div>
              ) : (
                  <button onClick={() => handleMarkAsFound(post.id)} className="action-btn resolve-btn">Mark as Found</button>
              )}
            </div>
            <div className="toggle-replies-container">
              <button onClick={() => handleToggleReplies(post.id)} className="toggle-replies-btn">
                {expandedPostId === post.id ? 'Hide Replies' : `Show Replies (${post.replies ? post.replies.length : 0})`}
              </button>
            </div>
            {expandedPostId === post.id && (
              <div className="replies-section">
                <h3>Replies Received</h3>
                {post.replies && post.replies.length > 0 ? (
                  post.replies.map((reply, index) => (
                    <div key={index} className="reply-card">
                      <p className="reply-message">"{reply.message}"</p>
                      <p className="reply-author">- from {reply.replierEmail} {reply.replierPhone && ` | Contact: ${reply.replierPhone}`}</p>
                    </div>
                  ))
                ) : ( <p className="no-replies">No replies yet.</p> )}
              </div>
            )}
          </div>
        ) : (
          // --- RENDER BORROW REQUEST CARD ---
          <div key={post.id} className={`my-post-card borrow ${post.status === 'resolved' ? 'resolved' : ''}`}>
             <div className="card-type-badge">Borrow Request</div>
             <div className="my-post-details">
              <div className="post-info">
                  <h2>{post.itemName}</h2>
                  <p><strong>Required From:</strong> {new Date(post.startTime).toLocaleString()}</p>
                  <p><strong>Return By:</strong> {new Date(post.returnTime).toLocaleString()}</p>
                  <p className="timestamp">Posted on: {new Date(post.createdAt?.toDate()).toLocaleString()}</p>
              </div>
             </div>
             <div className="post-actions">
              {post.status !== 'resolved' && (
                <>
                  <Link to={`/edit-borrow-request/${post.id}`} className="action-btn edit-btn">Edit</Link>
                  {confirmingDelete === post.id ? (
                      <div className="confirm-delete">
                          <span>Are you sure?</span>
                          <button onClick={() => handleDelete(post)} className="confirm-yes">Yes</button>
                          <button onClick={() => setConfirmingDelete(null)} className="confirm-no">No</button>
                      </div>
                  ) : (
                      <button onClick={() => setConfirmingDelete(post.id)} className="action-btn delete-btn">Delete</button>
                  )}
                </>
              )}
               {post.status === 'resolved' ? (
                  <div className="resolved-actions">
                      <span className="resolved-badge">✔ Fulfilled</span>
                      <button onClick={() => handleUndoMarkAsGot(post.id)} className="action-btn undo-btn">Undo</button>
                  </div>
              ) : (
                  <button onClick={() => handleMarkAsGot(post.id)} className="action-btn resolve-btn">Mark as Got</button>
              )}
             </div>

             {/* NEW: Toggle button and display for borrow offers */}
             <div className="toggle-replies-container">
              <button onClick={() => handleToggleReplies(post.id)} className="toggle-replies-btn">
                {expandedPostId === post.id ? 'Hide Offers' : `Show Offers (${post.offers ? post.offers.length : 0})`}
              </button>
            </div>
            {expandedPostId === post.id && (
              <div className="replies-section">
                <h3>Offers Received</h3>
                {post.offers && post.offers.length > 0 ? (
                  post.offers.map((offer, index) => (
                    <div key={index} className="reply-card">
                      <p className="reply-message">"{offer.message}"</p>
                      <p className="reply-author">
                        - from {offer.lenderEmail} 
                        {offer.lenderPhone && ` | Contact: ${offer.lenderPhone}`}
                      </p>
                    </div>
                  ))
                ) : ( <p className="no-replies">No offers yet.</p> )}
              </div>
            )}
          </div>
        )
      ))}
    </div>
  );
}

export default MyPostsPage;