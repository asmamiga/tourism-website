import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  Heading, 
  Text, 
  Link, 
  useToast,
  Container,
  Image,
  Flex,
  FormHelperText,
  InputGroup,
  InputRightElement,
  IconButton,
  Select,
  Stack
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'tourist',
    profile_picture: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare user data for registration
      const userData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role
      };
      
      console.log('Sending registration data:', userData);
      
      // Convert role to match backend expectations
      if (userData.role === 'business') {
        userData.role = 'business_owner';
      }
      
      const success = await register(userData);

      if (success) {
        toast({
          title: 'Registration successful!',
          description: 'Your account has been created. Please log in.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Flex direction={{ base: 'column', md: 'row' }} align="center">
        <Box flex="1" p={8}>
          <Image 
            src="https://source.unsplash.com/random/600x400/?morocco,travel" 
            alt="Morocco Travel" 
            borderRadius="md"
            objectFit="cover"
          />
        </Box>
        
        <Box 
          flex="1" 
          p={8} 
          boxShadow="lg" 
          borderRadius="md"
          bg="white"
        >
          <VStack spacing={6} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Create Your Account
            </Heading>
            
            <Text fontSize="md" color="gray.600" textAlign="center">
              Join Visit Morocco and start planning your dream journey
            </Text>
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Stack direction={{ base: 'column', md: 'row' }} spacing={4} w="100%">
                  <FormControl id="first_name" isRequired isInvalid={!!errors.first_name}>
                    <FormLabel>First Name</FormLabel>
                    <Input 
                      type="text" 
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="John"
                    />
                    {errors.first_name && <Text color="red.500" fontSize="sm">{errors.first_name}</Text>}
                  </FormControl>
                  
                  <FormControl id="last_name" isRequired isInvalid={!!errors.last_name}>
                    <FormLabel>Last Name</FormLabel>
                    <Input 
                      type="text" 
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Doe"
                    />
                    {errors.last_name && <Text color="red.500" fontSize="sm">{errors.last_name}</Text>}
                  </FormControl>
                </Stack>

                <Stack direction={{ base: 'column', md: 'row' }} spacing={4} w="100%">
                  <FormControl id="email" isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email address</FormLabel>
                    <Input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                    />
                    <FormHelperText>We'll never share your email.</FormHelperText>
                    {errors.email && <Text color="red.500" fontSize="sm">{errors.email}</Text>}
                  </FormControl>
                  
                  <FormControl id="phone" isRequired isInvalid={!!errors.phone}>
                    <FormLabel>Phone Number</FormLabel>
                    <Input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1234567890"
                    />
                    {errors.phone && <Text color="red.500" fontSize="sm">{errors.phone}</Text>}
                  </FormControl>
                </Stack>
                
                <Stack direction={{ base: 'column', md: 'row' }} spacing={4} w="100%">
                  <FormControl id="password" isRequired isInvalid={!!errors.password}>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="********"
                      />
                      <InputRightElement>
                        <IconButton
                          size="sm"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormHelperText>At least 8 characters with numbers and symbols</FormHelperText>
                    {errors.password && <Text color="red.500" fontSize="sm">{errors.password}</Text>}
                  </FormControl>
                  
                  <FormControl id="password_confirmation" isRequired isInvalid={!!errors.password_confirmation}>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      placeholder="********"
                    />
                    {errors.password_confirmation && <Text color="red.500" fontSize="sm">{errors.password_confirmation}</Text>}
                  </FormControl>
                </Stack>
                
                <FormControl id="profile_picture">
                  <FormLabel>Profile Picture (Optional)</FormLabel>
                  <Input 
                    type="file" 
                    name="profile_picture"
                    accept="image/*"
                    onChange={handleChange}
                    p={1}
                  />
                </FormControl>
                
                <FormControl id="role" isRequired isInvalid={!!errors.role}>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Select role"
                  >
                    <option value="tourist">Tourist</option>
                    <option value="guide">Guide</option>
                    <option value="business">Business</option>
                  </Select>
                  {errors.role && <Text color="red.500" fontSize="sm">{errors.role}</Text>}
                </FormControl>
                
                <Button 
                  type="submit" 
                  colorScheme="teal" 
                  size="lg" 
                  width="full"
                  mt={4}
                  isLoading={isLoading}
                  loadingText="Creating Account"
                >
                  Register
                </Button>
              </VStack>
            </form>
            
            <Text textAlign="center">
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="teal.500">
                Sign in
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
};

export default RegisterPage;
