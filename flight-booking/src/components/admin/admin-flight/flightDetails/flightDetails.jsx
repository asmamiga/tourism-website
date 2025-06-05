import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import axiosApi from '../../../../api/axios';
import Loading from '../../loading/Loading';
import './flightDetails.css';
const FlightDetails = ({ flight, onClose }) => {
    const [details, setDetails] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [airports, setAirports] = React.useState([]);


    React.useEffect(() => {
        const fetchFlightDetails = async () => {
            try {
                const response = await axiosApi.get(`/flights/${flight.id}`);
                setDetails(response);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch flight details: ' + (err.response?.data?.message || err.message));
                setLoading(false);
            }
        };

        fetchFlightDetails();
    }, [flight.id]);

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    };
    const getAirportInfo = (airportId) => {
        const airport = airports?.find(a => a.id === airportId);
        return airport ? `${airport.name} (${airport.iata_code})` : 'N/A';
    };

    useEffect(() => {
        const fetchFlightDetails = async () => {
            try {
                const [flightResponse, airportsResponse] = await Promise.all([
                    axiosApi.get(`/flights/${flight.id}`),
                    axiosApi.get('/airports')
                ]);
                
                setDetails(flightResponse);
                setAirports(airportsResponse);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch flight details: ' + (err.response?.data?.message || err.message));
                setLoading(false);
            }
        };
        fetchFlightDetails();
    }, [flight.id]);


    if (loading) return <Loading />;
    if (error) return <div className="error-message">{error}</div>;
    if (!details) return null;

    return (
        <div className="flight-details-overlay">
            <div className="flight-details-container">
                <div className="flight-details-header">
                    <h2 className="flight-details-title">Flight Details</h2>
                    <button
                        onClick={onClose}
                        className="flight-details-close-button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
    
                <div className="flight-details-section">
                    <h3 className="section-title">Basic Information</h3>
                    <div className="info-row">
                        <span className="info-label">Flight Number:</span>
                        <span className="info-value">{details.flight_number}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Airline:</span>
                        <span className="info-value">{details.airline?.name || 'N/A'}</span>
                    </div>
                </div>
    
                <div className="flight-details-section">
                    <h3 className="section-title">Flight Segments</h3>
                    {details.flight_segments?.map((segment, index) => (
                        <div key={segment.id} className="segment-card">
                            <div className="segment-header">Segment {index + 1}</div>
                            <div className="info-row">
                                <span className="info-label">Airport:</span>
                                <span className="info-value">
                                    {getAirportInfo(segment.airport_id)}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Time:</span>
                                <span className="info-value">{formatDateTime(segment.time)}</span>
                            </div>
                        </div>
                    ))}
                </div>
    
                <div className="flight-details-section">
                    <h3 className="section-title">Available Classes</h3>
                    {details.flight_classes?.map((classInfo) => (
                        <div key={classInfo.id} className="class-card">
                            <div className="class-type">{classInfo.class_type}</div>
                            <div className="info-row">
                                <span className="info-label">Price:</span>
                                <span className="info-value">${classInfo.price}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Total Seats:</span>
                                <span className="info-value">{classInfo.total_seats}</span>
                            </div>
                            {classInfo.facilities?.length > 0 && (
                                <div className="info-row">
                                    <span className="info-label">Facilities:</span>
                                    <ul className="facilities-list">
                                        {classInfo.facilities.map((facility) => (
                                            <li key={facility.id}>{facility.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FlightDetails;