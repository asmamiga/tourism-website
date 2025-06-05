import React, { useState, useEffect } from 'react';
import axiosApi from '../api/axios';
import SearchFlights from './SearchFlights';
import '../styles/BookingHeader.css';
import logo from '../assets/logo.png';

const BookingHeader = () => {
  const [bookingData, setBookingData] = useState({
    departure: '',
    arrival: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 1
  });

  const [bookingInfo, setBookingInfo] = useState({
    airports: [],
    flights: [],
    loading: true,
    error: null
  });

  const [showSearch, setShowSearch] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  useEffect(() => {
    fetchBookingInfo();
  }, []);

  const fetchBookingInfo = async () => {
    try {
      const airportsResponse = await axiosApi.get('/airports');
      const flightsResponse = await axiosApi.get('/flights');
  
      setBookingInfo({
        airports: Array.isArray(airportsResponse) ? airportsResponse : [],
        flights: Array.isArray(flightsResponse) ? flightsResponse : [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error details:', error);
      setBookingInfo(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load booking information'
      }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    try {
      const params = {
        departure_airport_id: bookingData.departure,
        arrival_airport_id: bookingData.arrival,
        departure_date: bookingData.date
      };
      
      const response = await axiosApi.post('/flights/search', params);
      
      setBookingInfo((prev) => ({
        ...prev,
        flights: response.flights || [],
        loading: false,
        error: null,
      }));
  
      setSearchParams({
        departureAirport: bookingData.departure,
        arrivalAirport: bookingData.arrival,
        departureDate: bookingData.date,
        passengers: bookingData.quantity
      });
      
      setShowSearch(true);
    } catch (error) {
      console.error('Search error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setBookingInfo((prev) => ({
        ...prev,
        error: 'Failed to search flights. Please try again.',
        loading: false
      }));
    }
  };

  return (
    <div className="booking-header">
      <div className="container">
        {/* Navigation */}
        <div className="nav-container">
          <div className="nav-logo">
            <img src={logo} alt="Cloud Tickets Logo"  height="32" />
            Cloud Tickets
          </div>
          <div className="header-buttons">
            <button className="call-button">Call Us</button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="hero-section">
          {bookingInfo.loading ? (
            <div className="loading">Loading booking information...</div>
          ) : bookingInfo.error ? (
            <div className="error">{bookingInfo.error}</div>
          ) : (
            <>
              <div className="award-badge">
                Find Your Perfect Flight
              </div>
              <h1 className="hero-title">
                Explore Amazing<br />Destinations
              </h1>
              <p className="hero-subtitle">
                Find the best deals on flights<br />
                Book your journey today
              </p>
            </>
          )}
        </div>

        {/* Search Form */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-form-inner">
              <div className="form-group">
                <label className="form-label">From</label>
                <select
                  className="form-select"
                  value={bookingData.departure}
                  onChange={(e) => setBookingData({...bookingData, departure: e.target.value})}
                  required
                >
                  <option value="">Select Departure</option>
                  {Array.isArray(bookingInfo.airports) && bookingInfo.airports.map((airport) => (
                    <option key={airport.id} value={airport.id}>
                      {airport.city}, {airport.country}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-divider"></div>
              
              <div className="form-group">
                <label className="form-label">To</label>
                <select
                  className="form-select"
                  value={bookingData.arrival}
                  onChange={(e) => setBookingData({...bookingData, arrival: e.target.value})}
                  required
                >
                  <option value="">Select Arrival</option>
                  {Array.isArray(bookingInfo.airports) && bookingInfo.airports.map((airport) => (
                    <option key={airport.id} value={airport.id}>
                      {airport.city}, {airport.country}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-divider"></div>
              
              <div className="form-group">
                <label className="form-label">Departure Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-divider"></div>
              
              <div className="form-group">
                <label className="form-label">Passengers</label>
                <select 
                  className="form-select"
                  value={bookingData.quantity}
                  onChange={(e) => setBookingData({...bookingData, quantity: parseInt(e.target.value)})}
                >
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              type="submit"
              className="explore-button"
            >
              Find Flights
            </button>
          </form>
        </div>
        {/* Popular Destinations */}
        {!bookingInfo.loading && !bookingInfo.error && (
          <div className="popular-destinations">
            <h2 className="destinations-title">Popular Destinations</h2>
            <div className="destinations-carousel">
              {/* Original set of cards */}
              {Array.isArray(bookingInfo.airports) && bookingInfo.airports.slice(0, 8).map((airport) => (
                <div key={airport.id} className="destination-card">
                  <div 
                    className="destination-image" 
                    style={{ backgroundImage: `url(${airport.image || '/api/placeholder/400/320'})` }}
                  ></div>
                  <div className="destination-info">
                    <h3 className="destination-name">{airport.city}</h3>
                    <p className="destination-country">{airport.country}</p>
                  </div>
                </div>
              ))}
              
              {/* Exact duplicate of the first set */}
              {Array.isArray(bookingInfo.airports) && bookingInfo.airports.slice(0, 8).map((airport) => (
                <div key={`dup-${airport.id}`} className="destination-card">
                  <div 
                    className="destination-image" 
                    style={{ backgroundImage: `url(${airport.image || '/api/placeholder/400/320'})` }}
                  ></div>
                  <div className="destination-info">
                    <h3 className="destination-name">{airport.city}</h3>
                    <p className="destination-country">{airport.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flight Search Results */}
        {showSearch && searchParams && (
          <SearchFlights 
            searchParams={searchParams}
            onClose={() => setShowSearch(false)}
            airports={bookingInfo.airports}
            allFlights={bookingInfo.flights}
          />
        )}
      </div>
    </div>
  );
};

export default BookingHeader;