import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash, Plus } from 'lucide-react';
import '../../styles/ListCommonStyle.css';
import axiosApi from '../../../../api/axios';
import CreateFacility from '../create-facility/create-facility';
import DeleteFacility from '../delete-facility/delete-facility';
import Loading from '../../loading/Loading';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs';
import Pagination from '../../pagination/Pagination';

const FacilityList = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch facilities from the backend
  useEffect(() => {
    fetchFacilities();
  }, [currentPage, itemsPerPage]);

  const fetchFacilities = async () => {
    try {
      const response = await axiosApi.get('/facilities');
      if (Array.isArray(response)) {
        setTotalItems(response.length);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = response.slice(startIndex, endIndex);
        setFacilities(paginatedItems);
      } else {
        setError('Invalid data format received');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch facilities: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Handle editing a facility
  const handleEdit = (facility) => {
    navigate(`/admin/facilities/${facility.id}/edit`);
  };

  // Handle deleting a facility
  const handleDelete = (facility) => {
    setSelectedFacility(facility);
    setCurrentView('delete');
  };

  // Handle bulk deletion of facilities
  const handleMultiDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete the selected facilities?');

    if (isConfirmed) {
      try {
        const deletePromises = selectedFacilities.map(id =>
          axiosApi.delete(`/facilities/${id}`)
        );
        await Promise.all(deletePromises);
        fetchFacilities(); // Refresh the list after deletion
      } catch (err) {
        setError('Failed to delete facilities: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Handle checkbox selection for bulk deletion
  const handleCheckboxChange = (id) => {
    setSelectedFacilities((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  // Handle selecting/deselecting all facilities
  const handleSelectAll = () => {
    if (selectedFacilities.length === facilities.length) {
      setSelectedFacilities([]);
    } else {
      setSelectedFacilities(facilities.map((facility) => facility.id));
    }
  };

  // Handle success actions (e.g., after creating or deleting a facility)
  const handleSuccess = () => {
    fetchFacilities(); // Refresh the list
    setCurrentView('list'); // Return to the list view
    setSelectedFacility(null); // Clear the selected facility
  };

  // Show loading or error messages
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
        <h1>Facilities</h1>
        <div className="header-actions">
          <button
            onClick={() => setCurrentView('create')}
            className="add-component-button"
          >
            <Plus className="w-4 h-4" />
            Add Facility
          </button>
          {selectedFacilities.length > 0 && (
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
        <CreateFacility
          onClose={() => setCurrentView('list')}
          onSuccess={handleSuccess}
        />
      )}

      {currentView === 'delete' && selectedFacility && (
        <DeleteFacility
          facility={selectedFacility}
          onClose={() => setCurrentView('list')}
          onSuccess={handleSuccess}
        />
      )}

      {currentView === 'list' && (
        !facilities || facilities.length === 0 ? (
          <div className="loading-message">No facilities found</div>
        ) : (
          <div className="component-table-container">
            <table className="component-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedFacilities.length === facilities.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => (
                  <tr key={facility.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedFacilities.includes(facility.id)}
                        onChange={() => handleCheckboxChange(facility.id)}
                      />
                    </td>
                    <td>{facility.name}</td>
                    <td>{facility.description}</td>
                    <td>
                      {facility.image && (
                        <img
                          src={facility.image}
                          alt={facility.name}
                          className="component-image"
                          style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                        />
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(facility)}
                          className="edit-button"
                        >
                          <Pencil className="w-4 h-4" /> <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(facility)}
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

export default FacilityList;