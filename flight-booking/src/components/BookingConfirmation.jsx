import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Printer, Plane, User, CreditCard } from 'lucide-react';
import '../styles/BookingConfirmation.css';
import logowname from '../assets/logowname.png';

const BookingConfirmation = ({ booking, paymentResult, onClose }) => {
  const printRef = useRef();
  const [discountData, setDiscountData] = useState(null);
  
  // Check for discount data in sessionStorage on component mount
  useEffect(() => {
    const storedPaymentData = sessionStorage.getItem('latestPaymentData');
    if (storedPaymentData) {
      try {
        const parsedData = JSON.parse(storedPaymentData);
        setDiscountData(parsedData);
        console.log("Loaded payment data from sessionStorage:", parsedData);
      } catch (e) {
        console.error("Error parsing stored payment data:", e);
      }
    }
  }, []);
  
  // Enhanced useMemo to properly handle all data formats
  const bookingData = useMemo(() => {
    // Start with the booking data
    let processedData = { ...(booking?.data || booking || {}) };
    
    // Layer 1: Try to use directly provided paymentResult prop if available
    if (paymentResult) {
      processedData = {
        ...processedData,
        ...paymentResult
      };
    }
    
    // Layer 2: Check if the discount data is available from sessionStorage
    if (discountData) {
      processedData = {
        ...processedData,
        promo_code: discountData.promo_code,
        discount_type: discountData.discount_type,
        discount_value: discountData.discount_value,
        paid_amount: discountData.paid_amount,
        original_amount: discountData.original_amount || processedData.grandtotal,
        // Ensure we have the discount information
        applied_promo: {
          code: discountData.promo_code,
          type: discountData.discount_type,
          value: discountData.discount_value
        }
      };
    }
    
    // If booking has payment details nested, extract them
    if (booking?.paymentData) {
      processedData = {
        ...processedData,
        ...booking.paymentData
      };
    }
    
    // Ensure all required fields have default values
    processedData.original_amount = processedData.original_amount || 
                                    processedData.subtotal || 
                                    processedData.grandtotal || 0;
                                    
    processedData.paid_amount = processedData.paid_amount || 
                                processedData.discounted_total || 
                                processedData.final_amount || 
                                processedData.grandtotal || 0;
    
    return processedData;
  }, [booking, paymentResult, discountData]);
  
  // Replace your current handlePrint function with this one
const handlePrint = () => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  // Generate the HTML content for printing
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Booking Confirmation</title>
      <style>
        /* Reset styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          color: #333;
          background: white;
          padding: 1cm;
          max-width: 21cm;
          margin: 0 auto;
        }
        
        /* Header styles */
        .print-header {
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 15px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 5px;
        }
        
        .confirmation-title {
          font-size: 20px;
          font-weight: bold;
        }
        
        /* Booking reference section */
        .booking-ref {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-bottom: 20px;
          background-color: #f9fafb;
        }
        
        .ref-number {
          font-size: 20px;
          font-weight: bold;
        }
        
        .status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-weight: bold;
          color: white;
        }
        
        .status.paid {
          background-color: #059669;
        }
        
        .status.pending {
          background-color: #d97706;
        }
        
        /* Section styling */
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          padding-top: 10px;
        }
        
        .divider {
          border-top: 1px dashed #cbd5e1;
          margin: 20px 0;
        }
        
        /* Info grid */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .info-label {
          font-size: 12px;
          color: #6b7280;
          display: block;
        }
        
        .info-value {
          font-size: 14px;
          font-weight: 600;
        }
        
        /* Passenger */
        .passenger {
          border: 1px solid #e5e7eb;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        
        /* Total section */
        .total-section {
          background-color: #3b82f6;
          color: white;
          padding: 15px;
          border-radius: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }
        
        .total-label {
          font-weight: bold;
        }
        
        .total-value {
          font-size: 20px;
          font-weight: bold;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      </style>
    </head>
    <body onload="window.print(); window.setTimeout(function() { window.close(); }, 500);">
      <div class="print-header">
        <div class="logo">Cloud Tickets</div>
        <div class="confirmation-title">Booking Confirmation</div>
      </div>
      
      <div class="booking-ref">
        <div>
          <div class="info-label">Booking Reference</div>
          <div class="ref-number">${bookingReference}</div>
          <div class="status ${paymentStatus}">${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</div>
        </div>
        <div>
          <div class="info-label">Booking Date</div>
          <div class="info-value">${formatDate(bookingData.created_at || new Date())}</div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="section">
        <div class="section-title">Flight Details</div>
        <div class="info-grid">
          <div>
            <div class="info-label">Flight Number</div>
            <div class="info-value">${flightNumber}</div>
          </div>
          <div>
            <div class="info-label">Class</div>
            <div class="info-value">${classType}</div>
          </div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="section">
        <div class="section-title">Passenger Details</div>
        ${passengers.map(passenger => `
          <div class="passenger">
            <div class="info-grid">
              <div>
                <div class="info-label">Passenger Name</div>
                <div class="info-value">${passenger.name || 'N/A'}</div>
              </div>
              <div>
                <div class="info-label">Date of Birth</div>
                <div class="info-value">${formatDate(passenger.date_of_birth)}</div>
              </div>
              <div>
                <div class="info-label">Seat Number</div>
                <div class="info-value">${formatSeatNumber(passenger.flight_seat)}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      ${hasDiscount ? `
        <div class="divider"></div>
        
        <div class="section">
          <div class="section-title">Price Details</div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding: 8px 0;">
            <span>Original Price</span>
            <span>${formatCurrency(originalAmount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding: 8px 0; color: #dc2626;">
            <span>
              Discount ${promoCode ? `(${promoCode})` : ''} 
              ${discountType === 'percentage' ? ` - ${discountValue}%` : ''}
              ${discountType === 'fixed' ? ` - Fixed Amount` : ''}
            </span>
            <span>-${formatCurrency(discountAmount)}</span>
          </div>
        </div>
      ` : ''}
      
      <div class="total-section">
        <div class="total-label">Total Amount</div>
        <div class="total-value">${formatCurrency(finalAmount)}</div>
      </div>
    </body>
    </html>
  `;
  
  // Write the content to the new window and trigger print
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
    return `$${Number(amount).toFixed(2)}`;
  };

  const formatSeatNumber = (seat) => {
    if (!seat) return 'Not assigned';
    return `${seat.row || ''}${seat.column || ''}`;
  };

  // Extract booking details
  const bookingReference = bookingData.code || 'Pending';
  const flightNumber = bookingData.flight?.flight_number || 'N/A';
  const classType = bookingData.flight_class?.class_type || 'N/A';
  const passengers = bookingData.passengers || [];
  
  // Get the original total amount
  const originalAmount = bookingData.original_amount || bookingData.subtotal || bookingData.grandtotal || 0;
  
  // Get the final amount after discount
  const finalAmount = bookingData.paid_amount || 
                      bookingData.discounted_total || 
                      bookingData.final_amount || 
                      bookingData.total_amount || 
                      originalAmount;
  
  // Get promo code information
  const promoCode = bookingData.promo_code || 
                    (bookingData.applied_promo ? bookingData.applied_promo.code : null);
                    
  const discountType = bookingData.discount_type || 
                       (bookingData.applied_promo ? bookingData.applied_promo.type : null);
                       
  const discountValue = bookingData.discount_value || 
                        (bookingData.applied_promo ? bookingData.applied_promo.value : 0);
  
  // Calculate discount amount for display
  const discountAmount = originalAmount - finalAmount;
  
  // Payment status
  const paymentStatus = bookingData.payment_status || 'pending';
  
  // Only show discount if there is a non-zero discount amount AND we have a promo code
  const hasDiscount = discountAmount > 0 && (promoCode || bookingData.applied_promo);

  return (
    <div className="booking-confirmation-modal">
      <div className="confirmation-container">
        <header className="confirmation-header">
          <div className="logo-container">
            <img src={logowname} alt="Cloud Tickets Logo" className="logo-image" />
            <h2 className="confirmation-title">Booking Confirmation</h2>
          </div>
          <div className="action-buttons">
            <button
              onClick={handlePrint}
              className="btn btn-print"
            >
              <Printer size={18} style={{ marginRight: '8px' }}/>
              Print Ticket
            </button>
            <button
              onClick={onClose}
              className="book-close-button"
            >
              ×
            </button>
          </div>
        </header>

        <div id="printable-content" ref={printRef} className="confirmation-content">
          <section className="booking-reference">
            <div className="reference-details">
              <h3 className="reference-label">Booking Reference</h3>
              <p className="reference-number">{bookingReference}</p>
              <span className={`status-badge ${paymentStatus}`}>
                Payment Status: <span className="status-text">{paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</span>
              </span>
            </div>
            <div className="booking-date">
              <h3 className="date-label">Booking Date</h3>
              <p className="date-value">{formatDate(bookingData.created_at || new Date())}</p>
            </div>
          </section>
          
          <div className="ticket-division"></div>
          
          <section className="flight-details section-container">
            <h3 className="section-title">
              <Plane size={20} style={{ marginRight: '8px' }} />
              Flight Details
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Flight Number</span>
                <p className="info-value">{flightNumber}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Class</span>
                <p className="info-value">{classType}</p>
              </div>
            </div>
          </section>
          
          <div className="ticket-division"></div>

          <section className="flight-details section-container">
            <h3 className="section-title">
              <User size={20} style={{ marginRight: '8px' }} />
              Passenger Details
            </h3>
            <div className="passenger-list">
              {passengers.map((passenger, index) => (
                <div key={index} className="passenger-item">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Passenger Name</span>
                      <p className="info-value">{passenger.name || 'N/A'}</p>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date of Birth</span>
                      <p className="info-value">{formatDate(passenger.date_of_birth)}</p>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Seat Number</span>
                      <p className="info-value">{formatSeatNumber(passenger.flight_seat)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <div className="ticket-division"></div>

          {/* Show price breakdown if discount was applied */}
          {hasDiscount && (
            <section className="price-breakdown">
              <h3 className="section-title">
                <CreditCard size={20} style={{ marginRight: '8px' }} />
                Price Details
              </h3>
              <div className="price-item">
                <span className="price-label">Original Price</span>
                <span className="price-value">{formatCurrency(originalAmount)}</span>
              </div>
              <div className="price-item discount">
                <span className="price-label">
                  Discount {promoCode && `(${promoCode})`} 
                  {discountType === 'percentage' && ` - ${discountValue}%`}
                  {discountType === 'fixed' && ` - Fixed Amount`}
                </span>
                <span className="price-value">-{formatCurrency(discountAmount)}</span>
              </div>
            </section>
          )}

          <section className="total-amount">
            <h3 className="total-label-footer">Total Amount</h3>
            <p className="total-value">{formatCurrency(finalAmount)}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;