import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosApi from '../../../../api/axios';
import '../../styles/EditCommonStyle.css';


const EditAirport = () => {
const { id } = useParams();
const navigate = useNavigate();
const [formData, setFormData] = useState({
    name: '',
    iata_code: '',
    city: '',
    country: '',
});
const [imageFile, setImageFile] = useState(null);
const [previewUrl, setPreviewUrl] = useState('');
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [imageError, setImageError] = useState('');
const [isDragging, setIsDragging] = useState(false);

const fetchAirport = useCallback(async () => {
    try {
    const response = await axiosApi.get(`/airports/${id}`);
    const airportData = response.data || response;

    setFormData({
        name: airportData.name || '',
        iata_code: airportData.iata_code || '',
        city: airportData.city || '',
        country: airportData.country || '',
    });

    if (airportData.image) {
        setPreviewUrl(airportData.image);
    } else {
        setPreviewUrl('');
    }

    setLoading(false);
    } catch (err) {
    setError('Failed to fetch airport: ' + (err.response?.data?.message || err.message));
    setLoading(false);
    }
}, [id]);

useEffect(() => {
    fetchAirport();
}, [fetchAirport]);

// Handle image file change
const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
    setImageFile(file);
    setImageError(''); // Clear image error when a new file is selected
    const reader = new FileReader();
    reader.onloadend = () => {
        setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    }
};

// Handle image removal
const handleRemoveImage = () => {
    setImageFile('remove');
    setPreviewUrl('');
    setImageError(''); // Clear image error when image is removed
};

// Handle drag and drop for image
const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
};

const handleDragLeave = () => {
    setIsDragging(false);
};

const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
    setImageFile(file);
    setImageError(''); // Clear image error when a new file is dropped
    const reader = new FileReader();
    reader.onloadend = () => {
        setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    }
};

// Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setImageError('');

    // Validate image
    if (imageFile === 'remove' && !previewUrl) {
    setImageError('Image is required. Please upload a new image.');
    setLoading(false);
    return;
    }

    try {
    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('iata_code', formData.iata_code);
    formPayload.append('city', formData.city);
    formPayload.append('country', formData.country);

    if (imageFile === 'remove') {
        formPayload.append('image', 'null');
    } else if (imageFile) {
        formPayload.append('image', imageFile);
    }

    await axiosApi.put(`/airports/${id}`, formPayload, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    });

    navigate('/admin/airports');
    } catch (err) {
    console.error('Update error:', err);
    setError(err.response?.data?.message || 'Failed to update airport');
    setLoading(false);
    }
};

if (error) return <div className="error-message">{error}</div>;

return (
    <div className="edit-component-container">
    <div className="edit-component-header">
        <h3>Edit Airport</h3>
        <button onClick={() => navigate('/admin/airports')} className="close-button">
        ✕
        </button>
    </div>
    <form onSubmit={handleSubmit} className="edit-component-form">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
        <label>Name</label>
        <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
        />
        </div>
        <div className="form-group">
        <label>IATA Code</label>
        <input
            type="text"
            value={formData.iata_code}
            onChange={(e) => setFormData({ ...formData, iata_code: e.target.value })}
            required
        />
        </div>
        <div className="form-group">
        <label>City</label>
        <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
        />
        </div>
        <div className="form-group">
        <label>Country</label>
        <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
        />
        </div>
        <div className="form-group file-input-group">
        <label>Image</label>
        <div
            className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            id="file-input"
            className="file-input"
            />
            <label htmlFor="file-input" className="file-label">
            {previewUrl ? (
                <div className="image-preview-container">
                <img src={previewUrl} alt="Image preview" className="image-preview" />
                <button type="button" onClick={handleRemoveImage} className="remove-image-button">
                    Remove
                </button>
                </div>
            ) : (
                <span>
                Drag & drop your image here or <span className="browse-text">browse</span>
                </span>
            )}
            </label>
        </div>
        {imageError && <div className="error-message">{imageError}</div>}
        </div>
        <div className="form-actions">
        <button type="button" onClick={() => navigate('/admin/airports')} className="cancel-button">
            Cancel
        </button>
        <button
            type="submit"
            disabled={loading}
            className="submit-button"
        >
            {loading ? 'Saving...' : 'Save Changes'}
        </button>
        </div>
    </form>
    </div>
);
};

export default EditAirport;