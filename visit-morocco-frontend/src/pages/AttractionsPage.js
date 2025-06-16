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
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  Tag,
  AspectRatio,
  IconButton,
  useBreakpointValue,
  HStack,
} from "@chakra-ui/react"
import { FaSearch, FaStar, FaHeart, FaRegHeart, FaShare, FaFilter, FaTimes } from "react-icons/fa"
import { FiChevronRight, FiMapPin } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"

// Helper function to get random attraction image
const getRandomMoroccoAttraction = () => {
  const attractionImages = [
    "1595991209486-01c05fa9e812?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    "1539072692047-3bd38673d8ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    "1548240693-c7d69e8c2583?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    "1539020140153-e8c237425f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    "15454240-049a21ef9eea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
  ]
  const randomIndex = Math.floor(Math.random() * attractionImages.length)
  return attractionImages[randomIndex]
}

// Floating particles component
const FloatingParticles = () => {
  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden" pointerEvents="none">
      {[...Array(20)].map((_, i) => (
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

// Helper function to get attraction images based on type
const getAttractionImageByType = (type) => {
  const typeImages = {
    historical:
      "1557680510-5b4d0f23d5b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    cultural:
      "1486911278254-a96cdee8f61a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    natural:
      "1565353938851-20361937fcf2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGV1fDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    beach:
      "1555400038-63f5eb0cb97a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    garden:
      "1528820810856-ec912ff49071?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    market:
      "1550452333-48cf320bbcb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    mosque:
      "1539980184962-811164d3bd55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80",
    palace:
      "1582376352720-84de28742c18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    desert:
      "1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1421&q=80",
    mountain:
      "1486771586447-de892eecbb6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
  }

  return typeImages[type.toLowerCase()] || getRandomMoroccoAttraction()
}

const MotionBox = motion(Box)

const AttractionCard = ({ attraction, onFavoriteToggle, isFavorite }) => {
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.600", "gray.300")
  
  // Define color based on attraction type
  const getTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'historical':
        return 'blue.400';
      case 'cultural':
        return 'purple.400';
      case 'natural':
        return 'green.400';
      case 'beach':
        return 'teal.400';
      case 'mountain':
        return 'orange.400';
      case 'desert':
        return 'yellow.500';
      case 'garden':
        return 'pink.400';
      default:
        return 'blue.400';
    }
  }
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -10,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        ease: "easeInOut",
      }}
      bg={cardBg}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="lg"
      borderTop="4px solid"
      borderTopColor={getTypeColor(attraction.type)}
      _hover={{
        boxShadow: "2xl",
        transform: "translateY(-10px)",
      }}
      height="100%"
      display="flex"
      flexDirection="column"
      position="relative"
    >
      {/* Card content */}
      <Box position="relative" h="240px" overflow="hidden">
        <AspectRatio ratio={16 / 9} w="100%" h="100%">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
            style={{ width: "100%", height: "100%" }}
          >
            <Image
              src={
                attraction.photos && attraction.photos.length > 0
                  ? `https://images.unsplash.com/photo-${getAttractionImageByType(attraction.type || "cultural")}`
                  : `https://images.unsplash.com/photo-${getRandomMoroccoAttraction()}`
              }
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
          bgGradient="linear(to-t, blackAlpha.800, transparent 50%)"
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

        {/* Favorite Button */}
        <IconButton
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          icon={isFavorite ? <FaHeart /> : <FaRegHeart />}
          position="absolute"
          top={4}
          left={4}
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
          onClick={(e) => {
            e.preventDefault()
            onFavoriteToggle?.(attraction)
          }}
          boxShadow="0 4px 15px rgba(0, 0, 0, 0.1)"
        />

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

        {/* Content Overlay */}
        <Box position="absolute" bottom="0" left="0" right="0" p={6} color="white">
          <Heading as="h3" size="md" fontWeight="bold" noOfLines={2} lineHeight="short" mb={2}>
            {attraction.name}
          </Heading>

          <HStack spacing={4} fontSize="sm" opacity={0.9}>
            <HStack>
              <Icon as={FiMapPin} />
              <Text>{attraction.city?.name || "Morocco"}</Text>
            </HStack>
            <HStack>
              <Icon as={FaStar} />
              <Text>{attraction.avg_rating ? attraction.avg_rating.toFixed(1) : "4.8"}</Text>
            </HStack>
          </HStack>
        </Box>
      </Box>

      {/* Content */}
      <Box p={6} flexGrow={1} display="flex" flexDirection="column">
        {/* Description */}
        <Text color={textColor} fontSize="sm" mb={4} noOfLines={3} flexGrow={1} lineHeight="tall">
          {attraction.description || "Discover this amazing attraction in Morocco."}
        </Text>

        {/* Tags */}
        {attraction.tags && attraction.tags.length > 0 && (
          <Flex wrap="wrap" gap={2} mb={4}>
            {attraction.tags.slice(0, 3).map((tag, index) => (
              <Tag
                key={index}
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
            ))}
          </Flex>
        )}

        {/* Actions */}
        <Flex 
          justify="space-between" 
          align="center" 
          mt="auto" 
          pt={4} 
          borderTopWidth="1px" 
          borderColor={borderColor}
        >
          <IconButton
            aria-label="Share attraction"
            icon={<FaShare />}
            size="sm"
            variant="ghost"
            color={mutedTextColor}
            _hover={{
              color: textColor,
              bg: "rgba(102, 126, 234, 0.1)",
            }}
          />

          <Button
            as={RouterLink}
            to={`/attractions/${attraction.attraction_id}`}
            size="sm"
            colorScheme="blue"
            rightIcon={<FiChevronRight />}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "md",
            }}
            borderRadius="lg"
            px={6}
            fontWeight="600"
            transition="all 0.2s"
          >
            Explore
          </Button>
        </Flex>
      </Box>
    </MotionBox>
  )
}

