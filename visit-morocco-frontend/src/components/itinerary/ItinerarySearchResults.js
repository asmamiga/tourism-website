import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Image,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Divider,
  useColorModeValue,
  SimpleGrid,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaPlus, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ItinerarySearchResults = ({ results, addItemToDay, days }) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil((results?.length || 0) / itemsPerPage);
  
  // Calculate current items to display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = results?.slice(indexOfFirstItem, indexOfLastItem) || [];
  
  // Reset to first page when results change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [results]);
  
  // Define color mode value outside the map callback
  const bgColor = useColorModeValue('white', 'gray.700');
  // Default image if no photo available
  const defaultImage = 'https://images.unsplash.com/photo-1539020140153-e479b8c64e3c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
  
  // Get badge color based on item type
  const getBadgeColor = (type) => {
    if (!type) return 'gray';
    switch (String(type).toLowerCase()) {
      case 'attraction':
        return 'blue';
      case 'business':
        return 'green';
      case 'guide':
        return 'purple';
      default:
        return 'gray';
    }
  };
  
  if (!results || results.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Text color="gray.500">
          Search for attractions, businesses, or guides to add to your itinerary
        </Text>
      </Box>
    );
  }
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top of results when changing pages
    const resultsContainer = document.getElementById('search-results-container');
    if (resultsContainer) {
      resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Flex justify="center" mt={6} mb={4} gap={2}>
        <Button
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          leftIcon={<FaChevronLeft />}
          variant="outline"
        >
          Previous
        </Button>
        
        <Flex gap={1} align="center">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum = i + 1;
            if (currentPage > 3 && totalPages > 5) {
              if (currentPage < totalPages - 2) {
                pageNum = currentPage - 2 + i;
              } else {
                pageNum = totalPages - 4 + i;
              }
            }
            
            if (pageNum > totalPages) return null;
            
            return (
              <Button
                key={pageNum}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                colorScheme={currentPage === pageNum ? 'green' : 'gray'}
                variant={currentPage === pageNum ? 'solid' : 'outline'}
                minW="40px"
              >
                {pageNum}
              </Button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <Text mx={1}>...</Text>
          )}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <Button
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              variant="outline"
              minW="40px"
            >
              {totalPages}
            </Button>
          )}
        </Flex>
        
        <Button
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          rightIcon={<FaChevronRight />}
          variant="outline"
        >
          Next
        </Button>
      </Flex>
    );
  };

  return (
    <Box id="search-results-container">
      {currentItems.length > 0 ? (
        <>
          {currentItems.map((item) => (
            <MotionBox
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              mb={4}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              bg={bgColor}
              boxShadow="sm"
              _hover={{ boxShadow: 'md' }}
            >
              <Flex>
                <Box 
                  width="80px" 
                  height="80px" 
                  mr={3} 
                  borderRadius="md" 
                  overflow="hidden"
                  flexShrink={0}
                >
                  <Image
                    src={(() => {
                      // If item has a direct image URL, use it
                      if (item.image) return item.image;
                      
                      // If there are photos, try to use the primary or first one
                      if (item.photos?.length > 0) {
                        const photo = item.photos.find(p => p.is_primary) || item.photos[0];
                        if (photo?.photo_url) {
                          if (photo.photo_url.startsWith('http')) {
                            return photo.photo_url;
                          }
                          return `http://localhost:8000/storage/${photo.photo_url.replace(/^\/+/, '')}`;
                        }
                      }
                      
                      // Fallback to default image
                      return defaultImage;
                    })()}
                    alt={item.name || 'Item image'}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    fallbackSrc={defaultImage}
                    onError={(e) => {
                      console.error('Error loading image:', e.target.src);
                      // Try to fall back to default image if there was an error
                      if (e.target.src !== defaultImage) {
                        e.target.src = defaultImage;
                      }
                    }}
                  />
                </Box>
                
                <Box flex={1}>
                  <Flex justify="space-between" align="flex-start">
                    <Box>
                      <Flex align="center" mb={1}>
                        <Text fontWeight="bold" mr={2}>{item.name || 'Unnamed Item'}</Text>
                        {item?.type && (
                          <Badge colorScheme={getBadgeColor(item.type)} ml={1}>
                            {String(item.type).charAt(0).toUpperCase() + String(item.type).slice(1)}
                          </Badge>
                        )}
                      </Flex>
                      <Text fontSize="sm" color="gray.600" mb={1}>{item.location}</Text>
                      <Text fontSize="sm" noOfLines={2}>{item.description}</Text>
                    </Box>
                    
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<FaChevronDown />}
                        leftIcon={<FaPlus />}
                        iconSpacing={2}
                        colorScheme="green"
                        size="sm"
                        minW="100px"
                        px={4}
                        py={2}
                        pr={3}
                        fontSize="sm"
                        ml={2}
                      >
                        Add
                      </MenuButton>
                      <MenuList>
                        {days.map((day, index) => (
                          <MenuItem 
                            key={`day-${index}`} 
                            onClick={() => addItemToDay(index, item)}
                          >
                            Add to Day {day.day_number}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </Flex>
                </Box>
              </Flex>
            </MotionBox>
          ))}
          
          {/* Pagination Controls */}
          <PaginationControls />
        </>
      ) : (
        <Box textAlign="center" py={6}>
          <Text color="gray.500">
            No results found. Try a different search.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ItinerarySearchResults;