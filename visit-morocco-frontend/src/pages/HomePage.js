"use client"

import React, { useEffect, useRef } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { Box, Heading, Text, Button, Stack, Container, SimpleGrid, Image, Icon, Flex } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaMapMarkedAlt, FaHotel, FaUserTie, FaRoute, FaStar, FaHeart, FaCamera } from "react-icons/fa"

// Import GSAP for animations
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Import the Morocco Showcase component
import MoroccoShowcase from "./MoroccoShowcase.tsx"

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

// Motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionButton = motion(Button)

const Feature = ({ title, text, icon, delay, index }) => {
  // Different themes for each feature card
  const themes = [
    { primary: "#D2691E", secondary: "#FF6B35", accent: "#FFD700" }, // Marrakech theme
    { primary: "#4169E1", secondary: "#87CEEB", accent: "#E0F6FF" }, // Chefchaouen theme
    { primary: "#008B8B", secondary: "#20B2AA", accent: "#AFEEEE" }, // Essaouira theme
    { primary: "#DAA520", secondary: "#F4A460", accent: "#FFF8DC" }, // Sahara theme
  ]

  const theme = themes[index] || themes[0]

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      position="relative"
      overflow="hidden"
      whileHover={{ y: -15, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      height="100%"
    >
      <Box
        position="relative"
        p={8}
        borderRadius="3xl"
        overflow="hidden"
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.3)"
        boxShadow="0 25px 50px rgba(0, 0, 0, 0.1)"
        _hover={{
          boxShadow: "0 35px 70px rgba(0, 0, 0, 0.15)",
          borderColor: `${theme.primary}40`,
        }}
        transition="all 0.5s ease"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.accent}10 100%)`,
          opacity: 0,
          transition: "opacity 0.3s ease",
        }}
        _hover={{
          _before: {
            opacity: 1,
          },
        }}
        display="flex"
        flexDirection="column"
        height="100%"
      >
        {/* Floating particles for each feature */}
        <Box position="absolute" inset="0" pointerEvents="none" overflow="hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: `linear-gradient(45deg, ${theme.primary}, ${theme.accent})`,
                left: `${15 + i * 15}%`,
                top: `${10 + i * 15}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
              }}
            />
          ))}
        </Box>

        {/* Enhanced icon container */}
        <MotionBox
          w={20}
          h={20}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          borderRadius="2xl"
          bg={`linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)`}
          mb={6}
          boxShadow={`0 15px 35px ${theme.primary}40`}
          position="relative"
          overflow="hidden"
          whileHover={{
            scale: 1.1,
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 0.3 }}
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent)",
            transform: "translateX(-100%)",
            transition: "transform 0.6s ease",
          }}
          _hover={{
            _before: {
              transform: "translateX(100%)",
            },
          }}
        >
          {React.cloneElement(icon, { w: 8, h: 8 })}
        </MotionBox>

        {/* Content */}
        <Box position="relative" zIndex={2} flex="1" display="flex" flexDirection="column">
          <Heading
            fontSize="xl"
            mb={4}
            fontWeight="700"
            color="gray.800"
            bgGradient={`linear(to-r, ${theme.primary}, ${theme.secondary})`}
            bgClip="text"
            minH="3.5rem"
            display="flex"
            alignItems="center"
          >
            {title}
          </Heading>
          <Text 
            color="gray.600" 
            lineHeight="1.6" 
            fontSize="md" 
            mb={6} 
            flex="1"
            noOfLines={3}
          >
            {text}
          </Text>

          {/* Enhanced CTA button */}
          <Box mt="auto">
            <Button
              size="sm"
              bg={`linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`}
              color="white"
              borderRadius="xl"
              fontWeight="600"
              px={6}
              py={3}
              _hover={{
                bg: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.accent} 100%)`,
                transform: "translateY(-2px)",
                boxShadow: `0 10px 25px ${theme.primary}40`,
              }}
              _active={{
                transform: "translateY(0)",
              }}
              transition="all 0.3s ease"
              width="100%"
              textAlign="center"
            >
              Learn More
            </Button>
          </Box>
        </Box>

        {/* Decorative corner element */}
        <Box
          position="absolute"
          top="0"
          right="0"
          w="50px"
          h="50px"
          bg={`linear-gradient(135deg, ${theme.accent}30, transparent)`}
          borderBottomLeftRadius="full"
        />
      </Box>
    </MotionBox>
  )
}

const Destination = ({ name, image, description, link, index }) => {
  const boxRef = useRef(null)

  // Destination themes
  const destinationThemes = [
    { primary: "#D2691E", secondary: "#FF6B35", accent: "#FFD700", mood: "vibrant" }, // Marrakech
    { primary: "#8B4513", secondary: "#DEB887", accent: "#F4A460", mood: "historic" }, // Fes
    { primary: "#4169E1", secondary: "#87CEEB", accent: "#E0F6FF", mood: "serene" }, // Chefchaouen
    { primary: "#DAA520", secondary: "#F4A460", accent: "#FFF8DC", mood: "mystical" }, // Sahara
    { primary: "#008B8B", secondary: "#20B2AA", accent: "#AFEEEE", mood: "coastal" }, // Essaouira
    { primary: "#27AE60", secondary: "#2ECC71", accent: "#A8E6CF", mood: "adventurous" }, // Atlas
  ]

  const theme = destinationThemes[index] || destinationThemes[0]

  useEffect(() => {
    const box = boxRef.current

    gsap.fromTo(
      box,
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: box,
          start: "top bottom-=100",
          toggleActions: "play none none reverse",
        },
      },
    )
  }, [])

  return (
    <MotionBox
      ref={boxRef}
      position="relative"
      overflow="hidden"
      whileHover={{ y: -15, scale: 1.03 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        borderRadius="3xl"
        overflow="hidden"
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(20px)"
        boxShadow="0 25px 50px rgba(0, 0, 0, 0.1)"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.3)"
        position="relative"
        _hover={{
          boxShadow: "0 35px 70px rgba(0, 0, 0, 0.2)",
          borderColor: `${theme.primary}40`,
        }}
        transition="all 0.5s ease"
      >
        {/* Floating particles for each destination */}
        <Box position="absolute" inset="0" pointerEvents="none" zIndex={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: `linear-gradient(45deg, ${theme.primary}, ${theme.accent})`,
                left: `${10 + i * 12}%`,
                top: `${15 + i * 10}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.4, 0.9, 0.4],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 5 + i * 0.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.4,
              }}
            />
          ))}
        </Box>

        {/* Enhanced image container */}
        <Box h="280px" overflow="hidden" position="relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            objectFit="cover"
            w="100%"
            h="100%"
            transition="transform 0.6s ease"
            _hover={{ transform: "scale(1.15)" }}
          />

          {/* Image overlay effects */}
          <Box
            position="absolute"
            inset="0"
            bg={`linear-gradient(to bottom, transparent 0%, ${theme.primary}20 50%, rgba(0,0,0,0.4) 100%)`}
          />

          {/* Floating mood indicator */}
          <MotionBox
            position="absolute"
            top="4"
            right="4"
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(10px)"
            borderRadius="full"
            px={4}
            py={2}
            fontSize="sm"
            fontWeight="600"
            color={theme.primary}
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.3)"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {theme.mood}
          </MotionBox>

          {/* Rating stars */}
          <Box position="absolute" top="4" left="4">
            <Flex align="center" gap={1}>
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <Icon as={FaStar} w={3} h={3} color="#FFD700" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
                </motion.div>
              ))}
            </Flex>
          </Box>

          {/* Favorite heart icon */}
          <MotionBox position="absolute" bottom="4" right="4" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <Icon
              as={FaHeart}
              w={6}
              h={6}
              color="white"
              filter="drop-shadow(0 2px 8px rgba(0,0,0,0.3))"
              cursor="pointer"
              _hover={{ color: "#FF6B6B" }}
              transition="color 0.3s ease"
            />
          </MotionBox>
        </Box>

        {/* Enhanced content */}
        <Box p={8} position="relative">
          {/* Decorative line */}
          <Box
            w="60px"
            h="3px"
            bg={`linear-gradient(to right, ${theme.primary}, ${theme.accent})`}
            borderRadius="full"
            mb={4}
          />

          <Heading
            as="h3"
            size="lg"
            mb={4}
            color="gray.800"
            fontWeight="700"
            bgGradient={`linear(to-r, ${theme.primary}, ${theme.secondary})`}
            bgClip="text"
          >
            {name}
          </Heading>

          <Text color="gray.600" mb={6} lineHeight="1.7" fontSize="md">
            {description}
          </Text>

          {/* Enhanced explore button */}
          <MotionButton
            as={RouterLink}
            to={link}
            bg={`linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`}
            color="white"
            size="md"
            borderRadius="xl"
            fontWeight="600"
            px={8}
            py={3}
            leftIcon={<Icon as={FaCamera} />}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            _hover={{
              bg: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.accent} 100%)`,
              boxShadow: `0 15px 35px ${theme.primary}40`,
            }}
            transition="all 0.3s ease"
          >
            Explore
          </MotionButton>
        </Box>

        {/* Decorative corner elements */}
        <Box
          position="absolute"
          top="0"
          left="0"
          w="80px"
          h="80px"
          bg={`linear-gradient(135deg, ${theme.accent}20, transparent)`}
          borderBottomRightRadius="full"
        />
        <Box
          position="absolute"
          bottom="0"
          right="0"
          w="60px"
          h="60px"
          bg={`linear-gradient(135deg, ${theme.primary}20, transparent)`}
          borderTopLeftRadius="full"
        />
      </Box>
    </MotionBox>
  )
}

const HomePage = () => {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const destinationsRef = useRef(null)
  const ctaRef = useRef(null)

  // Handle navigation from Morocco Showcase
  const handleExploreCity = (link) => {
    navigate(link)
  }

  useEffect(() => {
    // Features section animation
    gsap.fromTo(
      featuresRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse",
        },
      },
    )

    // Destinations section animation
    gsap.fromTo(
      destinationsRef.current.querySelector(".section-title"),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: destinationsRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse",
        },
      },
    )

    // CTA section animation
    gsap.fromTo(
      ctaRef.current.querySelectorAll(".cta-element"),
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.8,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse",
        },
      },
    )
  }, [])

  return (
    <Box>
      {/* Morocco Showcase Hero Section */}
      <Box position="relative" height="100vh" overflow="hidden">
        <MoroccoShowcase onExplore={handleExploreCity} />
      </Box>

      {/* Enhanced Features Section */}
      <Box
        py={24}
        ref={featuresRef}
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)"
      >
        {/* Cinematic background effects */}
        <Box position="absolute" inset="0" zIndex={0}>
          {/* Animated gradient overlay */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 30% 20%, rgba(210, 105, 30, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)",
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </Box>

        {/* Enhanced floating particles */}
        <Box position="absolute" inset="0" zIndex={1} pointerEvents="none">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: `${4 + Math.random() * 4}px`,
                height: `${4 + Math.random() * 4}px`,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #D2691E, #FFD700)",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 10 + Math.random() * 8,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </Box>

        {/* Enhanced decorative elements */}
        <Box
          position="absolute"
          top="5%"
          left="-10%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(210, 105, 30, 0.2) 0%, transparent 70%)"
          zIndex={1}
        />
        <Box
          position="absolute"
          bottom="5%"
          right="-10%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)"
          zIndex={1}
        />

        {/* Light rays */}
        <Box position="absolute" inset="0" zIndex={1} pointerEvents="none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`light-ray-${i}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "2px",
                height: "100vh",
                background: "linear-gradient(to bottom, rgba(255, 215, 0, 0.3), transparent 60%)",
                transformOrigin: "top",
                transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
              }}
              animate={{
                rotate: [i * 45, i * 45 + 360],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </Box>

        <Container maxW="container.xl" position="relative" zIndex={2}>
          <MotionHeading
            textAlign="center"
            mb={6}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            fontWeight="800"
            fontSize={{ base: "4xl", md: "6xl" }}
            bgGradient="linear(to-r, #FFD700, #D2691E, #FFD700)"
            bgClip="text"
            letterSpacing="tight"
            textShadow="0 4px 20px rgba(255, 215, 0, 0.3)"
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              bottom: "-25px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "120px",
              height: "4px",
              borderRadius: "full",
              background: "linear-gradient(to right, #D2691E, #FFD700, #D2691E)",
              boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
            }}
          >
            Your Complete Morocco Experience
          </MotionHeading>

          <MotionText
            textAlign="center"
            maxW="container.md"
            mx="auto"
            mb={20}
            color="whiteAlpha.900"
            fontSize="xl"
            lineHeight="1.8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            fontWeight="300"
          >
            Immerse yourself in authentic Moroccan culture and discover everything this magical country has to offer
          </MotionText>

          <SimpleGrid 
            columns={{ base: 1, md: 2, lg: 4 }} 
            spacing={{ base: 6, md: 8 }}
            alignItems="stretch"
            justifyItems="center"
            width="100%"
            maxW="container.xl"
            mx="auto"
          >
            <Feature
              title="Discover Places"
              text="Explore Morocco's diverse regions, cities, and hidden gems."
              icon={<Icon as={FaMapMarkedAlt} w={10} h={10} />}
              delay={0.1}
              index={0}
            />
            <Feature
              title="Find Accommodations"
              text="Book hotels, riads, and unique stays across Morocco."
              icon={<Icon as={FaHotel} w={10} h={10} />}
              delay={0.2}
              index={1}
            />
            <Feature
              title="Meet Local Guides"
              text="Connect with professional guides for authentic experiences."
              icon={<Icon as={FaUserTie} w={10} h={10} />}
              delay={0.3}
              index={2}
            />
            <Feature
              title="Plan Your Journey"
              text="Create custom itineraries for your perfect Moroccan adventure."
              icon={<Icon as={FaRoute} w={10} h={10} />}
              delay={0.4}
              index={3}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Enhanced Popular Destinations */}
      <Box
        py={24}
        ref={destinationsRef}
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)"
      >
        {/* Enhanced background effects */}
        <Box position="absolute" inset="0" zIndex={0}>
          {/* Animated gradient overlay */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 20% 30%, rgba(210, 105, 30, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(65, 105, 225, 0.06) 0%, transparent 50%)",
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 12,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </Box>

        {/* Floating particles */}
        <Box position="absolute" inset="0" zIndex={1} pointerEvents="none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: `${3 + Math.random() * 3}px`,
                height: `${3 + Math.random() * 3}px`,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #D2691E, #4169E1)",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 8 + Math.random() * 6,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </Box>

        {/* Decorative elements */}
        <Box
          position="absolute"
          top="10%"
          left="-5%"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(210, 105, 30, 0.1) 0%, transparent 70%)"
          zIndex={1}
        />
        <Box
          position="absolute"
          bottom="10%"
          right="-5%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(65, 105, 225, 0.08) 0%, transparent 70%)"
          zIndex={1}
        />

        <Container maxW="container.xl" position="relative" zIndex={2}>
          <MotionHeading
            textAlign="center"
            mb={6}
            className="section-title"
            fontWeight="800"
            fontSize={{ base: "4xl", md: "6xl" }}
            bgGradient="linear(to-r, #D2691E, #4169E1, #008B8B)"
            bgClip="text"
            letterSpacing="tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              bottom: "-25px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "120px",
              height: "4px",
              borderRadius: "full",
              background: "linear-gradient(to right, #D2691E, #4169E1, #008B8B)",
              boxShadow: "0 0 20px rgba(210, 105, 30, 0.3)",
            }}
          >
            Popular Destinations
          </MotionHeading>

          <MotionText
            textAlign="center"
            maxW="container.md"
            mx="auto"
            mb={20}
            color="gray.600"
            fontSize="xl"
            lineHeight="1.8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            fontWeight="300"
          >
            Explore these incredible locations that showcase the diversity and beauty of Morocco
          </MotionText>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            <Destination
              name="Marrakech"
              image="/images/cities/marrakech-main.jpg"
              description="Explore the vibrant markets, palaces, and gardens of Morocco's cultural capital."
              link="/attractions?city=marrakech"
              index={0}
            />
            <Destination
              name="Fes"
              image="/images/cities/fes-main.jpg"
              description="Discover the ancient medina, traditional crafts, and rich history of Fes."
              link="/attractions?city=fes"
              index={1}
            />
            <Destination
              name="Chefchaouen"
              image="/images/cities/chefchaouen-main.jpg"
              description="Wander through the famous blue streets of this picturesque mountain town."
              link="/attractions?city=chefchaouen"
              index={2}
            />
            <Destination
              name="Sahara Desert"
              image="/images/cities/sahara-main.jpg"
              description="Experience the magic of the desert with camel treks and nights under the stars."
              link="/attractions?region=sahara"
              index={3}
            />
            <Destination
              name="Essaouira"
              image="/images/cities/essaouira-main.jpg"
              description="Relax in this coastal gem with its beautiful beaches and historic medina."
              link="/attractions?city=essaouira"
              index={4}
            />
            <Destination
              name="Atlas Mountains"
              image="/images/cities/atlas-mountains-main.jpg"
              description="Hike through stunning landscapes and visit traditional Berber villages."
              link="/attractions?region=atlas"
              index={5}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Enhanced CTA Section */}
      <Box
        py={24}
        ref={ctaRef}
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)"
      >
        {/* Enhanced cinematic background */}
        <Box position="absolute" inset="0" zIndex={0}>
          {/* Animated gradient overlay */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 40% 30%, rgba(210, 105, 30, 0.2) 0%, transparent 50%), radial-gradient(circle at 60% 70%, rgba(255, 215, 0, 0.15) 0%, transparent 50%)",
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </Box>

        {/* Enhanced floating particles */}
        <Box position="absolute" inset="0" zIndex={1} pointerEvents="none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: `${3 + Math.random() * 5}px`,
                height: `${3 + Math.random() * 5}px`,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #D2691E, #FFD700)",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -60, 0],
                opacity: [0.3, 0.9, 0.3],
                scale: [1, 1.8, 1],
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 6,
              }}
            />
          ))}
        </Box>

        {/* Enhanced decorative elements */}
        <Box
          position="absolute"
          top="-150px"
          right="-150px"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(210, 105, 30, 0.25) 0%, transparent 70%)"
          zIndex={1}
        />
        <Box
          position="absolute"
          bottom="-100px"
          left="-100px"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)"
          zIndex={1}
        />

        {/* Enhanced light rays */}
        <Box position="absolute" inset="0" zIndex={1} pointerEvents="none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`cta-ray-${i}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "3px",
                height: "100vh",
                background: "linear-gradient(to bottom, rgba(255, 215, 0, 0.4), transparent 60%)",
                transformOrigin: "top",
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              }}
              animate={{
                rotate: [i * 30, i * 30 + 360],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 25,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </Box>

        <Container maxW="container.xl" textAlign="center" position="relative" zIndex={2}>
          <MotionHeading
            mb={8}
            className="cta-element"
            fontSize={{ base: "4xl", md: "7xl" }}
            fontWeight="800"
            letterSpacing="tight"
            textShadow="0 4px 20px rgba(0,0,0,0.3)"
            bgGradient="linear(to-r, white, #FFD700, white)"
            bgClip="text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              bottom: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "150px",
              height: "4px",
              borderRadius: "full",
              background: "linear-gradient(to right, #D2691E, #FFD700, #D2691E)",
              boxShadow: "0 0 25px rgba(255, 215, 0, 0.6)",
            }}
          >
            Ready to Experience Morocco?
          </MotionHeading>

          <MotionText
            fontSize={{ base: "lg", md: "2xl" }}
            mb={16}
            maxW="container.md"
            mx="auto"
            className="cta-element"
            color="whiteAlpha.900"
            lineHeight="1.8"
            fontWeight="300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Start planning your perfect Moroccan adventure today. Discover local businesses, connect with authentic
            guides, and create unforgettable memories in this enchanting country.
          </MotionText>

          <Stack direction={{ base: "column", md: "row" }} spacing={8} justify="center" className="cta-element">
            <MotionButton
              as={RouterLink}
              to="/register"
              size="lg"
              bg="linear-gradient(135deg, #D2691E 0%, #FF6B35 100%)"
              color="white"
              px={12}
              py={8}
              fontWeight="600"
              fontSize="lg"
              borderRadius="2xl"
              boxShadow="0 20px 40px rgba(210, 105, 30, 0.4)"
              whileHover={{
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.98 }}
              _hover={{
                bg: "linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)",
                boxShadow: "0 25px 50px rgba(210, 105, 30, 0.5)",
              }}
              transition="all 0.3s ease"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transitionDelay="0.6s"
            >
              Sign Up Now
            </MotionButton>

            <MotionButton
              as={RouterLink}
              to="/itinerary-planner"
              size="lg"
              variant="outline"
              borderColor="white"
              color="white"
              borderWidth="2px"
              px={12}
              py={8}
              fontWeight="600"
              fontSize="lg"
              borderRadius="2xl"
              backdropFilter="blur(10px)"
              bg="rgba(255, 255, 255, 0.1)"
              boxShadow="0 20px 40px rgba(0, 0, 0, 0.2)"
              whileHover={{
                scale: 1.05,
                y: -5,
              }}
              whileTap={{ scale: 0.98 }}
              _hover={{
                bg: "rgba(255, 255, 255, 0.2)",
                borderColor: "#FFD700",
                color: "#FFD700",
                boxShadow: "0 25px 50px rgba(255, 215, 0, 0.3)",
              }}
              transition="all 0.3s ease"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transitionDelay="0.8s"
            >
              Plan Your Trip
            </MotionButton>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
