import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';
import homeBackground from '../home-background.jpg';

function HomePage() {
  const { currentUser, role, logout, notificationCount } = useAuth(); // Get the user's role
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


 return (
  <div className="home-container" style={{ backgroundImage: `url(${homeBackground})` }}>
    <header className="home-header">
      
      <h1>Campus Utility App</h1>
      <div className="user-actions">
        {/* This code adds the admin-only link */}
        {role === 'admin' && (
            <Link to="/activity-log" className="action-link1">🖥️</Link>
        )}

        <Link to="/notifications" className="action-link notification-link">
          🔔
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </Link>
        <Link to="/my-posts" className="action-link">My Posts</Link>
        <div className="profile-container" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="action-link profile-btn">
            👤
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item user-info">
                Signed in as:<br/>
                <strong>{currentUser.email}</strong>
              </div>
              <button onClick={handleLogout} className="dropdown-item logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    <main className="home-main">
      <Link to="/lost-and-found" className="nav-button">
        Lost or Found ?
      </Link>
      <Link to="/borrow" className="nav-button">
        Borrow
      </Link>
    </main>

    
    <footer className="home-footer">
        <p style={{ wordSpacing: '5px' }}>FOR SIST</p>
    </footer>
  </div>
);
}

export default HomePage;