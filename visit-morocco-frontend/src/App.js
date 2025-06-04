import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { ThemeProvider } from './flight/context/ThemeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import BusinessDirectoryPage from './pages/BusinessDirectoryPage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import AttractionsPage from './pages/AttractionsPage';
import AttractionDetailPage from './pages/AttractionDetailPage';
import ItineraryPlannerPage from './pages/ItineraryPlannerPage';
import CommunityForumPage from './pages/CommunityForumPage';
import TravelStoriesPage from './pages/TravelStoriesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Flight Booking Components
import BookingLayout from './flight/components/layouts/BookingLayout';
import AdminLayout from './flight/components/layouts/AdminLayout';
import FlightLogin from './flight/components/admin/login/login';
import FlightDashboard from './flight/components/admin/dashboard/dashboard';
import AirlineList from './flight/components/admin/admin-airline/airlineList/airlineList';
import EditAirline from './flight/components/admin/admin-airline/edit-airline/edit-airline';
import AirportList from './flight/components/admin/admin-airport/airportList/airportList';
import EditAirport from './flight/components/admin/admin-airport/edit-airport/edit-airport';
import FacilityList from './flight/components/admin/admin-facilities/facilityList/facilityList';
import EditFacility from './flight/components/admin/admin-facilities/edit-facility/edit-facility';
import FlightList from './flight/components/admin/admin-flight/flightList/flightList';
import EditFlight from './flight/components/admin/admin-flight/edit-flight/edit-flight';
import PromoCodeList from './flight/components/admin/admin-promo-code/promoCodeList/promoCodeList';
import EditPromoCode from './flight/components/admin/admin-promo-code/edit-promo-code/edit-promo-code';
import TransactionList from './flight/components/admin/admin-transaction/transactionsList/transactionsList';
import EditTransaction from './flight/components/admin/admin-transaction/edit-transaction/edit-transaction';
import AdminProfileEdit from './flight/components/admin/admin-profile/AdminProfileEdit';

// Booking Flow Components
import SearchFlights from './flight/components/SearchFlights';
import FlightDetails from './flight/components/FlightDetails';
import BookingConfirmation from './flight/components/BookingConfirmation';
import PaymentProcessor from './flight/components/PaymentProcessor';

