import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  Icon,
  Stack,
  Divider,
  Button,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaStar, FaThumbsUp, FaFlag } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const MotionBox = motion(Box);

const ReviewItem = ({ review }) => {
  const { user } = useAuth();
  const [showFullContent, setShowFullContent] = useState(false);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Check if review content is long
  const isLongContent = review.content && review.content.length > 200;
  const displayContent = isLongContent && !showFullContent
    ? `${review.content.substring(0, 200)}...`
    : review.content;
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      mb={4}
    >
      <Flex mb={3}>
        <Avatar 
          src={review.user?.profile_picture ? `http://localhost:8000/storage/${review.user.profile_picture}` : null}
          name={review.user?.first_name ? `${review.user.first_name} ${review.user.last_name}` : 'Anonymous'}
          mr={3}
        />
        <Box>
          <Text fontWeight="bold">
            {review.user?.first_name ? `${review.user.first_name} ${review.user.last_name}` : 'Anonymous'}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {formatDate(review.created_at)}
          </Text>
        </Box>
      </Flex>
      
      <Flex mb={3}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            as={FaStar}
            color={i < review.rating ? 'brand.accent' : 'gray.300'}
            mr={1}
          />
        ))}
      </Flex>
      
      <Text mb={isLongContent ? 2 : 4}>
        {displayContent}
      </Text>
      
      {isLongContent && (
        <Button
          variant="link"
          color="brand.primary"
          mb={4}
          onClick={() => setShowFullContent(!showFullContent)}
        >
          {showFullContent ? 'Show less' : 'Read more'}
        </Button>
      )}
      
      <Flex justify="space-between" align="center">
        <Flex align="center">
          <Button
            size="sm"
            leftIcon={<FaThumbsUp />}
            variant="ghost"
            mr={2}
          >
            Helpful
          </Button>
          <Button
            size="sm"
            leftIcon={<FaFlag />}
            variant="ghost"
            colorScheme="red"
          >
            Report
          </Button>
        </Flex>
        
        {user && user.user_id === review.user_id && (
          <Button
            size="sm"
            colorScheme="red"
            variant="ghost"
          >
            Delete
          </Button>
        )}
      </Flex>
    </MotionBox>
  );
};

const GuideReviewList = ({ reviews }) => {
  const [visibleReviews, setVisibleReviews] = useState(5);
  
  const loadMoreReviews = () => {
    setVisibleReviews(prev => prev + 5);
  };
  
  if (!reviews || reviews.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Text fontSize="lg">No reviews yet. Be the first to leave a review!</Text>
      </Box>
    );
  }
  
  return (
    <Stack spacing={4}>
      {reviews.slice(0, visibleReviews).map(review => (
        <ReviewItem key={review.review_id} review={review} />
      ))}
      
      {visibleReviews < reviews.length && (
        <Button
          onClick={loadMoreReviews}
          variant="outline"
          colorScheme="green"
          alignSelf="center"
        >
          Load More Reviews
        </Button>
      )}
    </Stack>
  );
};

export default GuideReviewList;
