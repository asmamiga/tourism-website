"use client"

import { useState, useEffect } from "react"
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure,
  Container,
  useColorModeValue,
} from "@chakra-ui/react"
import { HamburgerIcon, CloseIcon, ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons"
import { useAuth } from "../../context/AuthContext"
import { motion } from "framer-motion"

// Navigation items
const NAV_ITEMS = [
  {
    label: "Discover",
    children: [
      {
        label: "Cities & Regions",
        href: "/regions",
        description: "Explore Morocco's diverse regions"
      },
      {
        label: "Tourist Attractions",
        href: "/attractions",
        description: "Must-visit places in Morocco"
      },
      {
        label: "Cultural Experiences",
        href: "/experiences",
        description: "Immerse in Moroccan culture"
      }
    ]
  },
  {
    label: "Businesses",
    href: "/businesses"
  },
  {
    label: "Local Guides",
    href: "/guides"
  },
  {
    label: "Plan Your Trip",
    href: "/itinerary-planner"
  },
  {
    label: "Community",
    children: [
      {
        label: "Travel Stories",
        href: "/travel-stories",
        description: "Read and share travel experiences"
      },
      {
        label: "Discussion Forum",
        href: "/community-forum",
        description: "Connect with fellow travelers"
      }
    ]
  }
]

// Desktop Navigation Item
const DesktopNavItem = ({ navItem, isScrolled, isHomePage }) => {
  const { label, children, href } = navItem
  const linkColor = isScrolled || !isHomePage ? "gray.700" : "white"
  const hoverColor = isScrolled || !isHomePage ? "brand.primary" : "white"
  const bgColor = isHomePage ? 'rgba(0, 0, 0, 0.7)' : 'white'

  if (children) {
    return (
      <Popover trigger="hover" placement="bottom-start" isLazy>
        {({ isOpen }) => (
          <Box>
            <PopoverTrigger>
              <Button
                as="div"
                variant="ghost"
                rightIcon={<ChevronDownIcon />}
                color={linkColor}
                _hover={{
                  color: hoverColor,
                  bg: isScrolled || !isHomePage ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                }}
                _active={{
                  bg: isScrolled || !isHomePage ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                }}
                fontWeight={500}
                fontSize="md"
                h="40px"
                px={3}
                borderRadius="md"
              >
                {label}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              border={0}
              boxShadow="xl"
              bg={bgColor}
              p={2}
              rounded="lg"
              w="auto"
              minW="240px"
              zIndex="dropdown"
              backdropFilter="blur(10px)"
              _focus={{ boxShadow: 'xl' }}
            >
              <Stack spacing={1}>
                {children.map((child) => (
                  <DesktopSubNavItem 
                    key={child.label} 
                    {...child} 
                    isHomePage={isHomePage}
                  />
                ))}
              </Stack>
            </PopoverContent>
          </Box>
        )}
      </Popover>
    )
  }

  return (
    <Button
      as={RouterLink}
      to={href}
      variant="ghost"
      color={linkColor}
      _hover={{
        color: hoverColor,
        bg: isScrolled || !isHomePage ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
      }}
      _active={{
        bg: isScrolled || !isHomePage ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
      }}
      fontWeight={500}
      fontSize="md"
      h="40px"
      px={3}
      borderRadius="md"
    >
      {label}
    </Button>
  )
}

// Desktop Sub Navigation Item
const DesktopSubNavItem = ({ label, href, description, isHomePage }) => {
  const hoverBg = isHomePage ? 'rgba(255, 255, 255, 0.1)' : 'gray.50'
  const hoverColor = isHomePage ? 'white' : 'brand.600'
  const textColor = isHomePage ? 'white' : 'gray.800'
  const descColor = isHomePage ? 'gray.300' : 'gray.600'
  
  return (
    <Box
      as={RouterLink}
      to={href}
      role="group"
      display="block"
      p={3}
      rounded="md"
      _hover={{ 
        bg: hoverBg,
        textDecoration: 'none',
      }}
    >
      <Stack direction="row" align="center" spacing={4}>
        <Box flex={1}>
          <Text
            transition="all 0.2s"
            color={textColor}
            _groupHover={{ color: hoverColor }}
            fontWeight={500}
            fontSize="sm"
          >
            {label}
          </Text>
          {description && (
            <Text 
              fontSize="xs" 
              color={descColor}
              _groupHover={{ color: isHomePage ? 'gray.200' : 'brand.500' }}
              mt={1}
            >
              {description}
            </Text>
          )}
        </Box>
        <Flex
          transition="all 0.2s"
          transform="translateX(-4px)"
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify="flex-end"
          align="center"
        >
          <Icon 
            as={ChevronRightIcon} 
            w={4} 
            h={4} 
            color={hoverColor} 
          />
        </Flex>
      </Stack>
    </Box>
  )
}

// Mobile Navigation
const MobileNav = ({ isHomePage }) => {
  return (
    <Stack
      bg="white"
      p={4}
      display={{ md: 'none' }}
      borderRadius="lg"
      boxShadow="lg"
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} isHomePage={isHomePage} />
      ))}
    </Stack>
  )
}

