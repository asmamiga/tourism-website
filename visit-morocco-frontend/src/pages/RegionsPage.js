import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Image, 
  useColorModeValue, 
  Button, 
  VStack, 
  HStack, 
  Badge, 
  useBreakpointValue, 
  Flex,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  IconButton,
  useToast,
  Divider,
  Link,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMapPin, 
  FiStar, 
  FiChevronRight, 
  FiGlobe, 
  FiSearch,
  FiFilter,
  FiClock,
  FiNavigation
} from 'react-icons/fi';
import { FaMountain, FaUmbrellaBeach, FaCity, FaLandmark, FaSun, FaGlobe } from 'react-icons/fa6';

// Sample regions data with local images
const regions = [
  {
    id: 1,
    name: 'Marrakech-Safi',
    description: 'Immerse yourself in the vibrant colors and rich history of Marrakech-Safi, where ancient medinas meet bustling souks and stunning palaces. This region is a feast for the senses, with its aromatic spice markets, intricate architecture, and lively town squares.',
    image: '/images/cities/marrakech-main.jpg',
    coverImage: '/images/cities/marrakech-secondary.jpg',
    cities: ['Marrakech', 'Essaouira', 'Ouarzazate', 'Ait Ben Haddou', 'Ourika Valley', 'Asni', 'Telouet', 'Tahnaout', 'Amizmiz'],
    highlights: ['Jemaa el-Fnaa', 'Bahia Palace', 'Majorelle Garden', 'Atlas Mountains', 'Koutoubia Mosque', 'Ouzoud Falls', "Tizi n'Tichka Pass"],
    bestTime: 'Mar-May, Sep-Nov',
    type: 'cultural',
    experiences: 156,
    attractions: 112
  },
  {
    id: 2,
    name: 'Fès-Meknès',
    description: 'Step back in time in Fès-Meknès, home to the world\'s oldest university and one of the most well-preserved medieval cities. Wander through labyrinthine alleys, marvel at ancient madrasas, and discover the spiritual heart of Morocco.',
    image: '/images/cities/fes-main.jpg',
    coverImage: '/images/cities/fes-secondary.jpg',
    cities: ['Fès', 'Meknès', 'Ifrane', 'Volubilis', 'Moulay Idriss', 'Sefrou', 'Azrou', 'Moulay Yacoub', 'El Hajeb'],
    highlights: ['Fès el-Bali', 'Bou Inania Madrasa', 'Al Quaraouiyine University', 'Volubilis Ruins', 'Bab Mansour', 'Ifrane National Park', 'Meknès Royal Stables'],
    bestTime: 'Apr-Jun, Sep-Nov',
    type: 'historical',
    experiences: 124,
    attractions: 98
  },
  {
    id: 3,
    name: 'Souss-Massa',
    description: 'Discover the natural wonders of Souss-Massa, where golden beaches meet the rugged Atlas Mountains. This region is famous for its argan trees, traditional Berber culture, and diverse landscapes that range from coastal cliffs to fertile valleys.',
    image: '/images/cities/essaouira-main.jpg',
    coverImage: '/images/cities/essaouira-secondary.jpg',
    cities: ['Agadir', 'Tiznit', 'Tafraoute', 'Sidi Ifni', 'Mirleft', 'Tizourhane', 'Ait Baha', 'Biougra', 'Ait Melloul'],
    highlights: ['Paradise Valley', 'Souss-Massa National Park', 'Legzira Beach', 'Ameln Valley', 'Tifnit Beach', 'Crocoparc', 'Souss River'],
    bestTime: 'May-Oct',
    type: 'beach',
    experiences: 112,
    attractions: 88
  },
  {
    id: 4,
    name: 'Tanger-Tétouan-Al Hoceïma',
    description: 'Where the Mediterranean meets the Atlantic, this northern region offers a fascinating blend of cultures, stunning coastal views, and the iconic blue-washed streets of Chefchaouen. Explore ancient medinas, pristine beaches, and dramatic mountain landscapes.',
    image: '/images/cities/chefchaouen-main.jpg',
    coverImage: '/images/cities/chefchaouen-secondary.jpg',
    cities: ['Tangier', 'Chefchaouen', 'Tetouan', 'Asilah', 'Martil', 'Al Hoceima', 'Fnideq', 'Oued Laou', 'Targuist'],
    highlights: ['Blue Pearl (Chefchaouen)', 'Hercules Caves', 'Cap Spartel', 'Kasbah Museum', 'Mediterranean Coast', 'Talia Beach', 'Rif Mountains'],
    bestTime: 'Apr-Jun, Sep-Oct',
    type: 'mountain',
    experiences: 145,
    attractions: 102
  },
  {
    id: 5,
    name: 'Drâa-Tafilalet',
    description: 'Embark on an unforgettable journey through the gateway to the Sahara Desert. Marvel at endless golden dunes, ancient ksars, and lush oases that have sustained life for centuries in this breathtakingly beautiful region.',
    image: '/images/cities/sahara-main.jpg',
    coverImage: '/images/cities/sahara-secondary.jpg',
    cities: ['Zagora', 'Merzouga', 'Tinghir', 'Erfoud', 'Rissani', 'Errachidia', 'Midelt', 'Erfoud', 'Tinghir'],
    highlights: ['Erg Chebbi Dunes', 'Todgha Gorge', 'Aït Benhaddou', 'Dades Valley', 'Merzouga Desert', 'Ziz Valley', 'Ksar of Ait-Ben-Haddou'],
    bestTime: 'Oct-Apr',
    type: 'desert',
    experiences: 98,
    attractions: 76
  },
  {
    id: 6,
    name: 'Rabat-Salé-Kénitra',
    description: 'Experience the perfect blend of history and modernity in Morocco\'s political capital. From ancient ruins to contemporary art galleries, this region offers a more relaxed pace while still showcasing the country\'s rich heritage.',
    image: '/images/cities/rabat-main.jpg',
    coverImage: '/images/cities/rabat-secondary.jpg',
    cities: ['Rabat', 'Salé', 'Kenitra', 'Meknès', 'Moulay Bousselham', 'Sidi Kacem', 'Sidi Slimane', 'Skhirat', 'Témara'],
    highlights: ['Hassan Tower', 'Chellah Necropolis', 'Kasbah of the Udayas', 'Royal Palace', 'Mohammed VI Museum', 'Bou Regreg River', 'Rabat Beach'],
    bestTime: 'Mar-Jun, Sep-Nov',
    type: 'urban',
    experiences: 118,
    attractions: 92
  },
  {
    id: 7,
    name: 'Oriental',
    description: 'Discover the unique blend of Moroccan and Mediterranean cultures in the Oriental region, known for its golden beaches, mountainous landscapes, and rich cultural heritage that reflects centuries of diverse influences.',
    image: '/images/cities/oujda-main.jpg',
    coverImage: '/images/cities/oujda-secondary.jpg',
    cities: ['Oujda', 'Nador', 'Berkane', 'Taourirt', 'Al Aroui', 'Driouch', 'Figuig', 'Jerada', 'Guercif'],
    highlights: ['Saidia Beach', 'Cap de l\'Eau', 'Zegzel Gorge', 'Marché de Tanger', 'Oujda Medina', 'Berkane Orange Festival', 'Cap des Trois Fourches'],
    bestTime: 'Apr-Jun, Sep-Oct',
    type: 'cultural',
    experiences: 87,
    attractions: 65
  },
  {
    id: 8,
    name: 'Béni Mellal-Khénifra',
    description: 'Nestled between the Middle Atlas and High Atlas mountains, this region is a paradise for nature lovers, with its cascading waterfalls, lush valleys, and traditional Berber villages offering an authentic Moroccan experience.',
    image: '/images/cities/benimellal-main.jpg',
    coverImage: '/images/cities/benimellal-secondary.jpg',
    cities: ['Béni Mellal', 'Khénifra', 'Khouribga', 'Fquih Ben Salah', 'Azilal', 'Ouaouizeght', 'Oulmès', 'El Ksiba'],
    highlights: ['Ouzoud Waterfalls', 'Bin El Ouidane Lake', 'Ain Asserdoun', 'Aghbala', 'Tassemitane National Park', 'Zaouia of Dila', 'Oum Er-Rbia River'],
    bestTime: 'Mar-May, Sep-Nov',
    type: 'mountain',
    experiences: 76,
    attractions: 58
  }
];

