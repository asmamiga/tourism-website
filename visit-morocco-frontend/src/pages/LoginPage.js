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
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { state } = location;
  const authMessage = state?.message || 'Please log in to continue';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const success = await login({ email, password });
      if (success) {
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Navigate to dashboard after successful login
        navigate('/dashboard');
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
              {state?.from && (
                <Text fontSize="md" mt={4} p={3} bg="rgba(255,255,255,0.2)" borderRadius="md">
                  {authMessage}
                </Text>
              )}
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
                Welcome Back
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Sign in to your Visit Morocco account
              </Text>
            </Box>
            
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
                  height="50px"
                  fontSize="md"
                  fontWeight="semibold"
                  borderRadius="lg"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                  isLoading={isLoading}
                  loadingText="Signing in"
                >
                  Sign In
                </Button>
              </VStack>
            </form>
            
            <Text textAlign="center" mt={4}>
              Don't have an account?{' '}
              <Link 
                as={RouterLink} 
                to="/register" 
                color="teal.600"
                fontWeight="500"
                _hover={{
                  color: 'teal.700',
                  textDecoration: 'underline',
                }}
              >
                Create an account
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
};

export default LoginPage;
