import React, { useState, useEffect } from 'react';
import axiosApi from '../api/axios';
import BookingConfirmation from './BookingConfirmation';
import PaymentProcessor from './PaymentProcessor';
import '../styles/FlightDetails.css';
import { Plane } from 'lucide-react';

const FlightDetails = ({ flight, selectedClass, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState([
    { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' }
  ]);
  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosApi.get(`/flight-seats/flight/${flight.id}`);
        
        if (response?.status === 'success') {
          // Filter seats by selected class and sort them
          const filteredSeats = response.data
            .filter(seat => seat.class_type === selectedClass)
            .sort((a, b) => {
              const rowA = parseInt(a.row);
              const rowB = parseInt(b.row);
              if (rowA !== rowB) return rowA - rowB;
              return a.column.localeCompare(b.column);
            });
          
          setAvailableSeats(filteredSeats);
        } else {
          throw new Error('Failed to fetch seats');
        }
      } catch (err) {
        console.error('Error fetching seats:', err);
        setError('Failed to load seats. Please try again.');
        setAvailableSeats([]);
      } finally {
        setLoading(false);
      }
    };
  
    if (flight?.id) {
      fetchSeats();
    }
  }, [flight, selectedClass]);

  const handleSeatSelection = (seat) => {
    // Clear any existing errors
    setError(null);
    
    if (!seat.is_available) {
      return;
    }

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < passengerDetails.length) {
      setSelectedSeats([...selectedSeats, seat]);
    } else {
      setError(`You can only select ${passengerDetails.length} seat${passengerDetails.length > 1 ? 's' : ''}.`);
      // Error will disappear after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  // Validation functions
  const validateName = (name) => {
    const namePattern = /^[A-Za-z\s'-]+$/;
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!namePattern.test(name)) return "Name can only contain letters, spaces, hyphens, and apostrophes";
    return "";
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email.trim()) return "Email is required";
    if (!emailPattern.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone) => {
    const phonePattern = /^[\d\s()+.-]{7,20}$/;
    if (!phone.trim()) return "Phone number is required";
    if (!phonePattern.test(phone)) return "Please enter a valid phone number";
    return "";
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return "Date of birth is required";
    
    const dobDate = new Date(dob);
    const today = new Date();
    
    if (isNaN(dobDate.getTime())) return "Please enter a valid date";
    if (dobDate > today) return "Date of birth cannot be in the future";
    
    // Calculate age
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    
    if (age > 120) return "Please enter a valid date of birth";
    
    return "";
  };

  const handlePassengerDetailChange = (index, field, value) => {
    const newPassengerDetails = [...passengerDetails];
    newPassengerDetails[index][field] = value;
    setPassengerDetails(newPassengerDetails);
    
    // Clear field-specific validation error when field is changed
    const newValidationErrors = { ...validationErrors };
    delete newValidationErrors[`${index}-${field}`];
    setValidationErrors(newValidationErrors);
  };

  const validatePassengerField = (index, field, value) => {
    let errorMessage = "";
    
    switch (field) {
      case 'firstName':
      case 'lastName':
        errorMessage = validateName(value);
        break;
      case 'email':
        errorMessage = validateEmail(value);
        break;
      case 'phone':
        errorMessage = validatePhone(value);
        break;
      case 'dateOfBirth':
        errorMessage = validateDateOfBirth(value);
        break;
      default:
        break;
    }
    
    if (errorMessage) {
      setValidationErrors(prev => ({
        ...prev,
        [`${index}-${field}`]: errorMessage
      }));
      return false;
    }
    
    return true;
  };

  const handleFieldBlur = (index, field, value) => {
    validatePassengerField(index, field, value);
  };

  const handleAddPassenger = () => {
    // Clear any existing errors
    setError(null);
    
    if (passengerDetails.length < 6) {
      setPassengerDetails([
        ...passengerDetails, 
        { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' }
      ]);
    }
  };

  const handleRemovePassenger = () => {
    // Clear any existing errors
    setError(null);
    
    if (passengerDetails.length > 1) {
      const newPassengerDetails = passengerDetails.slice(0, -1);
      setPassengerDetails(newPassengerDetails);
      
      if (selectedSeats.length > newPassengerDetails.length) {
        setSelectedSeats(selectedSeats.slice(0, newPassengerDetails.length));
      }
      
      // Clean up validation errors for removed passenger
      const newValidationErrors = { ...validationErrors };
      Object.keys(newValidationErrors).forEach(key => {
        if (key.startsWith(`${passengerDetails.length - 1}-`)) {
          delete newValidationErrors[key];
        }
      });
      setValidationErrors(newValidationErrors);
    }
  };

  const validateAllPassengerDetails = () => {
    const newValidationErrors = {};
    let isValid = true;
    
    passengerDetails.forEach((passenger, index) => {
      const fields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
      
      fields.forEach(field => {
        const errorMessage = field === 'firstName' || field === 'lastName'
          ? validateName(passenger[field])
          : field === 'email'
            ? validateEmail(passenger[field])
            : field === 'phone'
              ? validatePhone(passenger[field])
              : validateDateOfBirth(passenger[field]);
        
        if (errorMessage) {
          newValidationErrors[`${index}-${field}`] = errorMessage;
          isValid = false;
        }
      });
    });
    
    setValidationErrors(newValidationErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any existing errors
    setError(null);

    // Validate seat selection first
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat to continue');
      return;
    }

    if (selectedSeats.length !== passengerDetails.length) {
      setError(`Please select ${passengerDetails.length} seat${passengerDetails.length > 1 ? 's' : ''} (one for each passenger)`);
      return;
    }

    // Validate all passenger details
    if (!validateAllPassengerDetails()) {
      setError('Please correct the highlighted errors before continuing');
      return;
    }

    try {
      const flightClass = flight.flight_classes.find(fc => fc.class_type === selectedClass);
      if (!flightClass) {
        throw new Error('Selected class not found');
      }

      // Set payment details and show payment processor
      setPaymentDetails({
        flight_id: flight.id,
        class_type: selectedClass,
        total_amount: selectedSeats.length * flightClass.price,
        passengers: passengerDetails.map((passenger, index) => ({
          first_name: passenger.firstName,
          last_name: passenger.lastName,
          email: passenger.email,
          phone: passenger.phone,
          date_of_birth: passenger.dateOfBirth,
          seat_id: selectedSeats[index].id
        }))
      });
      setShowPayment(true);

    } catch (err) {
      console.error('Validation failed:', err);
      setError('An error occurred while processing your booking. Please try again.');
    }
  };

  const handlePaymentComplete = async (paymentInfo) => {
    try {
      const bookingData = {
        ...paymentDetails,
        payment_method: paymentInfo.payment_method,
        payment_details: paymentInfo.payment_details
      };

      const response = await axiosApi.post('/transactions', bookingData);
      
      if (response?.status === 'success') {
        setBookingDetails({
          ...response.data,
          flight: {
            ...flight,
            flight_number: flight.flight_number
          },
          class_type: selectedClass
        });
        setShowConfirmation(true);
        setShowPayment(false);
      } else {
        throw new Error('Booking failed');
      }
    } catch (err) {
      console.error('Booking failed:', err);
      setError('Failed to complete booking. Please try again.');
    }
  };

  const renderSeatMap = () => {
    if (loading) return <div className="loading">Loading seats...</div>;
    if (error && !availableSeats.length) return <div className="error">No seats available for this class.</div>;
    if (!availableSeats || availableSeats.length === 0) {
      return <div className="error">No seats available for this class.</div>;
    }

    const rows = [...new Set(availableSeats.map(seat => seat.row))].sort((a, b) => a - b);
    
    // Define column layout based on class type
    let leftColumns = [];
    let rightColumns = [];
    
    if (selectedClass === 'Economy') {
      leftColumns = ['A', 'B', 'C'];
      rightColumns = ['D', 'E', 'F'];
    } else if (selectedClass === 'Business') {
      leftColumns = ['A', 'B'];
      rightColumns = ['C', 'D'];
    } else if (selectedClass === 'First') {
      leftColumns = ['A'];
      rightColumns = ['B'];
    }
    
    const allColumns = [...leftColumns, ...rightColumns];

    return (
      <div className="seat-map-container">
        <div className="seat-map-header">
          <div className="seat-map-title">
            <Plane className="airplane-icon" />
            <h4>Aircraft Seating - {selectedClass} Class</h4>
          </div>
          <div className="seat-class-badge">{selectedClass}</div>
        </div>
        
        <div className="seat-map-legend">
          <div className="legend-item">
            <div className="seat-demo available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat-demo selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="seat-demo unavailable"></div>
            <span>Unavailable</span>
          </div>
        </div>

        <div className="seat-map-columns">
          {leftColumns.map(col => (
            <div key={col} className="column-label">{col}</div>
          ))}
          <div className="column-label aisle"><span>Aisle</span></div>
          {rightColumns.map(col => (
            <div key={col} className="column-label">{col}</div>
          ))}
        </div>

        <div className="seat-map">
          {rows.map(row => (
            <div key={row} className="seat-row">
              <div className="row-number">{row}</div>
              <div className="row-seats">
                {/* Left side seats */}
                <div className="seat-group left">
                  {leftColumns.map(col => {
                    const seat = availableSeats.find(s => s.row === row && s.column === col);
                    if (!seat) return <div key={`${row}${col}`} className="seat-space"></div>;
                    
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    const seatName = `${row}${col}`;
                    
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatSelection(seat)}
                        disabled={!seat.is_available && !isSelected}
                        className={`seat ${
                          !seat.is_available && !isSelected
                            ? 'unavailable'
                            : isSelected
                              ? 'selected'
                              : 'available'
                        }`}
                        title={`Seat ${seatName}${!seat.is_available ? ' (Unavailable)' : ''}`}
                      >
                        {seatName}
                      </button>
                    );
                  })}
                </div>
                
                {/* Aisle */}
                <div className="aisle"></div>
                
                {/* Right side seats */}
                <div className="seat-group right">
                  {rightColumns.map(col => {
                    const seat = availableSeats.find(s => s.row === row && s.column === col);
                    if (!seat) return <div key={`${row}${col}`} className="seat-space"></div>;
                    
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    const seatName = `${row}${col}`;
                    
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatSelection(seat)}
                        disabled={!seat.is_available && !isSelected}
                        className={`seat ${
                          !seat.is_available && !isSelected
                            ? 'unavailable'
                            : isSelected
                              ? 'selected'
                              : 'available'
                        }`}
                        title={`Seat ${seatName}${!seat.is_available ? ' (Unavailable)' : ''}`}
                      >
                        {seatName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="seat-selection-status">
          <span className={selectedSeats.length === passengerDetails.length ? 'complete' : 'incomplete'}>
            {selectedSeats.length} of {passengerDetails.length} seats selected
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flight-details-overlay">
      {!showConfirmation && !showPayment &&  (
      <div className="flight-details-modal">
        <div className="modal-header">
          <h2>Select Seats and Enter Passenger Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="flight-details-content">
            {error && (
              <div className="error-banner">
                <div className="error-message">{error}</div>
                <button className="error-close" onClick={() => setError(null)}>×</button>
              </div>
            )}
          <div className="seat-grid">
            <h3>Seat Selection</h3>
            {renderSeatMap()}
          </div>

          <div className="passenger-forms">
            <h3>Passenger Information</h3>
            <form onSubmit={handleSubmit} className="passenger-form">
              {passengerDetails.map((passenger, index) => (
                <div key={index} className="passenger-form">
                  <h4>Passenger {index + 1}</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerDetailChange(index, 'firstName', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'firstName', e.target.value)}
                        className={validationErrors[`${index}-firstName`] ? 'input-error' : ''}
                        required
                      />
                      {validationErrors[`${index}-firstName`] && (
                        <div className="error-text">{validationErrors[`${index}-firstName`]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerDetailChange(index, 'lastName', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'lastName', e.target.value)}
                        className={validationErrors[`${index}-lastName`] ? 'input-error' : ''}
                        required
                      />
                      {validationErrors[`${index}-lastName`] && (
                        <div className="error-text">{validationErrors[`${index}-lastName`]}</div>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={passenger.email}
                        onChange={(e) => handlePassengerDetailChange(index, 'email', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'email', e.target.value)}
                        className={validationErrors[`${index}-email`] ? 'input-error' : ''}
                        required
                      />
                      {validationErrors[`${index}-email`] && (
                        <div className="error-text">{validationErrors[`${index}-email`]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={passenger.phone}
                        onChange={(e) => handlePassengerDetailChange(index, 'phone', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'phone', e.target.value)}
                        className={validationErrors[`${index}-phone`] ? 'input-error' : ''}
                        required
                        placeholder="e.g., +1 (555) 123-4567"
                      />
                      {validationErrors[`${index}-phone`] && (
                        <div className="error-text">{validationErrors[`${index}-phone`]}</div>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) => handlePassengerDetailChange(index, 'dateOfBirth', e.target.value)}
                        onBlur={(e) => handleFieldBlur(index, 'dateOfBirth', e.target.value)}
                        className={validationErrors[`${index}-dateOfBirth`] ? 'input-error' : ''}
                        required
                      />
                      {validationErrors[`${index}-dateOfBirth`] && (
                        <div className="error-text">{validationErrors[`${index}-dateOfBirth`]}</div>
                      )}
                    </div>
                  </div>
                  {selectedSeats[index] && (
                    <div className="assigned-seat">
                      Selected Seat: <span className="seat-tag"><span className="seat-name">{selectedSeats[index].row}{selectedSeats[index].column}</span></span>
                    </div>
                  )}
                </div>
              ))}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleAddPassenger}
                  disabled={passengerDetails.length >= 6}
                  className="button button-secondary"
                >
                  Add Passenger
                </button>
                {passengerDetails.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRemovePassenger}
                    className="button button-secondary"
                  >
                    Remove Last Passenger
                  </button>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="button button-primary">
                  Complete Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}
      
      {showPayment && (
        <PaymentProcessor
          amount={paymentDetails.total_amount}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
      
      {showConfirmation && bookingDetails && (
        <BookingConfirmation
          booking={bookingDetails}
          onClose={() => {
            setShowConfirmation(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default FlightDetails;