import React, { useState, useEffect } from 'react';
import axiosApi from '../api/axios';
import FlightDetails from './FlightDetails';
import '../styles/SearchFlights.css';

const SearchFlights = ({ searchParams, onClose, airports }) => {
    const [allFlights, setAllFlights] = useState([]); // Store all flights
    const [filteredFlights, setFilteredFlights] = useState([]); // Store filtered flights
    const [totalFlights, setTotalFlights] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClass, setSelectedClass] = useState('Economy');
    const [availableClasses, setAvailableClasses] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [showFlightDetails, setShowFlightDetails] = useState(false);

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axiosApi.post('/flights/search', {
                    departure_airport_id: searchParams.departureAirport,
                    arrival_airport_id: searchParams.arrivalAirport,
                    departure_date: searchParams.departureDate
                });
                
                let flightData = [];
                
                // Check if response is directly the data (some axios instances are configured this way)
                if (Array.isArray(response)) {
                    flightData = response;
                } else if (response.flights) {
                    flightData = response.flights;
                } else if (response.data && response.data.flights) {
                    flightData = response.data.flights;
                } else {
                    throw new Error('Unexpected API response format: ' + JSON.stringify(response));
                }
                
                setAllFlights(flightData);
                
                // Extract all available class types from all flights
                const classTypes = new Set();
                flightData.forEach(flight => {
                    flight.flight_classes.forEach(flightClass => {
                        classTypes.add(flightClass.class_type);
                    });
                });
                
                setAvailableClasses(Array.from(classTypes));
                
                // Filter and process flights by selected class
                filterFlightsByClass(flightData, selectedClass);
        
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
                setError(`Flight search failed: ${errorMessage}`);
                setAllFlights([]);
                setFilteredFlights([]);
                setTotalFlights(0);
                console.error('API Error:', err);
                console.error('Error response:', err.response);
            } finally {
                setLoading(false);
            }
        };
    
        if (searchParams) {
            fetchFlights();
        }
    }, [searchParams]);

    // Update flights whenever selected class changes
    useEffect(() => {
        filterFlightsByClass(allFlights, selectedClass);
    }, [selectedClass, allFlights]);

    
    const filterFlightsByClass = (flights, classType) => {
        if (!flights || flights.length === 0) {
            setFilteredFlights([]);
            setTotalFlights(0);
            return;
        }
        
        // Filter out flights that don't offer the selected class
        const filtered = flights.filter(flight => {
            return flight.flight_classes.some(fc => fc.class_type === classType);
        });
        
        // Process remaining flights with booking status
        const processed = filtered.map(flight => {
            const flightClass = flight.flight_classes.find(fc => fc.class_type === classType);
            
            // Check if class has a valid price
            const isAvailable = flightClass && flightClass.price !== null;
            
            // Check if this is explicitly a fully booked flight
            // Use special flight name detection OR check for available_seats being 0
            const isExplicitlyFullyBooked = 
                flight.flight_number === "FULLY BOOKED" || 
                (typeof flightClass?.available_seats === 'number' && flightClass.available_seats <= 0);
            
            // A flight is fully booked if it's explicitly marked as such
            const isFullyBooked = isAvailable && isExplicitlyFullyBooked;
            
            return {
                ...flight,
                isFullyBooked: isFullyBooked,
                availableSeats: (isAvailable && typeof flightClass?.available_seats === 'number') ? 
                    flightClass.available_seats : 
                    (isAvailable ? 'Available' : 0)
            };
        });
        
        setFilteredFlights(processed);
        setTotalFlights(processed.length);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    const formatImageUrl = (url) => {
        if (!url) return null;
        
        // Check if the URL is already absolute
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // Handle storage links properly
        // Make sure we don't have double slashes
        const baseUrl = 'http://127.0.0.1:8000';
        
        // Ensure the URL has the correct storage prefix
        if (!url.startsWith('storage/') && !url.startsWith('/storage/')) {
            // Add storage/ prefix if missing
            url = 'storage/' + url;
        }
        
        // Normalize the URL to avoid any issues with double slashes
        url = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
        return url;
    };

    const calculateDuration = (departure, arrival) => {
        const start = new Date(departure);
        const end = new Date(arrival);
        const diff = end - start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const getFlightPrice = (flight) => {
        try {
            const flightClass = flight.flight_classes.find(fc => fc.class_type === selectedClass);
            return flightClass?.price || 'N/A';
        } catch (err) {
            return 'N/A';
        }
    };

    const getAirportName = (airportId) => {
        try {
            const airport = airports.find(a => a.id === airportId);
            return airport?.name || 'Unknown Airport';
        } catch (err) {
            return 'Unknown Airport';
        }
    };

    const handleSelectFlight = (flight) => {
        if (flight.isFullyBooked) {
            // Don't allow selecting fully booked flights
            return;
        }
        setSelectedFlight(flight);
        setShowFlightDetails(true);
    };

    const handleBookingConfirm = async (bookingData) => {
        try {
            setLoading(true);
            const response = await axiosApi.post('/transactions', bookingData);
            alert('Booking successful! Confirmation number: ' + response.confirmation_number);
            onClose();
        } catch (err) {
            alert('Failed to complete booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="search-flights-overlay">
                <div className="search-flights-modal">
                    <div className="loading-spinner">Searching for flights...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="search-flights-overlay">
            <div className="search-flights-modal">
                <div className="search-flights-header">
                    <h2>Available Flights ({totalFlights})</h2>
                    <div className="class-selector">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            {availableClasses.map(classType => (
                                <option key={classType} value={classType}>{classType}</option>
                            ))}
                        </select>
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="flights-list">
                        {filteredFlights.length === 0 ? (
                            <div className="no-flights-message">
                                No flights available for this route with {selectedClass} class. Please try a different class.
                            </div>
                        ) : (
                            filteredFlights.map((flight) => (
                                <div key={flight.id} className={`flight-card ${flight.isFullyBooked ? 'fully-booked' : ''}`}>
                                    {flight.isFullyBooked && (
                                        <div className="fully-booked-banner">
                                            Fully Booked
                                        </div>
                                    )}
                                    <div className="flight-header">
                                        <div className="airline-info">
                                            <div className="airline-logo-container">
                                                {flight.airline && flight.airline.logo && (
                                                    <img
                                                        src={formatImageUrl(flight.airline?.logo)}
                                                        alt={flight.airline?.name}
                                                        className="airline-logo"
                                                        width="40"
                                                        height="40"
                                                        style={{ objectFit: 'contain' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='8' text-anchor='middle' dominant-baseline='middle' fill='%23aaa'%3ELogo%3C/text%3E%3C/svg%3E";
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="airline-details">
                                                <span className="airline-name">{flight.airline?.name || 'Unknown Airline'}</span>
                                                <span className="flight-number">{flight.flight_number}</span>
                                            </div>
                                        </div>
                                        <div className="price-container">
                                            {flight.isFullyBooked ? (
                                                <div className="no-seats-indicator">No seats available</div>
                                            ) : (
                                                <div className="price">
                                                    ${getFlightPrice(flight)}
                                                    <div className="seats-remaining">
                                                        {typeof flight.availableSeats === 'number' 
                                                            ? `${flight.availableSeats} seats left` 
                                                            : ''}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flight-details">
                                        {flight.flight_segments && flight.flight_segments.length > 0 ? (
                                            <div className="flight-segments">
                                                {/* First segment */}
                                                <div className="flight-route">
                                                    <div className="departure">
                                                        <div className="time">
                                                            {formatTime(flight.flight_segments[0].time)}
                                                        </div>
                                                        <div className="airport">
                                                            {getAirportName(flight.flight_segments[0].airport_id)}
                                                        </div>
                                                        <div className="date">
                                                            {formatDate(flight.flight_segments[0].time)}
                                                        </div>
                                                    </div>
                                                    <div className="flight-duration">
                                                        <div className="duration-line"></div>
                                                        <span>
                                                            {calculateDuration(
                                                                flight.flight_segments[0].time,
                                                                flight.flight_segments[flight.flight_segments.length - 1].time
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="arrival">
                                                        <div className="time">
                                                            {formatTime(flight.flight_segments[flight.flight_segments.length - 1].time)}
                                                        </div>
                                                        <div className="airport">
                                                            {getAirportName(flight.flight_segments[flight.flight_segments.length - 1].airport_id)}
                                                        </div>
                                                        <div className="date">
                                                            {formatDate(flight.flight_segments[flight.flight_segments.length - 1].time)}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Show stops if there are more than 2 segments */}
                                                {flight.flight_segments.length > 2 && (
                                                    <div className="stops-container">
                                                        <div className="stops-label">
                                                            {flight.flight_segments.length - 2} {flight.flight_segments.length - 2 === 1 ? 'stop' : 'stops'}:
                                                        </div>
                                                        <div className="stops-details">
                                                            {flight.flight_segments.slice(1, -1).map((segment, index) => (
                                                                <div key={index} className="stop-item">
                                                                    <div className="stop-airport">{getAirportName(segment.airport_id)}</div>
                                                                    <div className="stop-time">
                                                                        <span className="stop-arrival">{formatTime(segment.time)}</span>
                                                                        {index < flight.flight_segments.length - 3 && (
                                                                            <>
                                                                                <span className="stop-separator">•</span>
                                                                                <span className="stop-layover">
                                                                                    {calculateDuration(
                                                                                        segment.time,
                                                                                        flight.flight_segments[index + 2].time
                                                                                    )} layover
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="error-message">No flight segments available</div>
                                        )}

                                        <div className="flight-facilities">
                                            {flight.flight_classes &&
                                                flight.flight_classes.find(fc => fc.class_type === selectedClass)?.facilities?.map(facility => (
                                                    <div key={facility.id} className="facility">
                                                        {facility.image && (
                                                            <img
                                                                src={formatImageUrl(facility.image)}
                                                                alt={facility.name}
                                                                className="facility-icon"
                                                                width="24"
                                                                height="24"
                                                                style={{ objectFit: 'contain' }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-size='6' text-anchor='middle' dominant-baseline='middle' fill='%23aaa'%3E" + facility.name.charAt(0) + "%3C/text%3E%3C/svg%3E";
                                                                }}
                                                            />
                                                        )}
                                                        <span className="facility-name">{facility.name}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <button
                                        className={`select-flight-button ${flight.isFullyBooked ? 'disabled' : ''}`}
                                        onClick={() => handleSelectFlight(flight)}
                                        disabled={flight.isFullyBooked}
                                    >
                                        {flight.isFullyBooked ? 'Fully Booked' : 'Select Flight'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {showFlightDetails && selectedFlight && (
                <FlightDetails
                    flight={selectedFlight}
                    selectedClass={selectedClass}
                    onClose={() => setShowFlightDetails(false)}
                    onConfirm={handleBookingConfirm}
                />
            )}
        </div>
    );
};

export default SearchFlights;