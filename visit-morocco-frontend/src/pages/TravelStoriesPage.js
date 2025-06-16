"use client"

import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Input,
  Select,
  Button,
  Badge,
  Image,
  Stack,
  Spinner,
  Avatar,
  HStack,
  VStack,
  Tag,
  TagLabel,
  IconButton,
  useToast,
  Tooltip,
  AspectRatio,
  Textarea,
  Divider,
  Collapse,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react"
import {
  FaSearch,
  FaMapMarkerAlt,
  FaHeart,
  FaEye,
  FaComment,
  FaShare,
  FaBookmark,
  FaClock,
  FaHashtag,
  FaPaperPlane,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"

const MotionBox = motion(Box)
const MotionGrid = motion(SimpleGrid)

// Enhanced mock data with comments
const mockStories = [
  {
    story_id: 1,
    title: "Exploring the Blue City of Chefchaouen",
    excerpt:
      "My journey through the stunning blue streets and alleys of this magical Moroccan city, discovering hidden cafes and meeting local artisans.",
    content:
      'Chefchaouen, often simply referred to as the "Blue City," is a destination unlike any other. Nestled in the Rif Mountains of Morocco, this town is famous for its blue-painted buildings that create a dreamlike atmosphere...',
    author: {
      user_id: 101,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      followers: 1250,
      stories: 23,
    },
    location: "Chefchaouen",
    published_date: "2024-04-15",
    image: "https://images.unsplash.com/photo-1548019865-9f1d6f957fa5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 124,
    views: 2340,
    comments: 18,
    reading_time: 8,
    tags: ["cities", "photography", "culture", "architecture"],
    featured: true,
    category: "City Guide",
    commentsList: [
      {
        id: 1,
        content: "Amazing photos! Chefchaouen is definitely on my bucket list now. How long did you spend there?",
        author: {
          id: 201,
          name: "Ahmed Hassan",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        },
        created_at: "2024-04-16T10:30:00Z",
        likes: 12,
      },
      {
        id: 2,
        content: "The blue walls are so photogenic! Did you have any trouble with photography restrictions?",
        author: {
          id: 202,
          name: "Maria Garcia",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        },
        created_at: "2024-04-16T14:20:00Z",
        likes: 8,
      },
    ],
  },
  {
    story_id: 2,
    title: "Desert Adventure in the Sahara",
    excerpt:
      "Camping under the stars and riding camels through the golden dunes of the Sahara desert - an experience that changed my perspective on travel.",
    content:
      "There is something magical about the Sahara Desert that can't be captured in words or pictures. The vast expanse of golden sand dunes stretching as far as the eye can see creates a sense of both awe and tranquility...",
    author: {
      user_id: 102,
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      followers: 890,
      stories: 31,
    },
    location: "Merzouga",
    published_date: "2024-05-22",
    image: "https://images.unsplash.com/photo-1548107121-ba49a240bc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 98,
    views: 1876,
    comments: 12,
    reading_time: 12,
    tags: ["desert", "adventure", "camping", "sahara"],
    featured: false,
    category: "Adventure",
    commentsList: [
      {
        id: 3,
        content: "This sounds incredible! How cold does it get at night in the desert?",
        author: {
          id: 203,
          name: "Emma Wilson",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
        },
        created_at: "2024-05-23T09:15:00Z",
        likes: 5,
      },
    ],
  },
  // Add more stories with comments...
  {
    story_id: 3,
    title: "A Food Tour Through Marrakech",
    excerpt:
      "Discovering the rich flavors and culinary traditions of Morocco in the vibrant markets of Marrakech, from street food to fine dining.",
    content:
      "Marrakech is a paradise for food lovers. The city's medina is filled with food stalls and restaurants offering a wide variety of Moroccan dishes that tantalize all the senses...",
    author: {
      user_id: 103,
      name: "Emma Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      followers: 2100,
      stories: 45,
    },
    location: "Marrakech",
    published_date: "2024-06-10",
    image:
      "https://images.unsplash.com/photo-1534680564476-afd401f3a4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 156,
    views: 3200,
    comments: 24,
    reading_time: 10,
    tags: ["food", "culture", "markets", "cuisine"],
    featured: true,
    category: "Food & Culture",
    commentsList: [],
  },
  {
    story_id: 4,
    title: "Hiking the Atlas Mountains",
    excerpt:
      "An unforgettable trekking experience through Morocco's stunning mountain range, meeting Berber communities and discovering hidden valleys.",
    content:
      "The Atlas Mountains offer some of the most breathtaking landscapes in North Africa. From lush valleys to snow-capped peaks, the diversity of terrain makes it a hiker's paradise...",
    author: {
      user_id: 104,
      name: "David Wilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      followers: 756,
      stories: 18,
    },
    location: "Atlas Mountains",
    published_date: "2024-07-05",
    image:
      "https://images.unsplash.com/photo-1602828889956-05669de1bc36?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 85,
    views: 1543,
    comments: 9,
    reading_time: 15,
    tags: ["hiking", "mountains", "nature", "berber"],
    featured: false,
    category: "Adventure",
    commentsList: [],
  },
  {
    story_id: 5,
    title: "Ancient Wonders of Fes",
    excerpt:
      "Exploring the medieval medina and cultural heritage of Morocco's oldest imperial city, from ancient madrasas to traditional crafts.",
    content:
      "Walking through Fes feels like stepping back in time. The ancient medina, with its narrow winding streets and historic buildings, is a UNESCO World Heritage site and one of the most well-preserved medieval cities in the world...",
    author: {
      user_id: 105,
      name: "Olivia Taylor",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      followers: 1680,
      stories: 29,
    },
    location: "Fes",
    published_date: "2024-08-18",
    image:
      "https://images.unsplash.com/photo-1528657249085-893fde56bf4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 112,
    views: 2100,
    comments: 16,
    reading_time: 11,
    tags: ["history", "architecture", "culture", "unesco"],
    featured: true,
    category: "History & Culture",
    commentsList: [],
  },
  {
    story_id: 6,
    title: "Coastal Escape: Essaouira",
    excerpt:
      "Wind surfing, fresh seafood, and relaxing vibes in this charming coastal town that perfectly balances adventure and tranquility.",
    content:
      "Essaouira offers a perfect blend of beach, culture, and relaxation. Known for its strong winds, it's a paradise for windsurfers and kitesurfers, while the historic medina and port provide cultural richness...",
    author: {
      user_id: 106,
      name: "James Anderson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      followers: 934,
      stories: 22,
    },
    location: "Essaouira",
    published_date: "2024-09-02",
    image:
      "https://images.unsplash.com/photo-1575237334046-a1050de4f5a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 78,
    views: 1456,
    comments: 11,
    reading_time: 7,
    tags: ["beach", "watersports", "relaxation", "coastal"],
    featured: false,
    category: "Beach & Coast",
    commentsList: [],
  },
  {
    story_id: 7,
    title: "Surfing the Atlantic Coast",
    excerpt:
      "Discovering Morocco's incredible surf spots along the Atlantic coastline, from beginner-friendly breaks to challenging reef breaks.",
    content:
      "Morocco's Atlantic coast offers some of the best surfing in North Africa. From Taghazout's world-class point breaks to the mellow waves of Essaouira...",
    author: {
      user_id: 107,
      name: "Jake Morrison",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      followers: 1420,
      stories: 27,
    },
    location: "Taghazout",
    published_date: "2024-10-12",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 89,
    views: 1678,
    comments: 14,
    reading_time: 9,
    tags: ["surfing", "atlantic", "taghazout", "watersports"],
    featured: false,
    category: "Adventure",
    commentsList: [
      {
        id: 8,
        content:
          "Taghazout is a surfer's paradise! The waves are consistent and the vibe is so chill. Did you stay in any surf camps?",
        author: {
          id: 208,
          name: "Carlos Silva",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        },
        created_at: "2024-10-13T08:30:00Z",
        likes: 7,
      },
    ],
  },
  {
    story_id: 8,
    title: "Berber Villages of the High Atlas",
    excerpt:
      "A cultural immersion into traditional Berber life, staying with local families and learning ancient customs in remote mountain villages.",
    content:
      "The High Atlas Mountains are home to indigenous Berber communities who have preserved their traditional way of life for centuries...",
    author: {
      user_id: 108,
      name: "Amina Tazi",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      followers: 2340,
      stories: 52,
    },
    location: "Imlil",
    published_date: "2024-11-05",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 167,
    views: 2890,
    comments: 31,
    reading_time: 14,
    tags: ["berber", "culture", "mountains", "authentic"],
    featured: true,
    category: "History & Culture",
    commentsList: [
      {
        id: 9,
        content: "What an authentic experience! How did you arrange the homestay with the Berber families?",
        author: {
          id: 209,
          name: "Hassan Benali",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        },
        created_at: "2024-11-06T10:15:00Z",
        likes: 12,
      },
    ],
  },
  {
    story_id: 9,
    title: "Casablanca's Art Deco Architecture",
    excerpt:
      "Exploring the stunning Art Deco buildings and modern architecture that make Casablanca a unique blend of European and Moroccan design.",
    content:
      "Casablanca is often overlooked by tourists, but the city boasts some of the finest Art Deco architecture in the world...",
    author: {
      user_id: 109,
      name: "Pierre Dubois",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      followers: 890,
      stories: 19,
    },
    location: "Casablanca",
    published_date: "2024-11-18",
    image:
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 73,
    views: 1234,
    comments: 8,
    reading_time: 6,
    tags: ["architecture", "art_deco", "casablanca", "design"],
    featured: false,
    category: "City Guide",
    commentsList: [],
  },
  {
    story_id: 10,
    title: "Spice Markets and Souks of Marrakech",
    excerpt:
      "A sensory journey through the bustling souks of Marrakech, learning about traditional spices, haggling techniques, and hidden market gems.",
    content:
      "The souks of Marrakech are a feast for the senses. The air is filled with the aroma of exotic spices, the sound of merchants calling out their wares...",
    author: {
      user_id: 110,
      name: "Rajesh Patel",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      followers: 1567,
      stories: 33,
    },
    location: "Marrakech",
    published_date: "2024-12-01",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 134,
    views: 2456,
    comments: 19,
    reading_time: 11,
    tags: ["markets", "spices", "shopping", "culture"],
    featured: true,
    category: "Food & Culture",
    commentsList: [
      {
        id: 10,
        content:
          "The spice markets are incredible! Did you learn any good haggling tips? I always feel like I'm paying too much.",
        author: {
          id: 210,
          name: "Jennifer Walsh",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        },
        created_at: "2024-12-02T14:20:00Z",
        likes: 9,
      },
    ],
  },
]

const CommentItem = ({ comment, onLikeComment }) => {
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLikeComment(comment.id)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays}d ago`
  }

  return (
    <Flex align="flex-start" gap={3} mb={4}>
      <Avatar size="sm" src={comment.author.avatar} name={comment.author.name} />
      <Box flex={1}>
        <Box bg="gray.50" borderRadius="lg" p={3} mb={2}>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontWeight="semibold" fontSize="sm" color="gray.800">
              {comment.author.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatDate(comment.created_at)}
            </Text>
          </Flex>
          <Text fontSize="sm" color="gray.700" lineHeight="1.5">
            {comment.content}
          </Text>
        </Box>

        <Button
          size="xs"
          variant="ghost"
          leftIcon={<FaHeart />}
          colorScheme={isLiked ? "red" : "gray"}
          onClick={handleLike}
        >
          {comment.likes + (isLiked ? 1 : 0)}
        </Button>
      </Box>
    </Flex>
  )
}

const CommentsSection = ({ story, onAddComment, onLikeComment }) => {
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(false)

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(story.story_id, newComment)
      setNewComment("")
    }
  }

  return (
    <Box mt={4}>
      <Button
        size="sm"
        variant="ghost"
        leftIcon={showComments ? <FaChevronUp /> : <FaChevronDown />}
        onClick={() => setShowComments(!showComments)}
        colorScheme="blue"
        rightIcon={<FaComment />}
      >
        {story.commentsList?.length || 0} Comments
      </Button>

      <Collapse in={showComments} animateOpacity>
        <Box mt={4} p={4} bg="gray.50" borderRadius="lg">
          {/* Add Comment Form */}
          <Box mb={4}>
            <Textarea
              placeholder="Share your thoughts about this story..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              resize="none"
              rows={3}
              mb={2}
              bg="white"
            />
            <Flex justify="flex-end">
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FaPaperPlane />}
                onClick={handleAddComment}
                isDisabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </Flex>
          </Box>

          <Divider mb={4} />

          {/* Comments List */}
          {story.commentsList && story.commentsList.length > 0 ? (
            <VStack align="stretch" spacing={0}>
              {story.commentsList.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onLikeComment={onLikeComment} />
              ))}
            </VStack>
          ) : (
            <Text color="gray.500" textAlign="center" py={4}>
              No comments yet. Be the first to share your thoughts!
            </Text>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

const StoryCard = ({
  story,
  onLike,
  onBookmark,
  onShare,
  onAddComment,
  onLikeComment,
  setSelectedUser,
  profileModal,
}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const toast = useToast()

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike(story.story_id)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    onBookmark(story.story_id)
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      status: "success",
      duration: 2000,
      isClosable: true,
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      "City Guide": "blue",
      Adventure: "green",
      "Food & Culture": "orange",
      "History & Culture": "purple",
      "Beach & Coast": "cyan",
    }
    return colors[category] || "gray"
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      position="relative"
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
      border="1px solid rgba(0, 0, 0, 0.05)"
      _hover={{
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
      }}
      transition="all 0.4s ease"
    >
      {/* Featured Badge */}
      {story.featured && (
        <Box
          position="absolute"
          top={4}
          left={4}
          bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          color="white"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
          zIndex={2}
          boxShadow="0 4px 15px rgba(245, 87, 108, 0.4)"
        >
          ⭐ Featured
        </Box>
      )}

      {/* Bookmark Button */}
      <IconButton
        icon={<FaBookmark />}
        position="absolute"
        top={4}
        right={4}
        size="sm"
        variant="ghost"
        colorScheme={isBookmarked ? "yellow" : "gray"}
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(10px)"
        borderRadius="full"
        zIndex={2}
        onClick={handleBookmark}
        _hover={{
          transform: "scale(1.1)",
          bg: "rgba(255, 255, 255, 1)",
        }}
      />

      {/* Image */}
      <AspectRatio ratio={16 / 9}>
        <Image
          src={story.image || "/placeholder.svg"}
          alt={story.title}
          objectFit="cover"
          transition="transform 0.5s ease"
          _hover={{ transform: "scale(1.05)" }}
        />
      </AspectRatio>

      {/* Content */}
      <Box p={6}>
        {/* Category and Reading Time */}
        <Flex justify="space-between" align="center" mb={3}>
          <Badge
            colorScheme={getCategoryColor(story.category)}
            variant="subtle"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="semibold"
          >
            {story.category}
          </Badge>
          <HStack spacing={1} fontSize="xs" color="gray.500">
            <FaClock />
            <Text>{story.reading_time} min read</Text>
          </HStack>
        </Flex>

        {/* Title */}
        <Heading
          as="h3"
          size="md"
          mb={3}
          color="gray.800"
          lineHeight="1.3"
          _hover={{ color: "blue.600" }}
          cursor="pointer"
          transition="color 0.2s"
        >
          {story.title}
        </Heading>

        {/* Excerpt */}
        <Text color="gray.600" mb={4} lineHeight="1.6" noOfLines={3} fontSize="sm">
          {story.excerpt}
        </Text>

        {/* Tags */}
        <Flex wrap="wrap" gap={2} mb={4}>
          {story.tags.slice(0, 3).map((tag, index) => (
            <Tag
              key={index}
              size="sm"
              variant="subtle"
              colorScheme="blue"
              borderRadius="full"
              cursor="pointer"
              _hover={{ bg: "blue.100" }}
            >
              <FaHashtag size="8px" />
              <TagLabel ml={1}>{tag}</TagLabel>
            </Tag>
          ))}
          {story.tags.length > 3 && (
            <Tag size="sm" variant="subtle" colorScheme="gray" borderRadius="full">
              +{story.tags.length - 3}
            </Tag>
          )}
        </Flex>

        {/* Author Info */}
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <Avatar
              size="sm"
              src={story.author.avatar}
              name={story.author.name}
              border="2px solid"
              borderColor="blue.100"
              cursor="pointer"
              _hover={{ transform: "scale(1.05)", borderColor: "pink.300" }}
              onClick={() => {
                setSelectedUser(story.author)
                profileModal.onOpen()
              }}
            />
            <VStack align="flex-start" spacing={0}>
              <Text
                fontWeight="semibold"
                fontSize="sm"
                color="gray.800"
                cursor="pointer"
                _hover={{ color: "pink.600" }}
                onClick={() => {
                  setSelectedUser(story.author)
                  profileModal.onOpen()
                }}
              >
                {story.author.name}
              </Text>
              <HStack spacing={3} fontSize="xs" color="gray.500">
                <HStack spacing={1}>
                  <FaMapMarkerAlt />
                  <Text>{story.location}</Text>
                </HStack>
                <Text>•</Text>
                <Text>{formatDate(story.published_date)}</Text>
              </HStack>
            </VStack>
          </HStack>
        </Flex>

        {/* Stats and Actions */}
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={4} fontSize="sm" color="gray.500">
            <HStack spacing={1}>
              <FaEye />
              <Text>{story.views.toLocaleString()}</Text>
            </HStack>
            <HStack spacing={1}>
              <FaComment />
              <Text>{story.commentsList?.length || 0}</Text>
            </HStack>
          </HStack>

          <HStack spacing={2}>
            <Tooltip label={isLiked ? "Unlike" : "Like this story"}>
              <IconButton
                icon={<FaHeart />}
                size="sm"
                variant="ghost"
                colorScheme={isLiked ? "red" : "gray"}
                onClick={handleLike}
                _hover={{ transform: "scale(1.1)" }}
              />
            </Tooltip>

            <Tooltip label="Share story">
              <IconButton
                icon={<FaShare />}
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={() => onShare(story)}
                _hover={{ transform: "scale(1.1)" }}
              />
            </Tooltip>

            <Button
              as={RouterLink}
              to={`/stories/${story.story_id}`}
              size="sm"
              colorScheme="blue"
              variant="solid"
              borderRadius="full"
              px={4}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
              }}
            >
              Read Story
            </Button>
          </HStack>
        </Flex>

        {/* Comments Section */}
        <CommentsSection story={story} onAddComment={onAddComment} onLikeComment={onLikeComment} />
      </Box>
    </MotionBox>
  )
}

const TravelStoriesPage = () => {
  const toast = useToast()
  const [stories, setStories] = useState(mockStories)
  const [filteredStories, setFilteredStories] = useState(mockStories)
  const [loading, setLoading] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [sortBy, setSortBy] = useState("date")

  // Get unique values for filters
  const locations = [...new Set(stories.map((story) => story.location))]
  const categories = [...new Set(stories.map((story) => story.category))]
  const allTags = stories.reduce((tags, story) => {
    story.tags.forEach((tag) => {
      if (!tags.includes(tag)) {
        tags.push(tag)
      }
    })
    return tags
  }, [])

  // Filter and sort logic
  useEffect(() => {
    let results = stories

    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (story) =>
          story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply location filter
    if (selectedLocation) {
      results = results.filter((story) => story.location === selectedLocation)
    }

    // Apply category filter
    if (selectedCategory) {
      results = results.filter((story) => story.category === selectedCategory)
    }

    // Apply tag filter
    if (selectedTag) {
      results = results.filter((story) => story.tags.includes(selectedTag))
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.published_date) - new Date(a.published_date)
        case "likes":
          return b.likes - a.likes
        case "views":
          return b.views - a.views
        case "comments":
          return (b.commentsList?.length || 0) - (a.commentsList?.length || 0)
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredStories(results)
  }, [stories, searchTerm, selectedLocation, selectedCategory, selectedTag, sortBy])

  const handleReset = () => {
    setSearchTerm("")
    setSelectedLocation("")
    setSelectedCategory("")
    setSelectedTag("")
    setSortBy("date")
  }

  const handleLike = (storyId) => {
    setStories(stories.map((story) => (story.story_id === storyId ? { ...story, likes: story.likes + 1 } : story)))
  }

  const handleBookmark = (storyId) => {
    // In a real app, this would save to user's bookmarks
    console.log("Bookmarked story:", storyId)
  }

  const handleShare = (story) => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.excerpt,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Story link has been copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
    }
  }

  const handleAddComment = (storyId, commentText) => {
    const newComment = {
      id: Date.now(),
      content: commentText,
      author: {
        id: 999,
        name: "You",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      },
      created_at: new Date().toISOString(),
      likes: 0,
    }

    setStories(
      stories.map((story) => {
        if (story.story_id === storyId) {
          return {
            ...story,
            commentsList: [...(story.commentsList || []), newComment],
            comments: (story.commentsList?.length || 0) + 1,
          }
        }
        return story
      }),
    )

    toast({
      title: "Comment added!",
      description: "Your comment has been posted successfully",
      status: "success",
      duration: 2000,
      isClosable: true,
    })
  }

  const handleLikeComment = (commentId) => {
    setStories(
      stories.map((story) => ({
        ...story,
        commentsList: story.commentsList?.map((comment) =>
          comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment,
        ),
      })),
    )
  }

  const profileModal = useDisclosure()
  const [selectedUser, setSelectedUser] = useState(null)

  return (
    <Box minH="100vh" bg="gray.50" pt={{ base: 20, md: 24 }}>
      <Container maxW="container.xl" py={10}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          textAlign="center"
          mb={10}
        >
          <Heading as="h1" size="2xl" color="gray.800" mb={4}>
            Travel Stories
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
            Discover inspiring travel experiences and adventures from fellow explorers across Morocco
          </Text>
        </MotionBox>

        {/* Filters */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          bg="white"
          borderRadius="2xl"
          p={6}
          mb={8}
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
        >
          <Stack direction={{ base: "column", lg: "row" }} spacing={4} mb={4}>
            {/* Search */}
            <Box position="relative" flex={2}>
              <Input
                placeholder="Search stories, authors, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="gray.50"
                border="2px solid"
                borderColor="gray.100"
                borderRadius="xl"
                pl={10}
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                  bg: "white",
                }}
              />
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                <FaSearch />
              </Box>
            </Box>

            {/* Location Filter */}
            <Select
              placeholder="All Locations"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              bg="gray.50"
              borderRadius="xl"
              border="2px solid"
              borderColor="gray.100"
              _focus={{ bg: "white" }}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>

            {/* Category Filter */}
            <Select
              placeholder="All Categories"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              bg="gray.50"
              borderRadius="xl"
              border="2px solid"
              borderColor="gray.100"
              _focus={{ bg: "white" }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>

            {/* Tag Filter */}
            <Select
              placeholder="All Tags"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              bg="gray.50"
              borderRadius="xl"
              border="2px solid"
              borderColor="gray.100"
              _focus={{ bg: "white" }}
            >
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              bg="gray.50"
              borderRadius="xl"
              border="2px solid"
              borderColor="gray.100"
              _focus={{ bg: "white" }}
            >
              <option value="date">Latest</option>
              <option value="likes">Most Liked</option>
              <option value="views">Most Viewed</option>
              <option value="comments">Most Discussed</option>
              <option value="title">A-Z</option>
            </Select>
          </Stack>

          {/* Filter Summary */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={6} color="gray.600" fontSize="sm">
              <Text>
                <strong>{filteredStories.length}</strong> stories found
              </Text>
              <Text>•</Text>
              <Text>
                <strong>{filteredStories.filter((s) => s.featured).length}</strong> featured
              </Text>
            </HStack>

            {(searchTerm || selectedLocation || selectedCategory || selectedTag) && (
              <Button size="sm" variant="ghost" colorScheme="blue" onClick={handleReset}>
                Clear Filters
              </Button>
            )}
          </Flex>
        </MotionBox>

        {/* Stories Grid */}
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Flex>
        ) : filteredStories.length === 0 ? (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            bg="white"
            borderRadius="2xl"
            p={10}
            textAlign="center"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
          >
            <Text fontSize="lg" color="gray.600" mb={4}>
              No stories found matching your criteria
            </Text>
            <Button colorScheme="blue" onClick={handleReset}>
              Show All Stories
            </Button>
          </MotionBox>
        ) : (
          <MotionGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={8}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatePresence>
              {filteredStories.map((story, index) => (
                <MotionBox
                  key={story.story_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StoryCard
                    story={story}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                    onAddComment={handleAddComment}
                    onLikeComment={handleLikeComment}
                    setSelectedUser={setSelectedUser}
                    profileModal={profileModal}
                  />
                </MotionBox>
              ))}
            </AnimatePresence>
          </MotionGrid>
        )}
      </Container>

      {/* User Profile Modal */}
      <Modal isOpen={profileModal.isOpen} onClose={profileModal.onClose} size="md">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader>Travel Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedUser && (
              <VStack spacing={4} align="center">
                <Avatar
                  size="xl"
                  src={selectedUser.avatar}
                  name={selectedUser.name}
                  border="4px solid"
                  borderColor="pink.100"
                />
                <VStack spacing={2} textAlign="center">
                  <Heading size="md" color="gray.800">
                    {selectedUser.name}
                  </Heading>
                  <HStack spacing={6} color="gray.600">
                    <VStack spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">
                        {selectedUser.followers}
                      </Text>
                      <Text fontSize="sm">Followers</Text>
                    </VStack>
                    <VStack spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">
                        {selectedUser.stories}
                      </Text>
                      <Text fontSize="sm">Stories</Text>
                    </VStack>
                    <VStack spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">
                        {Math.floor(selectedUser.followers * 0.8)}
                      </Text>
                      <Text fontSize="sm">Following</Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme="pink" px={3} py={1} borderRadius="full">
                    {selectedUser.stories > 30 ? "Travel Expert" : "Explorer"}
                  </Badge>
                </VStack>
                <Text color="gray.600" textAlign="center" fontSize="sm">
                  Sharing travel stories since{" "}
                  {new Date(
                    2024 - Math.floor(selectedUser.stories / 12),
                    Math.floor(Math.random() * 12),
                  ).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="pink" mr={3} size="sm" bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              Follow
            </Button>
            <Button variant="ghost" size="sm">
              View Stories
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default TravelStoriesPage
