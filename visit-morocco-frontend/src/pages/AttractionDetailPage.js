"use client"

import { useState, useEffect } from "react"
import { useParams, Link as RouterLink } from "react-router-dom"
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
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  Tag,
  Link,
  AspectRatio,
  VStack,
  IconButton,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import {
  FaMapMarkerAlt,
  FaClock,
  FaGlobe,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaDirections,
  FaCamera,
  FaInfoCircle,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa"

const MotionBox = motion(Box)

// Floating particles component
const FloatingParticles = () => {
  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden" pointerEvents="none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: Math.random() * 2 + 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </Box>
  )
}

// Enhanced Image Gallery Component
const EnhancedGallery = ({ photos, attractionName }) => {
  const [activeImage, setActiveImage] = useState(0)

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % photos.length)
  }

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <Box position="relative" borderRadius="2xl" overflow="hidden" mb={8}>
      <AspectRatio ratio={16 / 9} w="100%" h={{ base: "300px", md: "500px" }}>
        <motion.div
          key={activeImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Image
            src={photos[activeImage] || "/placeholder.svg"}
            alt={`${attractionName} photo ${activeImage + 1}`}
            objectFit="cover"
            w="100%"
            h="100%"
          />
        </motion.div>
      </AspectRatio>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <IconButton
            aria-label="Previous image"
            icon={<FaChevronLeft />}
            position="absolute"
            left={4}
            top="50%"
            transform="translateY(-50%)"
            bg="rgba(0, 0, 0, 0.6)"
            color="white"
            _hover={{ bg: "rgba(0, 0, 0, 0.8)" }}
            borderRadius="full"
            onClick={prevImage}
          />
          <IconButton
            aria-label="Next image"
            icon={<FaChevronRight />}
            position="absolute"
            right={4}
            top="50%"
            transform="translateY(-50%)"
            bg="rgba(0, 0, 0, 0.6)"
            color="white"
            _hover={{ bg: "rgba(0, 0, 0, 0.8)" }}
            borderRadius="full"
            onClick={nextImage}
          />
        </>
      )}

      {/* Thumbnail Navigation */}
      {photos.length > 1 && (
        <Flex
          position="absolute"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
          gap={2}
          bg="rgba(0, 0, 0, 0.5)"
          p={2}
          borderRadius="full"
          backdropFilter="blur(10px)"
        >
          {photos.map((_, index) => (
            <Box
              key={index}
              w={3}
              h={3}
              borderRadius="full"
              bg={activeImage === index ? "white" : "rgba(255, 255, 255, 0.5)"}
              cursor="pointer"
              onClick={() => setActiveImage(index)}
              transition="all 0.2s"
            />
          ))}
        </Flex>
      )}
    </Box>
  )
}

