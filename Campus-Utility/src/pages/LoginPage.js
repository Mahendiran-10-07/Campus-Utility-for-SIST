import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';
import backgroundImage from '../login-background.jpg'; 

function LoginPage() {
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  
  const [registerNumber, setRegisterNumber] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const { adminLogin, studentGuestLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const success = adminLogin(adminId, adminPassword);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid Admin ID or Password.');
    }
  };

  const handleStudentLogin = (e) => {
    e.preventDefault();
    if (!registerNumber.trim()) {
        setError("Please enter a Register Number.");
        return;
    }
    const success = studentGuestLogin(registerNumber);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div 
      className="login-container" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="login-box">
        <img src="/logo.png" alt="Sathyabama Logo" className="login-logo" />
        <p className="login-prompt">Enter your credentials to access the panel.</p>
        <form onSubmit={role === 'admin' ? handleAdminLogin : handleStudentLogin}>
          
          {/* This select element contains both options */}
          <select value={role} onChange={(e) => setRole(e.target.value)} className="role-dropdown">
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          {role === 'student' ? (
            <>
              <div className="input-group">
                <label htmlFor="registerNumber">Register Number</label>
                <input id="registerNumber" type="text" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} required />
              </div>
              <div className="input-group">
                <label htmlFor="studentPassword">Password</label>
                <input id="studentPassword" type="password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label htmlFor="adminId">Admin ID</label>
                <input id="adminId" type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)} required />
              </div>
              <div className="input-group">
                <label htmlFor="adminPassword">Password</label>
                <input id="adminPassword" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
              </div>
            </>
          )}
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-btn">LOG IN</button>
        </form>
        <button type="button" className="forgot-password">Forgot your password?</button>
      </div>
    </div>
  );
}

export default LoginPage;