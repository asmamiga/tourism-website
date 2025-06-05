import React, { useState } from 'react';
import axiosApi from '../../../../api/axios';
import '../../styles/DeleteCommonStyle.css';

const DeleteFacility = ({ facility, onClose, onSuccess }) => {
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Handle delete action
const handleDelete = async () => {
setLoading(true);
setError(null);

try {
    await axiosApi.delete(`/facilities/${facility.id}`);
    onSuccess(); // Trigger success action (e.g., refresh the list)
} catch (err) {
    setError(err.response?.data?.message || 'Failed to delete facility');
} finally {
    setLoading(false);
}
};

return (
<div className="delete-component-container">
    <div className="delete-component-header">
    <h3 className="delete-component-title">Delete Facility</h3>
    <button
        onClick={onClose}
        className="delete-component-close-btn"
    >
        ✕
    </button>
    </div>
    <div className="space-y-4">
    {error && <div className="delete-component-error">{error}</div>}
    <p className="delete-component-message">
        Are you sure you want to delete {facility?.name}? This action cannot be undone.
    </p>
    <div className="delete-component-actions">
        <button
        type="button"
        onClick={onClose}
        className="delete-component-cancel-btn"
        >
        Cancel
        </button>
        <button
        onClick={handleDelete}
        disabled={loading}
        className="delete-component-delete-btn"
        >
        {loading ? 'Deleting...' : 'Delete'}
        </button>
    </div>
    </div>
</div>
);
};

export default DeleteFacility;