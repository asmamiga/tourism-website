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
  Tag,
  Avatar,
} from '@chakra-ui/react';
import { FaSearch, FaStar, FaMapMarkerAlt, FaLanguage, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { guideService, cityService } from '../services/api';

// Helper function to get guide profile images based on specialization
const getGuideImageBySpecialization = (specialization) => {
  const specializationImages = {
    'cultural': '1572102079369-df4d9f0ae9d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    'adventure': '1530262929451-cec235c36c4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    'culinary': '1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'historical': '1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80',
    'desert': '1482690205767-61deebe15ef2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    'photography': '1529665253569-6d01c0eaf7b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'nature': '1480429370139-e0132c086e2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    'shopping': '1516914675197-3d6321e48a3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  };
  
  return specializationImages[specialization?.toLowerCase()] || getRandomGuideImage();
};

// Helper function to get guide avatar images
const getGuideAvatarImage = (gender = 'male') => {
  const maleAvatars = [
    '1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    '1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80',
    '1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  ];
  
  const femaleAvatars = [
    '1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    '1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1376&q=80',
    '1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  ];
  
  const avatars = gender.toLowerCase() === 'female' ? femaleAvatars : maleAvatars;
  const randomIndex = Math.floor(Math.random() * avatars.length);
  return avatars[randomIndex];
};

// Helper function for random Moroccan guide cover images
const getRandomGuideImage = () => {
  const guideImages = [
    '1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80',
    '1528820810855-6d5f471cbc3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    '1539735619554-718435224a31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    '1489493585363-d69e7a23ef72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    '1539647245284-d58df7c23725?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  ];
  
  const randomIndex = Math.floor(Math.random() * guideImages.length);
  return guideImages[randomIndex];
};

const MotionBox = motion(Box);

const GuideCard = ({ guide }) => {
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
      position="relative"
    >
      {/* Decorative corner accent */}
      <Box
        position="absolute"
        top="-10px"
        right="-10px"
        width="60px"
        height="60px"
        borderRadius="full"
        bg="rgba(214, 93, 14, 0.1)"
        zIndex="0"
      />
      
      <Flex direction="column" height="100%" position="relative" zIndex="1">
        <Box position="relative" height="180px" overflow="hidden">
          <Image
            src={guide.cover_photo 
              ? `https://images.unsplash.com/photo-${getGuideImageBySpecialization(guide.specializations?.[0])}` 
              : `https://images.unsplash.com/photo-${getRandomGuideImage()}`}
            alt={`${guide.first_name} ${guide.last_name}`}
            objectFit="cover"
            h="200px"
            w="100%"
          />
          <Box position="absolute" bottom="-28px" left="24px">
            <Avatar 
              src={`https://images.unsplash.com/photo-${getGuideAvatarImage(guide.gender || 'male')}`} 
              name={`${guide.first_name} ${guide.last_name}`} 
              size="lg"
              border="3px solid white"
              boxShadow="md"
              borderRadius="full"
              bg="brand.primary"
              p="2px"
            />
          </Box>
        </Box>
        
        <Box p={6} pt={12} flex="1">
          <Flex justify="center" mb={2}>
            <Heading as="h3" size="md" textAlign="center">
              {guide.first_name} {guide.last_name}
            </Heading>
            {guide.is_verified && (
              <Badge colorScheme="green" ml={2}>
                Verified
              </Badge>
            )}
          </Flex>
          
          <Flex justify="center" align="center" mb={4}>
            <Box display="flex" alignItems="center">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  as={FaStar}
                  color={i < Math.floor(guide.avg_rating || 0) ? 'brand.accent' : 'gray.300'}
                  mr={1}
                  fontSize="sm"
                />
              ))}
              <Text fontSize="sm" ml={1}>
                {guide.avg_rating ? guide.avg_rating.toFixed(1) : 'No ratings'} ({guide.reviews_count || 0})
              </Text>
            </Box>
          </Flex>
          
          <Flex align="center" mb={2}>
            <Icon as={FaMapMarkerAlt} color="brand.primary" mr={2} />
            <Text fontSize="sm">
              {guide.cities?.map(city => city.name).join(', ') || 'Various locations'}
            </Text>
          </Flex>
          
          <Flex align="center" mb={4}>
            <Icon as={FaLanguage} color="brand.primary" mr={2} />
            <Flex wrap="wrap">
              {guide.languages?.map((language, index) => (
                <Tag key={index} size="sm" colorScheme="green" mr={1} mb={1}>
                  {language}
                </Tag>
              ))}
              {!guide.languages && <Text fontSize="sm">Languages not specified</Text>}
            </Flex>
          </Flex>
          
          <Text noOfLines={3} mb={4} fontSize="sm">
            {guide.bio || 'No bio available'}
          </Text>
          
          <Text fontWeight="bold" mb={2}>
            Specialties:
          </Text>
          <Flex wrap="wrap" mb={4}>
            {guide.specialties?.map((specialty, index) => (
              <Tag key={index} size="sm" colorScheme="blue" mr={1} mb={1}>
                {specialty}
              </Tag>
            ))}
            {!guide.specialties && <Text fontSize="sm">Specialties not specified</Text>}
          </Flex>
        </Box>
        
        <Box p={4} borderTopWidth="1px">
          <Button
            as={RouterLink}
            to={`/guides/${guide.guide_id}`}
            colorScheme="green"
            width="100%"
          >
            View Profile
          </Button>
        </Box>
      </Flex>
    </MotionBox>
  );
};

