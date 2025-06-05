import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosApi from '../../../api/axios';
import { Briefcase, MapPin, Plane, Tag, CreditCard, Package } from 'lucide-react';
import Loading from '../loading/Loading';
import './dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFlights: 0,
    totalAirports: 0,
    totalAirlines: 0,
    totalFacilities: 0,
    totalPromoCodes: 0,
    totalTransactions: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Based on the console logs we can see flights is showing as an object that is also an array
        // This suggests we're getting the direct array data instead of the typical axios response object
        
        // Fetch all data with individual API calls to debug the exact response structure
        const flightsResponse = await axiosApi.get('/flights');
        const airportsResponse = await axiosApi.get('/airports');
        const airlinesResponse = await axiosApi.get('/airlines');
        const facilitiesResponse = await axiosApi.get('/facilities');
        const promoCodesResponse = await axiosApi.get('/promo-codes');
        const transactionsResponse = await axiosApi.get('/transactions');
        
        // Log details about the flights response to understand its structure
        console.log('Flights full response:', flightsResponse);
        
        // Extract the data properly - check if flightsResponse.data exists
        const flights = flightsResponse.data || flightsResponse;
        const airports = airportsResponse.data || airportsResponse;
        const airlines = airlinesResponse.data || airlinesResponse;
        const facilities = facilitiesResponse.data || facilitiesResponse;
        const promoCodes = promoCodesResponse.data || promoCodesResponse;
        const transactions = transactionsResponse.data || transactionsResponse;
        
        // Calculate statistics based on the extracted data
        const stats = {
          totalFlights: Array.isArray(flights) ? flights.length : 0,
          totalAirports: Array.isArray(airports) ? airports.length : 0,
          totalAirlines: Array.isArray(airlines) ? airlines.length : 0,
          totalFacilities: Array.isArray(facilities) ? facilities.length : 0,
          totalPromoCodes: Array.isArray(promoCodes) ? promoCodes.length : 
                         (typeof promoCodes === 'object' && promoCodes !== null) ? 
                         (promoCodes.promocodes?.length || promoCodes.data?.length || 0) : 0,
          totalTransactions: Array.isArray(transactions) ? transactions.length : 0
        };
        
        console.log('Extracted data:', { 
          flights, 
          airports, 
          airlines, 
          facilities, 
          promoCodes, 
          transactions 
        });
        console.log('Final calculated stats:', stats);
        
        console.log('Final calculated stats:', stats);
        setStats(stats);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Flight Administration Dashboard</h1>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon airlines">
            <Briefcase size={24} />
          </div>
          <div className="stat-details">
            <h3>Airlines</h3>
            <p className="stat-value">{stats.totalAirlines}</p>
            <Link to="/admin/airlines" className="stat-link">Manage airlines</Link>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon airports">
            <MapPin size={24} />
          </div>
          <div className="stat-details">
            <h3>Airports</h3>
            <p className="stat-value">{stats.totalAirports}</p>
            <Link to="/admin/airports" className="stat-link">Manage airports</Link>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon facilities">
            <Package size={24} />
          </div>
          <div className="stat-details">
            <h3>Facilities</h3>
            <p className="stat-value">{stats.totalFacilities}</p>
            <Link to="/admin/facilities" className="stat-link">Manage facilities</Link>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon flights">
            <Plane size={24} />
          </div>
          <div className="stat-details">
            <h3>Flights</h3>
            <p className="stat-value">{stats.totalFlights}</p>
            <Link to="/admin/flights" className="stat-link">Manage flights</Link>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon promo-codes">
            <Tag size={24} />
          </div>
          <div className="stat-details">
            <h3>Promo Codes</h3>
            <p className="stat-value">{stats.totalPromoCodes}</p>
            <Link to="/admin/promo-codes" className="stat-link">Manage promo codes</Link>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon transactions">
            <CreditCard size={24} />
          </div>
          <div className="stat-details">
            <h3>Transactions</h3>
            <p className="stat-value">{stats.totalTransactions}</p>
            <Link to="/admin/transactions" className="stat-link">Manage transactions</Link>
          </div>
        </div>
      </div>
      
      <div className="admin-welcome">
        <h2>Welcome to the Flight Administration System</h2>
        <p>Use the sidebar menu to navigate between different sections of the admin panel.</p>
        <div className="quick-links">
          <Link to="/admin/flights" className="quick-link">Add New Flight</Link>
          <Link to="/admin/transactions" className="quick-link">View Transactions</Link>
          <Link to="/admin/profile" className="quick-link">Manage Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;