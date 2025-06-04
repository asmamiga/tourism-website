import React, { useState } from 'react';
import axiosApi from '../../../../api/axios';
import '../../styles/CreateCommonStyle.css';

const CreatePromoCode = ({ onClose, onSuccess }) => {
const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount: 0,
    valid_until: '',
    is_used: false,
});
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
    ...formData,
    [name]: type === 'checkbox' ? checked : value,
    });
};

const handleSubmit = async (e, createAnother = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
    await axiosApi.post('/promo-codes', formData);

    if (createAnother) {
        // Reset form for another entry
        setFormData({
        code: '',
        discount_type: 'percentage',
        discount: 0,
        valid_until: '',
        is_used: false,
        });
    } else {
        onSuccess(); // Close the form and trigger success action
    }
    } catch (err) {
    setError(err.response?.data?.message || 'Failed to create promo code');
    } finally {
    setLoading(false);
    }
};

return (
    <div className="create-component-container">
    <div className="create-component-header">
        <h3>Create New Promo Code</h3>
        <button onClick={onClose} className="close-button">
        ✕
        </button>
    </div>
    <form onSubmit={(e) => handleSubmit(e, false)} className="create-component-form">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
        <label>Code</label>
        <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
        />
        </div>
        <div className="form-group">
        <label>Discount Type</label>
        <select
            name="discount_type"
            value={formData.discount_type}
            onChange={handleChange}
            required
        >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
        </select>
        </div>
        <div className="form-group">
        <label>Discount</label>
        <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            required
        />
        </div>
        <div className="form-group">
        <label>Valid Until</label>
        <input
            type="date"
            name="valid_until"
            value={formData.valid_until}
            onChange={handleChange}
            required
        />
        </div>
        <div className="form-group">
        <label className="switch">
            <input
            type="checkbox"
            name="is_used"
            checked={formData.is_used}
            onChange={handleChange}
            />
            <span className="slider round"></span>
        </label>
        <span className="switch-label">Is Used</span>
        </div>
        <div className="form-actions">
        <button type="button" onClick={onClose} className="cancel-button">
            Cancel
        </button>
        <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="create-another-button"
        >
            {loading ? 'Creating...' : 'Create and Create Another'}
        </button>
        <button
            type="submit"
            disabled={loading}
            className="submit-button"
        >
            {loading ? 'Creating...' : 'Create'}
        </button>
        </div>
    </form>
    </div>
);
};

export default CreatePromoCode;