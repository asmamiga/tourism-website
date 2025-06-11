import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Image,
  Badge,
  Heading,
  Text,
  Flex,
  Icon,
  useColorModeValue,
  AspectRatio,
  Skeleton,
  Link,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { FaStar, FaMapMarkerAlt, FaPhone, FaGlobe, FaRegClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const BusinessCard = ({ business, isLoading = false }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('brand.primary', 'brand.accent');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="xl"
        overflow="hidden"
        bg={cardBg}
        boxShadow="sm"
        _hover={{ boxShadow: 'md' }}
        transition="all 0.3s"
        h="100%"
        display="flex"
        flexDirection="column"
      >
        <AspectRatio ratio={16 / 9} w="100%">
          <Skeleton />
        </AspectRatio>
        <Box p={4} flex={1} display="flex" flexDirection="column">
          <Skeleton height="24px" width="70%" mb={2} />
          <Skeleton height="16px" width="50%" mb={4} />
          <Skeleton height="40px" mb={4} />
          <Box mt="auto">
            <Skeleton height="32px" />
          </Box>
        </Box>
      </Box>
    );
  }

  // Generate a unique key for the image URL to force refresh on prop changes
  const imageUrl = business.photos?.[0]?.url || 
    `https://source.unsplash.com/random/800x600/?morocco,${business.category?.name || 'travel'}&${business.business_id}`;
  
  // Format business hours for display
  const formatHours = (hours) => {
    if (!hours) return 'Hours not available';
    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const todayHours = hours[today];
      if (!todayHours || !todayHours.open) return 'Closed today';
      return `Open ${todayHours.open} - ${todayHours.close}`;
    } catch (e) {
      return 'Hours not available';
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, type: 'spring' }}
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      bg={cardBg}
      boxShadow="sm"
      _hover={{ 
        boxShadow: 'lg',
        borderColor: accentColor,
        '.business-image': {
          transform: 'scale(1.05)'
        }
      }}
      position="relative"
      h="100%"
      display="flex"
      flexDirection="column"
      borderColor={borderColor}
    >
      <Box position="relative" overflow="hidden" h="200px">
        <Box
          as={motion.div}
          className="business-image"
          h="100%"
          w="100%"
          bgImage={`url(${imageUrl})`}
          bgSize="cover"
          bgPosition="center"
          transition="transform 0.5s ease"
        />
        
        {business.is_featured && (
          <Badge
            position="absolute"
            top={3}
            right={3}
            zIndex={2}
            bgGradient="linear(to-r, brand.accent, brand.primary)"
            color="white"
            fontWeight="bold"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            boxShadow="lg"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <Box as="span" fontSize="xs">★</Box>
            Featured
          </Badge>
        )}
        
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="60px"
          bgGradient="linear(to-t, rgba(0,0,0,0.8) 0%, transparent 100%)"
        />
      </Box>
      
      <Box p={5} flex={1} display="flex" flexDirection="column">
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Heading
            as="h3"
            size="md"
            noOfLines={1}
            color={headingColor}
            fontWeight="600"
            flex={1}
          >
            {business.name}
          </Heading>
          
          {business.avg_rating > 0 && (
            <Flex 
              align="center" 
              bg="rgba(236, 201, 75, 0.1)" 
              px={2} 
              py={1} 
              borderRadius="md"
              ml={2}
            >
              <Icon as={FaStar} color="yellow.400" mr={1} />
              <Text fontSize="sm" fontWeight="600">
                {business.avg_rating.toFixed(1)}
              </Text>
            </Flex>
          )}
        </Flex>
        
        <Flex align="center" mb={3}>
          <Icon as={FaMapMarkerAlt} color="brand.primary" mr={2} />
          <Text fontSize="sm" color={textColor} noOfLines={1}>
            {business.city?.name || 'Location not specified'}
          </Text>
        </Flex>
        
        {business.hours && (
          <Flex align="center" mb={3}>
            <Icon as={FaRegClock} color="brand.primary" mr={2} />
            <Text fontSize="sm" color={textColor} noOfLines={1}>
              {formatHours(business.hours)}
            </Text>
          </Flex>
        )}
        
        <Text noOfLines={3} mb={4} color={textColor} fontSize="sm" lineHeight="tall">
          {business.description || 'No description available'}
        </Text>
        
        <Box mt="auto">
          <Flex justify="space-between" align="center">
            <Badge 
              colorScheme={business.category?.color || 'gray'}
              variant="subtle"
              textTransform="capitalize"
              px={2}
              py={1}
              borderRadius="md"
            >
              {business.category?.name || 'Uncategorized'}
            </Badge>
            
            <HStack spacing={2}>
              {business.phone && (
                <Tooltip label="Call business" aria-label="Call business">
                  <IconButton
                    as="a"
                    href={`tel:${business.phone}`}
                    icon={<FaPhone />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    aria-label="Call business"
                  />
                </Tooltip>
              )}
              
              {business.website && (
                <Tooltip label="Visit website" aria-label="Visit website">
                  <IconButton
                    as="a"
                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={<FaGlobe />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    aria-label="Visit website"
                  />
                </Tooltip>
              )}
              
              <Link
                as={RouterLink}
                to={`/businesses/${business.business_id}`}
                ml={2}
                color="brand.primary"
                fontWeight="600"
                fontSize="sm"
                _hover={{ textDecoration: 'underline' }}
              >
                View Details
              </Link>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </MotionBox>
  );
};

export default BusinessCard;
