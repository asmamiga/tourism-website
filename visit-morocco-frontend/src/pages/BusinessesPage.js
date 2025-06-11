import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  useToast,
  Text,
  Badge,
  Image,
  Flex,
  Stack,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt, FaStar, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { businessService, cityService } from '../services/api';

const MotionBox = motion(Box);

const BusinessCard = ({ business }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('brand.primary', 'brand.accent');

  // Handle missing images
  const defaultImage = 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
  const imageUrl = business.photos?.[0]?.photo_path 
    ? `http://localhost:8000/storage/${business.photos[0].photo_path}`
    : defaultImage;

  return (
    <MotionBox
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: 'lg' }}
      transition={{ duration: 0.3 }}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      shadow="md"
      _hover={{ shadow: 'xl' }}
    >
      <Box h="180px" overflow="hidden">
        <Image
          src={imageUrl}
          alt={business.name}
          objectFit="cover"
          w="100%"
          h="100%"
          _hover={{ transform: 'scale(1.05)' }}
          transition="transform 0.3s ease"
        />
      </Box>
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size="md" color={headingColor} noOfLines={1}>
            {business.name}
          </Heading>
          <Badge colorScheme="green" variant="subtle">
            {business.category?.name || 'Business'}
          </Badge>
        </Flex>
        
        <Flex align="center" color={textColor} mb={2}>
          <FaMapMarkerAlt style={{ marginRight: '4px' }} />
          <Text fontSize="sm" noOfLines={1}>
            {business.city?.name || 'Morocco'}
          </Text>
        </Flex>
        
        <Flex align="center" mb={3}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              color={star <= (business.average_rating || 0) ? '#FFD700' : '#E2E8F0'}
              style={{ marginRight: '2px' }}
            />
          ))}
          <Text ml={1} fontSize="sm" color={textColor}>
            ({business.reviews_count || 0})
          </Text>
        </Flex>
        
        <Text color={textColor} noOfLines={2} fontSize="sm" mb={4}>
          {business.description || 'No description available.'}
        </Text>
        
        <Button
          as={Link}
          to={`/businesses/${business.id}`}
          colorScheme="blue"
          size="sm"
          w="full"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="all 0.2s"
        >
          View Details
        </Button>
      </Box>
    </MotionBox>
  );
};

const BusinessesPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch businesses with filters
        const params = {
          ...(filters.category && { category_id: filters.category }),
          ...(filters.city && { city_id: filters.city }),
          ...(filters.search && { search: filters.search }),
          with: 'city,category,photos',
        };
        
        const businessesRes = await businessService.getAll({ params });
        setBusinesses(businessesRes.data.data || []);

        // Fetch categories if not already loaded
        if (categories.length === 0) {
          const categoriesRes = await businessService.getAll({}, 'categories');
          setCategories(categoriesRes.data.data || []);
        }

        // Fetch cities if not already loaded
        if (cities.length === 0) {
          const citiesRes = await cityService.getAll();
          setCities(citiesRes.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast({
          title: 'Error',
          description: 'Failed to load businesses. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, categories.length, cities.length, toast]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.search.value;
    setFilters(prev => ({
      ...prev,
      search: searchValue
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      city: '',
      search: '',
    });
  };

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          mb={8}
        >
          <Heading as="h1" size="xl" mb={2} color={useColorModeValue('gray.800', 'white')}>
            Explore Moroccan Businesses
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.300')}>
            Discover the best businesses and services across Morocco
          </Text>
        </MotionBox>

        {/* Search and Filter Bar */}
        <Box mb={8} bg={cardBg} p={6} borderRadius="lg" boxShadow="sm">
          <form onSubmit={handleSearch}>
            <InputGroup size="lg" mb={4}>
              <InputLeftElement pointerEvents="none">
                <FaSearch color="gray.400" />
              </InputLeftElement>
              <Input
                type="text"
                name="search"
                placeholder="Search businesses..."
                bg={useColorModeValue('white', 'gray.700')}
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                _hover={{ borderColor: 'brand.primary' }}
                _focus={{
                  borderColor: 'brand.primary',
                  boxShadow: '0 0 0 1px var(--chakra-colors-brand-primary)',
                }}
                defaultValue={filters.search}
              />
              <Button
                type="submit"
                ml={2}
                colorScheme="blue"
                px={6}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'md',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
              >
                Search
              </Button>
            </InputGroup>

            <Button
              type="button"
              leftIcon={<FaFilter />}
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              mb={showFilters ? 4 : 0}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {showFilters && (
              <Flex mt={4} gap={4} flexWrap="wrap">
                <Box flex="1" minW="200px">
                  <Text fontSize="sm" fontWeight="medium" mb={1} color={useColorModeValue('gray.700', 'gray.300')}>
                    Category
                  </Text>
                  <Select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    placeholder="All Categories"
                    bg={useColorModeValue('white', 'gray.700')}
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    _hover={{ borderColor: 'brand.primary' }}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box flex="1" minW="200px">
                  <Text fontSize="sm" fontWeight="medium" mb={1} color={useColorModeValue('gray.700', 'gray.300')}>
                    City
                  </Text>
                  <Select
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    placeholder="All Cities"
                    bg={useColorModeValue('white', 'gray.700')}
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    _hover={{ borderColor: 'brand.primary' }}
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </Box>

                {(filters.category || filters.city || filters.search) && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    colorScheme="red"
                    size="sm"
                    alignSelf="flex-end"
                  >
                    Clear Filters
                  </Button>
                )}
              </Flex>
            )}
          </form>
        </Box>

        {/* Business List */}
        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(6)].map((_, i) => (
              <Box key={i} bg={cardBg} p={4} borderRadius="lg" boxShadow="sm">
                <Skeleton height="180px" mb={4} />
                <Skeleton height="20px" mb={2} width="80%" />
                <Skeleton height="16px" mb={2} width="60%" />
                <Skeleton height="16px" mb={4} width="40%" />
                <Skeleton height="36px" />
              </Box>
            ))}
          </SimpleGrid>
        ) : businesses.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={10} bg={cardBg} borderRadius="lg" boxShadow="sm">
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')} mb={4}>
              No businesses found matching your criteria.
            </Text>
            <Button colorScheme="blue" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default BusinessesPage;