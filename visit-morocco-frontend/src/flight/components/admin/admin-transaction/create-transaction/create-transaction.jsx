import React, { useState, useEffect } from 'react';
import '../../styles/CreateCommonStyle.css';
import axiosApi from '../../../../api/axios';
import './create-transaction.css';

const CreateTransaction = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    flight_id: '',
    class_type: '',  
    total_amount: 0, 
    payment_method: 'credit_card',
    payment_details: {
      card_number: '4111111111111111',
      name_on_card: '',
      expiration_date: '',
      cvv: '123'
    },
    passengers: [
      {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        seat_id: ''
      }
    ]
  });
  
  // State management
  const [flights, setFlights] = useState([]);
  const [availableFlightClasses, setAvailableFlightClasses] = useState([]);
  const [allFlightClasses, setAllFlightClasses] = useState([]);
  const [airports, setAirports] = useState({});
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchFlights(),
          fetchFlightClassesapi()
        ]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Fetch flights from API
  const fetchFlights = async () => {
    try {
      const response = await axiosApi.get('/flights');
      // Direct access to response data without .data
      const flightsData = response || [];
      
      if (Array.isArray(flightsData)) {
        setFlights(flightsData);
        
        // Extract airport information from flight data
        const airportData = {};
        flightsData.forEach(flight => {
          if (flight.flight_segments) {
            flight.flight_segments.forEach(segment => {
              if (segment && segment.airport && segment.airport.id) {
                airportData[segment.airport.id] = segment.airport;
              }
            });
          }
        });
        setAirports(airportData);
        return flightsData;
      } else {
        throw new Error('Invalid flights data format received');
      }
    } catch (err) {
      console.error('Failed to fetch flights:', err);
      throw err;
    }
  };

  // Fetch flight classes from API
  const fetchFlightClassesapi = async () => {
    try {
      const response = await axiosApi.get('/flight-classes');
      // Direct access to response data without .data
      const classesData = response || [];
      
      if (Array.isArray(classesData)) {
        setAllFlightClasses(classesData);
        return classesData;
      } else {
        throw new Error('Invalid flight classes data format received');
      }
    } catch (err) {
      console.error('Failed to fetch flight classes:', err);
      throw err;
    }
  };

  // Fetch available seats for a flight and class
  const fetchAvailableSeats = async (flightId, classType) => {
    try {
      // Use flight-seats endpoint with correct parameters based on your backend
      const response = await axiosApi.get(`/flight-seats/flight/${flightId}`);
      // Direct access to response data without .data
      const allSeats = response || [];
      
      if (Array.isArray(allSeats)) {
        // Filter available seats by class type and availability
        // Need to handle case-sensitivity properly (server uses 'Economy', we might use 'economy')
        const seatsData = allSeats.filter(
          seat => seat.class_type.toLowerCase() === classType.toLowerCase() && seat.is_available
        );
        
        setAvailableSeats(seatsData);
        // Auto-select the first available seat if exists
        if (seatsData.length > 0) {
          const updatedPassengers = [...formData.passengers];
          updatedPassengers[0] = {
            ...updatedPassengers[0],
            seat_id: seatsData[0].id
          };
          setFormData({
            ...formData,
            passengers: updatedPassengers
          });
        }
        return seatsData;
      } else {
        throw new Error('Invalid seats data format received');
      }
    } catch (err) {
      console.error('Failed to fetch available seats:', err);
      setError(`Failed to load available seats: ${err.message}`);
      return [];
    }
  };

  // Get airport name helper function
  const getAirportName = (airportId) => {
    if (!airportId) return 'Unknown Airport';
    return airports[airportId]?.name || 'Unknown Airport';
  };

  // Fetch available flight classes for a specific flight
  const fetchFlightClasses = async (flightId) => {
    try {
      const response = await axiosApi.get(`/flights/${flightId}`);
      // Direct access to response data without .data
      const flightData = response || {};
      
      // Check if flight has classes property
      if (flightData && flightData.classes && Array.isArray(flightData.classes)) {
        setAvailableFlightClasses(flightData.classes);
        return flightData.classes;
      } else {
        // Fallback to filtering all classes that belong to this flight
        const flightSpecificClasses = allFlightClasses.filter(
          cls => cls.flight_id && cls.flight_id.toString() === flightId.toString()
        );
        setAvailableFlightClasses(flightSpecificClasses);
        return flightSpecificClasses;
      }
    } catch (err) {
      console.error('Failed to fetch flight-specific classes:', err);
      
      // Fallback to get class types from the backend model
      const defaultClasses = [
        { id: 1, class_type: "Economy", price: 0 },
        { id: 2, class_type: "Business", price: 0 },
        { id: 3, class_type: "First", price: 0 }
      ];
      
      setAvailableFlightClasses(defaultClasses);
      setError(`Using default flight classes. Error: ${err.message}`);
      return defaultClasses;
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('passenger.')) {
      // Handle passenger field updates
      const field = name.split('.')[1];
      const updatedPassengers = [...formData.passengers];
      updatedPassengers[0] = {
        ...updatedPassengers[0],
        [field]: value
      };
      
      // Update payment details name on card when passenger name changes
      if (field === 'first_name' || field === 'last_name') {
        const firstName = field === 'first_name' ? value : formData.passengers[0].first_name;
        const lastName = field === 'last_name' ? value : formData.passengers[0].last_name;
        
        if (firstName && lastName) {
          setFormData({
            ...formData,
            passengers: updatedPassengers,
            payment_details: {
              ...formData.payment_details,
              name_on_card: `${firstName} ${lastName}`
            }
          });
          return;
        }
      }
      
      setFormData({
        ...formData,
        passengers: updatedPassengers
      });
      return;
    }
    
    if (name.startsWith('payment.')) {
      // Handle payment details field updates
      const field = name.split('.')[1];
      
      setFormData({
        ...formData,
        payment_details: {
          ...formData.payment_details,
          [field]: value
        }
      });
      return;
    }
    
    let updatedFormData = {
      ...formData,
      [name]: value
    };

    if (name === 'flight_id') {
      setLoading(true);
      try {
        // Reset class_type when changing flights
        updatedFormData.class_type = '';
        
        // Fetch classes for this specific flight
        const flightClasses = await fetchFlightClasses(value);
        
        if (flightClasses.length > 0) {
          // Don't auto-select a class, let the user choose
          updatedFormData.total_amount = 0;
        } else {
          // If no classes available, try to get a default price from the flight
          const flightDetails = flights.find(f => f.id.toString() === value.toString());
          if (flightDetails && flightDetails.price) {
            updatedFormData.total_amount = flightDetails.price;
          }
        }
      } catch (err) {
        setError('Failed to fetch flight data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    } else if (name === 'class_type') {
      setLoading(true);
      try {
        // Find the selected class and update price if available
        const selectedClass = availableFlightClasses.find(c => c.class_type === value);
        if (selectedClass && selectedClass.price) {
          updatedFormData.total_amount = selectedClass.price;
        }
        
        // Fetch available seats for this flight and class
        if (formData.flight_id) {
          await fetchAvailableSeats(formData.flight_id, value);
        }
      } catch (err) {
        setError('Failed to fetch class data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    } else if (name === 'seat_id') {
      const updatedPassengers = [...formData.passengers];
      updatedPassengers[0] = {
        ...updatedPassengers[0],
        seat_id: value
      };
      
      updatedFormData = {
        ...updatedFormData,
        passengers: updatedPassengers
      };
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e, createAnother = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the final form data
      const dataToSubmit = {
        flight_id: formData.flight_id,
        class_type: formData.class_type,
        total_amount: formData.total_amount,
        payment_method: formData.payment_method,
        payment_details: formData.payment_details,
        passengers: formData.passengers,
      };
      
      const response = await axiosApi.post('/transactions', dataToSubmit);

      if (createAnother) {
        // Reset form for another entry but keep the flight and class selections
        const { flight_id, class_type, total_amount, payment_details } = formData;
        setFormData({
          flight_id,
          class_type,
          total_amount,
          payment_method: 'credit_card',
          payment_details,
          passengers: [
            {
              first_name: '',
              last_name: '',
              email: '',
              phone: '',
              date_of_birth: '',
              seat_id: availableSeats.length > 0 ? availableSeats[0].id : ''
            }
          ]
        });
      } else {
        onSuccess && onSuccess(response); // Pass whole response, not response.data
      }
    } catch (err) {
      console.error('Transaction creation error:', err);
      setError(err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  // Render flight route helper function
  const renderFlightRoute = (flight) => {
    const segments = flight.flight_segments || [];
    const firstSegment = segments.length > 0 ? segments[0] : null;
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
    
    // Alternative approach if flight_segments are not populated
    if (!firstSegment) {
      return `${flight.flight_number} - ${flight.origin || 'Unknown'} to ${flight.destination || 'Unknown'}`;
    }
    
    return `${flight.flight_number} - ${firstSegment && firstSegment.airport_id 
      ? getAirportName(firstSegment.airport_id) 
      : 'Unknown'} to ${lastSegment && lastSegment.airport_id 
      ? getAirportName(lastSegment.airport_id) 
      : 'Unknown'}`;
  };

  return (
    <div className="create-component-container">
      <div className="create-component-header">
        <h3>Create New Transaction</h3>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>
      
      <form onSubmit={(e) => handleSubmit(e, false)} className="create-component-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-section">
          <h4>Flight Information</h4>
          
          <div className="form-group">
            <label>Flight Route</label>
            <select
              name="flight_id"
              value={formData.flight_id}
              onChange={handleChange}
              required
              className="select-field"
              disabled={loading}
            >
              <option value="">Select Flight Route</option>
              {flights.map(flight => (  
                <option key={flight.id} value={flight.id.toString()}>
                  {renderFlightRoute(flight)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Flight Class</label>
            <select
              name="class_type"
              value={formData.class_type}
              onChange={handleChange}
              required
              disabled={!formData.flight_id || availableFlightClasses.length === 0 || loading}
              className="select-field"
            >
              <option value="">Select Flight Class</option>
              {availableFlightClasses.map((flightClass) => (
                <option key={flightClass.id || `class-${flightClass.class_type}`} value={flightClass.class_type}>
                  {flightClass.class_type} - ${flightClass.price?.toLocaleString() || 'N/A'}
                </option>
              ))}
            </select>
            
            {formData.flight_id && availableFlightClasses.length === 0 && (
              <div className="warning-message">No flight classes available for this flight.</div>
            )}
          </div>
          
          <div className="form-group">
            <label>Seat</label>
            <select
              name="seat_id"
              value={formData.passengers[0].seat_id}
              onChange={(e) => {
                const updatedPassengers = [...formData.passengers];
                updatedPassengers[0] = {
                  ...updatedPassengers[0],
                  seat_id: e.target.value
                };
                setFormData({
                  ...formData,
                  passengers: updatedPassengers
                });
              }}
              required
              disabled={!formData.class_type || availableSeats.length === 0 || loading}
              className="select-field"
            >
              <option value="">Select Seat</option>
              {availableSeats.map((seat) => (
                <option key={seat.id} value={seat.id}>
                  {seat.seat_number} - {seat.class_type}
                </option>
              ))}
            </select>
            
            {formData.class_type && availableSeats.length === 0 && (
              <div className="warning-message">No seats available for this class.</div>
            )}
          </div>
        </div>
        
        <div className="form-section">
          <h4>Passenger Information</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="passenger.first_name"
                value={formData.passengers[0].first_name}
                onChange={handleChange}
                placeholder="First name"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="passenger.last_name"
                value={formData.passengers[0].last_name}
                onChange={handleChange}
                placeholder="Last name"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="passenger.email"
                value={formData.passengers[0].email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="passenger.phone"
                value={formData.passengers[0].phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="passenger.date_of_birth"
              value={formData.passengers[0].date_of_birth}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h4>Payment Information</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Payment Method</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="select-field"
                disabled={loading}
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="payment.card_number"
                value={formData.payment_details.card_number}
                onChange={handleChange}
                placeholder="4111 1111 1111 1111"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Name on Card</label>
              <input
                type="text"
                name="payment.name_on_card"
                value={formData.payment_details.name_on_card}
                onChange={handleChange}
                placeholder="Same as passenger name"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Expiration Date</label>
              <input
                type="text"
                name="payment.expiration_date"
                value={formData.payment_details.expiration_date}
                onChange={handleChange}
                placeholder="MM/YY"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                name="payment.cvv"
                value={formData.payment_details.cvv}
                onChange={handleChange}
                placeholder="123"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Total Amount (USD $)</label>
              <div className="price-input">
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          
          {formData.total_amount > 0 && (
            <div className="price-summary">
              <div className="summary-row">
                <span>Flight:</span>
                <span>
                  {flights.find(f => f.id.toString() === formData.flight_id?.toString())?.flight_number || 'N/A'}
                </span>
              </div>
              <div className="summary-row">
                <span>Class:</span>
                <span>{formData.class_type || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span>Seat:</span>
                <span>
                  {availableSeats.find(s => s.id.toString() === formData.passengers[0].seat_id?.toString())?.seat_number || 'N/A'}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total amount:</span>
                <span>${formData.total_amount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button" disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="create-another-button"
          >
            {loading ? 'Creating...' : 'Create and Add Another'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Creating...' : 'Create Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTransaction;