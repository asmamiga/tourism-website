import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axiosApi from '../../../../api/axios';
import '../../styles/EditCommonStyle.css';
import './edit-flight.css';
import Loading from '../../loading/Loading';

const EditFlight = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
    
    // Reference Data
    const [airports, setAirports] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [existingFlightNumbers, setExistingFlightNumbers] = useState([]); // Track existing flight numbers
    const [originalFlightNumber, setOriginalFlightNumber] = useState(''); // Store the original flight number

    const [deletedSegments, setDeletedSegments] = useState([]);
    const [deletedClasses, setDeletedClasses] = useState([]);
    
    const CLASS_TYPES = ['Economy', 'Business', 'First'];
    const MAX_SEGMENTS = 6; // Maximum number of segments allowed
    
    // Form Data
    const [flightData, setFlightData] = useState({
        flight_number: '',
        airline_id: '',
        segments: [
            { sequence: 1, airport_id: '', time: '' },
            { sequence: 2, airport_id: '', time: '' }
        ],
        classes: [{
            class_type: 'Economy',
            price: '',
            total_seats: '',
            facilities: []
        }]
    });

    // Helper function to get available class types
    const getAvailableClassTypes = (currentIndex) => {
        const existingTypes = flightData.classes
            .filter((_, index) => index !== currentIndex)
            .map(c => c.class_type);
        return CLASS_TYPES.filter(type => !existingTypes.includes(type));
    };

    // Format date for backend
    const formatDateForBackend = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Format date for input
    const formatDateForInput = (dateTimeString) => {
        if (!dateTimeString) return '';
        return dateTimeString.replace(' ', 'T').slice(0, 16);
    };

    // Fetch data on component mount
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [flightResponse, airportsResponse, airlinesResponse, facilitiesResponse, flightsResponse] = await Promise.all([
                axiosApi.get(`/flights/${id}`),
                axiosApi.get('/airports'),
                axiosApi.get('/airlines'),
                axiosApi.get('/facilities'),
                axiosApi.get('/flights') // Fetch existing flights for flight number validation
            ]);

            const flight = flightResponse;
            const airports = airportsResponse;
            const airlines = airlinesResponse;
            const facilities = facilitiesResponse;
            
            // Store original flight number
            setOriginalFlightNumber(flight.flight_number);
            
            // Filter out the current flight number from existing flight numbers
            const flightNumbers = flightsResponse
                .filter(f => f.id !== parseInt(id)) // Make sure to compare same types
                .map(f => f.flight_number);

            setExistingFlightNumbers(flightNumbers);

            // Ensure at least 2 segments
            let initialSegments = flight.flight_segments ? flight.flight_segments.map(segment => ({
                id: segment.id,
                sequence: segment.sequence,
                airport_id: segment.airport_id,
                time: formatDateForInput(segment.time)
            })) : [];
            
            if (initialSegments.length < 2) {
                const additionalSegments = Array(2 - initialSegments.length).fill().map((_, i) => ({
                    sequence: initialSegments.length + i + 1,
                    airport_id: '',
                    time: ''
                }));
                initialSegments = [...initialSegments, ...additionalSegments];
            }
    
            setFlightData({
                flight_number: flight.flight_number,
                airline_id: flight.airline_id,
                segments: initialSegments,
                classes: flight.flight_classes ? flight.flight_classes.map(cls => ({
                    id: cls.id,
                    class_type: cls.class_type,
                    price: cls.price,
                    total_seats: cls.total_seats,
                    facilities: cls.facilities ? cls.facilities.map(f => f.id) : []
                })) : []
            });
    
            setAirports(airports);
            setAirlines(airlines);
            setFacilities(facilities);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(`Failed to fetch data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle input changes
    const handleChange = (e, index = null, type = null) => {
        const { name, value } = e.target;
        
        // Clear field-specific errors when user makes changes
        setFieldErrors(prev => ({
            ...prev,
            [name]: null
        }));
        
        if (type === "segment") {
            const updatedSegments = [...flightData.segments];
            updatedSegments[index][name] = value;
            setFlightData({ ...flightData, segments: updatedSegments });
            
            // Clear segment-specific error
            setFieldErrors(prev => ({
                ...prev,
                [`segment_${index}_${name}`]: null
            }));
        } else if (type === "class") {
            const updatedClasses = [...flightData.classes];
            if (name === 'class_type') {
                const classTypeUsed = flightData.classes.some(
                    (cls, i) => i !== index && cls.class_type === value
                );
                if (classTypeUsed) {
                    setFieldErrors(prev => ({
                        ...prev,
                        [`class_${index}_class_type`]: 'This class type already exists'
                    }));
                    return;
                }
            }
            updatedClasses[index][name] = value;
            setFlightData({ ...flightData, classes: updatedClasses });
            
            // Clear class-specific error
            setFieldErrors(prev => ({
                ...prev,
                [`class_${index}_${name}`]: null
            }));
        } else if (type === "facility") {
            const updatedClasses = [...flightData.classes];
            const facilityId = Number(value);
            const selectedFacilities = updatedClasses[index].facilities;
            
            if (selectedFacilities.includes(facilityId)) {
                updatedClasses[index].facilities = selectedFacilities.filter(id => id !== facilityId);
            } else {
                updatedClasses[index].facilities = [...selectedFacilities, facilityId];
            }
            setFlightData({ ...flightData, classes: updatedClasses });
        } else {
            if (name === 'flight_number' && 
                value !== originalFlightNumber && // Only check if flight number changed
                existingFlightNumbers.includes(value)) {
                setFieldErrors(prev => ({
                    ...prev,
                    flight_number: 'This flight number already exists'
                }));
            } else {
                // Clear the error if it's fixed
                setFieldErrors(prev => ({
                    ...prev,
                    [name]: null
                }));
            }
            setFlightData({ ...flightData, [name]: value });
        }
        
        // Clear general error when user makes changes
        setError(null);
    };

    // Add a new segment
    const addSegment = () => {
        if (flightData.segments.length >= MAX_SEGMENTS) {
            setError(`Maximum of ${MAX_SEGMENTS} segments allowed`);
            return;
        }
        
        setFlightData(prev => ({
            ...prev,
            segments: [
                ...prev.segments,
                {
                    sequence: prev.segments.length + 1,
                    airport_id: '',
                    time: ''
                }
            ]
        }));
    };

    // Remove a segment
    const removeSegment = (index) => {
        if (flightData.segments.length <= 2) {
            setError('A flight must have at least 2 segments');
            return;
        }
        
        const segmentToRemove = flightData.segments[index];
        
        if (segmentToRemove.id) {
            setDeletedSegments(prev => [...prev, segmentToRemove.id]);
        }

        setFlightData(prev => {
            const updatedSegments = prev.segments.filter((_, i) => i !== index)
                .map((segment, idx) => ({
                    ...segment,
                    sequence: idx + 1
                }));
            return {
                ...prev,
                segments: updatedSegments
            };
        });
    };

    // Add a new class
    const addClass = () => {
        const availableTypes = getAvailableClassTypes(-1); // -1 since this is a new class
        
        if (availableTypes.length === 0) {
            setError('All class types are already in use');
            return;
        }

        setFlightData(prev => ({
            ...prev,
            classes: [
                ...prev.classes,
                {
                    class_type: availableTypes[0], // Select first available type
                    price: '',
                    total_seats: '',
                    facilities: []
                }
            ]
        }));
    };

    // Remove a class
    const removeClass = (index) => {
        if (flightData.classes.length <= 1) {
            setError('At least one class is required');
            return;
        }
        
        const classToRemove = flightData.classes[index];
        
        if (classToRemove.id) {
            setDeletedClasses(prev => [...prev, classToRemove.id]);
        }

        setFlightData(prev => ({
            ...prev,
            classes: prev.classes.filter((_, i) => i !== index)
        }));
    };

    // Validate the current step
    const validateStep = () => {
        const newFieldErrors = {};
        let hasErrors = false;

        switch (currentStep) {
            case 1:
                if (!flightData.flight_number) {
                    newFieldErrors.flight_number = 'Flight number is required';
                    hasErrors = true;
                } else if (
                    flightData.flight_number !== originalFlightNumber && // Only check if flight number changed
                    existingFlightNumbers.includes(flightData.flight_number)
                ) {
                    newFieldErrors.flight_number = 'This flight number already exists';
                    hasErrors = true;
                }

                if (!flightData.airline_id) {
                    newFieldErrors.airline_id = 'Airline selection is required';
                    hasErrors = true;
                }

                if (hasErrors) {
                    setFieldErrors(newFieldErrors);
                    setError('Please correct the errors before proceeding.');
                    return false;
                }
                return true;

            case 2:
                if (flightData.segments.length < 2) {
                    setError('At least 2 segments are required');
                    return false;
                }

                let prevTime = null;
                for (let i = 0; i < flightData.segments.length; i++) {
                    const segment = flightData.segments[i];
                    const prevSegment = i > 0 ? flightData.segments[i - 1] : null;

                    if (!segment.airport_id) {
                        newFieldErrors[`segment_${i}_airport_id`] = 'Airport selection is required';
                        hasErrors = true;
                    } else if (i === 1 && segment.airport_id === prevSegment.airport_id) {
                        newFieldErrors[`segment_${i}_airport_id`] = 'The first and second segments cannot use the same airport';
                        hasErrors = true;
                    }

                    if (!segment.time) {
                        newFieldErrors[`segment_${i}_time`] = 'Time is required';
                        hasErrors = true;
                    } else if (prevTime && new Date(segment.time) <= new Date(prevTime)) {
                        newFieldErrors[`segment_${i}_time`] = 'Time must be after the previous segment';
                        hasErrors = true;
                    } else {
                        prevTime = segment.time;
                    }
                }

                if (hasErrors) {
                    setFieldErrors(newFieldErrors);
                    setError('Please correct the errors before proceeding.');
                    return false;
                }
                return true;

            case 3:
                for (let i = 0; i < flightData.classes.length; i++) {
                    const cls = flightData.classes[i];

                    if (!cls.price) {
                        newFieldErrors[`class_${i}_price`] = 'Price is required';
                        hasErrors = true;
                    } else if (isNaN(parseFloat(cls.price)) || parseFloat(cls.price) <= 0) {
                        newFieldErrors[`class_${i}_price`] = 'Price must be a positive number';
                        hasErrors = true;
                    }

                    if (!cls.total_seats) {
                        newFieldErrors[`class_${i}_total_seats`] = 'Total seats is required';
                        hasErrors = true;
                    } else if (isNaN(parseInt(cls.total_seats)) || parseInt(cls.total_seats) <= 0) {
                        newFieldErrors[`class_${i}_total_seats`] = 'Total seats must be a positive number';
                        hasErrors = true;
                    }
                }

                if (hasErrors) {
                    setFieldErrors(newFieldErrors);
                    setError('Please correct the errors before proceeding.');
                    return false;
                }
                return true;

            default:
                return false;
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
    
        if (!validateStep()) {
            return;
        }
    
        try {
            setLoading(true);
            setError(null);
    
            const payload = {
                flight_number: flightData.flight_number,
                airline_id: flightData.airline_id,
                segments: flightData.segments.map(segment => ({
                    id: segment.id,
                    sequence: segment.sequence,
                    airportId: segment.airport_id,
                    time: formatDateForBackend(segment.time)
                })),
                classes: flightData.classes.map(cls => ({
                    id: cls.id,
                    classType: cls.class_type,
                    price: Number(cls.price),
                    totalSeats: Number(cls.total_seats),
                    facilities: cls.facilities
                })),
                deleted_segments: deletedSegments,
                deleted_classes: deletedClasses
            };
    
            await axiosApi.put(`/flights/${id}`, payload);
            navigate('/admin/flights');
    
        } catch (err) {
            console.error('Update error:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to update flight';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Render the current step
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return renderBasicDetails();
            case 2:
                return renderSegments();
            case 3:
                return renderClasses();
            default:
                return null;
        }
    };

    // Render basic details step
    const renderBasicDetails = () => (
        <div className="step-container">
            <h2>Basic Flight Details</h2>
            
            <div className="form-group">
                <label>Flight Number</label>
                <input
                    type="text"
                    name="flight_number"
                    value={flightData.flight_number}
                    onChange={handleChange}
                    className={fieldErrors.flight_number ? "input-error" : "form-control"}
                    required
                />
                {fieldErrors.flight_number && (
                    <div className="field-error">{fieldErrors.flight_number}</div>
                )}
            </div>

            <div className="form-group">
                <label>Airline</label>
                <select
                    name="airline_id"
                    value={flightData.airline_id}
                    onChange={handleChange}
                    className={fieldErrors.airline_id ? "input-error" : "form-control"}
                    required
                >
                    <option value="">Select Airline</option>
                    {airlines.map(airline => (
                        <option key={airline.id} value={airline.id}>
                            {airline.name}
                        </option>
                    ))}
                </select>
                {fieldErrors.airline_id && (
                    <div className="field-error">{fieldErrors.airline_id}</div>
                )}
            </div>
        </div>
    );

    // Render segments step
    const renderSegments = () => (
        <div className="step-container">
            <h2>Flight Segments</h2>
            <p className="requirement-note">* At least 2 segments are required (maximum 6)</p>
            <p className="requirement-note">* Each segment must have a later time than the previous one</p>
            <p className="requirement-note">* The first and second segments cannot use the same airport</p>
            
            {flightData.segments.map((segment, index) => (
                <div key={index} className="segment-group">
                    <h3>Segment {segment.sequence}</h3>
                    
                    <div className="form-group">
                        <label>Airport</label>
                        <select
                            name="airport_id"
                            value={segment.airport_id}
                            onChange={(e) => handleChange(e, index, 'segment')}
                            className={fieldErrors[`segment_${index}_airport_id`] ? "input-error" : "form-control"}
                            required
                            disabled={loading}
                        >
                            <option value="">Select Airport</option>
                            {airports.map(airport => (
                                <option key={airport.id} value={airport.id}>
                                    {airport.name}
                                </option>
                            ))}
                        </select>
                        {fieldErrors[`segment_${index}_airport_id`] && (
                            <div className="field-error">{fieldErrors[`segment_${index}_airport_id`]}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Time</label>
                        <input
                            type="datetime-local"
                            name="time"
                            value={segment.time}
                            onChange={(e) => handleChange(e, index, 'segment')}
                            className={fieldErrors[`segment_${index}_time`] ? "input-error" : "form-control"}
                            required
                            disabled={loading}
                        />
                        {fieldErrors[`segment_${index}_time`] && (
                            <div className="field-error">{fieldErrors[`segment_${index}_time`]}</div>
                        )}
                    </div>

                    {flightData.segments.length > 2 && (
                        <button
                            type="button"
                            onClick={() => removeSegment(index)}
                            className="remove-button"
                            disabled={loading}
                        >
                            Remove Segment
                        </button>
                    )}
                </div>
            ))}

            <button 
                type="button" 
                onClick={addSegment} 
                className="add-button"
                disabled={loading || flightData.segments.length >= MAX_SEGMENTS}
            >
                Add Segment
            </button>
        </div>
    );

    // Render classes step
    const renderClasses = () => (
        <div className="step-container">
            <h2>Flight Classes</h2>
            
            {flightData.classes.map((classData, index) => (
                <div key={index} className="class-group">
                    <div className="form-group">
                        <label>Class Type</label>
                        <select
                            name="class_type"
                            value={classData.class_type}
                            onChange={(e) => handleChange(e, index, 'class')}
                            className={fieldErrors[`class_${index}_class_type`] ? "input-error" : "form-control"}
                            required
                        >
                            <option value={classData.class_type}>{classData.class_type}</option>
                            {getAvailableClassTypes(index).map(type => (
                                type !== classData.class_type && <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {fieldErrors[`class_${index}_class_type`] && (
                            <div className="field-error">{fieldErrors[`class_${index}_class_type`]}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Price ( USD $ ):</label>
                        <input
                            type="number"
                            name="price"
                            value={classData.price}
                            onChange={(e) => handleChange(e, index, 'class')}
                            className={fieldErrors[`class_${index}_price`] ? "input-error" : "form-control"}
                            required
                            min="0"
                        />
                        {fieldErrors[`class_${index}_price`] && (
                            <div className="field-error">{fieldErrors[`class_${index}_price`]}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Total Seats</label>
                        <input
                            type="number"
                            name="total_seats"
                            value={classData.total_seats}
                            onChange={(e) => handleChange(e, index, 'class')}
                            className={fieldErrors[`class_${index}_total_seats`] ? "input-error" : "form-control"}
                            required
                            min="1"
                        />
                        {fieldErrors[`class_${index}_total_seats`] && (
                            <div className="field-error">{fieldErrors[`class_${index}_total_seats`]}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Facilities</label>
                        <div className="facilities-grid">
                            {facilities.map(facility => (
                                <div key={facility.id} className="facility-item">
                                    <input
                                        type="checkbox"
                                        id={`facility-${facility.id}-${index}`}
                                        name="facilities"
                                        value={facility.id}
                                        checked={classData.facilities.includes(facility.id)}
                                        onChange={(e) => handleChange(e, index, 'facility')}
                                    />
                                    <label htmlFor={`facility-${facility.id}-${index}`}>
                                        {facility.image && (
                                            <img
                                                src={facility.image}
                                                alt={facility.name}
                                                className="facility-image"
                                            />
                                        )}
                                        <span>{facility.name}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {flightData.classes.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeClass(index)}
                            className="remove-button"
                            disabled={loading}
                        >
                            Remove Class
                        </button>
                    )}
                </div>
            ))}

            <button 
                type="button" 
                onClick={addClass} 
                className="add-button"
                disabled={loading || flightData.classes.length >= CLASS_TYPES.length}
            >
                Add Class
            </button>
        </div>
    );

    // Render navigation buttons
    const renderNavigation = () => (
        <div className="navigation-buttons">
            {currentStep > 1 && (
                <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="nav-button"
                    disabled={loading}
                >
                    <ChevronLeft size={20} />
                    <span>Previous</span>
                </button>
            )}
            
            {currentStep < 3 && (
                <button
                    type="button"
                    onClick={() => {
                        if (validateStep()) {
                            setCurrentStep(prev => prev + 1);
                        }
                    }}
                    className="nav-button"
                    disabled={loading}
                >
                    <span>Next</span>
                    <ChevronRight size={20} />
                </button>
            )}

            {currentStep === 3 && (
                <button
                    type="submit"
                    disabled={loading}
                    className="submit-button"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            )}
        </div>
    );

    // Main component render
    if (loading && !flightData.flight_number) {
        return <Loading />;
    }

    return (
        <div className="edit-component-container">
            <div className="edit-component-header">
                <h3>Edit Flight</h3>
                <button 
                    onClick={() => navigate('/admin/flights')} 
                    className="close-button"
                    disabled={loading}
                >
                    ✕
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="edit-component-form">
                {/* Global error message box at the top */}
                {error && (
                    <div className="error-message-container">
                        <div className="error-text">Please correct the errors before proceeding.</div>
                    </div>
                )}
                
                {renderStep()}
                {renderNavigation()}
            </form>
        </div>
    );
};

export default EditFlight;