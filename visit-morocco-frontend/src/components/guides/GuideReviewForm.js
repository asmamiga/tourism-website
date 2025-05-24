import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Flex,
  Icon,
  Text,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { guideReviewService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MotionBox = motion(Box);

const GuideReviewForm = ({ guideId }) => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [review, setReview] = useState({
    rating: 0,
    content: '',
  });
  
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  
  // Check if user has already reviewed this guide
  useEffect(() => {
    const checkUserReview = async () => {
      try {
        // This would be replaced with an actual API call
        // For now, we'll simulate it with a timeout
        setTimeout(() => {
          // Simulated check - in a real app, you'd check against actual user reviews
          setHasReviewed(false);
        }, 500);
        
        // In a real implementation, you would use:
        // const response = await axios.get(`/api/guides/${guideId}/reviews/user`);
        // setHasReviewed(response.data.hasReviewed);
      } catch (err) {
        console.error('Error checking user review:', err);
      }
    };
    
    if (user) {
      checkUserReview();
    }
  }, [user, guideId]);
  
  const handleRatingClick = (rating) => {
    setReview({ ...review, rating });
  };
  
  const handleContentChange = (e) => {
    setReview({ ...review, content: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (review.rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (review.content.trim() === '') {
      setError('Please enter a review');
      return;
    }
    
    // Reset states
    setError(null);
    setLoading(true);
    
    try {
      // Prepare review data
      const reviewData = {
        guide_id: guideId,
        rating: review.rating,
        content: review.content,
      };
      
      // Submit review to API
      // In a real implementation, you would use:
      // await guideReviewService.create(reviewData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess(true);
      setHasReviewed(true);
      
      // Reset form
      setReview({
        rating: 0,
        content: '',
      });
      
      toast({
        title: 'Review Submitted',
        description: 'Thank you for sharing your experience with this guide!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
      
      toast({
        title: 'Submission Failed',
        description: err.response?.data?.message || 'Failed to submit review. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (hasReviewed) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        You have already reviewed this guide. Thank you for your feedback!
      </Alert>
    );
  }
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      as="form"
      onSubmit={handleSubmit}
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Share Your Experience with this Guide
      </Text>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert status="success" mb={4} borderRadius="md">
          <AlertIcon />
          Your review has been submitted successfully!
        </Alert>
      )}
      
      <FormControl id="rating" isRequired mb={4}>
        <FormLabel>Your Rating</FormLabel>
        <Flex>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              as={FaStar}
              boxSize={8}
              color={star <= (hoveredRating || review.rating) ? 'brand.accent' : 'gray.300'}
              cursor="pointer"
              mr={2}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              transition="color 0.2s ease"
            />
          ))}
        </Flex>
      </FormControl>
      
      <FormControl id="content" isRequired mb={4}>
        <FormLabel>Your Review</FormLabel>
        <Textarea
          value={review.content}
          onChange={handleContentChange}
          placeholder="Share details about your experience with this guide..."
          rows={5}
          resize="vertical"
        />
      </FormControl>
      
      <Button
        type="submit"
        colorScheme="green"
        isLoading={loading}
        loadingText="Submitting"
      >
        Submit Review
      </Button>
    </MotionBox>
  );
};

export default GuideReviewForm;