// Motion components
const MotionBox = motion(Box);
const MotionGrid = motion(SimpleGrid);
const MotionCard = motion(Box);
const MotionButton = motion(Button);

// Region type icons
const regionIcons = {
  cultural: { icon: FaLandmark, color: 'purple.500' },
  historical: { icon: FaLandmark, color: 'orange.500' },
  beach: { icon: FaUmbrellaBeach, color: 'blue.500' },
  mountain: { icon: FaMountain, color: 'green.500' },
  desert: { icon: FaSun, color: 'yellow.600' },
  urban: { icon: FaCity, color: 'purple.500' }
};

// Region card component
const RegionCard = ({ region, onClick }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardHover = useColorModeValue('lg', 'dark-lg');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const TypeIcon = regionIcons[region.type]?.icon || FiGlobe;
  const typeColor = regionIcons[region.type]?.color || 'gray.500';

  return (
    <MotionBox
      as="article"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -10, 
        transition: { 
          duration: 0.3,
          ease: "easeOut"
        } 
      }}
      transition={{ 
        duration: 0.5, 
        type: "spring", 
        stiffness: 100,
        ease: "easeInOut"
      }}
      bg={bgColor}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="lg"
      _hover={{ 
        boxShadow: '2xl',
        transform: 'translateY(-10px)'
      }}
      cursor="pointer"
      onClick={onClick}
    >
      {/* Region Image */}
      <Box 
        h="200px" 
        overflow="hidden"
        position="relative"
      >
        <Image
          src={region.image}
          alt={region.name}
          className="region-image"
          w="100%"
          h="100%"
          objectFit="cover"
          transition="transform 0.5s ease"
        />
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          h="100%"
          bgGradient="linear(to-t, blackAlpha.800, transparent 50%)"
          p={6}
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          color="white"
        >
          <HStack spacing={2} mb={2}>
            <Icon as={TypeIcon} color="white" />
            <Text fontSize="sm" fontWeight="500" textTransform="capitalize">
              {region.type}
            </Text>
          </HStack>
          <Heading size="lg" mb={2} color="white">
            {region.name}
          </Heading>
          <HStack spacing={4} fontSize="sm" opacity={0.9}>
            <HStack>
              <Icon as={FiMapPin} />
              <Text>{region.cities.length} cities</Text>
            </HStack>
            <HStack>
              <Icon as={FiStar} />
              <Text>{region.highlights.length} highlights</Text>
            </HStack>
          </HStack>
        </Box>
      </Box>
      
      {/* Content */}
      <Box p={6}>
        <Text noOfLines={3} mb={4} color="gray.600">
          {region.description}
        </Text>
        
        <HStack justify="space-between" mt={4}>
          <Badge colorScheme="green" px={3} py={1} borderRadius="full">
            Best time: {region.bestTime}
          </Badge>
          <HStack spacing={2}>
            <Button 
              size="sm" 
              variant="ghost" 
              colorScheme="blue" 
              rightIcon={<FiChevronRight />}
              _hover={{ transform: 'translateX(4px)' }}
              transition="all 0.2s"
            >
              Explore
            </Button>
          </HStack>
        </HStack>
      </Box>
    </MotionBox>
  );
};

