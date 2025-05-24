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
  Avatar,
  HStack,
  Tag,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaLanguage, 
  FaCalendarAlt, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe,
  FaUserCheck,
  FaAward
} from 'react-icons/fa';
import { guideService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GuideServiceCard from '../components/guides/GuideServiceCard';
import GuideReviewList from '../components/guides/GuideReviewList';
import GuideReviewForm from '../components/guides/GuideReviewForm';
import GuideBookingForm from '../components/guides/GuideBookingForm';
import GuideAvailabilityCalendar from '../components/guides/GuideAvailabilityCalendar';

const MotionBox = motion(Box);

const GuideDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would use:
        // const response = await guideService.getById(id);
        // setGuide(response.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          const mockGuide = {
            guide_id: parseInt(id),
            user_id: 101,
            first_name: 'Ahmed',
            last_name: 'Benali',
            profile_picture: null,
            cover_photo: null,
            bio: 'Experienced guide with over 10 years of experience showing tourists the hidden gems of Marrakech. I specialize in cultural tours, food experiences, and historical sites. My goal is to provide authentic experiences that go beyond the typical tourist attractions, allowing visitors to truly connect with Moroccan culture and traditions.',
            avg_rating: 4.8,
            reviews_count: 56,
            is_verified: true,
            years_experience: 10,
            languages: ['Arabic', 'English', 'French', 'Spanish'],
            specialties: ['Cultural Tours', 'Food Tours', 'Historical Sites', 'Photography Tours'],
            certifications: ['Official Tourism Guide License', 'First Aid Certification', 'Cultural Heritage Specialist'],
            cities: [
              { city_id: 1, name: 'Marrakech' },
              { city_id: 2, name: 'Essaouira' }
            ],
            phone: '+212 6XX-XXXXXX',
            email: 'ahmed.benali@example.com',
            website: 'https://moroccoguide.example.com',
            services: [
              {
                service_id: 1,
                name: 'Marrakech Medina Tour',
                description: 'Explore the ancient medina of Marrakech, including the souks, Bahia Palace, and Koutoubia Mosque. This tour includes historical context, cultural insights, and recommendations for the best local food and shopping.',
                duration: '4 hours',
                price: 300,
                max_group_size: 8,
                languages: ['English', 'French', 'Spanish'],
                photo: null
              },
              {
                service_id: 2,
                name: 'Moroccan Culinary Experience',
                description: 'Discover Moroccan cuisine with a market visit, cooking class, and traditional meal. Learn about spices, traditional cooking techniques, and enjoy the meal you prepare.',
                duration: '6 hours',
                price: 450,
                max_group_size: 6,
                languages: ['English', 'French'],
                photo: null
              },
              {
                service_id: 3,
                name: 'Day Trip to Essaouira',
                description: 'Explore the coastal city of Essaouira with its Portuguese fortifications, bustling port, and artistic heritage. Includes transportation, guided tour, and free time for beach activities or shopping.',
                duration: 'Full day',
                price: 800,
                max_group_size: 4,
                languages: ['English', 'French', 'Spanish'],
                photo: null
              }
            ],
            availability: [
              { date: '2025-06-01', available: true },
              { date: '2025-06-02', available: true },
              { date: '2025-06-03', available: false },
              { date: '2025-06-04', available: true },
              { date: '2025-06-05', available: true },
              { date: '2025-06-06', available: false },
              { date: '2025-06-07', available: false }
            ],
            reviews: [
              {
                review_id: 1,
                user_id: 201,
                rating: 5,
                content: "Ahmed was an exceptional guide! His knowledge of Marrakech's history and culture made our tour incredibly informative and engaging. He took us to hidden spots we would never have found on our own and accommodated all our interests. Highly recommended!",
                created_at: "2025-04-15T14:30:00Z",
                user: {
                  first_name: "Sarah",
                  last_name: "Johnson",
                  profile_picture: null
                }
              },
              {
                review_id: 2,
                user_id: 202,
                rating: 5,
                content: "Our cooking class with Ahmed was the highlight of our trip to Morocco! He was patient, knowledgeable, and made the experience fun for our whole family. The food we prepared was delicious, and we learned so much about Moroccan cuisine and culture.",
                created_at: "2025-04-10T18:45:00Z",
                user: {
                  first_name: "Michael",
                  last_name: "Thompson",
                  profile_picture: null
                }
              },
              {
                review_id: 3,
                user_id: 203,
                rating: 4,
                content: "Ahmed provided an excellent day trip to Essaouira. He was very knowledgeable about the history and culture of the area. The only reason for 4 stars instead of 5 is that we felt a bit rushed at times. Overall, still a great experience!",
                created_at: "2025-04-05T12:15:00Z",
                user: {
                  first_name: "Emma",
                  last_name: "Davis",
                  profile_picture: null
                }
              }
            ]
          };
          
          setGuide(mockGuide);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching guide details:', err);
        setError('Failed to load guide details. Please try again later.');
        setLoading(false);
      }
    };

    fetchGuide();
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

  if (!guide) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="warning">
          <AlertIcon />
          Guide not found
        </Alert>
      </Container>
    );
  }

  // Default image if no photos available
  const defaultCoverImage = 'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80';
  const coverImage = guide.cover_photo ? `http://localhost:8000/storage/${guide.cover_photo}` : defaultCoverImage;

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
            <RouterLink to="/guides">Guides</RouterLink>
            <Text>/</Text>
            <Text color="brand.primary">{guide.first_name} {guide.last_name}</Text>
          </HStack>

          {/* Guide Header with Cover Image */}
          <Box
            position="relative"
            height="300px"
            borderRadius="lg"
            overflow="hidden"
            mb={20}
          >
            <Image
              src={coverImage}
              alt={`${guide.first_name} ${guide.last_name} cover`}
              objectFit="cover"
              w="100%"
              h="100%"
            />
            <Box
              position="absolute"
              bottom="-60px"
              left="50%"
              transform="translateX(-50%)"
              textAlign="center"
            >
              <Avatar
                src={guide.profile_picture ? `http://localhost:8000/storage/${guide.profile_picture}` : null}
                name={`${guide.first_name} ${guide.last_name}`}
                size="2xl"
                border="4px solid white"
                mb={2}
              />
              <Heading as="h1" size="xl" bg="white" px={4} py={2} borderRadius="md" boxShadow="md">
                {guide.first_name} {guide.last_name}
                {guide.is_verified && (
                  <Badge ml={2} colorScheme="green" variant="solid">
                    Verified
                  </Badge>
                )}
              </Heading>
            </Box>
          </Box>

          {/* Guide Rating and Quick Info */}
          <Flex 
            justify="center"
            align="center"
            mb={8}
            wrap="wrap"
            gap={4}
          >
            <Flex align="center">
              <Box display="flex" alignItems="center">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    as={FaStar}
                    color={i < Math.floor(guide.avg_rating || 0) ? 'brand.accent' : 'gray.300'}
                    mr={1}
                  />
                ))}
                <Text ml={1} fontWeight="bold">
                  {guide.avg_rating ? guide.avg_rating.toFixed(1) : 'No ratings'}
                </Text>
                <Text ml={1} color="gray.500">
                  ({guide.reviews_count || 0} reviews)
                </Text>
              </Box>
            </Flex>
            
            <Flex align="center" mx={4}>
              <Icon as={FaMapMarkerAlt} color="brand.primary" mr={2} />
              <Text>
                {guide.cities?.map(city => city.name).join(', ') || 'Various locations'}
              </Text>
            </Flex>
            
            <Flex align="center">
              <Icon as={FaUserCheck} color="brand.primary" mr={2} />
              <Text>{guide.years_experience} years experience</Text>
            </Flex>
          </Flex>

          {/* Guide Details Tabs */}
          <Tabs colorScheme="green" isLazy>
            <TabList>
              <Tab>About</Tab>
              <Tab>Services</Tab>
              <Tab>Reviews</Tab>
              <Tab>Availability</Tab>
              <Tab>Booking</Tab>
            </TabList>

            <TabPanels>
              {/* About Tab */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      About {guide.first_name}
                    </Heading>
                    <Text mb={6}>
                      {guide.bio || 'No bio available.'}
                    </Text>
                    
                    <Heading as="h3" size="md" mb={4}>
                      Specialties
                    </Heading>
                    <Flex wrap="wrap" mb={6} gap={2}>
                      {guide.specialties?.map((specialty, index) => (
                        <Tag key={index} size="md" colorScheme="green" variant="solid">
                          {specialty}
                        </Tag>
                      ))}
                      {!guide.specialties && <Text>No specialties listed.</Text>}
                    </Flex>
                    
                    <Heading as="h3" size="md" mb={4}>
                      Languages
                    </Heading>
                    <Flex wrap="wrap" mb={6} gap={2}>
                      {guide.languages?.map((language, index) => (
                        <Tag key={index} size="md" colorScheme="blue">
                          {language}
                        </Tag>
                      ))}
                      {!guide.languages && <Text>No languages listed.</Text>}
                    </Flex>
                  </Box>
                  
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      Certifications & Credentials
                    </Heading>
                    <Stack spacing={3} mb={6}>
                      {guide.certifications?.map((certification, index) => (
                        <Flex key={index} align="center">
                          <Icon as={FaAward} color="brand.accent" mr={3} />
                          <Text>{certification}</Text>
                        </Flex>
                      ))}
                      {!guide.certifications && <Text>No certifications listed.</Text>}
                    </Stack>
                    
                    <Heading as="h3" size="md" mb={4}>
                      Contact Information
                    </Heading>
                    <Stack spacing={4} mb={6}>
                      {guide.phone && (
                        <Flex align="center">
                          <Icon as={FaPhone} color="brand.primary" mr={3} />
                          <Text>{guide.phone}</Text>
                        </Flex>
                      )}
                      
                      {guide.email && (
                        <Flex align="center">
                          <Icon as={FaEnvelope} color="brand.primary" mr={3} />
                          <Text>{guide.email}</Text>
                        </Flex>
                      )}
                      
                      {guide.website && (
                        <Flex align="center">
                          <Icon as={FaGlobe} color="brand.primary" mr={3} />
                          <Text>{guide.website}</Text>
                        </Flex>
                      )}
                    </Stack>
                    
                    <Heading as="h3" size="md" mb={4}>
                      Areas Covered
                    </Heading>
                    <Stack spacing={2}>
                      {guide.cities?.map((city) => (
                        <Flex key={city.city_id} align="center">
                          <Icon as={FaMapMarkerAlt} color="brand.primary" mr={3} />
                          <Text>{city.name}</Text>
                        </Flex>
                      ))}
                      {!guide.cities && <Text>No areas specified.</Text>}
                    </Stack>
                  </Box>
                </SimpleGrid>
              </TabPanel>
              
              {/* Services Tab */}
              <TabPanel>
                <Heading as="h3" size="md" mb={6}>
                  Services Offered
                </Heading>
                
                {guide.services && guide.services.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                    {guide.services.map((service) => (
                      <GuideServiceCard key={service.service_id} service={service} guideName={`${guide.first_name} ${guide.last_name}`} />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    No services are currently listed for this guide.
                  </Alert>
                )}
                
                <Box mt={10} p={6} bg="gray.50" borderRadius="lg">
                  <Heading as="h4" size="md" mb={4}>
                    Looking for Something Specific?
                  </Heading>
                  <Text mb={4}>
                    {guide.first_name} can create custom experiences tailored to your interests and needs.
                  </Text>
                  <Button
                    as={RouterLink}
                    to="#booking"
                    colorScheme="green"
                  >
                    Contact for Custom Tour
                  </Button>
                </Box>
              </TabPanel>
              
              {/* Reviews Tab */}
              <TabPanel>
                <Box mb={8}>
                  <Heading as="h3" size="md" mb={4}>
                    Client Reviews
                  </Heading>
                  
                  {user ? (
                    <GuideReviewForm guideId={guide.guide_id} />
                  ) : (
                    <Alert status="info" mb={4}>
                      <AlertIcon />
                      <Text>
                        Please <RouterLink to="/login" style={{ color: 'var(--chakra-colors-brand-primary)', fontWeight: 'bold' }}>log in</RouterLink> to leave a review.
                      </Text>
                    </Alert>
                  )}
                  
                  <Divider my={6} />
                  
                  <GuideReviewList reviews={guide.reviews} />
                </Box>
              </TabPanel>
              
              {/* Availability Tab */}
              <TabPanel>
                <Box mb={8}>
                  <Heading as="h3" size="md" mb={4}>
                    Availability Calendar
                  </Heading>
                  
                  <Text mb={6}>
                    Check {guide.first_name}'s availability for the upcoming months. Green dates are available for booking.
                  </Text>
                  
                  <Box
                    p={6}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="md"
                  >
                    <GuideAvailabilityCalendar availability={guide.availability} />
                  </Box>
                </Box>
              </TabPanel>
              
              {/* Booking Tab */}
              <TabPanel id="booking">
                <Box mb={8}>
                  <Heading as="h3" size="md" mb={4}>
                    Book a Tour with {guide.first_name}
                  </Heading>
                  
                  {user ? (
                    <GuideBookingForm guide={guide} />
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <Text>
                        Please <RouterLink to="/login" style={{ color: 'var(--chakra-colors-brand-primary)', fontWeight: 'bold' }}>log in</RouterLink> to make a booking.
                      </Text>
                    </Alert>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          {/* Similar Guides */}
          <Box mt={12}>
            <Heading as="h3" size="lg" mb={6}>
              Similar Guides
            </Heading>
            
            {/* This would be populated with actual related guides */}
            <Text color="gray.600">
              Similar guides will be shown here based on location and specialties.
            </Text>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default GuideDetailPage;
