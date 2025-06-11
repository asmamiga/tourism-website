import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Image, 
  Button, 
  VStack, 
  HStack, 
  Badge, 
  Divider, 
  useColorModeValue,
  Flex,
  Icon,
  useBreakpointValue,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaStar, FaClock, FaUsers, FaExternalLinkAlt } from 'react-icons/fa';

const MotionBox = motion(Box);

// Sample experiences data
const experiences = [
  {
    id: 1,
    title: 'Sunset Camel Trek in the Sahara',
    location: 'Merzouga, Drâa-Tafilalet',
    coordinates: '31.1741,-4.0068',
    rating: 4.9,
    reviews: 128,
    duration: '3 hours',
    groupSize: 'Small group',
    price: 45,
    image: 'https://images.unsplash.com/photo-1518544866339-6e82bfaacbb5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    category: 'Adventure',
    description: 'Experience the magic of the Sahara Desert with a sunset camel trek through the golden dunes of Merzouga.'
  },
  {
    id: 2,
    title: 'Traditional Moroccan Cooking Class',
    location: 'Marrakech, Marrakech-Safi',
    coordinates: '31.6295,-7.9811',
    rating: 4.8,
    reviews: 215,
    duration: '4 hours',
    groupSize: 'Up to 8 people',
    price: 65,
    image: 'https://images.unsplash.com/photo-1595151408059-25c05f8281bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    category: 'Food & Drink',
    description: 'Learn to cook authentic Moroccan dishes with a local chef in a traditional riad.'
  },
  {
    id: 3,
    title: 'Atlas Mountains Hiking Tour',
    location: 'Imlil, Marrakech-Safi',
    coordinates: '31.1033,-8.1064',
    rating: 4.9,
    reviews: 178,
    duration: 'Full day',
    groupSize: 'Small group',
    price: 55,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    category: 'Adventure',
    description: 'Hike through Berber villages and enjoy breathtaking views of the High Atlas Mountains.'
  },
  {
    id: 4,
    title: 'Fes Medina Walking Tour',
    location: 'Fes, Fès-Meknès',
    coordinates: '34.0181,-5.0078',
    rating: 4.7,
    reviews: 192,
    duration: '3.5 hours',
    groupSize: 'Up to 12 people',
    price: 35,
    image: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
    category: 'Cultural',
    description: 'Explore the ancient medina of Fes, a UNESCO World Heritage site, with a local guide.'
  },
  {
    id: 5,
    title: 'Chefchaouen Blue City Tour',
    location: 'Chefchaouen, Tanger-Tétouan-Al Hoceïma',
    coordinates: '35.1714,-5.2699',
    rating: 4.8,
    reviews: 156,
    duration: '2.5 hours',
    groupSize: 'Small group',
    price: 30,
    image: 'https://images.unsplash.com/photo-1597676624565-9f3e1f1e1f1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    category: 'Cultural',
    description: 'Discover the famous blue-washed streets and rich history of Chefchaouen.'
  },
  {
    id: 6,
    title: 'Surfing in Taghazout',
    location: 'Taghazout, Souss-Massa',
    coordinates: '30.5333,-9.7000',
    rating: 4.9,
    reviews: 143,
    duration: '3 hours',
    groupSize: 'Small group',
    price: 50,
    image: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
    category: 'Adventure',
    description: 'Catch the perfect wave with expert surf instructors in Morocco\'s surf capital.'
  }
];

const categories = ['All', 'Adventure', 'Cultural', 'Food & Drink', 'Nature', 'Wellness'];
const locations = ['All Locations', 'Marrakech', 'Fes', 'Chefchaouen', 'Merzouga', 'Taghazout', 'Atlas Mountains'];