// Simple NearbyAttractions component
const NearbyAttractions = ({ attractions }) => {
  if (!attractions || attractions.length === 0) {
    return <Text color="rgba(255, 255, 255, 0.8)">No nearby attractions information available.</Text>
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      {attractions.map((attraction) => (
        <Box
          key={attraction.attraction_id}
          bg="rgba(255, 255, 255, 0.1)"
          p={4}
          borderRadius="xl"
          backdropFilter="blur(10px)"
        >
          <Text fontWeight="bold" color="white" mb={2}>
            {attraction.name}
          </Text>
          <Text color="rgba(255, 255, 255, 0.8)" fontSize="sm">
            Distance: {attraction.distance}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  )
}

// Simple AttractionMap component
const AttractionMap = ({ latitude, longitude, attractionName }) => {
  return (
    <Box
      w="100%"
      h="100%"
      bg="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(10px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="xl"
    >
      <VStack spacing={4}>
        <Icon as={FaMapMarkerAlt} fontSize="3xl" color="white" />
        <Text color="white" textAlign="center">
          Map for {attractionName}
        </Text>
        <Text color="rgba(255, 255, 255, 0.8)" fontSize="sm" textAlign="center">
          Coordinates: {latitude}, {longitude}
        </Text>
      </VStack>
    </Box>
  )
}

const AttractionDetailPage = () => {
  const { id } = useParams()
  const [attraction, setAttraction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchAttraction = async () => {
      try {
        setLoading(true)

        setTimeout(() => {
          const mockAttraction = {
            attraction_id: Number.parseInt(id),
            name: "Jardin Majorelle",
            description:
              "A two and half acre garden designed by French artist Jacques Majorelle in the 1920s and 1930s, with a stunning cobalt blue villa. Later owned by Yves Saint Laurent, it houses the Islamic Art Museum of Marrakech.",
            long_description:
              "The Jardin Majorelle in Marrakech is one of the most visited sites in Morocco. It took French painter Jacques Majorelle (1886-1962) forty years of passion and dedication to create this enchanting garden in the heart of the \"Ochre City\".\n\nIn 1980, Pierre Bergé and Yves Saint Laurent acquired the Jardin Majorelle, saving it from real estate developers. New plant species were added, and the garden's infrastructure was upgraded with an automatic irrigation system. Yves Saint Laurent's ashes were scattered in the garden after his death in 2008.\n\nThe garden hosts more than 300 plant species from five continents. The special shade of bold cobalt blue, inspired by the colored tiles common in Moroccan architecture and Berber art, is used extensively throughout the garden and is named after Majorelle himself.\n\nBeyond the botanical aspects, the garden houses the Islamic Art Museum of Marrakech, the Berber Museum, and the Yves Saint Laurent Museum, making it a cultural complex celebrating Moroccan heritage and international art.",
            city: { city_id: 1, name: "Marrakech" },
            region: { region_id: 1, name: "Marrakech-Safi" },
            category: "Garden",
            tags: ["Garden", "Museum", "Art", "YSL", "Photography"],
            is_featured: true,
            photos: [
              { photo_id: 1, photo_path: null },
              { photo_id: 2, photo_path: null },
              { photo_id: 3, photo_path: null },
            ],
            entrance_fee: "70 MAD for garden, 30 MAD for museum",
            opening_hours: {
              Monday: "8:00 AM - 6:00 PM",
              Tuesday: "8:00 AM - 6:00 PM",
              Wednesday: "8:00 AM - 6:00 PM",
              Thursday: "8:00 AM - 6:00 PM",
              Friday: "8:00 AM - 6:00 PM",
              Saturday: "8:00 AM - 6:00 PM",
              Sunday: "8:00 AM - 6:00 PM",
            },
            website: "https://jardinmajorelle.com",
            latitude: 31.6423,
            longitude: -8.0035,
            address: "Rue Yves St Laurent, Marrakech 40090, Morocco",
            avg_rating: 4.8,
            reviews_count: 2847,
            tips: [
              "Visit early in the morning or late afternoon to avoid crowds",
              "The garden and museum require separate tickets",
              "Photography is allowed in the garden but not in the museums",
              "Expect to spend 1-2 hours exploring the entire complex",
              "There's a nice café on site for refreshments",
            ],
            history:
              "Created by French painter Jacques Majorelle in 1923, the garden was later purchased and restored by fashion designer Yves Saint Laurent and Pierre Bergé in 1980. After Saint Laurent's death in 2008, his ashes were scattered in the garden.",
            nearby_attractions: [
              {
                attraction_id: 4,
                name: "Bahia Palace",
                distance: "2.5 km",
                photo: null,
              },
              {
                attraction_id: 7,
                name: "Koutoubia Mosque",
                distance: "3.1 km",
                photo: null,
              },
              {
                attraction_id: 8,
                name: "Jemaa el-Fnaa",
                distance: "3.4 km",
                photo: null,
              },
            ],
          }

          setAttraction(mockAttraction)
          setLoading(false)
        }, 1000)
      } catch (err) {
        console.error("Error fetching attraction details:", err)
        setError("Failed to load attraction details. Please try again later.")
        setLoading(false)
      }
    }

    fetchAttraction()
  }, [id])

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner thickness="4px" speed="0.65s" emptyColor="rgba(0, 0, 0, 0.2)" color="black" size="xl" />
          <Text color="black" fontSize="lg">
            Loading attraction details...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    )
  }

  if (!attraction) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="warning" borderRadius="xl">
          <AlertIcon />
          Attraction not found
        </Alert>
      </Container>
    )
  }

  const defaultImages = [
    "https://images.unsplash.com/photo-1539020140153-e479b8c64e3c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80",
    "https://images.unsplash.com/photo-1597212720158-e21dad559189?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  ]

  const photos =
    attraction.photos && attraction.photos.length > 0
      ? attraction.photos.map((photo) => `http://localhost:8000/storage/${photo.photo_path}`)
      : defaultImages

  return (
    <Box minH="100vh" bg="transparent" position="relative" overflow="hidden">
      <FloatingParticles />

      <Container maxW="container.xl" position="relative" zIndex={3} pt={{ base: 24, md: 28 }} pb={10}>
        <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Breadcrumb Navigation */}
          <HStack
            spacing={2}
            mb={6}
            color="rgba(0, 0, 0, 0.8)"
            bg="rgba(255, 255, 255, 0.8)"
            p={4}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <RouterLink to="/">Home</RouterLink>
            <Text>/</Text>
            <RouterLink to="/attractions">Attractions</RouterLink>
            <Text>/</Text>
            <Text color="white" fontWeight="bold">
              {attraction.name}
            </Text>
          </HStack>

          {/* Attraction Header */}
          <Box
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(20px)"
            borderRadius="3xl"
            p={8}
            mb={8}
            border="1px solid rgba(255, 255, 255, 0.2)"
          >
            <Flex
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              align={{ base: "flex-start", lg: "center" }}
              gap={6}
            >
              <Box flex={1}>
                <Flex align="center" gap={4} mb={4}>
                  <Heading as="h1" size="2xl" color="black" fontWeight="800">
                    {attraction.name}
                  </Heading>
                  
                </Flex>

                <Flex align="center" mb={4} color="rgba(0, 0, 0, 0.9)">
                  <Icon as={FaMapMarkerAlt} mr={3} color="#ffd89b" />
                  <Text fontSize="lg">
                    {attraction.city?.name}, {attraction.region?.name}
                  </Text>
                </Flex>

                <Flex align="center" gap={6} mb={4}>
                  <Flex align="center" gap={2}>
                    <Flex align="center">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          as={FaStar}
                          color={i < Math.floor(attraction.avg_rating || 0) ? "#ffd89b" : "rgba(0, 0, 0, 0.3)"}
                          mr={1}
                        />
                      ))}
                    </Flex>
                    <Text color="black" fontWeight="bold" fontSize="lg">
                      {attraction.avg_rating ? attraction.avg_rating.toFixed(1) : "No ratings"}
                    </Text>
                    <Text color="rgba(0, 0, 0, 0.7)">({attraction.reviews_count || 0} reviews)</Text>
                  </Flex>
                </Flex>

                <Flex wrap="wrap" gap={2}>
                  {attraction.tags?.map((tag, index) => (
                    <Tag
                      key={index}
                      bg="rgba(255, 217, 155, 0.2)"
                      color="#ffd89b"
                      borderRadius="full"
                      px={4}
                      py={2}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      {tag}
                    </Tag>
                  ))}
                </Flex>
              </Box>

              <VStack spacing={4}>
                <HStack spacing={3}>
                  <IconButton
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    icon={isFavorite ? <FaHeart /> : <FaRegHeart />}
                    size="lg"
                    bg="rgba(255, 255, 255, 0.2)"
                    color={isFavorite ? "#ff6b6b" : "white"}
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.3)",
                      transform: "scale(1.1)",
                    }}
                    borderRadius="full"
                    onClick={() => setIsFavorite(!isFavorite)}
                  />
                  <IconButton
                    aria-label="Share attraction"
                    icon={<FaShare />}
                    size="lg"
                    bg="rgba(255, 255, 255, 0.2)"
                    color="white"
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.3)",
                      transform: "scale(1.1)",
                    }}
                    borderRadius="full"
                  />
                </HStack>

                <Button
                  as="a"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${attraction.latitude},${attraction.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
                  color="white"
                  leftIcon={<FaDirections />}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 30px white",
                  }}
                  borderRadius="xl"
                  px={8}
                  fontWeight="bold"
                >
                  Get Directions
                </Button>
              </VStack>
            </Flex>
          </Box>

          {/* Photo Gallery */}
          <EnhancedGallery photos={photos} attractionName={attraction.name} />

          {/* Attraction Details Tabs */}
          <Box
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(20px)"
            borderRadius="3xl"
            overflow="hidden"
            border="1px solid rgba(255, 255, 255, 0.2)"
          >
            <Tabs colorScheme="blue" variant="enclosed">
              <TabList bg="rgba(0, 0, 0, 0.05)" borderBottom="1px solid rgba(0, 0, 0, 0.1)">
                <Tab color="rgba(0, 0, 0, 0.8)" _selected={{ color: "black", bg: "rgba(0, 0, 0, 0.1)" }}>
                  Overview
                </Tab>
                <Tab color="rgba(0, 0, 0, 0.8)" _selected={{ color: "black", bg: "rgba(0, 0, 0, 0.1)" }}>
                  Details
                </Tab>
                <Tab color="rgba(0, 0, 0, 0.8)" _selected={{ color: "black", bg: "rgba(0, 0, 0, 0.1)" }}>
                  Visitor Tips
                </Tab>
              </TabList>

              <TabPanels>
                {/* Overview Tab */}
                <TabPanel p={8}>
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
                    <Box>
                      <Heading as="h3" size="lg" mb={6} color="black">
                        About {attraction.name}
                      </Heading>
                      <Text
                        mb={8}
                        whiteSpace="pre-line"
                        color="rgba(0, 0, 0, 0.9)"
                        lineHeight="tall"
                        fontSize="lg"
                      >
                        {attraction.long_description || attraction.description}
                      </Text>

                      <Heading as="h3" size="lg" mb={6} color="black">
                        History
                      </Heading>
                      <Text mb={6} color="rgba(0, 0, 0, 0.9)" lineHeight="tall" fontSize="lg">
                        {attraction.history || "No historical information available."}
                      </Text>
                    </Box>

                    <Box>
                      <Heading as="h3" size="lg" mb={6} color="black">
                        Visitor Information
                      </Heading>
                      <VStack spacing={6} align="stretch">
                        <Box bg="rgba(255, 255, 255, 0.1)" p={6} borderRadius="2xl" backdropFilter="blur(10px)">
                          <Flex align="center" mb={4}>
                            <Icon as={FaClock} color="#ffd89b" mr={4} fontSize="xl" />
                            <Text fontWeight="bold" color="black" fontSize="lg">
                              Opening Hours
                            </Text>
                          </Flex>
                          {typeof attraction.opening_hours === "object" ? (
                            <VStack spacing={2} align="stretch">
                              {Object.entries(attraction.opening_hours).map(([day, hours]) => (
                                <Flex key={day} justify="space-between">
                                  <Text fontWeight="medium" color="rgba(0, 0, 0, 0.8)">
                                    {day}:
                                  </Text>
                                  <Text color="black">{hours}</Text>
                                </Flex>
                              ))}
                            </VStack>
                          ) : (
                            <Text color="black">{attraction.opening_hours}</Text>
                          )}
                        </Box>

                        <Box bg="rgba(255, 255, 255, 0.1)" p={6} borderRadius="2xl" backdropFilter="blur(10px)">
                          <Flex align="center" mb={4}>
                            <Icon as={FaMoneyBillWave} color="#ffd89b" mr={4} fontSize="xl" />
                            <Text fontWeight="bold" color="black" fontSize="lg">
                              Entrance Fee
                            </Text>
                          </Flex>
                          <Text color="black" fontSize="lg">
                            {attraction.entrance_fee || "Free"}
                          </Text>
                        </Box>

                        {attraction.website && (
                          <Box bg="rgba(255, 255, 255, 0.1)" p={6} borderRadius="2xl" backdropFilter="blur(10px)">
                            <Flex align="center" mb={4}>
                              <Icon as={FaGlobe} color="#ffd89b" mr={4} fontSize="xl" />
                              <Text fontWeight="bold" color="black" fontSize="lg">
                                Website
                              </Text>
                            </Flex>
                            <Link
                              href={attraction.website}
                              isExternal
                              color="#ffd89b"
                              fontSize="lg"
                              _hover={{ color: "white" }}
                            >
                              {attraction.website}
                            </Link>
                          </Box>
                        )}

                        <Box bg="rgba(255, 255, 255, 0.1)" p={6} borderRadius="2xl" backdropFilter="blur(10px)">
                          <Flex align="center" mb={4}>
                            <Icon as={FaMapMarkerAlt} color="#ffd89b" mr={4} fontSize="xl" />
                            <Text fontWeight="bold" color="black" fontSize="lg">
                              Address
                            </Text>
                          </Flex>
                          <Text color="black" fontSize="lg">
                            {attraction.address || "Address not available"}
                          </Text>
                        </Box>
                      </VStack>

                      <Box mt={8}>
                        <Heading as="h3" size="lg" mb={4} color="black">
                          Category
                        </Heading>
                        <Badge
                          bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
                          color="black"
                          fontSize="lg"
                          px={6}
                          py={3}
                          borderRadius="full"
                          fontWeight="bold"
                        >
                          {attraction.category || "Uncategorized"}
                        </Badge>
                      </Box>
                    </Box>
                  </SimpleGrid>
                </TabPanel>

                {/* Details Tab */}
                <TabPanel p={8}>
                  <Box mb={8}>
                    <Heading as="h3" size="lg" mb={6} color="black">
                      What to Expect
                    </Heading>
                    <Text mb={8} whiteSpace="pre-line" color="rgba(0, 0, 0, 0.9)" lineHeight="tall" fontSize="lg">
                      {attraction.long_description || attraction.description}
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
                      <Box bg="rgba(255, 255, 255, 0.1)" p={6} borderRadius="2xl" backdropFilter="blur(10px)">
                        <Heading as="h4" size="md" mb={4} color="black">
                          Best Time to Visit
                        </Heading>
                        <Text color="rgba(0, 0, 0, 0.9)" lineHeight="tall">
                          {attraction.best_time_to_visit ||
                            "Early morning or late afternoon is generally recommended to avoid crowds and enjoy better lighting for photography."}
                        </Text>
                      </Box>

                      <Box bg="rgba(255, 255, 255, 0.1)" p={6} borderRadius="2xl" backdropFilter="blur(10px)">
                        <Heading as="h4" size="md" mb={4} color="black">
                          Estimated Duration
                        </Heading>
                        <Text color="rgba(0, 0, 0, 0.9)" lineHeight="tall">
                          {attraction.duration || "Plan to spend 1-2 hours exploring this attraction thoroughly."}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Heading as="h3" size="lg" mb={6} color="black">
                      Nearby Attractions
                    </Heading>

                    <NearbyAttractions attractions={attraction.nearby_attractions} />
                  </Box>
                </TabPanel>

               

                {/* Visitor Tips Tab */}
                <TabPanel p={8}>
                  <Box mb={8}>
                    <Heading as="h3" size="lg" mb={6} color="black">
                      Visitor Tips
                    </Heading>

                    {attraction.tips && attraction.tips.length > 0 ? (
                      <VStack spacing={4} align="stretch" mb={8}>
                        {attraction.tips.map((tip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Flex
                              align="flex-start"
                              bg="rgba(255, 255, 255, 0.1)"
                              p={6}
                              borderRadius="2xl"
                              backdropFilter="blur(10px)"
                            >
                              <Icon as={FaInfoCircle} color="#ffd89b" mt={1} mr={4} fontSize="xl" />
                              <Text color="rgba(0, 0, 0, 0.9)" lineHeight="tall" fontSize="lg">
                                {tip}
                              </Text>
                            </Flex>
                          </motion.div>
                        ))}
                      </VStack>
                    ) : (
                      <Text mb={8} color="rgba(0, 0, 0, 0.9)" fontSize="lg">
                        No specific tips available for this attraction.
                      </Text>
                    )}

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                      <Box bg="rgba(255, 255, 255, 0.1)" p={6} borderRadius="2xl" backdropFilter="blur(10px)">
                        <Heading as="h3" size="md" mb={4} color="black">
                          Photography
                        </Heading>
                        <Flex align="flex-start">
                          <Icon as={FaCamera} color="#ffd89b" mt={1} mr={4} fontSize="xl" />
                          <Text color="rgba(0, 0, 0, 0.9)" lineHeight="tall">
                            {attraction.photography_info ||
                              "Photography is generally allowed in outdoor areas. Some indoor exhibits may have restrictions. Always respect local customs and any posted signs regarding photography."}
                          </Text>
                        </Flex>
                      </Box>

                      <Box bg="rgba(255, 255, 255, 0.1)" p={6} borderRadius="2xl" backdropFilter="blur(10px)">
                        <Heading as="h3" size="md" mb={4} color="black">
                          Best Time to Visit
                        </Heading>
                        <Flex align="flex-start">
                          <Icon as={FaCalendarAlt} color="#ffd89b" mt={1} mr={4} fontSize="xl" />
                          <Text color="rgba(0, 0, 0, 0.9)" lineHeight="tall">
                            {attraction.best_time ||
                              "Early morning (8-10 AM) or late afternoon (3-5 PM) typically offers the best experience with fewer crowds and pleasant lighting for photography. Weekdays are generally less crowded than weekends."}
                          </Text>
                        </Flex>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          {/* Add to Itinerary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box
              mt={12}
              p={12}
              borderRadius="3xl"
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.2)"
              textAlign="center"
              position="relative"
              overflow="hidden"
            >
              <Heading as="h3" size="xl" mb={6} color="black">
                Planning to Visit?
              </Heading>
              <Text fontSize="lg" mb={8} color="rgba(0, 0, 0, 0.9)" maxW="2xl" mx="auto">
                Add {attraction.name} to your Morocco itinerary and discover other nearby attractions. Create your
                perfect journey through Morocco's wonders.
              </Text>
              <Button
                as={RouterLink}
                to="/itinerary-planner"
                size="lg"
                bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
                color="white"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
                }}
                borderRadius="xl"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
              >
                Plan Your Itinerary
              </Button>
            </Box>
          </motion.div>
        </MotionBox>
      </Container>
    </Box>
  )
}

export default AttractionDetailPage
