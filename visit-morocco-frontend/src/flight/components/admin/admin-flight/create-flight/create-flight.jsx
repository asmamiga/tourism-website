import React, { useState, useEffect } from 'react';
import axiosApi from '../../../../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Loading from '../../loading/Loading';
import './create-flight.css';

const CreateFlight = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // Step state for wizard
    const [flightData, setFlightData] = useState({
        flight_number: "",
        airline_id: "",
        segments: [
            {
                sequence: 1,
                airportId: "",
                time: ""
            },
            {
                sequence: 2,
                airportId: "",
                time: ""
            }
        ],
        classes: [
            {
                classType: "Economy",
                price: "",
                totalSeats: "",
                facilities: []
            }
        ]
    });
    const [airports, setAirports] = useState([]); // List of airports
    const [airlines, setAirlines] = useState([]); // List of airlines
    const [facilities, setFacilities] = useState([]); // List of available facilities
    const [existingFlightNumbers, setExistingFlightNumbers] = useState([]); // To track existing flight numbers
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
    const [loading, setLoading] = useState(false);
    const [stepValidated, setStepValidated] = useState({
        1: false,
        2: false,
        3: false
    });

    // Predefined class types
    const classTypes = ["Economy", "Business", "First"];

    // Maximum number of segments allowed
    const MAX_SEGMENTS = 6;

    // Fetch airports, airlines, facilities, and existing flight numbers on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [airportsResponse, airlinesResponse, facilitiesResponse, flightsResponse] = await Promise.all([
                    axiosApi.get('/airports'),
                    axiosApi.get('/airlines'),
                    axiosApi.get('/facilities'),
                    axiosApi.get('/flights') // Get existing flights to check flight numbers
                ]);
                
                setAirports(airportsResponse || []);
                setAirlines(airlinesResponse || []);
                setFacilities(facilitiesResponse || []);
                
                // Extract flight numbers from existing flights
                const flightNumbers = flightsResponse 
                    ? flightsResponse.map(flight => flight.flight_number)
                    : [];
                setExistingFlightNumbers(flightNumbers);
                
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch required data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e, index, type) => {
        const { name, value } = e.target;
        
        // Clear field-specific errors when user makes changes
        setFieldErrors(prev => ({
            ...prev,
            [name]: null
        }));
        
        if (type === "segment") {
            const updatedSegments = [...flightData.segments];
            updatedSegments[index][name] = value;
            
            // Clear segment-specific errors
            setFieldErrors(prev => ({
                ...prev,
                [`segment_${index}_${name}`]: null
            }));
            
            setFlightData({ ...flightData, segments: updatedSegments });
            
        } else if (type === "class") {
            const updatedClasses = [...flightData.classes];
            if (name === "facilities") {
                const facilityId = Number(value);
                const selectedFacilities = updatedClasses[index].facilities;
                if (selectedFacilities.includes(facilityId)) {
                    updatedClasses[index].facilities = selectedFacilities.filter(id => id !== facilityId);
                } else {
                    updatedClasses[index].facilities = [...selectedFacilities, facilityId];
                }
            } else if (name === "price") {
                // Handle price input with 2 decimal places
                const numericValue = value.replace(/[^\d.]/g, '');
                const parts = numericValue.split('.');
                if (parts.length > 2) return; // Prevent multiple decimal points
                if (parts[1] && parts[1].length > 2) return; // Limit to 2 decimal places
                updatedClasses[index].price = numericValue;
                
                // Clear price-specific errors
                setFieldErrors(prev => ({
                    ...prev,
                    [`class_${index}_${name}`]: null
                }));
                
            } else {
                updatedClasses[index][name] = value;
                
                // Clear class-specific errors
                setFieldErrors(prev => ({
                    ...prev,
                    [`class_${index}_${name}`]: null
                }));
            }
            setFlightData({ ...flightData, classes: updatedClasses });
            
        } else {
            // Handle flight number uniqueness check
            if (name === 'flight_number') {
                if (existingFlightNumbers.includes(value)) {
                    setFieldErrors(prev => ({
                        ...prev,
                        flight_number: 'This flight number already exists'
                    }));
                }
            }
            
            setFlightData({ ...flightData, [name]: value });
        }
        
        // Clear general error when user makes changes
        setError(null);
    };

    const addSegment = () => {
        // Prevent adding more than MAX_SEGMENTS segments
        if (flightData.segments.length >= MAX_SEGMENTS) {
            setError(`Maximum of ${MAX_SEGMENTS} segments allowed`);
            return;
        }
        
        setFlightData({
            ...flightData,
            segments: [
                ...flightData.segments,
                { sequence: flightData.segments.length + 1, airportId: "", time: "" }
            ]
        });
    };

    const removeSegment = (index) => {
        // Prevent removing segments if there would be fewer than 2
        if (flightData.segments.length <= 2) {
            setError('At least 2 segments are required');
            return;
        }
        
        const updatedSegments = flightData.segments.filter((_, i) => i !== index);
        // Update sequence numbers
        updatedSegments.forEach((segment, idx) => {
            segment.sequence = idx + 1;
        });
        
        setFlightData({ ...flightData, segments: updatedSegments });
        
        // Clear segment-related errors
        const newFieldErrors = { ...fieldErrors };
        Object.keys(newFieldErrors).forEach(key => {
            if (key.startsWith(`segment_${index}`)) {
                delete newFieldErrors[key];
            }
        });
        setFieldErrors(newFieldErrors);
    };

    const addClass = () => {
        // Only allow adding a class if there are class types remaining
        const usedClassTypes = flightData.classes.map(cls => cls.classType);
        const availableClassTypes = classTypes.filter(type => !usedClassTypes.includes(type));
        
        if (availableClassTypes.length === 0) {
            setError('All class types have been used');
            return;
        }
        
        setFlightData({
            ...flightData,
            classes: [
                ...flightData.classes,
                { classType: availableClassTypes[0], price: "", totalSeats: "", facilities: [] }
            ]
        });
    };

    const removeClass = (index) => {
        // Prevent removing the last class
        if (flightData.classes.length <= 1) {
            setError('At least one class is required');
            return;
        }
        
        const updatedClasses = flightData.classes.filter((_, i) => i !== index);
        setFlightData({ ...flightData, classes: updatedClasses });
        
        // Clear class-related errors
        const newFieldErrors = { ...fieldErrors };
        Object.keys(newFieldErrors).forEach(key => {
            if (key.startsWith(`class_${index}`)) {
                delete newFieldErrors[key];
            }
        });
        setFieldErrors(newFieldErrors);
    };

    // Get available class types for a specific index, excluding ones already selected by other classes
    const getAvailableClassTypes = (currentIndex) => {
        const usedClassTypes = flightData.classes
            .filter((_, idx) => idx !== currentIndex)
            .map(cls => cls.classType);
        
        return classTypes.filter(type => !usedClassTypes.includes(type));
    };

    const formatPrice = (price) => {
        if (!price) return '';
        return parseFloat(price).toFixed(2);
    };
    
    const validateStep = (stepNumber) => {
        const newFieldErrors = { ...fieldErrors };
        let hasErrors = false;
        
        switch (stepNumber) {
            case 1:
                // Flight number and airline validation remains unchanged
                if (!flightData.flight_number) {
                    newFieldErrors.flight_number = 'Flight number is required';
                    hasErrors = true;
                }
                
                else if (existingFlightNumbers.includes(flightData.flight_number)) {
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
                    setError('At least 2 segments are required.');
                    return false;
                }
                
                // Check all segments for valid data
                let prevTime = null;
                
                for (let i = 0; i < flightData.segments.length; i++) {
                    const segment = flightData.segments[i];
                    const prevSegment = i > 0 ? flightData.segments[i - 1] : null;
                    
                    // Check if airport is selected
                    if (!segment.airportId) {
                        newFieldErrors[`segment_${i}_airportId`] = 'Airport selection is required';
                        hasErrors = true;
                    } 
                    // Check that ONLY the first and second segments have different airports
                    else if (i === 1 && segment.airportId === prevSegment.airportId) {
                        newFieldErrors[`segment_${i}_airportId`] = 'The first and second segments cannot use the same airport';
                        hasErrors = true;
                    }
                    
                    // Check if time is set
                    if (!segment.time) {
                        newFieldErrors[`segment_${i}_time`] = 'Time is required';
                        hasErrors = true;
                    } 
                    // Check if time is after previous segment time
                    else if (prevTime && new Date(segment.time) <= new Date(prevTime)) {
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
                
            // Case 3 remains unchanged
            case 3:
                // Check all class details
                for (let i = 0; i < flightData.classes.length; i++) {
                    const cls = flightData.classes[i];
                    
                    // Check price
                    if (!cls.price) {
                        newFieldErrors[`class_${i}_price`] = 'Price is required';
                        hasErrors = true;
                    } else if (isNaN(parseFloat(cls.price)) || parseFloat(cls.price) <= 0) {
                        newFieldErrors[`class_${i}_price`] = 'Price must be a positive number';
                        hasErrors = true;
                    }
                    
                    // Check total seats
                    if (!cls.totalSeats) {
                        newFieldErrors[`class_${i}_totalSeats`] = 'Total seats is required';
                        hasErrors = true;
                    } else if (isNaN(parseInt(cls.totalSeats)) || parseInt(cls.totalSeats) <= 0) {
                        newFieldErrors[`class_${i}_totalSeats`] = 'Total seats must be a positive number';
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
    
    const handleSubmit = async (e, createAnother = false) => {
        e.preventDefault();
        
        // Validate the final step before submission
        if (!validateStep(3)) {
            return;
        }
        
        setLoading(true);
        setError(null);
    
        try {
            const response = await axiosApi.post('/flights', flightData);
            console.log('Flight created successfully:', response);
    
            if (createAnother) {
                // Add the new flight number to the existing list
                setExistingFlightNumbers([...existingFlightNumbers, flightData.flight_number]);
                
                // Reset form for new flight
                setFlightData({
                    flight_number: "",
                    airline_id: "",
                    segments: [
                        {
                            sequence: 1,
                            airportId: "",
                            time: ""
                        },
                        {
                            sequence: 2,
                            airportId: "",
                            time: ""
                        }
                    ],
                    classes: [
                        {
                            classType: "Economy",
                            price: "",
                            totalSeats: "",
                            facilities: []
                        }
                    ]
                });
                setStep(1); // Reset to the first step
                setStepValidated({1: false, 2: false, 3: false});
                setFieldErrors({});
            } else {
                onSuccess(response); // Pass the new flight data to onSuccess
            }
        } catch (err) {
            console.error('Error creating flight:', err);
            if (err.response?.data?.error === 'DUPLICATE_FLIGHT_NUMBER') {
                setError('This flight number already exists. Please choose a different one.');
                setFieldErrors({
                    ...fieldErrors,
                    flight_number: 'This flight number already exists'
                });
            } else {
                setError(err.response?.data?.message || 'Failed to create flight. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const nextStep = () => {
        const isValid = validateStep(step);
        
        if (isValid) {
            // Mark the current step as validated
            setStepValidated({
                ...stepValidated,
                [step]: true
            });
            
            setStep(step + 1);
            setError(null); // Clear any previous errors
        }
    };

    const prevStep = () => {
        setStep(step - 1);
        setError(null); // Clear any previous errors
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="step-container">
                        <h2>Flight Details</h2>
                        <div className="form-group">
                            <label>Flight Number:</label>
                            <input
                                type="text"
                                name="flight_number"
                                value={flightData.flight_number}
                                onChange={(e) => handleInputChange(e, null, "flight")}
                                className={fieldErrors.flight_number ? "input-error" : ""}
                                required
                            />
                            {fieldErrors.flight_number && (
                                <div className="field-error">{fieldErrors.flight_number}</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Airline:</label>
                            <select
                                name="airline_id"
                                value={flightData.airline_id}
                                onChange={(e) => handleInputChange(e, null, "flight")}
                                className={fieldErrors.airline_id ? "input-error" : ""}
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
                        <div className="navigation-buttons">
                            <button type="button" className="nav-button" onClick={nextStep}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="step-container">
                        <h2>Segments</h2>
                        <div className="segment-info">
                            <p className="segment-requirement">* At least 2 segments are required (maximum {MAX_SEGMENTS})</p>
                            <p className="segment-requirement">* Each segment must have a later time than the previous one</p>
                            <p className="segment-requirement">* The first and second segments cannot use the same airport</p>
                        </div>
                        {flightData.segments.map((segment, index) => (
                            <div className="segment-group" key={index}>
                                <label>Segment {segment.sequence}:</label>
                                <div className="form-group">
                                    <select
                                        name="airportId"
                                        value={segment.airportId}
                                        onChange={(e) => handleInputChange(e, index, "segment")}
                                        className={fieldErrors[`segment_${index}_airportId`] ? "input-error" : ""}
                                        required
                                    >
                                        <option value="">Select Airport</option>
                                        {airports.map(airport => (
                                            <option key={airport.id} value={airport.id}>
                                                {airport.name}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors[`segment_${index}_airportId`] && (
                                        <div className="field-error">{fieldErrors[`segment_${index}_airportId`]}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <input
                                        type="datetime-local"
                                        name="time"
                                        value={segment.time}
                                        onChange={(e) => handleInputChange(e, index, "segment")}
                                        className={fieldErrors[`segment_${index}_time`] ? "input-error" : ""}
                                        required
                                    />
                                    {fieldErrors[`segment_${index}_time`] && (
                                        <div className="field-error">{fieldErrors[`segment_${index}_time`]}</div>
                                    )}
                                </div>
                                <button type="button" className="remove-button" onClick={() => removeSegment(index)}>
                                    Remove Segment
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            className="add-button" 
                            onClick={addSegment}
                            disabled={flightData.segments.length >= MAX_SEGMENTS}
                        >
                            Add Segment
                        </button>
                        <div className="navigation-buttons">
                            <button type="button" className="nav-button" onClick={prevStep}>
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <button type="button" className="nav-button" onClick={nextStep}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="step-container">
                        <h2>Classes</h2>
                        {flightData.classes.map((cls, index) => (
                            <div className="class-group" key={index}>
                                <div className="form-group">
                                    <label>Class Type:</label>
                                    <select
                                        name="classType"
                                        value={cls.classType}
                                        onChange={(e) => handleInputChange(e, index, "class")}
                                        required
                                    >
                                        {getAvailableClassTypes(index).map((type, idx) => (
                                            <option key={idx} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price ( USD $ ):</label>
                                    <div className="price-input-container">
                                        <input
                                            type="text"
                                            name="price"
                                            value={cls.price}
                                            onChange={(e) => handleInputChange(e, index, "class")}
                                            onBlur={(e) => {
                                                const updatedClasses = [...flightData.classes];
                                                updatedClasses[index].price = formatPrice(e.target.value);
                                                setFlightData({ ...flightData, classes: updatedClasses });
                                            }}
                                            className={fieldErrors[`class_${index}_price`] ? "input-error" : ""}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    {fieldErrors[`class_${index}_price`] && (
                                        <div className="field-error">{fieldErrors[`class_${index}_price`]}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Total Seats:</label>
                                    <input
                                        type="number"
                                        name="totalSeats"
                                        value={cls.totalSeats}
                                        onChange={(e) => handleInputChange(e, index, "class")}
                                        className={fieldErrors[`class_${index}_totalSeats`] ? "input-error" : ""}
                                        required
                                    />
                                    {fieldErrors[`class_${index}_totalSeats`] && (
                                        <div className="field-error">{fieldErrors[`class_${index}_totalSeats`]}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Facilities:</label>
                                    <div className="facilities-grid">
                                        {facilities.map(facility => (
                                            <div key={facility.id} className="facility-item">
                                                <input
                                                    type="checkbox"
                                                    id={`facility-${facility.id}-${index}`}
                                                    name="facilities"
                                                    value={facility.id}
                                                    checked={cls.facilities.includes(facility.id)}
                                                    onChange={(e) => handleInputChange(e, index, "class")}
                                                />
                                                <label htmlFor={`facility-${facility.id}-${index}`}>
                                                    <img
                                                        src={facility.image}
                                                        alt={facility.name}
                                                        className="facility-image"
                                                    />
                                                    <span>{facility.name}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button type="button" className="remove-button" onClick={() => removeClass(index)}>
                                    Remove Class
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            className="add-button" 
                            onClick={addClass}
                            disabled={flightData.classes.length >= classTypes.length}
                        >
                            Add Class
                        </button>
                        <div className="navigation-buttons">
                            <button type="button" className="nav-button" onClick={prevStep}>
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <button
                                type="submit"
                                className="submit-button"
                                onClick={(e) => handleSubmit(e, false)}
                                disabled={loading}
                            >
                                {loading ? <Loading isButton /> : 'Create Flight'}
                            </button>
                            <button
                                type="button"
                                className="create-another-button"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={loading}
                            >
                                {loading ? <Loading isButton /> : 'Create and Create Another'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="create-component-container">
            <div className="create-component-header">
                <h3>Create New Flight</h3>
                <button onClick={onClose} className="close-button">
                    ✕
                </button>
            </div>
            <form onSubmit={(e) => handleSubmit(e, false)} className="create-component-form">
                {error && <div className="error-message">{error}</div>}
                <div className="step-indicator">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
                    <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
                </div>
                {renderStep()}
            </form>
        </div>
    );
};

export default CreateFlight;