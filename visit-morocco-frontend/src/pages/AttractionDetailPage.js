import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Flex,
  Badge,
  Button,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Stack,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  Tag,
  Link,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaGlobe, 
  FaMoneyBillWave, 
  FaCalendarAlt,
  FaDirections,
  FaCamera,
  FaInfoCircle
} from 'react-icons/fa';
import { attractionService } from '../services/api';
import AttractionMap from '../components/attractions/AttractionMap';
import AttractionGallery from '../components/attractions/AttractionGallery';
import NearbyAttractions from '../components/attractions/NearbyAttractions';

const MotionBox = motion(Box);

const AttractionDetailPage = () => {
  const { id } = useParams();
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would use:
        // const response = await attractionService.getById(id);
        // setAttraction(response.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          const mockAttraction = {
            attraction_id: parseInt(id),
            name: 'Jardin Majorelle',
            description: 'A two and half acre garden designed by French artist Jacques Majorelle in the 1920s and 1930s, with a stunning cobalt blue villa. Later owned by Yves Saint Laurent, it houses the Islamic Art Museum of Marrakech. The garden contains exotic plants from five continents, flowing streams, and colorful pots. It\'s one of the most visited sites in Morocco and a must-see for anyone visiting Marrakech.',
            long_description: 'The Jardin Majorelle in Marrakech is one of the most visited sites in Morocco. It took French painter Jacques Majorelle (1886-1962) forty years of passion and dedication to create this enchanting garden in the heart of the "Ochre City".\n\nIn 1980, Pierre Bergé and Yves Saint Laurent acquired the Jardin Majorelle, saving it from real estate developers. New plant species were added, and the garden\'s infrastructure was upgraded with an automatic irrigation system. Yves Saint Laurent\'s ashes were scattered in the garden after his death in 2008.\n\nThe garden hosts more than 300 plant species from five continents. The special shade of bold cobalt blue, inspired by the colored tiles common in Moroccan architecture and Berber art, is used extensively throughout the garden and is named after Majorelle himself.\n\nBeyond the botanical aspects, the garden houses the Islamic Art Museum of Marrakech, the Berber Museum, and the Yves Saint Laurent Museum, making it a cultural complex celebrating Moroccan heritage and international art.',
            city: { city_id: 1, name: 'Marrakech' },
            region: { region_id: 1, name: 'Marrakech-Safi' },
            category: 'Garden',
            tags: ['Garden', 'Museum', 'Art', 'YSL', 'Photography'],
            is_featured: true,
            photos: [
              { photo_id: 1, photo_path: null },
              { photo_id: 2, photo_path: null },
              { photo_id: 3, photo_path: null }
            ],
            entrance_fee: '70 MAD for garden, 30 MAD for museum',
            opening_hours: {
              'Monday': '8:00 AM - 6:00 PM',
              'Tuesday': '8:00 AM - 6:00 PM',
              'Wednesday': '8:00 AM - 6:00 PM',
              'Thursday': '8:00 AM - 6:00 PM',
              'Friday': '8:00 AM - 6:00 PM',
              'Saturday': '8:00 AM - 6:00 PM',
              'Sunday': '8:00 AM - 6:00 PM'
            },
            website: 'https://jardinmajorelle.com',
            latitude: 31.6423,
            longitude: -8.0035,
            address: 'Rue Yves St Laurent, Marrakech 40090, Morocco',
            tips: [
              'Visit early in the morning or late afternoon to avoid crowds',
              'The garden and museum require separate tickets',
              'Photography is allowed in the garden but not in the museums',
              'Expect to spend 1-2 hours exploring the entire complex',
              'There\'s a nice café on site for refreshments'
            ],
            history: 'Created by French painter Jacques Majorelle in 1923, the garden was later purchased and restored by fashion designer Yves Saint Laurent and Pierre Bergé in 1980. After Saint Laurent\'s death in 2008, his ashes were scattered in the garden.',
            nearby_attractions: [
              {
                attraction_id: 4,
                name: 'Bahia Palace',
                distance: '2.5 km',
                photo: null
              },
              {
                attraction_id: 7,
                name: 'Koutoubia Mosque',
                distance: '3.1 km',
                photo: null
              },
              {
                attraction_id: 8,
                name: 'Jemaa el-Fnaa',
                distance: '3.4 km',
                photo: null
              }
            ]
          };
          
          setAttraction(mockAttraction);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching attraction details:', err);
        setError('Failed to load attraction details. Please try again later.');
        setLoading(false);
      }
    };

    fetchAttraction();
  }, [id]);

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

  if (!attraction) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="warning">
          <AlertIcon />
          Attraction not found
        </Alert>
      </Container>
    );
  }

  // Default images if no photos available
  const defaultImages = [
    'https://images.unsplash.com/photo-1539020140153-e479b8c64e3c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80',
    'https://images.unsplash.com/photo-1597212720158-e21dad559189?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  ];

  // Get attraction photos or use defaults
  const photos = attraction.photos && attraction.photos.length > 0
    ? attraction.photos.map(photo => `http://localhost:8000/storage/${photo.photo_path}`)
    : defaultImages;

  return (
    <Box py={10}>
      <Container maxW="container.xl">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb Navigation */}
          <HStack spacing={2} mb={4} color="gray.600">
            <RouterLink to="/">Home</RouterLink>
            <Text>/</Text>
            <RouterLink to="/attractions">Attractions</RouterLink>
            <Text>/</Text>
            <Text color="brand.primary">{attraction.name}</Text>
          </HStack>

          {/* Attraction Header */}
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            mb={6}
          >
            <Box>
              <Heading as="h1" size="xl" mb={2}>
                {attraction.name}
                {attraction.is_featured && (
                  <Badge ml={2} colorScheme="yellow" variant="solid">
                    Featured
                  </Badge>
                )}
              </Heading>
              
              <Flex align="center" mb={2}>
                <Icon as={FaMapMarkerAlt} color="brand.primary" mr={2} />
                <Text color="gray.600">
                  {attraction.city?.name}, {attraction.region?.name}
                </Text>
              </Flex>
              
              <Flex wrap="wrap" gap={2}>
                {attraction.tags?.map((tag, index) => (
                  <Tag key={index} colorScheme="green" size="md">
                    {tag}
                  </Tag>
                ))}
              </Flex>
            </Box>
            
            <Button
              as="a"
              href={`https://www.google.com/maps/dir/?api=1&destination=${attraction.latitude},${attraction.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="green"
              size="lg"
              mt={{ base: 4, md: 0 }}
              leftIcon={<FaDirections />}
            >
              Get Directions
            </Button>
          </Flex>

          {/* Photo Gallery */}
          <Box mb={8}>
            <AttractionGallery photos={photos} attractionName={attraction.name} />
          </Box>

          {/* Attraction Details Tabs */}
          <Tabs colorScheme="green" isLazy>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Details</Tab>
              <Tab>Location</Tab>
              <Tab>Visitor Tips</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      About {attraction.name}
                    </Heading>
                    <Text mb={6} whiteSpace="pre-line">
                      {attraction.long_description || attraction.description}
                    </Text>
                    
                    <Heading as="h3" size="md" mb={4}>
                      History
                    </Heading>
                    <Text mb={6}>
                      {attraction.history || 'No historical information available.'}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      Visitor Information
                    </Heading>
                    <Stack spacing={4} mb={6}>
                      <Flex align="center">
                        <Icon as={FaClock} color="brand.primary" mr={3} />
                        <Box>
                          <Text fontWeight="bold">Opening Hours</Text>
                          {typeof attraction.opening_hours === 'object' ? (
                            <Stack spacing={1} mt={1}>
                              {Object.entries(attraction.opening_hours).map(([day, hours]) => (
                                <Flex key={day} justify="space-between">
                                  <Text fontWeight="medium">{day}:</Text>
                                  <Text>{hours}</Text>
                                </Flex>
                              ))}
                            </Stack>
                          ) : (
                            <Text>{attraction.opening_hours}</Text>
                          )}
                        </Box>
                      </Flex>
                      
                      <Flex align="center">
                        <Icon as={FaMoneyBillWave} color="brand.primary" mr={3} />
                        <Box>
                          <Text fontWeight="bold">Entrance Fee</Text>
                          <Text>{attraction.entrance_fee || 'Free'}</Text>
                        </Box>
                      </Flex>
                      
                      {attraction.website && (
                        <Flex align="center">
                          <Icon as={FaGlobe} color="brand.primary" mr={3} />
                          <Box>
                            <Text fontWeight="bold">Website</Text>
                            <Link href={attraction.website} isExternal color="brand.primary">
                              {attraction.website}
                            </Link>
                          </Box>
                        </Flex>
                      )}
                      
                      <Flex align="center">
                        <Icon as={FaMapMarkerAlt} color="brand.primary" mr={3} />
                        <Box>
                          <Text fontWeight="bold">Address</Text>
                          <Text>{attraction.address || 'Address not available'}</Text>
                        </Box>
                      </Flex>
                    </Stack>
                    
                    <Heading as="h3" size="md" mb={4}>
                      Category
                    </Heading>
                    <Badge colorScheme="blue" fontSize="md" px={2} py={1}>
                      {attraction.category || 'Uncategorized'}
                    </Badge>
                  </Box>
                </SimpleGrid>
              </TabPanel>
              
              {/* Details Tab */}
              <TabPanel>
                <Box mb={8}>
                  <Heading as="h3" size="md" mb={4}>
                    What to Expect
                  </Heading>
                  <Text mb={6} whiteSpace="pre-line">
                    {attraction.long_description || attraction.description}
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={6}>
                    <Box>
                      <Heading as="h4" size="sm" mb={3}>
                        Best Time to Visit
                      </Heading>
                      <Text>
                        {attraction.best_time_to_visit || 'Early morning or late afternoon is generally recommended to avoid crowds and enjoy better lighting for photography.'}
                      </Text>
                    </Box>
                    
                    <Box>
                      <Heading as="h4" size="sm" mb={3}>
                        Estimated Duration
                      </Heading>
                      <Text>
                        {attraction.duration || 'Plan to spend 1-2 hours exploring this attraction thoroughly.'}
                      </Text>
                    </Box>
                  </SimpleGrid>
                  
                  <Heading as="h3" size="md" mb={4}>
                    Nearby Attractions
                  </Heading>
                  
                  <NearbyAttractions attractions={attraction.nearby_attractions} />
                </Box>
              </TabPanel>
              
              {/* Location Tab */}
              <TabPanel>
                <Box mb={8}>
                  <Heading as="h3" size="md" mb={4}>
                    Location
                  </Heading>
                  
                  <Text mb={4}>
                    {attraction.address}, {attraction.city?.name}, {attraction.region?.name}
                  </Text>
                  
                  <Box
                    height="400px"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="md"
                    mb={6}
                  >
                    {attraction.latitude && attraction.longitude ? (
                      <AttractionMap
                        latitude={attraction.latitude}
                        longitude={attraction.longitude}
                        attractionName={attraction.name}
                      />
                    ) : (
                      <Flex
                        justify="center"
                        align="center"
                        height="100%"
                        bg="gray.100"
                      >
                        <Text>Map location not available</Text>
                      </Flex>
                    )}
                  </Box>
                  
                  <Heading as="h3" size="md" mb={4}>
                    Getting There
                  </Heading>
                  <Text mb={6}>
                    {attraction.getting_there || `${attraction.name} is located in ${attraction.city?.name}. You can reach it by taxi, public transportation, or as part of a guided tour. From the city center, it's approximately a 15-minute drive.`}
                  </Text>
                  
                  <Button
                    as="a"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${attraction.latitude},${attraction.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    colorScheme="green"
                    leftIcon={<FaDirections />}
                  >
                    Get Directions
                  </Button>
                </Box>
              </TabPanel>
              
              {/* Visitor Tips Tab */}
              <TabPanel>
                <Box mb={8}>
                  <Heading as="h3" size="md" mb={4}>
                    Visitor Tips
                  </Heading>
                  
                  {attraction.tips && attraction.tips.length > 0 ? (
                    <Stack spacing={4} mb={6}>
                      {attraction.tips.map((tip, index) => (
                        <Flex key={index} align="flex-start">
                          <Icon as={FaInfoCircle} color="brand.primary" mt={1} mr={3} />
                          <Text>{tip}</Text>
                        </Flex>
                      ))}
                    </Stack>
                  ) : (
                    <Text mb={6}>No specific tips available for this attraction.</Text>
                  )}
                  
                  <Heading as="h3" size="md" mb={4}>
                    Photography
                  </Heading>
                  <Flex align="flex-start" mb={6}>
                    <Icon as={FaCamera} color="brand.primary" mt={1} mr={3} />
                    <Text>
                      {attraction.photography_info || 'Photography is generally allowed in outdoor areas. Some indoor exhibits may have restrictions. Always respect local customs and any posted signs regarding photography.'}
                    </Text>
                  </Flex>
                  
                  <Heading as="h3" size="md" mb={4}>
                    Best Time to Visit
                  </Heading>
                  <Flex align="flex-start" mb={6}>
                    <Icon as={FaCalendarAlt} color="brand.primary" mt={1} mr={3} />
                    <Text>
                      {attraction.best_time || 'Early morning (8-10 AM) or late afternoon (3-5 PM) typically offers the best experience with fewer crowds and pleasant lighting for photography. Weekdays are generally less crowded than weekends.'}
                    </Text>
                  </Flex>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          {/* Add to Itinerary CTA */}
          <Box
            mt={12}
            p={8}
            borderRadius="lg"
            bg="brand.primary"
            color="white"
            textAlign="center"
          >
            <Heading as="h3" size="lg" mb={4}>
              Planning to Visit?
            </Heading>
            <Text fontSize="lg" mb={6}>
              Add {attraction.name} to your Morocco itinerary and discover other nearby attractions.
            </Text>
            <Button
              as={RouterLink}
              to="/itinerary-planner"
              size="lg"
              colorScheme="white"
              variant="outline"
              _hover={{ bg: 'rgba(255,255,255,0.2)' }}
            >
              Plan Your Itinerary
            </Button>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default AttractionDetailPage;