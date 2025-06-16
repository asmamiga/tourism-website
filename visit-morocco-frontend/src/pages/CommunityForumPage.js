"use client"

import { useState, useEffect } from "react"
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
  Select,
  Spinner,
  VStack,
  HStack,
  Tag,
  TagLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Collapse,
} from "@chakra-ui/react"
import {
  FaPlus,
  FaHeart,
  FaComment,
  FaShare,
  FaSearch,
  FaEye,
  FaClock,
  FaHashtag,
  FaBookmark,
  FaReply,
  FaChevronDown,
  FaChevronUp,
  FaPaperPlane,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

// Enhanced mock data with comments
const mockPosts = [
  {
    id: 1,
    title: "Best time to visit Chefchaouen?",
    content:
      "I'm planning a trip to the Blue City and wondering when is the best time to visit for good weather and fewer tourists? I've heard spring and fall are ideal, but I'd love to hear from people who have actually been there recently.",
    author: {
      id: 101,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      reputation: 245,
      posts: 23,
    },
    category: "travel_advice",
    likes: 24,
    comments: 15,
    views: 156,
    created_at: "2024-12-20T14:30:00Z",
    tags: ["chefchaouen", "blue_city", "travel_tips", "weather"],
    featured: false,
    solved: true,
    commentsList: [
      {
        id: 1,
        content:
          "I visited in April and it was perfect! Not too hot, fewer crowds, and the blue walls looked amazing in the spring light.",
        author: {
          id: 201,
          name: "Ahmed Hassan",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        },
        created_at: "2024-12-20T15:30:00Z",
        likes: 8,
        replies: [
          {
            id: 11,
            content: "Thanks for the tip! Did you need to book accommodations in advance for April?",
            author: {
              id: 101,
              name: "Sarah Johnson",
              avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
            },
            created_at: "2024-12-20T16:00:00Z",
            likes: 2,
          },
        ],
      },
      {
        id: 2,
        content: "Avoid summer months (July-August) - it gets really hot and crowded. October is also great!",
        author: {
          id: 202,
          name: "Maria Garcia",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        },
        created_at: "2024-12-20T17:00:00Z",
        likes: 12,
        replies: [],
      },
    ],
  },
  {
    id: 2,
    title: "Sahara Desert Tour Recommendations",
    content:
      "Has anyone done a Sahara desert tour recently? Looking for recommendations on tour companies and what to expect. I'm particularly interested in 3-day tours from Marrakech and whether the camel trekking is worth it.",
    author: {
      id: 102,
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      reputation: 189,
      posts: 31,
    },
    category: "recommendations",
    likes: 18,
    comments: 22,
    views: 203,
    created_at: "2024-12-19T09:15:00Z",
    tags: ["sahara", "desert_tour", "recommendations", "marrakech"],
    featured: true,
    solved: false,
    commentsList: [
      {
        id: 3,
        content:
          "I did a 3-day tour with Desert Majesty last month. Amazing experience! The camel trek at sunset was unforgettable. Highly recommend bringing extra water and sunscreen.",
        author: {
          id: 203,
          name: "Emma Wilson",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
        },
        created_at: "2024-12-19T10:30:00Z",
        likes: 15,
        replies: [
          {
            id: 31,
            content: "How was the accommodation in the desert camp? Was it comfortable?",
            author: {
              id: 102,
              name: "Michael Chen",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            },
            created_at: "2024-12-19T11:00:00Z",
            likes: 3,
          },
          {
            id: 32,
            content:
              "The tents were surprisingly comfortable! They had proper beds and shared bathroom facilities. The stargazing at night was incredible.",
            author: {
              id: 203,
              name: "Emma Wilson",
              avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            },
            created_at: "2024-12-19T11:30:00Z",
            likes: 7,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Traditional Moroccan Recipes",
    content:
      "I just got back from Morocco and want to recreate some of the amazing dishes I tried. Anyone have authentic recipes for tagine and couscous? Especially looking for the spice combinations used in Fes.",
    author: {
      id: 103,
      name: "Emma Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      reputation: 312,
      posts: 45,
    },
    category: "food_and_culture",
    likes: 32,
    comments: 28,
    views: 287,
    created_at: "2024-12-18T16:45:00Z",
    tags: ["moroccan_food", "recipes", "tagine", "couscous", "fes"],
    featured: false,
    solved: true,
    commentsList: [
      {
        id: 4,
        content:
          "I learned to make tagine from a local family in Marrakech! The key is the slow cooking and the right blend of spices. I can share the recipe if you're interested.",
        author: {
          id: 204,
          name: "Youssef Alami",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        },
        created_at: "2024-12-18T17:30:00Z",
        likes: 18,
        replies: [
          {
            id: 41,
            content: "Yes please! I'd love to get that recipe. What spices did they use?",
            author: {
              id: 103,
              name: "Emma Rodriguez",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            },
            created_at: "2024-12-18T18:00:00Z",
            likes: 5,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Photography Spots in Marrakech",
    content:
      "Heading to Marrakech next month with my camera. What are some must-visit spots for photography enthusiasts? Looking for both iconic locations and hidden gems that locals might know about.",
    author: {
      id: 104,
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      reputation: 156,
      posts: 18,
    },
    category: "photography",
    likes: 41,
    comments: 19,
    views: 234,
    created_at: "2024-12-17T11:20:00Z",
    tags: ["marrakech", "photography", "travel_photography", "hidden_gems"],
    featured: true,
    solved: false,
    commentsList: [
      {
        id: 5,
        content:
          "The rooftop cafes around Jemaa el-Fnaa square offer amazing sunset shots! Also try the Bahia Palace gardens early morning for the best light.",
        author: {
          id: 205,
          name: "Fatima Benali",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        },
        created_at: "2024-12-17T12:00:00Z",
        likes: 22,
        replies: [],
      },
    ],
  },
  {
    id: 5,
    title: "Safety Tips for Solo Female Travelers",
    content:
      "I'm planning my first solo trip to Morocco as a woman. Any safety tips or advice from those who have done it? Particularly interested in dress code recommendations and areas to avoid.",
    author: {
      id: 105,
      name: "Lisa Thompson",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      reputation: 278,
      posts: 34,
    },
    category: "travel_advice",
    likes: 56,
    comments: 37,
    views: 445,
    created_at: "2024-12-16T08:10:00Z",
    tags: ["solo_travel", "female_travelers", "safety", "travel_tips"],
    featured: true,
    solved: true,
    commentsList: [
      {
        id: 6,
        content:
          "I traveled solo in Morocco for 3 weeks last year. Dress modestly (cover shoulders and knees), stay in well-reviewed riads, and trust your instincts. The people are generally very welcoming!",
        author: {
          id: 206,
          name: "Aisha Mansouri",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        },
        created_at: "2024-12-16T09:30:00Z",
        likes: 34,
        replies: [
          {
            id: 61,
            content:
              "Thank you so much! Did you have any issues with harassment or should I be particularly careful in certain cities?",
            author: {
              id: 105,
              name: "Lisa Thompson",
              avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            },
            created_at: "2024-12-16T10:00:00Z",
            likes: 8,
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Best Riads in Fes Medina",
    content:
      "Looking for authentic riad recommendations in Fes medina. Want something with traditional architecture but modern amenities. Budget around $100-150 per night. Any suggestions?",
    author: {
      id: 106,
      name: "Robert Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      reputation: 89,
      posts: 12,
    },
    category: "recommendations",
    likes: 23,
    comments: 15,
    views: 178,
    created_at: "2024-12-15T14:20:00Z",
    tags: ["fes", "accommodation", "riads", "medina"],
    featured: false,
    solved: false,
    commentsList: [],
  },
  {
    id: 7,
    title: "Hammam Experience Guide",
    content:
      "First time trying a traditional hammam in Morocco. What should I expect? Any etiquette I should know about? Recommendations for good hammams in Marrakech or Casablanca?",
    author: {
      id: 107,
      name: "Sophie Laurent",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      reputation: 145,
      posts: 8,
    },
    category: "food_and_culture",
    likes: 38,
    comments: 22,
    views: 267,
    created_at: "2024-12-14T09:45:00Z",
    tags: ["hammam", "spa", "culture", "wellness"],
    featured: false,
    solved: true,
    commentsList: [
      {
        id: 7,
        content:
          "The hammam experience is amazing! Bring flip-flops, expect to be scrubbed down thoroughly, and tip your attendant. La Mamounia in Marrakech has an excellent one.",
        author: {
          id: 207,
          name: "Khadija Amrani",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        },
        created_at: "2024-12-14T11:00:00Z",
        likes: 15,
        replies: [],
      },
    ],
  },
  // Add more posts with comments...
]

const CommentItem = ({ comment, onLikeComment, onReply, isReply = false }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showReplies, setShowReplies] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLikeComment(comment.id)
  }

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText)
      setReplyText("")
      setShowReplyForm(false)
    }
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
    <Box ml={isReply ? 8 : 0} mb={4}>
      <Flex align="flex-start" gap={3}>
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

          <HStack spacing={4} fontSize="xs" color="gray.500">
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<FaHeart />}
              colorScheme={isLiked ? "red" : "gray"}
              onClick={handleLike}
            >
              {comment.likes + (isLiked ? 1 : 0)}
            </Button>

            {!isReply && (
              <Button size="xs" variant="ghost" leftIcon={<FaReply />} onClick={() => setShowReplyForm(!showReplyForm)}>
                Reply
              </Button>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <Button
                size="xs"
                variant="ghost"
                leftIcon={showReplies ? <FaChevronUp /> : <FaChevronDown />}
                onClick={() => setShowReplies(!showReplies)}
              >
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </Button>
            )}
          </HStack>

          {/* Reply Form */}
          <Collapse in={showReplyForm} animateOpacity>
            <Box mt={3} p={3} bg="gray.50" borderRadius="lg">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                size="sm"
                resize="none"
                rows={2}
                mb={2}
              />
              <HStack justify="flex-end" spacing={2}>
                <Button size="xs" variant="ghost" onClick={() => setShowReplyForm(false)}>
                  Cancel
                </Button>
                <Button
                  size="xs"
                  colorScheme="blue"
                  leftIcon={<FaPaperPlane />}
                  onClick={handleReply}
                  isDisabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </HStack>
            </Box>
          </Collapse>

          {/* Replies */}
          <Collapse in={showReplies} animateOpacity>
            <Box mt={3}>
              {comment.replies?.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLikeComment={onLikeComment}
                  onReply={onReply}
                  isReply={true}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
      </Flex>
    </Box>
  )
}

const CommentsSection = ({ post, onAddComment, onLikeComment, onReply }) => {
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState(false)

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(post.id, newComment)
      setNewComment("")
    }
  }

  return (
    <Box mt={4}>
      <Button
        size="sm"
        variant="ghost"
        leftIcon={<FaComment />}
        onClick={() => setShowComments(!showComments)}
        colorScheme="blue"
      >
        {post.commentsList?.length || 0} Comments
      </Button>

      <Collapse in={showComments} animateOpacity>
        <Box mt={4} p={4} bg="gray.50" borderRadius="lg">
          {/* Add Comment Form */}
          <Box mb={4}>
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              resize="none"
              rows={3}
              mb={2}
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
          {post.commentsList && post.commentsList.length > 0 ? (
            <VStack align="stretch" spacing={0}>
              {post.commentsList.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onLikeComment={onLikeComment} onReply={onReply} />
              ))}
            </VStack>
          ) : (
            <Text color="gray.500" textAlign="center" py={4}>
              No comments yet. Be the first to comment!
            </Text>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

const PostCard = ({ post, onLike, onComment, onShare, onAddComment, onLikeComment, onReply }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { onOpen: onProfileOpen } = useDisclosure()
  const { onClose: onProfileClose } = useDisclosure()
  const [selectedUser, setSelectedUser] = useState(null)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike(post.id)
  }

  const getCategoryColor = (category) => {
    const colors = {
      travel_advice: "blue",
      recommendations: "green",
      food_and_culture: "orange",
      photography: "purple",
      general: "gray",
    }
    return colors[category] || "gray"
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      position="relative"
      bg="white"
      borderRadius="2xl"
      p={6}
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
      border="1px solid rgba(0, 0, 0, 0.05)"
      overflow="hidden"
      _hover={{
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        transform: "translateY(-5px)",
      }}
      transition="all 0.3s ease"
    >


      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb={4}>
        <VStack align="flex-start" spacing={2} flex={1}>
          <HStack spacing={3}>
            <Badge
              colorScheme={getCategoryColor(post.category)}
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {post.category.replace("_", " ").toUpperCase()}
            </Badge>
            {post.solved && (
              <Badge colorScheme="green" variant="solid" px={2} py={1} borderRadius="full" fontSize="xs">
                ✓ Solved
              </Badge>
            )}
          </HStack>

          <Heading
            as="h3"
            size="md"
            color="gray.800"
            lineHeight="1.3"
            _hover={{ color: "blue.600" }}
            cursor="pointer"
            transition="color 0.2s"
          >
            {post.title}
          </Heading>
        </VStack>

        <IconButton
          icon={<FaBookmark />}
          variant="ghost"
          colorScheme={isBookmarked ? "yellow" : "gray"}
          onClick={() => setIsBookmarked(!isBookmarked)}
          size="sm"
        />
      </Flex>

      {/* Content */}
      <Text color="gray.600" mb={4} lineHeight="1.6" noOfLines={3}>
        {post.content}
      </Text>

      {/* Tags */}
      <Flex wrap="wrap" gap={2} mb={4}>
        {post.tags.map((tag, index) => (
          <Tag
            key={index}
            size="sm"
            variant="subtle"
            colorScheme="blue"
            borderRadius="full"
            cursor="pointer"
            _hover={{ bg: "blue.100" }}
          >
            <FaHashtag size="10px" />
            <TagLabel ml={1}>{tag}</TagLabel>
          </Tag>
        ))}
      </Flex>

      <Divider mb={4} />

      {/* Author Info */}
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={3}>
          <Avatar
            size="sm"
            src={post.author.avatar}
            name={post.author.name}
            border="2px solid"
            borderColor="blue.100"
            cursor="pointer"
            _hover={{ transform: "scale(1.05)", borderColor: "blue.300" }}
            onClick={() => {
              setSelectedUser(post.author)
              onProfileOpen()
            }}
          />
          <VStack align="flex-start" spacing={0}>
            <Text
              fontWeight="semibold"
              fontSize="sm"
              color="gray.800"
              cursor="pointer"
              _hover={{ color: "blue.600" }}
              onClick={() => {
                setSelectedUser(post.author)
                onProfileOpen()
              }}
            >
              {post.author.name}
            </Text>
            <HStack spacing={3} fontSize="xs" color="gray.500">
              <HStack spacing={1}>
                <FaClock />
                <Text>{formatDate(post.created_at)}</Text>
              </HStack>
              <Text>•</Text>
              <Text>{post.author.reputation} rep</Text>
            </HStack>
          </VStack>
        </HStack>

        <HStack spacing={1} fontSize="xs" color="gray.500">
          <FaEye />
          <Text>{post.views}</Text>
        </HStack>
      </Flex>

      {/* Actions */}
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={4}>
          <Button
            leftIcon={<FaHeart />}
            size="sm"
            variant="ghost"
            colorScheme={isLiked ? "red" : "gray"}
            onClick={handleLike}
            _hover={{ bg: isLiked ? "red.50" : "gray.50" }}
          >
            {post.likes + (isLiked ? 1 : 0)}
          </Button>

          <Button leftIcon={<FaReply />} size="sm" variant="ghost" colorScheme="green" _hover={{ bg: "green.50" }}>
            Reply
          </Button>
        </HStack>

        <IconButton
          icon={<FaShare />}
          size="sm"
          variant="ghost"
          colorScheme="gray"
          onClick={() => onShare(post)}
          _hover={{ bg: "gray.50" }}
        />
      </Flex>

      {/* Comments Section */}
      <CommentsSection post={post} onAddComment={onAddComment} onLikeComment={onLikeComment} onReply={onReply} />
    </MotionBox>
  )
}

const CommunityForumPage = () => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const profileModal = useDisclosure()
  const [selectedUser, setSelectedUser] = useState(null)

  const [posts, setPosts] = useState(mockPosts)
  const [filteredPosts, setFilteredPosts] = useState(mockPosts)
  const [loading, setLoading] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostCategory, setNewPostCategory] = useState("general")
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  // Filter and search logic
  useEffect(() => {
    let filtered = posts

    // Apply category filter
    if (filter !== "all") {
      filtered = filtered.filter((post) => post.category === filter)
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.created_at) - new Date(a.created_at)
        case "popular":
          return b.likes - a.likes
        case "comments":
          return (b.commentsList?.length || 0) - (a.commentsList?.length || 0)
        default:
          return 0
      }
    })

    setFilteredPosts(filtered)
  }, [posts, filter, searchQuery, sortBy])

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your post",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const newPost = {
      id: Date.now(),
      title: newPostTitle,
      content: newPostContent,
      author: {
        id: 999,
        name: "You",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        reputation: 0,
        posts: 1,
      },
      category: newPostCategory,
      likes: 0,
      comments: 0,
      views: 0,
      created_at: new Date().toISOString(),
      tags: newPostContent.match(/#(\w+)/g)?.map((tag) => tag.substring(1)) || [],
      featured: false,
      solved: false,
      commentsList: [],
    }

    setPosts([newPost, ...posts])
    setNewPostTitle("")
    setNewPostContent("")
    onClose()

    toast({
      title: "Post created successfully!",
      description: "Your post has been published to the community",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }

  const handleLike = (postId) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
  }

  const handleAddComment = (postId, commentText) => {
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
      replies: [],
    }

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            commentsList: [...(post.commentsList || []), newComment],
            comments: (post.commentsList?.length || 0) + 1,
          }
        }
        return post
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
    setPosts(
      posts.map((post) => ({
        ...post,
        commentsList: post.commentsList?.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, likes: comment.likes + 1 }
          }
          // Check replies too
          return {
            ...comment,
            replies: comment.replies?.map((reply) =>
              reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply,
            ),
          }
        }),
      })),
    )
  }

  const handleReply = (commentId, replyText) => {
    const newReply = {
      id: Date.now(),
      content: replyText,
      author: {
        id: 999,
        name: "You",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      },
      created_at: new Date().toISOString(),
      likes: 0,
    }

    setPosts(
      posts.map((post) => ({
        ...post,
        commentsList: post.commentsList?.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          }
          return comment
        }),
      })),
    )

    toast({
      title: "Reply added!",
      description: "Your reply has been posted successfully",
      status: "success",
      duration: 2000,
      isClosable: true,
    })
  }

  const handleComment = (postId) => {
    // This function can be used to scroll to comments or open them
    console.log("Opening comments for post:", postId)
  }

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard",
        status: "success",
        duration: 2000,
      })
    }
  }

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
            Community Forum
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
            Connect with fellow travelers, share experiences, and get advice from the Morocco community
          </Text>
        </MotionBox>

        {/* Search and Filters */}
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
          <Flex direction={{ base: "column", lg: "row" }} gap={4} align="center" justify="space-between" mb={4}>
            <HStack flex={1} spacing={4} w="full">
              <Box position="relative" flex={1}>
                <Input
                  placeholder="Search posts, topics, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                bg="gray.50"
                borderRadius="xl"
                border="2px solid"
                borderColor="gray.100"
                minW="200px"
                _focus={{ bg: "white" }}
              >
                <option value="all">All Categories</option>
                <option value="travel_advice">Travel Advice</option>
                <option value="recommendations">Recommendations</option>
                <option value="food_and_culture">Food & Culture</option>
                <option value="photography">Photography</option>
                <option value="general">General</option>
              </Select>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                bg="gray.50"
                borderRadius="xl"
                border="2px solid"
                borderColor="gray.100"
                minW="150px"
                _focus={{ bg: "white" }}
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="comments">Most Discussed</option>
              </Select>
            </HStack>

            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              size="lg"
              borderRadius="xl"
              px={8}
              onClick={onOpen}
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)",
              }}
              transition="all 0.3s ease"
            >
              New Post
            </Button>
          </Flex>

          {/* Stats */}
          <HStack spacing={6} color="gray.600" fontSize="sm">
            <Text>
              <strong>{filteredPosts.length}</strong> posts found
            </Text>
            <Text>•</Text>
            <Text>
              <strong>{filteredPosts.filter((p) => p.featured).length}</strong> featured
            </Text>
            <Text>•</Text>
            <Text>
              <strong>{filteredPosts.filter((p) => p.solved).length}</strong> solved
            </Text>
          </HStack>
        </MotionBox>

        {/* Posts Grid */}
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Flex>
        ) : filteredPosts.length === 0 ? (
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
              No posts found matching your criteria
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => {
                setSearchQuery("")
                setFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </MotionBox>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={6}>
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <MotionBox
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PostCard
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onAddComment={handleAddComment}
                    onLikeComment={handleLikeComment}
                    onReply={handleReply}
                  />
                </MotionBox>
              ))}
            </AnimatePresence>
          </SimpleGrid>
        )}

        {/* New Post Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent borderRadius="2xl" mx={4}>
            <ModalHeader>Create New Post</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Input
                  placeholder="Post title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  size="lg"
                  borderRadius="xl"
                />

                <Select value={newPostCategory} onChange={(e) => setNewPostCategory(e.target.value)} borderRadius="xl">
                  <option value="general">General Discussion</option>
                  <option value="travel_advice">Travel Advice</option>
                  <option value="recommendations">Recommendations</option>
                  <option value="food_and_culture">Food & Culture</option>
                  <option value="photography">Photography</option>
                </Select>

                <Textarea
                  placeholder="Share your thoughts, questions, or experiences... Use #hashtags to add tags!"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  minHeight="200px"
                  borderRadius="xl"
                />

                <Text fontSize="sm" color="gray.500" alignSelf="flex-start">
                  💡 Tip: Use #hashtags in your content to make it more discoverable
                </Text>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleCreatePost}
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
                }}
              >
                Publish Post
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* User Profile Modal */}
        <Modal isOpen={profileModal.isOpen} onClose={profileModal.onClose} size="md">
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent borderRadius="2xl" mx={4}>
            <ModalHeader>User Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedUser && (
                <VStack spacing={4} align="center">
                  <Avatar
                    size="xl"
                    src={selectedUser.avatar}
                    name={selectedUser.name}
                    border="4px solid"
                    borderColor="blue.100"
                  />
                  <VStack spacing={2} textAlign="center">
                    <Heading size="md" color="gray.800">
                      {selectedUser.name}
                    </Heading>
                    <HStack spacing={6} color="gray.600">
                      <VStack spacing={0}>
                        <Text fontWeight="bold" fontSize="lg">
                          {selectedUser.reputation}
                        </Text>
                        <Text fontSize="sm">Reputation</Text>
                      </VStack>
                      <VStack spacing={0}>
                        <Text fontWeight="bold" fontSize="lg">
                          {selectedUser.posts}
                        </Text>
                        <Text fontSize="sm">Posts</Text>
                      </VStack>
                      <VStack spacing={0}>
                        <Text fontWeight="bold" fontSize="lg">
                          {selectedUser.followers || Math.floor(Math.random() * 500) + 100}
                        </Text>
                        <Text fontSize="sm">Followers</Text>
                      </VStack>
                    </HStack>
                    <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                      {selectedUser.reputation > 200 ? "Expert Traveler" : "Community Member"}
                    </Badge>
                  </VStack>
                  <Text color="gray.600" textAlign="center" fontSize="sm">
                    Member since{" "}
                    {new Date(
                      2024 - Math.floor(selectedUser.reputation / 100),
                      Math.floor(Math.random() * 12),
                    ).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </Text>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} size="sm">
                Follow
              </Button>
              <Button variant="ghost" size="sm">
                Message
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  )
}

export default CommunityForumPage
