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
  VStack,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  Tag,
} from '@chakra-ui/react';
import { FaSearch, FaStar, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { attractionService, cityService, regionService } from '../services/api';

// Helper function to get attraction images based on type
const getAttractionImageByType = (type) => {
  const typeImages = {
    'historical': '1557680510-5b4d0f23d5b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80', // Historical sites
    'cultural': '1486911278254-a96cdee8f61a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Cultural sites
    'natural': '1565353938851-20361937fcf2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80', // Natural landmarks
    'beach': '1555400038-63f5eb0cb97a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Beaches
    'garden': '1528820810856-ec912ff49071?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Gardens
    'market': '1550452333-48cf320bbcb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Markets
    'mosque': '1539980184962-811164d3bd55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80', // Mosques
    'palace': '1582376352720-84de28742c18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80', // Palaces
    'desert': '1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1421&q=80', // Desert
    'mountain': '1486771586447-de892eecbb6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80', // Mountains
  };
  
  return typeImages[type.toLowerCase()] || getRandomMoroccoAttraction();
};

// Helper function for random Moroccan attraction images
const getRandomMoroccoAttraction = () => {
  const attractionImages = [
    '1595991209486-01c05fa9e812?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80', // Moroccan doorway
    '1539072692047-3bd38673d8ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Moroccan architecture
    '1548240693-c7d69e8c2583?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Moroccan fountain
    '1539020140153-e8c237425f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80', // Moroccan landscape
    '15454240-049a21ef9eea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80', // Moroccan tiled fountain
  ];
  
  const randomIndex = Math.floor(Math.random() * attractionImages.length);
  return attractionImages[randomIndex];
};

const MotionBox = motion(Box);

const AttractionCard = ({ attraction }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="md"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box h="200px" overflow="hidden" position="relative">
        {attraction.is_featured && (
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
          src={attraction.photos && attraction.photos.length > 0 
            ? `https://images.unsplash.com/photo-${getAttractionImageByType(attraction.type || 'cultural')}` 
            : `https://images.unsplash.com/photo-${getRandomMoroccoAttraction()}`}
          alt={attraction.name}
          objectFit="cover"
          w="100%"
          h="100%"
          transition="transform 0.3s ease"
          _hover={{ transform: 'scale(1.05)' }}
          fallbackSrc="https://images.unsplash.com/photo-1539020140153-e8c237425f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        />
      </Box>
      
      <Box p={5} flex="1" display="flex" flexDirection="column">
        <Flex justify="space-between" align="center" mb={2}>
          <Heading as="h3" size="md" noOfLines={1}>
            {attraction.name}
          </Heading>
          {attraction.is_featured && (
            <Badge colorScheme="yellow" variant="solid" fontSize="xs">
              Featured
            </Badge>
          )}
        </Flex>
        
        <Flex align="center" mb={2}>
          <Icon as={FaMapMarkerAlt} color="brand.primary" mr={1} />
          <Text fontSize="sm" color="gray.600">
            {attraction.city?.name || 'Location not specified'}, {attraction.region?.name || ''}
          </Text>
        </Flex>
        
        <Text noOfLines={3} mb={4} color="gray.600" fontSize="sm" flex="1">
          {attraction.description || 'No description available'}
        </Text>
        
        <Flex wrap="wrap" mb={4} gap={1}>
          {attraction.tags?.map((tag, index) => (
            <Tag key={index} size="sm" colorScheme="green" variant="subtle">
              {tag}
            </Tag>
          ))}
        </Flex>
        
        <Flex justify="space-between" align="center" mt="auto">
          <Badge colorScheme="blue">
            {attraction.category || 'Uncategorized'}
          </Badge>
          <Button
            as={RouterLink}
            to={`/attractions/${attraction.attraction_id}`}
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

const AttractionsPage = () => {
  const [attractions, setAttractions] = useState([]);
  const [filteredAttractions, setFilteredAttractions] = useState([]);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Define color mode values at the top level of the component
  const bgColor = useColorModeValue('white', 'gray.700');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would use:
        // const attractionsResponse = await attractionService.getAll();
        // setAttractions(attractionsResponse.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          const mockAttractions = [
            {
              attraction_id: 1,
              name: 'Jardin Majorelle',
              description: 'A two and half acre garden designed by French artist Jacques Majorelle in the 1920s and 1930s, with a stunning cobalt blue villa. Later owned by Yves Saint Laurent, it houses the Islamic Art Museum of Marrakech.',
              city: { city_id: 1, name: 'Marrakech' },
              region: { region_id: 1, name: 'Marrakech-Safi' },
              category: 'Garden',
              tags: ['Garden', 'Museum', 'Art'],
              is_featured: true,
              photos: null,
              entrance_fee: '70 MAD',
              opening_hours: '8:00 AM - 6:00 PM',
              website: 'https://jardinmajorelle.com',
              latitude: 31.6423,
              longitude: -8.0035
            },
            {
              attraction_id: 2,
              name: 'Hassan II Mosque',
              description: 'A stunning mosque on the coast of Casablanca, featuring the world\'s tallest minaret at 210 meters. It\'s one of the few mosques in Morocco open to non-Muslims, offering guided tours of its breathtaking interior.',
              city: { city_id: 2, name: 'Casablanca' },
              region: { region_id: 2, name: 'Casablanca-Settat' },
              category: 'Religious Site',
              tags: ['Mosque', 'Architecture', 'Landmark'],
              is_featured: true,
              photos: null,
              entrance_fee: '120 MAD',
              opening_hours: '9:00 AM - 3:00 PM (Closed Fridays)',
              website: 'https://www.mosqueehassan2.com',
              latitude: 33.6086,
              longitude: -7.6326
            },
            {
              attraction_id: 3,
              name: 'Chefchaouen Blue City',
              description: 'Known as the "Blue Pearl of Morocco," this mountain town is famous for its striking blue-washed buildings. Wander through its picturesque streets, shop for local crafts, and enjoy the relaxed atmosphere of this unique destination.',
              city: { city_id: 3, name: 'Chefchaouen' },
              region: { region_id: 3, name: 'Tangier-Tetouan-Al Hoceima' },
              category: 'Historic City',
              tags: ['Blue City', 'Photography', 'Shopping'],
              is_featured: true,
              photos: null,
              entrance_fee: 'Free',
              opening_hours: 'Open 24 hours',
              website: null,
              latitude: 35.1714,
              longitude: -5.2697
            },
            {
              attraction_id: 4,
              name: 'Bahia Palace',
              description: 'A late 19th-century palace built for the personal use of Si Moussa, grand vizier of the sultan. The name means "brilliance" and it features stunning examples of Moroccan and Islamic architecture and garden design.',
              city: { city_id: 1, name: 'Marrakech' },
              region: { region_id: 1, name: 'Marrakech-Safi' },
              category: 'Palace',
              tags: ['Architecture', 'History', 'Palace'],
              is_featured: false,
              photos: null,
              entrance_fee: '70 MAD',
              opening_hours: '9:00 AM - 5:00 PM',
              website: null,
              latitude: 31.6218,
              longitude: -7.9836
            },
            {
              attraction_id: 5,
              name: 'Erg Chebbi Dunes',
              description: 'Spectacular sand dunes reaching heights of up to 150 meters, offering a quintessential Sahara Desert experience. Visitors can enjoy camel treks, overnight stays in desert camps, and stunning sunrise/sunset views.',
              city: { city_id: 4, name: 'Merzouga' },
              region: { region_id: 4, name: 'Drâa-Tafilalet' },
              category: 'Natural Wonder',
              tags: ['Desert', 'Sahara', 'Adventure'],
              is_featured: true,
              photos: null,
              entrance_fee: 'Varies by tour',
              opening_hours: 'Open 24 hours',
              website: null,
              latitude: 31.1499,
              longitude: -3.9772
            },
            {
              attraction_id: 6,
              name: 'Fes El Bali (Old Medina)',
              description: 'The ancient walled city of Fes, founded in the 9th century and home to the world\'s oldest university. This UNESCO World Heritage site contains thousands of narrow streets, historic buildings, and traditional artisan workshops.',
              city: { city_id: 5, name: 'Fes' },
              region: { region_id: 5, name: 'Fès-Meknès' },
              category: 'Medina',
              tags: ['UNESCO', 'History', 'Shopping'],
              is_featured: true,
              photos: null,
              entrance_fee: 'Free',
              opening_hours: 'Open 24 hours',
              website: null,
              latitude: 34.0651,
              longitude: -4.9780
            }
          ];
          
          setAttractions(mockAttractions);
          setFilteredAttractions(mockAttractions);
          
          // Extract unique categories from attractions
          const uniqueCategories = [...new Set(
            mockAttractions.map(attraction => attraction.category)
          )];
          setCategories(uniqueCategories);
          
          // Extract unique cities and regions
          const uniqueCities = [...new Set(
            mockAttractions.map(attraction => attraction.city).filter(Boolean)
          )];
          setCities(uniqueCities);
          
          const uniqueRegions = [...new Set(
            mockAttractions.map(attraction => attraction.region).filter(Boolean)
          )];
          setRegions(uniqueRegions);
          
          setLoading(false);
        }, 1000);
        
        // In a real implementation, you would also fetch cities and regions:
        // const citiesResponse = await cityService.getAll();
        // setCities(citiesResponse.data);
        // const regionsResponse = await regionService.getAll();
        // setRegions(regionsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load attractions. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    let results = attractions;
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(attraction => 
        attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (attraction.description && attraction.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply city filter
    if (selectedCity) {
      results = results.filter(attraction => 
        attraction.city && attraction.city.city_id === parseInt(selectedCity)
      );
    }
    
    // Apply region filter
    if (selectedRegion) {
      results = results.filter(attraction => 
        attraction.region && attraction.region.region_id === parseInt(selectedRegion)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      results = results.filter(attraction => 
        attraction.category === selectedCategory
      );
    }
    
    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        default:
          return 0;
      }
    });
    
    setFilteredAttractions(results);
  }, [attractions, searchTerm, selectedCity, selectedRegion, selectedCategory, sortBy]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedRegion('');
    setSelectedCategory('');
    setSortBy('name');
    setFilteredAttractions(attractions);
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
      
      <Container maxW="container.xl" position="relative" zIndex={3} mt={-8}>
        {/* Search and Filters */}
        <Box
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          p={6}
          borderRadius="xl"
          boxShadow="lg"
        >
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
                  placeholder="Search attractions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <Select
                placeholder="All Regions"
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedCity(''); // Reset city when region changes
                }}
              >
                {regions.map((region) => (
                  <option key={region.region_id} value={region.region_id}>
                    {region.name}
                  </option>
                ))}
              </Select>
              
              <Select
                placeholder="All Cities"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                isDisabled={!selectedRegion}
              >
                {cities
                  .filter(city => !selectedRegion || (city.region_id === parseInt(selectedRegion)))
                  .map((city) => (
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
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
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
        </Box>
        
        {/* Results */}
        {filteredAttractions.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg">No attractions found matching your criteria.</Text>
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
              Showing {filteredAttractions.length} {filteredAttractions.length === 1 ? 'attraction' : 'attractions'}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {filteredAttractions.map((attraction) => (
                <AttractionCard key={attraction.attraction_id} attraction={attraction} />
              ))}
            </SimpleGrid>
          </>
        )}
        
        {/* Map CTA */}
        <Box
          mt={16}
          p={8}
          borderRadius="xl"
          position="relative"
          overflow="hidden"
          boxShadow="lg"
          textAlign="center"
        >
          {/* Background with pattern overlay */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear(to-r, brand.primary, brand.dark)"
            opacity="0.95"
            zIndex="0"
          />
          
          {/* Decorative patterns */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            backgroundImage="url('https://www.transparenttextures.com/patterns/arabesque.png')"
            opacity="0.1"
            zIndex="1"
          />
          
          {/* Corner accent elements */}
          <Box
            position="absolute"
            top="-30px"
            left="-30px"
            width="100px"
            height="100px"
            borderRadius="full"
            bg="brand.accent"
            opacity="0.2"
            zIndex="1"
          />
          <Box
            position="absolute"
            bottom="-20px"
            right="-20px"
            width="80px"
            height="80px"
            borderRadius="full"
            bg="brand.accent"
            opacity="0.2"
            zIndex="1"
          />
          
          {/* Content */}
          <Box position="relative" zIndex="2" color="white">
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
        </Box>
      </Container>
    </Box>
  );
};

export default AttractionsPage;
