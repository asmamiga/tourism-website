"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, type PanInfo, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { Box, Flex, Text, Button, VStack, HStack } from "@chakra-ui/react"

// Icons (you can replace these with your preferred icon library)
const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6"></polyline>
  </svg>
)

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
)

const MapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const Star = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
  </svg>
)

const Camera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
)

const Users = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const Compass = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"></polygon>
  </svg>
)

const Sun = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
)

const Mountain = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 21l4-7 4 7"></path>
    <path d="M12 14l4-7 4 7"></path>
    <path d="M4 21l4-7 4 7"></path>
  </svg>
)

const Waves = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
  </svg>
)

// Enhanced city data
const cities = [
  {
    id: 1,
    name: "Marrakech",
    subtitle: "The Red City",
    description:
      "Lose yourself in the labyrinthine souks, marvel at the intricate architecture of Bahia Palace, and experience the electric energy of Jemaa el-Fnaa as snake charmers and storytellers come alive.",
    image: "/images/cities/marrakech-main.jpg",
    secondaryImage: "/images/cities/marrakech-secondary.jpg",
    theme: {
      primary: "#D2691E",
      secondary: "#FF6B35",
      accent: "#FFD700",
      gradient: "linear-gradient(135deg, #D2691E 0%, #FF6B35 50%, #FFD700 100%)",
    },
    highlights: ["Jemaa el-Fnaa", "Bahia Palace", "Majorelle Garden", "Souks"],
    stats: { attractions: 45, hotels: 120, rating: 4.8 },
    icon: Sun,
    mood: "vibrant",
    link: "/attractions?city=marrakech",
  },
  {
    id: 2,
    name: "Chefchaouen",
    subtitle: "The Blue Pearl",
    description:
      "Wander through a dreamscape of azure-painted walls cascading down mountain slopes, where every corner reveals a new shade of blue and every alley tells a story of Andalusian heritage.",
    image: "/images/cities/chefchaouen-main.jpg",
    secondaryImage: "/images/cities/chefchaouen-secondary.jpg",
    theme: {
      primary: "#4169E1",
      secondary: "#87CEEB",
      accent: "#E0F6FF",
      gradient: "linear-gradient(135deg, #4169E1 0%, #87CEEB 50%, #E0F6FF 100%)",
    },
    highlights: ["Blue Medina", "Ras El Maa", "Spanish Mosque", "Rif Mountains"],
    stats: { attractions: 25, hotels: 45, rating: 4.9 },
    icon: Mountain,
    mood: "serene",
    link: "/attractions?city=chefchaouen",
  },
  {
    id: 3,
    name: "Fes",
    subtitle: "The Cultural Capital",
    description:
      "Step into a living museum where medieval streets echo with the sounds of artisans at work, ancient universities whisper tales of knowledge, and the aroma of traditional crafts fills the air.",
    image: "/images/cities/fes-main.jpg",
    secondaryImage: "/images/cities/fes-secondary.jpg",
    theme: {
      primary: "#8B4513",
      secondary: "#DEB887",
      accent: "#F4A460",
      gradient: "linear-gradient(135deg, #8B4513 0%, #DEB887 50%, #F4A460 100%)",
    },
    highlights: ["Fes el-Bali", "Al Quaraouiyine", "Chouara Tannery", "Bou Inania"],
    stats: { attractions: 60, hotels: 85, rating: 4.7 },
    icon: Star,
    mood: "historic",
    link: "/attractions?city=fes",
  },
  {
    id: 4,
    name: "Essaouira",
    subtitle: "The Windy City",
    description:
      "Feel the Atlantic breeze carry tales of Portuguese traders and Gnawa musicians, while ancient ramparts stand guard over a bohemian paradise where art and ocean meet in perfect harmony.",
    image: "/images/cities/essaouira-main.jpg",
    secondaryImage: "/images/cities/essaouira-secondary.jpg",
    theme: {
      primary: "#008B8B",
      secondary: "#20B2AA",
      accent: "#AFEEEE",
      gradient: "linear-gradient(135deg, #008B8B 0%, #20B2AA 50%, #AFEEEE 100%)",
    },
    highlights: ["Medina Walls", "Skala Port", "Argan Cooperatives", "Windsurfing"],
    stats: { attractions: 30, hotels: 65, rating: 4.6 },
    icon: Waves,
    mood: "coastal",
    link: "/attractions?city=essaouira",
  },
  {
    id: 5,
    name: "Sahara Desert",
    subtitle: "The Golden Dunes",
    description:
      "Surrender to the infinite expanse of golden sand dunes where time stands still, camel caravans trace ancient routes, and the star-filled sky reveals the universe in all its glory.",
    image: "/images/cities/sahara-main.jpg",
    secondaryImage: "/images/cities/sahara-secondary.jpg",
    theme: {
      primary: "#DAA520",
      secondary: "#F4A460",
      accent: "#FFF8DC",
      gradient: "linear-gradient(135deg, #DAA520 0%, #F4A460 50%, #FFF8DC 100%)",
    },
    highlights: ["Erg Chebbi", "Camel Trekking", "Desert Camps", "Stargazing"],
    stats: { attractions: 15, hotels: 25, rating: 4.9 },
    icon: Sun,
    mood: "mystical",
    link: "/attractions?region=sahara",
  },
  {
    id: 6,
    name: "Atlas Mountains",
    subtitle: "The Roof of Morocco",
    description:
      "Ascend to breathtaking heights where Berber villages cling to mountainsides, waterfalls cascade through valleys, and snow-capped peaks touch the African sky in majestic splendor.",
    image: "/images/cities/atlas-mountains-main.jpg",
    secondaryImage: "/images/cities/atlas-mountains-secondary.jpg",
    theme: {
      primary: "#27AE60",
      secondary: "#2ECC71",
      accent: "#A8E6CF",
      gradient: "linear-gradient(135deg, #27AE60 0%, #2ECC71 50%, #A8E6CF 100%)",
    },
    highlights: ["Mount Toubkal", "Imlil Valley", "Berber Villages", "Ouzoud Falls"],
    stats: { attractions: 20, hotels: 35, rating: 4.8 },
    icon: Mountain,
    mood: "adventurous",
    link: "/attractions?region=atlas",
  },
]

