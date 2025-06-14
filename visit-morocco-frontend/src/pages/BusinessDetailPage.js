import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Flex,
  Badge,
  Stack,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Button,
  Icon,
  HStack,
  Link as ChakraLink,
  Alert,
  AlertIcon,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaStar, FaClock, FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa';
import { IconButton } from '@chakra-ui/react';

// Get business photos with proper URL formatting
const getBusinessPhotos = (business) => {
  if (!business) return [];
  
  console.log('Business data:', business);
  console.log('Business photos data:', business.photos);
  
  // If no photos array exists or it's empty, return placeholder
  if (!Array.isArray(business.photos) || business.photos.length === 0) {
    console.log('No photos found in business data, using placeholder');
    return [{
      url: 'https://via.placeholder.com/1200x800?text=No+Images+Available',
      caption: 'No images available for this business',
      isPlaceholder: true
    }];
  }
  
  // Map through photos and ensure proper URL format
  return business.photos.map((photo, index) => {
    // Debug log each photo's structure
    console.log(`Processing photo ${index}:`, photo);
    
    // Try to get the URL from different possible properties
    let imageUrl = '';
    
    // Check different possible properties that might contain the image path
    if (photo.photo_url) {
      imageUrl = photo.photo_url;
    } else if (photo.path) {
      imageUrl = photo.path;
    } else if (photo.url) {
      imageUrl = photo.url;
    } else if (photo.photo_url) {
      imageUrl = photo.photo_url;
    } else if (photo.image) {
      imageUrl = photo.image;
    }
    
    console.log(`Photo ${index} raw URL:`, imageUrl);
    
    // If we have a URL and it's not already absolute, make it absolute
    if (imageUrl) {
      // Handle case where path might be a full URL already
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
        // Remove any leading slashes to prevent double slashes
        imageUrl = imageUrl.replace(/^\/+/, '');
        // Prepend the base URL and storage path
        imageUrl = `http://localhost:8000/storage/${imageUrl}`;
      }
    } else {
      console.warn(`No valid image URL found for photo ${index}:`, photo);
      imageUrl = 'https://via.placeholder.com/1200x800?text=Image+Not+Found';
    }
    
    console.log(`Photo ${index} processed URL:`, imageUrl);
    
    return {
      url: imageUrl,
      caption: photo.caption || `Business Photo ${index + 1}`,
      originalData: photo,
      isPlaceholder: false
    };
  });
};