// Import styles
import './flight/App.css';
import './flight/styles/theme.css';
import './flight/components/admin/styles/adminTheme.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bg="brand.light"
      >
        {/* You can replace this with a proper loading animation */}
        <Box
          width="50px"
          height="50px"
          borderRadius="50%"
          border="3px solid"
          borderColor="brand.primary"
          borderTopColor="transparent"
          animation="spin 1s linear infinite"
          sx={{
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
      </Box>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Box minH="100vh" display="flex" flexDirection="column">
          <Header />
          <Box as="main" flex="1">
            <Routes>
              {/* Main App Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/businesses" element={<BusinessDirectoryPage />} />
              <Route path="/businesses/:id" element={<BusinessDetailPage />} />
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/guides/:id" element={<GuideDetailPage />} />
              <Route path="/attractions" element={<AttractionsPage />} />
              <Route path="/attractions/:id" element={<AttractionDetailPage />} />
              <Route path="/itinerary-planner" element={
                <ProtectedRoute>
                  <ItineraryPlannerPage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/community-forum" element={<CommunityForumPage />} />
              <Route path="/travel-stories" element={<TravelStoriesPage />} />
              
              {/* Flight Booking Routes */}
              <Route path="/flights" element={<BookingLayout><SearchFlights /></BookingLayout>} />
              <Route path="/flights/search" element={<BookingLayout><SearchFlights /></BookingLayout>} />
              <Route path="/flights/:id" element={<BookingLayout><FlightDetails /></BookingLayout>} />
              <Route path="/flights/booking/confirm" element={<BookingLayout><BookingConfirmation /></BookingLayout>} />
              <Route path="/flights/booking/payment" element={<BookingLayout><PaymentProcessor /></BookingLayout>} />
              
              {/* Flight Admin Routes */}
              <Route path="/flights/admin/login" element={
                // isFlightAuth ? 
                // <Navigate to="/flights/admin/dashboard" replace /> : 
                <FlightLogin />
              } />
              
              <Route path="/flights/admin" element={
                // isFlightAuth ? 
                // <Navigate to="/flights/admin/dashboard" replace /> : 
                <Navigate to="/flights/admin/login" replace />
              } />
              
              <Route path="/flights/admin/dashboard" element={
                // <FlightAdminRoute element={<FlightDashboard onLogout={handleFlightLogout} />} />
                <AdminLayout><FlightDashboard /></AdminLayout>
              } />
              
              <Route path="/flights/admin/airlines" element={
                // <FlightAdminRoute element={<AirlineList onLogout={handleFlightLogout} />} />
                <AdminLayout><AirlineList /></AdminLayout>
              } />
              
              <Route path="/flights/admin/airlines/:id" element={
                // <FlightAdminRoute element={<EditAirline onLogout={handleFlightLogout} />} />
                <AdminLayout><EditAirline /></AdminLayout>
              } />
              
              <Route path="/flights/admin/airports" element={
                // <FlightAdminRoute element={<AirportList onLogout={handleFlightLogout} />} />
                <AdminLayout><AirportList /></AdminLayout>
              } />
              
              <Route path="/flights/admin/airports/:id" element={
                // <FlightAdminRoute element={<EditAirport onLogout={handleFlightLogout} />} />
                <AdminLayout><EditAirport /></AdminLayout>
              } />
              
              <Route path="/flights/admin/facilities" element={
                // <FlightAdminRoute element={<FacilityList onLogout={handleFlightLogout} />} />
                <AdminLayout><FacilityList /></AdminLayout>
              } />
              
              <Route path="/flights/admin/facilities/:id" element={
                // <FlightAdminRoute element={<EditFacility onLogout={handleFlightLogout} />} />
                <AdminLayout><EditFacility /></AdminLayout>
              } />
              
              <Route path="/flights/admin/flights" element={
                // <FlightAdminRoute element={<FlightList onLogout={handleFlightLogout} />} />
                <AdminLayout><FlightList /></AdminLayout>
              } />
              
              <Route path="/flights/admin/flights/:id" element={
                // <FlightAdminRoute element={<EditFlight onLogout={handleFlightLogout} />} />
                <AdminLayout><EditFlight /></AdminLayout>
              } />
              
              <Route path="/flights/admin/promo-codes" element={
                // <FlightAdminRoute element={<PromoCodeList onLogout={handleFlightLogout} />} />
                <AdminLayout><PromoCodeList /></AdminLayout>
              } />
              
              <Route path="/flights/admin/promo-codes/:id" element={
                // <FlightAdminRoute element={<EditPromoCode onLogout={handleFlightLogout} />} />
                <AdminLayout><EditPromoCode /></AdminLayout>
              } />
              
              <Route path="/flights/admin/transactions" element={
                // <FlightAdminRoute element={<TransactionList onLogout={handleFlightLogout} />} />
                <AdminLayout><TransactionList /></AdminLayout>
              } />
              
              <Route path="/flights/admin/transactions/:id" element={
                // <FlightAdminRoute element={<EditTransaction onLogout={handleFlightLogout} />} />
                <AdminLayout><EditTransaction /></AdminLayout>
              } />
              
              <Route path="/flights/admin/profile" element={
                // <FlightAdminRoute element={<AdminProfileEdit onLogout={handleFlightLogout} />} />
                <AdminLayout><AdminProfileEdit /></AdminLayout>
              } />
              
              {/* Redirect to flights home if no route matches */}
              <Route path="/flights/*" element={<Navigate to="/flights" replace />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
