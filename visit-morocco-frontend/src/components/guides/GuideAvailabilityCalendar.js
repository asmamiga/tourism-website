import React, { useState } from 'react';
import {
  Box,
  Grid,
  Text,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const GuideAvailabilityCalendar = ({ availability }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Function to get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Function to get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Function to check if a date is available
  const isDateAvailable = (date) => {
    const formattedDate = formatDate(date);
    const dateInfo = availability?.find(item => item.date === formattedDate);
    return dateInfo ? dateInfo.available : false;
  };
  
  // Get current month and year
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Get days in current month
  const daysInMonth = getDaysInMonth(year, month);
  
  // Get day of week for first day of month
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  // Generate calendar days
  const days = [];
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push(date);
  }
  
  // Get month name
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  
  // Function to go to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  
  // Function to go to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };
  
  return (
    <Box>
      {/* Calendar header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Box
          as="button"
          onClick={goToPreviousMonth}
          px={3}
          py={1}
          borderRadius="md"
          bg="gray.100"
          _hover={{ bg: 'gray.200' }}
        >
          &lt;
        </Box>
        
        <Text fontSize="xl" fontWeight="bold">
          {monthName} {year}
        </Text>
        
        <Box
          as="button"
          onClick={goToNextMonth}
          px={3}
          py={1}
          borderRadius="md"
          bg="gray.100"
          _hover={{ bg: 'gray.200' }}
        >
          &gt;
        </Box>
      </Flex>
      
      {/* Days of week */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2} mb={2}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Box
            key={day}
            textAlign="center"
            fontWeight="bold"
            py={2}
          >
            {day}
          </Box>
        ))}
      </Grid>
      
      {/* Calendar days */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2}>
        {days.map((date, index) => (
          <MotionBox
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.01 }}
            textAlign="center"
            py={2}
            borderRadius="md"
            bg={date ? (isDateAvailable(date) ? 'green.100' : 'red.100') : 'transparent'}
            color={date ? (isDateAvailable(date) ? 'green.800' : 'red.800') : 'transparent'}
            position="relative"
            _hover={date ? { transform: 'scale(1.05)', zIndex: 1 } : {}}
            transition="transform 0.2s"
          >
            {date && (
              <>
                <Text>{date.getDate()}</Text>
                {isDateAvailable(date) ? (
                  <Badge colorScheme="green" fontSize="xs" variant="subtle">
                    Available
                  </Badge>
                ) : (
                  <Badge colorScheme="red" fontSize="xs" variant="subtle">
                    Booked
                  </Badge>
                )}
              </>
            )}
          </MotionBox>
        ))}
      </Grid>
      
      {/* Legend */}
      <Flex mt={6} justify="center" gap={4}>
        <Flex align="center">
          <Box w={4} h={4} bg="green.100" borderRadius="md" mr={2}></Box>
          <Text fontSize="sm">Available</Text>
        </Flex>
        
        <Flex align="center">
          <Box w={4} h={4} bg="red.100" borderRadius="md" mr={2}></Box>
          <Text fontSize="sm">Booked</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default GuideAvailabilityCalendar;
