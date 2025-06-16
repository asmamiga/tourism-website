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
  Tooltip,
  keyframes,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FiMapPin, FiNavigation, FiMaximize2, FiExternalLink, FiGlobe, FiCompass, FiMap, FiStar } from "react-icons/fi"

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Enhanced keyframes for animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

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
  const mapBg = useColorModeValue(
    "linear-gradient(135deg, #f8faff 0%, #e8f4fd 50%, #d6f2ff 100%)",
    "linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)"
  )
  const isMobile = useBreakpointValue({ base: true, md: false })
  const badgeBgColor = useColorModeValue("blue.100", "blue.800")
  const badgeTextColor = useColorModeValue("blue.800", "blue.100")
  const glowColor = useColorModeValue("rgba(102, 126, 234, 0.4)", "rgba(102, 126, 234, 0.6)")

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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      width="100%"
      height={height}
      bg={bgColor}
      borderRadius="3xl"
      overflow="hidden"
      boxShadow="0 20px 60px -10px rgba(0, 0, 0, 0.15), 0 8px 25px -5px rgba(0, 0, 0, 0.1)"
      position="relative"
      _hover={{
        boxShadow: `0 30px 80px -10px rgba(0, 0, 0, 0.25), 0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px ${glowColor}`,
        transform: "translateY(-8px)",
      }}
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(135deg, ${glowColor} 0%, transparent 70%)`,
        opacity: 0,
        transition: "opacity 0.4s ease",
        zIndex: -1,
        borderRadius: "3xl",
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-2px",
        left: "-2px",
        right: "-2px",
        bottom: "-2px",
        background: "linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.1), transparent)",
        borderRadius: "3xl",
        zIndex: -2,
        opacity: 0,
        transition: "opacity 0.4s ease",
      }}
      sx={{
        "&:hover::before": {
          opacity: 0.1,
        },
        "&:hover::after": {
          opacity: 1,
        },
      }}
    >
      {/* Enhanced Header with Gradient Overlay */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 60%, #f093fb 100%)"
        color="white"
        p={6}
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%), linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
          opacity: 0.3,
        }}
      >
        {/* Animated Background Particles */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.2}
        >
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              width="4px"
              height="4px"
              bg="white"
              borderRadius="full"
              top={`${Math.random() * 100}%`}
              left={`${Math.random() * 100}%`}
              animation={`${float} ${3 + Math.random() * 2}s ease-in-out infinite`}
              animationDelay={`${Math.random() * 2}s`}
            />
          ))}
        </Box>

        <Flex justify="space-between" align="center" position="relative" zIndex={2}>
          <VStack align="flex-start" spacing={3}>
            <HStack spacing={3}>
              <MotionBox
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Icon as={FiMapPin} fontSize="xl" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
              </MotionBox>
              <Badge
                px={4}
                py={2}
                borderRadius="full"
                bg="whiteAlpha.200"
                color="white"
                fontWeight="700"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                _hover={{ bg: "whiteAlpha.300" }}
                transition="all 0.3s ease"
              >
                <Icon as={FiStar} mr={1} fontSize="xs" />
                Premium Location
              </Badge>
            </HStack>
            <Heading 
              size="lg" 
              fontWeight="800" 
              noOfLines={1}
              textShadow="0 2px 10px rgba(0,0,0,0.3)"
              color="white"
            >
              {attractionName || "Attraction Location"}
            </Heading>
          </VStack>

          <Tooltip label="Open in full screen" placement="left">
            <MotionBox
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconButton
                aria-label="Expand map"
                icon={<FiMaximize2 />}
                size="lg"
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.300", transform: "rotate(90deg)" }}
                onClick={handleOpenInMaps}
                borderRadius="xl"
                transition="all 0.3s ease"
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.300"
              />
            </MotionBox>
          </Tooltip>
        </Flex>

        {/* Shimmer Effect */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          background="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
          backgroundSize="200% 100%"
          animation={`${shimmer} 3s ease-in-out infinite`}
          opacity={0.5}
          pointerEvents="none"
        />
      </Box>

      {/* Enhanced Map Content Area */}
      <Box
        flex={1}
        bg={mapBg}
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="250px"
        overflow="hidden"
      >
        {/* Enhanced Grid Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.15}
          bgImage="radial-gradient(circle at 2px 2px, rgba(102, 126, 234, 0.3) 1px, transparent 0)"
          bgSize="30px 30px"
          animation={`${float} 20s ease-in-out infinite`}
        />

        {/* Floating Geometric Shapes */}
        <Box position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden">
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              width={`${20 + Math.random() * 40}px`}
              height={`${20 + Math.random() * 40}px`}
              bg="linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))"
              borderRadius={Math.random() > 0.5 ? "50%" : "20%"}
              top={`${Math.random() * 100}%`}
              left={`${Math.random() * 100}%`}
              animation={`${float} ${4 + Math.random() * 3}s ease-in-out infinite`}
              animationDelay={`${Math.random() * 3}s`}
              transform={`rotate(${Math.random() * 360}deg)`}
            />
          ))}
        </Box>

        <VStack spacing={8} textAlign="center" position="relative" zIndex={2}>
          <MotionBox
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.1, rotate: 360 }}
          >
            <Box 
              p={6} 
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 60%, #f093fb 100%)" 
              borderRadius="50%" 
              boxShadow="0 15px 35px rgba(102, 126, 234, 0.4), 0 5px 15px rgba(0, 0, 0, 0.12)"
              position="relative"
              _before={{
                content: '""',
                position: "absolute",
                top: "-4px",
                left: "-4px",
                right: "-4px",
                bottom: "-4px",
                background: "linear-gradient(45deg, #667eea, #764ba2, #f093fb, #667eea)",
                borderRadius: "50%",
                zIndex: -1,
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            >
              <Icon as={FiCompass} fontSize="4xl" color="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
            </Box>
          </MotionBox>

          <VStack spacing={4}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Heading 
                size="lg" 
                color={headingColor} 
                textAlign="center"
                fontWeight="800"
              >
                Interactive Map Experience
              </Heading>
            </MotionBox>

            {address && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Text 
                  fontSize="md" 
                  color={textColor} 
                  maxW="350px" 
                  textAlign="center" 
                  lineHeight="tall"
                  fontWeight="500"
                  bg={useColorModeValue("white", "gray.700")}
                  px={4}
                  py={2}
                  borderRadius="lg"
                  boxShadow="md"
                  border="1px solid"
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                >
                  <Icon as={FiMap} mr={2} />
                  {address}
                </Text>
              </MotionBox>
            )}

            {latitude && longitude && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
              >
                <HStack spacing={3}>
                  <Badge
                    px={4}
                    py={2}
                    borderRadius="xl"
                    bg={useColorModeValue("white", "gray.700")}
                    color={useColorModeValue("blue.600", "blue.300")}
                    fontFamily="mono"
                    fontSize="sm"
                    fontWeight="700"
                    border="2px solid"
                    borderColor={useColorModeValue("blue.200", "blue.500")}
                    boxShadow="md"
                    _hover={{ transform: "scale(1.05)" }}
                    transition="all 0.3s ease"
                  >
                    📍 {latitude.toFixed(4)}°N
                  </Badge>
                  <Badge
                    px={4}
                    py={2}
                    borderRadius="xl"
                    bg={useColorModeValue("white", "gray.700")}
                    color={useColorModeValue("blue.600", "blue.300")}
                    fontFamily="mono"
                    fontSize="sm"
                    fontWeight="700"
                    border="2px solid"
                    borderColor={useColorModeValue("blue.200", "blue.500")}
                    boxShadow="md"
                    _hover={{ transform: "scale(1.05)" }}
                    transition="all 0.3s ease"
                  >
                    🌐 {longitude.toFixed(4)}°W
                  </Badge>
                </HStack>
              </MotionBox>
            )}
          </VStack>
        </VStack>

        {/* Enhanced Interactive Map Badge */}
        <MotionBox
          position="absolute"
          top={4}
          right={4}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Badge
            px={4}
            py={3}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            fontWeight="700"
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wider"
            boxShadow="0 8px 25px rgba(102, 126, 234, 0.4)"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="whiteAlpha.300"
            _hover={{ 
              transform: "scale(1.05)",
              boxShadow: "0 12px 35px rgba(102, 126, 234, 0.6)"
            }}
            transition="all 0.3s ease"
          >
            <Icon as={FiGlobe} mr={2} />
            Live Map
          </Badge>
        </MotionBox>
      </Box>

      {/* Enhanced Action Buttons */}
      {showDirections && latitude && longitude && (
        <Box 
          p={6} 
          bg={bgColor} 
          borderTop="1px solid" 
          borderColor={borderColor}
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "4px",
            bg: "linear-gradient(135deg, #667eea, #764ba2)",
            borderRadius: "full",
          }}
        >
          <HStack spacing={4} justify="center" pt={2}>
            <Tooltip label="Get turn-by-turn directions" placement="top">
              <MotionButton
                leftIcon={<FiNavigation />}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                size="lg"
                onClick={handleGetDirections}
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                flex={1}
                maxW="220px"
                fontWeight="700"
                borderRadius="xl"
                boxShadow="0 8px 25px rgba(102, 126, 234, 0.4)"
                _hover={{
                  bg: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                  boxShadow: "0 12px 35px rgba(102, 126, 234, 0.6)",
                }}
                _active={{
                  bg: "linear-gradient(135deg, #4c51bf 0%, #553c9a 100%)",
                }}
              >
                Get Directions
              </MotionButton>
            </Tooltip>

            <Tooltip label="Open in Google Maps" placement="top">
              <MotionButton
                leftIcon={<FiExternalLink />}
                variant="outline"
                bg={useColorModeValue("white", "gray.700")}
                color={useColorModeValue("blue.600", "blue.300")}
                size="lg"
                onClick={handleOpenInMaps}
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                flex={1}
                maxW="220px"
                fontWeight="700"
                borderRadius="xl"
                border="2px solid"
                borderColor={useColorModeValue("blue.200", "blue.500")}
                boxShadow="md"
                _hover={{
                  bg: useColorModeValue("blue.50", "gray.600"),
                  borderColor: useColorModeValue("blue.300", "blue.400"),
                  boxShadow: "lg",
                }}
              >
                Open in Maps
              </MotionButton>
            </Tooltip>
          </HStack>
        </Box>
      )}
    </MotionBox>
  )
}

export default AttractionMap