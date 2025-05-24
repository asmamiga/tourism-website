import React, { useState, useEffect } from 'react';
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
import { businessReviewService } from '../../services/api';
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

const ReviewList = ({ businessId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleReviews, setVisibleReviews] = useState(5);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // This would be replaced with an actual API call to get reviews for a specific business
        // For now, we'll simulate it with a timeout
        setTimeout(() => {
          // Simulated reviews data
          const mockReviews = [
            {
              review_id: 1,
              business_id: businessId,
              user_id: 1,
              rating: 5,
              content: "Amazing experience! The staff was incredibly friendly and the atmosphere was perfect. I would definitely recommend this place to anyone visiting Morocco.",
              created_at: "2025-04-15T14:30:00Z",
              user: {
                first_name: "John",
                last_name: "Doe",
                profile_picture: null
              }
            },
            {
              review_id: 2,
              business_id: businessId,
              user_id: 2,
              rating: 4,
              content: "Great place with authentic Moroccan cuisine. The tagine was delicious and the mint tea was refreshing. The only downside was the wait time, but it was worth it.",
              created_at: "2025-04-10T18:45:00Z",
              user: {
                first_name: "Jane",
                last_name: "Smith",
                profile_picture: null
              }
            },
            {
              review_id: 3,
              business_id: businessId,
              user_id: 3,
              rating: 5,
              content: "One of the best experiences I had in Morocco. The service was exceptional and the food was outstanding. I'll definitely be coming back next time I visit.",
              created_at: "2025-04-05T12:15:00Z",
              user: {
                first_name: "Michael",
                last_name: "Johnson",
                profile_picture: null
              }
            }
          ];
          
          setReviews(mockReviews);
          setLoading(false);
        }, 1000);
        
        // In a real implementation, you would use:
        // const response = await axios.get(`/api/businesses/${businessId}/reviews`);
        // setReviews(response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [businessId]);
  
  const loadMoreReviews = () => {
    setVisibleReviews(prev => prev + 5);
  };
  
  if (loading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.primary"
          size="lg"
        />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  if (reviews.length === 0) {
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

export default ReviewList;
