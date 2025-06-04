import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosApi from '../../../../api/axios';
import '../../styles/EditCommonStyle.css';


const EditAirline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Fetch airline data
  const fetchAirline = useCallback(async () => {
    try {
      const response = await axiosApi.get(`/airlines/${id}`);
      const airlineData = response.data || response;

      setFormData({
        name: airlineData.name || '',
        code: airlineData.code || '',
      });

      if (airlineData.logo) {
        setPreviewUrl(airlineData.logo);
      } else {
        setPreviewUrl('');
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch airline: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAirline();
  }, [fetchAirline]);

  // Handle logo file change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoError(''); // Clear logo error when a new file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle logo removal
  const handleRemoveLogo = () => {
    setLogoFile('remove');
    setPreviewUrl('');
    setLogoError(''); // Clear logo error when logo is removed
  };

  // Handle drag and drop for logo
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
      setLogoFile(file);
      setLogoError(''); // Clear logo error when a new file is dropped
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
    setLogoError('');

    // Validate logo
    if (logoFile === 'remove' && !previewUrl) {
      setLogoError('Logo is required. Please upload a new logo.');
      setLoading(false);
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('code', formData.code);

      if (logoFile === 'remove') {
        formPayload.append('logo', 'null');
      } else if (logoFile) {
        formPayload.append('logo', logoFile);
      }

      await axiosApi.put(`/airlines/${id}`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/admin/airlines');
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update airline');
      setLoading(false);
    }
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="edit-component-container">
      <div className="edit-component-header">
        <h3>Edit Airline</h3>
        <button onClick={() => navigate('/admin/airlines')} className="close-button">
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
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </div>
        <div className="form-group file-input-group">
          <label>Logo</label>
          <div
            className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleLogoChange}
              accept="image/*"
              id="file-input"
              className="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              {previewUrl ? (
                <div className="logo-preview-container">
                  <img src={previewUrl} alt="Logo preview" className="logo-preview" />
                  <button type="button" onClick={handleRemoveLogo} className="remove-logo-button">
                    Remove
                  </button>
                </div>
              ) : (
                <span>
                  Drag & drop your logo here or <span className="browse-text">browse</span>
                </span>
              )}
            </label>
          </div>
          {logoError && <div className="error-message">{logoError}</div>}
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/airlines')} className="cancel-button">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAirline;