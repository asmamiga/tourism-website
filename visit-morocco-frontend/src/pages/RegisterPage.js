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
  IconButton
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here you would implement your actual registration API call
      // For now, we'll simulate a successful registration
      setTimeout(() => {
        toast({
          title: 'Registration successful',
          description: 'You have successfully created an account',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/login');
      }, 1000);
    } catch (error) {
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
                <FormControl id="name" isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </FormControl>
                
                <FormControl id="email" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                  <FormHelperText>We'll never share your email.</FormHelperText>
                </FormControl>
                
                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </FormControl>
                
                <FormControl id="confirmPassword" isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                  />
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
