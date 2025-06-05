import React, { useState } from 'react';
import axiosApi from '../../../../api/axios';
import '../../styles/CreateCommonStyle.css';


const CreateAirline = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoError, setLogoError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setPreviewUrl('');
    setLogoError(null);
  };

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e, createAnother = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLogoError(null); // Reset logo error
  
    // Validate if logo is present
    if (!logoFile) {
      setLogoError('Logo is required'); // Set logo-specific error
      setLoading(false); // Stop loading state
      return; // Stop the submission
    }
  
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('code', formData.code);
      formPayload.append('logo', logoFile); // Append logo file
  
      await axiosApi.post('/airlines', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (createAnother) {
        // Reset form for another entry
        setFormData({ name: '', code: '' });
        setLogoFile(null);
        setPreviewUrl('');
      } else {
        onSuccess(); // Close the form and trigger success action
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create airline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-component-container">
      <div className="create-component-header">
        <h3>Create New Airline</h3>
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

export default CreateAirline;