// Mobile Navigation Item
const MobileNavItem = ({ label, children, href, isHomePage }) => {
  const { isOpen, onToggle } = useDisclosure()
  const textColor = isHomePage ? 'white' : 'gray.700'
  const hoverColor = isHomePage ? 'white' : 'brand.600'

  if (children) {
    return (
      <Stack spacing={2}>
        <Flex
          py={2}
          justify="space-between"
          align="center"
          _hover={{
            textDecoration: 'none',
          }}
          onClick={onToggle}
          cursor="pointer"
        >
          <Text
            fontWeight={500}
            color={textColor}
            _hover={{ color: hoverColor }}
          >
            {label}
          </Text>
          <Icon
            as={ChevronDownIcon}
            transition="all .25s ease-in-out"
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={4}
            h={4}
            color={textColor}
          />
        </Flex>

        <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
          <Stack
            pl={4}
            borderLeft={1}
            borderStyle="solid"
            borderColor={isHomePage ? 'rgba(255,255,255,0.1)' : 'gray.200'}
            align="start"
          >
            {children.map((child) => (
              <Box
                as={RouterLink}
                key={child.label}
                to={child.href}
                py={2}
                color={textColor}
                _hover={{ color: hoverColor, textDecoration: 'none' }}
              >
                {child.label}
              </Box>
            ))}
          </Stack>
        </Collapse>
      </Stack>
    )
  }

  return (
    <Box
      as={RouterLink}
      to={href}
      py={2}
      color={textColor}
      _hover={{
        textDecoration: 'none',
        color: hoverColor,
      }}
    >
      {label}
    </Box>
  )
}

// Main Header Component
export default function Header() {
  const { isOpen, onToggle } = useDisclosure()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      setScrolled(offset > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isHomePage = location.pathname === "/"
  const headerBg = isHomePage && !scrolled 
    ? 'transparent' 
    : 'rgba(255, 255, 255, 0.95)'
  const headerShadow = scrolled ? 'sm' : 'none'
  const logoColor = isHomePage && !scrolled ? 'white' : 'brand.900'

  return (
    <Box
      as="header"
      position="fixed"
      w="100%"
      zIndex="sticky"
      bg={headerBg}
      boxShadow={headerShadow}
      transition="all 0.3s ease"
      backdropFilter={isHomePage && !scrolled ? 'none' : 'blur(10px)'}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <Flex
          as="nav"
          align="center"
          justify="space-between"
          h="70px"
          py={2}
        >
          {/* Logo */}
          <Flex
            as="div"
            align="center"
            flexShrink={0}
            mr={10}
            onClick={() => navigate(user ? '/dashboard' : '/')}
            cursor="pointer"
          >
            <Text
              fontSize="xl"
              fontWeight="bold"
              color={logoColor}
              _hover={{ textDecoration: 'none' }}
            >
              MoroccoExplorer
            </Text>
          </Flex>

          {/* Desktop Navigation */}
          <Flex display={{ base: 'none', md: 'flex' }} flex={1} justify="center">
            <Stack direction="row" spacing={1}>
              {NAV_ITEMS.map((navItem) => (
                <DesktopNavItem 
                  key={navItem.label} 
                  navItem={navItem} 
                  isScrolled={scrolled}
                  isHomePage={isHomePage}
                />
              ))}
            </Stack>
          </Flex>

          {/* Auth Buttons - Desktop */}
          <Stack
            flex={{ base: 1, md: 0 }}
            justify="flex-end"
            direction="row"
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
          >
            {!user ? (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  color={isHomePage && !scrolled ? 'white' : 'gray.700'}
                  _hover={{
                    bg: isHomePage && !scrolled ? 'rgba(255, 255, 255, 0.1)' : 'gray.100',
                  }}
                >
                  Sign In
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  colorScheme="brand"
                  bgGradient="linear(to-r, brand.primary, brand.secondary)"
                  _hover={{
                    bgGradient: 'linear(to-r, brand.primary, brand.secondary)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  _active={{
                    bgGradient: 'linear(to-r, brand.primary, brand.secondary)',
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <Button
                onClick={logout}
                variant="ghost"
                color={isHomePage && !scrolled ? 'white' : 'gray.700'}
                _hover={{
                  bg: isHomePage && !scrolled ? 'rgba(255, 255, 255, 0.1)' : 'gray.100',
                }}
              >
                Sign Out
              </Button>
            )}
          </Stack>

          {/* Mobile menu button */}
          <Box display={{ base: 'flex', md: 'none' }} ml={2}>
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? (
                  <CloseIcon w={4} h={4} />
                ) : (
                  <HamburgerIcon w={6} h={6} />
                )
              }
              variant="ghost"
              aria-label="Toggle Navigation"
              color={isHomePage && !scrolled ? 'white' : 'gray.700'}
            />
          </Box>
        </Flex>
      </Container>

      {/* Mobile Navigation */}
      <Collapse in={isOpen} animateOpacity>
        <MobileNav isHomePage={isHomePage} />
      </Collapse>
    </Box>
  )
}