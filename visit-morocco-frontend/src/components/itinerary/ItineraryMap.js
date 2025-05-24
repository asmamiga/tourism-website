import React, { useEffect, useState } from 'react';
import { Box, Text, Spinner, Flex, Badge, Heading } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in React
// This is needed because the default marker icons are loaded relative to the CSS file
// and React doesn't handle this properly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons for different types of items
const createCustomIcon = (type) => {
  let color;
  switch (type) {
    case 'attraction':
      color = 'blue';
      break;
    case 'business':
      color = 'green';
      break;
    case 'guide':
      color = 'purple';
      break;
    default:
      color = 'gray';
  }
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const ItineraryMap = ({ items }) => {
  const [loading, setLoading] = useState(true);
  const [mapItems, setMapItems] = useState([]);
  const [center, setCenter] = useState([31.7917, -7.0926]); // Morocco center
  const [zoom, setZoom] = useState(6);
  
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
  
  useEffect(() => {
    // In a real implementation, you would fetch coordinates for each item
    // For now, we'll use mock data with random coordinates around Morocco
    const mockCoordinates = {
      'a1': [31.6295, -7.9811], // Marrakech
      'a2': [33.5731, -7.5898], // Casablanca
      'a3': [35.1683, -5.2564], // Chefchaouen
      'b1': [31.6295, -7.9811], // Marrakech
      'b2': [34.0181, -5.0078], // Fes
      'b3': [31.2001, -7.8600], // Atlas Mountains
      'g1': [31.6295, -7.9811], // Marrakech
      'g2': [34.0181, -5.0078], // Fes
      'g3': [31.1636, -4.0071], // Merzouga
    };
    
    const itemsWithCoordinates = items.map(item => {
      const itemId = item.id.split('-')[1]; // Extract the original ID
      return {
        ...item,
        coordinates: mockCoordinates[itemId] || [
          31.7917 + (Math.random() - 0.5) * 2, // Random coordinates around Morocco
          -7.0926 + (Math.random() - 0.5) * 2
        ]
      };
    });
    
    setMapItems(itemsWithCoordinates);
    
    // If we have items, adjust the map view
    if (itemsWithCoordinates.length > 0) {
      // Calculate bounds to fit all markers
      const bounds = L.latLngBounds(itemsWithCoordinates.map(item => item.coordinates));
      const center = bounds.getCenter();
      setCenter([center.lat, center.lng]);
      
      // Adjust zoom level based on the number of items
      if (itemsWithCoordinates.length === 1) {
        setZoom(12);
      } else if (itemsWithCoordinates.length <= 3) {
        setZoom(8);
      } else {
        setZoom(6);
      }
    }
    
    setLoading(false);
  }, [items]);
  
  if (loading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner color="brand.primary" />
      </Flex>
    );
  }
  
  if (items.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Text>No items in your itinerary to display on the map.</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box height="500px" borderRadius="lg" overflow="hidden" mb={4}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mapItems.map((item) => (
            <Marker
              key={item.id}
              position={item.coordinates}
              icon={createCustomIcon(item.type)}
            >
              <Popup>
                <Box p={1}>
                  <Heading as="h4" size="sm" mb={1}>{item.name}</Heading>
                  <Flex align="center" mb={1}>
                    <Badge colorScheme={getBadgeColor(item.type)} mr={2}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Badge>
                    <Text fontSize="sm">{item.location}</Text>
                  </Flex>
                  {item.description && (
                    <Text fontSize="sm">{item.description}</Text>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
      
      <Box>
        <Heading as="h4" size="sm" mb={2}>Legend</Heading>
        <Flex gap={4}>
          <Flex align="center">
            <Badge colorScheme="blue" mr={1}>•</Badge>
            <Text fontSize="sm">Attractions</Text>
          </Flex>
          <Flex align="center">
            <Badge colorScheme="green" mr={1}>•</Badge>
            <Text fontSize="sm">Businesses</Text>
          </Flex>
          <Flex align="center">
            <Badge colorScheme="purple" mr={1}>•</Badge>
            <Text fontSize="sm">Guides</Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default ItineraryMap;
