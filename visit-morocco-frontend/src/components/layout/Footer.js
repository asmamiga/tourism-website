"use client"
import { Link as RouterLink } from "react-router-dom"
import { Box, Container, Stack, SimpleGrid, Text, Link, Flex, Input, Button, Icon } from "@chakra-ui/react"
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa"
import { motion } from "framer-motion"

const MotionBox = motion(Box)

export default function Footer() {
  return (
    <Box position="relative" overflow="hidden">
      {/* Animated background */}
      <Box
        position="absolute"
        inset="0"
        bg="linear-gradient(135deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)"
        zIndex={0}
      />

      {/* Floating particles */}
      <Box position="absolute" inset="0" zIndex={1} pointerEvents="none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              background: "linear-gradient(45deg, #D2691E, #FFD700)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </Box>

      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-100px"
        right="10%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(210, 105, 30, 0.1) 0%, transparent 70%)"
        zIndex={1}
      />
      <Box
        position="absolute"
        bottom="20%"
        left="5%"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)"
        zIndex={1}
      />

      <Container as={Stack} maxW="container.xl" py={10} position="relative" zIndex={2}>
        <SimpleGrid templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 2fr" }} spacing={8}>
          {/* Brand Section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Stack spacing={6}>
              <Text fontSize="lg" fontWeight="bold" color="white">
                MoroccoExplorer
              </Text>
              <Text fontSize="sm" color="gray.400">
                Discover authentic Moroccan experiences with our comprehensive tourism platform. Connect with local
                businesses, professional guides, and plan your perfect Moroccan adventure.
              </Text>
              <Stack direction="row" spacing={6}>
                <Link href="#" isExternal>
                  <Icon as={FaTwitter} w={5} h={5} color="gray.400" _hover={{ color: "brand.primary" }} />
                </Link>
                <Link href="#" isExternal>
                  <Icon as={FaFacebook} w={5} h={5} color="gray.400" _hover={{ color: "brand.primary" }} />
                </Link>
                <Link href="#" isExternal>
                  <Icon as={FaInstagram} w={5} h={5} color="gray.400" _hover={{ color: "brand.primary" }} />
                </Link>
                <Link href="#" isExternal>
                  <Icon as={FaLinkedin} w={5} h={5} color="gray.400" _hover={{ color: "brand.primary" }} />
                </Link>
              </Stack>
            </Stack>
          </MotionBox>

          {/* Quick Links */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Stack align="flex-start">
              <Text fontWeight="500" fontSize="lg" mb={2} color="white">
                Quick Links
              </Text>
              <Link as={RouterLink} to="/" color="gray.400" _hover={{ color: "brand.primary" }}>
                Home
              </Link>
              <Link as={RouterLink} to="/businesses" color="gray.400" _hover={{ color: "brand.primary" }}>
                Businesses
              </Link>
              <Link as={RouterLink} to="/guides" color="gray.400" _hover={{ color: "brand.primary" }}>
                Local Guides
              </Link>
              <Link as={RouterLink} to="/attractions" color="gray.400" _hover={{ color: "brand.primary" }}>
                Attractions
              </Link>
              <Link as={RouterLink} to="/itinerary-planner" color="gray.400" _hover={{ color: "brand.primary" }}>
                Plan Your Trip
              </Link>
            </Stack>
          </MotionBox>

          {/* Support */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Stack align="flex-start">
              <Text fontWeight="500" fontSize="lg" mb={2} color="white">
                Support
              </Text>
              <Link as={RouterLink} to="/about" color="gray.400" _hover={{ color: "brand.primary" }}>
                About Us
              </Link>
              <Link as={RouterLink} to="/contact" color="gray.400" _hover={{ color: "brand.primary" }}>
                Contact
              </Link>
              <Link as={RouterLink} to="/faq" color="gray.400" _hover={{ color: "brand.primary" }}>
                FAQ
              </Link>
              <Link as={RouterLink} to="/privacy-policy" color="gray.400" _hover={{ color: "brand.primary" }}>
                Privacy Policy
              </Link>
              <Link as={RouterLink} to="/terms" color="gray.400" _hover={{ color: "brand.primary" }}>
                Terms of Service
              </Link>
            </Stack>
          </MotionBox>

          {/* Newsletter & Contact */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Stack align="flex-start">
              <Text fontWeight="500" fontSize="lg" mb={2} color="white">
                Stay Updated
              </Text>
              <Text fontSize="sm" color="gray.400" mb={4}>
                Subscribe to our newsletter for travel tips and exclusive offers.
              </Text>
              <Stack direction="row" width="100%">
                <Input
                  placeholder="Your email address"
                  bg="gray.800"
                  color="white"
                  border="1px solid"
                  borderColor="gray.600"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    bg: "gray.700",
                    borderColor: "brand.primary",
                  }}
                />
                <Button
                  bg="brand.primary"
                  color="white"
                  _hover={{
                    bg: "brand.secondary",
                  }}
                >
                  Subscribe
                </Button>
              </Stack>
              <Stack spacing={3} mt={6}>
                <Flex align="center">
                  <Icon as={FaEnvelope} color="brand.primary" mr={2} />
                  <Text fontSize="sm" color="gray.400">
                    info@visitmorocco.com
                  </Text>
                </Flex>
                <Flex align="center">
                  <Icon as={FaPhone} color="brand.primary" mr={2} />
                  <Text fontSize="sm" color="gray.400">
                    +212 5XX-XXXXXX
                  </Text>
                </Flex>
                <Flex align="center">
                  <Icon as={FaMapMarkerAlt} color="brand.primary" mr={2} />
                  <Text fontSize="sm" color="gray.400">
                    Rabat, Morocco
                  </Text>
                </Flex>
              </Stack>
            </Stack>
          </MotionBox>
        </SimpleGrid>
      </Container>

      <Box borderTopWidth={1} borderStyle="solid" borderColor="gray.700">
        <Container
          as={Stack}
          maxW="container.xl"
          py={4}
          direction={{ base: "column", md: "row" }}
          spacing={4}
          justify={{ base: "center", md: "space-between" }}
          align={{ base: "center", md: "center" }}
          position="relative"
          zIndex={2}
        >
          <Text fontSize="sm" color="gray.400">
            © {new Date().getFullYear()} MoroccoExplorer. All rights reserved
          </Text>
          <Stack direction="row" spacing={6}>
            <Link
              as={RouterLink}
              to="/privacy-policy"
              fontSize="sm"
              color="gray.400"
              _hover={{ color: "brand.primary" }}
            >
              Privacy
            </Link>
            <Link as={RouterLink} to="/terms" fontSize="sm" color="gray.400" _hover={{ color: "brand.primary" }}>
              Terms
            </Link>
            <Link as={RouterLink} to="/cookies" fontSize="sm" color="gray.400" _hover={{ color: "brand.primary" }}>
              Cookies
            </Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
