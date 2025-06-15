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
  Flex,
  Stack,
  InputGroup,
  InputRightElement,
  IconButton,
  Select,
  FormHelperText,
  Image
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const auth = useAuth();
  const register = auth?.register;
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    // Handle both direct value and event object
    let fieldName = field;
    let fieldValue = value;
    
    // If first argument is an event object (for file inputs)
    if (field && field.target) {
      const { name, value, files } = field.target;
      fieldName = name;
      fieldValue = files ? files[0] : value;
    }
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: fieldValue
    }));
    
    // Clear error when user types
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
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
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
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
        role: formData.role === 'business' ? 'business_owner' : formData.role,
      };

      console.log('Sending registration data:', userData);
      
      const success = await register(userData);
      if (success) {
        toast({
          title: 'Registration successful!',
          description: 'Your account has been created. You can now log in.',
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
    <Container maxW="container.xl" py={16} mt={16}>
      <Flex 
        direction={{ base: 'column', lg: 'row' }} 
        align="center"
        minH="70vh"
        boxShadow={{ base: 'none', lg: 'xl' }}
        borderRadius={{ base: 'none', lg: '2xl' }}
        overflow="hidden"
        bg="white"
      >
        <Box 
          flex="1" 
          p={0}
          w="100%"
          h={{ base: '300px', lg: 'auto' }}
          position="relative"
        >
          <Box
            w="100%"
            h="100%"
            bgGradient="linear(to-br, teal.500, teal.300)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={8}
            color="white"
          >
            <VStack spacing={4} textAlign="center">
              <Heading size="xl">Welcome to Morocco</Heading>
              <Text fontSize="lg">Discover the beauty of Moroccan culture and landscapes</Text>
            </VStack>
          </Box>
          <Box 
            position="absolute" 
            top={0} 
            left={0} 
            right={0} 
            bottom={0}
            bgGradient="linear(to-r, rgba(0,0,0,0.1), rgba(0,0,0,0.3))"
          />
        </Box>
        
        <Box 
          flex="1" 
          p={{ base: 8, lg: 12 }}
          w="100%"
          maxW={{ base: '100%', lg: '500px' }}
          mx="auto"
        >
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading as="h1" size="xl" mb={2} color="teal.600">
                Create an Account
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Join our Visit Morocco community
              </Text>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={5}>
                <FormControl id="first_name" isRequired isInvalid={!!errors.first_name}>
                  <FormLabel>First Name</FormLabel>
                  <Input 
                    type="text" 
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="Enter your first name"
                    size="lg"
                  />
                  {errors.first_name && (
                    <Text color="red.500" fontSize="sm" mt={1}>{errors.first_name}</Text>
                  )}
                </FormControl>

                <FormControl id="last_name" isRequired isInvalid={!!errors.last_name}>
                  <FormLabel>Last Name</FormLabel>
                  <Input 
                    type="text" 
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Enter your last name"
                    size="lg"
                  />
                  {errors.last_name && (
                    <Text color="red.500" fontSize="sm" mt={1}>{errors.last_name}</Text>
                  )}
                </FormControl>

                <FormControl id="email" isRequired isInvalid={!!errors.email}>
                  <FormLabel>Email address</FormLabel>
                  <Input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    size="lg"
                  />
                  {errors.email && (
                    <Text color="red.500" fontSize="sm" mt={1}>{errors.email}</Text>
                  )}
                </FormControl>

                <FormControl id="phone" isRequired isInvalid={!!errors.phone}>
                  <FormLabel>Phone Number</FormLabel>
                  <Input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+212 6XX-XXXXXX"
                    size="lg"
                  />
                  {errors.phone && (
                    <Text color="red.500" fontSize="sm" mt={1}>{errors.phone}</Text>
                  )}
                </FormControl>

                <FormControl id="role" isRequired isInvalid={!!errors.role}>
                  <FormLabel>I am a</FormLabel>
                  <Select 
                    placeholder="Select role"
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    size="lg"
                  >
                    <option value="tourist">Tourist</option>
                    <option value="business_owner">Business Owner</option>
                    <option value="guide">Tour Guide</option>
                  </Select>
                  {errors.role && (
                    <Text color="red.500" fontSize="sm" mt={1}>{errors.role}</Text>
                  )}
                </FormControl>

                <FormControl id="password" isRequired isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      size="lg"
                    />
                    <InputRightElement h="full">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText>At least 8 characters with a number and special character</FormHelperText>
                  {errors.password && (
                    <Text color="red.500" fontSize="sm" mt={1}>{errors.password}</Text>
                  )}
                </FormControl>

                <FormControl id="password_confirmation" isRequired isInvalid={!!errors.password_confirmation}>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.password_confirmation}
                      onChange={(e) => handleChange('password_confirmation', e.target.value)}
                      placeholder="••••••••"
                      size="lg"
                    />
                    <InputRightElement h="full">
                      <IconButton
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {errors.password_confirmation && (
                    <Text color="red.500" fontSize="sm" mt={1}>{errors.password_confirmation}</Text>
                  )}
                </FormControl>

                <Button 
                  type="submit" 
                  colorScheme="teal" 
                  size="lg" 
                  width="full"
                  height="50px"
                  fontSize="md"
                  fontWeight="semibold"
                  borderRadius="lg"
                  mt={4}
                  isLoading={isLoading}
                  loadingText="Creating account..."
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s"
                >
                  Create Account
                </Button>
              </VStack>
            </form>

              <Text textAlign="center" mt={4}>
                Already have an account?{' '}
                <Link 
                  as={RouterLink} 
                  to="/login" 
                  color="teal.600"
                  fontWeight="500"
                  _hover={{
                    color: 'teal.700',
                    textDecoration: 'underline',
                  }}
                >
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
