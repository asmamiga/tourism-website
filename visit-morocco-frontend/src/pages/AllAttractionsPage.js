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

// Enhanced floating particles with more dynamic movement
const FloatingParticles = () => {
  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden" pointerEvents="none">
      {[...Array(35)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: Math.random() * 6 + 3,
            height: Math.random() * 6 + 3,
            background: i % 3 === 0 
              ? "linear-gradient(45deg, rgba(255, 216, 155, 0.4), rgba(25, 84, 123, 0.4))" 
              : i % 3 === 1 
              ? "linear-gradient(45deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4))"
              : "linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))",
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: "blur(1px)",
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </Box>
  )
}

// Enhanced background with animated gradients
const AnimatedBackground = () => {
  return (
    <Box 
      position="fixed" 
      top={0} 
      left={0} 
      right={0} 
      bottom={0} 
      zIndex={-1}
      overflow="hidden"
    >
      {/* Primary gradient background */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        }}
        animate={{
          background: [
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #667eea 100%)",
            "linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #764ba2 100%)",
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Overlay gradients for depth */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)"
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="radial-gradient(circle at 70% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%)"
      />
    </Box>
  )
}

// Helper function to get attraction image
const getAttractionImage = (attraction) => {
  if (attraction?.photos?.[0]?.photo_url) {
    return attraction.photos[0].photo_url
  }
  
  if (attraction?.image_url) {
    return attraction.image_url
  }

  const defaultImages = [
    '1539020140153-e8c237425f2d',
    '1539072692047-3bd38673d8ce',
    '1548240693-c7d69e8c2583',
    '1595991209486-01c05fa9e812',
    '15454240-049a21ef9eea',
    '1573346145020-1d9c5c9d0a8d',
    '1559561721-1c65d8e9d9b6',
    '1564507589426-5a3223c5e9b7'
  ]

  const getConsistentIndex = (str) => {
    if (!str) return 0
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash) % defaultImages.length
  }
  
  const index = attraction?.id ? getConsistentIndex(attraction.id) : 
                  attraction?.name ? getConsistentIndex(attraction.name) :
                  Math.floor(Math.random() * defaultImages.length)
  
  return `https://images.unsplash.com/photo-${defaultImages[index]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
}

const MotionBox = motion(Box)

// Enhanced attraction card with better visual hierarchy
const AttractionCard = ({ attraction, onFavoriteToggle, isFavorite }) => {
  const toast = useToast()
  const [isHovered, setIsHovered] = useState(false)

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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -12, 
        scale: 1.03,
        rotateY: 2,
        rotateX: 2,
      }}
      transition={{ 
        duration: 0.4,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      bg="rgba(255, 255, 255, 0.08)"
      backdropFilter="blur(25px)"
      borderRadius="3xl"
      overflow="hidden"
      boxShadow="0 30px 60px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
      border="1px solid rgba(255, 255, 255, 0.15)"
      height="100%"
      display="flex"
      flexDirection="column"
      position="relative"
      transformOrigin="center"
      style={{
        transformStyle: "preserve-3d"
      }}
      _hover={{
        boxShadow: "0 40px 80px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Animated border gradient */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "24px",
          padding: "2px",
          background: isHovered 
            ? "linear-gradient(45deg, rgba(255, 216, 155, 0.6), rgba(102, 126, 234, 0.6), rgba(25, 84, 123, 0.6))"
            : "transparent",
          zIndex: -1,
        }}
        animate={{
          background: isHovered 
            ? [
                "linear-gradient(45deg, rgba(255, 216, 155, 0.6), rgba(102, 126, 234, 0.6), rgba(25, 84, 123, 0.6))",
                "linear-gradient(45deg, rgba(102, 126, 234, 0.6), rgba(25, 84, 123, 0.6), rgba(255, 216, 155, 0.6))",
                "linear-gradient(45deg, rgba(25, 84, 123, 0.6), rgba(255, 216, 155, 0.6), rgba(102, 126, 234, 0.6))"
              ]
            : "transparent"
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Image Container with enhanced effects */}
      <Box position="relative" h="280px" overflow="hidden">
        <AspectRatio ratio={16 / 9} w="100%" h="100%">
          <motion.div
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ width: "100%", height: "100%" }}
          >
            <Image
              src={getAttractionImage(attraction) || "/placeholder.svg"}
              alt={attraction.name}
              objectFit="cover"
              w="100%"
              h="100%"
              fallbackSrc="https://images.unsplash.com/photo-1539020140153-e8c237425f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              filter={isHovered ? "brightness(1.1) contrast(1.05)" : "brightness(1)"}
              transition="filter 0.3s ease"
            />
          </motion.div>
        </AspectRatio>

        {/* Enhanced gradient overlays */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-t, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)"
        />
        
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
            opacity: 0,
          }}
          animate={{
            opacity: isHovered ? 0.8 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

       

        {/* Enhanced Action Buttons */}
        <HStack position="absolute" top={5} left={5} spacing={3}>
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              icon={isFavorite ? <FaHeart /> : <FaRegHeart />}
              size="sm"
              bg="rgba(255, 255, 255, 0.95)"
              color={isFavorite ? "red.500" : "gray.600"}
              backdropFilter="blur(15px)"
              borderRadius="full"
              _hover={{
                bg: "white",
                color: "red.500",
                transform: "scale(1.1)",
              }}
              onClick={handleFavoriteClick}
              boxShadow="0 8px 25px rgba(0, 0, 0, 0.2)"
              border="1px solid rgba(0, 0, 0, 0.3)"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              aria-label="Share attraction"
              icon={<FaShare />}
              size="sm"
              bg="rgba(255, 255, 255, 0.95)"
              color="gray.600"
              backdropFilter="blur(15px)"
              borderRadius="full"
              _hover={{
                bg: "white",
                color: "blue.500",
                transform: "scale(1.1)",
              }}
              onClick={handleShare}
              boxShadow="0 8px 25px rgba(0, 0, 0, 0.2)"
              border="1px solid rgba(0, 0, 0, 0.3)"
            />
          </motion.div>
        </HStack>

        {/* Enhanced Category Badge */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Badge
            position="absolute"
            bottom={5}
            left={5}
            bg="rgba(0, 0, 0, 0.8)"
            color="white"
            px={4}
            py={2}
            borderRadius="full"
            fontSize="xs"
            fontWeight="medium"
            backdropFilter="blur(15px)"
            border="1px solid rgba(0, 0, 0, 0.2)"
          >
            {attraction.category || "Attraction"}
          </Badge>
        </motion.div>
      </Box>

      {/* Enhanced Content Section */}
      <Box p={6} flexGrow={1} display="flex" flexDirection="column">
        {/* Title and Rating with better spacing */}
        <Flex justify="space-between" align="flex-start" mb={5} gap={3}>
          <Heading
            as="h3"
            size="lg"
            fontWeight="800"
            color="black"
            noOfLines={2}
            lineHeight="1.3"
            flex={1}
            textShadow="0 1px 2px rgba(0,0,0,0.1)"
            letterSpacing="tight"
            fontSize="xl"
          >
            {attraction.name}
          </Heading>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flex
              align="center"
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="black"
              px={4}
              py={2.5}
              borderRadius="xl"
              minW="80px"
              justifyContent="center"
              boxShadow="0 6px 20px rgba(102, 126, 234, 0.4)"
              flexShrink={0}
              border="1px solid rgba(0, 0, 0, 0.2)"
            >
              <Icon as={FaStar} mr={2} boxSize={4} />
              <Text fontSize="md" fontWeight="bold">
                {attraction.avg_rating ? attraction.avg_rating.toFixed(1) : "4.8"}
              </Text>
            </Flex>
          </motion.div>
        </Flex>

        {/* Enhanced Location */}
        <motion.div
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Flex 
            align="center" 
            color="black" 
            fontSize="md" 
            mb={5}
            bg="gray.50"
            px={4}
            py={3}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <Icon as={FaMapMarkerAlt} mr={3} color="#ffd89b" boxSize={4} />
            <Text noOfLines={1} fontWeight="medium">
              {attraction.city?.name || "Morocco"}{attraction.region?.name ? `, ${attraction.region.name}` : ''}
            </Text>
          </Flex>
        </motion.div>

        {/* Enhanced Description */}
        <Box 
          bg="white" 
          p={5} 
          borderRadius="xl"
          mb={5}
          flexGrow={1}
          borderWidth="1px"
          borderColor="rgba(0, 0, 0, 0.1)"
          backdropFilter="blur(10px)"
        >
          <Text 
            color="black" 
            fontSize="sm" 
            noOfLines={4} 
            lineHeight="1.6"
            fontWeight="normal"
          >
            {attraction.description || "Discover this amazing attraction in Morocco with its unique cultural and historical significance."}
          </Text>
        </Box>

        {/* Enhanced Tags */}
        {attraction.tags && attraction.tags.length > 0 && (
          <Wrap spacing={2} mb={5}>
            {attraction.tags.slice(0, 3).map((tag, index) => (
              <WrapItem key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Tag
                    size="sm"
                    bg="rgba(255, 216, 155, 0.2)"
                    color="#ffd89b"
                    borderRadius="full"
                    px={3}
                    py={1.5}
                    fontSize="xs"
                    fontWeight="semibold"
                    border="1px solid rgba(0, 0, 0, 0.3)"
                  >
                    {tag}
                  </Tag>
                </motion.div>
              </WrapItem>
            ))}
          </Wrap>
        )}
        {/* Enhanced Actions */}
        <Flex justify="space-between" align="center" mt="auto" pt={5} borderTopWidth="1px" borderColor="gray.200">
          <Badge
            bg="rgba(255, 216, 155, 0.15)"
            color="#ffd89b"
            px={4}
            py={2}
            borderRadius="full"
            fontSize="xs"
            fontWeight="semibold"
            border="1px solid rgba(0, 0, 0, 0.25)"
          >
            {attraction.category || "Uncategorized"}
          </Badge>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              as={RouterLink}
              to={`/attractions/${attraction.attraction_id}`}
              size="sm"
              bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
              color="black"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
              }}
              borderRadius="full"
              px={6}
              py={2}
              fontWeight="bold"
              transition="all 0.3s"
              leftIcon={<FaEye />}
              border="1px solid rgba(0, 0, 0, 0.2)"
            >
              Explore
            </Button>
          </motion.div>
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

        const uniqueRegions = [
          ...new Map(
            mockAttractions
              .map((attraction) => [attraction.region?.region_id, attraction.region])
              .filter(([_, region]) => region),
          ).values(),
        ]

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
          (attraction.region?.name && attraction.region.name.toLowerCase().includes(searchLower)),
      )
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
  }, [attractions, searchTerm, selectedRegion, selectedCategory, sortBy])

  const handleReset = () => {
    setSearchTerm("")
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
                color="black"
                fontWeight="600"
                fontSize="sm"
                letterSpacing="wider"
                textTransform="uppercase"
                backdropFilter="blur(20px)"
                border="1px solid rgba(0, 0, 0, 0.2)"
              >
                &#x2728; Complete Collection
              </Badge>

              <Heading
                as="h1"
                size="4xl"
                fontWeight="800"
                lineHeight="1.1"
                letterSpacing="tight"
                color="black"
                textShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
              >
                All Morocco's
                <Text as="span" display="block" bgGradient="linear(to-r, #ffd89b, #19547b)" bgClip="text">
                  Amazing Attractions
                </Text>
              </Heading>

              <Text fontSize="xl" color="black" lineHeight="tall" fontWeight="400" maxW="3xl">
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
            border="1px solid rgba(0, 0, 0, 0.2)"
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
                color="black"
                _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
                borderRadius="xl"
                backdropFilter="blur(10px)"
                border="1px solid rgba(0, 0, 0, 0.2)"
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
                    border="1px solid rgba(0, 0, 0, 0.1)"
                  >
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={4}>
                      <Select
                        placeholder="All Regions"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
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
              <Heading size="lg" color="black" mb={4}>
                No attractions found
              </Heading>
              <Text color="black" mb={6}>
                Try adjusting your search criteria to discover more attractions.
              </Text>
              <Button
                onClick={handleReset}
                bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
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
                  <Heading size="lg" color="black" mb={2}>
                    {filteredAttractions.length} Incredible{" "}
                    {filteredAttractions.length === 1 ? "Attraction" : "Attractions"}
                  </Heading>
                  <Text color="black">
                    {searchTerm || selectedRegion || selectedCategory
                      ? "Filtered results matching your criteria"
                      : "Discover the complete collection of Morocco's wonders"}
                  </Text>
                </Box>

                {(searchTerm || selectedRegion || selectedCategory) && (
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
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(20px)"
            border="1px solid rgba(255, 255, 255, 0.2)"
            textAlign="center"
          >
            <Heading as="h3" size="xl" color="black" mb={6}>
              Explore All Attractions on the Map
            </Heading>
            <Text fontSize="lg" color="black" mb={8} maxW="2xl" mx="auto">
              Visualize all attractions across Morocco on our interactive map. Plan your perfect route and discover
              hidden gems along the way.
            </Text>
            <HStack spacing={4} justify="center">
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
                leftIcon={<FaMapMarkedAlt />}
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
