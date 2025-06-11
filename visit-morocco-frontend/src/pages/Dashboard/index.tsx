import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, useColorModeValue, Container, Spinner, useToast } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'tourist' | 'guide' | 'business_owner' | 'admin' | string;
}

interface DashboardData {
  stats: {
    total_bookings: number;
    upcoming_bookings: number;
    average_rating: number;
    monthly_revenue: number;
  };
  upcoming: any[];
  recent_activities: any[];
  quick_actions: any[];
}

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth() as { user: User | null; loading: boolean };
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const headingColor = useColorModeValue('gray.800', 'white');

  const toast = useToast();

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        try {
          const response = await api.get('/dashboard');
          setDashboardData(response.data);
        } catch (error: any) {
          console.error('Error fetching dashboard data:', error);
          const errorMessage = error.response?.data?.message || 'Failed to load dashboard data';
          setError(errorMessage);
          
          // Show error toast
          toast({
            title: 'Error',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          
          // Initialize with empty data to prevent errors
          setDashboardData({
            stats: {
              total_bookings: 0,
              upcoming_bookings: 0,
              average_rating: 0,
              monthly_revenue: 0,
            },
            upcoming: [],
            recent_activities: [],
            quick_actions: []
          });
        }
      };
      fetchDashboardData();
    }
  }, [user, toast]);

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading dashboard...</Text>
        {error && (
          <Text color="red.500" mt={4}>
            {error}
          </Text>
        )}
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role name and redirect to the appropriate dashboard
  const normalizedRole = user.role ? String(user.role).toLowerCase().trim() : '';
  
  // Map different role names to the expected ones
  const roleMap: { [key: string]: string } = {
    'business_owner': 'business',
    'business': 'business',
    'owner': 'business',
    'business_owner_owner': 'business',
    'guide': 'guide',
    'tour_guide': 'guide',
    'tourist': 'tourist',
    'traveler': 'tourist',
    'user': 'tourist',
  };

  // Get the dashboard path based on the role, default to tourist if role not found
  const rolePath = roleMap[normalizedRole] || 'tourist';
  const dashboardPath = `/dashboard/${rolePath}`;
  
  // If we have dashboard data, include it in the state when redirecting
  const to = {
    pathname: dashboardPath,
    state: { dashboardData }
  };
  
  return <Navigate to={to} replace />;
};

export default Dashboard;
