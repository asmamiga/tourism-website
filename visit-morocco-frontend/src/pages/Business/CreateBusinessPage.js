import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
  Heading,
  Text,
  useColorModeValue,
  FormErrorMessage,
  SimpleGrid,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  IconButton,
  HStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { businessService } from '../../services/api';
import { FiPlus } from 'react-icons/fi';

// Business categories
const BUSINESS_CATEGORIES = [
  'Restaurant', 'Cafe', 'Hotel', 'Riad', 'Spa', 'Hammam',
  'Tour Operator', 'Car Rental', 'Souvenir Shop', 'Art Gallery',
  'Adventure', 'Desert Camp', 'Cooking Class', 'Cultural Experience'
];

const CreateBusinessPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    website: '',
    opening_hours: '',
    price_range: '$$',
    categories: []
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !selectedCategories.includes(newCategory.trim())) {
      const updatedCategories = [...selectedCategories, newCategory.trim()];
      setSelectedCategories(updatedCategories);
      setFormData(prev => ({
        ...prev,
        categories: updatedCategories
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category) => {
    const updatedCategories = selectedCategories.filter(cat => cat !== category);
    setSelectedCategories(updatedCategories);
    setFormData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (selectedCategories.length === 0) newErrors.categories = 'Please select at least one category';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await businessService.create(formData);
      
      toast({
        title: 'Business created!',
        description: 'Your business has been successfully created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to the business dashboard or details page
      navigate(`/business/${response.data.id}`);
    } catch (error) {
      console.error('Error creating business:', error);
      
      toast({
        title: 'Error creating business',
        description: error.response?.data?.message || 'Failed to create business. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box maxW="container.md" mx="auto" py={8} px={4}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Create a New Business
          </Heading>
          <Text color="gray.500">
            Add your business to our platform and start reaching more customers
          </Text>
        </Box>

        <Box 
          bg={bgColor} 
          p={6} 
          borderRadius="lg" 
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              {/* Basic Information */}
              <Box w="100%">
                <Heading size="md" mb={4}>Basic Information</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.name}>
                    <FormLabel>Business Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter business name"
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Price Range</FormLabel>
                    <Select
                      name="price_range"
                      value={formData.price_range}
                      onChange={handleInputChange}
                    >
                      <option value="$">$ - Inexpensive</option>
                      <option value="$$">$$ - Moderate</option>
                      <option value="$$$">$$$ - Pricey</option>
                      <option value="$$$$">$$$$ - High End</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Description */}
              <FormControl isRequired isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about your business..."
                  rows={4}
                />
                <FormErrorMessage>{errors.description}</FormErrorMessage>
              </FormControl>

              {/* Categories */}
              <FormControl isRequired isInvalid={!!errors.categories}>
                <FormLabel>Business Categories</FormLabel>
                <VStack align="stretch" spacing={2}>
                  <HStack>
                    <Select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Select a category"
                    >
                      {BUSINESS_CATEGORIES
                        .filter(cat => !selectedCategories.includes(cat))
                        .map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </Select>
                    <IconButton
                      icon={<FiPlus />}
                      onClick={handleAddCategory}
                      aria-label="Add category"
                      colorScheme="green"
                      isDisabled={!newCategory}
                    />
                  </HStack>
                  
                  {selectedCategories.length > 0 && (
                    <Wrap spacing={2} mt={2}>
                      {selectedCategories.map(category => (
                        <WrapItem key={category}>
                          <Tag size="md" borderRadius="full" variant="solid" colorScheme="green">
                            <TagLabel>{category}</TagLabel>
                            <TagCloseButton onClick={() => handleRemoveCategory(category)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                  
                  {errors.categories && (
                    <Text color="red.500" fontSize="sm">{errors.categories}</Text>
                  )}
                </VStack>
              </FormControl>

              {/* Contact Information */}
              <Box w="100%">
                <Heading size="md" mb={4}>Contact Information</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.address}>
                    <FormLabel>Address</FormLabel>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Business address"
                    />
                    <FormErrorMessage>{errors.address}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>City</FormLabel>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Region</FormLabel>
                    <Input
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      placeholder="Region"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                      type="tel"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email address"
                      type="email"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Website</FormLabel>
                    <Input
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="Website URL"
                      type="url"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Opening Hours</FormLabel>
                    <Input
                      name="opening_hours"
                      value={formData.opening_hours}
                      onChange={handleInputChange}
                      placeholder="e.g., Mon-Fri: 9:00 AM - 6:00 PM"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Submit Button */}
              <Box w="100%" pt={4}>
                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  width="100%"
                  isLoading={isSubmitting}
                  loadingText="Creating Business..."
                >
                  Create Business
                </Button>
              </Box>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Box>
  );
};

export default CreateBusinessPage;
