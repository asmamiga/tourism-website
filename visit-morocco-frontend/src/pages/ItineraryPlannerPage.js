import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Image,
  AspectRatio,
  Badge,
  Icon,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  ButtonGroup,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  VStack,
  HStack,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Input
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaSave, FaShareAlt, FaPrint, FaMapMarkedAlt } from 'react-icons/fa';
import { FiGlobe, FiAward, FiDollarSign } from 'react-icons/fi';
import { StarIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
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
    end_date: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    days: [{ day_number: 1, items: [] }]
  });
  
  // Search state
  const [searchType, setSearchType] = useState('attractions');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Fetch all items on component mount
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        // Fetch all items based on the current search type
        const service = searchType === 'guides' ? guideService : businessService;
        // Build query parameters based on search type
        const params = {
          per_page: 100, // Get more items initially
          order_by: searchType === 'guides' ? 'first_name' : 'name',
          order_dir: 'asc',
          status: 'active' // Only get active guides
        };
        
        console.log(`Fetching ${searchType} with params:`, params);
        
        const response = await service.getAll(params);
        console.log(`Fetched all ${searchType}:`, response.data);
        
        // Extract items from the response
        let items = [];
        if (response?.data?.data && Array.isArray(response.data.data)) {
          items = response.data.data;
        } else if (Array.isArray(response?.data)) {
          items = response.data;
        }
        
        console.log(`Processed ${items.length} ${searchType} items`);
        
        // Generate first letters from all item names
        const letters = new Set();
        items.forEach(item => {
          let name = '';
          if (searchType === 'guides') {
            // Use the direct name field from the simplified API response
            name = item.name || '';
          } else {
            name = item.name || item.business_name || '';
          }
          const firstLetter = name[0]?.toUpperCase();
          if (firstLetter && /[A-Z]/.test(firstLetter)) {
            letters.add(firstLetter);
          }
        });
        
        console.log(`Generated ${letters.size} unique first letters`);
        
        setAllItems(items);
        setAvailableLetters(Array.from(letters).sort());
        setSearchResults(items);
        
        // Log the first few items for debugging
        console.log(`First few ${searchType}:`, items.slice(0, 3));
        console.log('Available first letters:', Array.from(letters).sort().join(', '));
        
      } catch (error) {
        console.error(`Error fetching ${searchType}:`, {
          message: error.message,
          error: error,
          response: error.response?.data,
          status: error.response?.status
        });
        
        toast({
          title: 'Error',
          description: `Failed to load ${searchType}. Please try again later.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchAllItems();
  }, [searchType]); // Re-run when searchType changes
  
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
  
  // Handle search by first letter
  const handleSearch = async (letter) => {
    if (!letter) {
      setSearchResults([]);
      return;
    }
    
    console.log('=== Starting search for letter:', letter, 'type:', searchType, '===');
    setIsSearching(true);
    setSearchQuery(letter);
    
    try {
      // Build query parameters based on search type
      let params = {
        order_by: searchType === 'guides' ? 'first_name' : 'name',
        order_dir: 'asc',
        per_page: 50,
      };
      
      // Add type-specific parameters
      if (searchType === 'attractions') {
        params = {
          ...params,
          'filter[name]': `${letter}%`,
          'filter[op]': 'like',
          include: 'city,photos'
        };
      } else if (searchType === 'businesses') {
        params = {
          ...params,
          'filter[name]': `${letter}%`,
          'filter[op]': 'like',
          include: 'city'
        };
      } else if (searchType === 'guides') {
        // For guides, we need to search by first_name
        params = {
          ...params,
          'filter[first_name]': `${letter}%`,
          'filter[op]': 'like',
          include: 'user,cities,services'
        };
      }
      
      console.log('Searching for attractions starting with:', letter);
      
      console.log('Making API request with params:', JSON.stringify(params, null, 2));
      
      // Make API call based on search type
      let response;
      switch (searchType) {
        case 'attractions':
          console.log('Calling attractionService.getAll()');
          response = await attractionService.getAll(params);
          break;
        case 'businesses':
          console.log('Calling businessService.getAll()');
          response = await businessService.getAll(params);
          break;
        case 'guides':
          console.log('Calling guideService.getAll()');
          response = await guideService.getAll(params);
          break;
        default:
          console.log('No valid search type selected');
          response = { data: { data: [] } };
      }
      
      console.log('=== Raw API Response ===');
      console.log('Response status:', response?.status);
      console.log('Response data:', response?.data);
      
      // Extract items from the response
      let items = [];
      
      // Handle the nested paginated response structure
      if (response?.data?.data?.data && Array.isArray(response.data.data.data)) {
        console.log('Found paginated response with items in response.data.data.data');
        items = response.data.data.data;
      }
      // Handle direct data array in response.data
      else if (Array.isArray(response?.data?.data)) {
        console.log('Found array response in response.data.data');
        items = response.data.data;
      }
      // Handle direct data array in response
      else if (Array.isArray(response?.data)) {
        console.log('Found direct array response in response.data');
        items = response.data;
      }
      // Handle single item response
      else if (response?.data) {
        console.log('Found single item response');
        items = [response.data];
      }
      
      console.log(`Extracted ${items.length} items`);
      
      if (items.length === 0) {
        console.warn('No items found in the response. Full response:', response);
        setSearchResults([]);
        toast({
          title: 'No results',
          description: `No ${searchType} found starting with '${letter}'.`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Log the first item structure for debugging
      console.log('First item structure:', JSON.stringify(items[0], null, 2));
      
      // Filter items to ensure they start with the exact letter (case-insensitive)
      const filteredItems = items.filter(item => {
        let itemName = '';
        
        if (searchType === 'guides') {
          // For guides, use the full_name from the user relationship
          itemName = (item.user?.first_name || '').trim().toUpperCase();
        } else {
          itemName = (item.name || item.business_name || '').trim().toUpperCase();
        }
        
        const searchLetter = letter.toUpperCase();
        return itemName.startsWith(searchLetter);
      });
      
      console.log(`Found ${filteredItems.length} items starting with '${letter}'`);
      
      // Transform the filtered items to match the expected format
      const results = filteredItems.map((item) => {
        if (searchType === 'guides') {
          // Handle guide-specific data transformation
          const guide = item;
          const user = guide.user || {};
          const firstCity = guide.cities?.[0];
          const firstService = guide.services?.[0];
          
          // Get the guide's photo URL
          let imageUrl = null;
          if (user.profile_photo_url) {
            imageUrl = user.profile_photo_url;
          } else if (user.profile_photo_path) {
            const cleanUrl = user.profile_photo_path.startsWith('/') 
              ? user.profile_photo_path.substring(1) 
              : user.profile_photo_path;
            imageUrl = `http://localhost:8000/storage/${cleanUrl}`;
          } else if (user.profile_picture) {
            const cleanUrl = user.profile_picture.startsWith('/')
              ? user.profile_picture.substring(1)
              : user.profile_picture;
            imageUrl = `http://localhost:8000/storage/${cleanUrl}`;
          } else {
            // Fallback to a default avatar with the guide's initials
            const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'G';
            imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=7F9CF5&color=fff`;
          }
          
          return {
            id: `guide-${guide.guide_id || guide.id}`,
            type: 'guide',
            name: user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : 'Unnamed Guide',
            location: firstCity?.name || firstService?.city?.name || 'Location not specified',
            city: firstCity?.name || firstService?.city?.name || 'Location not specified',
            description: guide.bio || 'No description available',
            experience_years: guide.experience_years,
            languages: guide.languages || [],
            specialties: guide.specialties || [],
            daily_rate: guide.daily_rate,
            is_available: guide.is_available,
            is_approved: guide.is_approved,
            image: imageUrl,
            rating: guide.average_rating || 0,
            reviewCount: guide.reviews_count || 0,
            rawData: process.env.NODE_ENV === 'development' ? guide : undefined
          };
        } else {
          // Handle other types (attractions, businesses)
          const primaryPhoto = item.photos?.find(p => p.is_primary) || 
                             item.photos?.[0] || 
                             null;
          
          // Build the image URL if available
          let imageUrl = null;
          if (primaryPhoto?.photo_url) {
            // Check if the URL is already absolute
            if (primaryPhoto.photo_url.startsWith('http')) {
              imageUrl = primaryPhoto.photo_url;
            } else {
              // Remove any leading slashes to ensure proper URL construction
              const cleanUrl = primaryPhoto.photo_url.replace(/^\/+/, '');
              imageUrl = `http://localhost:8000/storage/${cleanUrl}`;
            }
          }
          
          return {
            id: `${searchType.slice(0, -1)}-${item.attraction_id || item.id}`,
            type: searchType.slice(0, -1), // e.g., 'attraction' from 'attractions'
            name: item.name || item.business_name || `Unnamed ${searchType.slice(0, -1)}`,
            location: item.city?.name || 'Location not specified',
            city: item.city?.name || 'Location not specified',
            description: item.description || 'No description available',
            category: item.category,
            address: item.address,
            entrance_fee: item.entrance_fee,
            visit_duration: item.visit_duration,
            image: imageUrl,
            photos: item.photos || [],
            rating: item.rating || item.average_rating || 0,
            reviewCount: item.review_count || item.reviews_count || 0,
            rawData: process.env.NODE_ENV === 'development' ? item : undefined
          };
        }
      });
      
      console.log(`Processed ${results.length} results`);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: 'No results',
          description: `No ${searchType} found starting with '${letter}'. Try another letter.`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.log('First processed result:', results[0]);
      }
      
    } catch (err) {
      console.error('=== Search Error ===');
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        console.error('Response headers:', err.response.headers);
      } else if (err.request) {
        console.error('No response received. Request config:', err.request);
      }
      
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch search results. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
      console.log('=== Search completed ===');
    }
  };
  
  // Handle title change
  const handleTitleChange = (e) => {
    setItinerary({ ...itinerary, title: e.target.value });
  };
  
  // Handle date change
  const handleDateChange = (e) => {
    setItinerary({ ...itinerary, [e.target.name]: e.target.value });
  };
  
  // Save itinerary function
  // const saveItinerary = async () => {
  //   setIsSaving(true);
  //   try {
  //     // Add your save logic here
  //     await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  //     setSaveSuccess(true);
  //     toast({
  //       title: 'Success',
  //       description: 'Itinerary saved successfully!',
  //       status: 'success',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to save itinerary. Please try again.',
  //       status: 'error',
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };
  
  // Handle print functionality
  const handlePrint = () => {
    // Create a print-specific stylesheet
    const printStyles = `
      @media print {
        body * {
          visibility: hidden;
        }
        .printable, .printable * {
          visibility: visible;
        }
        .printable {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
        }
        .no-print {
          display: none !important;
        }
        .itinerary-day {
          page-break-inside: avoid;
          break-inside: avoid;
          margin-bottom: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #000 !important;
        }
        a {
          text-decoration: none !important;
          color: #000 !important;
        }
      }
    `;
    
    // Create a style element for print styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = printStyles;
    
    // Create a clone of the printable content
    const printWindow = window.open('', '_blank');
    const printableContent = document.createElement('div');
    printableContent.className = 'printable';
    
    // Create print header
    const header = document.createElement('div');
    header.innerHTML = `
      <h1>${itinerary.title}</h1>
      <p><strong>Start Date:</strong> ${itinerary.start_date} | <strong>End Date:</strong> ${itinerary.end_date}</p>
      <p><strong>Printed on:</strong> ${new Date().toLocaleDateString()}</p>
      <hr style="border-top: 2px solid #000; margin: 10px 0 20px;">
    `;
    printableContent.appendChild(header);
    
    // Add each day's content
    const daysContainer = document.createElement('div');
    daysContainer.style.display = 'grid';
    daysContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    daysContainer.style.gap = '20px';
    
    itinerary.days.forEach((day, index) => {
      if (day.items.length > 0) {
        const dayElement = document.createElement('div');
        dayElement.className = 'itinerary-day';
        dayElement.style.border = '1px solid #ddd';
        dayElement.style.padding = '15px';
        dayElement.style.borderRadius = '8px';
        dayElement.style.marginBottom = '20px';
        
        let itemsHtml = `
          <h3 style="margin: 0 0 10px 0; color: #2D3748;">Day ${day.day_number}</h3>
          <div style="margin-left: 10px;">
        `;
        
        day.items.forEach(item => {
          itemsHtml += `
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
              <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
              <div style="font-size: 0.9em; color: #4A5568; margin-bottom: 5px;">
                <span style="background: ${getBadgeColor(item.type)}; color: white; padding: 2px 6px; border-radius: 12px; font-size: 0.75em; margin-right: 5px;">
                  ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </span>
                ${item.location}
              </div>
              ${item.notes ? `<div style="font-style: italic; font-size: 0.85em;">Notes: ${item.notes}</div>` : ''}
            </div>
          `;
        });
        
        itemsHtml += '</div>';
        dayElement.innerHTML = itemsHtml;
        daysContainer.appendChild(dayElement);
      }
    });
    
    printableContent.appendChild(daysContainer);
    
    // Add footer
    const footer = document.createElement('div');
    footer.style.marginTop = '30px';
    footer.style.textAlign = 'center';
    footer.style.fontSize = '0.8em';
    footer.style.color = '#666';
    footer.innerHTML = `
      <hr style="border-top: 1px solid #ddd; margin: 20px 0 10px;">
      <p>Generated by Visit Morocco Itinerary Planner</p>
      <p>${window.location.href}</p>
    `;
    printableContent.appendChild(footer);
    
    // Set up the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${itinerary.title} - Itinerary</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #2c3e50; 
              padding: 0;
              margin: 0;
              background: #f9f9f9;
            }
            @page { 
              size: A4; 
              margin: 15mm 10mm 15mm 10mm;
            }
            h1 { 
              color: #2c3e50 !important; 
              font-size: 28px;
              margin: 0 0 20px 0;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            h2 {
              color: #e67e22 !important;
              font-size: 20px;
              margin: 25px 0 15px 0;
            }
            h3 {
              color: #e67e22 !important;
              font-size: 18px;
              margin: 20px 0 10px 0;
            }
            .itinerary-day {
              background: white;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
              border-left: 4px solid #d4a76a;
            }
            .itinerary-day h3 {
              background: #f8f4ed;
              padding: 10px 15px;
              margin: -15px -15px 15px -15px;
              border-radius: 8px 8px 0 0;
              color: #a05d22 !important;
            }
          </style>
        </head>
        <body>
          ${printableContent.outerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 100);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  // Helper function to get badge color based on item type
  const getBadgeColor = (type) => {
    switch (type) {
      case 'attraction':
        return '#3182ce';
      case 'business':
        return '#38a169';
      case 'guide':
        return '#805ad5';
      default:
        return '#718096';
    }
  };
  
  // Add item to itinerary
  const addItemToDay = (dayIndex, item) => {
    const newDays = [...itinerary.days];
    const dayItems = newDays[dayIndex].items;
    
    // Check if item already exists in this day
    const existingItem = dayItems.find(dayItem => dayItem.id === item.id);
    if (existingItem) {
      toast({
        title: 'Item already added',
        description: 'This item is already in your itinerary for this day.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Add the item to the day
    const newItem = {
      ...item,
      id: `${item.type}-${item.id}-${Date.now()}`,
      startTime: '09:00',
      endTime: '10:00',
      notes: ''
    };
    
    dayItems.push(newItem);
    setItinerary({ ...itinerary, days: newDays });
    
    toast({
      title: 'Item added',
      description: `${item.name} has been added to day ${dayIndex + 1}`,
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

  // Get all itinerary items for map view
  const getAllItems = () => {
    return itinerary.days.flatMap(day => day.items);
  };

  return (
    <Box pt={20} pb={10}>
      <Container maxW="container.xl">
        {/* Header Section */}
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
            {/* <Button
              leftIcon={<FaSave />}
              colorScheme="green"
              onClick={saveItinerary}
              isLoading={isSaving}
            >
              Save
            </Button> */}
            <Button
              leftIcon={<FaPrint />}
              variant="outline"
              colorScheme="green"
              onClick={handlePrint}
              className="no-print"
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
        
        {/* Main Content */}
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
          {/* Search Panel */}
          <Box 
            flex="1" 
            bg="white"
            p={4}
            borderRadius="lg"
            boxShadow="md"
            height="fit-content"
            position={{ lg: 'sticky' }}
            top="20px"
          >
            <Heading as="h3" size="md" mb={4}>
              Add to Itinerary
            </Heading>
            
            <Box mb={4}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h4" size="sm">Search {searchType}</Heading>
                <ButtonGroup size="sm" isAttached>
                  <Button 
                    onClick={() => setSearchType('attractions')}
                    variant={searchType === 'attractions' ? 'solid' : 'outline'}
                    colorScheme="blue"
                  >
                    Attractions
                  </Button>
                  <Button 
                    onClick={() => setSearchType('businesses')}
                    variant={searchType === 'businesses' ? 'solid' : 'outline'}
                    colorScheme="green"
                  >
                    Businesses
                  </Button>
                  <Button 
                    onClick={() => setSearchType('guides')}
                    variant={searchType === 'guides' ? 'solid' : 'outline'}
                    colorScheme="purple"
                  >
                    Guides
                  </Button>
                </ButtonGroup>
              </Flex>
              
              <Box mb={4}>
                <Text mb={2} fontWeight="medium">Select starting letter:</Text>
                <Flex wrap="wrap" gap={2} mb={4}>
                  {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                    <Button
                      key={letter}
                      size="sm"
                      colorScheme={searchQuery === letter ? 'green' : 'gray'}
                      onClick={() => handleSearch(letter)}
                      minW="30px"
                      p={1}
                    >
                      {letter}
                    </Button>
                  ))}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    Clear
                  </Button>
                </Flex>
              </Box>
              
              {isSearching && (
                <Flex justify="center" py={4}>
                  <Spinner color="green.500" />
                </Flex>
              )}
            </Box>
            
            {/* Search Results */}
            {searchQuery && !isSearching ? (
              <ItinerarySearchResults
                results={searchResults}
                addItemToDay={addItemToDay}
                days={itinerary.days}
              />
            ) : !searchQuery ? (
              <Flex 
                justify="center" 
                align="center" 
                height="200px" 
                bg="gray.50" 
                borderRadius="md"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="gray.200"
              >
                <Text color="gray.500">
                  Select a letter to browse {searchType}
                </Text>
              </Flex>
            ) : null}
          </Box>
          
          {/* Itinerary Section */}
          <Box flex="2">
            {itinerary.days.map((day, dayIndex) => (
              <ItineraryDay
                key={`day-${dayIndex}`}
                day={day}
                dayIndex={dayIndex}
                removeItem={(itemIndex) => removeItemFromDay(dayIndex, itemIndex)}
              />
            ))}
          </Box>
        </Flex>
        
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
      </Container>
    </Box>
  );
};

export default ItineraryPlannerPage;