import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Navbar from '../admin/navbar/navbar.jsx';
import Sidebar from '../admin/sidebar/sidebar.jsx';
import './AdminLayout.css';

const AdminLayout = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleLogout = () => {
    onLogout();
    setTimeout(() => {
      navigate('/admin');
    }, 0);
  };

  return (
    <div className={`admin-container ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar onLogout={handleLogout} />
      <div className="admin-content-wrapper">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;