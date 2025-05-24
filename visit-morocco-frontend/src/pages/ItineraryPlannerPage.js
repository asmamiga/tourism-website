import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Select,
  IconButton,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaSave, FaShareAlt, FaPrint, FaMapMarkedAlt } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import { itineraryService, attractionService, businessService, guideService } from '../services/api';
import ItineraryMap from '../components/itinerary/ItineraryMap';
import ItineraryDay from '../components/itinerary/ItineraryDay';
import ItinerarySearchResults from '../components/itinerary/ItinerarySearchResults';

const ItineraryPlannerPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Itinerary state
  const [itinerary, setItinerary] = useState({
    title: 'My Morocco Trip',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days: [{ day_number: 1, items: [] }]
  });
  
  // Search state
  const [searchType, setSearchType] = useState('attractions');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Calculate number of days in itinerary based on start and end dates
  useEffect(() => {
    if (itinerary.start_date && itinerary.end_date) {
      const start = new Date(itinerary.start_date);
      const end = new Date(itinerary.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // Update days array if needed
      if (diffDays !== itinerary.days.length) {
        const newDays = [];
        for (let i = 0; i < diffDays; i++) {
          if (i < itinerary.days.length) {
            newDays.push(itinerary.days[i]);
          } else {
            newDays.push({ day_number: i + 1, items: [] });
          }
        }
        setItinerary({ ...itinerary, days: newDays });
      }
    }
  }, [itinerary.start_date, itinerary.end_date]);
  
  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      let results;
      
      // In a real implementation, you would use:
      // switch (searchType) {
      //   case 'attractions':
      //     results = await attractionService.getAll({ search: searchQuery });
      //     break;
      //   case 'businesses':
      //     results = await businessService.getAll({ search: searchQuery });
      //     break;
      //   case 'guides':
      //     results = await guideService.getAll({ search: searchQuery });
      //     break;
      // }
      
      // For now, we'll use mock data
      setTimeout(() => {
        let mockResults;
        
        if (searchType === 'attractions') {
          mockResults = [
            {
              id: 'a1',
              type: 'attraction',
              name: 'Jardin Majorelle',
              location: 'Marrakech',
              image: null,
              description: 'A two and half acre garden with a stunning cobalt blue villa.'
            },
            {
              id: 'a2',
              type: 'attraction',
              name: 'Hassan II Mosque',
              location: 'Casablanca',
              image: null,
              description: 'A stunning mosque on the coast featuring the world\'s tallest minaret.'
            },
            {
              id: 'a3',
              type: 'attraction',
              name: 'Chefchaouen Blue City',
              location: 'Chefchaouen',
              image: null,
              description: 'Known as the "Blue Pearl of Morocco," famous for its blue-washed buildings.'
            }
          ];
        } else if (searchType === 'businesses') {
          mockResults = [
            {
              id: 'b1',
              type: 'business',
              name: 'Riad Yasmine',
              location: 'Marrakech',
              image: null,
              description: 'Traditional Moroccan riad with a beautiful courtyard and pool.'
            },
            {
              id: 'b2',
              type: 'business',
              name: 'Café Clock',
              location: 'Fes',
              image: null,
              description: 'Cultural café serving Moroccan and fusion cuisine with regular events.'
            },
            {
              id: 'b3',
              type: 'business',
              name: 'Kasbah Tamadot',
              location: 'Atlas Mountains',
              image: null,
              description: 'Luxury hotel in the Atlas Mountains with stunning views.'
            }
          ];
        } else if (searchType === 'guides') {
          mockResults = [
            {
              id: 'g1',
              type: 'guide',
              name: 'Ahmed Benali',
              location: 'Marrakech',
              image: null,
              description: 'Experienced guide specializing in cultural and historical tours.'
            },
            {
              id: 'g2',
              type: 'guide',
              name: 'Fatima El Mansouri',
              location: 'Fes',
              image: null,
              description: 'Specializes in artisanal crafts and traditional Moroccan cooking.'
            },
            {
              id: 'g3',
              type: 'guide',
              name: 'Youssef Amrani',
              location: 'Merzouga',
              image: null,
              description: 'Desert expert with deep knowledge of Berber culture and traditions.'
            }
          ];
        }
        
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 1000);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setIsSearching(false);
    }
  };
  
  // Add item to itinerary
  const addItemToDay = (dayIndex, item) => {
    const newDays = [...itinerary.days];
    newDays[dayIndex].items.push({
      ...item,
      id: `${item.type}-${item.id}-${Date.now()}`, // Ensure unique ID
      notes: ''
    });
    setItinerary({ ...itinerary, days: newDays });
    
    toast({
      title: 'Item added',
      description: `Added ${item.name} to Day ${dayIndex + 1}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Remove item from itinerary
  const removeItemFromDay = (dayIndex, itemIndex) => {
    const newDays = [...itinerary.days];
    newDays[dayIndex].items.splice(itemIndex, 1);
    setItinerary({ ...itinerary, days: newDays });
  };
  
  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // If dropped in the same list
    if (source.droppableId === destination.droppableId) {
      const dayIndex = parseInt(source.droppableId.split('-')[1]);
      const newDays = [...itinerary.days];
      const items = [...newDays[dayIndex].items];
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      newDays[dayIndex].items = items;
      setItinerary({ ...itinerary, days: newDays });
    } 
    // If dropped in a different list
    else {
      const sourceDayIndex = parseInt(source.droppableId.split('-')[1]);
      const destDayIndex = parseInt(destination.droppableId.split('-')[1]);
      const newDays = [...itinerary.days];
      const sourceItems = [...newDays[sourceDayIndex].items];
      const destItems = [...newDays[destDayIndex].items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      newDays[sourceDayIndex].items = sourceItems;
      newDays[destDayIndex].items = destItems;
      setItinerary({ ...itinerary, days: newDays });
    }
  };
  
  // Save itinerary
  const saveItinerary = async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // In a real implementation, you would use:
      // await itineraryService.create(itinerary);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      
      toast({
        title: 'Itinerary saved',
        description: 'Your itinerary has been saved successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error saving itinerary:', err);
      setError('Failed to save itinerary. Please try again.');
      
      toast({
        title: 'Save failed',
        description: 'Failed to save itinerary. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle itinerary title change
  const handleTitleChange = (e) => {
    setItinerary({ ...itinerary, title: e.target.value });
  };
  
  // Handle date changes
  const handleDateChange = (e) => {
    setItinerary({ ...itinerary, [e.target.name]: e.target.value });
  };
  
  // Get all itinerary items for map view
  const getAllItems = () => {
    return itinerary.days.flatMap(day => day.items);
  };
  
  return (
    <Box py={10}>
      <Container maxW="container.xl">
        <Heading as="h1" mb={2}>Itinerary Planner</Heading>
        <Text mb={8} color="gray.600">
          Plan your perfect Moroccan adventure day by day
        </Text>
        
        {/* Itinerary Header */}
        <Flex 
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
          p={4}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
        >
          <Box mb={{ base: 4, md: 0 }}>
            <Input
              value={itinerary.title}
              onChange={handleTitleChange}
              fontWeight="bold"
              fontSize="xl"
              variant="flushed"
              mb={2}
            />
            <Flex gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium">Start Date</Text>
                <Input
                  type="date"
                  name="start_date"
                  value={itinerary.start_date}
                  onChange={handleDateChange}
                  size="sm"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium">End Date</Text>
                <Input
                  type="date"
                  name="end_date"
                  value={itinerary.end_date}
                  onChange={handleDateChange}
                  size="sm"
                />
              </Box>
            </Flex>
          </Box>
          
          <Flex gap={2}>
            <Button
              leftIcon={<FaSave />}
              colorScheme="green"
              onClick={saveItinerary}
              isLoading={loading}
            >
              Save
            </Button>
            <Button
              leftIcon={<FaShareAlt />}
              variant="outline"
              colorScheme="green"
            >
              Share
            </Button>
            <Button
              leftIcon={<FaPrint />}
              variant="outline"
              colorScheme="green"
            >
              Print
            </Button>
            <Button
              leftIcon={<FaMapMarkedAlt />}
              variant="outline"
              colorScheme="green"
              onClick={onOpen}
            >
              Map View
            </Button>
          </Flex>
        </Flex>
        
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert status="success" mb={4}>
            <AlertIcon />
            Itinerary saved successfully!
          </Alert>
        )}
        
        {/* Main Content */}
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
          {/* Itinerary Days */}
          <Box flex="3" order={{ base: 2, lg: 1 }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              {itinerary.days.map((day, dayIndex) => (
                <ItineraryDay
                  key={`day-${dayIndex}`}
                  day={day}
                  dayIndex={dayIndex}
                  removeItem={(itemIndex) => removeItemFromDay(dayIndex, itemIndex)}
                />
              ))}
            </DragDropContext>
          </Box>
          
          {/* Search Panel */}
          <Box 
            flex="1" 
            order={{ base: 1, lg: 2 }}
            bg="white"
            p={4}
            borderRadius="lg"
            boxShadow="md"
            height="fit-content"
            position="sticky"
            top="20px"
          >
            <Heading as="h3" size="md" mb={4}>
              Add to Itinerary
            </Heading>
            
            <Tabs colorScheme="green" isFitted mb={4}>
              <TabList>
                <Tab onClick={() => setSearchType('attractions')}>Attractions</Tab>
                <Tab onClick={() => setSearchType('businesses')}>Businesses</Tab>
                <Tab onClick={() => setSearchType('guides')}>Guides</Tab>
              </TabList>
            </Tabs>
            
            <Flex mb={4}>
              <Input
                placeholder={`Search ${searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                mr={2}
              />
              <Button
                colorScheme="green"
                onClick={handleSearch}
                isLoading={isSearching}
              >
                Search
              </Button>
            </Flex>
            
            {isSearching ? (
              <Flex justify="center" py={10}>
                <Spinner color="brand.primary" />
              </Flex>
            ) : (
              <ItinerarySearchResults
                results={searchResults}
                addItemToDay={addItemToDay}
                days={itinerary.days}
              />
            )}
          </Box>
        </Flex>
      </Container>
      
      {/* Map Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Itinerary Map View</DrawerHeader>
          
          <DrawerBody>
            <ItineraryMap items={getAllItems()} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default ItineraryPlannerPage;
