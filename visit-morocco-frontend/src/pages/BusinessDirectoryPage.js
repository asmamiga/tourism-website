import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Button,
  Icon,
  VStack,
  HStack,
  Badge,
  useBreakpointValue,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Image,
  Link,
  Divider,
  Tag,
  TagLabel,
  TagLeftIcon,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { 
  FaSearch, 
  FaStar, 
  FaMapMarkerAlt, 
  FaFilter, 
  FaTimes, 
  FaGlobe, 
  FaPhone, 
  FaRegClock,
  FaRegStar,
  FaStarHalfAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

// Mock data for development
const MOCK_BUSINESSES = [
  {
    business_id: 1,
    name: 'Riad El Fenn',
    description: 'Luxury riad in the heart of Marrakech medina offering traditional accommodations with modern amenities.',
    category_id: 1,
    category: { category_id: 1, name: 'Accommodations', color: 'blue' },
    city_id: 1,
    city: { city_id: 1, name: 'Marrakech' },
    address: 'Derb Moullay Abdullah Ben Hussain, Marrakech 40000',
    phone: '+212 524 44 12 10',
    email: 'info@riadelfenn.com',
    website: 'https://www.riadelfenn.com',
    avg_rating: 4.8,
    reviews_count: 426,
    price_range: '$$$$',
    is_featured: true,
    photos: [],
    hours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
  },
  // ... (other mock businesses)
];

const MOCK_CITIES = [
  { city_id: 1, name: 'Marrakech', region_id: 1 },
  { city_id: 2, name: 'Fes', region_id: 2 },
  { city_id: 3, name: 'Casablanca', region_id: 3 },
  { city_id: 4, name: 'Chefchaouen', region_id: 4 },
  { city_id: 5, name: 'Essaouira', region_id: 5 },
];

// Animation variants for page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

// Helper function to get a business image based on category
const getBusinessImageByCategory = (categoryId) => {
  const categoryImages = {
    1: '1581006852612-e03ed59c576d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Restaurants
    2: '1540541338287-41700207dee6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Hotels
    3: '1569596082827-c9a7ceabd67d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Tour Guides
    4: '1528219923419-a263f485bade?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Transportation
    5: '1530433089905-c53764284e1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Activities
    6: '1489708782377-9f63251361cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80', // Shopping
    7: '1613995617002-3ca8778a4c4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Crafts & Souvenirs
    8: '1579407950847-3ff163033725?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'  // Wellness & Spas
  };
  
  return categoryImages[categoryId] || getRandomMoroccoImage();
};

// Helper function to get random Morocco images
const getRandomMoroccoImage = () => {
  const moroccoImages = [
    '1548084859-71c287e0be58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Marrakech market
    '1572204304559-4ab374720d6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Blue streets of Chefchaouen
    '1548350527-04fb1088edf4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Moroccan tiles
    '1553067195-7cb933844b52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Desert dunes
    '1513415599582-81a1406ee273?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Moroccan doorway
    '1561095581-533a9a0ccede?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Morocco coastline
    '1522075107673-c3d67c36e717?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Moroccan pottery
    '1589308078059-be1415eab4c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Moroccan lanterns
    '1512236248911-8333ff2f2abd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'  // Moroccan spices
  ];
  
  const randomIndex = Math.floor(Math.random() * moroccoImages.length);
  return moroccoImages[randomIndex];
};

const MotionBox = motion(Box);

const BusinessCard = ({ business }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('brand.primary', 'brand.accent');

  // Ensure we have valid data
  const businessData = business || {};
  const categoryName = businessData.category?.name || 'Uncategorized';
  const cityName = businessData.city?.name || 'Location not specified';
  const rating = parseFloat(businessData.avg_rating) || 0;
  const hasPhotos = businessData.photos && businessData.photos.length > 0;
  const primaryPhoto = hasPhotos ? businessData.photos[0] : null;

  // Get a fallback image based on category if no photo is available
  const imageUrl = primaryPhoto?.photo_url 
    ? `http://localhost:8000/storage/${primaryPhoto.photo_url}`
    : `https://source.unsplash.com/random/800x600/?${encodeURIComponent(categoryName)},morocco`;

  return (
    <MotionBox
      as="div"
      display="block"
      bg={cardBg}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      borderRadius="xl"
      overflow="hidden"
      boxShadow="md"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg',
      }}
      h="100%"
      d="flex"
      flexDirection="column"
      position="relative"
    >
      <Box
        as={RouterLink}
        to={`/businesses/${businessData.business_id}`}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={1}
        _hover={{
          textDecoration: 'none'
        }}
        aria-label={`View details for ${businessData.name}`}
      />
      {/* Business Image */}
      <Box
        h="180px"
        bg="gray.100"
        position="relative"
        overflow="hidden"
      >
        <Image
          src={imageUrl}
          alt={businessData.name || 'Business image'}
          w="100%"
          h="100%"
          objectFit="cover"
          transition="transform 0.3s ease"
          _groupHover={{ transform: 'scale(1.05)' }}
          fallbackSrc="https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image"
        />
        {businessData.is_featured && (
          <Badge
            position="absolute"
            top="3"
            right="3"
            bg="brand.primary"
            color="white"
            borderRadius="full"
            px={2}
            py={1}
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            boxShadow="md"
          >
            Featured
          </Badge>
        )}
      </Box>

      {/* Business Info */}
      <Box p={5} flexGrow={1} display="flex" flexDirection="column">
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Heading
            as="h3"
            size="md"
            color={headingColor}
            noOfLines={2}
            fontWeight="700"
            lineHeight="tall"
          >
            {businessData.name || 'Unnamed Business'}
          </Heading>
        </Flex>
        
        <Flex align="center" mb={3}>
          <Box display="flex" alignItems="center">
            {[0, 1, 2, 3, 4].map((i) => (
              <Icon
                key={i}
                as={i < Math.floor(rating) ? FaStar : FaRegStar}
                color={i < rating ? 'yellow.400' : 'gray.300'}
                mr={0.5}
                fontSize="sm"
              />
            ))}
            <Text fontSize="sm" ml={1} color="gray.500">
              {rating > 0 ? rating.toFixed(1) : 'No ratings'}
            </Text>
          </Box>
        </Flex>
        
        <Text noOfLines={2} color={textColor} fontSize="sm" lineHeight="tall" mb={4}>
          {businessData.description || 'No description available'}
        </Text>
        
        <Flex align="center" mt="auto" pt={2} borderTopWidth="1px" borderTopColor="gray.100">
          <Icon as={FaMapMarkerAlt} color="brand.primary" mr={2} />
          <Text fontSize="sm" color="gray.600" noOfLines={1}>
            {cityName}
          </Text>
        </Flex>
        
        <Button
          as="div"
          mt={4}
          size="sm"
          bg="transparent"
          color="brand.primary"
          borderWidth="2px"
          borderColor="brand.primary"
          borderRadius="full"
          _hover={{
            bg: 'brand.primary',
            color: 'white',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          transition="all 0.3s ease"
          position="relative"
          zIndex={2}
          onClick={(e) => {
            e.stopPropagation();
            // Programmatic navigation
            window.location.href = `/businesses/${businessData.business_id}`;
          }}
        >
          View Details
        </Button>
      </Box>
    </MotionBox>
  );
};

const BusinessDirectoryPage = () => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const bgGradient = useColorModeValue(
    'linear(to-r, brand.primary, brand.secondary)',
    'linear(to-r, brand.primary, brand.secondary)'
  );
  const emptyStateBg = useColorModeValue('gray.50', 'gray.800');
  const emptyStateIconBg = useColorModeValue('white', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  const filterPanelBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // State for businesses and UI
  const [businesses, setBusinesses] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    category: '',
    sort: 'name',
  });

  // Import the API services
  const { businessService, cityService } = require('../services/api');
  
  // Ensure cities is always an array
  const safeCities = Array.isArray(cities) ? cities : [];
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];

  // Fetch data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const [businessesRes, citiesRes] = await Promise.all([
            businessService.getAll(),
            cityService.getAll()
          ]);
          
          if (!isMounted) return;
          
          // Extract data from responses - handle the API response structure
          const businessesData = businessesRes?.data?.data || [];
          const citiesData = [];
          
          // Extract unique cities from businesses
          const cityMap = new Map();
          businessesData.forEach(business => {
            if (business.city && business.city.city_id) {
              cityMap.set(business.city.city_id, business.city);
            }
          });
          
          const extractedCities = Array.from(cityMap.values());
          
          if (Array.isArray(businessesData)) {
            setBusinesses(businessesData);
            setCities(extractedCities);
            setUseMockData(false);
          } else {
            throw new Error('Invalid businesses data format from API');
          }
        } catch (apiError) {
          console.warn('API Error, using mock data:', apiError);
          throw apiError; // This will be caught by the outer catch
        }
        
      } catch (err) {
        console.error('Error in data fetching:', err);
        if (!isMounted) return;
        
        const errorMessage = err.response?.data?.message || 'Please check your connection and try again.';
        setError('Failed to load data. ' + errorMessage);
        
        toast({
          title: 'API Error',
          description: 'Using demo data. ' + errorMessage,
          status: 'warning',
          duration: 10000,
          isClosable: true,
        });
        
        // Fallback to mock data if API fails
        console.warn('Using mock data as fallback');
        setBusinesses(MOCK_BUSINESSES);
        setCities(MOCK_CITIES);
        setUseMockData(true);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Extract unique categories from businesses
  const uniqueCategories = useMemo(() => {
    const categoryMap = new Map();
    businesses.forEach(business => {
      if (business?.category?.category_id) {
        categoryMap.set(business.category.category_id, business.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [businesses]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      city: '',
      category: '',
      sort: 'name',
    });
  }, []);

  // Filter and sort businesses based on filters
  const filteredBusinesses = useMemo(() => {
    return safeBusinesses.filter((business) => {
      const matchesSearch = !filters.search || 
        (business.name && business.name.toLowerCase().includes(filters.search.toLowerCase())) ||
        (business.description && business.description.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesCity = !filters.city || 
        (business.city && (business.city.city_id === parseInt(filters.city) || business.city.city_id?.toString() === filters.city));
      
      const matchesCategory = !filters.category || 
        (business.category && (business.category.category_id === parseInt(filters.category) || business.category.category_id?.toString() === filters.category));
      
      return matchesSearch && matchesCity && matchesCategory;
    }).sort((a, b) => {
      if (filters.sort === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (filters.sort === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      } else if (filters.sort === 'rating') {
        return (b.avg_rating || 0) - (a.avg_rating || 0);
      }
      return 0;
    });
  }, [safeBusinesses, filters]);

  // Loading state
  if (loading) {
    return (
      <Flex 
        as={motion.div}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        justify="center" 
        align="center" 
        minH="60vh"
        p={4}
      >
        <VStack spacing={6}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="brand.primary"
            size="xl"
          />
          <Text color={textColor}>Loading businesses...</Text>
        </VStack>
      </Flex>
    );
  }

  // Error state
  if (error) {
    return (
      <Container 
        as={motion.div}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        maxW="container.xl" 
        py={10}
      >
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading businesses</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  // Main render
  return (
    <Box minH="calc(100vh - 80px)" bg={bgColor}>
      {/* Hero Section */}
      <Box
        as={motion.section}
        position="relative"
        bg="gray.900"
        color="white"
        overflow="hidden"
        pb={{ base: 20, md: 32 }}
        pt={{ base: 32, md: 44 }}
      >
        {/* Background image with overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage="url('/images/morocco-hero.jpg')"
          bgSize="cover"
          bgPosition="center"
          bgAttachment="fixed"
          zIndex={1}
          opacity={0.8}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)"
          zIndex={2}
        />

        <Container maxW="container.xl" position="relative" zIndex={3}>
          <VStack
            spacing={6}
            align={{ base: 'center', md: 'flex-start' }}
            textAlign={{ base: 'center', md: 'left' }}
            maxW="3xl"
          >
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                px={4}
                py={2}
                borderRadius="full"
                bg="rgba(255,255,255,0.15)"
                color="white"
                fontWeight="600"
                fontSize="sm"
                letterSpacing="wide"
                textTransform="uppercase"
                backdropFilter="blur(8px)"
              >
                Business Directory
              </Badge>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Heading
                as="h1"
                size="3xl"
                fontWeight="800"
                lineHeight="1.1"
                letterSpacing="tight"
                maxW="2xl"
                bgGradient="linear(to-r, white, blue.100)"
                bgClip="text"
              >
                Discover the Best of Morocco
              </Heading>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              maxW="2xl"
            >
              <Text
                fontSize="xl"
                color="gray.300"
                lineHeight="taller"
                fontWeight="400"
              >
                Explore our curated selection of the finest businesses and services across Morocco's most vibrant destinations
              </Text>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              pt={4}
              w="100%"
            >
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                gap={4} 
                align="center"
                justify="space-between"
                w="100%"
                maxW="container.lg"
                mx="auto"
              >
                {/* Search Bar */}
                <Box
                  bg="white"
                  p={1.5}
                  borderRadius="full"
                  display="flex"
                  flex="1"
                  boxShadow="0 10px 30px rgba(0,0,0,0.15)"
                  position="relative"
                  zIndex="1"
                  maxW={{ base: '100%', md: '600px' }}
                  mr={{ base: 0, md: 4 }}
                >
                  <InputGroup size="lg" flex={1}>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search businesses..."
                      border="none"
                      _focus={{ boxShadow: 'none' }}
                      borderRadius="full"
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      value={filters.search}
                    />
                  </InputGroup>
                  <Button
                    colorScheme="green"
                    size="lg"
                    px={8}
                    borderRadius="full"
                    bg="brand.primary"
                    _hover={{ bg: 'brand.secondary' }}
                    onClick={() => {
                      // Already handled by the useEffect
                    }}
                  >
                    Search
                  </Button>
                </Box>

                {/* Filter Buttons */}
                <Flex 
                  direction={{ base: 'column', sm: 'row' }} 
                  gap={4} 
                  align="center"
                  w={{ base: '100%', md: 'auto' }}
                  mt={{ base: 4, md: 0 }}
                >
                  <Button
                    leftIcon={<Icon as={isFilterOpen ? FaTimes : FaFilter} />}
                    variant="outline"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    borderRadius="full"
                    borderColor={borderColor}
                    _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
                    _active={{ bg: 'gray.100' }}
                    size="lg"
                    w={{ base: '100%', sm: 'auto' }}
                  >
                    {isFilterOpen ? 'Hide Filters' : 'Filters'}
                  </Button>

                  <Select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    maxW={{ base: '100%', sm: '200px' }}
                    bg={inputBg}
                    borderRadius="full"
                    borderColor={borderColor}
                    _hover={{ borderColor: 'gray.300' }}
                    _focus={{
                      borderColor: 'brand.primary',
                      boxShadow: '0 0 0 2px var(--chakra-colors-brand-primary-100)',
                    }}
                    fontSize="md"
                    size="lg"
                    w={{ base: '100%', sm: 'auto' }}
                  >
                    <option value="name_asc">Sort: A to Z</option>
                    <option value="name_desc">Sort: Z to A</option>
                    <option value="rating_desc">Top Rated</option>
                    <option value="reviews_desc">Most Reviewed</option>
                  </Select>
                </Flex>
              </Flex>
            </MotionBox>

            <motion.div
              initial={false}
              animate={{ 
                height: isFilterOpen ? 'auto' : 0,
                opacity: isFilterOpen ? 1 : 0,
                marginTop: isFilterOpen ? '1.5rem' : 0,
                overflow: 'hidden'
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Box 
                p={6} 
                bg={filterPanelBg} 
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="medium" mb={2} color={headingColor}>
                      Category
                    </Text>
                    <Select
                      placeholder="All Categories"
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      bg={inputBg}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{
                        borderColor: 'brand.primary',
                        boxShadow: '0 0 0 2px var(--chakra-colors-brand-primary-100)',
                      }}
                    >
                      {uniqueCategories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2} color={headingColor}>
                      City
                    </Text>
                    <Select
                      placeholder="All Cities"
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      bg={inputBg}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{
                        borderColor: 'brand.primary',
                        boxShadow: '0 0 0 2px var(--chakra-colors-brand-primary-100)',
                      }}
                    >
                      {safeCities.map((city) => (
                        <option key={city.city_id} value={city.city_id}>
                          {city.name}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </SimpleGrid>
              </Box>
            </motion.div>
          </VStack>
        </Container>
      </Box>

      {/* Business List */}
      <Container maxW="container.xl" py={16}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Flex justify="space-between" align="center" mb={8}>
            <Box>
              <Heading as="h2" size="xl" color={headingColor} mb={2}>
                {safeBusinesses.length} {safeBusinesses.length === 1 ? 'Business' : 'Businesses'} Found
              </Heading>
              <Text color={textColor}>
                {filters.search || filters.category || filters.city 
                  ? 'Results match your search criteria' 
                  : 'Showing all businesses'}
              </Text>
            </Box>
            
            {(filters.search || filters.category || filters.city) && (
              <Button
                variant="ghost"
                colorScheme="red"
                size="sm"
                rightIcon={<Icon as={FaTimes} />}
                onClick={() => {
                  setFilters({
                    search: '',
                    category: '',
                    city: '',
                    sort: 'name_asc',
                  });
                }}
              >
                Clear All
              </Button>
            )}
          </Flex>

          {loading ? (
            <Flex justify="center" py={20}>
              <Spinner size="xl" color="brand.primary" thickness="4px" emptyColor="gray.200" />
            </Flex>
          ) : error ? (
            <Alert status="error" borderRadius="xl" variant="left-accent">
              <AlertIcon />
              <Box>
                <AlertTitle>Error Loading Businesses</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          ) : safeBusinesses.length === 0 ? (
            <Box 
              textAlign="center" 
              py={20} 
              bg={emptyStateBg} 
              borderRadius="2xl"
              border="1px dashed"
              borderColor={borderColor}
            >
              <Box 
                display="inline-block" 
                p={4} 
                mb={4} 
                bg={emptyStateIconBg} 
                borderRadius="full"
                boxShadow="md"
              >
                <Icon as={FaSearch} fontSize="2xl" color="gray.400" />
              </Box>
              <Heading as="h2" size="lg" mb={4} color={headingColor}>
                No businesses found
              </Heading>
              <Text color={textColor} maxW="md" mx="auto" mb={6}>
                We couldn't find any businesses matching your search. Try adjusting your filters or search term.
              </Text>
              <Button
                colorScheme="brand"
                size="lg"
                px={8}
                borderRadius="full"
                onClick={() => {
                  setFilters({
                    search: '',
                    category: '',
                    city: '',
                    sort: 'name_asc',
                  });
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {safeBusinesses.map((business, index) => (
                <motion.div
                  key={business.business_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <BusinessCard business={business} />
                </motion.div>
              ))}
            </SimpleGrid>
          )}
        </motion.div>
      </Container>

      {/* Call to Action */}
      <Box bgGradient={bgGradient} color="white" py={20} mt={16} position="relative" overflow="hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements */}
          <Box 
            position="absolute" 
            left="10%" 
            top="-50px" 
            w="200px" 
            h="200px" 
            borderRadius="full" 
            bg="rgba(255,255,255,0.05)" 
          />
          <Box 
            position="absolute" 
            right="5%" 
            bottom="-50px" 
            w="200px" 
            h="200px" 
            borderRadius="full" 
            bg="rgba(255,255,255,0.1)" 
          />

          <Container maxW="container.lg" textAlign="center" position="relative" zIndex="1">
            <Heading as="h2" size="2xl" mb={6} fontWeight="extrabold">
              Own a Business in Morocco?
            </Heading>
            <Text fontSize="xl" mb={8} maxW="2xl" mx="auto" lineHeight="1.7" opacity={0.9}>
              Join our platform to showcase your business to thousands of travelers 
              looking for authentic Moroccan experiences.
            </Text>
            <Button 
              as={RouterLink} 
              to="/business-signup" 
              colorScheme="white"
              variant="outline"
              size="lg"
              px={8}
              py={6}
              borderRadius="full"
              fontWeight="bold"
              borderWidth={2}
              _hover={{
                bg: 'whiteAlpha.200',
                transform: 'translateY(-2px)',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              List Your Business
            </Button>
          </Container>
        </motion.div>
      </Box>
    </Box>
  );
};

export default BusinessDirectoryPage;
