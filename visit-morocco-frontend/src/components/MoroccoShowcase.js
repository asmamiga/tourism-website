import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, Flex, Heading, useBreakpointValue } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useInView } from 'react-intersection-observer';

const cities = [
  {
    id: 1,
    name: 'Marrakech',
    image: 'https://images.unsplash.com/photo-1518544866339-f378a2136628?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: 'The Red City, known for its bustling souks and vibrant atmosphere.',
    stats: {
      population: '1.1M',
      bestTime: 'Mar-May, Sep-Nov',
      topAttractions: 'Jemaa el-Fnaa, Majorelle Garden, Bahia Palace'
    }
  },
  {
    id: 2,
    name: 'Chefchaouen',
    image: 'https://images.unsplash.com/photo-1526397751294-331021109fbd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: 'The Blue Pearl, famous for its striking blue-washed buildings.',
    stats: {
      population: '42,786',
      bestTime: 'Apr-Jun, Sep-Nov',
      topAttractions: 'Outa el Hammam Square, Spanish Mosque, Ras El Maa'
    }
  },
  {
    id: 3,
    name: 'Fes',
    image: 'https://images.unsplash.com/photo-1580502305112-9b2e3a3a0f1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: 'The cultural capital, home to the world\'s oldest university.',
    stats: {
      population: '1.2M',
      bestTime: 'Mar-May, Sep-Nov',
      topAttractions: 'Fes el Bali, Al Quaraouiyine, Chouara Tannery'
    }
  },
  {
    id: 4,
    name: 'Sahara Desert',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bad02e6bb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: 'Experience the magic of golden dunes and starry nights.',
    stats: {
      bestTime: 'Oct-Apr',
      temperature: '5°C - 38°C',
      topAttractions: 'Merzouga, Erg Chebbi, Camel Trekking'
    }
  },
  {
    id: 5,
    name: 'Casablanca',
    image: 'https://images.unsplash.com/photo-1564502332453-531719998965?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: 'Morocco\'s economic capital with a mix of modern and traditional.',
    stats: {
      population: '3.7M',
      bestTime: 'Apr-Jun, Sep-Oct',
      topAttractions: 'Hassan II Mosque, Corniche, Old Medina'
    }
  },
  {
    id: 6,
    name: 'Essaouira',
    image: 'https://images.unsplash.com/photo-1535338436102-7f8d3f8c8e3c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    description: 'A charming coastal town with a laid-back atmosphere.',
    stats: {
      population: '77,966',
      bestTime: 'May-Sep',
      topAttractions: 'Medina, Beach, Port, Skala de la Ville'
    }
  }
];

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const CityCard = ({ city, isActive, onSelect, index }) => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false
  });

  return (
    <MotionBox
      ref={ref}
      position="relative"
      minW={["300px", "400px", "500px"]}
      h={["400px", "450px", "500px"]}
      mx={4}
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: inView ? 1 : 0.8,
        y: inView ? 0 : 20,
        scale: isActive ? 1.05 : 0.9,
        zIndex: isActive ? 10 : 1
      }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      boxShadow={isActive ? "xl" : "md"}
    >
      <Box
        bgImage={`url(${city.image})`}
        bgSize="cover"
        bgPosition="center"
        w="100%"
        h="100%"
        position="relative"
      >
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={6}
          bgGradient="linear(to-t, blackAlpha.800, transparent)"
          color="white"
        >
          <Heading as="h3" size="lg" mb={2}>
            {city.name}
          </Heading>
          <Text fontSize="sm" noOfLines={2}>
            {city.description}
          </Text>
        </Box>
        {isActive && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            position="absolute"
            top={4}
            right={4}
            bg="white"
            color="brand.primary"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            fontWeight="bold"
          >
            Explore →
          </MotionBox>
        )}
      </Box>
    </MotionBox>
  );
};

