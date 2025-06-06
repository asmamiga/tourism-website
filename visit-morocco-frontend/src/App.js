import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
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
            <Route path="/itinerary" element={<ItineraryPlannerPage />} />
            <Route path="/community" element={<CommunityForumPage />} />
            <Route path="/stories" element={<TravelStoriesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </AuthProvider>
  );
}

export default App;
