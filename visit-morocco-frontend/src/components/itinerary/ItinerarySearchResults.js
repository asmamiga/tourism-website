import React from 'react';
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
} from '@chakra-ui/react';
import { FaPlus, FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ItinerarySearchResults = ({ results, addItemToDay, days }) => {
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
  
  return (
    <Box>
      {results.map((item) => (
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
                src={item.image || defaultImage}
                alt={item.name}
                objectFit="cover"
                width="100%"
                height="100%"
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
                    colorScheme="green"
                    size="sm"
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
    </Box>
  );
};

export default ItinerarySearchResults;
