import React, { useEffect, useState } from 'react';
import { 
  Box, 
  SimpleGrid, 
  Image, 
  Text, 
  Heading, 
  VStack, 
  HStack, 
  Tag, 
  Spinner,
  Container,
  useToast,
  Badge
} from '@chakra-ui/react';
import { attractionService } from '../../services/api';

const AttractionsList = () => {
  const [attractions, setAttractions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setIsLoading(true);
        const response = await attractionService.getAll({
          per_page: 100,
          order_by: 'name',
          order_dir: 'asc',
          include: 'city,photos'
        });
        
        if (response?.data?.data) {
          setAttractions(response.data.data);
        } else {
          setError('No attractions found');
          toast({
            title: 'No attractions found',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error('Error fetching attractions:', err);
        setError('Failed to load attractions');
        toast({
          title: 'Error',
          description: 'Failed to load attractions. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttractions();
  }, [toast]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading attractions...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={8} textAlign="center">
        Explore Moroccan Attractions
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {attractions.map((attraction) => {
          const primaryPhoto = attraction.photos?.find(p => p.is_primary) || attraction.photos?.[0];
          const imageUrl = primaryPhoto?.photo_url 
            ? `http://localhost:8000/storage/${primaryPhoto.photo_url}`
            : 'https://via.placeholder.com/400x300?text=No+Image';
          
          return (
            <Box 
              key={attraction.attraction_id}
              borderWidth="1px" 
              borderRadius="lg" 
              overflow="hidden"
              boxShadow="md"
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              transition="all 0.2s"
            >
              <Image 
                src={imageUrl} 
                alt={attraction.name}
                h="200px"
                w="100%"
                objectFit="cover"
              />
              <VStack p={4} align="start" spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Heading size="md">{attraction.name}</Heading>
                  <Badge colorScheme="blue">
                    {attraction.city?.name || 'N/A'}
                  </Badge>
                </HStack>
                
                {attraction.category && (
                  <Tag colorScheme="teal" size="sm">
                    {attraction.category}
                  </Tag>
                )}
                
                <Text noOfLines={3} color="gray.600">
                  {attraction.description || 'No description available.'}
                </Text>
                
                <HStack w="100%" justify="space-between" pt={2}>
                  <Text fontSize="sm" color="blue.600" fontWeight="bold">
                    {attraction.entrance_fee 
                      ? `$${parseFloat(attraction.entrance_fee).toFixed(2)}` 
                      : 'Free Entry'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {attraction.visit_duration ? `${attraction.visit_duration} min` : ''}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Container>
  );
};

export default AttractionsList;
