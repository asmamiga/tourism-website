import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  SimpleGrid,
  Input,
  Textarea,
  Avatar,
  Badge,
  Divider,
  IconButton,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { FaPlus, FaHeart, FaComment, FaShare, FaFilter, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const CommunityForumPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  
  // Load posts
  useEffect(() => {
    // In a real app, you would fetch posts from an API
    // For now, we'll use mock data
    setTimeout(() => {
      const mockPosts = [
        {
          id: 1,
          title: 'Best time to visit Chefchaouen?',
          content: 'I\'m planning a trip to the Blue City. When is the best time to visit for good weather and fewer tourists?',
          author: {
            id: 101,
            name: 'Sarah Johnson',
            avatar: null,
          },
          category: 'travel_advice',
          likes: 24,
          comments: 15,
          created_at: '2025-05-20T14:30:00Z',
          tags: ['chefchaouen', 'blue_city', 'travel_tips']
        },
        {
          id: 2,
          title: 'Sahara Desert Tour Recommendations',
          content: 'Has anyone done a Sahara desert tour recently? Looking for recommendations on tour companies and what to expect.',
          author: {
            id: 102,
            name: 'Michael Chen',
            avatar: null,
          },
          category: 'recommendations',
          likes: 18,
          comments: 22,
          created_at: '2025-05-19T09:15:00Z',
          tags: ['sahara', 'desert_tour', 'recommendations']
        },
        {
          id: 3,
          title: 'Traditional Moroccan Recipes',
          content: 'I just got back from Morocco and want to recreate some of the amazing dishes I tried. Anyone have authentic recipes for tagine and couscous?',
          author: {
            id: 103,
            name: 'Emma Rodriguez',
            avatar: null,
          },
          category: 'food_and_culture',
          likes: 32,
          comments: 28,
          created_at: '2025-05-18T16:45:00Z',
          tags: ['moroccan_food', 'recipes', 'tagine', 'couscous']
        },
        {
          id: 4,
          title: 'Photography Spots in Marrakech',
          content: 'Heading to Marrakech next month with my camera. What are some must-visit spots for photography enthusiasts?',
          author: {
            id: 104,
            name: 'David Kim',
            avatar: null,
          },
          category: 'photography',
          likes: 41,
          comments: 19,
          created_at: '2025-05-17T11:20:00Z',
          tags: ['marrakech', 'photography', 'travel_photography']
        },
        {
          id: 5,
          title: 'Safety Tips for Solo Female Travelers',
          content: 'I\'m planning my first solo trip to Morocco as a woman. Any safety tips or advice from those who have done it?',
          author: {
            id: 105,
            name: 'Lisa Thompson',
            avatar: null,
          },
          category: 'travel_advice',
          likes: 56,
          comments: 37,
          created_at: '2025-05-16T08:10:00Z',
          tags: ['solo_travel', 'female_travelers', 'safety', 'travel_tips']
        }
      ];
      
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Handle creating a new post
  const handleCreatePost = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to create a post',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a title and content for your post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // In a real app, you would send this to an API
    const newPost = {
      id: Date.now(),
      title: newPostTitle,
      content: newPostContent,
      author: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        avatar: user.avatar,
      },
      category: newPostCategory,
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString(),
      tags: newPostContent.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || []
    };
    
    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostForm(false);
    
    toast({
      title: 'Post created',
      description: 'Your post has been published successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle post like
  const handleLike = (postId) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to like posts',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    }));
  };
  
  // Filter posts based on category and search query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = filter === 'all' || post.category === filter;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <Box py={10}>
      <Container maxW="container.xl">
        <Heading as="h1" mb={2}>Community Forum</Heading>
        <Text mb={8} color="gray.600">
          Connect with fellow travelers, share experiences, and get advice
        </Text>
        
        {/* Search and Filter */}
        <Flex 
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          mb={6}
          gap={4}
        >
          <Flex flex={1} gap={4}>
            <Flex flex={1} align="center">
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                borderRadius="md"
              />
              <IconButton
                icon={<FaSearch />}
                colorScheme="green"
                ml={2}
                aria-label="Search"
              />
            </Flex>
            
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              width={{ base: 'full', md: '200px' }}
              bg="white"
              borderRadius="md"
            >
              <option value="all">All Categories</option>
              <option value="travel_advice">Travel Advice</option>
              <option value="recommendations">Recommendations</option>
              <option value="food_and_culture">Food & Culture</option>
              <option value="photography">Photography</option>
              <option value="general">General Discussion</option>
            </Select>
          </Flex>
          
          <Button
            leftIcon={<FaPlus />}
            colorScheme="green"
            onClick={() => setShowNewPostForm(!showNewPostForm)}
          >
            New Post
          </Button>
        </Flex>
        
        {/* New Post Form */}
        {showNewPostForm && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            mb={6}
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="md"
          >
            <Heading as="h3" size="md" mb={4}>Create a New Post</Heading>
            
            <Input
              placeholder="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              mb={4}
            />
            
            <Select
              value={newPostCategory}
              onChange={(e) => setNewPostCategory(e.target.value)}
              mb={4}
            >
              <option value="travel_advice">Travel Advice</option>
              <option value="recommendations">Recommendations</option>
              <option value="food_and_culture">Food & Culture</option>
              <option value="photography">Photography</option>
              <option value="general">General Discussion</option>
            </Select>
            
            <Textarea
              placeholder="Write your post here... Use #hashtags to add tags"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              minHeight="150px"
              mb={4}
            />
            
            <Flex justify="flex-end" gap={3}>
              <Button
                variant="outline"
                onClick={() => setShowNewPostForm(false)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleCreatePost}
              >
                Publish Post
              </Button>
            </Flex>
          </MotionBox>
        )}
        
        {/* Posts */}
        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner color="brand.primary" size="xl" />
          </Flex>
        ) : filteredPosts.length === 0 ? (
          <Box textAlign="center" py={10} bg="white" borderRadius="lg">
            <Text fontSize="lg" color="gray.500">
              No posts found matching your criteria
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={6}>
            {filteredPosts.map((post) => (
              <MotionBox
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                p={6}
                bg="white"
                borderRadius="lg"
                boxShadow="md"
                _hover={{ boxShadow: 'lg' }}
              >
                <Flex justify="space-between" align="flex-start" mb={2}>
                  <Heading as="h3" size="md">{post.title}</Heading>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                    {post.category.replace('_', ' ')}
                  </Badge>
                </Flex>
                
                <Text mb={4}>{post.content}</Text>
                
                {post.tags.length > 0 && (
                  <Flex wrap="wrap" gap={2} mb={4}>
                    {post.tags.map(tag => (
                      <Badge key={tag} colorScheme="blue" variant="subtle">
                        #{tag}
                      </Badge>
                    ))}
                  </Flex>
                )}
                
                <Divider mb={4} />
                
                <Flex justify="space-between" align="center">
                  <Flex align="center">
                    <Avatar 
                      size="sm" 
                      name={post.author.name} 
                      src={post.author.avatar} 
                      mr={2} 
                    />
                    <Box>
                      <Text fontWeight="medium" fontSize="sm">
                        {post.author.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(post.created_at)}
                      </Text>
                    </Box>
                  </Flex>
                  
                  <Flex gap={4}>
                    <Button
                      leftIcon={<FaHeart />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleLike(post.id)}
                    >
                      {post.likes}
                    </Button>
                    <Button
                      leftIcon={<FaComment />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                    >
                      {post.comments}
                    </Button>
                    <IconButton
                      icon={<FaShare />}
                      size="sm"
                      variant="ghost"
                      colorScheme="green"
                      aria-label="Share"
                    />
                  </Flex>
                </Flex>
              </MotionBox>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default CommunityForumPage;
