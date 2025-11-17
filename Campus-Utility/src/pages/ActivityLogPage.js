import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs, query, where, orderBy, writeBatch, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal.js';
import './ActivityLogPage.css';

function ActivityLogPage() {
  const [allLogs, setAllLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role, showToast } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteRange, setDeleteRange] = useState({ start: '', end: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const LOGS_PER_PAGE = 15;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "activityLog"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const logsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllLogs(logsList);
    } catch (error) {
      console.error("Error fetching activity logs: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role && role !== 'admin') {
      navigate('/');
    } else if (role) {
      fetchLogs();
    }
  }, [role, navigate]);
  
  useEffect(() => {
    let logs = [...allLogs];

    if (searchTerm) {
        logs = logs.filter(log =>
            log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    if (startDate) {
      const start = new Date(startDate);
      logs = logs.filter(log => log.timestamp && log.timestamp.toDate() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      logs = logs.filter(log => log.timestamp && log.timestamp.toDate() <= end);
    }
    setFilteredLogs(logs);
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, allLogs]);

  const handleDeleteClick = () => {
    if (!startDate || !endDate) {
        showToast("Please select both a 'From' and 'To' date and time to define a range.", "error");
        return;
    }
    setDeleteRange({ start: startDate, end: endDate });
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    setShowConfirmModal(false);
    const start = Timestamp.fromDate(new Date(deleteRange.start));
    const end = Timestamp.fromDate(new Date(deleteRange.end));
    
    const q = query(collection(db, "activityLog"), where("timestamp", ">=", start), where("timestamp", "<=", end));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        showToast("No logs found in the selected date range.", "error");
        return;
    }

    const batch = writeBatch(db);
    snapshot.forEach(doc => { batch.delete(doc.ref); });

    await batch.commit();
    showToast(`Successfully deleted ${snapshot.size} logs.`);
    fetchLogs();
  };
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const indexOfLastLog = currentPage * LOGS_PER_PAGE;
  const indexOfFirstLog = indexOfLastLog - LOGS_PER_PAGE;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);

  if (loading) return <div className="loading-container">Loading Activity Log...</div>;

  return (
    <div className="activity-log-container">
      {showConfirmModal && (
        <ConfirmModal
          title="Delete Logs"
          message={`Are you sure you want to delete all logs in this range? This cannot be undone.`}
          onConfirm={executeDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      <div className="log-header">
        <h1>User Activity Log</h1>
      </div>
      
      <div className="filter-controls">
        <input 
            type="text" 
            className="log-search-bar" 
            placeholder="Search by user email or action..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="date-picker-group">
            <div className="date-picker">
                <label htmlFor="startDate">From:</label>
                <input type="datetime-local" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="date-picker">
                <label htmlFor="endDate">To:</label>
                <input type="datetime-local" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button onClick={handleDeleteClick} className="delete-range-btn">Delete by Range</button>
        </div>
      </div>

      <table className="activity-log-table">
        <thead>
          <tr>
            <th>User Email</th>
            <th>Action</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.map(log => (
            <tr key={log.id} className={`log-action-${log.action}`}>
              <td>{log.userEmail}</td>
              <td>{log.action}</td>
              <td>{log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : 'No timestamp'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityLogPage;