const CityDetails = ({ city, isVisible }) => {
  if (!city) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20,
      }}
      transition={{ duration: 0.5 }}
      p={6}
      bg="white"
      borderRadius="xl"
      boxShadow="lg"
      mt={8}
    >
      <Heading as="h3" size="lg" mb={4} color="brand.primary">
        Discover {city.name}
      </Heading>
      <Text mb={6}>{city.description}</Text>
      
      <Flex direction={["column", "row"]} gap={6}>
        {Object.entries(city.stats).map(([key, value]) => (
          <Box key={key} flex="1">
            <Text fontWeight="bold" color="gray.600" textTransform="uppercase" fontSize="sm" mb={1}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Text>
            <Text>{value}</Text>
          </Box>
        ))}
      </Flex>
    </MotionBox>
  );
};

const ProgressDots = ({ count, activeIndex, onDotClick }) => {
  return (
    <Flex justify="center" mt={8} gap={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          as="button"
          w={3}
          h={3}
          borderRadius="full"
          bg={index === activeIndex ? "brand.primary" : "gray.200"}
          onClick={() => onDotClick(index)}
          _hover={{
            bg: index === activeIndex ? "brand.primary" : "brand.secondary",
          }}
          transition="all 0.3s"
        />
      ))}
    </Flex>
  );
};

export default function MoroccoShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const containerRef = useRef(null);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [showDetails, setShowDetails] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cities.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [autoPlay]);

  const handleSwipe = (direction) => {
    setAutoPlay(false);
    if (direction === 'left') {
      setActiveIndex((prev) => {
        const newIndex = (prev + 1) % cities.length;
        scrollToIndex(newIndex);
        return newIndex;
      });
    } else {
      setActiveIndex((prev) => {
        const newIndex = (prev - 1 + cities.length) % cities.length;
        scrollToIndex(newIndex);
        return newIndex;
      });
    }
    // Resume auto-play after interaction
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const scrollToIndex = (index) => {
    if (containerRef.current) {
      const container = containerRef.current;
      const cards = container.querySelectorAll('[data-city-card]');
      if (cards[index]) {
        cards[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    trackTouch: true,
    delta: 10, // Minimum distance before a swipe is detected
    swipeDuration: 500, // Maximum duration for a swipe
    touchEventOptions: { passive: true },
  });

  const handleDotClick = (index) => {
    setActiveIndex(index);
    scrollToIndex(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000); // Resume auto-play after 10s
  };

  const handleCardClick = (index) => {
    if (activeIndex === index) {
      setShowDetails(!showDetails);
    } else {
      setActiveIndex(index);
      setShowDetails(false);
    }
  };

  return (
    <Box py={16} position="relative" overflow="hidden">
      <Box maxW="7xl" mx="auto" px={[4, 6, 8]}>
        <Box textAlign="center" mb={12}>
          <Text color="brand.primary" fontWeight="bold" mb={2}>
            Explore Morocco
          </Text>
          <Heading as="h2" size="2xl" mb={4}>
            Discover Our Beautiful Cities
          </Heading>
          <Text maxW="2xl" mx="auto" color="gray.600">
            Experience the magic of Morocco through its most enchanting destinations.
          </Text>
        </Box>

        <Box position="relative">
          <Flex
            ref={(node) => {
              containerRef.current = node;
              swipeHandlers.ref(node);
            }}
            align="center"
            justify="flex-start"
            py={8}
            px={2}
            style={{
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              overflowX: 'auto',
              scrollSnapType: isMobile ? 'x mandatory' : 'none',
              cursor: 'grab',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
            _active={{ cursor: 'grabbing' }}
            {...swipeHandlers}
          >
            <AnimatePresence>
              {cities.map((city, index) => (
                <Box data-city-card key={city.id} style={{ scrollSnapAlign: 'center' }}>
                  <CityCard
                    city={city}
                    index={index}
                    isActive={index === activeIndex}
                    onSelect={() => handleCardClick(index)}
                  />
                </Box>
              ))}
            </AnimatePresence>
          </Flex>
        </Box>

        <ProgressDots
          count={cities.length}
          activeIndex={activeIndex}
          onDotClick={handleDotClick}
        />

        <CityDetails city={cities[activeIndex]} isVisible={showDetails} />
      </Box>
    </Box>
  );
}
