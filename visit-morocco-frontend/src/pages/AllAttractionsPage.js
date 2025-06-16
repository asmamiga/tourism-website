"use client"

import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
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
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  Tag,
  useDisclosure,
  IconButton,
  Wrap,
  WrapItem,
  AspectRatio,
  useToast,
  useBreakpointValue,
} from "@chakra-ui/react"
import {
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaFilter,
  FaTimes,
  FaMapMarkedAlt,
  FaClock,
  FaMoneyBillWave,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaEye,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"

// Floating particles component
const FloatingParticles = () => {
  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden" pointerEvents="none">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </Box>
  )
}

// Helper function to get attraction image
const getAttractionImage = (attraction) => {
  if (attraction.photos?.length > 0) {
    return attraction.photos[0].photo_url
  }

  const images = [
    "1539020140153-e8c237425f2d",
    "1539072692047-3bd38673d8ce",
    "1548240693-c7d69e8c2583",
    "1595991209486-01c05fa9e812",
    "15454240-049a21ef9eea",
  ]

  const randomIndex = Math.floor(Math.random() * images.length)
  return `https://images.unsplash.com/photo-${images[randomIndex]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
}

const MotionBox = motion(Box)
const MotionGrid = motion(SimpleGrid)

const AttractionCard = ({ attraction, onFavoriteToggle, isFavorite }) => {
  const toast = useToast()
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 44, 0.95)")
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.600", "gray.300")

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFavoriteToggle?.(attraction)

    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      status: "success",
      duration: 2000,
      position: "top-right",
      isClosable: true,
    })
  }

  const handleShare = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (navigator.share) {
        await navigator.share({
          title: attraction.name,
          text: attraction.description,
          url: `${window.location.origin}/attractions/${attraction.attraction_id}`,
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/attractions/${attraction.attraction_id}`)
        toast({
          title: "Link copied to clipboard!",
          status: "success",
          duration: 2000,
          position: "top-right",
        })
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      bg={cardBg}
      backdropFilter="blur(20px)"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      border="1px solid"
      borderColor={borderColor}
      height="100%"
      display="flex"
      flexDirection="column"
      position="relative"
      _hover={{
        boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Image Container */}
      <Box position="relative" h="240px" overflow="hidden">
        <AspectRatio ratio={16 / 9} w="100%" h="100%">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", height: "100%" }}
          >
            <Image
              src={getAttractionImage(attraction) || "/placeholder.svg"}
              alt={attraction.name}
              objectFit="cover"
              w="100%"
              h="100%"
              fallbackSrc="https://images.unsplash.com/photo-1539020140153-e8c237425f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            />
          </motion.div>
        </AspectRatio>

        {/* Gradient Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-t, rgba(0,0,0,0.6) 0%, transparent 50%)"
        />

        {/* Featured Badge */}
        {attraction.is_featured && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Badge
              position="absolute"
              top={4}
              right={4}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wider"
              boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)"
            >
              ✨ Featured
            </Badge>
          </motion.div>
        )}

        {/* Action Buttons */}
        <HStack position="absolute" top={4} left={4} spacing={2}>
          <IconButton
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            icon={isFavorite ? <FaHeart /> : <FaRegHeart />}
            size="sm"
            bg="rgba(255, 255, 255, 0.9)"
            color={isFavorite ? "red.500" : "gray.600"}
            backdropFilter="blur(10px)"
            borderRadius="full"
            _hover={{
              bg: "rgba(255, 255, 255, 1)",
              color: "red.500",
              transform: "scale(1.1)",
            }}
            onClick={handleFavoriteClick}
            boxShadow="0 4px 15px rgba(0, 0, 0, 0.1)"
          />

          <IconButton
            aria-label="Share attraction"
            icon={<FaShare />}
            size="sm"
            bg="rgba(255, 255, 255, 0.9)"
            color="gray.600"
            backdropFilter="blur(10px)"
            borderRadius="full"
            _hover={{
              bg: "rgba(255, 255, 255, 1)",
              color: "blue.500",
              transform: "scale(1.1)",
            }}
            onClick={handleShare}
            boxShadow="0 4px 15px rgba(0, 0, 0, 0.1)"
          />
        </HStack>

        {/* Category Badge */}
        <Badge
          position="absolute"
          bottom={4}
          left={4}
          bg="rgba(0, 0, 0, 0.7)"
          color="white"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          backdropFilter="blur(10px)"
        >
          {attraction.category || "Attraction"}
        </Badge>
      </Box>

      {/* Content */}
      <Box p={6} flexGrow={1} display="flex" flexDirection="column">
        {/* Title and Rating */}
        <Flex justify="space-between" align="flex-start" mb={3}>
          <Heading
            as="h3"
            size="md"
            fontWeight="bold"
            color={textColor}
            noOfLines={2}
            lineHeight="short"
            flex={1}
            mr={2}
          >
            {attraction.name}
          </Heading>

          <Flex
            align="center"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            px={2}
            py={1}
            borderRadius="lg"
            minW="60px"
            justifyContent="center"
            boxShadow="0 4px 15px rgba(102, 126, 234, 0.3)"
          >
            <Icon as={FaStar} mr={1} />
            <Text fontSize="sm" fontWeight="bold">
              {attraction.avg_rating ? attraction.avg_rating.toFixed(1) : "4.8"}
            </Text>
          </Flex>
        </Flex>

        {/* Location */}
        <Flex align="center" color={mutedTextColor} fontSize="sm" mb={3}>
          <Icon as={FaMapMarkerAlt} mr={2} color="blue.400" />
          <Text noOfLines={1}>
            {attraction.city?.name || "Morocco"}, {attraction.region?.name || ""}
          </Text>
        </Flex>

        {/* Description */}
        <Text color={textColor} fontSize="sm" mb={4} noOfLines={3} flexGrow={1} lineHeight="tall">
          {attraction.description || "Discover this amazing attraction in Morocco."}
        </Text>

        {/* Tags */}
        {attraction.tags && attraction.tags.length > 0 && (
          <Wrap spacing={2} mb={4}>
            {attraction.tags.slice(0, 3).map((tag, index) => (
              <WrapItem key={index}>
                <Tag
                  size="sm"
                  bg="rgba(102, 126, 234, 0.1)"
                  color="blue.600"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                  fontWeight="medium"
                >
                  {tag}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        )}

        {/* Entrance Fee and Hours */}
        <VStack spacing={2} mb={4} align="stretch">
          {attraction.entrance_fee && (
            <Flex align="center" fontSize="sm" color={mutedTextColor}>
              <Icon as={FaMoneyBillWave} mr={2} color="green.400" />
              <Text>{attraction.entrance_fee}</Text>
            </Flex>
          )}

          {attraction.opening_hours && (
            <Flex align="center" fontSize="sm" color={mutedTextColor}>
              <Icon as={FaClock} mr={2} color="orange.400" />
              <Text noOfLines={1}>
                {typeof attraction.opening_hours === "string" ? attraction.opening_hours : "Check opening hours"}
              </Text>
            </Flex>
          )}
        </VStack>

        {/* Actions */}
        <Flex justify="space-between" align="center" mt="auto" pt={4} borderTopWidth="1px" borderColor={borderColor}>
          <Badge
            bg="rgba(102, 126, 234, 0.1)"
            color="blue.600"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="medium"
          >
            {attraction.category || "Uncategorized"}
          </Badge>

          <Button
            as={RouterLink}
            to={`/attractions/${attraction.attraction_id}`}
            size="sm"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
            }}
            borderRadius="full"
            px={6}
            fontWeight="medium"
            transition="all 0.3s"
            leftIcon={<FaEye />}
          >
            Explore
          </Button>
        </Flex>
      </Box>
    </MotionBox>
  )
}