interface MoroccoShowcaseProps {
  onExplore?: (link: string) => void
  height?: string
}

const MoroccoShowcase: React.FC<MoroccoShowcaseProps> = ({ onExplore, height = "100vh" }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(null)
  const currentCity = cities[currentIndex]

  // Motion values for animations
  const x = useMotionValue(0)
  const scale = useTransform(x, [-400, 0, 400], [0.7, 1, 0.7])
  const rotate = useTransform(x, [-400, 0, 400], [-15, 0, 15])
  const opacity = useTransform(x, [-400, 0, 400], [0.2, 1, 0.2])
  const backgroundX = useTransform(x, [-400, 0, 400], [200, 0, -200])
  const secondaryX = useTransform(x, [-400, 0, 400], [100, 0, -100])
  const contentX = useTransform(x, [-400, 0, 400], [50, 0, -50])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isDragging) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cities.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, isDragging])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % cities.length)
    setIsAutoPlaying(false)
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + cities.length) % cities.length)
    setIsAutoPlaying(false)
  }, [])

  const handleDragStart = () => {
    setIsDragging(true)
    setIsAutoPlaying(false)
  }

  const handleDrag = (event: any, info: PanInfo) => {
    setDragDirection(info.offset.x > 0 ? "right" : "left")
  }

  const handleDragEnd = useCallback(
    (event: any, info: PanInfo) => {
      setIsDragging(false)
      setDragDirection(null)
      const threshold = 120
      const velocity = Math.abs(info.velocity.x)

      if (info.offset.x > threshold || (info.offset.x > 60 && velocity > 600)) {
        handlePrev()
      } else if (info.offset.x < -threshold || (info.offset.x < -60 && velocity > 600)) {
        handleNext()
      }

      x.set(0)
    },
    [handleNext, handlePrev, x],
  )

  const handleExplore = () => {
    if (onExplore) {
      onExplore(currentCity.link)
    }
  }

  // Get adjacent cities for preview
  const prevCity = cities[(currentIndex - 1 + cities.length) % cities.length]
  const nextCity = cities[(currentIndex + 1) % cities.length]

  const IconComponent = currentCity.icon

  return (
    <Box position="relative" width="100%" height={height} overflow="hidden" bg="black" color="white">
      {/* Multi-layer Background System */}
      <Box position="absolute" inset="0" zIndex={0}>
        {/* Base gradient layer */}
        <motion.div
          key={`gradient-${currentCity.id}`}
          style={{
            position: "absolute",
            inset: 0,
            background: currentCity.theme.gradient,
            opacity: 0.8,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1.5 }}
        />

        {/* Primary background image */}
        <motion.div
          key={`bg-primary-${currentCity.id}`}
          style={{
            position: "absolute",
            inset: 0,
            x: backgroundX,
            scale,
            rotate,
            opacity,
          }}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <Box width="100%" height="100%" bgImage={`url(${currentCity.image})`} bgSize="cover" bgPosition="center" />
          <Box position="absolute" inset="0" bg="blackAlpha.400" />
        </motion.div>

        {/* Secondary image layer removed to prevent visual overlap */}

        {/* Dynamic color overlay */}
        <motion.div
          key={`overlay-${currentCity.id}`}
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 30% 70%, ${currentCity.theme.primary}20 0%, transparent 50%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 2 }}
        />
      </Box>

      {/* Enhanced Preview Cards */}
      <AnimatePresence>
        {isDragging && (
          <>
            {/* Previous City Preview */}
            <motion.div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: "320px",
                height: "384px",
                zIndex: 30,
                pointerEvents: "none",
              }}
              initial={{ x: -400, opacity: 0, rotateY: -45 }}
              animate={{
                x: dragDirection === "right" ? -150 : -300,
                opacity: dragDirection === "right" ? 0.9 : 0.3,
                rotateY: dragDirection === "right" ? -15 : -45,
                scale: dragDirection === "right" ? 1 : 0.8,
              }}
              exit={{ x: -400, opacity: 0, rotateY: -45 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Box
                width="100%"
                height="100%"
                borderRadius="24px"
                overflow="hidden"
                boxShadow="2xl"
                border="4px solid"
                borderColor="whiteAlpha.300"
                backdropFilter="blur(4px)"
              >
                <Box
                  width="100%"
                  height="100%"
                  bgImage={`url(${prevCity.image})`}
                  bgSize="cover"
                  bgPosition="center"
                  position="relative"
                >
                  <Box position="absolute" inset="0" bgGradient="linear(to-t, blackAlpha.600, transparent)" />
                  <Box position="absolute" bottom="6" left="6" color="white">
                    <Flex align="center" gap="2" mb="2">
                      <prevCity.icon />
                      <Text fontSize="sm" opacity="0.8">
                        {prevCity.subtitle}
                      </Text>
                    </Flex>
                    <Text fontWeight="bold" fontSize="2xl">
                      {prevCity.name}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </motion.div>

            {/* Next City Preview */}
            <motion.div
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: "320px",
                height: "384px",
                zIndex: 30,
                pointerEvents: "none",
              }}
              initial={{ x: 400, opacity: 0, rotateY: 45 }}
              animate={{
                x: dragDirection === "left" ? 150 : 300,
                opacity: dragDirection === "left" ? 0.9 : 0.3,
                rotateY: dragDirection === "left" ? 15 : 45,
                scale: dragDirection === "left" ? 1 : 0.8,
              }}
              exit={{ x: 400, opacity: 0, rotateY: 45 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Box
                width="100%"
                height="100%"
                borderRadius="24px"
                overflow="hidden"
                boxShadow="2xl"
                border="4px solid"
                borderColor="whiteAlpha.300"
                backdropFilter="blur(4px)"
              >
                <Box
                  width="100%"
                  height="100%"
                  bgImage={`url(${nextCity.image})`}
                  bgSize="cover"
                  bgPosition="center"
                  position="relative"
                >
                  <Box position="absolute" inset="0" bgGradient="linear(to-t, blackAlpha.600, transparent)" />
                  <Box position="absolute" bottom="6" left="6" color="white">
                    <Flex align="center" gap="2" mb="2">
                      <nextCity.icon />
                      <Text fontSize="sm" opacity="0.8">
                        {nextCity.subtitle}
                      </Text>
                    </Flex>
                    <Text fontWeight="bold" fontSize="2xl">
                      {nextCity.name}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        style={{
          position: "relative",
          zIndex: 20,
          height: "100%",
          display: "flex",
          alignItems: "center",
          x: contentX,
        }}
      >
        <Box maxW="container.xl" mx="auto" px={{ base: 6, lg: 8 }}>
          <Flex direction={{ base: "column", lg: "row" }} gap="12" align="center" justify="space-between">
            {/* Left Content */}
            <motion.div
              key={`content-${currentCity.id}`}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <VStack align="start" spacing="8" maxW="2xl">
                {/* City Icon and Subtitle */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <Flex align="center" gap="4">
                    <Box
                      p="3"
                      borderRadius="full"
                      backdropFilter="blur(4px)"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      bg={`${currentCity.theme.primary}40`}
                    >
                      <IconComponent />
                    </Box>
                    <VStack align="start" spacing="0">
                      <Text fontSize="xl" fontWeight="medium" opacity="0.9" color={currentCity.theme.accent}>
                        {currentCity.subtitle}
                      </Text>
                      <Text fontSize="sm" opacity="0.7" textTransform="capitalize">
                        {currentCity.mood} experience
                      </Text>
                    </VStack>
                  </Flex>
                </motion.div>

                {/* Main Title */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.7 }}
                >
                  <Text fontSize={{ base: "4xl", md: "6xl", lg: "8xl" }} fontWeight="bold" lineHeight="none">
                    {currentCity.name}
                  </Text>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <Text fontSize={{ base: "lg", lg: "xl" }} lineHeight="relaxed" opacity="0.9" fontWeight="light">
                    {currentCity.description}
                  </Text>
                </motion.div>

                {/* Highlights */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                >
                  <VStack align="start" spacing="6">
                    <Flex align="center" gap="2">
                      <Compass />
                      <Text fontSize="lg" fontWeight="semibold" opacity="0.9">
                        Must-Visit Highlights
                      </Text>
                    </Flex>
                    <Flex wrap="wrap" gap="4">
                      {currentCity.highlights.map((highlight, index) => (
                        <motion.div
                          key={highlight}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                        >
                          <Flex
                            align="center"
                            gap="3"
                            bg="whiteAlpha.100"
                            backdropFilter="blur(4px)"
                            borderRadius="lg"
                            p="3"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                          >
                            <MapPin />
                            <Text fontWeight="medium">{highlight}</Text>
                          </Flex>
                        </motion.div>
                      ))}
                    </Flex>
                  </VStack>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                >
                  <Button
                    onClick={handleExplore}
                    size="lg"
                    px="10"
                    py="5"
                    bg="whiteAlpha.150"
                    backdropFilter="blur(8px)"
                    border="2px solid"
                    borderColor="whiteAlpha.400"
                    borderRadius="2xl"
                    color="white"
                    fontWeight="semibold"
                    fontSize="lg"
                    _hover={{
                      bg: "whiteAlpha.250",
                      transform: "translateY(-2px)",
                    }}
                    transition="all 0.3s ease"
                    leftIcon={<IconComponent />}
                  >
                    Explore {currentCity.name}
                  </Button>
                </motion.div>
              </VStack>
            </motion.div>

            {/* Right Stats Panel */}
            <motion.div
              key={`stats-${currentCity.id}`}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Box
                bg="whiteAlpha.100"
                backdropFilter="blur(12px)"
                borderRadius="3xl"
                p="8"
                border="1px solid"
                borderColor="whiteAlpha.300"
                boxShadow="2xl"
                minW="300px"
              >
                <Flex align="center" gap="3" mb="8">
                  <Box p="2" borderRadius="full" bg={currentCity.theme.primary}>
                    <Star />
                  </Box>
                  <Text fontSize="2xl" fontWeight="bold">
                    City Overview
                  </Text>
                </Flex>
                <VStack spacing="8">
                  <Flex align="center" justify="space-between" w="100%">
                    <Flex align="center" gap="4">
                      <Box p="2" borderRadius="lg" bg={`${currentCity.theme.primary}30`}>
                        <Camera />
                      </Box>
                      <Text opacity="0.9" fontWeight="medium">
                        Attractions
                      </Text>
                    </Flex>
                    <Text fontWeight="bold" fontSize="2xl">
                      {currentCity.stats.attractions}
                    </Text>
                  </Flex>
                  <Flex align="center" justify="space-between" w="100%">
                    <Flex align="center" gap="4">
                      <Box p="2" borderRadius="lg" bg={`${currentCity.theme.secondary}30`}>
                        <Users />
                      </Box>
                      <Text opacity="0.9" fontWeight="medium">
                        Hotels
                      </Text>
                    </Flex>
                    <Text fontWeight="bold" fontSize="2xl">
                      {currentCity.stats.hotels}
                    </Text>
                  </Flex>
                  <Flex align="center" justify="space-between" w="100%">
                    <Flex align="center" gap="4">
                      <Box p="2" borderRadius="lg" bg={`${currentCity.theme.accent}30`}>
                        <Star />
                      </Box>
                      <Text opacity="0.9" fontWeight="medium">
                        Rating
                      </Text>
                    </Flex>
                    <Flex align="center" gap="2">
                      <Text fontWeight="bold" fontSize="2xl">
                        {currentCity.stats.rating}
                      </Text>
                      <Star />
                    </Flex>
                  </Flex>
                </VStack>
              </Box>
            </motion.div>
          </Flex>
        </Box>
      </motion.div>

      {/* Navigation Controls */}
      <Box position="absolute" bottom="8" left="50%" transform="translateX(-50%)" zIndex={30}>
        <HStack spacing="8">
          {/* Previous Button */}
          <Button
            onClick={handlePrev}
            p="4"
            bg="whiteAlpha.150"
            backdropFilter="blur(8px)"
            border="2px solid"
            borderColor="whiteAlpha.400"
            borderRadius="full"
            color="white"
            _hover={{ bg: "whiteAlpha.250", transform: "translateY(-2px)" }}
            transition="all 0.3s ease"
            boxShadow="lg"
          >
            <ChevronLeft />
          </Button>

          {/* City Indicators */}
          <HStack spacing="4">
            {cities.map((city, index) => (
              <Button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsAutoPlaying(false)
                }}
                w={index === currentIndex ? "16" : "4"}
                h="4"
                borderRadius="full"
                bg={index === currentIndex ? city.theme.primary : "whiteAlpha.400"}
                _hover={{
                  transform: index === currentIndex ? "scale(1.1)" : "scale(1.3)",
                }}
                transition="all 0.5s ease"
                boxShadow={index === currentIndex ? "lg" : "none"}
                position="relative"
                role="group"
              >
                {/* Tooltip */}
                <Box
                  position="absolute"
                  bottom="8"
                  left="50%"
                  transform="translateX(-50%)"
                  opacity="0"
                  _groupHover={{ opacity: 1 }}
                  transition="all 0.3s ease"
                  pointerEvents="none"
                >
                  <Box
                    bg="blackAlpha.900"
                    color="white"
                    fontSize="sm"
                    px="4"
                    py="2"
                    borderRadius="lg"
                    whiteSpace="nowrap"
                    boxShadow="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                  >
                    <Text fontWeight="semibold">{city.name}</Text>
                    <Text fontSize="xs" opacity="0.8">
                      {city.subtitle}
                    </Text>
                  </Box>
                </Box>
              </Button>
            ))}
          </HStack>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            p="4"
            bg="whiteAlpha.150"
            backdropFilter="blur(8px)"
            border="2px solid"
            borderColor="whiteAlpha.400"
            borderRadius="full"
            color="white"
            _hover={{ bg: "whiteAlpha.250", transform: "translateY(-2px)" }}
            transition="all 0.3s ease"
            boxShadow="lg"
          >
            <ChevronRight />
          </Button>
        </HStack>
      </Box>

      {/* Swipe Area */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 15,
          cursor: "grab",
          x,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
      />

      {/* Swipe Instructions */}
      <Box
        position="absolute"
        top="50%"
        right="8"
        zIndex={30}
        color="whiteAlpha.700"
        fontSize="sm"
        opacity={isDragging ? 0 : 1}
        transition="opacity 0.3s ease"
      >
        <VStack
          spacing="3"
          bg="whiteAlpha.100"
          backdropFilter="blur(8px)"
          borderRadius="2xl"
          p="4"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <HStack spacing="2">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: currentCity.theme.accent,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.3,
                }}
              />
            ))}
          </HStack>
          <Text fontSize="xs" fontWeight="medium">
            Swipe to explore
          </Text>
        </VStack>
      </Box>

      {/* City Counter */}
      <Box position="absolute" top="8" left="8" zIndex={30} color="white">
        <Box
          bg="whiteAlpha.100"
          backdropFilter="blur(8px)"
          borderRadius="2xl"
          px="6"
          py="3"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Flex align="center" gap="3">
            <IconComponent />
            <Text fontWeight="medium">
              {String(currentIndex + 1).padStart(2, "0")} / {String(cities.length).padStart(2, "0")}
            </Text>
          </Flex>
        </Box>
      </Box>

      {/* Auto-play Indicator */}
      <Box position="absolute" top="8" right="8" zIndex={30}>
        <Button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          px="6"
          py="3"
          borderRadius="2xl"
          fontSize="sm"
          fontWeight="medium"
          transition="all 0.3s ease"
          backdropFilter="blur(8px)"
          border="1px solid"
          bg={isAutoPlaying ? "whiteAlpha.200" : "whiteAlpha.100"}
          color={isAutoPlaying ? "white" : "whiteAlpha.600"}
          borderColor={isAutoPlaying ? "whiteAlpha.400" : "whiteAlpha.200"}
        >
          <HStack spacing="2">
            <Sun />
            <Text>{isAutoPlaying ? "Auto-play ON" : "Auto-play OFF"}</Text>
          </HStack>
        </Button>
      </Box>

      {/* Progress Bar */}
      {isAutoPlaying && !isDragging && (
        <Box position="absolute" bottom="0" left="0" right="0" zIndex={30}>
          <motion.div
            style={{
              height: "4px",
              backgroundColor: currentCity.theme.primary,
              transformOrigin: "left",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            key={currentIndex}
          />
        </Box>
      )}
    </Box>
  )
}

export default MoroccoShowcase
