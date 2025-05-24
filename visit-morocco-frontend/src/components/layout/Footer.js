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
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTopWidth={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 2fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Heading as="h3" size="lg" color="brand.primary">
                Visit Morocco
              </Heading>
            </Box>
            <Text fontSize={'sm'}>
              Discover authentic Moroccan experiences with our comprehensive tourism platform.
              Connect with local businesses, professional guides, and plan your perfect Moroccan adventure.
            </Text>
            <Stack direction={'row'} spacing={6}>
              <Link href={'#'} isExternal>
                <Icon as={FaTwitter} w={6} h={6} color="brand.primary" _hover={{ color: 'brand.secondary' }} />
              </Link>
              <Link href={'#'} isExternal>
                <Icon as={FaFacebook} w={6} h={6} color="brand.primary" _hover={{ color: 'brand.secondary' }} />
              </Link>
              <Link href={'#'} isExternal>
                <Icon as={FaInstagram} w={6} h={6} color="brand.primary" _hover={{ color: 'brand.secondary' }} />
              </Link>
              <Link href={'#'} isExternal>
                <Icon as={FaLinkedin} w={6} h={6} color="brand.primary" _hover={{ color: 'brand.secondary' }} />
              </Link>
            </Stack>
          </Stack>
          <Stack align={'flex-start'}>
            <Heading as="h4" size="md" color="brand.primary" mb={2}>
              Quick Links
            </Heading>
            <Link as={RouterLink} to={'/'}>Home</Link>
            <Link as={RouterLink} to={'/businesses'}>Businesses</Link>
            <Link as={RouterLink} to={'/guides'}>Local Guides</Link>
            <Link as={RouterLink} to={'/attractions'}>Attractions</Link>
            <Link as={RouterLink} to={'/itinerary-planner'}>Plan Your Trip</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <Heading as="h4" size="md" color="brand.primary" mb={2}>
              Support
            </Heading>
            <Link as={RouterLink} to={'/about'}>About Us</Link>
            <Link as={RouterLink} to={'/contact'}>Contact</Link>
            <Link as={RouterLink} to={'/faq'}>FAQ</Link>
            <Link as={RouterLink} to={'/privacy-policy'}>Privacy Policy</Link>
            <Link as={RouterLink} to={'/terms'}>Terms of Service</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <Heading as="h4" size="md" color="brand.primary" mb={2}>
              Stay Updated
            </Heading>
            <Text>Subscribe to our newsletter for travel tips and exclusive offers.</Text>
            <Stack direction={'row'} width="100%">
              <Input
                placeholder={'Your email address'}
                bg={useColorModeValue('white', 'gray.800')}
                border={1}
                borderStyle={'solid'}
                borderColor={useColorModeValue('gray.200', 'gray.500')}
                _focus={{
                  bg: 'white',
                  borderColor: 'brand.primary',
                }}
              />
              <Button
                bg={'brand.primary'}
                color={'white'}
                _hover={{
                  bg: 'brand.secondary',
                }}
              >
                Subscribe
              </Button>
            </Stack>
            <Stack spacing={3} mt={4}>
              <Flex align="center">
                <Icon as={FaEnvelope} mr={2} color="brand.primary" />
                <Text>info@visitmorocco.com</Text>
              </Flex>
              <Flex align="center">
                <Icon as={FaPhone} mr={2} color="brand.primary" />
                <Text>+212 5XX-XXXXXX</Text>
              </Flex>
              <Flex align="center">
                <Icon as={FaMapMarkerAlt} mr={2} color="brand.primary" />
                <Text>Rabat, Morocco</Text>
              </Flex>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
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
          <Text>© {new Date().getFullYear()} Visit Morocco. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            <Link as={RouterLink} to={'/privacy-policy'}>Privacy</Link>
            <Link as={RouterLink} to={'/terms'}>Terms</Link>
            <Link as={RouterLink} to={'/cookies'}>Cookies</Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
