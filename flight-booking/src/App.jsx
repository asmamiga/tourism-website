import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import BookingLayout from "./components/layouts/BookingLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import Login from "./components/admin/login/login";
import Dashboard from "./components/admin/dashboard/dashboard";
import AirlineList from "./components/admin/admin-airline/airlineList/airlineList";
import EditAirline from "./components/admin/admin-airline/edit-airline/edit-airline";
import AirportList from "./components/admin/admin-airport/airportList/airportList";
import EditAirport from "./components/admin/admin-airport/edit-airport/edit-airport";
import FacilityList from "./components/admin/admin-facilities/facilityList/facilityList";
import EditFacility from "./components/admin/admin-facilities/edit-facility/edit-facility";
import FlightList from "./components/admin/admin-flight/flightList/flightList";
import EditFlight from "./components/admin/admin-flight/edit-flight/edit-flight";
import PromoCodeList from "./components/admin/admin-promo-code/promoCodeList/promoCodeList";
import EditPromoCode from "./components/admin/admin-promo-code/edit-promo-code/edit-promo-code";
import TransactionList from "./components/admin/admin-transaction/transactionsList/transactionsList";
import EditTransaction from "./components/admin/admin-transaction/edit-transaction/edit-transaction";
import "./App.css";
import "./styles/theme.css";
import "./components/admin/styles/adminTheme.css";
import AdminProfileEdit from "./components/admin/admin-profile/AdminProfileEdit";

// Path tracker component to save current path
const PathTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Only store admin paths
    if (location.pathname.startsWith('/admin') && location.pathname !== '/admin') {
      localStorage.setItem('lastAdminPath', location.pathname);
    }
  }, [location]);
  
  return null;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication on component mount
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    console.log('Logging in...');
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.clear();
    setIsAuthenticated(false);
  };

  // Function to get the last admin path or return default
  const getRedirectPath = () => {
    const savedPath = localStorage.getItem('lastAdminPath');
    return savedPath || '/admin/dashboard';
  };

  return (
    <ThemeProvider>
      <Router>
        {/* Add the path tracker component */}
        <PathTracker />
        <Routes>
          {/* Default Booking Routes */}
          <Route path="/" element={<BookingLayout />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            isAuthenticated ? (
              <Navigate to={getRedirectPath()} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } />
          
          <Route path="/admin/*" element={
            isAuthenticated ? (
              <AdminLayout onLogout={handleLogout}>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="profile" element={<AdminProfileEdit />} />
                  <Route path="airlines" element={<AirlineList />} />
                  <Route path="airlines/:id/edit" element={<EditAirline />} />
                  <Route path="airports" element={<AirportList />} />
                  <Route path="airports/:id/edit" element={<EditAirport />} />
                  <Route path="facilities" element={<FacilityList />} />
                  <Route path="facilities/:id/edit" element={<EditFacility />} />
                  <Route path="flights" element={<FlightList />} />
                  <Route path="flights/:id/edit" element={<EditFlight />} />
                  <Route path="promo-codes" element={<PromoCodeList />} />
                  <Route path="promo-codes/:id/edit" element={<EditPromoCode />} />
                  <Route path="transactions" element={<TransactionList />} />
                  <Route path="transactions/:id/edit" element={<EditTransaction />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/admin" replace />
            )
          } />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;