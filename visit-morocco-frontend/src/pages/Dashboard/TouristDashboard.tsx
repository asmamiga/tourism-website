import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  Box, SimpleGrid, Heading, Text, Card, CardBody, CardHeader, 
  Icon, HStack, VStack, Divider, Avatar, Button, useDisclosure, 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, 
  ModalCloseButton, FormControl, FormLabel, Input, ModalFooter, 
  useToast, Flex, Badge, Textarea, Progress, useColorModeValue,
  Skeleton, SkeletonCircle, SkeletonText, Container, Wrap, WrapItem,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, IconButton,
  Tooltip, Alert, AlertIcon, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import { 
  FiCalendar, 
  FiMapPin, 
  FiSearch, 
  FiPlusCircle, 
  FiEdit2, 
  FiUser, 
  FiBriefcase, 
  FiMap, 
  FiCompass,
  FiCamera,
  FiUpload,
  FiStar,
  FiHeart,
  FiBookmark,
  FiTrendingUp,
  FiEye,
  FiGlobe,
  FiPhone,
  FiMail
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: number;
  isLoading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon: IconComponent, 
  color, 
  trend,
  isLoading = false 
}) => {
  // Move all hooks to the top level - always call them
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
            <Heading size="lg" color={textColor}>{value}</Heading>
            {trend !== undefined && (
              <HStack spacing={1}>
                <Stat>
                  <StatHelpText>
                    <StatArrow type={trend > 0 ? 'increase' : 'decrease'} />
                    <Text as="span" fontSize="xs" color={trend > 0 ? 'green.500' : 'red.500'} ml={1}>
                      {Math.abs(trend)}%
                    </Text>
                  </StatHelpText>
                </Stat>
              </HStack>
            )}
          </VStack>
        </HStack>
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

interface DashboardData {
  stats?: {
    upcoming_trips?: number;
    past_trips?: number;
    saved_guides?: number;
    saved_businesses?: number;
  };
  upcoming?: any[];
  recent_activities?: any[];
  quick_actions?: any[];
}

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

const TouristDashboard: React.FC<{ data?: DashboardData }> = ({ data = {} }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const avatarBorderColor = useColorModeValue('white', 'gray.700');
  
  const formatUserData = (user: any): UserData => {
    // FIXED: Properly prioritize profile_picture_url from backend
    const profilePicture = user?.profile_picture_url || user?.profile_picture || user?.avatar;
    
    const formattedUser = {
      user_id: user?.user_id || user?.id || 0,
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      profile_picture: profilePicture, // This should now correctly use profile_picture_url
      role: user?.role || 'tourist',
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
    
    console.log('Formatting user data - Profile Picture URL:', 
      profilePicture || 'Not found',
      'Full user object:', user
    );
    
    return formattedUser;
  };

  const [userData, setUserData] = useState<UserData>(formatUserData(authUser));
  const [editData, setEditData] = useState<UserData>(formatUserData(authUser));

  useEffect(() => {
    if (authUser) {
      console.log('Auth User Data:', authUser);
      const formattedUser = formatUserData(authUser);
      console.log('Formatted User Data:', formattedUser);
      setUserData(formattedUser);
      setEditData(formattedUser);
    } else {
      console.log('No auth user found');
    }
  }, [authUser]);

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
      setIsPasswordLoading(true);
      
      let baseURL = axios.defaults.baseURL || 'http://localhost:8000';
      baseURL = baseURL.replace(/\/+$/, '');
      const apiPath = baseURL.endsWith('/api') ? '/profile/password' : '/api/profile/password';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      await axios.put(`${baseURL}${apiPath}`, passwordData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      toast({
        title: 'Password updated successfully',
        description: 'Your password has been changed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
      setIsPasswordModalOpen(false);
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error updating password',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPasswordLoading(false);
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
    
    // Log the file info
    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl: previewUrl.substring(0, 50) + '...'
    });
  };

  const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    // Make sure to use the exact field name expected by the backend
    formData.append('profile_picture', file, file.name);

    const baseURL = (axios.defaults.baseURL || 'http://localhost:8000').replace(/\/+$/, '');
    const apiPath = baseURL.endsWith('/api') ? '/profile/picture' : '/api/profile/picture';
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // Log the file being sent
      console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes');
      
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

      // Log the response for debugging
      console.log('Profile picture upload response:', response.data);

      // Check if the response has the expected format
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
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 413) {
          errorMessage = 'File is too large. Maximum size is 5MB.';
        } else if (error.response.status === 422) {
          errorMessage = 'Invalid file format. Please upload a valid image (JPEG, PNG, JPG, GIF).';
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      let baseURL = axios.defaults.baseURL || 'http://localhost:8000';
      baseURL = baseURL.replace(/\/+$/, '');
      const apiPath = baseURL.endsWith('/api') ? '/profile' : '/api/profile';
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Handle profile picture upload if a new file is selected
      if (selectedFile) {
        try {
          setIsUploading(true);
          const newProfilePictureUrl = await uploadProfilePicture(selectedFile);
          
          // Update editData with the new picture URL
          setEditData(prev => ({
            ...prev,
            profile_picture: newProfilePictureUrl
          }));
          
          setPreviewUrl(newProfilePictureUrl);
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          throw new Error('Failed to upload profile picture. Please try again.');
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
          setSelectedFile(null);
        }
      }
      
      // Prepare the data to send to the server
      const dataToSend = {
        ...editData,
        user_id: undefined,
        created_at: undefined,
        updated_at: undefined,
        is_verified: undefined,
        verification_code: undefined,
        reset_token: undefined,
        reset_token_expires: undefined
      };
      
      // Send the updated profile data to the server
      const response = await axios.put(`${baseURL}${apiPath}`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      // FIXED: Properly format the response data
      const updatedUser = formatUserData(response.data.user);
      setUserData(updatedUser);
      setEditData(updatedUser);
      
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
      
      toast({
        title: 'Profile updated successfully',
        description: 'Your changes have been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      // ... error handling remains the same
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { 
      title: 'Plan Your Trip', 
      icon: 'compass', 
      route: '/itinerary-planner',
      color: 'blue',
      description: 'Create custom itineraries'
    },
    { 
      title: 'Explore Businesses', 
      icon: 'briefcase', 
      route: '/businesses',
      color: 'purple',
      description: 'Discover local services'
    },
    { 
      title: 'Explore Attractions', 
      icon: 'map', 
      route: '/attractions',
      color: 'green',
      description: 'Find amazing places'
    },
    { 
      title: 'Find Guides', 
      icon: 'user', 
      route: '/guides',
      color: 'orange',
      description: 'Connect with local experts'
    }
  ];

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      'search': FiSearch,
      'calendar': FiCalendar,
      'plus-circle': FiPlusCircle,
      'map-pin': FiMapPin,
      'user': FiUser,
      'briefcase': FiBriefcase,
      'map': FiMap,
      'compass': FiCompass,
    };
    return icons[iconName] || FiCalendar;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'tourist': 'blue',
      'guide': 'green',
      'business_owner': 'purple',
      'admin': 'red'
    };
    return colors[role] || 'gray';
  };

  const mockStats = [
    { title: 'Upcoming Trips', value: data.stats?.upcoming_trips || 3, icon: FiCalendar, color: 'blue', trend: 12 },
    { title: 'Past Adventures', value: data.stats?.past_trips || 7, icon: FiMap, color: 'green', trend: -5 },
    { title: 'Saved Guides', value: data.stats?.saved_guides || 5, icon: FiUser, color: 'purple', trend: 8 },
    { title: 'Saved Places', value: data.stats?.saved_businesses || 12, icon: FiHeart, color: 'red', trend: 15 }
  ];

  return (
    <Box bg={bgColor} minH="100vh" py={20}>
      <Container maxW="container.xl" px={{ base: 4, md: 6, lg: 8 }}>
        

        {/* User Profile Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <Flex direction={{ base: 'column', lg: 'row' }} gap={8} align="center">
              <VStack spacing={4} minW="200px">
                {(() => {
                  console.log('Profile Picture Debug:', {
                    hasProfilePicture: !!userData.profile_picture,
                    profilePictureUrl: userData.profile_picture,
                    fullName: `${userData.first_name} ${userData.last_name}`,
                    timestamp: new Date().getTime(),
                    userData: userData
                  });
                  return null;
                })()}
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
                  onLoad={() => {
                    console.log('Successfully loaded profile picture');
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
                  
                  <SimpleGrid columns={{ base: 1 }} spacing={6} w="100%">
                    <Box>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold" color={textColor}>Member Since</Text>
                        <Text color={mutedColor}>
                          {new Date(userData.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Box mb={8}>
          <VStack spacing={4} mb={6}>
            <Heading size="lg" color={textColor}>Quick Actions</Heading>
            <Text color={mutedColor} textAlign="center">
              Everything you need to plan your perfect trip
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={"6"}>
            {quickActions.map((action, index) => (
              <QuickAction 
                key={index}
                title={action.title}
                icon={getIconComponent(action.icon)}
                to={action.route}
                color={action.color}
                description={action.description}
              />
            ))}
          </SimpleGrid>
        </Box>

        {/* Enhanced Edit Profile Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius="2xl" mx={4}>
            <ModalHeader fontSize="2xl" fontWeight="bold">Edit Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={6}>
                {/* Profile Picture Upload */}
                <FormControl>
                  <FormLabel fontWeight="bold">Profile Picture</FormLabel>
                  <VStack spacing={4}>
                    <Avatar 
                      size="xl"
                      src={previewUrl || (editData.profile_picture ? 
                        `${editData.profile_picture}${editData.profile_picture.includes('?') ? '&' : '?'}t=${new Date().getTime()}` : 
                        undefined)}
                      name={`${editData.first_name} ${editData.last_name}`}
                      key={previewUrl || editData.profile_picture} // Force re-render when image changes
                    />
                    
                    <Box
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor={useColorModeValue('gray.300', 'gray.600')}
                      borderRadius="xl"
                      p={6}
                      textAlign="center"
                      cursor="pointer"
                      _hover={{ borderColor: 'blue.400', bg: useColorModeValue('blue.50', 'blue.900') }}
                      transition="all 0.2s"
                      onClick={() => document.getElementById('profile-picture-upload')?.click()}
                    >
                      <Input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        display="none"
                      />
                      <VStack spacing={2}>
                        <Icon as={FiCamera} boxSize={8} color="blue.500" />
                        <Text fontWeight="semibold">
                          {selectedFile ? 'Change Photo' : 'Upload Photo'}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {selectedFile ? selectedFile.name : 'PNG, JPG, GIF up to 5MB'}
                        </Text>
                      </VStack>
                    </Box>
                    
                    {isUploading && (
                      <Progress value={uploadProgress} colorScheme="blue" w="100%" borderRadius="full" />
                    )}
                  </VStack>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">First Name</FormLabel>
                    <Input 
                      name="first_name" 
                      value={editData.first_name} 
                      onChange={handleInputChange}
                      borderRadius="lg"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">Last Name</FormLabel>
                    <Input 
                      name="last_name" 
                      value={editData.last_name} 
                      onChange={handleInputChange}
                      borderRadius="lg"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Email</FormLabel>
                  <Input 
                    type="email" 
                    name="email" 
                    value={editData.email} 
                    onChange={handleInputChange}
                    borderRadius="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold">Phone</FormLabel>
                  <Input 
                    name="phone" 
                    value={editData.phone || ''} 
                    onChange={handleInputChange} 
                    placeholder="+212 600 123456"
                    borderRadius="lg"
                  />
                </FormControl>

                {editData.role === 'business_owner' && (
                  <>
                    <FormControl>
                      <FormLabel fontWeight="bold">Business Name</FormLabel>
                      <Input 
                        name="business_name" 
                        value={editData.business_name || ''} 
                        onChange={handleInputChange} 
                        placeholder="Your Business Name"
                        borderRadius="lg"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontWeight="bold">Business Description</FormLabel>
                      <Textarea 
                        name="business_description" 
                        value={editData.business_description || ''} 
                        onChange={handleInputChange} 
                        rows={4}
                        placeholder="Tell us about your business..."
                        borderRadius="lg"
                        resize="vertical"
                      />
                    </FormControl>
                  </>
                )}

                {editData.role === 'guide' && (
                  <>
                 
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                      <FormControl>
                        <FormLabel fontWeight="bold">Specialties</FormLabel>
                        <Input 
                          name="specialties" 
                          value={editData.specialties?.join(', ') || ''} 
                          onChange={(e) => {
                            const specialties = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setEditData(prev => ({
                              ...prev,
                              specialties
                            }));
                          }}
                          placeholder="Hiking, History, Cuisine"
                          borderRadius="lg"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Separate with commas
                        </Text>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontWeight="bold">Languages</FormLabel>
                        <Input 
                          name="languages" 
                          value={editData.languages?.join(', ') || ''} 
                          onChange={(e) => {
                            const languages = e.target.value.split(',').map(l => l.trim()).filter(Boolean);
                            setEditData(prev => ({
                              ...prev,
                              languages
                            }));
                          }}
                          placeholder="English, French, Arabic"
                          borderRadius="lg"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Separate with commas
                        </Text>
                      </FormControl>
                    </SimpleGrid>
                  </>
                )}

               
              </VStack>
            </ModalBody>
            
            <ModalFooter display="flex" justifyContent="space-between" pt={6}>
              <Button 
                variant="outline" 
                colorScheme="blue" 
                onClick={() => setIsPasswordModalOpen(true)}
                leftIcon={<Icon as={FiEdit2} />}
                borderRadius="full"
              >
                Change Password
              </Button>
              <HStack spacing={3}>
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  borderRadius="full"
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleSave}
                  isLoading={isLoading}
                  loadingText="Saving..."
                  borderRadius="full"
                  px={6}
                >
                  Save Changes
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Enhanced Password Change Modal */}
        <Modal 
          isOpen={isPasswordModalOpen} 
          onClose={() => !isPasswordLoading && setIsPasswordModalOpen(false)}
          isCentered
        >
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius="2xl" mx={4}>
            <ModalHeader fontSize="xl" fontWeight="bold">Change Password</ModalHeader>
            <ModalCloseButton isDisabled={isPasswordLoading} />
            <ModalBody pb={6}>
              {!userData.is_verified && (
                <Alert status="warning" borderRadius="lg" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Account not verified!</AlertTitle>
                    <AlertDescription fontSize="sm">
                      Please verify your email before changing your password.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Current Password</FormLabel>
                  <Input 
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    isDisabled={isPasswordLoading}
                    borderRadius="lg"
                    placeholder="Enter your current password"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">New Password</FormLabel>
                  <Input 
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    isDisabled={isPasswordLoading}
                    borderRadius="lg"
                    placeholder="Enter your new password"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Minimum 8 characters with letters and numbers
                  </Text>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Confirm New Password</FormLabel>
                  <Input 
                    type="password"
                    name="new_password_confirmation"
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordChange}
                    isDisabled={isPasswordLoading}
                    borderRadius="lg"
                    placeholder="Confirm your new password"
                  />
                  {passwordData.new_password && 
                   passwordData.new_password_confirmation && 
                   passwordData.new_password !== passwordData.new_password_confirmation && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      Passwords do not match
                    </Text>
                  )}
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <HStack spacing={3}>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsPasswordModalOpen(false)}
                  isDisabled={isPasswordLoading}
                  borderRadius="full"
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handlePasswordUpdate}
                  isLoading={isPasswordLoading}
                  loadingText="Updating..."
                  isDisabled={!passwordData.current_password || 
                             !passwordData.new_password || 
                             passwordData.new_password !== passwordData.new_password_confirmation ||
                             passwordData.new_password.length < 8}
                  borderRadius="full"
                  px={6}
                >
                  Update Password
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default TouristDashboard;