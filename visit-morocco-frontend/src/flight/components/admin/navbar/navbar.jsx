import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { Sun, Moon, LogOut, UserCircle } from 'lucide-react';
import logo from '../../../assets/logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './navbar.css';

const Navbar = ({ onLogout }) => {
  const { darkMode, toggleTheme } = useTheme();

  const handleLogoutClick = () => {
    console.log('Logout clicked');
    if (onLogout) {
      onLogout();
    } else {
      console.error('onLogout prop is not defined');
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark' : 'navbar-light'} bg-${darkMode ? 'dark' : 'light'}`}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/admin/dashboard"><img src={logo} alt="Logo" height="50" className="d-inline-block align-text-top" />Cloud Tickets</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <button onClick={toggleTheme} className="theme-toggle nav-link">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/profile">
                <UserCircle size={20} className="me-2" />
                Edit Profile
              </Link>
            </li>
            <li className="nav-item">
              <button 
                className="nav-link btn btn-link" 
                onClick={handleLogoutClick}
                style={{ cursor: 'pointer', border: 'none', background: 'none' }}
              >
                <LogOut size={20} className="me-2" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;