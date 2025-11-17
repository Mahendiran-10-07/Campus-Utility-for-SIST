import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './ViewBorrowRequestsPage.css';
import backgroundImage from '../lost-and-found-background.jpg';

function ViewBorrowRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, role, showToast } = useAuth();
  
  const [offeringTo, setOfferingTo] = useState(null);
  const [offerMessage, setOfferMessage] = useState("");
  const [offerPhone, setOfferPhone] = useState("");

  // NEW: State for admin to view offers
  const [viewingOffersFor, setViewingOffersFor] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "borrowRequests"), 
          where("status", "==", "active"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const requestsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRequests(requestsList);
      } catch (error) {
        console.error("Error fetching borrow requests: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);
  
  // NEW: Function for admin to fetch offers for a specific request
  const handleViewOffers = async (requestId) => {
    setOfferingTo(null);
    setLoadingOffers(true);
    setViewingOffersFor(requestId);
    try {
        const offersQuery = query(collection(db, "borrowRequests", requestId, "offers"), orderBy("createdAt", "asc"));
        const offersSnapshot = await getDocs(offersQuery);
        const offersList = offersSnapshot.docs.map(doc => doc.data());
        setOffers(offersList);
    } catch (error) {
        console.error("Error fetching offers: ", error);
    } finally {
        setLoadingOffers(false);
    }
  };

  const handleAdminReplyClick = (itemId) => {
    setViewingOffersFor(null);
    setOfferingTo(itemId);
  };

  const handleOfferPhoneChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]{0,10}$/.test(value)) {
      setOfferPhone(value);
    }
  };

  const handleOfferSubmit = async (e, request) => {
    e.preventDefault();
    if (!offerMessage.trim() || (role !== 'admin' && !offerPhone.trim())) {
        showToast("Please fill out all required fields.", "error");
        return;
    }
    try {
        const offerData = {
            message: offerMessage,
            lenderId: currentUser.uid,
            lenderEmail: currentUser.email,
            lenderPhone: role === 'admin' ? 'N/A' : offerPhone,
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "borrowRequests", request.id, "offers"), offerData);
        await addDoc(collection(db, "notifications"), {
            recipientId: request.creatorId,
            postId: request.id,
            postItemName: request.itemName,
            message: `You received an offer to borrow a ${request.itemName}.`,
            replierPhone: role === 'admin' ? 'N/A' : offerPhone,
            read: false,
            createdAt: serverTimestamp()
        });
        showToast("Your offer has been sent privately!");
        setOfferingTo(null);
        setOfferMessage("");
        setOfferPhone("");
    } catch (error) {
        console.error("Error sending offer: ", error);
        showToast("Failed to send your offer. Please try again.", "error");
    }
  };

  if (loading) return <div className="loading-container">Loading requests...</div>;

  return (
    <div 
      className="borrow-requests-page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >

        <h1>Active Borrow Requests</h1>
        <div className="borrow-requests-list">
          {requests.length > 0 ? (
            requests.map(req => (
              <div key={req.id} className="borrow-request-card"> 
                <h2>{req.itemName}</h2>
                <p><strong>Requested By:</strong> {req.requesterName} ({req.requesterDept})</p>
                <p><strong>Required From:</strong> {new Date(req.startTime).toLocaleString()}</p>
                <p><strong>Return By:</strong> {new Date(req.returnTime).toLocaleString()}</p>
                
                <div className="borrow-card-actions">
                  {/* Students only see the reply button if it's not their own post */}
                  {role !== 'admin' && currentUser.uid !== req.creatorId && (
                      <button onClick={() => setOfferingTo(req.id)} className="action-btn offer-to-lend-btn">Offer to Lend</button>
                  )}
                  {/* Admins see both buttons on all posts */}
                  {role === 'admin' && (
                    <>
                      <button onClick={() => handleViewOffers(req.id)} className="action-btn view-offers-btn">View Offers</button>
                      <button onClick={() => handleAdminReplyClick(req.id)} className="action-btn offer-to-lend-btn">Reply as Admin</button>
                    </>
                  )}
                </div>

                {offeringTo === req.id && (
                  <form onSubmit={(e) => handleOfferSubmit(e, req)} className="offer-form">
                    {role !== 'admin' && (
                      <div className="form-group">
                        <label>Your Phone Number</label>
                        <input type="tel" value={offerPhone} onChange={handleOfferPhoneChange} pattern="[0-9]{10}" title="Please enter a 10-digit phone number" placeholder="Your 10-digit phone number" required />
                      </div>
                    )}
                    <div className="form-group">
                      <label>Message</label>
                      <textarea value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} placeholder="Write your private offer here..." required ></textarea>
                    </div>
                    <div className="offer-actions">
                      <button type="submit">Send Offer</button>
                      <button type="button" onClick={() => { setOfferingTo(null); setOfferPhone(''); }}>Cancel</button>
                    </div>
                  </form>
                )}

                {viewingOffersFor === req.id && (
                    <div className="admin-offers-viewer">
                        <h3>Offers for "{req.itemName}"</h3>
                        {loadingOffers ? <p>Loading offers...</p> :
                            offers.length > 0 ? (
                                offers.map((offer, index) => (
                                    <div key={index} className="admin-offer-card">
                                        <p className="offer-message">"{offer.message}"</p>
                                        <div className="offer-footer">
                                            <span className="offer-author">- from {offer.lenderEmail} | Contact: {offer.lenderPhone}</span>
                                        </div>
                                    </div>
                                ))
                            ) : <p>No offers for this request yet.</p>
                        }
                        <button onClick={() => setViewingOffersFor(null)} className="close-offers-btn">Close</button>
                    </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-requests-message">There are currently no active borrow requests.</p>
          )}
        </div>
      </div>
   
  );
}

export default ViewBorrowRequestsPage;