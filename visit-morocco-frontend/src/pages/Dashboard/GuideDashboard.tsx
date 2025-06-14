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
  Tooltip, Alert, AlertIcon, AlertTitle, AlertDescription, Select
} from '@chakra-ui/react';
import { 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign, 
  FiStar, 
  FiEdit2, 
  FiUser, 
  FiBriefcase, 
  FiMap, 
  FiCompass,
  FiCamera,
  FiUpload,
  FiTrendingUp,
  FiEye,
  FiGlobe,
  FiPhone,
  FiMail,
  FiClock,
  FiUsers,
  FiPlus,
  FiMessageSquare,
  FiBarChart2,
  FiHeart,
  FiBookmark,
  FiSettings,
  FiCheckCircle
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

interface Session {
  id: number;
  title?: string;
  date: string;
  time: string;
  client: string;
  status?: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  start_time?: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user?: {
    first_name: string;
  };
}

interface GuideData {
  guide_id: number;
  user_id: number;
  bio?: string;
  experience_years?: number;
  languages?: string[];
  specialties?: string[];
  daily_rate?: number;
  is_available: boolean;
  is_approved: boolean;
  identity_verification?: string;
  guide_license?: string;
  full_name?: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    profile_picture?: string;
    profile_picture_url?: string;
  };
}

interface DashboardData {
  stats?: {
    upcoming_sessions?: number;
    completed_sessions?: number;
    total_earnings?: number;
    average_rating?: number;
    total_reviews?: number;
    total_clients?: number;
    earnings_this_month?: number;
  };
  upcoming?: Session[];
  recent_reviews?: Review[];
}

