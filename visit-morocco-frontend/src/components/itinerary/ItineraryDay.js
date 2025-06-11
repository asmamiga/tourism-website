import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  IconButton,
  Badge,
  VStack,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FaTrash, FaGripLines } from 'react-icons/fa';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ItineraryItem = ({ item, index, removeItem }) => {
  // Get badge color based on item type
  const getBadgeColor = (type) => {
    switch (type) {
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

  return (
    <Box
      mb={3}
      bg="white"
      borderWidth="1px"
      borderRadius="md"
      boxShadow="sm"
      p={3}
    >
      <Flex justify="space-between" align="center">
        <Box>
          <Flex align="center" mb={1}>
            <Text fontWeight="bold" mr={2}>{item.name}</Text>
            <Badge colorScheme={getBadgeColor(item.type)}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Badge>
          </Flex>
          <Text fontSize="sm" color="gray.600">{item.location}</Text>
        </Box>
        
        <IconButton
          aria-label="Remove item"
          icon={<FaTrash />}
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={() => removeItem(index)}
        />
      </Flex>
      
      {item.notes && (
        <Box mt={2}>
          <Text fontSize="sm" fontStyle="italic">
            Notes: {item.notes}
          </Text>
        </Box>
      )}
    </Box>
  );
};

const ItineraryDay = ({ day, dayIndex, removeItem }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box
      mb={6}
      p={4}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading as="h3" size="md" mb={4}>
        Day {day.day_number}
      </Heading>
      
      <Box minHeight="100px" p={2}>
        {day.items.length === 0 ? (
          <Flex
            justify="center"
            align="center"
            height="100px"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="gray.300"
            borderRadius="md"
          >
            <Text color="gray.500">
              Use the + button to add items to this day
            </Text>
          </Flex>
        ) : (
          <VStack spacing={3} align="stretch">
            {day.items.map((item, index) => (
              <ItineraryItem
                key={`${item.id}-${index}`}
                item={item}
                index={index}
                removeItem={removeItem}
              />
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default ItineraryDay;
