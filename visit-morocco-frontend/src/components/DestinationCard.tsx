import React from 'react';
import {
  Box,
  Image,
  Heading,
  Text,
  Badge,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiMapPin, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface DestinationCardProps {
  name: string;
  image: string;
  description: string;
  location: string;
  rating?: number;
  priceRange?: string;
  tags?: string[];
  delay?: number;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  name,
  image,
  description,
  location,
  rating,
  priceRange,
  tags = [],
  delay = 0,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Box
        bg={bgColor}
        borderRadius="xl"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="md"
        transition="all 0.3s ease"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'lg',
        }}
      >
        <Box position="relative" h="200px">
          <Image
            src={image}
            alt={name}
            w="100%"
            h="100%"
            objectFit="cover"
            transition="transform 0.5s ease"
            _hover={{ transform: 'scale(1.05)' }}
          />
          {rating && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme="yellow"
              px={2}
              py={1}
              borderRadius="full"
            >
              <HStack spacing={1}>
                <Icon as={FiStar} />
                <Text>{rating.toFixed(1)}</Text>
              </HStack>
            </Badge>
          )}
        </Box>

        <VStack align="start" p={4} spacing={3}>
          <Heading size="md" fontWeight="semibold">
            {name}
          </Heading>
          
          <HStack color={textColor} fontSize="sm">
            <Icon as={FiMapPin} />
            <Text>{location}</Text>
          </HStack>

          <Text color={textColor} fontSize="sm" noOfLines={2}>
            {description}
          </Text>

          {tags.length > 0 && (
            <HStack spacing={2} wrap="wrap">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  colorScheme="blue"
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {tag}
                </Badge>
              ))}
            </HStack>
          )}

          {priceRange && (
            <Badge colorScheme="green" variant="subtle">
              {priceRange}
            </Badge>
          )}
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default DestinationCard; 