const GuideDashboard: React.FC<{ data?: DashboardData }> = ({ data = {} }) => {
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
  
  const formatGuideData = (user: any): GuideData => {
    const profilePicture = user?.profile_picture_url || user?.profile_picture || user?.avatar;
    
    return {
      guide_id: user?.guide_id || 0,
      user_id: user?.user_id || user?.id || 0,
      bio: user?.bio || '',
      experience_years: user?.experience_years || 0,
      languages: user?.languages || [],
      specialties: user?.specialties || [],
      daily_rate: user?.daily_rate || 0,
      is_available: user?.is_available || false,
      is_approved: user?.is_approved || false,
      identity_verification: user?.identity_verification,
      guide_license: user?.guide_license,
      full_name: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
      user: {
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        profile_picture: profilePicture,
        profile_picture_url: profilePicture
      }
    };
  };

  const [guideData, setGuideData] = useState<GuideData>(formatGuideData(authUser));
  const [editData, setEditData] = useState<GuideData>(formatGuideData(authUser));

  useEffect(() => {
    if (authUser) {
      const formattedGuide = formatGuideData(authUser);
      setGuideData(formattedGuide);
      setEditData(formattedGuide);
    }
  }, [authUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('user.')) {
      const userField = name.split('.')[1];
      setEditData(prev => ({
        ...prev,
        user: {
          ...prev.user!,
          [userField]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayInputChange = (name: string, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
    setEditData(prev => ({
      ...prev,
      [name]: arrayValue
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

    setSelectedFile(null);
    setPreviewUrl('');
    
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
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `File size exceeds the 5MB limit.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    const previewUrl = URL.createObjectURL(file);
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
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      if (response.data && (response.data.profile_picture_url || response.data.profile_picture)) {
        const profilePictureUrl = response.data.profile_picture_url || response.data.profile_picture;
        
        setGuideData(prev => ({
          ...prev,
          user: {
            ...prev.user!,
            profile_picture: profilePictureUrl
          }
        }));
        
        setPreviewUrl(profilePictureUrl);
        return profilePictureUrl;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      throw new Error('Failed to upload profile picture');
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
          
          setEditData(prev => ({
            ...prev,
            user: {
              ...prev.user!,
              profile_picture: newProfilePictureUrl
            }
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
        ...editData.user,
        bio: editData.bio,
        experience_years: editData.experience_years,
        languages: editData.languages,
        specialties: editData.specialties,
        daily_rate: editData.daily_rate,
        is_available: editData.is_available
      };
      
      const response = await axios.put(`${baseURL}${apiPath}`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      const updatedGuide = formatGuideData(response.data.user);
      setGuideData(updatedGuide);
      setEditData(updatedGuide);
      
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
      
      toast({
        title: 'Profile updated successfully',
        description: 'Your guide profile has been saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { 
      title: 'Create New Tour', 
      icon: FiPlus, 
      route: '/tours/new',
      color: 'blue',
      description: 'Add new tour packages'
    },
    { 
      title: 'View Schedule', 
      icon: FiCalendar, 
      route: '/schedule',
      color: 'green',
      description: 'Manage your bookings'
    },
    { 
      title: 'Messages', 
      icon: FiMessageSquare, 
      route: '/messages',
      color: 'purple',
      description: 'Chat with clients'
    },
    { 
      title: 'Earnings Report', 
      icon: FiBarChart2, 
      route: '/earnings',
      color: 'orange',
      description: 'Track your income'
    }
  ];

  const getStatusBadgeColor = (isApproved: boolean, isAvailable: boolean) => {
    if (!isApproved) return 'red';
    if (isApproved && isAvailable) return 'green';
    return 'yellow';
  };

  const getStatusText = (isApproved: boolean, isAvailable: boolean) => {
    if (!isApproved) return 'Pending Approval';
    if (isApproved && isAvailable) return 'Available';
    return 'Unavailable';
  };

  const mockStats = [
    { title: 'Upcoming Sessions', value: data.stats?.upcoming_sessions || 3, icon: FiCalendar, color: 'blue', trend: 12 },
    { title: 'Completed Tours', value: data.stats?.completed_sessions || 24, icon: FiCheckCircle, color: 'green', trend: 8 },
    { title: 'Total Earnings', value: `$${data.stats?.total_earnings || 2450}`, icon: FiDollarSign, color: 'purple', trend: 15 },
    { title: 'Average Rating', value: `${data.stats?.average_rating || 4.8}/5`, icon: FiStar, color: 'yellow', trend: 5 }
  ];

  const mockUpcomingSessions = data.upcoming || [
    { id: 1, title: 'Atlas Mountains Tour', date: '2025-06-15', time: '09:00', client: 'John Doe', status: 'confirmed' },
    { id: 2, title: 'Fes Medina Walk', date: '2025-06-16', time: '14:00', client: 'Jane Smith', status: 'pending' }
  ];

  const mockRecentReviews = data.recent_reviews || [
    { id: 1, rating: 5, comment: 'Amazing tour guide! Very knowledgeable and friendly. Showed us hidden gems of the city.', created_at: '2025-06-10', user: { first_name: 'Sarah' } },
    { id: 2, rating: 4, comment: 'Great experience, would recommend! Professional and punctual.', created_at: '2025-06-08', user: { first_name: 'Mike' } }
  ];

  return (
    <Box bg={bgColor} minH="100vh" py={20}>
      <Container maxW="container.xl" px={{ base: 4, md: 6, lg: 8 }}>        
        {/* Guide Profile Section */}
        <Card mb={8} bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <Flex direction={{ base: 'column', lg: 'row' }} gap={8} align="center">
              <VStack spacing={4} minW="200px">
                <Box position="relative">
                  <Avatar 
                    size="2xl" 
                    name={guideData.full_name || `${guideData.user?.first_name} ${guideData.user?.last_name}`}
                    src={guideData.user?.profile_picture || undefined}
                    border="4px solid"
                    borderColor={avatarBorderColor}
                    shadow="xl"
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
                  
                  <Badge 
                    colorScheme={getStatusBadgeColor(guideData.is_approved, guideData.is_available)} 
                    variant="subtle" 
                    fontSize="xs"
                  >
                    {getStatusText(guideData.is_approved, guideData.is_available)}
                  </Badge>
                </VStack>
              </VStack>
              
              <Box flex={1} w="100%">
                <VStack align="start" spacing={6}>
                  <HStack justify="space-between" w="100%" flexWrap="wrap">
                    <VStack align="start" spacing={2}>
                      <Heading size="xl" color={textColor}>
                        {guideData.full_name || `${guideData.user?.first_name} ${guideData.user?.last_name}`}
                      </Heading>
                      <HStack spacing={2}>
                        <Icon as={FiMail} color={mutedColor} />
                        <Text color={mutedColor}>{guideData.user?.email}</Text>
                      </HStack>
                      {guideData.user?.phone && (
                        <HStack spacing={2}>
                          <Icon as={FiPhone} color={mutedColor} />
                          <Text color={mutedColor}>{guideData.user?.phone}</Text>
                        </HStack>
                      )}
                      {guideData.daily_rate && (
                        <HStack spacing={2}>
                          <Icon as={FiDollarSign} color={mutedColor} />
                          <Text color={mutedColor}>${guideData.daily_rate}/day</Text>
                        </HStack>
                      )}
                    </VStack>
                    
                    <VStack align="end" spacing={2}>
                      <Badge 
                        colorScheme="green" 
                        variant="solid"
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        Professional Guide
                      </Badge>
                      <Text fontSize="sm" color={mutedColor}>
                        {guideData.experience_years || 0} years experience
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Divider />
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%">
                    <Box>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold" color={textColor}>Specialties</Text>
                        <Wrap spacing={2}>
                          {guideData.specialties && guideData.specialties.length > 0 ? (
                            guideData.specialties.map((specialty, index) => (
                              <WrapItem key={index}>
                                <Badge colorScheme="blue" variant="subtle">
                                  {specialty}
                                </Badge>
                              </WrapItem>
                            ))
                          ) : (
                            <Text color={mutedColor} fontSize="sm">No specialties listed</Text>
                          )}
                        </Wrap>
                      </VStack>
                    </Box>
                    
                    <Box>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold" color={textColor}>Languages</Text>
                        <Wrap spacing={2}>
                          {guideData.languages && guideData.languages.length > 0 ? (
                            guideData.languages.map((language, index) => (
                              <WrapItem key={index}>
                                <Badge colorScheme="purple" variant="subtle">
                                  {language}
                                </Badge>
                              </WrapItem>
                            ))
                          ) : (
                            <Text color={mutedColor} fontSize="sm">No languages listed</Text>
                          )}
                        </Wrap>
                      </VStack>
                    </Box>
                    
                    <Box>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold" color={textColor}>About</Text>
                        <Text color={mutedColor} fontSize="sm" noOfLines={3}>
                          {guideData.bio || 'No bio available. Add your story to attract more clients!'}
                        </Text>
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <Box mb={8}>
          <VStack spacing={4} mb={6}>
            <Heading size="lg" color={textColor}>Dashboard Overview</Heading>
            <Text color={mutedColor} textAlign="center">
              Track your performance and grow your guiding business
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {mockStats.map((stat, index) => (
              <DashboardCard 
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                trend={stat.trend}
              />
            ))}
          </SimpleGrid>
        </Box>

        {/* Quick Actions */}
        <Box mb={8}>
          <VStack spacing={4} mb={6}>
            <Heading size="lg" color={textColor}>Quick Actions</Heading>
            <Text color={mutedColor} textAlign="center">
              Manage your tours and connect with clients
            </Text>
          </VStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {quickActions.map((action, index) => (
              <QuickAction 
                key={index}
                title={action.title}
                icon={action.icon}
                to={action.route}
                color={action.color}
                description={action.description}
              />
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};
export default GuideDashboard;