import React, { useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  Badge,
  Divider,
  useToast
} from '@chakra-ui/react';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();
  
  // Mock user data
  const [userData, setUserData] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    bio: "Travel enthusiast with a passion for exploring new cultures. I've visited 15 countries so far and Morocco is at the top of my list!",
    location: 'New York, USA',
    profileImage: 'https://source.unsplash.com/random/300x300/?portrait',
    joinDate: 'January 2023'
  });

  // Mock trips data
  const [trips, setTrips] = useState([
    {
      id: 1,
      title: 'Marrakech Adventure',
      date: 'March 2024',
      image: 'https://source.unsplash.com/random/300x200/?marrakech',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Coastal Tour: Casablanca to Essaouira',
      date: 'July 2024',
      image: 'https://source.unsplash.com/random/300x200/?essaouira',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Desert Expedition',
      date: 'October 2024',
      image: 'https://source.unsplash.com/random/300x200/?sahara',
      status: 'planning'
    }
  ]);

  // Mock bookings data
  const [bookings, setBookings] = useState([
    {
      id: 1,
      service: 'Sahara Desert 3-Day Tour',
      provider: 'Morocco Desert Expeditions',
      date: 'October 15-18, 2024',
      status: 'confirmed'
    },
    {
      id: 2,
      service: 'Guided Tour of Fes Medina',
      provider: 'Historical Fes Tours',
      date: 'July 22, 2024',
      status: 'confirmed'
    }
  ]);

  // Handler for updating profile information
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    setIsEditing(false);
    toast({
      title: 'Profile updated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
        {/* Profile Header */}
        <Flex 
          bg="teal.500" 
          color="white" 
          p={6} 
          direction={{ base: 'column', md: 'row' }}
          align="center"
        >
          <Avatar 
            size="xl" 
            src={userData.profileImage} 
            border="4px solid white"
            mr={{ base: 0, md: 6 }}
            mb={{ base: 4, md: 0 }}
          />
          
          <VStack align={{ base: 'center', md: 'start' }} flex="1" spacing={2}>
            <Heading size="lg">{userData.name}</Heading>
            <Text>{userData.location}</Text>
            <Text fontSize="sm">Member since {userData.joinDate}</Text>
          </VStack>
          
          <Button 
            onClick={() => setIsEditing(!isEditing)} 
            colorScheme="white" 
            variant="outline"
            mt={{ base: 4, md: 0 }}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Flex>
        
        {/* Profile Content */}
        <Tabs colorScheme="teal" p={6}>
          <TabList>
            <Tab>Profile</Tab>
            <Tab>My Trips</Tab>
            <Tab>Bookings</Tab>
          </TabList>
          
          <TabPanels>
            {/* Profile Tab */}
            <TabPanel>
              {isEditing ? (
                <Box as="form" onSubmit={handleProfileUpdate}>
                  <VStack spacing={4} align="start">
                    <FormControl id="name">
                      <FormLabel>Name</FormLabel>
                      <Input 
                        name="name" 
                        value={userData.name} 
                        onChange={handleChange} 
                      />
                    </FormControl>
                    
                    <FormControl id="email">
                      <FormLabel>Email</FormLabel>
                      <Input 
                        name="email" 
                        value={userData.email} 
                        onChange={handleChange} 
                      />
                    </FormControl>
                    
                    <FormControl id="location">
                      <FormLabel>Location</FormLabel>
                      <Input 
                        name="location" 
                        value={userData.location} 
                        onChange={handleChange} 
                      />
                    </FormControl>
                    
                    <FormControl id="bio">
                      <FormLabel>Bio</FormLabel>
                      <Textarea 
                        name="bio" 
                        value={userData.bio} 
                        onChange={handleChange} 
                        rows={4}
                      />
                    </FormControl>
                    
                    <Button type="submit" colorScheme="teal">Save Changes</Button>
                  </VStack>
                </Box>
              ) : (
                <VStack spacing={4} align="start">
                  <Box>
                    <Heading size="sm" mb={2}>About Me</Heading>
                    <Text>{userData.bio}</Text>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>Contact Information</Heading>
                    <Text><strong>Email:</strong> {userData.email}</Text>
                    <Text><strong>Location:</strong> {userData.location}</Text>
                  </Box>
                </VStack>
              )}
            </TabPanel>
            
            {/* Trips Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {trips.map(trip => (
                  <Card key={trip.id} overflow="hidden">
                    <Image 
                      src={trip.image} 
                      alt={trip.title} 
                      height="200px" 
                      objectFit="cover" 
                    />
                    <CardHeader pb={0}>
                      <Heading size="md">{trip.title}</Heading>
                    </CardHeader>
                    <CardBody py={2}>
                      <HStack>
                        <Text color="gray.600">{trip.date}</Text>
                        <Badge 
                          colorScheme={
                            trip.status === 'completed' ? 'green' : 
                            trip.status === 'upcoming' ? 'blue' : 'purple'
                          }
                        >
                          {trip.status}
                        </Badge>
                      </HStack>
                    </CardBody>
                    <CardFooter pt={0}>
                      <Button size="sm" colorScheme="teal" variant="outline">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>
            
            {/* Bookings Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {bookings.map(booking => (
                  <Box 
                    key={booking.id} 
                    p={4} 
                    borderWidth="1px" 
                    borderRadius="md"
                    borderColor="gray.200"
                  >
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Heading size="md">{booking.service}</Heading>
                        <Text>{booking.provider}</Text>
                        <Text color="gray.600">Date: {booking.date}</Text>
                      </VStack>
                      <Badge 
                        colorScheme={booking.status === 'confirmed' ? 'green' : 'orange'}
                        p={2}
                      >
                        {booking.status}
                      </Badge>
                    </Flex>
                    <Divider my={3} />
                    <HStack>
                      <Button size="sm" colorScheme="teal">View Details</Button>
                      {booking.status === 'confirmed' && (
                        <Button size="sm" variant="outline" colorScheme="red">
                          Cancel Booking
                        </Button>
                      )}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default ProfilePage;
