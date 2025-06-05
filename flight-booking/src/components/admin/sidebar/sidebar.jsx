import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import Dashboard from '../../../assets/dashboard.png';
import Airlines from '../../../assets/airline.png';
import Airports from '../../../assets/airport.png';
import Facilities from '../../../assets/Facilities.png';
import Flights from '../../../assets/flight.png';
import PromoCodes from '../../../assets/Promo-codes.png';
import Transactions from '../../../assets/Transactions.png';
import './sidebar.css';

const Sidebar = () => {
  const { darkMode } = useTheme();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className={`sidebar ${darkMode ? 'dark' : 'light'}`}>
      <ul className="nav flex-column p-3">
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/admin/dashboard')}`} to="/admin/dashboard"><img src={Dashboard} width={24} height={24} alt="Dashboard" /> Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/admin/airlines')}`} to="/admin/airlines"><img src={Airlines} width={24} height={24} alt="Airlines" /> Airlines</Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/admin/airports')}`} to="/admin/airports"><img src={Airports} width={24} height={24} alt="Airports" /> Airports</Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/admin/facilities')}`} to="/admin/facilities"><img src={Facilities} width={24} height={24} alt="Facilities" /> Facilities</Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/admin/flights')}`} to="/admin/flights"><img src={Flights} width={24} height={24} alt="Flights" /> Flights</Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/admin/promo-codes')}`} to="/admin/promo-codes"><img src={PromoCodes} width={24} height={24} alt="Promo Codes" /> Promo Codes</Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/admin/transactions')}`} to="/admin/transactions"><img src={Transactions} width={24} height={24} alt="Transactions" /> Transactions</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
