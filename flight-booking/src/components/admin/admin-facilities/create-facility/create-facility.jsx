import React, { useState } from 'react';
import axiosApi from '../../../../api/axios';
import '../../styles/CreateCommonStyle.css';
 // Import the CSS file

const CreateFacility = ({ onClose, onSuccess }) => {
const [formData, setFormData] = useState({
    name: '',
    description: '',
});
const [imageFile, setImageFile] = useState(null);
const [previewUrl, setPreviewUrl] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [imageError, setImageError] = useState(null);
const [isDragging, setIsDragging] = useState(false);

// Handle image file selection
const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
    setImageFile(file);
    setImageError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
        setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    }
};

// Remove the selected image
const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setImageError(null);
};

// Handle drag-over event
const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
};

// Handle drag-leave event
const handleDragLeave = () => {
    setIsDragging(false);
};

// Handle drop event for image upload
const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
        setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    }
};

// Handle form submission
const handleSubmit = async (e, createAnother = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageError(null);

    if (!imageFile) {
    setImageError('Image is required');
    setLoading(false);
    return;
    }

    try {
    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('description', formData.description);
    formPayload.append('image', imageFile);

    await axiosApi.post('/facilities', formPayload, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    });

    if (createAnother) {
        // Reset form for another entry
        setFormData({ name: '', description: '' });
        setImageFile(null);
        setPreviewUrl('');
    } else {
        onSuccess(); // Close the form and trigger success action
    }
    } catch (err) {
    setError(err.response?.data?.message || 'Failed to create facility');
    } finally {
    setLoading(false);
    }
};

return (
    <div className="create-component-container">
    <div className="create-component-header">
        <h3>Create New Facility</h3>
        <button onClick={onClose} className="close-button">
        ✕
        </button>
    </div>
    <form onSubmit={(e) => handleSubmit(e, false)} className="create-component-form">
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
        <label>Description</label>
        <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default CreateFacility;