const AttractionsPage = () => {
  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const mutedTextColor = useColorModeValue("gray.600", "gray.400")
  const filterBg = useColorModeValue("white", "gray.800")
  const filterBorder = useColorModeValue("gray.200", "gray.700")
  const filterText = useColorModeValue("gray.700", "gray.200")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const inputBg = useColorModeValue("white", "gray.700")
  const inputBorderColor = useColorModeValue("gray.200", "gray.600")
  const inputHoverBorderColor = useColorModeValue("blue.300", "blue.600")
  const modalBg = useColorModeValue("white", "gray.800")
  const modalHeaderBg = useColorModeValue("gray.50", "gray.700")
  const modalBorderColor = useColorModeValue("gray.200", "gray.600")
  const buttonBg = useColorModeValue("blue.500", "blue.600")
  const buttonHoverBg = useColorModeValue("blue.600", "blue.700")
  const buttonTextColor = useColorModeValue("white", "white")
  const tagBg = useColorModeValue("blue.100", "blue.900")
  const tagTextColor = useColorModeValue("blue.800", "blue.100")
  const loadingTextColor = useColorModeValue("gray.600", "gray.400")
  const closeButtonBg = useColorModeValue("gray.200", "gray.600")
  const closeButtonHoverBg = useColorModeValue("gray.300", "gray.500")
  const closeButtonColor = useColorModeValue("gray.600", "white")
  const filterButtonBg = useColorModeValue("white", "gray.700")
  const filterButtonHoverBg = useColorModeValue("gray.50", "gray.600")
  const filterButtonBorder = useColorModeValue("gray.200", "gray.600")
  const filterButtonText = useColorModeValue("gray.700", "white")
  const filterButtonHoverText = useColorModeValue("blue.600", "blue.300")
  const filterButtonActiveBg = useColorModeValue("blue.50", "blue.900")
  const filterButtonActiveText = useColorModeValue("blue.700", "blue.200")
  const filterButtonActiveBorder = useColorModeValue("blue.200", "blue.600")
  const filterButtonActiveHoverBg = useColorModeValue("blue.100", "blue.800")
  const filterButtonActiveHoverText = useColorModeValue("blue.800", "blue.100")
  const filterButtonActiveHoverBorder = useColorModeValue("blue.300", "blue.500")
  const filterButtonActiveFocusBorder = useColorModeValue("blue.500", "blue.400")
  const filterButtonActiveFocusBoxShadow = "0 0 0 1px var(--chakra-colors-blue-500)"
  const headingColor = useColorModeValue("gray.800", "white")
  const subTextColor = useColorModeValue("gray.600", "gray.300")
  const mapBg = useColorModeValue("white", "gray.800")
  const mapBorderColor = useColorModeValue("gray.200", "gray.700")

  // State hooks
  const [attractions, setAttractions] = useState([])
  const [filteredAttractions, setFilteredAttractions] = useState([])
  const [cities, setCities] = useState([])
  const [regions, setRegions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState([])
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Fetch attractions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Simulate API calls
        const mockAttractions = [
          {
            attraction_id: 1,
            name: "Hassan II Mosque",
            description: "Majestic mosque with a towering minaret, located partly over the Atlantic Ocean.",
            city: { name: "Casablanca" },
            avg_rating: 4.9,
            type: "mosque",
            category: "Religious",
            tags: ["Architecture", "Landmark", "Ocean View"],
            is_featured: true
          },
          {
            attraction_id: 2,
            name: "Jardin Majorelle",
            description: "Vibrant botanical garden with exotic plants and a striking blue villa.",
            city: { name: "Marrakech" },
            avg_rating: 4.7,
            type: "garden",
            category: "Garden",
            tags: ["Botanical", "Art", "Yves Saint Laurent"]
          },
          {
            attraction_id: 3,
            name: "Chefchaouen Medina",
            description: "The famous blue-painted streets of this mountain town create a magical atmosphere.",
            city: { name: "Chefchaouen" },
            avg_rating: 4.8,
            type: "cultural",
            category: "Historic",
            tags: ["Photography", "Shopping", "Blue City"],
            is_featured: true
          },
          {
            attraction_id: 4,
            name: "Erg Chebbi Dunes",
            description: "Stunning golden sand dunes in the Sahara Desert, perfect for camel treks.",
            city: { name: "Merzouga" },
            avg_rating: 4.9,
            type: "desert",
            category: "Natural",
            tags: ["Desert", "Adventure", "Sunset"]
          },
          {
            attraction_id: 5,
            name: "Fes el Bali",
            description: "The world's largest contiguous car-free urban area and a UNESCO World Heritage Site.",
            city: { name: "Fes" },
            avg_rating: 4.7,
            type: "historical",
            category: "Historic",
            tags: ["Medina", "UNESCO", "Shopping"]
          },
          {
            attraction_id: 6,
            name: "Atlas Mountains",
            description: "Stunning mountain range with Berber villages and hiking trails.",
            city: { name: "Various" },
            avg_rating: 4.8,
            type: "mountain",
            category: "Natural",
            tags: ["Hiking", "Scenic", "Berber Culture"]
          }
        ]

        const mockCities = ["Casablanca", "Marrakech", "Fes", "Chefchaouen", "Merzouga", "Tangier", "Rabat"]
        const mockRegions = ["North", "South", "East", "West", "Central", "Sahara"]
        const mockCategories = ["Historical", "Cultural", "Natural", "Religious", "Beach", "Market", "Garden"]

        setAttractions(mockAttractions)
        setFilteredAttractions(mockAttractions)
        setCities(mockCities)
        setRegions(mockRegions)
        setCategories(mockCategories)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter attractions based on search and filters
  useEffect(() => {
    let results = attractions

    if (searchTerm) {
      results = results.filter(attraction => 
        attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (attraction.description && attraction.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCity) {
      results = results.filter(attraction => 
        attraction.city?.name?.toLowerCase() === selectedCity.toLowerCase()
      )
    }

    if (selectedRegion) {
      results = results.filter(attraction => 
        attraction.city?.name?.toLowerCase().includes(selectedRegion.toLowerCase())
      )
    }

    if (selectedCategory) {
      results = results.filter(attraction => 
        attraction.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Sort results
    results = [...results].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (sortBy === "rating") {
        return b.avg_rating - a.avg_rating
      } else if (sortBy === "featured") {
        return (b.is_featured || false) - (a.is_featured || false)
      }
      return 0
    })

    setFilteredAttractions(results)
  }, [attractions, searchTerm, selectedCity, selectedRegion, selectedCategory, sortBy])

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteAttractions")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("favoriteAttractions", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (attraction) => {
    setFavorites(prev => {
      const isAlreadyFavorite = prev.some(fav => fav.attraction_id === attraction.attraction_id)
      if (isAlreadyFavorite) {
        return prev.filter(fav => fav.attraction_id !== attraction.attraction_id)
      } else {
        return [...prev, attraction]
      }
    })
  }

  const isFavorite = (attractionId) => {
    return favorites.some(fav => fav.attraction_id === attractionId)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCity("")
    setSelectedRegion("")
    setSelectedCategory("")
    setSortBy("name")
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={loadingTextColor}>Loading attractions...</Text>
        </VStack>
      </Flex>
    )
  }

  if (error) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Text>Error loading attractions: {error}</Text>
        </Alert>
      </Container>
    )
  }

  // Category data with icons
  const categoriesWithIcons = [
    { name: 'All', icon: '🌍' },
    { name: 'Historical', icon: '🏛️' },
    { name: 'Cultural', icon: '🎭' },
    { name: 'Natural', icon: '🌄' },
    { name: 'Beach', icon: '🏖️' },
    { name: 'Mountain', icon: '⛰️' },
    { name: 'Desert', icon: '🏜️' },
  ]

  return (
    <Box bg={bgColor} minH="100vh" position="relative" overflow="hidden">
      <FloatingParticles />
      
      {/* Hero Section */}
      <Box 
        bgImage="linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1545420333-23f22bfd95d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')"
        bgSize="cover"
        bgPosition="center"
        color="white"
        py={32}
        position="relative"
      >
        <Container maxW="container.xl">
          <VStack spacing={6} textAlign="center" maxW="3xl" mx="auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge
                px={4}
                py={1.5}
                borderRadius="full"
                bg="rgba(255,255,255,0.2)"
                color="white"
                fontSize="sm"
                fontWeight="600"
                letterSpacing="wide"
                textTransform="uppercase"
                backdropFilter="blur(10px)"
              >
                Explore Morocco
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Heading as="h1" size="3xl" fontWeight="800" lineHeight="1.2">
                Discover Morocco's Hidden Gems
              </Heading>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Text fontSize="xl" opacity={0.9} maxW="2xl">
                Explore breathtaking landscapes, rich culture, and unforgettable experiences across Morocco
              </Text>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              w="100%"
              maxW="2xl"
              mt={4}
            >
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search attractions, cities, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="white"
                  color="gray.800"
                  border="none"
                  _focus={{
                    boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
                  }}
                  borderRadius="full"
                  pl={12}
                  py={6}
                  fontSize="md"
                />
              </InputGroup>
            </motion.div>
          </VStack>
        </Container>
      </Box>
      
      <Container maxW="container.xl" py={10} position="relative" zIndex={1}>
        {/* Categories Filter */}
        <Box mb={12} overflowX="auto" py={4} className="hide-scrollbar">
          <Flex gap={3} px={1} minW="max-content">
            {categoriesWithIcons.map((category) => (
              <motion.div 
                key={category.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setSelectedCategory(category.name === 'All' ? '' : category.name)}
                  variant="outline"
                  size="lg"
                  borderRadius="xl"
                  bg={selectedCategory === category.name ? 'blue.50' : 'white'}
                  borderColor={selectedCategory === category.name ? 'blue.200' : 'gray.200'}
                  color={selectedCategory === category.name ? 'blue.600' : 'gray.700'}
                  _hover={{
                    bg: selectedCategory === category.name ? 'blue.50' : 'gray.50',
                    borderColor: selectedCategory === category.name ? 'blue.300' : 'gray.300',
                  }}
                  _active={{
                    bg: selectedCategory === category.name ? 'blue.100' : 'gray.100',
                  }}
                  leftIcon={
                    <Box fontSize="xl" mr={1}>
                      {category.icon}
                    </Box>
                  }
                  px={6}
                  py={6}
                  whiteSpace="nowrap"
                  boxShadow="sm"
                >
                  {category.name}
                </Button>
              </motion.div>
            ))}
          </Flex>
        </Box>

        {/* Search and Filter Bar */}
        <Box mb={8} position="relative">
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={4}
            align="center"
            justify="space-between"
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <Flex gap={3} align="center" w={{ base: "100%", md: "auto" }}>
              <Button
                leftIcon={<FaFilter />}
                onClick={toggleFilter}
                variant="outline"
                size="md"
                borderRadius="lg"
                bg={filterButtonBg}
                borderColor={filterButtonBorder}
                color={filterButtonText}
                _hover={{
                  bg: filterButtonHoverBg,
                  color: filterButtonHoverText,
                }}
                _active={{
                  bg: filterButtonActiveBg,
                  borderColor: filterButtonActiveBorder,
                  color: filterButtonActiveText,
                }}
              >
                Filters
              </Button>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                bg={inputBg}
                borderColor={inputBorderColor}
                _hover={{ borderColor: inputHoverBorderColor }}
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
                borderRadius="lg"
                size="md"
                w={{ base: "100%", md: "200px" }}
                fontWeight="500"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="featured">Featured First</option>
              </Select>
            </Flex>
            
            <Text color={mutedTextColor} fontSize="sm">
              {filteredAttractions.length} {filteredAttractions.length === 1 ? 'attraction' : 'attractions'} found
            </Text>
          </Flex>

          {/* Mobile Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && isMobile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden" }}
              >
                <Box
                  mt={4}
                  bg={modalBg}
                  p={6}
                  borderRadius="xl"
                  boxShadow="lg"
                  border="1px solid"
                  borderColor={modalBorderColor}
                >
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="sm">Filters</Heading>
                    <IconButton
                      icon={<FaTimes />}
                      onClick={toggleFilter}
                      size="sm"
                      borderRadius="full"
                      bg={closeButtonBg}
                      color={closeButtonColor}
                      _hover={{ bg: closeButtonHoverBg }}
                    />
                  </Flex>

                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        City
                      </Text>
                      <Select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        bg={inputBg}
                        borderColor={inputBorderColor}
                        placeholder="All Cities"
                        borderRadius="lg"
                      >
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </Select>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Region
                      </Text>
                      <Select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        bg={inputBg}
                        borderColor={inputBorderColor}
                        placeholder="All Regions"
                        borderRadius="lg"
                      >
                        {regions.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </Select>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Category
                      </Text>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        bg={inputBg}
                        borderColor={inputBorderColor}
                        placeholder="All Categories"
                        borderRadius="lg"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Select>
                    </Box>

                    <Button
                      onClick={clearFilters}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                      }}
                      transition="all 0.2s"
                    >
                      Clear Filters
                    </Button>
                  </VStack>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Desktop Filter Panel */}
        {isFilterOpen && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              mb={8}
              bg={modalBg}
              p={6}
              borderRadius="2xl"
              boxShadow="lg"
              border="1px solid"
              borderColor={modalBorderColor}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Filters</Heading>
                <IconButton
                  icon={<FaTimes />}
                  onClick={toggleFilter}
                  size="sm"
                  borderRadius="full"
                  bg={closeButtonBg}
                  color={closeButtonColor}
                  _hover={{ bg: closeButtonHoverBg }}
                />
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    City
                  </Text>
                  <Select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorderColor}
                    placeholder="All Cities"
                    borderRadius="lg"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Region
                  </Text>
                  <Select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorderColor}
                    placeholder="All Regions"
                    borderRadius="lg"
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Category
                  </Text>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    bg={inputBg}
                    borderColor={inputBorderColor}
                    placeholder="All Categories"
                    borderRadius="lg"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </Box>
              </SimpleGrid>

              <Flex justify="flex-end" mt={6}>
                <Button
                  onClick={clearFilters}
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Clear Filters
                </Button>
              </Flex>
            </Box>
          </motion.div>
        )}

        {/* Featured Attractions */}
        {filteredAttractions.some(a => a.is_featured) && (
          <Box mb={16}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg">✨ Featured Attractions</Heading>
              <Button 
                variant="link" 
                colorScheme="blue" 
                rightIcon={<FiChevronRight />}
                _hover={{ textDecoration: 'none' }}
              >
                View all
              </Button>
            </Flex>
            <Box 
              display="grid" 
              gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
              gap={6}
              mb={12}
            >
              {filteredAttractions
                .filter(attraction => attraction.is_featured)
                .slice(0, 3)
                .map((attraction) => (
                  <motion.div
                    key={attraction.attraction_id}
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <AttractionCard
                      attraction={attraction}
                      onFavoriteToggle={toggleFavorite}
                      isFavorite={isFavorite(attraction.attraction_id)}
                    />
                  </motion.div>
                ))}
            </Box>
          </Box>
        )}

        {/* All Attractions */}
        <Box mb={8}>
          <Heading size="lg" mb={6}>All Attractions</Heading>
          
          {/* Attractions List */}
          {filteredAttractions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={6} textAlign="center" py={16} px={4}>
                <Box 
                  w="200px" 
                  h="200px" 
                  bgGradient="linear(to-br, blue.100, purple.100)" 
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={6}
                >
                  <Box fontSize="6xl" mb={2}>
                    🔍
                  </Box>
                </Box>
                <VStack spacing={4}>
                  <Heading size="xl">No attractions found</Heading>
                  <Text color={mutedTextColor} maxW="md" fontSize="lg">
                    We couldn't find any attractions matching your search. Try adjusting your filters or search term.
                  </Text>
                  <Button
                    onClick={clearFilters}
                    colorScheme="blue"
                    size="lg"
                    rightIcon={<FiChevronRight />}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    transition="all 0.2s"
                    px={8}
                    py={6}
                  >
                    Clear All Filters
                  </Button>
                  <Text color={mutedTextColor} fontSize="sm" mt={4}>
                    Or browse our <Button variant="link" colorScheme="blue" onClick={clearFilters}>most popular attractions</Button>
                  </Text>
                </VStack>
              </VStack>
            </motion.div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <VStack spacing={4} textAlign="center" mb={12}>
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
                  <Heading size="xl" color={headingColor} fontWeight="700" lineHeight="1.2">
                    {filteredAttractions.length} Amazing {filteredAttractions.length === 1 ? "Attraction" : "Attractions"}
                  </Heading>
                  <Text color={subTextColor} fontSize="lg" maxW="2xl" lineHeight="tall">
                    Discover the beauty and culture of Morocco through these incredible destinations
                  </Text>
                </VStack>
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
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
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
              bg={mapBg}
              boxShadow="2xl"
              border="1px solid"
              borderColor={mapBorderColor}
              textAlign="center"
            >
              <VStack spacing={6}>
                <Badge
                  px={4}
                  py={2}
                  borderRadius="full"
                  colorScheme="blue"
                  variant="subtle"
                  fontSize="sm"
                  fontWeight="600"
                  letterSpacing="wide"
                  textTransform="uppercase"
                >
                  Interactive Experience
                </Badge>
                <Heading as="h3" size="xl" color={headingColor}>
                  Explore Attractions on the Map
                </Heading>
                <Text
                  fontSize="lg"
                  color={subTextColor}
                  maxW="2xl"
                  mx="auto"
                  lineHeight="tall"
                >
                  Discover attractions near your location or plan your route between multiple sites. Find hidden gems
                  across Morocco's diverse landscapes.
                </Text>
                <Button
                  as={RouterLink}
                  to="/attractions-map"
                  size="lg"
                  colorScheme="blue"
                  rightIcon={<FiMapPin />}
                  _hover={{
                    transform: "translateY(-3px)",
                    boxShadow: "lg",
                  }}
                  borderRadius="xl"
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="600"
                  transition="all 0.3s ease"
                >
                  Open Interactive Map
                </Button>
              </VStack>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  )
}

export default AttractionsPage