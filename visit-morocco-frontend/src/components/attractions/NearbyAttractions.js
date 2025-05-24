import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Image,
  Badge,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const NearbyAttractions = ({ attractions }) => {
  if (!attractions || attractions.length === 0) {
    return (
      <Box mb={6}>
        <Text>No nearby attractions found.</Text>
      </Box>
    );
  }

  // Default image if no photo available
  const defaultImage = 'https://images.unsplash.com/photo-1539020140153-e479b8c64e3c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';

  return (
    <Box mb={6}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {attractions.map((attraction) => (
          <MotionBox
            key={attraction.attraction_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg="white"
            boxShadow="md"
            sx={{
              _hover: { transform: 'translateY(-5px)', boxShadow: 'lg' },
              transition: 'all 0.3s ease'
            }}
          >
            <Box h="150px" overflow="hidden">
              <Image
                src={attraction.photo ? `http://localhost:8000/storage/${attraction.photo}` : defaultImage}
                alt={attraction.name}
                objectFit="cover"
                w="100%"
                h="100%"
                transition="transform 0.5s ease"
                sx={{
                  _hover: { transform: 'scale(1.1)' }
                }}
              />
            </Box>
            
            <Box p={4}>
              <Heading as="h4" size="md" mb={2} noOfLines={1}>
                {attraction.name}
              </Heading>
              
              <Flex align="center" mb={3}>
                <Icon as={FaMapMarkerAlt} color="brand.primary" mr={2} />
                <Text fontSize="sm" color="gray.600">
                  {attraction.distance} away
                </Text>
              </Flex>
              
              <Button
                as={RouterLink}
                to={`/attractions/${attraction.attraction_id}`}
                colorScheme="green"
                size="sm"
                width="100%"
              >
                View Details
              </Button>
            </Box>
          </MotionBox>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default NearbyAttractions;
