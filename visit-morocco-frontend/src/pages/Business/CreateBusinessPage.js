import React, { useState, useEffect } from 'react';
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
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  Flex,
  Iconmak
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { businessService, cityService } from '../../services/api';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const CreateBusinessPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    city_id: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    opening_hours: '',
    price_range: '$$', // Fixed: use string instead of number
    features: '',
    latitude: '',
    longitude: ''
  });

  const [errors, setErrors] = useState({});

  // Handler for adding a category
  const handleAddCategory = () => {
    if (newCategory && !selectedCategories.includes(newCategory)) {
      setSelectedCategories([...selectedCategories, newCategory]);
      setNewCategory('');
    }
  };

  // Handler for removing a category
  const handleRemoveCategory = (categoryToRemove) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== categoryToRemove));
  };

  // Fetch cities and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching cities and categories...');
        const [citiesRes, categoriesRes] = await Promise.all([
          cityService.getAll(),
          businessService.getCategories()
        ]);
        
        console.log('Cities API Response:', citiesRes);
        console.log('Categories API Response:', categoriesRes);
        
        // Handle cities response - extract data array from paginated response
        const citiesData = Array.isArray(citiesRes.data?.data) 
          ? citiesRes.data.data 
          : (citiesRes.data?.data?.data || []);
        console.log('Processed cities data:', citiesData);
        setCities(citiesData);
        
        // Handle categories response - handle both direct array and paginated response
        let categoriesData = categoriesRes.data?.data || [];
        // If data is paginated, extract the data array
        if (categoriesData && categoriesData.data) {
          categoriesData = categoriesData.data;
        }
        console.log('Categories data:', categoriesData);
        setCategories(categoriesData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load required data. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleNumberInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value ? Number(value) : ''
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and size
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024 // 2MB max
    );
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Add to photos state
    setPhotos(prev => [...prev, ...validFiles]);
    
    // Clear file input
    e.target.value = '';
  };

  const removePhoto = (index) => {
    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
    
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    // Validate form - FIXED validation logic
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.city_id) newErrors.city_id = 'City is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData object
      const formDataToSend = new FormData();
      
      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value);
        }
      });
      
      // Add selected categories
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(catId => {
          formDataToSend.append('categories[]', catId);
        });
      }
      
      // Add photos
      photos.forEach(photo => {
        formDataToSend.append('photos[]', photo);
      });
      
      console.log('Submitting form with data:');
      // Log form data for debugging
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Make API call
      const response = await businessService.create(formDataToSend);
      
      console.log('API Response:', response);
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Business created successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to the business dashboard or details page
      navigate(`/business/${response.data.id}`);
    } catch (error) {
      console.error('Error creating business:', error);
      console.error('Error response:', error.response);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        console.log('Validation errors:', validationErrors);
        setErrors(validationErrors);
        
        toast({
          title: 'Validation Error',
          description: 'Please check the form for errors.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to create business. Please try again.';
        console.error('Error message:', errorMessage);
        
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading) {
    return (
      <Box p={4}>
        <Text>Loading...</Text>
      </Box>
    );
  }

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

                  <FormControl isRequired isInvalid={!!errors.category_id}>
                    <FormLabel>Main Category</FormLabel>
                    <Select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      placeholder="Select main category"
                    >
                      {categories && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Loading categories...</option>
                      )}
                    </Select>
                    <FormErrorMessage>{errors.category_id}</FormErrorMessage>
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

              {/* Location Information */}
              <Box w="100%">
                <Heading size="md" mb={4}>Location Information</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.city_id}>
                    <FormLabel>City</FormLabel>
                    <Select
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleInputChange}
                      placeholder="Select city"
                    >
                      {cities && cities.length > 0 ? (
                        cities.map(city => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Loading cities...</option>
                      )}
                    </Select>
                    <FormErrorMessage>{errors.city_id}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.address}>
                    <FormLabel>Address</FormLabel>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter business address"
                    />
                    <FormErrorMessage>{errors.address}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Contact Information */}
              <Box w="100%">
                <Heading size="md" mb={4}>Contact Information</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.phone}>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                    <FormErrorMessage>{errors.phone}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <FormControl mt={4}>
                  <FormLabel>Website (Optional)</FormLabel>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com"
                  />
                </FormControl>
              </Box>

              {/* Additional Information */}
              <Box w="100%">
                <Heading size="md" mb={4}>Additional Information</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
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

                  <FormControl>
                    <FormLabel>Opening Hours (Optional)</FormLabel>
                    <Input
                      name="opening_hours"
                      value={formData.opening_hours}
                      onChange={handleInputChange}
                      placeholder="e.g., Mon-Fri: 9AM-6PM"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl mt={4}>
                  <FormLabel>Features (Optional)</FormLabel>
                  <Textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="List special features, amenities, or services..."
                    rows={3}
                  />
                </FormControl>
              </Box>

              

              {/* Photo Upload Section */}
              <Box w="100%">
                <FormControl>
                  <FormLabel>Business Photos (Optional)</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    display="none"
                    id="photo-upload"
                  />
                  <Button
                    as="label"
                    htmlFor="photo-upload"
                    leftIcon={<FiUpload />}
                    variant="outline"
                    cursor="pointer"
                    mb={2}
                  >
                    Upload Photos
                  </Button>
                  
                  {previewUrls.length > 0 && (
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2} mt={2}>
                      {previewUrls.map((url, index) => (
                        <Box key={`photo-${index}`} position="relative">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            borderRadius="md"
                            objectFit="cover"
                            h="100px"
                            w="100%"
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            position="absolute"
                            top={1}
                            right={1}
                            onClick={() => removePhoto(index)}
                            aria-label="Remove photo"
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                </FormControl>
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