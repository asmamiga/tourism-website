import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash, Plus } from 'lucide-react';
import '../../styles/ListCommonStyle.css';
import axiosApi from '../../../../api/axios';
import CreatePromoCode from '../create-promo-code/create-promo-code';
import DeletePromoCode from '../delete-promo-code/delete-promo-code';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs';
import Loading from '../../loading/Loading';
import Pagination from '../../pagination/Pagination';

const PromoCodeList = () => {
const navigate = useNavigate();
const [promoCodes, setPromoCodes] = useState([]);
const [allPromoCodes, setAllPromoCodes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [currentView, setCurrentView] = useState('list');
const [selectedPromoCode, setSelectedPromoCode] = useState(null);
const [selectedPromoCodes, setSelectedPromoCodes] = useState([]);

// Pagination state
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [totalItems, setTotalItems] = useState(0);

useEffect(() => {
    fetchPromoCodes();
}, []);

// Update pagination whenever current page or items per page changes
useEffect(() => {
    if (allPromoCodes.length > 0) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPromoCodes(allPromoCodes.slice(startIndex, endIndex));
    }
}, [currentPage, itemsPerPage, allPromoCodes]);

const fetchPromoCodes = async () => {
    try {
    const response = await axiosApi.get('/promo-codes');
    if (Array.isArray(response.data)) {
        // Store all promo codes
        setAllPromoCodes(response.data);
        setTotalItems(response.data.length);
        
        // Set initial paginated data
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPromoCodes(response.data.slice(startIndex, endIndex));
    } else {
        setError('Invalid data format received');
    }
    setLoading(false);
    } catch (err) {
    setError('Failed to fetch promo codes: ' + (err.response?.data?.message || err.message));
    setLoading(false);
    }
};

const handleEdit = (promoCode) => {
    navigate(`/admin/promo-codes/${promoCode.id}/edit`);
};

const handleDelete = (promoCode) => {
    setSelectedPromoCode(promoCode);
    setCurrentView('delete');
};

const handleMultiDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete the selected promo codes?');

    if (isConfirmed) {
    try {
        const deletePromises = selectedPromoCodes.map(id =>
        axiosApi.delete(`/promo-codes/${id}`)
        );
        await Promise.all(deletePromises);
        fetchPromoCodes();
        setSelectedPromoCodes([]);
    } catch (err) {
        setError('Failed to delete promo codes: ' + (err.response?.data?.message || err.message));
    }
    }
};

const handleCheckboxChange = (id) => {
    setSelectedPromoCodes((prevSelected) =>
    prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
};

const handleSelectAll = () => {
    if (selectedPromoCodes.length === promoCodes.length) {
    setSelectedPromoCodes([]);
    } else {
    // Only select visible promo codes (current page)
    setSelectedPromoCodes(promoCodes.map((promoCode) => promoCode.id));
    }
};

const handleSuccess = () => {
    fetchPromoCodes();
    setCurrentView('list');
    setSelectedPromoCode(null);
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
        <h1>Promo Codes</h1>
        {currentView === 'list' && (
        <div className="header-actions">
            <button
            onClick={() => setCurrentView('create')}
            className="add-component-button"
            >
            <Plus className="w-4 h-4" />
            Add Promo Code
            </button>
            {selectedPromoCodes.length > 0 && (
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
        <CreatePromoCode
        onClose={() => setCurrentView('list')}
        onSuccess={handleSuccess}
        />
    )}

    {currentView === 'delete' && selectedPromoCode && (
        <DeletePromoCode
        promoCode={selectedPromoCode}
        onClose={() => setCurrentView('list')}
        onSuccess={handleSuccess}
        />
    )}

    {currentView === 'list' && (
        !promoCodes || promoCodes.length === 0 ? (
        <div className="loading-message">No promo codes found</div>
        ) : (
        <div className="component-table-container">
            <table className="component-table">
            <thead>
                <tr>
                <th>
                    <input
                    type="checkbox"
                    checked={selectedPromoCodes.length === promoCodes.length}
                    onChange={handleSelectAll}
                    />
                </th>
                <th>Code</th>
                <th>Discount Type</th>
                <th>Discount</th>
                <th>Valid Until</th>
                <th>Is Used</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {promoCodes.map((promoCode) => (
                <tr key={promoCode.id}>
                    <td>
                    <input
                        type="checkbox"
                        checked={selectedPromoCodes.includes(promoCode.id)}
                        onChange={() => handleCheckboxChange(promoCode.id)}
                    />
                    </td>
                    <td>{promoCode.code}</td>
                    <td>{promoCode.discount_type}</td>
                    <td>{promoCode.discount}</td>
                    <td>{new Date(promoCode.valid_until).toLocaleDateString()}</td>
                    <td>{promoCode.is_used ? 'Yes' : 'No'}</td>
                    <td>
                    <div className="action-buttons">
                        <button
                        onClick={() => handleEdit(promoCode)}
                        className="edit-button"
                        >
                        <Pencil className="w-4 h-4" /> <span>Edit</span>
                        </button>
                        <button
                        onClick={() => handleDelete(promoCode)}
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

export default PromoCodeList;