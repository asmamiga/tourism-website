import React from 'react';
import {
  Box,
  Heading,
  Text,
  Image,
  Flex,
  Badge,
  Button,
  Icon,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaClock, FaUsers, FaLanguage, FaMoneyBillWave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const MotionBox = motion(Box);

const GuideServiceCard = ({ service, guideName }) => {
  // Default image if no photo available
  const defaultImage = 'https://images.unsplash.com/photo-1596627116790-af6f96d60f2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
  const serviceImage = service.photo ? `http://localhost:8000/storage/${service.photo}` : defaultImage;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="md"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
      transition="all 0.3s ease"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box h="200px" overflow="hidden">
        <Image
          src={serviceImage}
          alt={service.name}
          objectFit="cover"
          w="100%"
          h="100%"
          transition="transform 0.5s ease"
          _hover={{ transform: 'scale(1.1)' }}
        />
      </Box>
      
      <Box p={5} flex="1" display="flex" flexDirection="column">
        <Heading as="h3" size="md" mb={2} noOfLines={2}>
          {service.name}
        </Heading>
        
        <Text noOfLines={3} mb={4} fontSize="sm" color="gray.600">
          {service.description}
        </Text>
        
        <Stack spacing={3} mt="auto" mb={4}>
          <Flex align="center">
            <Icon as={FaClock} color="brand.primary" mr={2} />
            <Text fontSize="sm">Duration: {service.duration}</Text>
          </Flex>
          
          <Flex align="center">
            <Icon as={FaMoneyBillWave} color="brand.primary" mr={2} />
            <Text fontSize="sm">Price: {service.price} MAD</Text>
          </Flex>
          
          <Flex align="center">
            <Icon as={FaUsers} color="brand.primary" mr={2} />
            <Text fontSize="sm">Max Group Size: {service.max_group_size} people</Text>
          </Flex>
          
          <Flex align="center">
            <Icon as={FaLanguage} color="brand.primary" mr={2} />
            <Flex wrap="wrap" gap={1}>
              {service.languages?.map((language, index) => (
                <Badge key={index} colorScheme="blue" fontSize="xs">
                  {language}
                </Badge>
              ))}
            </Flex>
          </Flex>
        </Stack>
        
        <Button
          as={RouterLink}
          to="#booking"
          colorScheme="green"
          size="sm"
          width="100%"
        >
          Book This Tour
        </Button>
      </Box>
    </MotionBox>
  );
};

export default GuideServiceCard;
