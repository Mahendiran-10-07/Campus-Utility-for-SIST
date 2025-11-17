import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 3000);
  };
  const hideToast = () => setToast({ message: '', type: '' });
  
  const ADMIN_ID = 'admin';
  const ADMIN_PASS = '123';

  const logActivity = async (action, user) => {
    try {
      await addDoc(collection(db, "activityLog"), {
        userId: user.uid,
        userEmail: user.email,
        action: action,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error logging activity: ", error);
    }
  };

  function adminLogin(id, password) {
    if (id === ADMIN_ID && password === ADMIN_PASS) {
      const adminUser = { uid: ADMIN_ID, email: 'admin@app.com' };
      setCurrentUser(adminUser);
      setRole('admin');
      logActivity('login', adminUser);
      return true;
    }
    return false;
  }
  
  function studentGuestLogin(registerNumber) {
    if (registerNumber) {
      const studentUser = { 
        uid: `student_${registerNumber}`, 
        email: `${registerNumber}@sist.com` 
      };
      setCurrentUser(studentUser);
      setRole('student');
      logActivity('login', studentUser);
      return true;
    }
    return false;
  }

  function logout() {
    if (currentUser) {
      logActivity('logout', currentUser);
    }
    setCurrentUser(null);
    setRole(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (role === 'admin' || (currentUser && currentUser.uid.startsWith('student_'))) {
        setLoading(false);
        return;
      }
      if (user) {
        logActivity('login', user);
      }
      setCurrentUser(user);
      setRole(user ? 'student' : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [role, currentUser]);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "notifications"),
        where("recipientId", "==", currentUser.uid),
        where("read", "==", false)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setNotificationCount(snapshot.size);
      });
      return () => unsubscribe();
    } else {
        setNotificationCount(0);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    role,
    notificationCount,
    toast,
    showToast,
    hideToast,
    adminLogin,
    studentGuestLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};