const ExperienceCard = ({ experience }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('gray.900', 'white');
  const accentColor = useColorModeValue('brand.500', 'brand.300');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const tagBg = useColorModeValue('brand.50', 'brand.900');
  const tagText = useColorModeValue('brand.700', 'brand.200');
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.95)');

  return (
    <Box
      position="relative"
      h="100%"
      borderRadius="2xl"
      overflow="hidden"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
      _hover={{
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Image with gradient overlay */}
      <Box 
        position="relative" 
        h="220px" 
        overflow="hidden"
        bg="gray.100"
      >
        <Image
          src={experience.image}
          alt={experience.title}
          objectFit="cover"
          w="100%"
          h="100%"
          transition="all 0.5s ease"
          _hover={{
            transform: 'scale(1.05)',
          }}
        />
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          h="50%"
          bgGradient="linear(to-t, rgba(0,0,0,0.8) 0%, transparent 100%)"
          zIndex="1"
        />
        
        {/* Category tag */}
        <Box
          position="absolute"
          top="4"
          right="4"
          zIndex="2"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <Badge
              bg={tagBg}
              color={tagText}
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="bold"
              fontSize="xs"
              letterSpacing="wide"
              textTransform="uppercase"
              boxShadow="sm"
            >
              {experience.category}
            </Badge>
          </motion.div>
        </Box>
      </Box>

      {/* Card content */}
      <Box p={6} position="relative" zIndex="2">
        {/* Location */}
        <HStack spacing={2} mb={3} color="white">
          <Icon as={FaMapMarkerAlt} color="white" />
          <Text 
            fontSize="sm" 
            fontWeight="medium"
            noOfLines={1}
            textShadow="0 1px 2px rgba(0,0,0,0.2)"
            position="relative"
            zIndex="2"
          >
            {experience.location}
          </Text>
        </HStack>

        {/* Title */}
        <Heading 
          as="h3" 
          size="lg" 
          mb={3} 
          color={headingColor}
          lineHeight="tall"
          noOfLines={2}
          fontWeight="bold"
          letterSpacing="tight"
        >
          {experience.title}
        </Heading>

        {/* Rating and details */}
        <HStack spacing={4} mb={4} color={textColor}>
          <HStack spacing={1}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Icon as={FaStar} color="yellow.400" />
            </motion.div>
            <Text fontSize="sm" fontWeight="semibold">
              {experience.rating}
              <Text as="span" fontWeight="normal" color={textColor} opacity={0.8}>
                /5
              </Text>
            </Text>
            <Text fontSize="sm" opacity={0.8}>
              ({experience.reviews} reviews)
            </Text>
          </HStack>
        </HStack>

        {/* Duration and group size */}
        <HStack spacing={4} mb={6} color={textColor} opacity={0.9}>
          <HStack spacing={2}>
            <Box
              p={1.5}
              bg={useColorModeValue('brand.50', 'brand.900')}
              borderRadius="md"
              color={accentColor}
            >
              <Icon as={FaClock} boxSize={3} />
            </Box>
            <Text fontSize="sm">{experience.duration}</Text>
          </HStack>
          <HStack spacing={2}>
            <Box
              p={1.5}
              bg={useColorModeValue('brand.50', 'brand.900')}
              borderRadius="md"
              color={accentColor}
            >
              <Icon as={FaUsers} boxSize={3} />
            </Box>
            <Text fontSize="sm">{experience.groupSize}</Text>
          </HStack>
        </HStack>

        {/* Price and CTA */}
        <Flex justify="space-between" align="center" mt="auto">
          <Box>
            <Text fontSize="sm" color={textColor} mb={1} opacity={0.8}>
              Starting from
            </Text>
            <Text 
              fontSize="2xl" 
              fontWeight="extrabold" 
              color={accentColor}
              lineHeight="shorter"
            >
              ${experience.price}
              <Text as="span" fontSize="sm" fontWeight="normal" color={textColor} opacity={0.8}>
                /person
              </Text>
            </Text>
          </Box>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              as="a"
              href={`https://www.google.com/maps?q=${experience.coordinates}`}
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="brand"
              size="lg"
              rightIcon={
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon as={FaExternalLinkAlt} />
                </motion.div>
              }
              px={6}
              py={6}
              borderRadius="xl"
              fontWeight="bold"
              letterSpacing="wide"
              textTransform="uppercase"
              fontSize="sm"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              }}
              _active={{
                transform: 'none',
              }}
              transition="all 0.2s"
            >
              Book Experience
            </Button>
          </motion.div>
        </Flex>
      </Box>
    </Box>
  );
};

const ExperiencesPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const accentColor = useColorModeValue('brand.500', 'brand.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const searchBg = useColorModeValue('white', 'gray.700');
  const searchBorder = useColorModeValue('gray.200', 'gray.600');
  const searchFocusBorder = useColorModeValue('brand.500', 'brand.300');
  const searchFocusShadow = useColorModeValue('0 0 0 1px var(--chakra-colors-brand-500)', '0 0 0 1px var(--chakra-colors-brand-300)');
  const filterButtonBg = useColorModeValue('gray.50', 'gray.700');
  const filterButtonHover = useColorModeValue('gray.100', 'gray.600');
  const activeFilterBg = useColorModeValue('brand.500', 'brand.400');
  const activeFilterText = useColorModeValue('white', 'gray.900');
  const emptyStateIconBg = useColorModeValue('gray.50', 'gray.700');
  const cardHoverBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const cardShadow = useColorModeValue('0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)');
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.95)');
  
  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const filteredExperiences = experiences.filter(exp => {
    const matchesCategory = activeCategory === 'All' || exp.category === activeCategory;
    const matchesLocation = locationFilter === 'All Locations' || exp.location.includes(locationFilter);
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesLocation && matchesSearch;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Box
        bgImage="url('https://images.unsplash.com/photo-1543418219-680d0a6e8f3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'"
        bgSize="cover"
        bgPosition="center"
        color="white"
        py={{ base: 32, md: 40 }}
        position="relative"
        overflow="hidden"
      >
        {/* Overlay */}
        <Box
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          bgGradient="linear(to-r, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)"
          zIndex={1}
        />
        
        <Container maxW="7xl" position="relative" zIndex={2}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            maxW="3xl"
          >
            <Text 
              fontSize={{ base: 'md', md: 'lg' }} 
              fontWeight="semibold" 
              color="brand.200" 
              mb={3}
              letterSpacing="wider"
              textTransform="uppercase"
            >
              Discover Morocco
            </Text>
            <Heading 
              as="h1" 
              fontSize={{ base: '4xl', md: '6xl' }} 
              fontWeight="extrabold" 
              mb={6}
              lineHeight={1.1}
              textShadow="0 2px 4px rgba(0,0,0,0.2)"
            >
              Unforgettable Experiences
            </Heading>
            <Text 
              fontSize={{ base: 'lg', md: 'xl' }} 
              maxW="2xl" 
              opacity={0.95}
              mb={8}
              textShadow="0 1px 2px rgba(0,0,0,0.2)"
            >
              Discover authentic activities and immersive tours that will make your trip to Morocco truly special. 
              From desert adventures to cultural experiences, find your perfect Moroccan journey.
            </Text>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Button 
                as="a"
                href="#experiences"
                colorScheme="brand" 
                size="lg" 
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
                borderRadius="full"
                boxShadow="xl"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '2xl',
                }}
                _active={{
                  transform: 'none',
                }}
                transition="all 0.3s"
              >
                Explore Experiences
              </Button>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>

      {/* Search and Filters */}
      <Box 
        id="experiences"
        position="sticky" 
        top={0} 
        zIndex={20} 
        bg={useColorModeValue('white', 'gray.800')} 
        boxShadow={isScrolled ? 'md' : 'none'}
        borderBottom="1px solid"
        borderColor={borderColor}
        transition="all 0.3s"
      >
        <Container maxW="7xl" py={6}>
          <VStack spacing={6}>
            {/* Search Bar */}
            <Box w="100%" maxW="3xl" mx="auto">
              <MotionBox
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" h="100%" pl={4}>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search experiences by name, location, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={searchBg}
                    borderColor={searchBorder}
                    _hover={{ borderColor: 'gray.300' }}
                    _focus={{
                      borderColor: searchFocusBorder,
                      boxShadow: searchFocusShadow,
                    }}
                    fontSize="md"
                    pl={14}
                    py={6}
                    borderRadius="xl"
                    variant="filled"
                  />
                </InputGroup>
              </MotionBox>
            </Box>

            {/* Location and Category Filters */}
            <MotionBox
              w="100%"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Flex
                direction={{ base: 'column', md: 'row' }}
                w="100%"
                justify="space-between"
                align={{ base: 'stretch', md: 'center' }}
                gap={4}
              >
                {/* Location Filter */}
                <Box flexShrink={0} minW={{ base: '100%', md: '240px' }}>
                  <Select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    size="lg"
                    bg={searchBg}
                    borderColor={searchBorder}
                    _hover={{ borderColor: 'gray.300' }}
                    _focus={{
                      borderColor: searchFocusBorder,
                      boxShadow: searchFocusShadow,
                    }}
                    borderRadius="xl"
                    height="48px"
                  >
                    <option value="All Locations">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </Select>
                </Box>
                
                {/* Category Filters */}
                <Box 
                  overflowX="auto" 
                  pb={2}
                  css={{
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                  }}
                >
                  <Flex gap={2} minW="max-content">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        size={isMobile ? 'sm' : 'md'}
                        variant="ghost"
                        bg={activeCategory === category ? activeFilterBg : filterButtonBg}
                        color={activeCategory === category ? activeFilterText : 'inherit'}
                        onClick={() => setActiveCategory(category)}
                        borderRadius="full"
                        px={5}
                        py={5}
                        fontWeight="medium"
                        _hover={{
                          bg: activeCategory === category ? activeFilterBg : filterButtonHover,
                          color: activeCategory === category ? activeFilterText : 'inherit',
                          transform: 'translateY(-2px)',
                        }}
                        _active={{
                          transform: 'none',
                        }}
                        boxShadow={activeCategory === category ? 'md' : 'sm'}
                        transition="all 0.2s"
                        whiteSpace="nowrap"
                      >
                        {category}
                      </Button>
                    ))}
                  </Flex>
                </Box>
              </Flex>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Experiences Grid */}
      <Container maxW="7xl" py={16}>
        {filteredExperiences.length > 0 ? (
          <>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              mb={10}
            >
              <Heading as="h2" size="xl" mb={2} color={headingColor}>
                {filteredExperiences.length} {filteredExperiences.length === 1 ? 'Experience' : 'Experiences'} Found
              </Heading>
              <Text color={textColor}>
                {searchQuery || activeCategory !== 'All' || locationFilter !== 'All Locations' 
                  ? 'Matching your search criteria' 
                  : 'Available experiences in Morocco'}
              </Text>
            </MotionBox>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {filteredExperiences.map((experience, index) => (
                <MotionBox
                  key={experience.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.7 + (index * 0.05),
                    duration: 0.5,
                    type: 'spring',
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ExperienceCard experience={experience} />
                </MotionBox>
              ))}
            </SimpleGrid>
          </>
        ) : (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            textAlign="center" 
            py={20}
            px={4}
          >
            <Box 
              display="inline-block"
              p={6}
              mb={6}
              bg={emptyStateIconBg}
              borderRadius="full"
            >
              <Icon as={FaSearch} fontSize="3xl" color={textColor} />
            </Box>
            <Heading as="h2" size="xl" mb={4} color={headingColor}>
              No experiences found
            </Heading>
            <Text color={textColor} maxW="md" mx="auto" mb={8}>
              We couldn't find any experiences matching your search. Try adjusting your filters or search term.
            </Text>
            <Button
              colorScheme="brand"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setLocationFilter('All Locations');
              }}
              size="lg"
              borderRadius="full"
              px={8}
            >
              Clear all filters
            </Button>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
};

export default ExperiencesPage;
