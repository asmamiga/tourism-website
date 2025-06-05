import React, { useState } from 'react';
import axiosApi from '../../../../api/axios';
import '../../styles/DeleteCommonStyle.css';

const DeleteTransaction = ({ transaction, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle delete action
    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            await axiosApi.delete(`/transactions/${transaction.id}`);
            onSuccess(); // Trigger success action (e.g., refresh the list)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="delete-component-container">
            <div className="delete-component-header">
                <h3 className="delete-component-title">Delete Transaction</h3>
                <button
                    onClick={onClose}
                    className="delete-component-close-btn"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-4">
                {error && <div className="error-message">{error}</div>}
                <p className="confirmation-message">
                            Are you sure you want to delete the transaction with code: <strong>{transaction.code}</strong>?
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

export default DeleteTransaction;