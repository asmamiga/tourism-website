import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Stack,
  HStack,
  VStack,
  Divider,
  Badge,
  Button,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Flex,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaGlobe, 
  FaClock, 
  FaEnvelope, 
  
} from 'react-icons/fa';
import { businessService, reviewService } from '../services/api';
import { format, parseISO, isToday, isWeekend, getDay } from 'date-fns';
import { AuthContext } from '../context/AuthContext';

// Import components
import BusinessMap from '../components/business/BusinessMap';
import ReviewList from '../components/business/ReviewList';
import ReviewForm from '../components/business/ReviewForm';
import BookingForm from '../components/business/BookingForm';

const MotionBox = motion(Box);

// Helper function to get day name from day number (0-6, Sunday-Saturday)
const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber];
};

// Helper function to format business hours
const formatBusinessHours = (hours) => {
  if (!hours || !hours.length) return null;
  
  // Group hours by day
  const hoursByDay = {};
  hours.forEach(hour => {
    if (!hoursByDay[hour.day_of_week]) {
      hoursByDay[hour.day_of_week] = [];
    }
    hoursByDay[hour.day_of_week].push(hour);
  });
  
  return hoursByDay;
};

const BusinessDetailPage = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await businessService.getById(id);
        if (isMounted) {
          setBusiness(response.data);
        }
      } catch (err) {
        console.error('Error fetching business details:', err);
        if (isMounted) {
          if (err.response?.status === 404) {
            setError('Business not found. The requested business may have been removed or does not exist.');
          } else {
            setError('Failed to load business details. Please check your connection and try again.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBusiness();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleRetry = () => {
    setError(null);
    // The useEffect will trigger again when error changes
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.primary"
          size="xl"
        />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
        <Button 
          colorScheme="blue" 
          onClick={handleRetry}
          isLoading={loading}
          loadingText="Retrying..."
        >
          Try Again
        </Button>
        <Box mt={4}>
          <Button as={RouterLink} to="/businesses" variant="outline" mr={2}>
            Browse All Businesses
          </Button>
          <Button as={RouterLink} to="/" variant="outline">
            Go to Home
          </Button>
        </Box>
      </Box>
    );
  }

  if (!business) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="warning">
          <AlertIcon />
          Business not found
        </Alert>
      </Container>
    );
  }

  // Default image if no photos available
  const defaultImage = 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
  
  // Get business photos or use default
  const photos = business.photos && business.photos.length > 0
    ? business.photos.map(photo => `http://localhost:8000/storage/${photo.photo_path}`)
    : [defaultImage];

  return (
    <Box py={10}>
      <Container maxW="container.xl">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb Navigation */}
          <HStack spacing={2} mb={4} color="gray.600">
            <RouterLink to="/">Home</RouterLink>
            <Text>/</Text>
            <RouterLink to="/businesses">Businesses</RouterLink>
            <Text>/</Text>
            <Text color="brand.primary">{business.name}</Text>
          </HStack>

          {/* Business Header */}
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            mb={6}
          >
            <Box>
              <Heading as="h1" size="xl" mb={2}>
                {business.name}
                {business.is_verified && (
                  <Badge ml={2} colorScheme="green" variant="solid">
                    Verified
                  </Badge>
                )}
                {business.is_featured && (
                  <Badge ml={2} colorScheme="yellow" variant="solid">
                    Featured
                  </Badge>
                )}
              </Heading>
              
              <Flex align="center" mb={2}>
                <Icon as={FaMapMarkerAlt} color="brand.primary" mr={2} />
                <Text color="gray.600">
                  {business.address}, {business.city?.name}
                </Text>
              </Flex>
              
              <Flex align="center">
                <Box display="flex" alignItems="center">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      as={FaStar}
                      color={i < Math.floor(business.avg_rating || 0) ? 'brand.accent' : 'gray.300'}
                      mr={1}
                    />
                  ))}
                  <Text ml={1} fontWeight="bold">
                    {business.avg_rating ? business.avg_rating.toFixed(1) : 'No ratings'}
                  </Text>
                  <Text ml={1} color="gray.500">
                    ({business.reviews?.length || 0} reviews)
                  </Text>
                </Box>
              </Flex>
            </Box>
            
            <Button
              as={RouterLink}
              to="#booking"
              colorScheme="green"
              size="lg"
              mt={{ base: 4, md: 0 }}
            >
              Book Now
            </Button>
          </Flex>

          {/* Photo Gallery */}
          <Box mb={8}>
            <Box
              borderRadius="lg"
              overflow="hidden"
              height={{ base: '300px', md: '400px' }}
              mb={4}
            >
              <Image
                src={photos[activeImage]}
                alt={business.name}
                objectFit="cover"
                w="100%"
                h="100%"
              />
            </Box>
            
            {photos.length > 1 && (
              <Flex overflow="auto" pb={2}>
                {photos.map((photo, index) => (
                  <Box
                    key={index}
                    width="100px"
                    height="70px"
                    mr={2}
                    borderRadius="md"
                    overflow="hidden"
                    cursor="pointer"
                    opacity={activeImage === index ? 1 : 0.6}
                    border={activeImage === index ? '2px solid' : 'none'}
                    borderColor="brand.primary"
                    onClick={() => setActiveImage(index)}
                  >
                    <Image
                      src={photo}
                      alt={`${business.name} photo ${index + 1}`}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                    />
                  </Box>
                ))}
              </Flex>
            )}
          </Box>

          {/* Business Details Tabs */}
          <Tabs colorScheme="green" isLazy>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Reviews</Tab>
              <Tab>Location</Tab>
              <Tab>Booking</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      About {business.name}
                    </Heading>
                    <Text mb={6}>
                      {business.description || 'No description available.'}
                    </Text>
                    
                    <Heading as="h3" size="md" mb={4}>
                      Features
                    </Heading>
                    <SimpleGrid columns={2} spacing={4} mb={6}>
                      {business.features ? (
                        typeof business.features === 'object' ? 
                          Object.entries(business.features).map(([key, value]) => (
                            <Flex key={key} align="center">
                              <Box
                                w={2}
                                h={2}
                                borderRadius="full"
                                bg="brand.primary"
                                mr={2}
                              />
                              <Text>{value}</Text>
                            </Flex>
                          ))
                        : 
                          <Text>Features information not available.</Text>
                      ) : (
                        <Text>No features listed.</Text>
                      )}
                    </SimpleGrid>
                    
                    <Heading as="h3" size="md" mb={4}>
                      Business Category
                    </Heading>
                    <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                      {business.category?.name || 'Uncategorized'}
                    </Badge>
                  </Box>
                  
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      Contact Information
                    </Heading>
                    <Stack spacing={4} mb={6}>
                      {business.phone && (
                        <Flex align="center">
                          <Icon as={FaPhone} color="brand.primary" mr={3} />
                          <Text>{business.phone}</Text>
                        </Flex>
                      )}
                      
                      {business.email && (
                        <Flex align="center">
                          <Icon as={FaEnvelope} color="brand.primary" mr={3} />
                          <Text>{business.email}</Text>
                        </Flex>
                      )}
                      
                      {business.website && (
                        <Flex align="center">
                          <Icon as={FaGlobe} color="brand.primary" mr={3} />
                          <ChakraLink href={business.website} isExternal color="brand.primary">
                            {business.website}
                          </ChakraLink>
                        </Flex>
                      )}
                    </Stack>
                    
                    <Heading as="h3" size="md" mb={4}>
                      Opening Hours
                    </Heading>
                    <Stack spacing={2} mb={6}>
                      {business.opening_hours ? (
                        typeof business.opening_hours === 'object' ? 
                          Object.entries(business.opening_hours).map(([day, hours]) => (
                            <Flex key={day} justify="space-between">
                              <Text fontWeight="bold">{day}</Text>
                              <Text>{hours}</Text>
                            </Flex>
                          ))
                        : 
                          <Text>{business.opening_hours}</Text>
                      ) : (
                        <Text>Opening hours not specified.</Text>
                      )}
                    </Stack>
                    
                    <Heading as="h3" size="md" mb={4}>
                      Price Range
                    </Heading>
                    <Text>
                      {business.price_range || 'Price range not specified'}
                    </Text>
                  </Box>
                </SimpleGrid>
              </TabPanel>
              
              {/* Reviews Tab */}
              <TabPanel>
                <Box mb={8}>
                  <Heading as="h3" size="md" mb={4}>
                    Customer Reviews
                  </Heading>
                  
                  {user ? (
                    <ReviewForm businessId={business.business_id} />
                  ) : (
                    <Alert status="info" mb={4}>
                      <AlertIcon />
                      <Text>
                        Please <RouterLink to="/login" style={{ color: 'var(--chakra-colors-brand-primary)', fontWeight: 'bold' }}>log in</RouterLink> to leave a review.
                      </Text>
                    </Alert>
                  )}
                  
                  <Divider my={6} />
                  
                  <ReviewList businessId={business.business_id} />
                </Box>
              </TabPanel>
              
              {/* Location Tab */}
              <TabPanel>
                <Box mb={8}>
                  <Heading as="h3" size="md" mb={4}>
                    Location
                  </Heading>
                  
                  <Text mb={4}>
                    {business.address}, {business.city?.name}
                  </Text>
                  
                  <Box
                    height="400px"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="md"
                  >
                    {business.latitude && business.longitude ? (
                      <BusinessMap
                        latitude={business.latitude}
                        longitude={business.longitude}
                        businessName={business.name}
                      />
                    ) : (
                      <Flex
                        justify="center"
                        align="center"
                        height="100%"
                        bg="gray.100"
                      >
                        <Text>Map location not available</Text>
                      </Flex>
                    )}
                  </Box>
                </Box>
              </TabPanel>
              
              {/* Booking Tab */}
              <TabPanel id="booking">
                <Box mb={8}>
                  <Heading as="h3" size="md" mb={4}>
                    Book {business.name}
                  </Heading>
                  
                  {user ? (
                    <BookingForm business={business} />
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <Text>
                        Please <RouterLink to="/login" style={{ color: 'var(--chakra-colors-brand-primary)', fontWeight: 'bold' }}>log in</RouterLink> to make a booking.
                      </Text>
                    </Alert>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          {/* Related Businesses */}
          <Box mt={12}>
            <Heading as="h3" size="lg" mb={6}>
              You Might Also Like
            </Heading>
            
            {/* This would be populated with actual related businesses */}
            <Text color="gray.600">
              Related businesses will be shown here based on category and location.
            </Text>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default BusinessDetailPage;