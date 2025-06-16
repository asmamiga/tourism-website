"use client"
import {
  Box,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Icon,
  Button,
  useColorModeValue,
  Flex,
  Image,
  Heading,
  useBreakpointValue,
  Divider,
} from "@chakra-ui/react"
import { motion, AnimatePresence } from "framer-motion"
import { FiMapPin, FiNavigation, FiEye, FiChevronRight, FiCompass, FiClock, FiStar } from "react-icons/fi"
import { Link as RouterLink } from "react-router-dom"

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const AttractionCard = ({ attraction, index }) => {
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.600", "gray.300")
  const hoverBg = useColorModeValue("gray.50", "gray.700")

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      bg={cardBg}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="lg"
      _hover={{
        boxShadow: "2xl",
        transform: "translateY(-8px)",
      }}
      transition="all 0.3s ease"
      position="relative"
    >
      {/* Image Section */}
      <Box position="relative" h="160px" overflow="hidden">
        <Image
          src={attraction.photo || "/placeholder.svg?height=160&width=300"}
          alt={attraction.name}
          objectFit="cover"
          w="100%"
          h="100%"
          fallbackSrc="https://images.unsplash.com/photo-1539020140153-e8c237425f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        />

        {/* Gradient Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-t, blackAlpha.600, transparent 60%)"
        />

        {/* Distance Badge */}
        {attraction.distance && (
          <Badge
            position="absolute"
            top={3}
            right={3}
            px={3}
            py={1}
            borderRadius="full"
            bg="rgba(255, 255, 255, 0.9)"
            color="gray.800"
            fontWeight="600"
            fontSize="xs"
            backdropFilter="blur(10px)"
            boxShadow="sm"
          >
            <Icon as={FiMapPin} mr={1} fontSize="xs" />
            {attraction.distance}
          </Badge>
        )}

        {/* Category Badge */}
        {attraction.category && (
          <Badge
            position="absolute"
            bottom={3}
            left={3}
            px={3}
            py={1}
            borderRadius="full"
            bg="rgba(0, 0, 0, 0.7)"
            color="white"
            fontWeight="500"
            fontSize="xs"
            backdropFilter="blur(10px)"
          >
            {attraction.category}
          </Badge>
        )}
      </Box>

      {/* Content Section */}
      <Box p={5}>
        <VStack align="stretch" spacing={4}>
          {/* Title and Rating */}
          <Flex justify="space-between" align="flex-start">
            <Heading size="sm" color={textColor} fontWeight="700" noOfLines={2} flex={1} lineHeight="1.3">
              {attraction.name || "Unnamed Attraction"}
            </Heading>

            {attraction.rating && (
              <HStack spacing={1} ml={2}>
                <Icon as={FiStar} color="yellow.400" fontSize="sm" />
                <Text fontSize="sm" fontWeight="600" color={textColor}>
                  {attraction.rating}
                </Text>
              </HStack>
            )}
          </Flex>

          {/* Description */}
          {attraction.description && (
            <Text fontSize="sm" color={mutedTextColor} noOfLines={2} lineHeight="1.5">
              {attraction.description}
            </Text>
          )}

          {/* Additional Info */}
          <HStack spacing={4} fontSize="xs" color={mutedTextColor}>
            {attraction.visitTime && (
              <HStack spacing={1}>
                <Icon as={FiClock} />
                <Text>{attraction.visitTime}</Text>
              </HStack>
            )}
            {attraction.type && (
              <HStack spacing={1}>
                <Icon as={FiCompass} />
                <Text textTransform="capitalize">{attraction.type}</Text>
              </HStack>
            )}
          </HStack>

          <Divider />

          {/* Action Buttons */}
          <HStack spacing={2}>
            {attraction.attraction_id && (
              <MotionButton
                as={RouterLink}
                to={`/attractions/${attraction.attraction_id}`}
                size="sm"
                colorScheme="blue"
                variant="solid"
                leftIcon={<FiEye />}
                flex={1}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                fontWeight="600"
                borderRadius="lg"
              >
                View
              </MotionButton>
            )}

            {attraction.latitude && attraction.longitude && (
              <MotionButton
                as="a"
                href={`https://www.google.com/maps/dir/?api=1&destination=${attraction.latitude},${attraction.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                colorScheme="green"
                variant="outline"
                leftIcon={<FiNavigation />}
                flex={1}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                fontWeight="600"
                borderRadius="lg"
              >
                Route
              </MotionButton>
            )}
          </HStack>
        </VStack>
      </Box>
    </MotionBox>
  )
}

const NearbyAttractions = ({ attractions = [], title = "Nearby Attractions" }) => {
  const headingColor = useColorModeValue("gray.800", "white")
  const textColor = useColorModeValue("gray.600", "gray.300")
  const sectionBg = useColorModeValue("gray.50", "gray.900")
  const isMobile = useBreakpointValue({ base: true, md: false })

  if (!attractions || attractions.length === 0) {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        bg={sectionBg}
        borderRadius="2xl"
        p={12}
        textAlign="center"
      >
        <VStack spacing={4}>
          <Box p={4} bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" borderRadius="full" display="inline-flex">
            <Icon as={FiMapPin} fontSize="2xl" color="white" />
          </Box>
          <Heading size="md" color={headingColor}>
            No nearby attractions found
          </Heading>
          <Text color={textColor} maxW="md" lineHeight="tall">
            We couldn't find any attractions near this location. Try exploring other areas or check back later for
            updates.
          </Text>
        </VStack>
      </MotionBox>
    )
  }

  return (
    <Box>
      {/* Section Header */}
      <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} mb={8}>
        <VStack spacing={4} align="flex-start">
          <HStack spacing={3}>
            <Box
              p={2}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiCompass} color="white" fontSize="lg" />
            </Box>
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg" color={headingColor} fontWeight="700">
                {title}
              </Heading>
              <Text color={textColor} fontSize="sm">
                {attractions.length} {attractions.length === 1 ? "attraction" : "attractions"} nearby
              </Text>
            </VStack>
          </HStack>

          <Badge
            px={4}
            py={2}
            borderRadius="full"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            fontWeight="600"
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            <Icon as={FiMapPin} mr={2} />
            Discover More
          </Badge>
        </VStack>
      </MotionBox>

      {/* Attractions Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <AnimatePresence>
          {attractions.map((attraction, index) => (
            <AttractionCard key={attraction.attraction_id || index} attraction={attraction} index={index} />
          ))}
        </AnimatePresence>
      </SimpleGrid>

      {/* View All Button */}
      {attractions.length > 6 && (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Flex justify="center" mt={8}>
            <MotionButton
              as={RouterLink}
              to="/attractions"
              size="lg"
              colorScheme="blue"
              rightIcon={<FiChevronRight />}
              whileHover={{
                y: -2,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
              px={8}
              py={6}
              borderRadius="xl"
              fontWeight="600"
              bgGradient="linear(to-r, blue.500, blue.600)"
              _hover={{
                bgGradient: "linear(to-r, blue.600, blue.700)",
                boxShadow: "lg",
              }}
            >
              Explore All Attractions
            </MotionButton>
          </Flex>
        </MotionBox>
      )}
    </Box>
  )
}

export default NearbyAttractions
