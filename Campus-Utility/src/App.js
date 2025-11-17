import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Toast from './components/Toast.js';


import HomePage from './pages/HomePage.js';
import LostAndFoundPage from './pages/LostAndFoundPage.js';
import BorrowPage from './pages/BorrowPage.js';
import LostFormPage from './pages/LostFormPage.js';
import ViewLostItemsPage from './pages/ViewLostItemsPage.js';
import LoginPage from './pages/LoginPage.js';
import MyPostsPage from './pages/MyPostsPage.js';
import NotificationsPage from './pages/NotificationsPage.js';
import EditPostPage from './pages/EditPostPage.js';
import ActivityLogPage from './pages/ActivityLogPage.js';
import BorrowFormPage from './pages/BorrowFormPage.js';
import ViewBorrowRequestsPage from './pages/ViewBorrowRequestsPage.js';
import EditBorrowRequestPage from './pages/EditBorrowRequestPage.js';
import './App.css';

function App() {
  const { currentUser, toast, hideToast } = useAuth();

  return (
    <div className="App">
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      <Routes>
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/" element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/lost-and-found" element={currentUser ? <LostAndFoundPage /> : <Navigate to="/login" />} />
        <Route path="/borrow" element={currentUser ? <BorrowPage /> : <Navigate to="/login" />} />
        <Route path="/post-lost-item" element={currentUser ? <LostFormPage /> : <Navigate to="/login" />} />
        <Route path="/found-items" element={currentUser ? <ViewLostItemsPage /> : <Navigate to="/login" />} />
        <Route path="/my-posts" element={currentUser ? <MyPostsPage /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={currentUser ? <NotificationsPage /> : <Navigate to="/login" />} />
        <Route path="/edit-post/:postId" element={currentUser ? <EditPostPage /> : <Navigate to="/login" />} />
        <Route path="/activity-log" element={currentUser ? <ActivityLogPage /> : <Navigate to="/login" />} />
        <Route path="/post-borrow-request" element={currentUser ? <BorrowFormPage /> : <Navigate to="/login" />} />
        <Route path="/view-borrow-requests" element={currentUser ? <ViewBorrowRequestsPage /> : <Navigate to="/login" />} />
        <Route path="/edit-borrow-request/:postId" element={currentUser ? <EditBorrowRequestPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;