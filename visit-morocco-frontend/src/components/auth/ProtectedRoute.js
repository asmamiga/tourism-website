import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, Spinner, Center, Text, VStack } from '@chakra-ui/react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="brand.primary"
            size="xl"
          />
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  if (!user) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has one of them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Center h="60vh">
        <VStack spacing={4} textAlign="center" p={6} maxW="md" mx="auto">
          <Text fontSize="xl" fontWeight="bold">Access Denied</Text>
          <Text>You don't have permission to access this page.</Text>
          <Text fontSize="sm" color="gray.500">
            Required role: {allowedRoles.join(' or ')}
            <br />
            Your role: {user.role}
          </Text>
        </VStack>
      </Center>
    );
  }

  return children;
};

export default ProtectedRoute;
