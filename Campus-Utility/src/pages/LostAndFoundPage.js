import React from 'react';
import { Link } from 'react-router-dom';
import './LostAndFoundPage.css';


import backgroundImage from '../lost-and-found-background.jpg';

function LostAndFoundPage() {
  return (
    
    <div 
      className="lf-container" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* The outer "glass-card" div has been removed */}
      <h1 className="lf-title">Lost or Found Section</h1>
      <div className="lf-main">
        <Link to="/post-lost-item" className="lf-button">
          I Lost Something
        </Link>
        <Link to="/found-items" className="lf-button">
          I Found Something
        </Link>
      </div>
    </div>
  );
}

export default LostAndFoundPage;