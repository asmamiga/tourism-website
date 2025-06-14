import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Tag,
  TagLabel,
  TagLeftIcon,
  Wrap,
  WrapItem,
  IconButton,
  Collapse,
  useDisclosure,
  Tooltip,
  AspectRatio,
  Skeleton,
  SkeletonText,
  Center,
  Stack,
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
  FaStarHalfAlt,
  FaInfoCircle,
  FaArrowRight,
  FaImage
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import AttractionCard from '../components/attractions/AttractionCard';

// Mock data
import { MOCK_ATTRACTIONS, MOCK_CITIES, MOCK_REGIONS } from '../data/mockData';

const AttractionsPage = () => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.500, teal.400)',
    'linear(to-r, blue.600, teal.500)'
  );
  const emptyStateBg = useColorModeValue('gray.50', 'gray.800');
  const emptyStateIconBg = useColorModeValue('white', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });

  // State for UI and data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    region: '',
    category: '',
    sort: 'featured',
  });
  
  const toast = useToast();

  // Reset filters function
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      city: '',
      region: '',
      category: '',
      sort: 'featured',
    });
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // For now, use mock data
        setAttractions(MOCK_ATTRACTIONS);
        setCities(MOCK_CITIES);
        setRegions(MOCK_REGIONS);
        
        // Extract unique categories from attractions
        const uniqueCategories = [...new Set(
          MOCK_ATTRACTIONS.map(attraction => attraction.category)
        )];
        setCategories(uniqueCategories);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load attractions. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load attractions. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter and sort attractions
  const filteredAttractions = useMemo(() => {
    return attractions.filter(attraction => {
      const matchesSearch = !filters.search || 
        attraction.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (attraction.description && attraction.description.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesCity = !filters.city || (attraction.city && attraction.city.city_id === parseInt(filters.city));
      const matchesRegion = !filters.region || (attraction.region && attraction.region.region_id === parseInt(filters.region));
      const matchesCategory = !filters.category || attraction.category === filters.category;
      
      return matchesSearch && matchesCity && matchesRegion && matchesCategory;
    }).sort((a, b) => {
      switch (filters.sort) {
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || a.name.localeCompare(b.name);
        case 'rating':
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [attractions, filters]);

  if (isLoading) {
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
    <Box position="relative" bg="gray.900" color="white" overflow="hidden" pb={{ base: 20, md: 32 }} pt={{ base: 32, md: 44 }}>
      {/* Background Image */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgImage="url('/images/morocco-attractions-hero.jpg')"
        bgSize="cover"
        bgPosition="center"
        bgAttachment="fixed"
        zIndex={1}
        opacity={0.8}
      />
      
      {/* Gradient Overlay */}
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
              Discover Morocco
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
              Discover Morocco's Attractions
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
              Explore the most breathtaking and culturally significant places across Morocco, from ancient medinas to stunning natural landscapes.
            </Text>
          </MotionBox>
        </VStack>
      </Container>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        {/* Search and Filter Bar */}
        <Box mb={8}>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <InputGroup maxW={{ md: '400px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search attractions..."
                bg={inputBg}
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </InputGroup>
            
            <Select
              placeholder="Filter by city"
              bg={inputBg}
              maxW={{ md: '200px' }}
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.city_id} value={city.city_id}>
                  {city.name}
                </option>
              ))}
            </Select>
            
            <Select
              placeholder="Filter by region"
              bg={inputBg}
              maxW={{ md: '200px' }}
              value={filters.region}
              onChange={(e) => setFilters({...filters, region: e.target.value})}
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region.region_id} value={region.region_id}>
                  {region.name}
                </option>
              ))}
            </Select>
            
            <Select
              placeholder="Sort by"
              bg={inputBg}
              maxW={{ md: '200px' }}
              value={filters.sort}
              onChange={(e) => setFilters({...filters, sort: e.target.value})}
            >
              <option value="featured">Featured</option>
              <option value="rating">Highest Rated</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </Select>
            
            <Button
              colorScheme="brand"
              onClick={resetFilters}
              variant="outline"
              flexShrink={0}
            >
              Reset Filters
            </Button>
          </Flex>
        </Box>

        {/* Results Count */}
        <Flex justify="space-between" align="center" mb={6}>
          <Text color={textColor}>
            Showing {filteredAttractions.length} attraction{filteredAttractions.length !== 1 ? 's' : ''}
          </Text>
        </Flex>

        {/* Attractions Grid */}
        {filteredAttractions.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <AnimatePresence>
              {filteredAttractions.map((attraction) => (
                <AttractionCard key={attraction.attraction_id} attraction={attraction} />
              ))}
            </AnimatePresence>
          </SimpleGrid>
        ) : (
          <Box
            bg={emptyStateBg}
            p={8}
            borderRadius="lg"
            textAlign="center"
          >
            <VStack spacing={4}>
              <Box
                bg={emptyStateIconBg}
                p={4}
                borderRadius="full"
                display="inline-flex"
              >
                <Icon as={FaInfoCircle} boxSize={8} color={textColor} />
              </Box>
              <Heading size="md">No attractions found</Heading>
              <Text color={textColor}>
                Try adjusting your search or filters to find what you're looking for.
              </Text>
              <Button
                colorScheme="brand"
                onClick={resetFilters}
                mt={4}
              >
                Reset all filters
              </Button>
            </VStack>
          </Box>
        )}
      </Container>

      {/* Map CTA Section */}
      <Box bgGradient={bgGradient} py={16} position="relative" overflow="hidden" mt={16}>
        <Container maxW="container.xl" position="relative">
          <Box position="absolute" top="-30px" left="-30px" width="100px" height="100px" borderRadius="full" bg="brand.accent" opacity="0.2" zIndex="1" />
          <Box position="absolute" bottom="-20px" right="-20px" width="80px" height="80px" borderRadius="full" bg="brand.accent" opacity="0.2" zIndex="1" />
          
          <Box position="relative" zIndex="2" color="white" textAlign="center">
            <Heading as="h3" size="lg" mb={4} textShadow="0 2px 4px rgba(0,0,0,0.3)">
              Explore Attractions on the Map
            </Heading>
            <Text fontSize="lg" mb={6} maxW="container.md" mx="auto">
              Discover attractions near your location or plan your route between multiple sites.
              Find hidden gems across Morocco's diverse landscapes.
            </Text>
            <Button
              as={RouterLink}
              to="/attractions-map"
              size="lg"
              colorScheme="white"
              variant="outline"
              _hover={{ bg: 'rgba(255,255,255,0.2)' }}
              leftIcon={<FaMapMarkerAlt />}
              boxShadow="0 4px 8px rgba(0,0,0,0.2)"
              borderWidth="2px"
              py={6}
              px={8}
            >
              Open Interactive Map
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AttractionsPage;