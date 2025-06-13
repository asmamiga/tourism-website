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
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
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

// Alias for filter icon
const FilterIcon = FaFilter;
const CloseIcon = FaTimes;

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
  
  // Find primary photo or fall back to first photo
  const getPrimaryOrFirstPhoto = (photos) => {
    if (!photos || photos.length === 0) return null;
    
    // First try to find a primary photo
    const primary = photos.find(photo => photo.is_primary);
    if (primary) return primary;
    
    // If no primary, return the first photo
    return photos[0];
  };
  
  const selectedPhoto = getPrimaryOrFirstPhoto(businessData.photos);
  
  // Get the image URL, with fallback to category-based image
  const getImageUrl = () => {
    if (selectedPhoto?.photo_url) {
      // Check if URL is already absolute
      if (selectedPhoto.photo_url.startsWith('http')) {
        return selectedPhoto.photo_url;
      }
      // Prepend storage path for relative URLs
      return `http://localhost:8000/storage/${selectedPhoto.photo_url}`.replace(/([^:]\/)\/+/g, '$1');
    }
    // Fallback to category-based image
    return `https://source.unsplash.com/random/800x600/?${encodeURIComponent(categoryName)},morocco`;
  };
  
  const imageUrl = getImageUrl();

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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    city: '',
    category: '',
    sort: 'name',
  });

  // Import the API services
  const { businessService, cityService } = require('../services/api');
  
  // Ensure data is always an array and handle various data structures
  const safeCities = Array.isArray(cities) 
    ? cities 
    : Array.isArray(cities?.data) 
      ? cities.data 
      : [];
      
  const safeBusinesses = Array.isArray(businesses) 
    ? businesses 
    : [];
    
  const safeCategories = Array.isArray(categories) 
    ? categories 
    : [];
    
  // Debug: Log current state
  console.log('Current state:', {
    businesses: businesses?.length || 0,
    cities: safeCities.length,
    categories: safeCategories.length,
    filters
  });
  
  // Check if any filters are active
  const hasActiveFilters = filters.city || filters.category;
  
  // Log cities data for debugging
  useEffect(() => {
    console.log('Current cities in state:', {
      cities: cities,
      safeCities: safeCities,
      count: safeCities.length,
      sample: safeCities.slice(0, 3).map(c => ({
        id: c.city_id || c.id,
        name: c.name
      }))
    });
  }, [cities, safeCities]);

  // Filter businesses based on active filters
  const filteredBusinesses = useMemo(() => {
    console.log('Filtering businesses with:', { 
      filters, 
      businessCount: safeBusinesses.length,
      cities: safeCities.length,
      citiesSample: safeCities.slice(0, 3),
      categories: safeCategories.length 
    });
    
    return safeBusinesses.filter(business => {
      const matchesCity = !filters.city || 
        (business.city && business.city.city_id && 
         business.city.city_id.toString() === filters.city.toString());
         
      const matchesCategory = !filters.category || 
        (business.category && business.category.category_id && 
         business.category.category_id.toString() === filters.category.toString());
         
      console.log('Business:', business.name, { matchesCity, matchesCategory });
      return matchesCity && matchesCategory;
    });
  }, [safeBusinesses, filters.city, filters.category, safeCities, safeCategories]);
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      city: '',
      category: '',
      sort: 'name',
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch data...');
        
        // Try to fetch from API first
        try {
          console.log('Fetching businesses and cities...');
          const [businessesRes, citiesRes] = await Promise.all([
            businessService.getAll({ include: 'city,category' }),
            cityService.getAll({ per_page: 100 })
          ]);
          
          if (!isMounted) return;
          
          // Log raw API responses for debugging
          console.log('Raw businesses response:', businessesRes);
          console.log('Raw cities response:', citiesRes);
          
          // Extract data from responses - handle both nested and flat structures
          let businessesData = [];
          let citiesData = [];
          
          // Handle businesses data (could be in data.data or data.data.data)
          if (businessesRes?.data?.data) {
            businessesData = Array.isArray(businessesRes.data.data) 
              ? businessesRes.data.data 
              : businessesRes.data.data?.data || [];
          }
          
          // Handle cities data
          if (citiesRes?.data?.data) {
            citiesData = Array.isArray(citiesRes.data.data) 
              ? citiesRes.data.data 
              : citiesRes.data.data?.data || [];
          }
          
          console.log('Extracted businesses:', businessesData);
          console.log('Extracted cities:', citiesData);
          
          // Extract unique categories from businesses
          const categoryMap = new Map();
          businessesData.forEach(business => {
            if (business?.category) {
              categoryMap.set(business.category.category_id, business.category);
            }
          });
          const categoriesData = Array.from(categoryMap.values());
            
          console.log('Extracted categories:', categoriesData);
          
          if (Array.isArray(businessesData)) {
            console.log('Setting businesses:', businessesData.length, 'items');
            setBusinesses(businessesData);
            
            // Use cities from cities endpoint
            if (citiesData.length > 0) {
              console.log('Setting cities:', citiesData.length, 'cities');
              setCities(citiesData);
            }
            
            // Set categories from businesses
            if (categoriesData.length > 0) {
              console.log('Setting categories:', categoriesData.length, 'categories');
              setCategories(categoriesData);
            }
            
            setUseMockData(false);
          } else {
            console.error('Invalid businesses data format:', businessesData);
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

  // Get unique categories from API response or fallback to extracting from businesses
  const uniqueCategories = useMemo(() => {
    if (safeCategories.length > 0) {
      return safeCategories.map(item => item.category).filter(Boolean);
    }
    
    // Fallback: Extract from businesses if no categories from API
    const categoryMap = new Map();
    safeBusinesses.forEach(business => {
      if (business?.category?.category_id) {
        categoryMap.set(business.category.category_id, business.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [safeBusinesses, safeCategories]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    console.log(`Filter changed - ${key}:`, value);
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      console.log('New filters:', newFilters);
      
      // Log the current state for debugging
      console.log('Current businesses count:', safeBusinesses.length);
      if (key === 'city' && value) {
        const city = safeCities.find(c => c.city_id.toString() === value.toString());
        console.log(`Filtering by city: ${city?.name || 'Unknown'} (${value})`);
      }
      if (key === 'category' && value) {
        const category = safeCategories.find(c => c.category_id.toString() === value.toString());
        console.log(`Filtering by category: ${category?.name || 'Unknown'} (${value})`);
      }
      
      return newFilters;
    });
  }, [safeBusinesses, safeCities, safeCategories]);

  // Main component return
  // Main component return
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
          bgImage="url('https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
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
              {/* Filter Buttons */}
              <Flex 
                direction={{ base: 'column', sm: 'row' }} 
                gap={4} 
                align="center"
                w={{ base: '100%', md: 'auto' }}
                mt={{ base: 4, md: 0 }}
              >
                <Button
                  leftIcon={<FilterIcon />}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  variant={hasActiveFilters ? 'solid' : 'outline'}
                  colorScheme={hasActiveFilters ? 'brand' : 'gray'}
                >
                  {isFilterOpen ? 'Hide Filters' : 'Filters'}
                  {hasActiveFilters && (
                    <Badge ml={2} colorScheme="red" borderRadius="full" px={2}>
                      {[filters.city ? 1 : 0, filters.category ? 1 : 0].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>
              </Flex>
              
              {/* Filter Panel */}
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ width: '100%' }}
                  >
                    <Box 
                      mt={4} 
                      p={6} 
                      bg={filterPanelBg}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                      boxShadow="md"
                    >
                      <SimpleGrid columns={{ base: 1 }} spacing={6}>
                        <Box>
                          <Text 
                            fontWeight="semibold" 
                            mb={2} 
                            color="gray.700"
                            fontSize="sm"
                            letterSpacing="wide"
                          >
                            Filter by City
                          </Text>
                          <Select
                            placeholder="All Cities"
                            placeholderTextColor="gray.500"
                            value={filters.city || ''}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                            bg={inputBg}
                            borderColor={borderColor}
                            color="gray.800"
                            _hover={{ 
                              borderColor: 'gray.400',
                              bg: 'white'
                            }}
                            _focus={{ 
                              borderColor: 'brand.500', 
                              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                              bg: 'white'
                            }}
                            _placeholder={{ 
                              color: 'gray.500',
                              opacity: 1
                            }}
                            sx={{
                              'option': {
                                color: 'gray.800',
                                bg: 'white',
                                _hover: {
                                  bg: 'brand.50',
                                  color: 'brand.600'
                                }
                              },
                              'option:checked': {
                                bg: 'brand.100',
                                color: 'brand.700',
                                fontWeight: 'medium'
                              }
                            }}
                          >
                            
                            {safeCities && safeCities.length > 0 ? (
                              safeCities.map((city) => (
                                <option 
                                  key={city.city_id || city.id} 
                                  value={city.city_id || city.id}
                                  style={{ color: 'gray.800' }}
                                >
                                  {city.name}
                                </option>
                              ))
                            ) : (
                              <option disabled style={{ color: 'gray.500' }}>No cities available</option>
                            )}
                          </Select>
                        </Box>
                        
                        {/* <Box>
                          <Text 
                            fontWeight="semibold" 
                            mb={2} 
                            color="gray.700"
                            fontSize="sm"
                            letterSpacing="wide"
                          >
                            Filter by Category
                          </Text>
                          <Select
                            placeholder="All Categories"
                            value={filters.category || ''}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            bg={inputBg}
                            borderColor={borderColor}
                            color="gray.800"
                            _hover={{ 
                              borderColor: 'gray.400',
                              bg: 'white'
                            }}
                            _focus={{ 
                              borderColor: 'brand.500', 
                              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                              bg: 'white'
                            }}
                            _placeholder={{ 
                              color: 'gray.500',
                              opacity: 1
                            }}
                            sx={{
                              'option': {
                                color: 'gray.800',
                                bg: 'white',
                                _hover: {
                                  bg: 'brand.50',
                                  color: 'brand.600'
                                }
                              },
                              'option:checked': {
                                bg: 'brand.100',
                                color: 'brand.700',
                                fontWeight: 'medium'
                              }
                            }}
                          >
                            <option value="" style={{ color: 'gray.500' }}>All Categories</option>
                            {safeCategories && safeCategories.length > 0 ? (
                              safeCategories.map((category) => (
                                <option 
                                  key={category.category_id} 
                                  value={category.category_id}
                                  style={{ color: 'gray.800' }}
                                >
                                  {category.name}
                                </option>
                              ))
                            ) : (
                              <option disabled style={{ color: 'gray.500' }}>No categories available</option>
                            )}
                          </Select>
                        </Box> */}
                      </SimpleGrid>
                      
                      {hasActiveFilters && (
                        <Button
                          mt={4}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={clearFilters}
                          leftIcon={<CloseIcon />}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Flex>
          </MotionBox>
        </VStack>
      </Container>
      </Box>

      {/* Business List Section */}
      <Container maxW="container.xl" py={16}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
        <Flex justify="space-between" align="center" mb={6}>
          <VStack align="flex-start" spacing={1}>
            <Heading as="h1" size="xl" color={headingColor}>
              Business Directory
            </Heading>
            {hasActiveFilters && (
              <Text fontSize="sm" color="gray.500">
                {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? 'es' : ''} found
                {filters.city && ` in ${safeCities.find(c => c.city_id.toString() === filters.city.toString())?.name || 'selected city'}`}
                {filters.category && ` in ${safeCategories.find(c => c.category_id.toString() === filters.category.toString())?.name || 'selected category'}`}
              </Text>
            )}
          </VStack>
          <HStack spacing={3}>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                colorScheme="red"
                rightIcon={<CloseIcon boxSize={3} />}
              >
                Clear Filters
              </Button>
            )}
          </HStack>
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
        ) : filteredBusinesses.length === 0 ? (
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
            <Text color={textColor} mb={6}>
              Try adjusting your filters or check back later for new listings.
            </Text>
            <Button 
              onClick={clearFilters}
              colorScheme="brand"
              variant="outline"
            >
              Clear all filters
            </Button>
          </Box>
        ) : (
          <SimpleGrid 
            columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} 
            spacing={6}
          >
            <AnimatePresence>
              {filteredBusinesses.map((business, index) => (
                <motion.div
                  key={business.business_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  layout
                >
                  <BusinessCard business={business} />
                </motion.div>
              ))}
            </AnimatePresence>
          </SimpleGrid>
        )}
        </motion.div>
      </Container>

      {/* Call to Action */}
      
    </Box>
  );
};

export default BusinessDirectoryPage;
