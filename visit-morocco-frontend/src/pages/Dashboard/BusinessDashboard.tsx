import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Box, SimpleGrid, Heading, Text, Card, CardBody, CardHeader, 
  HStack, VStack, Divider, Badge, Button, useToast, Avatar,
  useColorModeValue, Skeleton, SkeletonCircle, SkeletonText, IconButton, Tooltip,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, 
  ModalCloseButton, FormControl, FormLabel, Input, ModalFooter, Flex, Textarea,
  Icon, Alert, AlertIcon, AlertTitle, AlertDescription, Container, Progress
} from '@chakra-ui/react';
import { 
  FiCalendar, FiMapPin, FiSearch, FiPlusCircle, FiEdit2, FiUser, 
  FiBriefcase, FiMap, FiCompass, FiCamera, FiUpload, FiStar, FiHeart,
  FiMail, FiPhone, FiLock, FiX, FiCheck, FiGlobe, FiBookmark
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserData {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_picture?: string | null;
  profile_picture_url?: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  verification_code?: string;
  reset_token?: string;
  reset_token_expires?: string | null;
  business_name?: string;
  business_description?: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
}

interface BusinessData {
  total_businesses: number;
  active_listings: number;
  pending_approvals: number;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

// Helper function to safely convert value to string
const safeToString = (value: string | number | undefined): string => {
  if (value === undefined) return '0';
  return String(value);
};

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon: IconComponent, 
  color,
  isLoading = false 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue(`${color}.200`, `${color}.600`);
  const iconBg = useColorModeValue(`${color}.50`, `${color}.900`);
  const iconColor = useColorModeValue(`var(--chakra-colors-${color}-600)`, `var(--chakra-colors-${color}-300)`);
  const textColor = useColorModeValue('gray.800', 'white');
  
  if (isLoading) {
    return (
      <Card bg={cardBg} borderLeft="4px" borderColor={borderColor} shadow="lg">
        <CardBody>
          <HStack spacing={4}>
            <SkeletonCircle size="12" />
            <VStack align="start" spacing={2} flex={1}>
              <Skeleton height="4" width="20" />
              <Skeleton height="6" width="16" />
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    );
  }


  return (
    <Card 
      bg={cardBg} 
      borderLeft="4px" 
      borderColor={borderColor}
      shadow="lg"
      _hover={{ 
        shadow: 'xl', 
        transform: 'translateY(-2px)',
        borderColor: `${color}.400`
      }}
      transition="all 0.3s ease"
    >
      <CardBody>
        <HStack spacing={4}>
          <Box 
            p={3} 
            bg={iconBg} 
            borderRadius="xl"
            shadow="md"
          >
            <IconComponent 
              size={28} 
              color={iconColor} 
            />
          </Box>
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">{title}</Text>
            <Heading size="lg" color={textColor}>{safeToString(value)}</Heading>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

const QuickAction: React.FC<QuickActionProps> = ({ 
  title, 
  icon: IconComponent, 
  to, 
  color,
  description 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const iconBg = useColorModeValue(`${color}.50`, `${color}.900`);
  const iconColor = useColorModeValue(`var(--chakra-colors-${color}-600)`, `var(--chakra-colors-${color}-300)`);
  const textColor = useColorModeValue('gray.800', 'white');
  
  return (
    <Card 
      as={Link} 
      to={to} 
      bg={cardBg}
      _hover={{ 
        transform: 'translateY(-6px)', 
        shadow: 'xl',
        borderColor: `${color}.400`
      }} 
      transition="all 0.3s ease"
      cursor="pointer"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      position="relative"
      overflow="hidden"
      h="100%"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="4px"
        bg={`linear-gradient(90deg, ${color}.400, ${color}.600)`}
      />
      <CardBody textAlign="center" p={6}>
        <VStack spacing={3}>
          <Box
            p={3}
            bg={iconBg}
            borderRadius="xl"
            shadow="md"
          >
            <IconComponent 
              size={32} 
              color={iconColor} 
            />
          </Box>
          <Text fontSize="md" fontWeight="bold" color={textColor}>
            {title}
          </Text>
          {description && (
            <Text fontSize="sm" color="gray.500" textAlign="center">
              {description}
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

interface QuickActionProps {
  title: string;
  icon: React.ElementType;
  to: string;
  color: string;
  description?: string;
}

const BusinessDashboard: React.FC = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  
  // Password update form state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  // User data state
  const [userData, setUserData] = useState<UserData>(() => formatUserData(authUser));
  const [editData, setEditData] = useState<UserData>(() => formatUserData(authUser));
  
  const [businessData, setBusinessData] = useState<BusinessData>({
    total_businesses: 0,
    active_listings: 0,
    pending_approvals: 0
  });
  
  const formatUserData = (user: any): UserData => {
    const profilePicture = user?.profile_picture_url || user?.profile_picture || user?.avatar;
    
    return {
      user_id: user?.user_id || user?.id || 0,
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profile_picture: profilePicture,
      role: user?.role || 'business_owner',
      is_verified: user?.is_verified || false,
      created_at: user?.created_at || new Date().toISOString(),
      updated_at: user?.updated_at || new Date().toISOString(),
      last_login: user?.last_login,
      verification_code: user?.verification_code,
      reset_token: user?.reset_token,
      reset_token_expires: user?.reset_token_expires,
      business_name: user?.business_name,
      business_description: user?.business_description,
      bio: user?.bio,
      specialties: user?.specialties || [],
      languages: user?.languages || []
    };
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordUpdate = async () => {
    try {
      setIsLoading(true);
      
      // Validate passwords match
      if (passwordData.new_password !== passwordData.new_password_confirmation) {
        throw new Error('New passwords do not match');
      }
      
      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(passwordData.new_password)) {
        throw new Error('Password must be at least 8 characters long and include uppercase, lowercase, number and special character');
      }
      
      // Make API call to update password
      await axios.put('/api/business-owner/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation
      });
      
      // Show success message
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form and close modal
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
      
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error('Error updating password:', error);
      
      let errorMessage = 'Failed to update password';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset any previous errors
    setSelectedFile(null);
    setPreviewUrl('');
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image (JPEG, PNG, or GIF)',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 5MB limit.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Set the file and preview
    setSelectedFile(file);
    setPreviewUrl(previewUrl);
  };
  
  const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append('profile_picture', file, file.name);

    const baseURL = (axios.defaults.baseURL || 'http://localhost:8000').replace(/\/+$/, '');
    const apiPath = baseURL.endsWith('/api') ? '/profile/picture' : '/api/profile/picture';
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.post(`${baseURL}${apiPath}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024, // 10MB
      });

      if (response.data && (response.data.profile_picture_url || response.data.profile_picture)) {
        const profilePictureUrl = response.data.profile_picture_url || response.data.profile_picture;
        
        // Update the user data with the new profile picture URL
        setUserData(prev => ({
          ...prev,
          profile_picture: profilePictureUrl
        }));
        
        // Also update the preview URL
        setPreviewUrl(profilePictureUrl);
        
        return profilePictureUrl;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      
      let errorMessage = 'Failed to upload profile picture';
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 413) {
          errorMessage = 'File is too large. Maximum size is 5MB.';
        } else if (error.response.status === 422) {
          errorMessage = 'Invalid file format. Please upload a valid image (JPEG, PNG, JPG, GIF).';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Prepare the data to send to the API
      const { profile_picture, ...updateData } = editData;
      
      // Update profile information
      const response = await axios.put('/api/business-owner/profile', updateData);
      
      // If there's a new profile picture to upload
      if (previewUrl && selectedFile) {
        const formData = new FormData();
        formData.append('profile_picture', selectedFile);
        
        await axios.post('/api/business-owner/profile/picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        });
      }
      
      // Refresh the user data to get the latest from the server
      const userResponse = await axios.get('/api/business-owner/profile');
      const updatedUser = formatUserData(userResponse.data.user);
      
      // Update state with the latest data
      setUserData(updatedUser);
      setEditData(updatedUser);
      
      // Reset file states
      setSelectedFile(null);
      setPreviewUrl('');
      
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const fetchBusinessData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch business owner's data
      const businessOwnerResponse = await axios.get('/api/business-owner/profile');
      const businessData = businessOwnerResponse.data;
      
      // Fetch business statistics
      const statsResponse = await axios.get('/api/business-owner/stats');
      
      // Update state with real data
      setBusinessData({
        total_businesses: statsResponse.data.total_businesses || 0,
        active_listings: statsResponse.data.active_listings || 0,
        pending_approvals: statsResponse.data.pending_approvals || 0
      });
      
      // Update user data with the latest from the server
      if (businessData.user) {
        const formattedUser = formatUserData(businessData.user);
        setUserData(formattedUser);
        setEditData(formattedUser);
      }
      
    } catch (error) {
      console.error('Error fetching business data:', error);
      
      let errorMessage = 'Failed to load business data';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch business data on component mount
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch business owner's data
        const businessOwnerResponse = await axios.get('/api/business-owner/profile');
        const businessData = businessOwnerResponse.data;
        
        // Fetch business statistics
        const statsResponse = await axios.get('/api/business-owner/stats');
        
        // Update state with real data
        setBusinessData({
          total_businesses: statsResponse.data.total_businesses || 0,
          active_listings: statsResponse.data.active_listings || 0,
          pending_approvals: statsResponse.data.pending_approvals || 0
        });
        
        // Update user data with the latest from the server
        if (businessData.user) {
          const formattedUser = formatUserData(businessData.user);
          setUserData(formattedUser);
          setEditData(formattedUser);
        }
        
      } catch (error) {
        console.error('Error fetching business data:', error);
        
        let errorMessage = 'Failed to load business data';
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message || errorMessage;
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessData();
  }, [toast]);

  const quickActions = [
    {
      title: 'Add Business',
      icon: FiPlusCircle,
      to: '/businesses/new',
      color: 'green',
      description: 'List a new business'
    },
    {
      title: 'Businesses',
      icon: FiBriefcase,
      to: '/businesses',
      color: 'blue',
      description: 'View all businesses'
    },
    {
      title: 'Edit Profile',
      icon: FiUser,
      to: '/profile',
      color: 'purple',
      description: 'Update your profile information'
    },
    
  ];

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const avatarBorderColor = useColorModeValue('white', 'gray.700');
  
  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'tourist': 'blue',
      'guide': 'green',
      'business_owner': 'purple',
      'admin': 'red'
    };
    return colors[role] || 'gray';
  };

  return (
    <Box bg={bgColor} minH="100vh" py={20}>
      <Container maxW="container.xl" px={{ base: 4, md: 6, lg: 8 }}>
        {/* User Profile Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <Flex direction={{ base: 'column', lg: 'row' }} gap={8} align="center">
              <VStack spacing={4} minW="200px">
                <Box position="relative">
                  <Avatar 
                    size="2xl" 
                    name={`${userData.first_name} ${userData.last_name}`} 
                    src={userData.profile_picture || userData.profile_picture_url || undefined}
                    border="4px solid"
                    borderColor={avatarBorderColor}
                    shadow="xl"
                    key={`avatar-${userData.user_id}-${userData.profile_picture ? 'custom' : 'default'}`}
                    onError={() => {
                      console.error('Failed to load profile picture');
                    }}
                  />
                </Box>
                
                <VStack spacing={2}>
                  <Button 
                    leftIcon={<FiEdit2 />} 
                    colorScheme="blue" 
                    variant="solid"
                    size="md"
                    onClick={onOpen}
                    isLoading={isLoading || isUploading}
                    loadingText={isUploading ? 'Uploading...' : 'Saving...'}
                    borderRadius="full"
                    px={6}
                  >
                    Edit Profile
                  </Button>
                  
                  {userData.is_verified && (
                    <Badge colorScheme="green" variant="subtle" fontSize="xs">
                      Verified Account
                    </Badge>
                  )}
                </VStack>
              </VStack>
              
              <Box flex={1} w="100%">
                <VStack align="start" spacing={6}>
                  <HStack justify="space-between" w="100%" flexWrap="wrap">
                    <VStack align="start" spacing={2}>
                      <Heading size="xl" color={textColor}>
                        {`${userData.first_name} ${userData.last_name}`}
                      </Heading>
                      <HStack spacing={2}>
                        <Icon as={FiMail} color={mutedColor} />
                        <Text color={mutedColor}>{userData.email}</Text>
                      </HStack>
                      {userData.phone && (
                        <HStack spacing={2}>
                          <Icon as={FiPhone} color={mutedColor} />
                          <Text color={mutedColor}>{userData.phone}</Text>
                        </HStack>
                      )}
                    </VStack>
                    
                    <VStack align="end" spacing={2}>
                      <Badge 
                        colorScheme={getRoleBadgeColor(userData.role)} 
                        variant="solid"
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {userData.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <Text fontSize="sm" color={mutedColor}>
                        Member since {new Date(userData.created_at).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Divider />
                  
                  {/* Business Owner Specific Info */}
                  {userData.business_name && (
                    <VStack align="start" spacing={2} w="100%">
                      <Heading size="md" color={textColor}>Business Information</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        <VStack align="start">
                          <Text fontWeight="bold" color={textColor}>Business Name</Text>
                          <Text color={mutedColor}>{userData.business_name}</Text>
                        </VStack>
                        {userData.business_description && (
                          <VStack align="start">
                            <Text fontWeight="bold" color={textColor}>Business Description</Text>
                            <Text color={mutedColor}>{userData.business_description}</Text>
                          </VStack>
                        )}
                      </SimpleGrid>
                    </VStack>
                  )}
                  
                  {/* Additional Info */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="100%">
                    <VStack align="start">
                      <Text fontWeight="bold" color={textColor}>Member Since</Text>
                      <Text color={mutedColor}>
                        {new Date(userData.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </VStack>
                    
                    {userData.last_login && (
                      <VStack align="start">
                        <Text fontWeight="bold" color={textColor}>Last Login</Text>
                        <Text color={mutedColor}>
                          {new Date(userData.last_login).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </VStack>
                    )}
                    
                    <VStack align="start">
                      <Text fontWeight="bold" color={textColor}>Account Status</Text>
                      <HStack>
                        <Box 
                          w={3} 
                          h={3} 
                          borderRadius="full" 
                          bg={userData.is_verified ? 'green.500' : 'yellow.500'}
                        />
                        <Text color={mutedColor}>
                          {userData.is_verified ? 'Verified' : 'Pending Verification'}
                        </Text>
                      </HStack>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </Box>
            </Flex>
          </CardBody>
        </Card>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={8}>
        <DashboardCard 
          title="Total Businesses" 
          value={String(businessData.total_businesses)} 
          icon={FiBriefcase} 
          color="blue"
          isLoading={isLoading}
        />
        <DashboardCard 
          title="Active Listings" 
          value={String(businessData.active_listings)} 
          icon={FiMapPin} 
          color="green"
          isLoading={isLoading}
        />
        <DashboardCard 
          title="Pending Approvals" 
          value={String(businessData.pending_approvals)} 
          icon={FiStar} 
          color="orange"
          isLoading={isLoading}
        />
      </SimpleGrid>

      {/* Quick Actions */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Quick Actions</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              icon={action.icon}
              to={action.to}
              color={action.color}
              description={action.description}
            />
          ))}
        </SimpleGrid>
      </Box>
      
      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Profile Picture</FormLabel>
                <VStack spacing={4} align="center">
                  <Avatar 
                    size="2xl" 
                    name={`${editData.first_name} ${editData.last_name}`} 
                    src={previewUrl || editData.profile_picture || undefined}
                    border="4px solid"
                    borderColor={avatarBorderColor}
                    shadow="xl"
                  />
                  <Box>
                    <Input
                      type="file"
                      id="profile-picture-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      display="none"
                    />
                    <Button
                      as="label"
                      htmlFor="profile-picture-upload"
                      leftIcon={<FiUpload />}
                      variant="outline"
                      cursor="pointer"
                      isLoading={isUploading}
                      loadingText="Uploading..."
                    >
                      Change Photo
                    </Button>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <Progress value={uploadProgress} size="xs" mt={2} colorScheme="blue" />
                    )}
                  </Box>
                </VStack>
              </FormControl>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input 
                    name="first_name" 
                    value={editData.first_name || ''} 
                    onChange={handleInputChange}
                    placeholder="First Name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input 
                    name="last_name" 
                    value={editData.last_name || ''} 
                    onChange={handleInputChange}
                    placeholder="Last Name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email" 
                    name="email" 
                    value={editData.email || ''} 
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input 
                    type="tel" 
                    name="phone" 
                    value={editData.phone || ''} 
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Business Name</FormLabel>
                  <Input 
                    name="business_name" 
                    value={editData.business_name || ''} 
                    onChange={handleInputChange}
                    placeholder="Business Name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Business Description</FormLabel>
                  <Textarea 
                    name="business_description" 
                    value={editData.business_description || ''} 
                    onChange={handleInputChange}
                    placeholder="Tell us about your business..."
                    rows={3}
                  />
                </FormControl>
              </SimpleGrid>
              
              <Alert status="info" borderRadius="md" mt={4}>
                <AlertIcon />
                <Box>
                  <AlertTitle>Want to change your password?</AlertTitle>
                  <AlertDescription>
                    Click the button below to update your password.
                  </AlertDescription>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    colorScheme="blue" 
                    mt={2}
                    leftIcon={<FiLock />}
                    onClick={() => {
                      onClose();
                      setIsPasswordModalOpen(true);
                    }}
                  >
                    Change Password
                  </Button>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handleSave}
              isLoading={isLoading || isUploading}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
            <Button onClick={onClose} isDisabled={isLoading || isUploading}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Current Password</FormLabel>
                <Input 
                  type="password" 
                  name="current_password" 
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <Input 
                  type="password" 
                  name="new_password" 
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Confirm New Password</FormLabel>
                <Input 
                  type="password" 
                  name="new_password_confirmation" 
                  value={passwordData.new_password_confirmation}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                />
              </FormControl>
              
              <Alert status="info" borderRadius="md" fontSize="sm">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">Password Requirements:</Text>
                  <Text>- At least 8 characters</Text>
                  <Text>- At least one uppercase letter</Text>
                  <Text>- At least one number</Text>
                  <Text>- At least one special character</Text>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              colorScheme="blue" 
              mr={3} 
              onClick={handlePasswordUpdate}
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Update Password
            </Button>
            <Button 
              onClick={() => {
                setIsPasswordModalOpen(false);
                onOpen();
              }}
              isDisabled={isLoading}
              variant="outline"
            >
              Back to Profile
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      </Container>
    </Box>
  );
};
// Export the component
export default BusinessDashboard;
