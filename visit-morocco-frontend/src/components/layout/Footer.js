import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
  Flex,
  Input,
  Button,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <Box
      bg="brand.dark"
      color="white"
      position="relative"
      overflow="hidden"
      pt={10}
    >
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-50px"
        right="10%"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="rgba(255,255,255,0.03)"
      />
      <Box
        position="absolute"
        bottom="20%"
        left="5%"
        w="150px"
        h="150px"
        borderRadius="full"
        bg="rgba(255,255,255,0.03)"
      />
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 2fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Flex align="center" mb={2}>
              <Box
                w="40px"
                h="40px"
                bg="brand.primary"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
                fontSize="xl"
                mr={3}
              >
                M
              </Box>
              <Heading 
                as="h3" 
                size="lg" 
                bgGradient="linear(to-r, brand.primary, brand.secondary)" 
                bgClip="text"
                fontWeight="800"
              >
                Visit Morocco
              </Heading>
            </Flex>
            <Text fontSize={'md'} color="gray.300" lineHeight="1.7" mb={4}>
              Discover authentic Moroccan experiences with our comprehensive tourism platform.
              Connect with local businesses, professional guides, and plan your perfect Moroccan adventure.
            </Text>
            <Stack direction={'row'} spacing={6}>
              <Link href={'#'} isExternal>
                <Box 
                  bg="rgba(255,255,255,0.1)" 
                  p={2} 
                  borderRadius="full" 
                  transition="all 0.3s ease"
                  _hover={{ 
                    bg: 'brand.primary', 
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  <Icon as={FaTwitter} w={5} h={5} color="white" />
                </Box>
              </Link>
              <Link href={'#'} isExternal>
                <Box 
                  bg="rgba(255,255,255,0.1)" 
                  p={2} 
                  borderRadius="full" 
                  transition="all 0.3s ease"
                  _hover={{ 
                    bg: 'brand.primary', 
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  <Icon as={FaFacebook} w={5} h={5} color="white" />
                </Box>
              </Link>
              <Link href={'#'} isExternal>
                <Box 
                  bg="rgba(255,255,255,0.1)" 
                  p={2} 
                  borderRadius="full" 
                  transition="all 0.3s ease"
                  _hover={{ 
                    bg: 'brand.primary', 
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  <Icon as={FaInstagram} w={5} h={5} color="white" />
                </Box>
              </Link>
              <Link href={'#'} isExternal>
                <Box 
                  bg="rgba(255,255,255,0.1)" 
                  p={2} 
                  borderRadius="full" 
                  transition="all 0.3s ease"
                  _hover={{ 
                    bg: 'brand.primary', 
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  <Icon as={FaLinkedin} w={5} h={5} color="white" />
                </Box>
              </Link>
            </Stack>
          </Stack>
          <Stack align={'flex-start'}>
            <Heading as="h4" size="md" color="brand.accent" mb={4} fontWeight="600">
              Quick Links
            </Heading>
            <Stack spacing={3}>
              <Link 
                as={RouterLink} 
                to={'/'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                Home
              </Link>
              <Link 
                as={RouterLink} 
                to={'/businesses'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                Businesses
              </Link>
              <Link 
                as={RouterLink} 
                to={'/guides'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                Local Guides
              </Link>
              <Link 
                as={RouterLink} 
                to={'/attractions'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                Attractions
              </Link>
              <Link 
                as={RouterLink} 
                to={'/itinerary-planner'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                Plan Your Trip
              </Link>
            </Stack>
          </Stack>
          <Stack align={'flex-start'}>
            <Heading as="h4" size="md" color="brand.accent" mb={4} fontWeight="600">
              Support
            </Heading>
            <Stack spacing={3}>
              <Link 
                as={RouterLink} 
                to={'/about'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                About Us
              </Link>
              <Link 
                as={RouterLink} 
                to={'/contact'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                Contact
              </Link>
              <Link 
                as={RouterLink} 
                to={'/faq'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                FAQ
              </Link>
              <Link 
                as={RouterLink} 
                to={'/privacy-policy'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                Privacy Policy
              </Link>
              <Link 
                as={RouterLink} 
                to={'/terms'}
                _hover={{ color: 'brand.primary', transform: 'translateX(5px)' }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
              >
                <Box w="5px" h="5px" borderRadius="full" bg="brand.primary" mr={2} />
                Terms of Service
              </Link>
            </Stack>
          </Stack>
          <Stack align={'flex-start'}>
            <Heading as="h4" size="md" color="brand.accent" mb={4} fontWeight="600">
              Stay Updated
            </Heading>
            <Text color="gray.300" mb={4} lineHeight="1.7">
              Subscribe to our newsletter for travel tips and exclusive offers on Moroccan experiences.
            </Text>
            <Stack direction={'row'} width="100%">
              <Input
                placeholder={'Your email address'}
                bg="rgba(255,255,255,0.1)"
                color="white"
                border={0}
                borderRadius="md"
                _placeholder={{ color: 'gray.300' }}
                _focus={{
                  bg: 'rgba(255,255,255,0.2)',
                  boxShadow: '0 0 0 1px brand.primary',
                }}
                py={6}
              />
              <Button
                bg={'brand.primary'}
                color={'white'}
                _hover={{
                  bg: 'brand.accent',
                  transform: 'translateY(-2px)',
                  boxShadow: 'md'
                }}
                px={6}
                transition="all 0.3s ease"
              >
                Subscribe
              </Button>
            </Stack>
            <Stack spacing={4} mt={6}>
              <Flex align="center">
                <Box
                  p={2}
                  bg="rgba(255,255,255,0.1)"
                  borderRadius="md"
                  mr={3}
                >
                  <Icon as={FaEnvelope} color="brand.primary" />
                </Box>
                <Text color="gray.300">info@visitmorocco.com</Text>
              </Flex>
              <Flex align="center">
                <Box
                  p={2}
                  bg="rgba(255,255,255,0.1)"
                  borderRadius="md"
                  mr={3}
                >
                  <Icon as={FaPhone} color="brand.primary" />
                </Box>
                <Text color="gray.300">+212 5XX-XXXXXX</Text>
              </Flex>
              <Flex align="center">
                <Box
                  p={2}
                  bg="rgba(255,255,255,0.1)"
                  borderRadius="md"
                  mr={3}
                >
                  <Icon as={FaMapMarkerAlt} color="brand.primary" />
                </Box>
                <Text color="gray.300">Rabat, Morocco</Text>
              </Flex>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor="rgba(255,255,255,0.1)"
        mt={8}
      >
        <Container
          as={Stack}
          maxW={'container.xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Text opacity={0.8} fontSize="sm">© {new Date().getFullYear()} Visit Morocco. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            <Link 
              as={RouterLink} 
              to={'/privacy-policy'}
              fontSize="sm"
              opacity={0.8}
              _hover={{ color: 'brand.primary', opacity: 1 }}
              transition="all 0.3s ease"
            >
              Privacy
            </Link>
            <Link 
              as={RouterLink} 
              to={'/terms'}
              fontSize="sm"
              opacity={0.8}
              _hover={{ color: 'brand.primary', opacity: 1 }}
              transition="all 0.3s ease"
            >
              Terms
            </Link>
            <Link 
              as={RouterLink} 
              to={'/cookies'}
              fontSize="sm"
              opacity={0.8}
              _hover={{ color: 'brand.primary', opacity: 1 }}
              transition="all 0.3s ease"
            >
              Cookies
            </Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
