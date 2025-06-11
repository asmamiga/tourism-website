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
  Flex
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.message || 'An error occurred during login',
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
            src="https://source.unsplash.com/random/600x400/?morocco" 
            alt="Morocco" 
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
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Welcome Back
            </Heading>
            
            <Text fontSize="md" color="gray.600" textAlign="center">
              Sign in to access your Visit Morocco account
            </Text>
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={5}>
                <FormControl id="email" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </FormControl>
                
                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                  />
                </FormControl>
                
                <Button 
                  type="submit" 
                  colorScheme="teal" 
                  size="lg" 
                  width="full"
                  isLoading={isLoading}
                  loadingText="Signing in"
                >
                  Sign In
                </Button>
              </VStack>
            </form>
            
            <Text textAlign="center">
              Don't have an account?{' '}
              <Link as={RouterLink} to="/register" color="teal.500">
                Register here
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
};

export default LoginPage;