// Region detail modal
const RegionDetailModal = ({ isOpen, onClose, region }) => {
  if (!region) return null;
  
  const TypeIcon = regionIcons[region.type]?.icon || FaGlobe;
  const iconColor = regionIcons[region.type]?.color || 'gray.500';
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent 
        borderRadius="2xl" 
        overflow="hidden"
        bg="white"
        boxShadow="2xl"
      >
        <Box 
          h="400px" 
          position="relative"
          bgImage={`url(${region.coverImage || region.image})`}
          bgSize="cover"
          bgPosition="center"
        >
          <Box
            position="absolute"
            inset="0"
            bgGradient="linear(to-t, blackAlpha.900, transparent 60%)"
          />
          <ModalCloseButton 
            position="absolute" 
            top={4} 
            right={4} 
            color="white" 
            bg="blackAlpha.500" 
            _hover={{ bg: 'blackAlpha.600' }}
            size="lg"
            borderRadius="full"
          />
          <VStack 
            position="absolute" 
            bottom={0} 
            left={0} 
            right={0} 
            p={10}
            spacing={4}
            align="flex-start"
            color="white"
            textAlign="left"
          >
            <HStack spacing={4}>
              <Badge 
                px={3} 
                py={1} 
                borderRadius="full" 
                bg="whiteAlpha.200" 
                backdropFilter="blur(10px)"
                color="white"
                fontWeight="500"
                display="flex"
                alignItems="center"
              >
                <Icon as={TypeIcon} mr={1} color="white" />
                {region.type.charAt(0).toUpperCase() + region.type.slice(1)}
              </Badge>
              <Badge 
                px={3} 
                py={1} 
                borderRadius="full" 
                bg="whiteAlpha.200" 
                backdropFilter="blur(10px)"
                color="white"
                fontWeight="500"
              >
                <Icon as={FiMapPin} mr={1} />
                {region.cities.length} Cities
              </Badge>
            </HStack>
            <Heading size="2xl" fontWeight="800" lineHeight="1.2">
              {region.name}
            </Heading>
            <Text fontSize="lg" maxW="3xl" opacity={0.9}>
              {region.description}
            </Text>
          </VStack>
        </Box>
        
        <ModalBody p={0}>
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }}>
            <Box p={10}>
              <Heading size="lg" mb={6} color="gray.800">
                About {region.name}
              </Heading>
              <Text mb={6} color="gray.600" lineHeight="1.8">
                {region.description} This region offers a unique blend of cultural heritage, natural beauty, and authentic Moroccan experiences. From the bustling medinas to the serene landscapes, every corner tells a story of Morocco's rich history and vibrant present.
              </Text>
              
              <Heading size="md" mb={4} color="gray.800">
                Top Highlights
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
                {region.highlights.map((highlight, index) => (
                  <HStack key={index} spacing={3} p={3} bg="gray.50" borderRadius="lg">
                    <Box color="blue.500">
                      <Icon as={FiChevronRight} />
                    </Box>
                    <Text fontWeight="500">{highlight}</Text>
                  </HStack>
                ))}
              </SimpleGrid>
              
              <Heading size="md" mb={4} color="gray.800">
                Major Cities
              </Heading>
              <Wrap spacing={3} mb={8}>
                {region.cities.map((city, index) => (
                  <WrapItem key={index}>
                    <Badge 
                      px={4} 
                      py={2} 
                      borderRadius="full" 
                      bg="blue.50" 
                      color="blue.600"
                      fontWeight="500"
                      fontSize="md"
                    >
                      {city}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
              
              <MotionButton
                as={Link}
                href={`/attractions?region=${region.name.toLowerCase().split(' ')[0]}`}
                colorScheme="blue"
                size="lg"
                rightIcon={<FiChevronRight />}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                Explore Attractions in {region.name}
              </MotionButton>
            </Box>
            
            <Box bg="gray.50" p={8}>
              <Box 
                bg="white" 
                p={6} 
                borderRadius="xl" 
                boxShadow="sm"
                mb={6}
              >
                <Heading size="md" mb={4} color="gray.800">
                  Quick Facts
                </Heading>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.600">Best Time to Visit</Text>
                    <Text fontWeight="600">{region.bestTime}</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text color="gray.600">Main Cities</Text>
                    <Text fontWeight="600">{region.cities.length}</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text color="gray.600">Top Attractions</Text>
                    <Text fontWeight="600">{region.attractions}+</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text color="gray.600">Unique Experiences</Text>
                    <Text fontWeight="600">{region.experiences}+</Text>
                  </HStack>
                </VStack>
              </Box>
              
              <Box 
                bg="blue.50" 
                p={6} 
                borderRadius="xl" 
                borderWidth="1px"
                borderColor="blue.100"
              >
                <Heading size="md" mb={4} color="blue.800">
                  Ready to explore?
                </Heading>
                <Text mb={4} color="blue.700">
                  Discover the best of {region.name} with our curated experiences and local guides.
                </Text>
                <Button 
                  colorScheme="blue" 
                  w="full"
                  size="lg"
                  rightIcon={<FiChevronRight />}
                >
                  Plan Your Trip
                </Button>
              </Box>
            </Box>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const RegionsPage = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const exploreRef = useRef(null);
  const heroRef = useRef(null);
  
  // Color mode values
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const boxBg = useColorModeValue('blue.50', 'blue.900');
  const searchBg = useColorModeValue('white', 'gray.800');
  const searchBorder = useColorModeValue('gray.200', 'gray.700');
  const searchHover = useColorModeValue('blue.300', 'blue.500');
  const notFoundBoxBg = useColorModeValue('blue.50', 'blue.900');
  const notFoundTextColor = useColorModeValue('gray.600', 'gray.300');

  const regionTypes = [...new Set(regions.map(region => region.type))];

  // Scroll to explore section smoothly
  const scrollToExplore = () => {
    exploreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Parallax effect for hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredRegions = regions.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      region.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      region.cities.some(city => city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || region.type === selectedType;

    return matchesSearch && matchesType;
  });

  const handleRegionClick = (region) => {
    setSelectedRegion(region);
    onOpen();

    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToList = () => {
    setSelectedRegion(null);
  };

  useEffect(() => {
    if (isOpen && selectedRegion) {
      console.log(`Viewing details for ${selectedRegion.name}`);
    }
  }, [isOpen, selectedRegion]);

  // Remove duplicate color mode values as they are already defined at the top of the component
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Hero Section */}
      <Box
        position="relative"
        bg="gray.900"
        color="white"
        overflow="hidden"
        pb={{ base: 20, md: 32 }}
        pt={{ base: 32, md: 44 }}
      >
        {/* Background image with overlay */}
        <Box
          ref={heroRef}
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage="url('/images/morocco-hero.jpg')"
          bgSize="cover"
          bgPosition="center"
          bgAttachment="fixed"
          zIndex={1}
          opacity={0.8}
        />
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
                Discover Morocco's Diverse Regions
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
                From the bustling medinas to the serene desert landscapes, explore the rich culture and stunning beauty of Morocco's diverse regions.
              </Text>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              pt={4}
            >
              <HStack spacing={4} flexWrap="wrap">
                <Button
                  size="lg"
                  colorScheme="blue"
                  rightIcon={<FiChevronRight />}
                  onClick={scrollToExplore}
                  px={8}
                  py={6}
                  borderRadius="xl"
                  fontWeight="600"
                  bgGradient="linear(to-r, blue.500, blue.600)"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.3s ease"
                >
                  Explore Regions
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  rightIcon={<FiMapPin />}
                  color="white"
                  borderColor="whiteAlpha.400"
                  _hover={{
                    bg: 'whiteAlpha.100',
                    transform: 'translateY(-2px)',
                  }}
                  px={8}
                  py={6}
                  borderRadius="xl"
                  fontWeight="500"
                  transition="all 0.3s ease"
                >
                  View on Map
                </Button>
              </HStack>
            </MotionBox>
          </VStack>
        </Container>

        {/* Decorative elements */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height="100px"
          bg="url('/images/wave-divider.svg') center bottom no-repeat"
          bgSize="100% 100%"
          zIndex={4}
        />
      </Box>

      {/* Regions Grid Section */}
      <Box 
        ref={exploreRef} 
        position="relative" 
        py={20}
        bg={useColorModeValue('white', 'gray.900')}
      >
        <Container maxW="container.xl">
          <VStack spacing={12} align="stretch">
            {/* Section Header */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={4} textAlign="center" maxW="3xl" mx="auto">
                <Badge
                  px={4}
                  py={1.5}
                  borderRadius="full"
                  colorScheme="blue"
                  variant="subtle"
                  fontSize="sm"
                  fontWeight="600"
                  letterSpacing="wide"
                  textTransform="uppercase"
                >
                  Explore Morocco
                </Badge>
                <Heading 
                  as="h2" 
                  size="2xl" 
                  fontWeight="800" 
                  color={useColorModeValue('gray.900', 'white')}
                  lineHeight="1.2"
                >
                  Find Your Perfect Moroccan Destination
                </Heading>
                <Text 
                  fontSize="lg" 
                  color={useColorModeValue('gray.600', 'gray.300')} 
                  maxW="2xl"
                  lineHeight="tall"
                >
                  Discover the diverse landscapes, rich culture, and unique experiences each region has to offer.
                </Text>
              </VStack>
            </MotionBox>

            {/* Search and Filter */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <VStack spacing={6}>
                {/* Search Bar */}
                <Box w="100%" maxW="2xl" mx="auto">
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search regions, cities, or attractions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      bg={useColorModeValue('white', 'gray.800')}
                      borderRadius="xl"
                      borderWidth="2px"
                      borderColor={useColorModeValue('gray.200', 'gray.700')}
                      _hover={{
                        borderColor: useColorModeValue('blue.300', 'blue.600'),
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                      }}
                      fontSize="md"
                      height="56px"
                      pl={12}
                    />
                  </InputGroup>
                </Box>

                {/* Filter Chips */}
                <Box w="100%" overflowX="auto" pb={2} px={1}>
                  <HStack spacing={3} w="max-content" mx="auto">
                    <Button
                      size="md"
                      borderRadius="full"
                      variant={selectedType === 'all' ? 'solid' : 'outline'}
                      colorScheme="blue"
                      onClick={() => setSelectedType('all')}
                      minW="fit-content"
                      leftIcon={<FiGlobe />}
                      px={6}
                      fontWeight={selectedType === 'all' ? '600' : '500'}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'md',
                      }}
                      transition="all 0.2s"
                    >
                      All Regions
                    </Button>

                    {regionTypes.map((type) => {
                      const TypeIcon = regionIcons[type]?.icon || FiGlobe;
                      const isActive = selectedType === type;
                      return (
                        <Button
                          key={type}
                          size="md"
                          borderRadius="full"
                          variant={isActive ? 'solid' : 'outline'}
                          colorScheme={isActive ? 'blue' : 'gray'}
                          onClick={() => setSelectedType(type)}
                          minW="fit-content"
                          leftIcon={<TypeIcon />}
                          px={6}
                          fontWeight={isActive ? '600' : '500'}
                          _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'md',
                          }}
                          transition="all 0.2s"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      );
                    })}
                  </HStack>
                </Box>
              </VStack>
            </MotionBox>

            {/* Regions Grid */}
            {isLoading ? (
              <Flex justify="center" py={20}>
                <Spinner size="xl" color="blue.500" thickness="4px" emptyColor="gray.200" />
              </Flex>
            ) : filteredRegions.length > 0 ? (
              <>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                  {filteredRegions.map((region) => (
                    <RegionCard 
                      key={region.id}
                      region={region} 
                      onClick={() => handleRegionClick(region)}
                    />
                  ))}
                </SimpleGrid>
                
                <VStack spacing={6} mt={20} textAlign="center">
                  <Heading size="lg" color={headingColor}>
                    Ready to explore more of Morocco?
                  </Heading>
                  <Text color={textColor} maxW="2xl" mx="auto">
                    Discover unique experiences, local guides, and hidden gems across all Moroccan regions.
                  </Text>
                  <HStack spacing={4} pt={2}>
                    <Button 
                      colorScheme="blue" 
                      size="lg"
                      rightIcon={<FiChevronRight />}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'md',
                      }}
                      transition="all 0.2s"
                    >
                      Back to top
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      rightIcon={<FiMapPin />}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'md',
                      }}
                      transition="all 0.2s"
                    >
                      View on map
                    </Button>
                  </HStack>
                </VStack>
              </>
            ) : (
              <VStack spacing={6} py={20} textAlign="center">
                <Box p={6} bg={notFoundBoxBg} borderRadius="full" display="inline-flex">
                  <Icon as={FiSearch} boxSize={10} color="blue.500" />
                </Box>
                <Heading size="lg" color={headingColor}>
                  No regions found
                </Heading>
                <Text color={notFoundTextColor} maxW="md">
                  We couldn't find any regions matching your search. Try adjusting your filters or search term.
                </Text>
                <Button 
                  colorScheme="blue" 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                  }}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  transition="all 0.2s"
                >
                  Clear filters
                </Button>
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>
      
      <RegionDetailModal 
        isOpen={isOpen} 
        onClose={onClose} 
        region={selectedRegion} 
      />
    </Box>
  );
};

export default RegionsPage;
