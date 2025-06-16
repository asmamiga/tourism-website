"use client"
import {
  Box,
  Text,
  Icon,
  VStack,
  Button,
  Flex,
  useColorModeValue,
  HStack,
  Badge,
  Heading,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FiMapPin, FiNavigation, FiMaximize2, FiExternalLink, FiGlobe, FiCompass } from "react-icons/fi"

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const AttractionMap = ({
  latitude,
  longitude,
  attractionName,
  address,
  showDirections = true,
  height = "400px",
  isFullWidth = false,
}) => {
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const textColor = useColorModeValue("gray.600", "gray.300")
  const headingColor = useColorModeValue("gray.800", "white")
  const mapBg = useColorModeValue("blue.50", "blue.900")
  const isMobile = useBreakpointValue({ base: true, md: false })
  const badgeBgColor = useColorModeValue("blue.100", "blue.800")
  const badgeTextColor = useColorModeValue("blue.800", "blue.100")

  const handleGetDirections = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      window.open(url, "_blank")
    }
  }

  const handleOpenInMaps = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      window.open(url, "_blank")
    }
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      width="100%"
      height={height}
      bg={bgColor}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="lg"
      position="relative"
      _hover={{
        boxShadow: "2xl",
        transform: "translateY(-4px)",
      }}
      transition="all 0.3s ease"
    >
      {/* Header */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        p={6}
        position="relative"
        overflow="hidden"
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          bgImage="url('data:image/svg+xml,<svg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><g fill=&quot;none&quot; fillRule=&quot;evenodd&quot;><g fill=&quot;%23ffffff&quot; fillOpacity=&quot;0.4&quot;><circle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/></g></g></svg>')"
        />

        <Flex justify="space-between" align="center" position="relative" zIndex={2}>
          <VStack align="flex-start" spacing={2}>
            <HStack spacing={2}>
              <Icon as={FiMapPin} fontSize="lg" />
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                bg="whiteAlpha.200"
                color="white"
                fontWeight="600"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Location
              </Badge>
            </HStack>
            <Heading size="md" fontWeight="700" noOfLines={1}>
              {attractionName || "Attraction Location"}
            </Heading>
          </VStack>

          <IconButton
            aria-label="Expand map"
            icon={<FiMaximize2 />}
            size="sm"
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={handleOpenInMaps}
          />
        </Flex>
      </Box>

      {/* Map Content Area */}
      <Box
        flex={1}
        bg={mapBg}
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="250px"
      >
        {/* Decorative Map Grid */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          bgImage="linear-gradient(rgba(102, 126, 234, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(102, 126, 234, 0.1) 1px, transparent 1px)"
          bgSize="20px 20px"
        />

        <VStack spacing={6} textAlign="center" position="relative" zIndex={2}>
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Box p={4} bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" borderRadius="full" boxShadow="lg">
              <Icon as={FiCompass} fontSize="3xl" color="white" />
            </Box>
          </MotionBox>

          <VStack spacing={3}>
            <Heading size="md" color={headingColor} textAlign="center">
              Interactive Map View
            </Heading>

            {address && (
              <Text fontSize="sm" color={textColor} maxW="300px" textAlign="center" lineHeight="tall">
                {address}
              </Text>
            )}

            {latitude && longitude && (
              <HStack spacing={2}>
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={badgeBgColor}
                  color={badgeTextColor}
                  fontFamily="mono"
                  fontSize="xs"
                >
                  {latitude.toFixed(4)}°N
                </Badge>
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={badgeBgColor}
                  color={badgeTextColor}
                  fontFamily="mono"
                  fontSize="xs"
                >
                  {longitude.toFixed(4)}°W
                </Badge>
              </HStack>
            )}
          </VStack>
        </VStack>

        {/* Interactive Map Badge */}
        <Badge
          position="absolute"
          top={4}
          right={4}
          px={3}
          py={2}
          borderRadius="lg"
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          color="white"
          fontWeight="600"
          fontSize="xs"
          textTransform="uppercase"
          letterSpacing="wider"
          boxShadow="md"
        >
          <Icon as={FiGlobe} mr={1} />
          Live Map
        </Badge>
      </Box>

      {/* Action Buttons */}
      {showDirections && latitude && longitude && (
        <Box p={6} bg={bgColor} borderTop="1px solid" borderColor={borderColor}>
          <HStack spacing={3} justify="center">
            <MotionButton
              leftIcon={<FiNavigation />}
              colorScheme="blue"
              size="md"
              onClick={handleGetDirections}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              flex={1}
              maxW="200px"
              fontWeight="600"
            >
              Get Directions
            </MotionButton>

            <MotionButton
              leftIcon={<FiExternalLink />}
              variant="outline"
              colorScheme="blue"
              size="md"
              onClick={handleOpenInMaps}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              flex={1}
              maxW="200px"
              fontWeight="600"
            >
              Open in Maps
            </MotionButton>
          </HStack>
        </Box>
      )}
    </MotionBox>
  )
}

export default AttractionMap
