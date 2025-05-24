import React from 'react';
import {
  Box,
  Heading,
  Text,
  Image,
  Flex,
  Badge,
  Avatar,
  IconButton,
  Button,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FaHeart, FaComment, FaShare, FaBookmark } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const TravelStory = ({ story, onLike, onSave, isDetailed = false }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Default image if no photo available
  const defaultImage = 'https://images.unsplash.com/photo-1539020140153-e479b8c64e3c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg={useColorModeValue('white', 'gray.700')}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      _hover={{ boxShadow: 'lg' }}
      mb={6}
    >
      {/* Story Image */}
      <Box position="relative" height={isDetailed ? "400px" : "250px"} overflow="hidden">
        <Image
          src={story.cover_image || defaultImage}
          alt={story.title}
          objectFit="cover"
          width="100%"
          height="100%"
          transition="transform 0.5s ease"
          _hover={{ transform: 'scale(1.05)' }}
        />
        
        {/* Badges overlay */}
        <Flex 
          position="absolute" 
          top={4} 
          right={4} 
          direction="column" 
          align="flex-end"
          gap={2}
        >
          <Badge 
            colorScheme="green" 
            fontSize="sm" 
            px={3} 
            py={1} 
            borderRadius="full"
            bg="green.500"
            color="white"
          >
            {story.category}
          </Badge>
          
          {story.featured && (
            <Badge 
              colorScheme="orange" 
              fontSize="sm" 
              px={3} 
              py={1} 
              borderRadius="full"
              bg="orange.500"
              color="white"
            >
              Featured
            </Badge>
          )}
        </Flex>
      </Box>
      
      {/* Story Content */}
      <Box p={6}>
        <Heading as="h3" size="lg" mb={2}>
          {isDetailed ? (
            story.title
          ) : (
            <RouterLink to={`/travel-stories/${story.id}`}>
              {story.title}
            </RouterLink>
          )}
        </Heading>
        
        <Flex align="center" mb={4}>
          <Avatar 
            size="sm" 
            name={story.author.name} 
            src={story.author.avatar} 
            mr={2} 
          />
          <Box>
            <Text fontWeight="medium" fontSize="sm">
              {story.author.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatDate(story.published_date)}
            </Text>
          </Box>
        </Flex>
        
        {/* Locations */}
        <Flex wrap="wrap" gap={2} mb={4}>
          {story.locations.map(location => (
            <Badge key={location} colorScheme="blue" variant="subtle">
              {location}
            </Badge>
          ))}
        </Flex>
        
        {/* Story excerpt or full content */}
        <Text 
          noOfLines={isDetailed ? undefined : 3} 
          mb={4}
          color={useColorModeValue('gray.700', 'gray.300')}
        >
          {story.content}
        </Text>
        
        {!isDetailed && (
          <Button
            as={RouterLink}
            to={`/travel-stories/${story.id}`}
            variant="outline"
            colorScheme="green"
            size="sm"
            mb={4}
          >
            Read More
          </Button>
        )}
        
        <Divider mb={4} />
        
        {/* Engagement metrics */}
        <Flex justify="space-between" align="center">
          <Flex gap={4}>
            <Button
              leftIcon={<FaHeart />}
              size="sm"
              variant={story.liked ? "solid" : "ghost"}
              colorScheme="red"
              onClick={() => onLike && onLike(story.id)}
            >
              {story.likes}
            </Button>
            <Button
              leftIcon={<FaComment />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              as={RouterLink}
              to={`/travel-stories/${story.id}#comments`}
            >
              {story.comments}
            </Button>
          </Flex>
          
          <Flex gap={2}>
            <IconButton
              icon={<FaShare />}
              size="sm"
              variant="ghost"
              colorScheme="green"
              aria-label="Share story"
            />
            <IconButton
              icon={<FaBookmark />}
              size="sm"
              variant={story.saved ? "solid" : "ghost"}
              colorScheme="purple"
              aria-label="Save story"
              onClick={() => onSave && onSave(story.id)}
            />
          </Flex>
        </Flex>
      </Box>
    </MotionBox>
  );
};

export default TravelStory;
