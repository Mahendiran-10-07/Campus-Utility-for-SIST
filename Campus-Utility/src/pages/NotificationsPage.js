import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification: ", error);
      alert("Failed to delete notification.");
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const q = query(
          collection(db, "notifications"),
          where("recipientId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const notificationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(notificationsList);

        querySnapshot.forEach(document => {
          if (!document.data().read) {
            updateDoc(doc(db, "notifications", document.id), { read: true });
          }
        });

      } catch (error) {
        console.error("Error fetching notifications: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  if (loading) return <div className="loading-container">Loading notifications...</div>;

  return (
    <div className="notifications-container">
      <button onClick={handleClose} className="close-btn">&times;</button>
      <h1>Notifications</h1>
      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif.id} className="notification-card">
              <button onClick={() => handleDeleteNotification(notif.id)} className="notification-delete-btn">&times;</button>
              <p>You received a reply on your post for: <strong>{notif.postItemName}</strong></p>
              <p className="notification-message">"{notif.message}"</p>
              {/* UPDATED: Display replier's phone number */}
              {notif.replierPhone && (
                <p className="notification-contact">
                  Finder's Contact: <strong>{notif.replierPhone}</strong>
                </p>
              )}
              <span className="notification-timestamp">
                {new Date(notif.createdAt?.toDate()).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p className="no-notifications-message">No Notifications</p>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;