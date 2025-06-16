// Enhanced version of AttractionsPage with improved UI/UX

// 1. First, let's update the imports to include additional icons and components we'll need
import { FiChevronRight, FiMapPin, FiCompass, FiMap } from "react-icons/fi";

// 2. Add this at the beginning of the AttractionsPage component, right after the state declarations
const globalStyles = `
  /* Custom scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${useColorModeValue('#f1f1f1', '#2d3748')};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${useColorModeValue('#cbd5e0', '#4a5568')};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${useColorModeValue('#a0aec0', '#718096')};
  }
  
  /* Hide scrollbar but keep functionality */
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

// 3. Update the main container to include the global styles and improved layout
return (
  <Box bg={bgColor} minH="100vh" position="relative" overflowX="hidden">
    <style jsx global>{globalStyles}</style>
    <FloatingParticles />
    
    {/* Hero Section */}
    <Box 
      as="section"
      bgImage="linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1545420333-23f22bfd95d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')"
      bgSize="cover"
      bgPosition="center"
      color="white"
      py={{ base: 24, md: 32 }}
      position="relative"
      overflow="hidden"
    >
      <Container maxW="container.xl" position="relative">
        {/* Animated background elements */}
        <Box
          position="absolute"
          top="-50%"
          left="-50%"
          right="-50%"
          bottom="-50%"
          background="radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)"
          opacity={0.5}
          animation="pulse 15s infinite alternate"
          sx={{
            '@keyframes pulse': {
              '0%': { transform: 'scale(0.8)' },
              '100%': { transform: 'scale(1.2)' },
            },
          }}
        />
        
        {/* Rest of your hero section content */}
      </Container>
    </Box>

    {/* Rest of your component */}
  </Box>
);

// 4. Update the Map CTA section with the enhanced design
{/* Map CTA */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
>
  <Box
    mt={20}
    p={{ base: 8, md: 12 }}
    borderRadius="3xl"
    position="relative"
    overflow="hidden"
    bgGradient="linear(to-r, blue.600, blue.700)"
    color="white"
    boxShadow="xl"
    borderWidth="1px"
    borderColor="blue.500"
    _before={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 25%)',
      pointerEvents: 'none',
    }}
  >
    <Box position="relative" zIndex={1}>
      <VStack spacing={6} textAlign="center" maxW="3xl" mx="auto">
        <Box
          as={motion.div}
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box
            bg="rgba(255,255,255,0.15)"
            w="80px"
            h="80px"
            borderRadius="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={6}
          >
            <FiMap size={36} />
          </Box>
        </Box>
        
        <Box
          as={motion.div}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Heading size="xl" mb={4} color="white">
            Explore Morocco on Our Interactive Map
          </Heading>
          <Text fontSize="lg" opacity={0.9} maxW="2xl" mx="auto">
            Discover hidden gems, plan your perfect route, and experience the magic of Morocco with our interactive map.
          </Text>
        </Box>
        
        <Box
          as={motion.div}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          mt={4}
        >
          <Button 
            as={RouterLink}
            to="/attractions-map"
            colorScheme="white"
            variant="outline"
            size="lg"
            rightIcon={<FiCompass />}
            _hover={{
              bg: 'rgba(255, 255, 255, 0.1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.2)',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            px={8}
            py={6}
            fontSize="md"
            borderRadius="xl"
            borderWidth="2px"
            transition="all 0.2s"
          >
            Launch Map Explorer
          </Button>
        </Box>
      </VStack>
    </Box>
  </Box>
</motion.div>
