import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  Image,
  Container,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function Header() {
  const { isOpen, onToggle } = useDisclosure();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isHomePage = location.pathname === '/';

  return (
    <Box
      position={isHomePage ? 'absolute' : 'relative'}
      top={0}
      left={0}
      right={0}
      zIndex={10}
      bg={scrolled || !isHomePage ? 'white' : 'transparent'}
      color={scrolled || !isHomePage ? 'gray.600' : 'white'}
      boxShadow={scrolled || !isHomePage ? 'md' : 'none'}
      transition="all 0.3s ease"
    >
      <Container maxW="container.xl">
        <Flex
          minH={'60px'}
          py={{ base: 2 }}
          px={{ base: 4 }}
          align={'center'}
        >
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}
          >
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
              }
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
            />
          </Flex>
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                as={RouterLink}
                to="/"
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontFamily={'heading'}
                color={scrolled || !isHomePage ? 'brand.primary' : 'white'}
                fontWeight="bold"
                fontSize="xl"
                _hover={{
                  textDecoration: 'none',
                }}
              >
                <Flex align="center">
                  <Flex align="center">
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
                      mr={2}
                    >
                      M
                    </Box>
                    <Text 
                      fontSize="2xl" 
                      fontWeight="bold" 
                      bgGradient="linear(to-r, brand.primary, brand.secondary)" 
                      bgClip="text"
                      letterSpacing="wide"
                    >
                      Visit Morocco
                    </Text>
                  </Flex>
                </Flex>
              </Link>
            </MotionBox>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav scrolled={scrolled} isHomePage={isHomePage} />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}
          >
            {user ? (
              <>
                <Button
                  as={RouterLink}
                  to="/profile"
                  fontSize={'sm'}
                  fontWeight={400}
                  variant={'link'}
                  color={scrolled || !isHomePage ? 'gray.600' : 'white'}
                  _hover={{
                    color: 'brand.primary',
                  }}
                >
                  Profile
                </Button>
                <Button
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize={'sm'}
                  fontWeight={600}
                  color={'white'}
                  bg={'brand.primary'}
                  onClick={logout}
                  _hover={{
                    bg: 'brand.secondary',
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  fontSize={'sm'}
                  fontWeight={400}
                  variant={'link'}
                  color={scrolled || !isHomePage ? 'gray.600' : 'white'}
                  _hover={{
                    color: 'brand.primary',
                  }}
                >
                  Sign In
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize={'sm'}
                  fontWeight={600}
                  color={'white'}
                  bg={'brand.primary'}
                  _hover={{
                    bg: 'brand.secondary',
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Stack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav />
        </Collapse>
      </Container>
    </Box>
  );
}

const DesktopNav = ({ scrolled, isHomePage }) => {
  const linkColor = scrolled || !isHomePage ? 'gray.600' : 'white';
  const linkHoverColor = 'brand.primary';
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4} align="center">
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={navItem.isExternal ? 'a' : RouterLink}
                p={navItem.isHighlighted ? '8px 16px' : 2}
                href={navItem.isExternal ? navItem.href : undefined}
                to={!navItem.isExternal ? (navItem.href || '#') : undefined}
                target={navItem.isExternal ? '_blank' : undefined}
                rel={navItem.isExternal ? 'noopener noreferrer' : undefined}
                fontSize={'sm'}
                fontWeight={500}
                bg={navItem.isHighlighted ? 'brand.500' : 'transparent'}
                color={navItem.isHighlighted ? 'white' : linkColor}
                borderRadius="md"
                _hover={{
                  textDecoration: 'none',
                  bg: navItem.isHighlighted ? 'brand.600' : 'transparent',
                  color: navItem.isHighlighted ? 'white' : linkHoverColor,
                }}
                transition="all 0.2s"
              >
                {navItem.label}
                {navItem.children && (
                  <Icon
                    as={ChevronDownIcon}
                    transition={'all .25s ease-in-out'}
                    w={4}
                    h={4}
                    ml={1}
                    color={navItem.isHighlighted ? 'white' : 'inherit'}
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'0 4px 20px rgba(0,0,0,0.15)'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
                mt={2}
                zIndex={10}
                borderTop={'3px solid'}
                borderTopColor={'brand.primary'}
              >
                <Stack spacing={3}>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('brand.primary', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            color={'gray.700'}
            _groupHover={{ color: 'white' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text 
            fontSize={'sm'} 
            color={'gray.600'}
            _groupHover={{ color: 'white' }}
          >
            {subLabel}
          </Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'white'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem 
          key={navItem.label} 
          label={navItem.label}
          href={navItem.href}
          children={navItem.children}
          isHighlighted={navItem.isHighlighted}
          isExternal={navItem.isExternal}
        />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, isHighlighted = false, isExternal = false }) => {
  const { isOpen, onToggle } = useDisclosure();
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        as={isExternal ? 'a' : RouterLink}
        to={!isExternal ? (href || '#') : undefined}
        href={isExternal ? href : undefined}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        justify={'space-between'}
        align={'center'}
        bg={isHighlighted ? 'brand.500' : 'transparent'}
        color={isHighlighted ? 'white' : 'inherit'}
        px={4}
        py={3}
        borderRadius="md"
        _hover={{
          textDecoration: 'none',
          bg: isHighlighted ? 'brand.600' : 'gray.100',
        }}
        transition="all 0.2s"
      >
        <Text
          fontWeight={600}
          color={isHighlighted ? 'white' : textColor}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                as={RouterLink}
                py={2}
                to={child.href}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

// Navigation items
const NAV_ITEMS = [
  {
    label: 'Discover',
    children: [
      {
        label: 'Cities & Regions',
        subLabel: 'Explore Morocco\'s diverse regions',
        href: '/regions',
      },
      {
        label: 'Tourist Attractions',
        subLabel: 'Must-visit places in Morocco',
        href: '/attractions',
      },
    ],
  },
  {
    label: 'Businesses',
    href: '/businesses',
  },
  {
    label: 'Local Guides',
    href: '/guides',
  },
  {
    label: 'Plan Your Trip',
    href: '/itinerary-planner',
  },
  {
    label: 'Community',
    children: [
      {
        label: 'Travel Stories',
        subLabel: 'Read and share travel experiences',
        href: '/travel-stories',
      },
      {
        label: 'Discussion Forum',
        subLabel: 'Connect with fellow travelers',
        href: '/community-forum',
      },
    ],
  },
  {
    label: 'Flights',
    href: 'http://localhost:3001',
    isHighlighted: true,
    isExternal: true,
    target: '_blank',
    rel: 'noopener noreferrer'
  }
];

// For responsive design
const useBreakpointValue = (values) => {
  // This is a simplified version, in a real app you'd use Chakra's hook
  return values.md;
};
