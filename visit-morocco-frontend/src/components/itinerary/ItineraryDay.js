import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  IconButton,
  Badge,
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
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          mb={3}
          bg={snapshot.isDragging ? 'gray.100' : 'white'}
          borderWidth="1px"
          borderRadius="md"
          boxShadow={snapshot.isDragging ? 'md' : 'sm'}
          p={3}
        >
          <Flex justify="space-between" align="center">
            <Flex align="center" flex={1}>
              <Box
                {...provided.dragHandleProps}
                mr={3}
                color="gray.400"
                cursor="grab"
              >
                <FaGripLines />
              </Box>
              
              <Box>
                <Flex align="center" mb={1}>
                  <Text fontWeight="bold" mr={2}>{item.name}</Text>
                  <Badge colorScheme={getBadgeColor(item.type)}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="gray.600">{item.location}</Text>
              </Box>
            </Flex>
            
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
            <Box mt={2} pl={7}>
              <Text fontSize="sm" fontStyle="italic">
                Notes: {item.notes}
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Draggable>
  );
};

const ItineraryDay = ({ day, dayIndex, removeItem }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
      mb={6}
      p={4}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading as="h3" size="md" mb={4}>
        Day {day.day_number}
      </Heading>
      
      <Droppable droppableId={`day-${dayIndex}`}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            minHeight="100px"
            bg={snapshot.isDraggingOver ? 'gray.100' : 'transparent'}
            borderRadius="md"
            transition="background-color 0.2s ease"
            p={2}
          >
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
                  Drag and drop items here or use the + button to add to this day
                </Text>
              </Flex>
            ) : (
              day.items.map((item, index) => (
                <ItineraryItem
                  key={item.id}
                  item={item}
                  index={index}
                  removeItem={removeItem}
                />
              ))
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </MotionBox>
  );
};

export default ItineraryDay;