const GuidesPage = () => {
  // Define color mode values at the top level of the component
  const bgColor = useColorModeValue('white', 'gray.700');
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [cities, setCities] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would use:
        // const guidesResponse = await guideService.getAll();
        // setGuides(guidesResponse.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          const mockGuides = [
            {
              guide_id: 1,
              first_name: 'Ahmed',
              last_name: 'Benali',
              profile_picture: null,
              cover_photo: null,
              bio: 'Experienced guide with over 10 years of experience showing tourists the hidden gems of Marrakech. Fluent in Arabic, English, French, and Spanish.',
              avg_rating: 4.8,
              reviews_count: 56,
              is_verified: true,
              languages: ['Arabic', 'English', 'French', 'Spanish'],
              specialties: ['Cultural Tours', 'Food Tours', 'Historical Sites'],
              cities: [{ city_id: 1, name: 'Marrakech' }]
            },
            {
              guide_id: 2,
              first_name: 'Fatima',
              last_name: 'El Mansouri',
              profile_picture: null,
              cover_photo: null,
              bio: 'Native Fes resident specializing in artisanal crafts and traditional Moroccan cooking. I offer unique experiences that combine culture, history, and cuisine.',
              avg_rating: 4.9,
              reviews_count: 42,
              is_verified: true,
              languages: ['Arabic', 'English', 'French'],
              specialties: ['Craft Workshops', 'Cooking Classes', 'Medina Tours'],
              cities: [{ city_id: 2, name: 'Fes' }]
            },
            {
              guide_id: 3,
              first_name: 'Youssef',
              last_name: 'Amrani',
              profile_picture: null,
              cover_photo: null,
              bio: 'Desert expert with deep knowledge of Berber culture and traditions. I offer authentic Sahara experiences including camel treks and overnight desert camps.',
              avg_rating: 4.7,
              reviews_count: 38,
              is_verified: true,
              languages: ['Arabic', 'English', 'Berber'],
              specialties: ['Desert Tours', 'Berber Culture', 'Stargazing'],
              cities: [{ city_id: 3, name: 'Merzouga' }]
            },
            {
              guide_id: 4,
              first_name: 'Nadia',
              last_name: 'Touhami',
              profile_picture: null,
              cover_photo: null,
              bio: 'Art historian and photographer specializing in Moroccan architecture and design. My tours focus on the aesthetic and cultural significance of Morocco\'s most beautiful buildings.',
              avg_rating: 4.6,
              reviews_count: 29,
              is_verified: true,
              languages: ['Arabic', 'English', 'French', 'Italian'],
              specialties: ['Architecture Tours', 'Photography', 'Art History'],
              cities: [{ city_id: 1, name: 'Marrakech' }, { city_id: 4, name: 'Casablanca' }]
            },
            {
              guide_id: 5,
              first_name: 'Karim',
              last_name: 'Benjelloun',
              profile_picture: null,
              cover_photo: null,
              bio: 'Mountain guide with expertise in the Atlas Mountains. I lead hiking and trekking expeditions of all difficulty levels, from easy day hikes to multi-day treks.',
              avg_rating: 4.9,
              reviews_count: 47,
              is_verified: true,
              languages: ['Arabic', 'English', 'French', 'Berber'],
              specialties: ['Hiking', 'Trekking', 'Mountain Villages'],
              cities: [{ city_id: 5, name: 'Imlil' }, { city_id: 6, name: 'Ouarzazate' }]
            },
            {
              guide_id: 6,
              first_name: 'Leila',
              last_name: 'Ziani',
              profile_picture: null,
              cover_photo: null,
              bio: 'Coastal expert specializing in Essaouira and the Atlantic coast. My tours combine history, culture, and outdoor activities like surfing and kiteboarding.',
              avg_rating: 4.7,
              reviews_count: 31,
              is_verified: true,
              languages: ['Arabic', 'English', 'French'],
              specialties: ['Coastal Tours', 'Water Sports', 'Historical Sites'],
              cities: [{ city_id: 7, name: 'Essaouira' }]
            }
          ];
          
          setGuides(mockGuides);
          setFilteredGuides(mockGuides);
          
          // Extract unique cities from guides with proper object handling
          const uniqueCitiesMap = {};
          mockGuides.forEach(guide => {
            if (guide.cities && Array.isArray(guide.cities)) {
              guide.cities.forEach(city => {
                if (city && city.city_id) {
                  uniqueCitiesMap[city.city_id] = city;
                }
              });
            }
          });
          setCities(Object.values(uniqueCitiesMap));
          
          // Extract unique specialties from guides
          const specialtiesSet = new Set();
          mockGuides.forEach(guide => {
            if (guide.specialties && Array.isArray(guide.specialties)) {
              guide.specialties.forEach(specialty => {
                if (specialty) {
                  specialtiesSet.add(specialty);
                }
              });
            }
          });
          setSpecialties(Array.from(specialtiesSet));
          
          setLoading(false);
        }, 1000);
        
        // In a real implementation, you would also fetch cities:
        // const citiesResponse = await cityService.getAll();
        // setCities(citiesResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load guides. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    // Ensure guides is an array with defensive check
    if (!Array.isArray(guides)) {
      console.error('Guides is not an array:', guides);
      return; // Exit early if guides is not an array
    }
    
    let results = [...guides]; // Create a copy to avoid mutation
    
    // Apply search term filter
    if (searchTerm && searchTerm.trim() !== '') {
      results = results.filter(guide => 
        (guide.first_name && guide.last_name && 
          `${guide.first_name} ${guide.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guide.bio && typeof guide.bio === 'string' && 
          guide.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply city filter
    if (selectedCity && selectedCity.trim() !== '') {
      results = results.filter(guide => 
        guide.cities && Array.isArray(guide.cities) && 
        guide.cities.some(city => city && city.city_id === parseInt(selectedCity))
      );
    }
    
    // Apply specialty filter
    if (selectedSpecialty && selectedSpecialty.trim() !== '') {
      results = results.filter(guide => 
        guide.specialties && Array.isArray(guide.specialties) && 
        guide.specialties.includes(selectedSpecialty)
      );
    }
    
    // Apply sorting - ensure results is still an array
    if (Array.isArray(results) && results.length > 0) {
      results.sort((a, b) => {
        if (!a || !b) return 0;
        
        switch (sortBy) {
          case 'name':
            return `${a.first_name || ''} ${a.last_name || ''}`.localeCompare(
              `${b.first_name || ''} ${b.last_name || ''}`
            );
          case 'rating':
            return (b.avg_rating || 0) - (a.avg_rating || 0);
          case 'reviews':
            return (b.reviews_count || 0) - (a.reviews_count || 0);
          default:
            return 0;
        }
      });
    }
    
    setFilteredGuides(results);
  }, [guides, searchTerm, selectedCity, selectedSpecialty, sortBy]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedSpecialty('');
    setSortBy('name');
    setFilteredGuides(guides);
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
    <Box py={10} position="relative">
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-50px"
        left="-20px"
        width="150px"
        height="150px"
        borderRadius="full"
        bg="rgba(214, 93, 14, 0.1)"
        zIndex="0"
      />
      <Box
        position="absolute"
        top="30px"
        right="-30px"
        width="200px"
        height="200px"
        borderRadius="full"
        bg="rgba(26, 104, 59, 0.08)"
        zIndex="0"
      />
      
      <Container maxW="container.xl" position="relative" zIndex="1">
        {/* Hero section with Moroccan styling */}
        <Box 
          mb={10}
          py={8}
          px={6}
          borderRadius="xl"
          bgGradient="linear(to-r, rgba(255,255,255,0.8), rgba(255,255,255,0.9), rgba(255,255,255,0.8))"
          boxShadow="sm"
          position="relative"
          overflow="hidden"
        >
          <Box 
            position="absolute" 
            top="0" 
            left="0" 
            right="0" 
            height="4px" 
            bgGradient="linear(to-r, brand.primary, brand.accent)" 
          />
          
          <Heading 
            as="h1" 
            size="2xl" 
            mb={4} 
            color="brand.primary" 
            textShadow="0 1px 2px rgba(0,0,0,0.1)"
            textAlign="center"
          >
            Professional Local Guides
          </Heading>
          <Text 
            fontSize="lg" 
            mb={4} 
            maxW="container.md" 
            mx="auto" 
            textAlign="center"
            color="gray.700"
          >
            Connect with experienced guides for authentic Moroccan experiences and unforgettable journeys across the kingdom
          </Text>
        </Box>
        
        {/* Filters */}
        <Box
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="md"
          mb={8}
          position="relative"
          overflow="hidden"
          borderLeft="3px solid"
          borderColor="brand.accent"
          _before={{
            content: '""',
            position: 'absolute',
            top: '0',
            right: '0',
            width: '40px',
            height: '40px',
            borderRadius: 'full',
            bg: 'rgba(214, 93, 14, 0.08)',
            transform: 'translate(50%, -50%)',
            zIndex: '0'
          }}
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
                placeholder="Search guides..."
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
              placeholder="All Specialties"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="reviews">Sort by Number of Reviews</option>
            </Select>
          </Stack>
          
          <Flex justify="flex-end" position="relative" zIndex="1">
            <Button
              colorScheme="brand"
              variant="outline"
              onClick={handleReset}
              borderColor="brand.accent"
              color="brand.accent"
              _hover={{ bg: 'rgba(214, 93, 14, 0.1)' }}
              boxShadow="sm"
            >
              Reset Filters
            </Button>
          </Flex>
        </Box>
        
        {/* Results */}
        <Box 
          position="relative" 
          borderRadius="lg"
          p={6}
          bg="rgba(255,255,255,0.5)"
          boxShadow="sm"
        >
          {/* Subtle decorative element */}
          <Box 
            position="absolute" 
            bottom="-10px" 
            right="-10px" 
            width="120px" 
            height="120px" 
            borderRadius="full" 
            bg="rgba(26, 104, 59, 0.05)" 
            zIndex="0"
          />
          
          {filteredGuides.length === 0 ? (
            <Box textAlign="center" py={10} position="relative" zIndex="1">
              <Text fontSize="lg" color="gray.600">No guides found matching your criteria.</Text>
              <Button
                mt={4}
                colorScheme="brand"
                onClick={handleReset}
                bg="brand.primary"
                _hover={{ bg: 'brand.dark' }}
                boxShadow="md"
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <Box position="relative" zIndex="1">
              <Text mb={6} fontWeight="medium" color="brand.primary" borderBottom="1px solid" borderColor="gray.200" pb={2}>
                Showing {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {filteredGuides.map((guide) => (
                  <GuideCard key={guide.guide_id} guide={guide} />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </Box>
        
        {/* Become a Guide CTA */}
        <Box
          mt={16}
          p={8}
          borderRadius="xl"
          position="relative"
          overflow="hidden"
          boxShadow="lg"
          textAlign="center"
        >
          {/* Background with gradient */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear(to-br, brand.primary, brand.dark)"
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
            backgroundImage="url('https://www.transparenttextures.com/patterns/moroccan-tile.png')"
            opacity="0.15"
            zIndex="1"
          />
          
          {/* Corner accent elements */}
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            width="90px"
            height="90px"
            borderRadius="full"
            bg="brand.accent"
            opacity="0.2"
            zIndex="1"
          />
          <Box
            position="absolute"
            bottom="-30px"
            left="-30px"
            width="120px"
            height="120px"
            borderRadius="full"
            bg="brand.accent"
            opacity="0.2"
            zIndex="1"
          />
          
          {/* Content */}
          <Box position="relative" zIndex="2" color="white">
            <Heading as="h3" size="lg" mb={4} textShadow="0 2px 4px rgba(0,0,0,0.3)">
              Are You a Local Guide?
            </Heading>
            <Text fontSize="lg" mb={6} maxW="container.md" mx="auto">
              Join our platform to connect with tourists from around the world and share your knowledge of Morocco.
              Become part of our community and showcase the authentic beauty of your homeland.
            </Text>
            <Button
              as={RouterLink}
              to="/register?role=guide"
              size="lg"
              colorScheme="white"
              variant="outline"
              _hover={{ bg: 'rgba(255,255,255,0.2)' }}
              boxShadow="0 4px 8px rgba(0,0,0,0.2)"
              borderWidth="2px"
              py={6}
              px={8}
            >
              Become a Guide
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default GuidesPage;
