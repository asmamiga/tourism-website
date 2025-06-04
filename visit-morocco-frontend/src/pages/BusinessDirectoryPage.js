import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Input,
  Select,
  Button,
  Badge,
  Image,
  Stack,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaSearch, FaStar, FaMapMarkerAlt, FaPhone, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { businessService, cityService } from '../services/api';

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
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      bg="white"
      boxShadow="0 10px 30px rgba(0,0,0,0.1)"
      _hover={{ 
        transform: 'translateY(-10px)', 
        boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
        borderColor: 'brand.primary'
      }}
      transitionProperty="all"
      transitionDuration="0.3s"
      transitionTimingFunction="ease"
    >
      <Box h="200px" overflow="hidden">
        {business.is_featured && (
          <Box
            position="absolute"
            top="10px"
            right="10px"
            zIndex="1"
            bg="brand.accent"
            color="white"
            fontWeight="bold"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
            boxShadow="0 2px 10px rgba(0,0,0,0.2)"
            transform="rotate(5deg)"
          >
            Featured
          </Box>
        )}
        <Image
          src={business.photos && business.photos.length > 0 
            ? `https://images.unsplash.com/photo-${getBusinessImageByCategory(business.category_id)}` 
            : `https://images.unsplash.com/photo-${getRandomMoroccoImage()}`}
          alt={business.name}
          objectFit="cover"
          w="100%"
          h="100%"
          transition="transform 0.5s ease"
          _hover={{ transform: 'scale(1.1)' }}
          fallbackSrc="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        />
      </Box>
      <Box p={6}>
        <Heading 
          as="h3" 
          size="md" 
          noOfLines={1} 
          mb={3} 
          color="brand.dark"
          fontWeight="600"
        >
          {business.name}
        </Heading>
        
        <Flex align="center" mb={3}>
          <Box 
            bg="rgba(56, 161, 105, 0.1)" 
            p={1.5} 
            borderRadius="md" 
            mr={2}
          >
            <Icon as={FaMapMarkerAlt} color="brand.primary" fontSize="sm" />
          </Box>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {business.city?.name || 'Location not specified'}
          </Text>
        </Flex>
        
        <Flex align="center" mb={3} bg="rgba(236, 201, 75, 0.1)" p={2} borderRadius="md" width="fit-content">
          <Box display="flex" alignItems="center">
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                as={FaStar}
                color={i < Math.floor(business.avg_rating || 0) ? 'brand.accent' : 'gray.300'}
                mr={0.5}
                fontSize="sm"
              />
            ))}
            <Text fontSize="sm" ml={1} fontWeight="600" color="gray.700">
              {business.avg_rating ? business.avg_rating.toFixed(1) : 'No ratings'}
            </Text>
          </Box>
        </Flex>
        
        <Text noOfLines={2} mb={5} color="gray.600" fontSize="sm" lineHeight="1.6">
          {business.description || 'No description available'}
        </Text>
        
        <Flex justify="space-between" align="center">
          <Badge 
            bg="brand.lightGreen" 
            color="brand.darkGreen" 
            py={1.5} 
            px={3} 
            borderRadius="full"
            fontWeight="500"
          >
            {business.category?.name || 'Uncategorized'}
          </Badge>
          <Button
            as={RouterLink}
            to={`/businesses/${business.business_id}`}
            size="sm"
            bg="transparent"
            color="brand.primary"
            fontWeight="600"
            _hover={{ 
              bg: 'brand.primary', 
              color: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            borderWidth="2px"
            borderColor="brand.primary"
            borderRadius="full"
            transition="all 0.3s ease"
          >
            View Details
          </Button>
        </Flex>
      </Box>
    </MotionBox>
  );
};

const BusinessDirectoryPage = () => {
  // Define color mode values at the top level of the component
  const bgColor = useColorModeValue('white', 'gray.700');
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use mock data for development
        // In a real implementation, you would use:
        // const businessesResponse = await businessService.getAll();
        // setBusinesses(businessesResponse.data);
        
        // For now, we'll use mock data with a timeout to simulate network delay
        setTimeout(() => {
          const mockBusinesses = [
            {
              business_id: 1,
              name: 'Riad El Fenn',
              description: 'Luxury riad in the heart of Marrakech medina offering traditional accommodations with modern amenities.',
              category_id: 1,
              category: { category_id: 1, name: 'Accommodations', icon: 'FaBed' },
              city_id: 1,
              city: { city_id: 1, name: 'Marrakech' },
              address: 'Derb Moullay Abdullah Ben Hussain, Marrakech 40000',
              latitude: 31.6295,
              longitude: -7.9811,
              phone: '+212 524 44 12 10',
              email: 'info@riadelfenn.com',
              website: 'https://www.riadelfenn.com',
              avg_rating: 4.8,
              reviews_count: 426,
              price_range: '$$$$',
              is_featured: true,
              photos: []
            },
            {
              business_id: 2,
              name: 'La Mamounia Spa',
              description: 'Award-winning spa offering traditional Moroccan hammam and beauty treatments in a luxurious setting.',
              category_id: 2,
              category: { category_id: 2, name: 'Wellness & Spa', icon: 'FaSpa' },
              city_id: 1,
              city: { city_id: 1, name: 'Marrakech' },
              address: 'Avenue Bab Jdid, Marrakech 40040',
              latitude: 31.6226,
              longitude: -7.9950,
              phone: '+212 524 38 86 00',
              email: 'spa@mamounia.com',
              website: 'https://www.mamounia.com/en/wellness-spa',
              avg_rating: 4.9,
              reviews_count: 312,
              price_range: '$$$$',
              is_featured: true,
              photos: []
            },
            {
              business_id: 3,
              name: 'Café Clock',
              description: 'Cultural café serving Moroccan fusion cuisine alongside storytelling events and cooking classes.',
              category_id: 3,
              category: { category_id: 3, name: 'Food & Dining', icon: 'FaUtensils' },
              city_id: 2,
              city: { city_id: 2, name: 'Fes' },
              address: '7 Derb el Magana, Talaa Kbira, Fes 30000',
              latitude: 34.0642,
              longitude: -4.9766,
              phone: '+212 535 63 78 55',
              email: 'fes@cafeclock.com',
              website: 'https://www.cafeclock.com',
              avg_rating: 4.6,
              reviews_count: 289,
              price_range: '$$',
              is_featured: false,
              photos: []
            },
            {
              business_id: 4,
              name: 'Atlas Trek Shop',
              description: 'Outdoor equipment store specializing in trekking and hiking gear for Atlas Mountain adventures.',
              category_id: 4,
              category: { category_id: 4, name: 'Shopping', icon: 'FaShoppingBag' },
              city_id: 3,
              city: { city_id: 3, name: 'Imlil' },
              address: 'Main Street, Imlil 42152',
              latitude: 31.1363,
              longitude: -7.9197,
              phone: '+212 666 55 44 33',
              email: 'info@atlastrekshop.com',
              website: 'https://www.atlastrekshop.com',
              avg_rating: 4.7,
              reviews_count: 124,
              price_range: '$$',
              is_featured: false,
              photos: []
            },
            {
              business_id: 5,
              name: 'Sahara Desert Tours',
              description: 'Tour operator offering guided camel treks and camping experiences in the Sahara Desert.',
              category_id: 5,
              category: { category_id: 5, name: 'Tours & Activities', icon: 'FaRoute' },
              city_id: 4,
              city: { city_id: 4, name: 'Merzouga' },
              address: 'Hassi Labied, Merzouga 52202',
              latitude: 31.0842,
              longitude: -4.0135,
              phone: '+212 678 99 00 11',
              email: 'bookings@saharadesert.com',
              website: 'https://www.saharadesert-tours.com',
              avg_rating: 4.8,
              reviews_count: 356,
              price_range: '$$$',
              is_featured: true,
              photos: []
            },
            {
              business_id: 6,
              name: 'Taros Café',
              description: 'Rooftop café-restaurant with sea views serving Moroccan and international cuisine.',
              category_id: 3,
              category: { category_id: 3, name: 'Food & Dining', icon: 'FaUtensils' },
              city_id: 5,
              city: { city_id: 5, name: 'Essaouira' },
              address: 'Place Moulay Hassan, Essaouira 44000',
              latitude: 31.5126,
              longitude: -9.7700,
              phone: '+212 524 47 64 07',
              email: 'info@taroscafe.com',
              website: 'https://www.taroscafe.com',
              avg_rating: 4.5,
              reviews_count: 218,
              price_range: '$$',
              is_featured: false,
              photos: []
            }
          ];
          
          setBusinesses(mockBusinesses);
          setFilteredBusinesses(mockBusinesses);
          
          // Extract unique categories from businesses with defensive programming
          const categoriesMap = {};
          if (Array.isArray(mockBusinesses)) {
            mockBusinesses.forEach(business => {
              if (business && business.category && business.category.category_id) {
                categoriesMap[business.category.category_id] = business.category;
              }
            });
          }
          setCategories(Object.values(categoriesMap));
          
          // Mock cities data
          const mockCities = [
            { city_id: 1, name: 'Marrakech', region_id: 1 },
            { city_id: 2, name: 'Fes', region_id: 2 },
            { city_id: 3, name: 'Imlil', region_id: 1 },
            { city_id: 4, name: 'Merzouga', region_id: 3 },
            { city_id: 5, name: 'Essaouira', region_id: 1 },
            { city_id: 6, name: 'Chefchaouen', region_id: 4 },
            { city_id: 7, name: 'Casablanca', region_id: 5 },
            { city_id: 8, name: 'Tangier', region_id: 6 }
          ];
          setCities(mockCities);
          
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load businesses. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    // Make sure businesses is an array with defensive check
    if (!Array.isArray(businesses)) {
      console.error('Businesses is not an array:', businesses);
      return; // Exit early if businesses is not an array
    }
    
    let results = [...businesses]; // Create a copy to avoid mutation
    
    // Apply search term filter
    if (searchTerm && searchTerm.trim() !== '') {
      results = results.filter(business => 
        (business && business.name && typeof business.name === 'string' && 
          business.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (business && business.description && typeof business.description === 'string' && 
          business.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply city filter
    if (selectedCity && selectedCity.trim() !== '') {
      results = results.filter(business => 
        business && business.city_id !== undefined && 
        business.city_id === parseInt(selectedCity)
      );
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory.trim() !== '') {
      results = results.filter(business => 
        business && business.category_id !== undefined && 
        business.category_id === parseInt(selectedCategory)
      );
    }
    
    // Apply sorting - ensure results is still an array
    if (Array.isArray(results) && results.length > 0) {
      results.sort((a, b) => {
        if (!a || !b) return 0;
        
        switch (sortBy) {
          case 'name':
            return (a.name && typeof a.name === 'string') && (b.name && typeof b.name === 'string') ? 
              a.name.localeCompare(b.name) : 0;
          case 'rating':
            return (b.avg_rating || 0) - (a.avg_rating || 0);
          case 'featured':
            return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
          default:
            return 0;
        }
      });
    }
    
    setFilteredBusinesses(results);
  }, [businesses, searchTerm, selectedCity, selectedCategory, sortBy]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedCategory('');
    setSortBy('name');
    setFilteredBusinesses(businesses);
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
      <Container maxW="container.xl" py={10}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="calc(100vh - 80px)">
      {/* Hero Section */}
      <Box
        bg="brand.dark"
        color="white"
        py={12}
        position="relative"
        overflow="hidden"
      >
        {/* Decorative Elements */}
        <Box
          position="absolute"
          right="5%"
          top="10%"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="rgba(255,255,255,0.03)"
        />
        <Box
          position="absolute"
          left="10%"
          bottom="10%"
          w="150px"
          h="150px"
          borderRadius="full"
          bg="rgba(255,255,255,0.05)"
        />

        <Container maxW="container.xl">
          <Box maxW="container.md">
            <Heading
              as="h1"
              size="2xl"
              mb={4}
              fontWeight="800"
              bgGradient="linear(to-r, white, brand.accent)"
              bgClip="text"
            >
              Explore Moroccan Businesses
            </Heading>
            <Text
              fontSize="xl"
              mb={6}
              lineHeight="1.8"
              color="gray.300"
              maxW="container.sm"
            >
              Discover and connect with the best authentic businesses across Morocco, from restaurants to artisan shops and wellness experiences.
            </Text>

            {/* Search Bar */}
            <Box
              bg="white"
              p={1.5}
              borderRadius="full"
              display="flex"
              boxShadow="0 10px 30px rgba(0,0,0,0.15)"
              mb="-80px"
              position="relative"
              zIndex="1"
              maxW="800px"
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
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
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" pt={20} pb={16}>

        {/* Filters */}
        <Box
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="md"
        >
          <Box mb={10} mt={8}>
            <Flex direction={{ base: 'column', md: 'row' }} gap={4} wrap="wrap" justify="space-between" align="center">
              <Box>
                <Heading as="h2" size="lg" color="brand.dark" mb={2} fontWeight="700">
                  Find Your Perfect Experience
                </Heading>
                <Text color="gray.600">Filter and sort to discover businesses that match your interests</Text>
              </Box>

              <Flex gap={3} flexWrap="wrap" justify={{ base: 'flex-start', md: 'flex-end' }}>
                <Select
                  placeholder="Filter by city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  w={{ base: '100%', sm: '150px' }}
                  bg="white"
                  borderRadius="full"
                  boxShadow="sm"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'brand.primary' }}
                  size="md"
                  icon={<Icon as={FaMapMarkerAlt} color="gray.400" />}
                >
                  {cities.map(city => (
                    <option key={city.city_id} value={city.city_id}>
                      {city.name}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  w={{ base: '100%', sm: '150px' }}
                  bg="white"
                  borderRadius="full"
                  boxShadow="sm"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'brand.primary' }}
                  size="md"
                >
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </Select>

                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  w={{ base: '100%', sm: '150px' }}
                  bg="white"
                  borderRadius="full"
                  boxShadow="sm"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'brand.primary' }}
                  size="md"
                >
                  <option value="name">Sort by name</option>
                  <option value="rating">Sort by rating</option>
                  <option value="featured">Featured first</option>
                </Select>
              </Flex>
            </Flex>
          </Box>
          <Flex justify="flex-end">
            <Button
              colorScheme="gray"
              variant="outline"
              onClick={handleReset}
            >
              Reset Filters
            </Button>
          </Flex>
        </Box>

        {/* Results */}
        {filteredBusinesses.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg">No businesses found matching your criteria.</Text>
            <Button
              mt={4}
              colorScheme="green"
              onClick={handleReset}
            >
              Clear Filters
            </Button>
          </Box>
        ) : (
          <>
            <Text mb={5} color="gray.600">
              Showing {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? 'es' : ''}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {filteredBusinesses.map(business => (
                <BusinessCard key={business.business_id} business={business} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Container>

      {/* Call to Action */}
      <Box
        bg="linear-gradient(to right, #38A169, #276749)"
        py={16}
        color="white"
        position="relative"
        overflow="hidden"
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

        <Container maxW="container.xl" textAlign="center" position="relative" zIndex="1">
          <Heading as="h2" size="xl" mb={4} fontWeight="bold">
            Own a Business in Morocco?
          </Heading>
          <Text fontSize="lg" mb={8} maxW="700px" mx="auto" lineHeight="1.7">
            Join our platform to showcase your business to thousands of travelers 
            looking for authentic Moroccan experiences.
          </Text>
          <Button 
            as={RouterLink} 
            to="/business-signup" 
            size="lg" 
            bg="white" 
            color="brand.primary" 
            _hover={{ 
              transform: 'translateY(-5px)', 
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
              bg: 'gray.50'
            }}
            px={8}
            py={7}
            borderRadius="full"
            fontWeight="bold"
            transition="all 0.3s ease"
          >
            List Your Business
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default BusinessDirectoryPage;