const AllAttractionsPage = () => {
  const toast = useToast()
  const [attractions, setAttractions] = useState([])
  const [filteredAttractions, setFilteredAttractions] = useState([])
  const [cities, setCities] = useState([])
  const [regions, setRegions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState([])

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedAttraction, setSelectedAttraction] = useState(null)

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false })

  const toggleFavorite = (attraction) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.attraction_id === attraction.attraction_id)
      if (exists) {
        return prev.filter((fav) => fav.attraction_id !== attraction.attraction_id)
      } else {
        return [...prev, attraction]
      }
    })
  }

  const isFavorite = (attractionId) => {
    return favorites.some((fav) => fav.attraction_id === attractionId)
  }

  // Fetch attractions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const mockAttractions = [
          {
            attraction_id: 1,
            name: "Jardin Majorelle",
            description:
              "A two and half acre garden designed by French artist Jacques Majorelle in the 1920s and 1930s, with a stunning cobalt blue villa. Later owned by Yves Saint Laurent, it houses the Islamic Art Museum of Marrakech.",
            city: { city_id: 1, name: "Marrakech" },
            region: { region_id: 1, name: "Marrakech-Safi" },
            category: "Garden",
            tags: ["Garden", "Museum", "Art"],
            is_featured: true,
            photos: null,
            entrance_fee: "70 MAD",
            opening_hours: "8:00 AM - 6:00 PM",
            website: "https://jardinmajorelle.com",
            latitude: 31.6423,
            longitude: -8.0035,
            avg_rating: 4.8,
          },
          {
            attraction_id: 2,
            name: "Hassan II Mosque",
            description:
              "A stunning mosque on the coast of Casablanca, featuring the world's tallest minaret at 210 meters. It's one of the few mosques in Morocco open to non-Muslims, offering guided tours of its breathtaking interior.",
            city: { city_id: 2, name: "Casablanca" },
            region: { region_id: 2, name: "Casablanca-Settat" },
            category: "Religious Site",
            tags: ["Mosque", "Architecture", "Landmark"],
            is_featured: true,
            photos: null,
            entrance_fee: "120 MAD",
            opening_hours: "9:00 AM - 3:00 PM (Closed Fridays)",
            website: "https://www.mosqueehassan2.com",
            latitude: 33.6086,
            longitude: -7.6326,
            avg_rating: 4.9,
          },
          {
            attraction_id: 3,
            name: "Chefchaouen Blue City",
            description:
              'Known as the "Blue Pearl of Morocco," this mountain town is famous for its striking blue-washed buildings. Wander through its picturesque streets, shop for local crafts, and enjoy the relaxed atmosphere of this unique destination.',
            city: { city_id: 3, name: "Chefchaouen" },
            region: { region_id: 3, name: "Tangier-Tetouan-Al Hoceima" },
            category: "Historic City",
            tags: ["Blue City", "Photography", "Shopping"],
            is_featured: true,
            photos: null,
            entrance_fee: "Free",
            opening_hours: "Open 24 hours",
            website: null,
            latitude: 35.1714,
            longitude: -5.2697,
            avg_rating: 4.7,
          },
          {
            attraction_id: 4,
            name: "Bahia Palace",
            description:
              'A late 19th-century palace built for the personal use of Si Moussa, grand vizier of the sultan. The name means "brilliance" and it features stunning examples of Moroccan and Islamic architecture and garden design.',
            city: { city_id: 1, name: "Marrakech" },
            region: { region_id: 1, name: "Marrakech-Safi" },
            category: "Palace",
            tags: ["Architecture", "History", "Palace"],
            is_featured: false,
            photos: null,
            entrance_fee: "70 MAD",
            opening_hours: "9:00 AM - 5:00 PM",
            website: null,
            latitude: 31.6218,
            longitude: -7.9836,
            avg_rating: 4.6,
          },
          {
            attraction_id: 5,
            name: "Erg Chebbi Dunes",
            description:
              "Spectacular sand dunes reaching heights of up to 150 meters, offering a quintessential Sahara Desert experience. Visitors can enjoy camel treks, overnight stays in desert camps, and stunning sunrise/sunset views.",
            city: { city_id: 4, name: "Merzouga" },
            region: { region_id: 4, name: "Drâa-Tafilalet" },
            category: "Natural Wonder",
            tags: ["Desert", "Sahara", "Adventure"],
            is_featured: true,
            photos: null,
            entrance_fee: "Varies by tour",
            opening_hours: "Open 24 hours",
            website: null,
            latitude: 31.1499,
            longitude: -3.9772,
            avg_rating: 4.9,
          },
          {
            attraction_id: 6,
            name: "Fes El Bali (Old Medina)",
            description:
              "The ancient walled city of Fes, founded in the 9th century and home to the world's oldest university. This UNESCO World Heritage site contains thousands of narrow streets, historic buildings, and traditional artisan workshops.",
            city: { city_id: 5, name: "Fes" },
            region: { region_id: 5, name: "Fès-Meknès" },
            category: "Medina",
            tags: ["UNESCO", "History", "Shopping"],
            is_featured: true,
            photos: null,
            entrance_fee: "Free",
            opening_hours: "Open 24 hours",
            website: null,
            latitude: 34.0651,
            longitude: -4.978,
            avg_rating: 4.8,
          },
          {
            attraction_id: 7,
            name: "Ait Benhaddou",
            description:
              "A fortified village along the former caravan route between the Sahara and Marrakech. This UNESCO World Heritage site is one of Morocco's most spectacular kasbahs and has been featured in numerous Hollywood films.",
            city: { city_id: 6, name: "Ouarzazate" },
            region: { region_id: 4, name: "Drâa-Tafilalet" },
            category: "Historic Site",
            tags: ["UNESCO", "Kasbah", "Film Location"],
            is_featured: true,
            photos: null,
            entrance_fee: "10 MAD",
            opening_hours: "8:00 AM - 6:00 PM",
            website: null,
            latitude: 31.0472,
            longitude: -7.1318,
            avg_rating: 4.7,
          },
          {
            attraction_id: 8,
            name: "Essaouira Medina",
            description:
              "A charming coastal city with a well-preserved medina, beautiful beaches, and a vibrant arts scene. Known for its Portuguese and French colonial architecture and as a windsurfing destination.",
            city: { city_id: 7, name: "Essaouira" },
            region: { region_id: 1, name: "Marrakech-Safi" },
            category: "Coastal City",
            tags: ["Beach", "Medina", "Arts", "Windsurfing"],
            is_featured: false,
            photos: null,
            entrance_fee: "Free",
            opening_hours: "Open 24 hours",
            website: null,
            latitude: 31.5126,
            longitude: -9.77,
            avg_rating: 4.5,
          },
        ]

        setAttractions(mockAttractions)
        setFilteredAttractions(mockAttractions)

        const uniqueCategories = [...new Set(mockAttractions.map((attraction) => attraction.category))]
        setCategories(uniqueCategories)

        const uniqueCities = [
          ...new Map(
            mockAttractions
              .map((attraction) => [attraction.city?.city_id, attraction.city])
              .filter(([_, city]) => city),
          ).values(),
        ]

        const uniqueRegions = [
          ...new Map(
            mockAttractions
              .map((attraction) => [attraction.region?.region_id, attraction.region])
              .filter(([_, region]) => region),
          ).values(),
        ]

        setCities(uniqueCities)
        setRegions(uniqueRegions)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load attractions. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort attractions when filters change
  useEffect(() => {
    let results = [...attractions]

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      results = results.filter(
        (attraction) =>
          attraction.name.toLowerCase().includes(searchLower) ||
          (attraction.description && attraction.description.toLowerCase().includes(searchLower)) ||
          (attraction.city?.name && attraction.city.name.toLowerCase().includes(searchLower)),
      )
    }

    if (selectedCity) {
      results = results.filter((attraction) => attraction.city?.city_id === Number.parseInt(selectedCity))
    }

    if (selectedRegion) {
      results = results.filter((attraction) => attraction.region?.region_id === Number.parseInt(selectedRegion))
    }

    if (selectedCategory) {
      results = results.filter((attraction) => attraction.category === selectedCategory)
    }

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "featured":
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
        case "rating":
          return (b.avg_rating || 0) - (a.avg_rating || 0)
        default:
          return 0
      }
    })

    setFilteredAttractions(results)
  }, [attractions, searchTerm, selectedCity, selectedRegion, selectedCategory, sortBy])

  const handleReset = () => {
    setSearchTerm("")
    setSelectedCity("")
    setSelectedRegion("")
    setSelectedCategory("")
    setSortBy("name")
    setFilteredAttractions(attractions)
  }

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
          <Spinner thickness="4px" speed="0.65s" emptyColor="rgba(255, 255, 255, 0.2)" color="white" size="xl" />
          <Text color="white" fontSize="lg">
            Loading all attractions...
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

  return (
    <Box minH="100vh" bg="transparent" position="relative" overflow="hidden">
      <FloatingParticles />

      {/* Hero Section */}
      <Box position="relative" pt={{ base: 24, md: 28 }} pb={{ base: 16, md: 24 }}>
        <Container maxW="container.xl" position="relative" zIndex={3}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <VStack spacing={8} align="center" textAlign="center" maxW="4xl" mx="auto">
              <Badge
                px={6}
                py={3}
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.15)"
                color="white"
                fontWeight="600"
                fontSize="sm"
                letterSpacing="wider"
                textTransform="uppercase"
                backdropFilter="blur(20px)"
                border="1px solid rgba(255, 255, 255, 0.2)"
              >
                🌟 Complete Collection
              </Badge>

              <Heading
                as="h1"
                size="4xl"
                fontWeight="800"
                lineHeight="1.1"
                letterSpacing="tight"
                color="white"
                textShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
              >
                All Morocco's
                <Text as="span" display="block" bgGradient="linear(to-r, #ffd89b, #19547b)" bgClip="text">
                  Amazing Attractions
                </Text>
              </Heading>

              <Text fontSize="xl" color="rgba(255, 255, 255, 0.9)" lineHeight="tall" fontWeight="400" maxW="3xl">
                Explore our complete collection of Morocco's most breathtaking destinations. From ancient medinas to
                stunning natural wonders, discover every corner of this magical kingdom.
              </Text>
            </VStack>
          </motion.div>
        </Container>
      </Box>

      {/* Search and Filters Section */}
      <Container maxW="container.xl" position="relative" zIndex={3} mt={-8}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(20px)"
            p={8}
            borderRadius="3xl"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            mb={12}
          >
            {/* Main Search Bar */}
            <Box mb={6}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search through all attractions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="rgba(255, 255, 255, 0.9)"
                  border="none"
                  borderRadius="2xl"
                  fontSize="lg"
                  _focus={{
                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.3)",
                    bg: "white",
                  }}
                  _placeholder={{ color: "gray.500" }}
                />
              </InputGroup>
            </Box>

            {/* Filter Toggle */}
            <Flex justify="center" mb={isFilterOpen ? 6 : 0}>
              <Button
                leftIcon={<Icon as={isFilterOpen ? FaTimes : FaFilter} />}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                bg="rgba(255, 255, 255, 0.2)"
                color="white"
                _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
                borderRadius="xl"
                backdropFilter="blur(10px)"
                border="1px solid rgba(255, 255, 255, 0.2)"
              >
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </Button>
            </Flex>

            {/* Filters */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    bg="rgba(255, 255, 255, 0.1)"
                    p={6}
                    borderRadius="2xl"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                  >
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={4}>
                      <Select
                        placeholder="All Regions"
                        value={selectedRegion}
                        onChange={(e) => {
                          setSelectedRegion(e.target.value)
                          setSelectedCity("")
                        }}
                        bg="rgba(255, 255, 255, 0.9)"
                        borderRadius="xl"
                        border="none"
                      >
                        {regions.map((region) => (
                          <option key={region.region_id} value={region.region_id}>
                            {region.name}
                          </option>
                        ))}
                      </Select>

                      <Select
                        placeholder="All Cities"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        isDisabled={!selectedRegion}
                        bg="rgba(255, 255, 255, 0.9)"
                        borderRadius="xl"
                        border="none"
                      >
                        {cities
                          .filter((city) => !selectedRegion || city.region_id === Number.parseInt(selectedRegion))
                          .map((city) => (
                            <option key={city.city_id} value={city.city_id}>
                              {city.name}
                            </option>
                          ))}
                      </Select>

                      <Select
                        placeholder="All Categories"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        bg="rgba(255, 255, 255, 0.9)"
                        borderRadius="xl"
                        border="none"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Select>

                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        bg="rgba(255, 255, 255, 0.9)"
                        borderRadius="xl"
                        border="none"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="featured">Sort by Featured</option>
                        <option value="rating">Sort by Rating</option>
                      </Select>
                    </SimpleGrid>

                    <Flex justify="center">
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        color="white"
                        borderColor="rgba(255, 255, 255, 0.3)"
                        _hover={{
                          bg: "rgba(255, 255, 255, 0.1)",
                          borderColor: "rgba(255, 255, 255, 0.5)",
                        }}
                        borderRadius="xl"
                      >
                        Reset All Filters
                      </Button>
                    </Flex>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </motion.div>
      </Container>

      {/* Results Section */}
      <Container maxW="container.xl" position="relative" zIndex={3} pb={20}>
        {filteredAttractions.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Box
              textAlign="center"
              py={20}
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(20px)"
              borderRadius="3xl"
              border="1px solid rgba(255, 255, 255, 0.2)"
            >
              <Heading size="lg" color="white" mb={4}>
                No attractions found
              </Heading>
              <Text color="rgba(255, 255, 255, 0.8)" mb={6}>
                Try adjusting your search criteria to discover more attractions.
              </Text>
              <Button
                onClick={handleReset}
                bg="linear-gradient(135deg, #ffd89b 0%, #19547b 100%)"
                color="white"
                size="lg"
                borderRadius="xl"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                }}
              >
                Show All Attractions
              </Button>
            </Box>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Flex justify="space-between" align="center" mb={8}>
                <Box>
                  <Heading size="lg" color="white" mb={2}>
                    {filteredAttractions.length} Incredible{" "}
                    {filteredAttractions.length === 1 ? "Attraction" : "Attractions"}
                  </Heading>
                  <Text color="rgba(255, 255, 255, 0.8)">
                    {searchTerm || selectedCity || selectedRegion || selectedCategory
                      ? "Filtered results matching your criteria"
                      : "Discover the complete collection of Morocco's wonders"}
                  </Text>
                </Box>

                {(searchTerm || selectedCity || selectedRegion || selectedCategory) && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    color="white"
                    borderColor="rgba(255, 255, 255, 0.3)"
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.1)",
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    }}
                    borderRadius="xl"
                    leftIcon={<FaTimes />}
                  >
                    Clear Filters
                  </Button>
                )}
              </Flex>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="show"
            >
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8}>
                {filteredAttractions.map((attraction, index) => (
                  <motion.div
                    key={attraction.attraction_id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <AttractionCard
                      attraction={attraction}
                      onFavoriteToggle={toggleFavorite}
                      isFavorite={isFavorite(attraction.attraction_id)}
                    />
                  </motion.div>
                ))}
              </SimpleGrid>
            </motion.div>
          </>
        )}

        {/* Map CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box
            mt={20}
            p={12}
            borderRadius="3xl"
            position="relative"
            overflow="hidden"
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(20px)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            textAlign="center"
          >
            <Heading as="h3" size="xl" color="white" mb={6}>
              Explore All Attractions on the Map
            </Heading>
            <Text fontSize="lg" color="rgba(255, 255, 255, 0.9)" mb={8} maxW="2xl" mx="auto">
              Visualize all attractions across Morocco on our interactive map. Plan your perfect route and discover
              hidden gems along the way.
            </Text>
            <HStack spacing={4} justify="center">
              <Button
                as={RouterLink}
                to="/attractions-map"
                size="lg"
                bg="linear-gradient(135deg, #ffd89b 0%, #19547b 100%)"
                color="white"
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
                }}
                leftIcon={<FaMapMarkedAlt />}
                borderRadius="xl"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
              >
                Open Interactive Map
              </Button>

              <Button
                as={RouterLink}
                to="/itinerary-planner"
                size="lg"
                variant="outline"
                color="white"
                borderColor="rgba(255, 255, 255, 0.3)"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  transform: "translateY(-3px)",
                }}
                borderRadius="xl"
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="bold"
              >
                Plan Your Journey
              </Button>
            </HStack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}

export default AllAttractionsPage
