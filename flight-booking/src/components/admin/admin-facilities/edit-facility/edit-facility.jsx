import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosApi from '../../../../api/axios';
import '../../styles/EditCommonStyle.css';


const EditFacility = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Fetch facility data
  const fetchFacility = useCallback(async () => {
    try {
      const response = await axiosApi.get(`/facilities/${id}`);
      const facilityData = response.data || response;

      setFormData({
        name: facilityData.name || '',
        description: facilityData.description || '',
      });

      if (facilityData.image) {
        setPreviewUrl(facilityData.image);
      } else {
        setPreviewUrl('');
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch facility: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFacility();
  }, [fetchFacility]);

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
      formPayload.append('description', formData.description);

      if (imageFile === 'remove') {
        formPayload.append('image', 'null');
      } else if (imageFile) {
        formPayload.append('image', imageFile);
      }

      await axiosApi.put(`/facilities/${id}`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/admin/facilities');
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update facility');
      setLoading(false);
    }
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="edit-component-container">
      <div className="edit-component-header">
        <h3>Edit Facility</h3>
        <button onClick={() => navigate('/admin/facilities')} className="close-button">
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
          <button type="button" onClick={() => navigate('/admin/facilities')} className="cancel-button">
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

export default EditFacility;