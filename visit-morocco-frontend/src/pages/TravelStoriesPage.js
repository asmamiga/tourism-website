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
  Avatar,
  HStack,
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Mock service for travel stories (replace with actual API when available)
const travelStoryService = {
  getAll: () => Promise.resolve({
    data: [
      {
        story_id: 1,
        title: 'Exploring the Blue City of Chefchaouen',
        excerpt: 'My journey through the stunning blue streets and alleys of this magical Moroccan city.',
        content: 'Chefchaouen, often simply referred to as the "Blue City," is a destination unlike any other. Nestled in the Rif Mountains of Morocco, this town is famous for its blue-painted buildings that create a dreamlike atmosphere...',
        author: {
          user_id: 101,
          name: 'Sarah Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        location: 'Chefchaouen',
        published_date: '2023-04-15',
        image: 'https://images.unsplash.com/photo-1548019865-9f1d6f957fa5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
        likes: 124,
        tags: ['cities', 'photography', 'culture']
      },
      {
        story_id: 2,
        title: 'Desert Adventure in the Sahara',
        excerpt: 'Camping under the stars and riding camels through the golden dunes of the Sahara desert.',
        content: 'There is something magical about the Sahara Desert that can\'t be captured in words or pictures. The vast expanse of golden sand dunes stretching as far as the eye can see creates a sense of both awe and tranquility...',
        author: {
          user_id: 102,
          name: 'Michael Chen',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        location: 'Merzouga',
        published_date: '2023-05-22',
        image: 'https://images.unsplash.com/photo-1548107121-ba49a240bc6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        likes: 98,
        tags: ['desert', 'adventure', 'camping']
      },
      {
        story_id: 3,
        title: 'A Food Tour Through Marrakech',
        excerpt: 'Discovering the rich flavors and culinary traditions of Morocco in the vibrant markets of Marrakech.',
        content: 'Marrakech is a paradise for food lovers. The city\'s medina is filled with food stalls and restaurants offering a wide variety of Moroccan dishes that tantalize all the senses...',
        author: {
          user_id: 103,
          name: 'Emma Rodriguez',
          avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
        },
        location: 'Marrakech',
        published_date: '2023-06-10',
        image: 'https://images.unsplash.com/photo-1534680564476-afd401f3a4d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        likes: 156,
        tags: ['food', 'culture', 'markets']
      },
      {
        story_id: 4,
        title: 'Hiking the Atlas Mountains',
        excerpt: 'An unforgettable trekking experience through Morocco\'s stunning mountain range.',
        content: 'The Atlas Mountains offer some of the most breathtaking landscapes in North Africa. From lush valleys to snow-capped peaks, the diversity of terrain makes it a hiker\'s paradise...',
        author: {
          user_id: 104,
          name: 'David Wilson',
          avatar: 'https://randomuser.me/api/portraits/men/51.jpg'
        },
        location: 'Atlas Mountains',
        published_date: '2023-07-05',
        image: 'https://images.unsplash.com/photo-1602828889956-05669de1bc36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        likes: 85,
        tags: ['hiking', 'mountains', 'nature']
      },
      {
        story_id: 5,
        title: 'Ancient Wonders of Fes',
        excerpt: 'Exploring the medieval medina and cultural heritage of Morocco\'s oldest imperial city.',
        content: 'Walking through Fes feels like stepping back in time. The ancient medina, with its narrow winding streets and historic buildings, is a UNESCO World Heritage site and one of the most well-preserved medieval cities in the world...',
        author: {
          user_id: 105,
          name: 'Olivia Taylor',
          avatar: 'https://randomuser.me/api/portraits/women/29.jpg'
        },
        location: 'Fes',
        published_date: '2023-08-18',
        image: 'https://images.unsplash.com/photo-1528657249085-893fde56bf4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
        likes: 112,
        tags: ['history', 'architecture', 'culture']
      },
      {
        story_id: 6,
        title: 'Coastal Escape: Essaouira',
        excerpt: 'Wind surfing, fresh seafood, and relaxing vibes in this charming coastal town.',
        content: 'Essaouira offers a perfect blend of beach, culture, and relaxation. Known for its strong winds, it\'s a paradise for windsurfers and kitesurfers, while the historic medina and port provide cultural richness...',
        author: {
          user_id: 106,
          name: 'James Anderson',
          avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
        },
        location: 'Essaouira',
        published_date: '2023-09-02',
        image: 'https://images.unsplash.com/photo-1575237334046-a1050de4f5a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        likes: 78,
        tags: ['beach', 'watersports', 'relaxation']
      }
    ]
  })
};

const MotionBox = motion(Box);

const StoryCard = ({ story }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      boxShadow="md"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg', transition: 'all 0.3s ease' }}
    >
      <Box h="200px" overflow="hidden">
        <Image
          src={story.image}
          alt={story.title}
          objectFit="cover"
          w="100%"
          h="100%"
          transition="transform 0.5s ease"
          _hover={{ transform: 'scale(1.1)' }}
        />
      </Box>
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={2}>
          <Badge colorScheme="green" fontSize="xs">
            {story.location}
          </Badge>
          <HStack>
            <Icon as={FaHeart} color="red.500" />
            <Text fontSize="sm">{story.likes}</Text>
          </HStack>
        </Flex>
        
        <Heading as="h3" size="md" mb={2} noOfLines={2}>
          {story.title}
        </Heading>
        
        <Text noOfLines={3} mb={4} color="gray.600" fontSize="sm">
          {story.excerpt}
        </Text>
        
        <Flex justify="space-between" align="center" mt={3}>
          <HStack spacing={2}>
            <Avatar size="sm" src={story.author.avatar} name={story.author.name} />
            <Box>
              <Text fontWeight="semibold" fontSize="sm">{story.author.name}</Text>
              <Flex align="center">
                <Icon as={FaCalendarAlt} color="gray.500" fontSize="xs" mr={1} />
                <Text fontSize="xs" color="gray.500">{story.published_date}</Text>
              </Flex>
            </Box>
          </HStack>
          
          <Button
            as={RouterLink}
            to={`/stories/${story.story_id}`}
            size="sm"
            colorScheme="green"
            variant="outline"
          >
            Read More
          </Button>
        </Flex>
      </Box>
    </MotionBox>
  );
};

const TravelStoriesPage = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  // Get unique locations and tags for filters
  const locations = [...new Set(stories.map(story => story.location))];
  const allTags = stories.reduce((tags, story) => {
    story.tags.forEach(tag => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
    return tags;
  }, []);
  
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await travelStoryService.getAll();
        setStories(response.data);
        setFilteredStories(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching travel stories:', err);
        setError('Failed to load travel stories. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchStories();
  }, []);
  
  useEffect(() => {
    // Apply filters whenever filter criteria change
    let results = stories;
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(story => 
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply location filter
    if (selectedLocation) {
      results = results.filter(story => story.location === selectedLocation);
    }
    
    // Apply tag filter
    if (selectedTag) {
      results = results.filter(story => story.tags.includes(selectedTag));
    }
    
    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.published_date) - new Date(a.published_date);
        case 'likes':
          return b.likes - a.likes;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    setFilteredStories(results);
  }, [stories, searchTerm, selectedLocation, selectedTag, sortBy]);
  
  const handleReset = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedTag('');
    setSortBy('date');
    setFilteredStories(stories);
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
        <Heading as="h1" mb={2}>Travel Stories</Heading>
        <Text mb={8} color="gray.600">
          Discover inspiring travel experiences and adventures across Morocco
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
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Select
              placeholder="All Locations"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>
            
            <Select
              placeholder="All Tags"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Newest First</option>
              <option value="likes">Most Popular</option>
              <option value="title">Alphabetical</option>
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
        {filteredStories.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg">No stories found matching your criteria.</Text>
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
              Showing {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {filteredStories.map((story) => (
                <StoryCard key={story.story_id} story={story} />
              ))}
            </SimpleGrid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default TravelStoriesPage;
