import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash, Plus } from 'lucide-react';
import '../../styles/ListCommonStyle.css';
import './airlineList.css';
import axiosApi from '../../../../api/axios';
import CreateAirline from '../create-airline/create-airline';
import DeleteAirline from '../delete-airline/delete-airline';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs';
import Loading from '../../loading/Loading';
import Pagination from '../../pagination/Pagination';

const AirlineList = () => {
  const navigate = useNavigate();
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchAirlines();
  }, [currentPage, itemsPerPage]);

  const fetchAirlines = async () => {
    try {
      const response = await axiosApi.get('/airlines');
      if (Array.isArray(response)) {
        setTotalItems(response.length);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = response.slice(startIndex, endIndex);
        setAirlines(paginatedItems);
      } else {
        setError('Invalid data format received');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch airlines: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleEdit = (airline) => {
    navigate(`/admin/airlines/${airline.id}/edit`);
  };

  const handleDelete = (airline) => {
    setSelectedAirline(airline);
    setCurrentView('delete');
  };

  const handleMultiDelete = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete the selected airlines?');
  
    if (isConfirmed) {
      try {
        const deletePromises = selectedAirlines.map(id => 
          axiosApi.delete(`/airlines/${id}`)
        );
        await Promise.all(deletePromises);
        fetchAirlines();
        setSelectedAirlines([]);
      } catch (err) {
        setError('Failed to delete airlines: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedAirlines((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAirlines.length === airlines.length) {
      setSelectedAirlines([]);
    } else {
      setSelectedAirlines(airlines.map((airline) => airline.id));
    }
  };

  const handleSuccess = () => {
    fetchAirlines();
    setCurrentView('list');
    setSelectedAirline(null);
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
        <h1>Airlines</h1>
        {currentView === 'list' && (
          <div className="header-actions">
            <button
              onClick={() => setCurrentView('create')}
              className="add-component-button"
            >
              <Plus className="w-4 h-4" />
              Add Airline
            </button>
            {selectedAirlines.length > 0 && (
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
        <CreateAirline
          onClose={() => setCurrentView('list')}
          onSuccess={handleSuccess}
        />
      )}

      {currentView === 'delete' && selectedAirline && (
        <DeleteAirline
          airline={selectedAirline}
          onClose={() => setCurrentView('list')}
          onSuccess={handleSuccess}
        />
      )}

      {currentView === 'list' && (
        !airlines || airlines.length === 0 ? (
          <div className="loading-message">No airlines found</div>
        ) : (
          <div className="component-table-container">
            <table className="component-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedAirlines.length === airlines.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Logo</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {airlines.map((airline) => (
                  <tr key={airline.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedAirlines.includes(airline.id)}
                        onChange={() => handleCheckboxChange(airline.id)}
                      />
                    </td>
                    <td>
                      {airline.logo && (
                        <img src={airline.logo} alt={`${airline.name} logo`} className="airline-logo" />
                      )}
                    </td>
                    <td>{airline.name}</td>
                    <td>{airline.code}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(airline)}
                          className="edit-button"
                        >
                          <Pencil className="w-4 h-4" /> <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(airline)}
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

export default AirlineList;