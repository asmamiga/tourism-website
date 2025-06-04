import React, { useState } from 'react';
import { Tag, CheckSquare, AlertCircle } from 'lucide-react';
import axiosApi from '../api/axios';

const PaymentErrors = {
  INVALID_CARD: 'INVALID_CARD',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  INVALID_PROMO: 'INVALID_PROMO'
};

const PromoCodeSection = ({ onApply, appliedPromo, disabled }) => {
  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!promoCode.trim()) return;
    
    setApplying(true);
    setError('');
    
    try {
      // Get all promo codes (using the working index endpoint)
      const response = await axiosApi.get('/promo-codes');
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        // Find the matching promo code
        const matchingPromo = response.data.find(
          promo => promo.code.toLowerCase() === promoCode.trim().toLowerCase()
        );
        
        if (!matchingPromo) {
          setError('Invalid promo code');
          onApply({ error: PaymentErrors.INVALID_PROMO });
          return;
        }
        
        // Check if the promo code is still valid
        const expiryDate = new Date(matchingPromo.valid_until);
        const now = new Date();
        
        if (expiryDate < now) {
          setError('This promo code has expired');
          onApply({ error: PaymentErrors.INVALID_PROMO });
          return;
        }
        
        if (matchingPromo.is_used) {
          setError('This promo code has already been used');
          onApply({ error: PaymentErrors.INVALID_PROMO });
          return;
        }
        
        // Apply the promo code
        const discount = {
          code: matchingPromo.code,
          type: matchingPromo.discount_type,
          value: matchingPromo.discount
        };
        
        onApply(discount);
        setPromoCode('');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Promo code error:', err);
      setError('Error checking promo code. Please try again.');
      onApply({ error: PaymentErrors.INVALID_PROMO });
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = () => {
    onApply(null);
    setPromoCode('');
    setError('');
  };

  return (
    <div className="promo-code-container">
      <h4 className="promo-code-title">
        <Tag className="promo-icon" />
        Promo Code
      </h4>
      
      {appliedPromo && !appliedPromo.error ? (
        <div className="applied-promo">
          <div className="applied-promo-info">
            <CheckSquare className="promo-success-icon" />
            <div>
              <span className="applied-promo-code">{appliedPromo.code}</span>
              <span className="applied-promo-discount">
                {appliedPromo.type === 'percentage' 
                  ? `${appliedPromo.value}% off` 
                  : `$${appliedPromo.value} off`}
              </span>
            </div>
          </div>
          <button 
            onClick={handleRemove}
            className="remove-promo-button"
            disabled={disabled}
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className="promo-code-input-group">
            <input
              type="text"
              className="promo-code-input"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={disabled || applying}
            />
            <button
              onClick={handleApply}
              className="apply-promo-button"
              disabled={!promoCode.trim() || disabled || applying}
            >
              {applying ? 'Applying...' : 'Apply'}
            </button>
          </div>
          
          {error && (
            <div className="promo-error-message">
              <AlertCircle className="error-icon" size={16} />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PromoCodeSection;