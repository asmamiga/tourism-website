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
        height={{ base: '90vh', md: '100vh' }}
        bgImage="url('https://images.unsplash.com/photo-1548018560-c7196548e84d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
      >
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
            size="2xl"
            mb={4}
            className="hero-element"
          >
            Discover Morocco's Magic
          </MotionHeading>
          <MotionText
            fontSize="xl"
            maxW="container.md"
            mb={6}
            className="hero-element"
          >
            Explore ancient cities, vibrant markets, breathtaking landscapes, and authentic cultural experiences. Your journey through Morocco starts here.
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
              bg="brand.primary"
              color="white"
              _hover={{ bg: 'brand.secondary' }}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Plan Your Trip
            </MotionButton>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg="gray.50" ref={featuresRef}>
        <Container maxW="container.xl">
          <MotionHeading
            textAlign="center"
            mb={12}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Complete Morocco Experience
          </MotionHeading>
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
          <Heading textAlign="center" mb={12} className="section-title">
            Popular Destinations
          </Heading>
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
      >
        <Container maxW="container.xl" textAlign="center">
          <Heading mb={4} className="cta-element">
            Ready to Experience Morocco?
          </Heading>
          <Text fontSize="xl" mb={8} maxW="container.md" mx="auto" className="cta-element">
            Start planning your perfect Moroccan adventure today. Discover local businesses, connect with guides, and create unforgettable memories.
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
              _hover={{ bg: 'gray.100' }}
            >
              Sign Up Now
            </Button>
            <Button
              as={RouterLink}
              to="/itinerary-planner"
              size="lg"
              variant="outline"
              colorScheme="white"
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