const BusinessDetailPage = () => {
  // All hooks must be called unconditionally at the top level
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Color mode values
  const breadcrumbTextColor = useColorModeValue('gray.800', 'white');
  const activeBreadcrumbColor = useColorModeValue('blue.600', 'blue.300');
  const scrollbarTrackBg = useColorModeValue('#f1f1f1', '#2D3748');
  const scrollbarThumbBg = useColorModeValue('#cbd5e0', '#4A5568');
  const scrollbarThumbHover = useColorModeValue('#a0aec0', '#718096');
  const scrollbarTrack = useColorModeValue('#f1f1f1', '#2D3748');
  const scrollbarThumb = useColorModeValue('#cbd5e0', '#4A5568');
  const scrollbarThumbHoverColor = useColorModeValue('#a0aec0', '#718096');
  
  // Calculate derived state
  const photos = business ? getBusinessPhotos(business) : [];
  
  // Debug effect for photos
  useEffect(() => {
    if (photos.length > 0) {
      console.log('Processed photos:', photos);
    } else if (business) {
      console.log('No photos found for business:', business.business_id);
    }
  }, [photos, business]);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        console.log('Fetching business data for ID:', id);
        const response = await fetch(`http://localhost:8000/api/businesses/${id}`);
        if (!response.ok) {
          throw new Error('Business not found');
        }
        const data = await response.json();
        console.log('API Response:', data);
        if (data.data) {
          console.log('Business data:', data.data);
          if (data.data.photos) {
            console.log('Photos data:', data.data.photos);
          } else {
            console.log('No photos array in business data');
          }
        }
        setBusiness(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  // Carousel navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <Center minH="50vh" flexDirection="column">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text mt={4} fontSize="lg" color="gray.600">Loading business details...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
        <Button as={RouterLink} to="/" mt={4}>
          Back to Home
        </Button>
      </Container>
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

  // Format price range
  const formatPriceRange = (priceRange) => {
    if (!priceRange) return 'Not specified';
    const priceMap = {
      '$': 'Inexpensive',
      '$$': 'Moderate',
      '$$$': 'Expensive',
      '$$$$': 'Very Expensive'
    };
    return `${priceRange} (${priceMap[priceRange] || priceRange})`;
  };

  // Format opening hours
  const formatHours = (hours) => {
    if (!hours) return 'Not available';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today] || 'Closed';
    
    return today === 'sunday' ? 'Closed' : todayHours;
  };

  return (
    <Box py={10}>
      <Container maxW="container.xl">
        {/* Breadcrumb Navigation */}
        <HStack spacing={2} mb={6} fontSize="sm" color={breadcrumbTextColor}>
          <ChakraLink as={ChakraLink} to="/" _hover={{ textDecoration: 'underline' }}>Home</ChakraLink>
          <Text>/</Text>
          <ChakraLink as={ChakraLink} to="/businesses" _hover={{ textDecoration: 'underline' }}>Businesses</ChakraLink>
          <Text>/</Text>
          <Text fontWeight="medium" color={activeBreadcrumbColor}>
            {business?.name || 'Business'}
          </Text>
        </HStack>

        {/* Business Header */}
        <Flex direction={{ base: 'column', md: 'row' }} mb={8} gap={8}>
          {/* Main Photo Gallery */}
          <Box w={{ base: '100%', md: '60%' }} position="relative">
            {/* Main Featured Image */}
            <Box 
              position="relative" 
              h={{ base: '350px', md: '500px' }}
              overflow="hidden" 
              borderRadius="lg" 
              boxShadow="lg"
              bg="gray.100"
              mb={4}
            >
              <Image
                src={photos[currentSlide]?.url || 'https://via.placeholder.com/1200x800?text=No+Images+Available'}
                alt={photos[currentSlide]?.caption || 'Business photo'}
                objectFit="cover"
                w="100%"
                h="100%"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1200x800?text=Image+Not+Found';
                  e.target.onerror = null; // Prevent infinite loop
                }}
                transition="opacity 0.3s ease-in-out"
              />
              
              {/* Photo Counter */}
              <Box
                position="absolute"
                bottom="4"
                right="4"
                bg="blackAlpha.700"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
                fontWeight="bold"
                zIndex={2}
              >
                {photos.length > 1 ? `${currentSlide + 1} / ${photos.length}` : '1 / 1'}
              </Box>
              
              {/* Navigation Arrows - Only show if there are multiple photos */}
              {photos.length > 1 && (
                <>
                  <IconButton
                    aria-label="Previous photo"
                    icon={<FaChevronLeft />}
                    position="absolute"
                    left="4"
                    top="50%"
                    transform="translateY(-50%)"
                    bg="blackAlpha.600"
                    color="white"
                    _hover={{ bg: 'blackAlpha.800' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    borderRadius="full"
                    size="lg"
                    zIndex={2}
                    boxShadow="md"
                  />
                  <IconButton
                    aria-label="Next photo"
                    icon={<FaChevronRight />}
                    position="absolute"
                    right="4"
                    top="50%"
                    transform="translateY(-50%)"
                    bg="blackAlpha.600"
                    color="white"
                    _hover={{ bg: 'blackAlpha.800' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    borderRadius="full"
                    size="lg"
                    zIndex={2}
                    boxShadow="md"
                  />
                </>
              )}
              
              {/* Vibrant Photo Caption */}
              {photos[currentSlide]?.caption && !photos[currentSlide]?.isPlaceholder && (
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  bgGradient="linear(to-t, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)"
                  p={{ base: 3, md: 5 }}
                  color="white"
                  zIndex={1}
                  backdropFilter="blur(6px)"
                  transform="translateZ(0)"
                >
                  <Box 
                    maxW="container.lg" 
                    mx="auto"
                    position="relative"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 159, 67, 0.2) 100%)',
                      zIndex: -1,
                      opacity: 0.8,
                      borderRadius: 'lg',
                      mx: 2,
                    }}
                  >
                  </Box>
                  <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    fontWeight="bold"
                    color="white"
                    lineHeight="tall"
                    pl={3}
                    textShadow="0 1px 3px rgba(0,0,0,0.3)"
                  >
                    {photos[currentSlide].caption}
                  </Text>
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    fontSize="xs"
                    color="white"
                    p={2}
                    textShadow="0 1px 2px rgba(0,0,0,0.3)"
                    display={{ base: 'none', md: 'block' }}
                  />
                </Box>
              )}
            </Box>
            
            {/* Thumbnail Strip - Only show if there are multiple photos */}
            {photos.length > 1 && (
              <Box mt={4} position="relative">
                <Box 
                  overflowX="auto" 
                  py={2} 
                  className="custom-scrollbar"
                  css={{
                    '&::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: scrollbarTrack,
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: scrollbarThumb,
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: scrollbarThumbHoverColor,
                    },
                  }}
                >
                  <HStack spacing={3} minW="min-content">
                    {photos.map((photo, index) => (
                      <Box
                        key={index}
                        flex="0 0 auto"
                        w={{ base: '70px', md: '90px' }}
                        h={{ base: '50px', md: '60px' }}
                        borderRadius="md"
                        overflow="hidden"
                        cursor="pointer"
                        borderWidth="2px"
                        borderColor={currentSlide === index ? 'blue.500' : 'transparent'}
                        onClick={() => setCurrentSlide(index)}
                        _hover={{ borderColor: currentSlide === index ? 'blue.500' : 'blue.300' }}
                        transition="all 0.2s"
                        position="relative"
                        boxShadow={currentSlide === index ? 'md' : 'sm'}
                        transform={currentSlide === index ? 'translateY(-2px)' : 'none'}
                      >
                        <Image
                          src={photo.url}
                          alt={`Thumbnail ${index + 1}`}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                          opacity={currentSlide === index ? 0.9 : 0.7}
                          _hover={{
                            opacity: 1,
                            transform: 'scale(1.05)',
                          }}
                          transition="all 0.3s"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/90x60?text=Image+Not+Found';
                            e.target.onerror = null; // Prevent infinite loop
                          }}
                        />
                        {currentSlide === index && (
                          <Box
                            position="absolute"
                            bottom="0"
                            left="0"
                            right="0"
                            h="3px"
                            bg="blue.500"
                          />
                        )}
                      </Box>
                    ))}
                  </HStack>
                </Box>
              </Box>
            )}
          </Box>

          {/* Business Info */}
          <Box flex={1}>
            <Heading as="h1" size="xl" mb={4}>
              {business.name}
              {business.is_verified && (
                <Badge ml={2} colorScheme="green">
                  Verified
                </Badge>
              )}
              {business.is_featured && (
                <Badge ml={2} colorScheme="yellow">
                  Featured
                </Badge>
              )}
            </Heading>

            <Flex align="center" mb={4}>
              <Icon as={FaStar} color="yellow.400" mr={1} />
              <Text fontWeight="medium" mr={2}>
                {business.avg_rating ? parseFloat(business.avg_rating).toFixed(1) : 'N/A'}
              </Text>
              <Text color="gray.600">
                ({business.review_count || 0} reviews)
              </Text>
            </Flex>

            <Flex align="center" mb={2}>
              <Icon as={FaMapMarkerAlt} color="red.500" mr={2} />
              <Text color="gray.700">
                {business.address}, {business.city?.name}, {business.city?.region?.name}
              </Text>
            </Flex>

            {business.opening_hours && (
              <Flex align="center" mb={2}>
                <Icon as={FaClock} color="blue.500" mr={2} />
                <Text color={formatHours(business.opening_hours) === 'Closed' ? 'red.500' : 'green.600'}>
                  {formatHours(business.opening_hours) === 'Closed' 
                    ? 'Closed Today' 
                    : `Open Today: ${formatHours(business.opening_hours)}`}
                </Text>
              </Flex>
            )}

            {business.price_range && (
              <Flex align="center" mb={4}>
                <Text color="gray.700">
                  <strong>Price Range:</strong> {formatPriceRange(business.price_range)}
                </Text>
              </Flex>
            )}

            {business.features && business.features.length > 0 && (
              <Box mt={4}>
                <Text fontWeight="medium" mb={2}>Features:</Text>
                <Flex flexWrap="wrap" gap={2}>
                  {business.features.map((feature, index) => (
                    <Badge key={index} colorScheme="blue" variant="subtle" px={2} py={1}>
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            )}
          </Box>
        </Flex>

        <Divider my={8} />

        {/* Business Details Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Contact</Tab>
            <Tab>Hours</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel px={0} py={6}>
              <Box mb={8}>
                <Heading as="h2" size="lg" mb={4}>About {business.name}</Heading>
                <Text color="gray.700" lineHeight="tall">
                  {business.description || 'No description available.'}
                </Text>
              </Box>

              <Box>
                <Heading as="h3" size="md" mb={4}>Business Category</Heading>
                <Badge colorScheme="green" px={3} py={1} borderRadius="full" fontSize="md">
                  {business.business_category?.name || 'Uncategorized'}
                </Badge>
              </Box>
            </TabPanel>

            {/* Contact Tab */}
            <TabPanel px={0} py={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Box>
                  <Heading as="h3" size="md" mb={4}>Contact Information</Heading>
                  <Stack spacing={4}>
                    {business.phone && (
                      <Flex align="center">
                        <Icon as={FaPhone} color="blue.500" mr={3} boxSize={5} />
                        <Text>{business.phone}</Text>
                      </Flex>
                    )}
                    
                    {business.email && (
                      <Flex align="center">
                        <Icon as={FaEnvelope} color="blue.500" mr={3} boxSize={5} />
                        <ChakraLink href={`mailto:${business.email}`} color="blue.600">
                          {business.email}
                        </ChakraLink>
                      </Flex>
                    )}
                    
                    {business.website && (
                      <Flex align="center">
                        <Icon as={FaGlobe} color="blue.500" mr={3} boxSize={5} />
                        <ChakraLink href={business.website} isExternal color="blue.600">
                          {business.website.replace(/^https?:\/\//, '')}
                        </ChakraLink>
                      </Flex>
                    )}
                  </Stack>
                </Box>

                {business.business_owner && (
                  <Box>
                    <Heading as="h3" size="md" mb={4}>Business Owner</Heading>
                    <Flex align="center" bg="gray.50" p={4} borderRadius="lg">
                      <Image
                        src={business.business_owner.user?.profile_picture_url}
                        alt={business.business_owner.user?.full_name}
                        boxSize="60px"
                        borderRadius="full"
                        mr={4}
                        fallbackSrc="https://via.placeholder.com/60"
                      />
                      <Box>
                        <Text fontWeight="medium" fontSize="lg">
                          {business.business_owner.user?.full_name}
                        </Text>
                        {business.business_owner.user?.phone && (
                          <Flex align="center" color="gray.600" mt={1}>
                            <Icon as={FaPhone} mr={1} boxSize={3} />
                            <Text fontSize="sm">{business.business_owner.user.phone}</Text>
                          </Flex>
                        )}
                      </Box>
                    </Flex>
                  </Box>
                )}
              </SimpleGrid>
            </TabPanel>

            {/* Hours Tab */}
            <TabPanel px={0} py={6}>
              <Box maxW="md">
                <Heading as="h3" size="md" mb={4}>Opening Hours</Heading>
                {business.formatted_hours && business.formatted_hours.length > 0 ? (
                  <Stack spacing={2}>
                    {business.formatted_hours.map((day, index) => (
                      <Flex 
                        key={index} 
                        justify="space-between" 
                        py={2}
                        borderBottom="1px"
                        borderColor="gray.100"
                        fontWeight={day.day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() ? 'bold' : 'normal'}
                      >
                        <Text>{day.day}</Text>
                        <Text>{day.hours}</Text>
                      </Flex>
                    ))}
                  </Stack>
                ) : (
                  <Text>Opening hours not available.</Text>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default BusinessDetailPage;