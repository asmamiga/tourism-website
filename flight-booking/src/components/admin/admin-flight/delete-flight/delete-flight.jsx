import React, { useState } from 'react';
import axiosApi from '../../../../api/axios';
import Loading from '../../loading/Loading';
import '../../styles/DeleteCommonStyle.css';

const DeleteFlight = ({ flight, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            await axiosApi.delete(`/flights/${flight.id}`);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete flight');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="delete-component-container">
            <div className="delete-component-header">
                <h3 className="delete-component-title">Delete Flight</h3>
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
                    Are you sure you want to delete flight {flight?.flight_number}? <br /> This action cannot be undone.
                </p>
                <div className="delete-component-actions">
                    <button
                        onClick={onClose}
                        className="delete-component-cancel-btn"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="delete-component-delete-btn"
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteFlight;
