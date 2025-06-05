import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash, Plus } from 'lucide-react';
import '../../styles/ListCommonStyle.css';
import axiosApi from '../../../../api/axios';
import CreateAirport from '../create-airport/create-airport';
import DeleteAirport from '../delete-airport/delete-airport';
import Loading from '../../loading/Loading';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs';
import Pagination from '../../pagination/Pagination';

const AirportList = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
const [allAirports, setAllAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [selectedAirports, setSelectedAirports] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchAirports();
  }, []);

  // Update pagination whenever current page or items per page changes
  useEffect(() => {
    if (allAirports.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setAirports(allAirports.slice(startIndex, endIndex));
    }
  }, [currentPage, itemsPerPage, allAirports]);

  const fetchAirports = async () => {
    try {
      const response = await axiosApi.get('/airports');
      if (Array.isArray(response)) {
        setAllAirports(response);
        setTotalItems(response.length);
        
        // Set initial pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setAirports(response.slice(startIndex, endIndex));
      } else {
        setError('Invalid data format received');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch airports: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleEdit = (airport) => {
    navigate(`/admin/airports/${airport.id}/edit`);
  };

  const handleDelete = (airport) => {
    setSelectedAirport(airport);
    setCurrentView('delete');
  };

  const handleMultiDelete = async () => {
    
      const isConfirmed = window.confirm('Are you sure you want to delete the selected airports?');

      if (isConfirmed) {
        try {
          const deletePromises = selectedAirports.map(id => 
            axiosApi.delete(`/airports/${id}`)
          );
          await Promise.all(deletePromises);
          fetchAirports();
        }  catch (err) {
        setError('Failed to delete airlines: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedAirports((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAirports.length === airports.length) {
      setSelectedAirports([]);
    } else {
      setSelectedAirports(airports.map((airport) => airport.id));
    }
  };

  const handleSuccess = () => {
    fetchAirports();
    setCurrentView('list');
    setSelectedAirport(null);
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
        <h1>Airports</h1>
        <div className="header-actions">
          <button
            onClick={() => setCurrentView('create')}
            className="add-component-button"
          >
            <Plus className="w-4 h-4" />
            Add Airport
          </button>
          {selectedAirports.length > 0 && (
            <button
              onClick={handleMultiDelete}
              className="delete-selected-button"
            >
              <Trash className="w-4 h-4" />
              Delete Selected
            </button>
          )}
        </div>
      </div>

      {currentView === 'create' && (
        <CreateAirport
          onClose={() => setCurrentView('list')}
          onSuccess={handleSuccess}
        />
      )}

      {currentView === 'delete' && selectedAirport && (
        <DeleteAirport
          airport={selectedAirport}
          onClose={() => setCurrentView('list')}
          onSuccess={handleSuccess}
        />
      )}

      {currentView === 'list' && (
        !airports || airports.length === 0 ? (
          <div className="loading-message">No airports found</div>
        ) : (
          <div className="component-table-container">
            <table className="component-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedAirports.length === airports.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>IATA Code</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {airports.map((airport) => (
                  <tr key={airport.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedAirports.includes(airport.id)}
                        onChange={() => handleCheckboxChange(airport.id)}
                      />
                    </td>
                    <td>{airport.name}</td>
                    <td>{airport.iata_code}</td>
                    <td>{airport.city}</td>
                    <td>{airport.country}</td>
                    <td>
                      {airport.image && (
                        <img
                          src={airport.image}
                          alt={airport.name}
                          className="component-image"
                          style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                        />
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(airport)}
                          className="edit-button"
                        >
                          <Pencil className="w-4 h-4" /> <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(airport)}
                          className="delete-button"
                        >
                          <Trash className="w-4 h-4" /> <span>Delete</span>
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
        )
      )}
    </div>
  );
};

export default AirportList;