import React, { useState } from 'react';
import PaymentProcessor from './PaymentProcessor';
import BookingConfirmation from './BookingConfirmation';

const BookingFlow = () => {
  const [booking, setBooking] = useState(/* your initial booking data */);
  const [showPayment, setShowPayment] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  
  const handlePaymentComplete = (paymentData) => {
    console.log("Payment completed, data:", paymentData);
    
    // Save the payment result
    setPaymentResult(paymentData);
    
    // Hide payment, show confirmation
    setShowPayment(false);
    setShowConfirmation(true);
  };
  
  return (
    <div>
      {showPayment && (
        <PaymentProcessor 
          amount={booking.grandtotal} 
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
      
      {showConfirmation && (
        <BookingConfirmation
          booking={booking}
          paymentResult={paymentResult}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default BookingFlow;