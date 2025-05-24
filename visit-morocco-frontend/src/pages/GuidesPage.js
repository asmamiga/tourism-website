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
    >
      <Flex direction="column" height="100%">
        <Box position="relative">
          <Image
            src={guide.cover_photo 
              ? `http://localhost:8000/storage/${guide.cover_photo}` 
              : 'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80'}
            alt={`${guide.first_name} ${guide.last_name}`}
            objectFit="cover"
            h="200px"
            w="100%"
          />
          <Avatar
            src={guide.profile_picture ? `http://localhost:8000/storage/${guide.profile_picture}` : null}
            name={`${guide.first_name} ${guide.last_name}`}
            size="xl"
            position="absolute"
            bottom="-30px"
            left="50%"
            transform="translateX(-50%)"
            border="4px solid white"
          />
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
          
          // Extract unique cities from guides
          const uniqueCities = [...new Set(
            mockGuides.flatMap(guide => guide.cities || [])
          )];
          setCities(uniqueCities);
          
          // Extract unique specialties from guides
          const uniqueSpecialties = [...new Set(
            mockGuides.flatMap(guide => guide.specialties || [])
          )];
          setSpecialties(uniqueSpecialties);
          
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
    let results = guides;
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(guide => 
        `${guide.first_name} ${guide.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guide.bio && guide.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply city filter
    if (selectedCity) {
      results = results.filter(guide => 
        guide.cities && guide.cities.some(city => city.city_id === parseInt(selectedCity))
      );
    }
    
    // Apply specialty filter
    if (selectedSpecialty) {
      results = results.filter(guide => 
        guide.specialties && guide.specialties.includes(selectedSpecialty)
      );
    }
    
    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'rating':
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        case 'reviews':
          return (b.reviews_count || 0) - (a.reviews_count || 0);
        default:
          return 0;
      }
    });
    
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
    <Box py={10}>
      <Container maxW="container.xl">
        <Heading as="h1" mb={2}>Professional Local Guides</Heading>
        <Text mb={8} color="gray.600">
          Connect with experienced guides for authentic Moroccan experiences
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
        {filteredGuides.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg">No guides found matching your criteria.</Text>
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
              Showing {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {filteredGuides.map((guide) => (
                <GuideCard key={guide.guide_id} guide={guide} />
              ))}
            </SimpleGrid>
          </>
        )}
        
        {/* Become a Guide CTA */}
        <Box
          mt={16}
          p={8}
          borderRadius="lg"
          bg="brand.primary"
          color="white"
          textAlign="center"
        >
          <Heading as="h3" size="lg" mb={4}>
            Are You a Local Guide?
          </Heading>
          <Text fontSize="lg" mb={6}>
            Join our platform to connect with tourists from around the world and share your knowledge of Morocco.
          </Text>
          <Button
            as={RouterLink}
            to="/register?role=guide"
            size="lg"
            colorScheme="white"
            variant="outline"
            _hover={{ bg: 'rgba(255,255,255,0.2)' }}
          >
            Become a Guide
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default GuidesPage;
