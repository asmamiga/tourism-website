import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash, Plus, Eye } from 'lucide-react';
import '../../styles/ListCommonStyle.css';
import axiosApi from '../../../../api/axios';
import CreateFlight from '../create-flight/create-flight';
import DeleteFlight from '../delete-flight/delete-flight';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs';
import FlightDetails from '../flightDetails/flightDetails';
import Loading from '../../loading/Loading';
import Pagination from '../../pagination/Pagination';

const FlightList = () => {
    const navigate = useNavigate();
    const [flights, setFlights] = useState([]);
    const [allFlights, setAllFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState('list');
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [selectedFlights, setSelectedFlights] = useState([]);
    const [processedFlights, setProcessedFlights] = useState([]);
    const [showingDetailsFor, setShowingDetailsFor] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchFlights();
    }, []);
    
    // Update pagination whenever current page or items per page changes
    useEffect(() => {
        if (allFlights.length > 0) {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            setFlights(allFlights.slice(startIndex, endIndex));
        }
    }, [currentPage, itemsPerPage, allFlights]);

    const calculateDuration = (firstSegment, lastSegment) => {
        if (!firstSegment?.time || !lastSegment?.time) return 'N/A';
        
        const start = new Date(firstSegment.time);
        const end = new Date(lastSegment.time);
        
        const durationMs = end - start;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    };

    const processFlightData = useCallback(() => {
        const processed = [];
        flights.forEach(flight => {
            const processedFlight = {
                id: flight.id,
                flight_number: flight.flight_number || 'N/A',
                airline: flight.airline?.name || flight.airline || 'N/A',
                route_info: 'No route information'
            };

            if (flight.flight_segments && flight.flight_segments.length > 0) {
                const firstSegment = flight.flight_segments[0];
                const lastSegment = flight.flight_segments[flight.flight_segments.length - 1];
                
                if (firstSegment.airport?.iata_code) {
                    const duration = calculateDuration(firstSegment, lastSegment);
                    processedFlight.route_info = `${firstSegment.airport.iata_code} - ${duration}`;
                }
            }

            processed.push(processedFlight);
        });
        setProcessedFlights(processed);
    }, [flights]);

    useEffect(() => {
        processFlightData();
    }, [processFlightData]);

    const fetchFlights = async () => {
        try {
            const response = await axiosApi.get('/flights');
            if (Array.isArray(response)) {
                setAllFlights(response);
                setTotalItems(response.length);
                
                // Set initial pagination
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                setFlights(response.slice(startIndex, endIndex));
            } else {
                setError('Invalid data format received');
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch flights: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    const handleEdit = (flight) => {
        navigate(`/admin/flights/${flight.id}/edit`);
    };

    const handleDelete = (flight) => {
        setSelectedFlight(flight);
        setCurrentView('delete');
    };

    const handleViewDetails = (flight) => {
        setShowingDetailsFor(flight);
    };

    const handleMultiDelete = async () => {
        const isConfirmed = window.confirm('Are you sure you want to delete the selected flights?');
        if (isConfirmed) {
            try {
                const deletePromises = [];
                selectedFlights.forEach(id => {
                    deletePromises.push(axiosApi.delete(`/flights/${id}`));
                });
                await Promise.all(deletePromises);
                fetchFlights();
                setSelectedFlights([]);
            } catch (err) {
                setError('Failed to delete flights: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleCheckboxChange = (id) => {
        const newSelected = [...selectedFlights];
        const index = newSelected.indexOf(id);
        if (index === -1) {
            newSelected.push(id);
        } else {
            newSelected.splice(index, 1);
        }
        setSelectedFlights(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedFlights.length === processedFlights.length) {
            setSelectedFlights([]);
        } else {
            const allIds = [];
            processedFlights.forEach(flight => {
                allIds.push(flight.id);
            });
            setSelectedFlights(allIds);
        }
    };

    const handleSuccess = () => {
        fetchFlights();
        setCurrentView('list');
        setSelectedFlight(null);
    };

    const renderFlightTable = () => {
        if (!processedFlights || processedFlights.length === 0) {
            return <div className="loading-message">No flights found</div>;
        }

        return (
            <div className="component-table-container">
                <table className="component-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedFlights.length === processedFlights.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Flight Number</th>
                            <th>Airline</th>
                            <th>First Airport & Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedFlights.map((flight) => (
                            <tr key={flight.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedFlights.includes(flight.id)}
                                        onChange={() => handleCheckboxChange(flight.id)}
                                    />
                                </td>
                                <td>{flight.flight_number}</td>
                                <td>{flight.airline}</td>
                                <td>{flight.route_info}</td>
                                <td>
                                    <div className="action-buttons">
                                    <button
                                        onClick={() => handleViewDetails(flight)}
                                        className="details-button">
                                        <Eye className="w-4 h-4" /> Details
                                    </button>
                                        <button
                                            onClick={() => handleEdit(flight)}
                                            className="edit-button">
                                            <Pencil className="w-4 h-4" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(flight)}
                                            className="delete-button">
                                            <Trash className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination Component */}
                <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={totalItems}
                />
            </div>
        );
    };

    if (loading) return (
        <div className="component-list-container">
            <Loading />
        </div>
    );
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="component-list-container">
            <Breadcrumbs />
            <div className="component-list-header">
                <h1>Flights</h1>
                {currentView === 'list' && (
                    <div className="header-actions">
                        <button
                            onClick={() => setCurrentView('create')}
                            className="add-component-button"
                        >
                            <Plus className="w-4 h-4" />
                            Add Flight
                        </button>
                        {selectedFlights.length > 0 && (
                            <button
                                onClick={handleMultiDelete}
                                className="delete-selected-button"
                            >
                                <Trash className="w-4 h-4" />
                                Delete Selected
                            </button>
                        )}
                    </div>
                )}
            </div>

            {currentView === 'create' && (
                <CreateFlight
                    onClose={() => setCurrentView('list')}
                    onSuccess={handleSuccess}
                />
            )}

            {currentView === 'delete' && selectedFlight && (
                <DeleteFlight
                    flight={selectedFlight}
                    onClose={() => setCurrentView('list')}
                    onSuccess={handleSuccess}
                />
            )}
            <div className={`component-list-container ${showingDetailsFor ? 'blur-background' : ''}`}>
                {currentView === 'list' && renderFlightTable()}
            </div>
            {showingDetailsFor && (
                <FlightDetails
                    flight={showingDetailsFor}
                    onClose={() => setShowingDetailsFor(null)}
                />
            )}
        </div>
    );
};

export default FlightList;