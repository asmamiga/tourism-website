import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import BusinessDirectoryPage from './pages/BusinessDirectoryPage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import CreateBusinessPage from './pages/Business/CreateBusinessPage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import AttractionsPage from './pages/AttractionsPage';
import AllAttractionsPage from './pages/AllAttractionsPage';
import AttractionDetailPage from './pages/AttractionDetailPage';
import ItineraryPlannerPage from './pages/ItineraryPlannerPage';
import CommunityForumPage from './pages/CommunityForumPage';
import TravelStoriesPage from './pages/TravelStoriesPage';
import StoryDetailPage from './pages/StoryDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import BusinessDashboard from './pages/Dashboard/BusinessDashboard';
import GuideDashboard from './pages/Dashboard/GuideDashboard';
import TouristDashboard from './pages/Dashboard/TouristDashboard';
import RegionsPage from './pages/RegionsPage';
import { AuthProvider } from './contexts/AuthContext';
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
            <Route path="/businesses/new" element={
              <ProtectedRoute allowedRoles={['business_owner']}>
                <CreateBusinessPage />
              </ProtectedRoute>
            } />
            <Route path="/businesses/:id" element={<BusinessDetailPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/guides/:id" element={<GuideDetailPage />} />
            <Route path="/attractions" element={<AllAttractionsPage />} />
            <Route path="/attractions/explore" element={<AttractionsPage />} />
            <Route path="/attractions/:id" element={<AttractionDetailPage />} />
            <Route path="/itinerary-planner" element={<ItineraryPlannerPage />} />
            <Route path="/community-forum" element={<CommunityForumPage />} />
            <Route path="/travel-stories" element={<TravelStoriesPage />} />
            <Route path="/stories/:id" element={<StoryDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/regions" element={<RegionsPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/business"
              element={
                <ProtectedRoute allowedRoles={['business_owner']}>
                  <BusinessDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/guide"
              element={
                <ProtectedRoute allowedRoles={['guide']}>
                  <GuideDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tourist"
              element={
                <ProtectedRoute allowedRoles={['tourist']}>
                  <TouristDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </AuthProvider>
  );
}

export default App;
