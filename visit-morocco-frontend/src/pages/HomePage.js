import React, { useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Container,
  SimpleGrid,
  Image,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaMapMarkedAlt, FaHotel, FaUserTie, FaRoute } from 'react-icons/fa';

// Import GSAP for animations
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Motion components
const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const Feature = ({ title, text, icon, delay }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      sx={{
        _hover: {
          transform: 'translateY(-5px)',
          boxShadow: 'lg',
          borderColor: 'brand.primary',
        },
        transition: 'all 0.3s ease'
      }}
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'brand.primary'}
        mb={4}
      >
        {icon}
      </Flex>
      <Heading fontSize="xl" mb={2}>{title}</Heading>
      <Text color={'gray.600'}>{text}</Text>
    </MotionBox>
  );
};

const Destination = ({ name, image, description, link, index }) => {
  const boxRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    
    gsap.fromTo(
      box,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: box,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  return (
    <Box
      ref={boxRef}
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="md"
      position="relative"
      transition="all 0.3s ease"
      _hover={{ transform: 'scale(1.03)', boxShadow: 'xl' }}
    >
      <Box h="200px" overflow="hidden">
        <Image
          src={image}
          alt={name}
          objectFit="cover"
          w="100%"
          h="100%"
          transition="transform 0.5s ease"
          _hover={{ transform: 'scale(1.1)' }}
        />
      </Box>
      <Box p={5}>
        <Heading as="h3" size="md" mb={2}>
          {name}
        </Heading>
        <Text color="gray.600" mb={4}>
          {description}
        </Text>
        <Button
          as={RouterLink}
          to={link}
          colorScheme="green"
          variant="outline"
          size="sm"
        >
          Explore
        </Button>
      </Box>
    </Box>
  );
};

const HomePage = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const destinationsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Hero section animation
    gsap.fromTo(
      heroRef.current.querySelectorAll('.hero-element'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.2, duration: 1, ease: 'power2.out' }
    );

    // Features section animation
    gsap.fromTo(
      featuresRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Destinations section animation
    gsap.fromTo(
      destinationsRef.current.querySelector('.section-title'),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: destinationsRef.current,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // CTA section animation
    gsap.fromTo(
      ctaRef.current.querySelectorAll('.cta-element'),
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.8,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        position="relative"
        height={{ base: '100vh', md: '100vh' }}
        overflow="hidden"
      >
        {/* Video or Image Background */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={-1}
          bgImage="url('https://images.unsplash.com/photo-1548018560-c7196548e84d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80')"
          bgPosition="center"
          bgSize="cover"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
            zIndex: 0
          }}
        ></Box>
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
        />
        <Container
          maxW="container.xl"
          position="relative"
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          color="white"
        >
          <MotionHeading
            as="h1"
            fontSize={{ base: "4xl", md: "6xl" }}
            fontWeight="800"
            lineHeight="1.2"
            mb={6}
            className="hero-element"
            bgGradient="linear(to-r, white, brand.tan)"
            bgClip="text"
            textShadow="0px 0px 20px rgba(0,0,0,0.2)"
          >
            Discover Morocco's<br />
            <Box as="span" color="brand.accent">Magic</Box>
          </MotionHeading>
          <MotionText
            fontSize={{ base: "xl", md: "2xl" }}
            maxW="container.md"
            mb={8}
            className="hero-element"
            textShadow="0px 0px 10px rgba(0,0,0,0.3)"
            fontWeight="400"
          >
            Explore ancient cities, vibrant markets, breathtaking landscapes,
            and authentic cultural experiences. Your journey through Morocco starts here.
          </MotionText>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={4}
            className="hero-element"
          >
            <MotionButton
              as={RouterLink}
              to="/businesses"
              size="lg"
              variant="primary"
              bg="brand.primary"
              color="white"
              px={8}
              py={6}
              fontSize="md"
              boxShadow="0px 10px 20px rgba(0,0,0,0.15)"
              position="relative"
              overflow="hidden"
              _after={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                transform: 'translateX(-100%)',
                transition: 'transform 0.6s ease-out',
              }}
              _hover={{ 
                bg: 'brand.secondary',
                _after: {
                  transform: 'translateX(100%)',
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Businesses
            </MotionButton>
            <MotionButton
              as={RouterLink}
              to="/itinerary-planner"
              size="lg"
              variant="outline"
              colorScheme="white"
              borderWidth="2px"
              px={8}
              py={6}
              fontSize="md"
              _hover={{
                bg: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'brand.accent',
                color: 'brand.accent',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              boxShadow="0px 10px 20px rgba(0,0,0,0.15)"
            >
              Plan Your Trip
            </MotionButton>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg="brand.light" ref={featuresRef} position="relative" overflow="hidden">
        {/* Decorative Elements */}
        <Box 
          position="absolute" 
          top="10%" 
          left="-5%" 
          w="200px" 
          h="200px" 
          borderRadius="full" 
          bg="brand.primary" 
          opacity="0.05" 
          zIndex="0"
        />
        <Box 
          position="absolute" 
          bottom="10%" 
          right="-5%" 
          w="300px" 
          h="300px" 
          borderRadius="full" 
          bg="brand.secondary" 
          opacity="0.05" 
          zIndex="0"
        />
        <Container maxW="container.xl">
          <MotionHeading
            textAlign="center"
            mb={4}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            fontWeight="800"
            fontSize={{ base: "3xl", md: "4xl" }}
            position="relative"
            zIndex="1"
            bgGradient="linear(to-r, brand.primary, brand.secondary)"
            bgClip="text"
            letterSpacing="tight"
          >
            Your Complete Morocco Experience
          </MotionHeading>
          <MotionText
            textAlign="center"
            maxW="container.md"
            mx="auto"
            mb={12}
            color="gray.600"
            fontSize="lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Immerse yourself in authentic Moroccan culture and discover everything this magical country has to offer
          </MotionText>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            <Feature
              title="Discover Places"
              text="Explore Morocco's diverse regions, cities, and hidden gems."
              icon={<Icon as={FaMapMarkedAlt} w={10} h={10} />}
              delay={0.1}
            />
            <Feature
              title="Find Accommodations"
              text="Book hotels, riads, and unique stays across Morocco."
              icon={<Icon as={FaHotel} w={10} h={10} />}
              delay={0.2}
            />
            <Feature
              title="Meet Local Guides"
              text="Connect with professional guides for authentic experiences."
              icon={<Icon as={FaUserTie} w={10} h={10} />}
              delay={0.3}
            />
            <Feature
              title="Plan Your Journey"
              text="Create custom itineraries for your perfect Moroccan adventure."
              icon={<Icon as={FaRoute} w={10} h={10} />}
              delay={0.4}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Popular Destinations */}
      <Box py={20} ref={destinationsRef}>
        <Container maxW="container.xl">
          <Heading 
            textAlign="center" 
            mb={4} 
            className="section-title"
            fontWeight="800"
            fontSize={{ base: "3xl", md: "4xl" }}
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '4px',
              borderRadius: 'full',
              bgGradient: 'linear(to-r, brand.primary, brand.secondary)'
            }}
          >
            Popular Destinations
          </Heading>
          <Text
            textAlign="center"
            maxW="container.md"
            mx="auto"
            mb={12}
            color="gray.600"
            fontSize="lg"
          >
            Explore these incredible locations that showcase the diversity and beauty of Morocco
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            <Destination
              name="Marrakech"
              image="https://images.unsplash.com/photo-1597212720158-e21dad559189?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              description="Explore the vibrant markets, palaces, and gardens of Morocco's cultural capital."
              link="/attractions?city=marrakech"
              index={0}
            />
            <Destination
              name="Fes"
              image="https://images.unsplash.com/photo-1590236047147-9e1f2eaafff5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              description="Discover the ancient medina, traditional crafts, and rich history of Fes."
              link="/attractions?city=fes"
              index={1}
            />
            <Destination
              name="Chefchaouen"
              image="https://images.unsplash.com/photo-1553244171-0f2233c9163e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
              description="Wander through the famous blue streets of this picturesque mountain town."
              link="/attractions?city=chefchaouen"
              index={2}
            />
            <Destination
              name="Sahara Desert"
              image="https://images.unsplash.com/photo-1489493887464-892be6d1daae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              description="Experience the magic of the desert with camel treks and nights under the stars."
              link="/attractions?region=sahara"
              index={3}
            />
            <Destination
              name="Essaouira"
              image="https://images.unsplash.com/photo-1577147443647-81856d5151af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              description="Relax in this coastal gem with its beautiful beaches and historic medina."
              link="/attractions?city=essaouira"
              index={4}
            />
            <Destination
              name="Atlas Mountains"
              image="https://images.unsplash.com/photo-1528834342297-fdefb9a5a92c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              description="Hike through stunning landscapes and visit traditional Berber villages."
              link="/attractions?region=atlas"
              index={5}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        py={20}
        bg="brand.primary"
        color="white"
        ref={ctaRef}
        position="relative"
        overflow="hidden"
        bgGradient="linear(to-r, brand.primary, brand.blue)"
      >
        {/* Decorative background elements */}
        <Box
          position="absolute"
          top="-100px"
          right="-100px"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="rgba(255,255,255,0.1)"
        />
        <Box
          position="absolute"
          bottom="-50px"
          left="-50px"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="rgba(255,255,255,0.1)"
        />
        <Container maxW="container.xl" textAlign="center">
          <Heading 
            mb={4} 
            className="cta-element"
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="800"
            letterSpacing="tight"
            textShadow="0 2px 10px rgba(0,0,0,0.2)"
          >
            Ready to Experience Morocco?
          </Heading>
          <Text 
            fontSize={{ base: "lg", md: "xl" }} 
            mb={8} 
            maxW="container.md" 
            mx="auto" 
            className="cta-element"
            opacity="0.9"
            lineHeight="1.8"
          >
            Start planning your perfect Moroccan adventure today. Discover local businesses,
            connect with authentic guides, and create unforgettable memories in this enchanting country.
          </Text>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={4}
            justify="center"
            className="cta-element"
          >
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              bg="white"
              color="brand.primary"
              px={8}
              py={7}
              fontWeight="600"
              fontSize="md"
              _hover={{ 
                bg: 'brand.yellow',
                transform: 'translateY(-5px)',
                boxShadow: 'xl'
              }}
              boxShadow="0 10px 20px rgba(0,0,0,0.1)"
              transition="all 0.3s ease"
            >
              Sign Up Now
            </Button>
            <Button
              as={RouterLink}
              to="/itinerary-planner"
              size="lg"
              variant="outline"
              colorScheme="white"
              borderWidth="2px"
              px={8}
              py={7}
              fontWeight="600"
              fontSize="md"
              _hover={{ 
                bg: 'rgba(255,255,255,0.1)', 
                transform: 'translateY(-5px)',
                boxShadow: 'xl'
              }}
              boxShadow="0 10px 20px rgba(0,0,0,0.1)"
              transition="all 0.3s ease"
            >
              Plan Your Trip
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
