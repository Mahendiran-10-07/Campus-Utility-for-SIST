import React from 'react';
import { Link } from 'react-router-dom';
import './BorrowPage.css';
import backgroundImage from '../lost-and-found-background.jpg';

function BorrowPage() {
  return (
    <div 
      className="borrow-page-container" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
        <h1 className="borrow-title">Borrow Section</h1>
        <div className="borrow-main">
          <Link to="/post-borrow-request" className="borrow-button">
            Request an Item
          </Link>
          <Link to="/view-borrow-requests" className="borrow-button">
            View Requests
          </Link>
        </div>
      </div>
    
  );
}

export default BorrowPage;