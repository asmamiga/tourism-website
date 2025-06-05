import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import axiosApi from '../../../../api/axios';
import Loading from '../../loading/Loading';
import '../../styles/EditCommonStyle.css';

const EditTransaction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        flight_id: '',
        flight_class_id: '',
        name: '',
        email: '',
        phone: '',
        number_of_passengers: 1,
        promo_code_id: '',
        payment_status: 'pending',
        subtotal: 0,
        grandtotal: 0,
    });

    // Fetch transaction data
    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await axiosApi.get(`/transactions/${id}`);
                setFormData(response);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch transaction');
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedFormData = {
            ...formData,
            [name]: value
        };

        // Update calculations based on what changed
        if (name === 'number_of_passengers') {
            // When number of passengers changes, keep subtotal (price per person) the same
            // and update grandtotal
            updatedFormData.grandtotal = formData.subtotal * value;
        } else if (name === 'subtotal') {
            // When price per person changes, update the total price
            updatedFormData.grandtotal = value * formData.number_of_passengers;
        } else if (name === 'grandtotal') {
            // When total price changes, update price per person
            updatedFormData.subtotal = value / formData.number_of_passengers;
        }

        setFormData(updatedFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axiosApi.put(`/transactions/${id}`, formData);
            navigate('/admin/transactions');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update transaction');
            setLoading(false);
        }
    };

    if (loading) return <Loading />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="edit-component-container">
            <div className="edit-component-header">
                <h3 className="edit-component-title">Edit Transaction</h3>
                <button
                    onClick={() => navigate('/admin/transactions')}
                    className="close-button"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="edit-component-content">
                <div className="form-group">
                    <label htmlFor="code">Transaction Code</label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        disabled
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="name">Customer Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="number_of_passengers">Number of Passengers</label>
                    <input
                        type="number"
                        id="number_of_passengers"
                        name="number_of_passengers"
                        value={formData.number_of_passengers}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="payment_status">Payment Status</label>
                    <select
                        id="payment_status"
                        name="payment_status"
                        value={formData.payment_status}
                        onChange={handleChange}
                        required
                    >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="subtotal">Price Per Person</label>
                    <input
                        type="number"
                        id="subtotal"
                        name="subtotal"
                        value={formData.subtotal}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="grandtotal">Total Price</label>
                    <input
                        type="number"
                        id="grandtotal"
                        name="grandtotal"
                        value={formData.grandtotal}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/transactions')}
                        className="cancel-button"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTransaction;