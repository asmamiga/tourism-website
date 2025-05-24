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

const MotionBox = motion(Box);

const BusinessCard = ({ business }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, transform: 'all 0.3s ease' }}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="md"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
    >
      <Box h="200px" overflow="hidden">
        <Image
          src={business.photos && business.photos.length > 0 
            ? `http://localhost:8000/storage/${business.photos[0].photo_path}` 
            : 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'}
          alt={business.name}
          objectFit="cover"
          w="100%"
          h="100%"
          transition="transform 0.5s ease"
          _hover={{ transform: 'scale(1.1)' }}
        />
      </Box>
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading as="h3" size="md" noOfLines={1}>
            {business.name}
          </Heading>
          {business.is_featured && (
            <Badge colorScheme="yellow" variant="solid" fontSize="xs">
              Featured
            </Badge>
          )}
        </Flex>
        
        <Flex align="center" mb={2}>
          <Icon as={FaMapMarkerAlt} color="brand.primary" mr={1} />
          <Text fontSize="sm" color="gray.600">
            {business.city?.name || 'Location not specified'}
          </Text>
        </Flex>
        
        <Flex align="center" mb={2}>
          <Box display="flex" alignItems="center">
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                as={FaStar}
                color={i < Math.floor(business.avg_rating || 0) ? 'brand.accent' : 'gray.300'}
                mr={1}
                fontSize="sm"
              />
            ))}
            <Text fontSize="sm" ml={1}>
              {business.avg_rating ? business.avg_rating.toFixed(1) : 'No ratings'}
            </Text>
          </Box>
        </Flex>
        
        <Text noOfLines={2} mb={4} color="gray.600" fontSize="sm">
          {business.description || 'No description available'}
        </Text>
        
        <Flex justify="space-between" align="center">
          <Badge colorScheme="green">
            {business.category?.name || 'Uncategorized'}
          </Badge>
          <Button
            as={RouterLink}
            to={`/businesses/${business.business_id}`}
            size="sm"
            colorScheme="green"
            variant="outline"
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
        
        // Fetch businesses
        const businessesResponse = await businessService.getAll();
        setBusinesses(businessesResponse.data);
        setFilteredBusinesses(businessesResponse.data);
        
        // Extract unique categories from businesses
        const categoriesMap = {};
        businessesResponse.data
          .filter(business => business.category)
          .forEach(business => {
            if (business.category && !categoriesMap[business.category.category_id]) {
              categoriesMap[business.category.category_id] = business.category;
            }
          });
        setCategories(Object.values(categoriesMap));
        
        // Fetch cities
        const citiesResponse = await cityService.getAll();
        setCities(citiesResponse.data);
        
        setLoading(false);
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
    let results = businesses;
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(business => 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (business.description && business.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply city filter
    if (selectedCity) {
      results = results.filter(business => 
        business.city_id === parseInt(selectedCity)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      results = results.filter(business => 
        business.category_id === parseInt(selectedCategory)
      );
    }
    
    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        default:
          return 0;
      }
    });
    
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
    <Box py={10}>
      <Container maxW="container.xl">
        <Heading as="h1" mb={2}>Local Business Directory</Heading>
        <Text mb={8} color="gray.600">
          Discover and connect with local businesses across Morocco
        </Text>
        
        {/* Filters */}
        <Box
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="md"
          mb={8}
        >
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={4}
            mb={4}
          >
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Select
              placeholder="All Cities"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city.city_id} value={city.city_id}>
                  {city.name}
                </option>
              ))}
            </Select>
            
            <Select
              placeholder="All Categories"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="featured">Sort by Featured</option>
            </Select>
          </Stack>
          
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
            <Text mb={4}>
              Showing {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.business_id} business={business} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default BusinessDirectoryPage;
