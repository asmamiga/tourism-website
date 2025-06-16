import { useState, useEffect } from "react"
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Flex,
  Avatar,
  HStack,
  VStack,
  Tag,
  IconButton,
  Divider,
  Button,
  useToast,
  Spinner,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react"
import {
  FaHeart,
  FaBookmark,
  FaShare,
  FaChevronLeft,
  FaMapMarkerAlt,
  FaClock,
  FaHashtag,
  FaPaperPlane,
} from "react-icons/fa"
import { motion } from "framer-motion"

const MotionBox = motion(Box)

// This would normally come from an API
const mockStories = [
  // Story 1 - Chefchaouen
  {
    story_id: 1,
    title: "Exploring the Blue City of Chefchaouen",
    excerpt: "My journey through the stunning blue streets and alleys of this magical Moroccan city, discovering hidden cafes and meeting local artisans.",
    content: 'Chefchaouen, often simply referred to as the "Blue City," is a destination unlike any other. Nestled in the Rif Mountains of Morocco, this town is famous for its blue-painted buildings that create a dreamlike atmosphere. The blue-washed walls, ranging from sky blue to deep cobalt, create a surreal and photogenic landscape that attracts visitors from around the world.\n\n## The Blue Medina\n\nThe heart of Chefchaouen is its medina, a maze of narrow, winding streets and alleyways where every turn reveals another stunning blue vista. The tradition of painting the buildings blue dates back to the 15th century when Jewish refugees settled here, though some say it helps keep the houses cool and wards off mosquitoes.\n\n## Must-Visit Spots\n\n- **Outa el Hammam Square**: The main square lined with cafes and restaurants, perfect for people-watching\n- **Spanish Mosque**: A short hike rewards you with breathtaking sunset views over the blue city\n- **Ras El Maa**: A small waterfall where locals gather to do laundry and socialize\n- **Local Markets**: Filled with handwoven textiles, ceramics, and artisanal goods\n\n## Cultural Experiences\n\n1. **Photography Walks**: Capture the stunning blue hues in the soft morning light\n2. **Cooking Classes**: Learn to prepare traditional Moroccan dishes with local ingredients\n3. **Hiking**: Explore the surrounding Rif Mountains and visit nearby villages\n4. **Shopping**: Find unique handicrafts, including the famous woolen garments and woven blankets\n\n## Travel Tips\n\n- **Best Time to Visit**: Spring (April-May) and fall (September-October) for pleasant weather\n- **Getting There**: Buses run regularly from major cities like Tangier, Fes, and Rabat\n- **Stay**: Opt for a traditional riad in the medina for an authentic experience\n- **Dress Code**: While more relaxed than other Moroccan cities, modest dress is still appreciated\n\n## Final Thoughts\n\nChefchaouen is more than just a pretty face - it\'s a place that invites you to slow down, wander aimlessly, and soak in the peaceful atmosphere. The combination of natural beauty, rich culture, and warm hospitality makes it a must-visit destination in Morocco. Whether you spend your days exploring the medina, sipping mint tea in a rooftop cafe, or hiking in the surrounding mountains, Chefchaouen is sure to capture your heart with its unique charm and beauty.',
    author: {
      user_id: 101,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      followers: 1250,
      stories: 23
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
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        },
        created_at: "2024-04-16T10:30:00Z",
        likes: 12
      },
      {
        id: 2,
        content: "The blue walls are so photogenic! Did you have any trouble with photography restrictions?",
        author: {
          id: 202,
          name: "Maria Garcia",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
        },
        created_at: "2024-04-16T14:20:00Z",
        likes: 8
      }
    ]
  },
  // Story 2 - Sahara Desert Adventure
  {
    story_id: 2,
    title: "A Night Under the Saharan Stars",
    excerpt: "An unforgettable journey into the heart of the Sahara, riding camels over golden dunes and sleeping under a blanket of stars.",
    content: 'The Sahara Desert had always been on my bucket list, and finally experiencing it was more magical than I could have imagined. The endless golden dunes, the silence of the desert, and the incredible night sky created memories that will last a lifetime.\n\n## The Journey to Merzouga\n\nOur adventure began in Marrakech, where we embarked on a 10-hour journey through the Atlas Mountains. The winding roads offered breathtaking views of the changing landscapes - from lush valleys to rocky plateaus, and finally to the golden dunes of Merzouga.\n\n## Camel Trekking at Sunset\n\nArriving at the edge of the Erg Chebbi dunes, we mounted our camels for a sunset trek into the desert. As we slowly made our way across the undulating dunes, the setting sun painted the sky in brilliant oranges and pinks, casting long shadows across the sand.\n\n## A Night in a Desert Camp\n\nOur Berber guides led us to a traditional desert camp where we would spend the night. The camp was a beautiful sight - large, comfortable tents arranged in a circle around a central fire pit, with colorful Berber rugs and cushions scattered about. After a delicious tagine dinner, we gathered around the fire to listen to traditional Berber music under a sky filled with more stars than I had ever seen.\n\n## Sunrise Over the Dunes\n\nWaking up before dawn, we climbed the highest dune near our camp to watch the sunrise. As the first light touched the tips of the dunes, the entire desert seemed to come alive with color. The silence was profound, broken only by the occasional whisper of the wind.\n\n## Tips for Your Sahara Adventure\n\n- **Best Time to Visit**: October to April for comfortable temperatures\n- **What to Pack**: Layers for cold nights, a scarf for the sand, and plenty of sunscreen\n- **Photography**: Bring extra batteries and memory cards - you\'ll take more photos than you think!\n- **Cultural Respect**: Learn a few words of Berber or Arabic - the locals appreciate the effort\n\n## Final Thoughts\n\nSpending a night in the Sahara was a humbling and awe-inspiring experience. The vastness of the desert, the warmth of the Berber hospitality, and the incredible night sky made it one of the highlights of my travels. If you have the chance to visit the Sahara, don\'t hesitate - it\'s an experience you\'ll never forget!',
    author: {
      user_id: 102,
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      followers: 2345,
      stories: 42
    },
    location: "Merzouga",
    published_date: "2024-03-22",
    image: "https://images.unsplash.com/photo-1518998050534-595478ec184e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 356,
    views: 4210,
    comments: 27,
    reading_time: 9,
    tags: ["desert", "adventure", "nature", "berber"],
    featured: true,
    category: "Adventure",
    commentsList: [
      {
        id: 3,
        content: "The night sky in the Sahara is unlike anything else on Earth. Did you get to see any shooting stars?",
        author: {
          id: 203,
          name: "Yusuf Al-Fassi",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        },
        created_at: "2024-03-23T08:45:00Z",
        likes: 15
      }
    ]
  },
  // Story 9 - Casablanca's Art Deco Architecture
  {
    story_id: 9,
    title: "Casablanca's Art Deco Architecture",
    excerpt: "Exploring the stunning Art Deco buildings and modern architecture that make Casablanca a unique blend of European and Moroccan design.",
    content: 'Casablanca is often overlooked by tourists, but the city boasts some of the finest Art Deco architecture in the world. The architectural heritage of Casablanca is a fascinating mix of French colonial, Art Deco, and traditional Moroccan design elements.\n\n## The Art Deco District\n\nThe city center is a treasure trove of Art Deco buildings from the 1920s and 1930s. The best way to explore is on foot, wandering through the streets and looking up to admire the intricate facades, curved balconies, and decorative details. The area around Boulevard Mohammed V and the United Nations Square is particularly rich in Art Deco gems.\n\n## Must-See Buildings\n\n- **Villa des Arts**: A beautifully restored Art Deco building that now serves as a cultural center and art gallery.\n- **Cinema Rialto**: One of the last remaining Art Deco cinemas in the city, still showing films in its original 1930s setting.\n- **Banque du Maroc**: An impressive example of the fusion between Art Deco and Moroccan architectural elements.\n- **Marché Central**: The central market building features stunning Art Deco details and is a great place to experience local life.\n\n## Tips for Architecture Enthusiasts\n\n1. **Best Time to Visit**: Early morning or late afternoon for the best light on the buildings.\n2. **Guided Tours**: Consider a walking tour to learn about the history and significance of the buildings.\n3. **Photography**: Wide-angle lenses are great for capturing the full facades of these impressive buildings.\n4. **Local Insights**: Talk to shop owners in the ground floors of these buildings - many have fascinating stories to share.\n\n## Hidden Gems\n\n- **The Abderrahman Slaoui Museum**: Housed in a beautiful Art Deco villa, this museum showcases Moroccan art and design.\n- **The Old Medina**: While not Art Deco, the contrast between the old and new architecture is striking.\n- **Corniche**: The seafront area features some beautiful 1930s buildings with ocean views.\n\n## Final Thoughts\n\nCasablanca\'s Art Deco architecture is a hidden gem that offers a different perspective on Morocco\'s cultural heritage. The blend of European and Moroccan design elements creates a unique architectural landscape that\'s well worth exploring for any design or history enthusiast. While the city may not have the ancient medinas of Fes or Marrakech, its 20th-century architectural treasures make it a fascinating destination in its own right.',
    author: {
      user_id: 109,
      name: "Pierre Dubois",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      followers: 890,
      stories: 19
    },
    location: "Casablanca",
    published_date: "2024-11-18",
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 73,
    views: 1234,
    comments: 8,
    reading_time: 6,
    tags: ["architecture", "art_deco", "casablanca", "design"],
    featured: false,
    category: "City Guide",
    commentsList: []
  },
  // Story 10 - Spice Markets of Marrakech
  {
    story_id: 10,
    title: "Spice Markets and Souks of Marrakech",
    excerpt: "A sensory journey through the bustling souks of Marrakech, learning about traditional spices, haggling techniques, and hidden market gems.",
    content: 'The souks of Marrakech are a feast for the senses. The air is filled with the aroma of exotic spices, the sound of merchants calling out their wares, and the vibrant colors of textiles, ceramics, and handicrafts. My journey through these ancient markets was an unforgettable experience that engaged all my senses.\n\n## Exploring the Souks\n\nThe labyrinthine alleys of the Marrakech medina are home to countless souks, each specializing in different goods. The spice souk is perhaps the most famous, with its colorful mounds of spices like saffron, cumin, and paprika creating a rainbow of colors. The narrow streets are lined with stalls selling everything from argan oil and traditional medicines to hand-woven carpets and leather goods.\n\n## Must-Try Spices and Products\n\n- **Ras el Hanout**: A complex spice blend that\'s essential in Moroccan cooking\n- **Saffron**: The world\'s most expensive spice, used in both sweet and savory dishes\n- **Argan Oil**: A versatile oil used in cooking and cosmetics\n- **Mint Tea**: The national drink of Morocco, best enjoyed with fresh mint\n\n## Haggling Tips\n\n1. **Start Low**: Begin by offering about a third of the asking price.\n2. **Be Polite**: Haggling is expected, but always remain friendly and respectful.\n3. **Walk Away**: If the price isn\'t right, walking away can sometimes bring the seller to your price.\n4. **Know the Value**: Have a rough idea of what things should cost before you start haggling.\n\n## Hidden Gems\n\n- **Rahba Kedima Square**: Known as the \'Square of Drugs\' (historically for medicinal herbs)\n- **Carpet Souk**: A great place to see traditional Moroccan rugs being made\n- **Dyers\' Souk**: Watch as fabrics are dyed in vibrant colors\n- **Henna Art**: Get beautiful temporary henna designs from local artists\n\n## Local Etiquette\n\n- **Dress Modestly**: Cover shoulders and knees out of respect for local customs\n- **Ask Before Photographing**: Always ask permission before taking photos of people\n- **Try the Street Food**: The medina has some of the best street food in Morocco - don\'t miss the camel burger!\n- **Bargain Respectfully**: Haggling is expected in the souks, but remember these are people\'s livelihoods\n\n## Final Thoughts\n\nThe spice markets of Marrakech offer an authentic glimpse into Moroccan culture and traditions. The experience of navigating the bustling alleys, sampling exotic flavors, and interacting with local merchants is an essential part of any visit to Morocco. Just remember to bring your sense of adventure and your haggling skills!',
    author: {
      user_id: 110,
      name: "Rajesh Patel",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      followers: 1567,
      stories: 33
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
        content: "The spice markets are incredible! Did you learn any good haggling tips? I always feel like I\'m paying too much.",
        author: {
          id: 210,
          name: "Jennifer Walsh",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
        },
        created_at: "2024-12-02T14:20:00Z",
        likes: 9
      }
    ]
  },
  // Story 11 - Fes Medina
  {
    story_id: 11,
    title: "Getting Lost in Fes Medina",
    excerpt: "Exploring the labyrinthine streets of Fes el-Bali, the world's largest car-free urban area and a UNESCO World Heritage site.",
    content: 'Fes el-Bali, the world\'s largest car-free urban area, is a labyrinth of narrow alleys, bustling souks, and hidden treasures. Spending three days exploring this medieval city was like stepping back in time.\n\n## First Impressions\n\nEntering the medina through the famous Blue Gate (Bab Boujloud), I was immediately overwhelmed by the sensory explosion - the scent of spices, the vibrant colors of textiles, and the constant hum of activity. The medina is a UNESCO World Heritage site and one of the best-preserved medieval cities in the Arab world.\n\n## Must-Visit Places\n\n- **Al Quaraouiyine University**: Founded in 859 AD, it\'s considered the oldest existing, continually operating educational institution in the world.\n- **Chouara Tannery**: Watching the leather dyeing process from the terraces above was a unique experience (though the smell takes some getting used to!).\n- **Bou Inania Madrasa**: An architectural masterpiece with intricate zellige tile work and carved cedar wood.\n\n## Local Encounters\n\nOne of my favorite experiences was sharing mint tea with a local shopkeeper who shared stories about growing up in the medina. He explained how the different souks (markets) are organized by craft, and how these traditions have been passed down through generations.\n\n## Tips for Exploring Fes\n\n1. **Hire a Guide**: The medina is incredibly confusing, and a local guide can help you navigate and provide context.\n2. **Dress Modestly**: As a conservative city, it\'s respectful to cover shoulders and knees.\n3. **Try the Street Food**: The medina has some of the best street food in Morocco - don\'t miss the camel burger!\n4. **Bargain Respectfully**: Haggling is expected in the souks, but remember these are people\'s livelihoods.\n\n## Final Thoughts\n\nFes was a highlight of my Moroccan journey. The city\'s rich history, stunning architecture, and warm hospitality made it an unforgettable experience. I left with beautiful handcrafted souvenirs, a full stomach, and memories that will last a lifetime.',
    author: {
      user_id: 111,
      name: "Sophie Martin",
      avatar: "https://images.unsplash.com/photo-1439405326854-014607f694d7?w=150",
      followers: 2100,
      stories: 45
    },
    location: "Fes",
    published_date: "2024-05-28",
    image: "https://images.unsplash.com/photo-1518549975509-9b1f4cb7a0c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 312,
    views: 4200,
    comments: 28,
    reading_time: 12,
    tags: ["culture", "history", "architecture", "food"],
    featured: true,
    category: "City Guide",
    commentsList: [
      {
        id: 11,
        content: "The tanneries were amazing! How did you handle the smell? I've heard it can be quite strong.",
        author: {
          id: 211,
          name: "Thomas Müller",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        },
        created_at: "2024-05-29T09:15:00Z",
        likes: 7
      }
    ]
  },
  // Story 12 - Essaouira Beach
  {
    story_id: 12,
    title: "Windsurfing in Essaouira",
    excerpt: "Riding the Atlantic winds in Morocco's premier windsurfing destination, where the waves meet the desert.",
    content: 'Known as the "Windy City of Africa", Essaouira is a charming coastal town that offers the perfect blend of culture, history, and adventure. My week-long stay here was filled with windsurfing, exploring the medina, and enjoying fresh seafood by the harbor.\n\n## First Impressions\n\nArriving in Essaouira after the hustle of Marrakech was a breath of fresh air - literally! The Atlantic breeze and laid-back vibe were immediately welcoming. The blue and white medina, a UNESCO World Heritage site, is filled with art galleries, boutiques, and cozy cafes.\n\n## Windsurfing Adventure\n\nEssaouira is one of the best windsurfing spots in the world, thanks to the strong but consistent trade winds. As a beginner, I took lessons at one of the many surf schools along the beach. The instructors were patient and professional, and within a few days, I was able to stand up on the board and catch some wind!\n\n### Other Activities:\n- **Camel Rides on the Beach**: A unique way to see the coastline at sunset.\n- **Argan Oil Cooperative Visit**: Learning about the production of this liquid gold was fascinating.\n- **Fishing with Locals**: I joined a morning fishing trip and helped bring in the day\'s catch.\n\n## Foodie Delights\n\nThe seafood in Essaouira is incredibly fresh and affordable. My favorite meal was at the fish market, where you can choose your fish and have it grilled right in front of you. The sardines are a must-try!\n\n## Tips for Visiting\n\n1. **Best Time to Visit**: Spring and fall offer the best weather for water sports.\n2. **What to Pack**: Windbreaker, swimwear, and comfortable walking shoes.\n3. **Stay Inside the Medina**: The riads here offer great value and an authentic experience.\n4. **Try the Fresh OJ**: The orange juice stands throughout the medina serve the best I\'ve ever had!\n\n## Final Thoughts\n\nEssaouira was the perfect place to unwind after the intensity of Morocco\'s imperial cities. The combination of water sports, cultural experiences, and delicious food made it a highlight of my trip. I can\'t wait to return!',
    author: {
      user_id: 112,
      name: "Carlos Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      followers: 1800,
      stories: 27
    },
    location: "Essaouira",
    published_date: "2024-06-12",
    image: "https://images.unsplash.com/photo-1536098561742-c998e65d6a1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: 198,
    views: 2900,
    comments: 22,
    reading_time: 9,
    tags: ["beach", "adventure", "water-sports", "food"],
    featured: true,
    category: "Adventure",
    commentsList: [
      {
        id: 12,
        content: "I'm planning a windsurfing trip there next month! Any recommendations for surf schools?",
        author: {
          id: 212,
          name: "Lisa Chen",
          avatar: "https://images.unsplash.com/photo-1494790108373-be75317390b7?w=150"
        },
        created_at: "2024-06-13T11:30:00Z",
        likes: 5
      }
    ]
  }
];

const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchStory = () => {
      setTimeout(() => {
        const foundStory = mockStories.find(s => s.story_id === parseInt(id));
        if (foundStory) {
          setStory(foundStory);
          setComments(foundStory.commentsList || []);
        } else {
          // Redirect to 404 or stories list if story not found
          navigate('/travel-stories');
        }
        setIsLoading(false);
      }, 500);
    };

    fetchStory();
  }, [id, navigate]);

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast({
      title: !isLiked ? "Story liked!" : "Like removed",
      status: "success",
      duration: 2000,
      isClosable: true,
    })
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast({
      title: !isBookmarked ? "Story bookmarked!" : "Bookmark removed",
      status: "success",
      duration: 2000,
      isClosable: true,
    })
  }

  const handleShare = () => {
    onOpen()
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (comment.trim()) {
      // In a real app, this would add the comment to the database
      toast({
        title: "Comment added!",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
      setComment("")
    }
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (!story) {
    return (
      <Container maxW="container.lg" py={8} textAlign="center">
        <Heading as="h1" size="xl" mb={4} color="brand.800">
          Story Not Found
        </Heading>
        <Text mb={6} fontSize="lg">
          We couldn't find the story you're looking for. It may have been removed or doesn't exist.
        </Text>
        <Button
          as={RouterLink}
          to="/travel-stories"
          colorScheme="blue"
          leftIcon={<FaChevronLeft />}
        >
          Back to Stories
        </Button>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Button
        leftIcon={<FaChevronLeft />}
        variant="ghost"
        mb={6}
        onClick={() => navigate(-1)}
      >
        Back to Stories
      </Button>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb={8}>
          <Heading as="h1" size="2xl" mb={4} color="brand.800">
            {story.title}
          </Heading>
          
          <Flex align="center" mb={6}>
            <Avatar
              size="md"
              name={story.author.name}
              src={story.author.avatar}
              mr={3}
            />
            <Box>
              <Text fontWeight="medium">{story.author.name}</Text>
              <HStack spacing={4} fontSize="sm" color="gray.600">
                <HStack>
                  <FaMapMarkerAlt />
                  <span>{story.location}</span>
                </HStack>
                <HStack>
                  <FaClock />
                  <span>{story.published_date}</span>
                </HStack>
                <HStack>
                  <span>•</span>
                  <span>{story.reading_time} min read</span>
                </HStack>
              </HStack>
            </Box>
          </Flex>

          <Box borderRadius="lg" overflow="hidden" mb={8} boxShadow="lg">
            <Image
              src={story.image}
              alt={story.title}
              w="100%"
              maxH="500px"
              objectFit="cover"
            />
          </Box>

          <HStack spacing={4} mb={8}>
            {story.tags.map((tag) => (
              <Tag key={tag} colorScheme="blue" borderRadius="full" px={3} py={1}>
                <FaHashtag style={{ marginRight: '4px' }} />
                {tag}
              </Tag>
            ))}
          </HStack>

          <Box
            className="story-content"
            fontSize="lg"
            lineHeight="tall"
            mb={8}
            sx={{
              '& h2': {
                fontSize: '2xl',
                fontWeight: 'bold',
                mt: 8,
                mb: 4,
                color: 'brand.800',
              },
              '& h3': {
                fontSize: 'xl',
                fontWeight: 'bold',
                mt: 6,
                mb: 3,
                color: 'brand.700',
              },
              '& p': {
                mb: 4,
                color: 'gray.700',
              },
              '& ul, & ol': {
                pl: 6,
                mb: 4,
              },
              '& li': {
                mb: 2,
              },
              '& a': {
                color: 'blue.500',
                textDecoration: 'underline',
                _hover: {
                  color: 'blue.600',
                },
              },
            }}
            dangerouslySetInnerHTML={{ __html: story.content.replace(/\n/g, '<br />') }}
          />

          <Divider my={8} />

          <Flex justify="space-between" align="center" mb={8}>
            <HStack spacing={4}>
              <IconButton
                icon={<FaHeart color={isLiked ? "red" : "gray"} />}
                onClick={handleLike}
                aria-label="Like story"
                variant="ghost"
              />
              <Text>{story.likes + (isLiked ? 1 : 0)}</Text>
              <IconButton
                icon={<FaBookmark color={isBookmarked ? "blue" : "gray"} />}
                onClick={handleBookmark}
                aria-label="Bookmark story"
                variant="ghost"
              />
              <IconButton
                icon={<FaShare />}
                onClick={handleShare}
                aria-label="Share story"
                variant="ghost"
              />
            </HStack>
          </Flex>
        </Box>

        <Box bg="gray.50" p={6} borderRadius="lg" mb={8}>
          <Heading size="lg" mb={4} color="brand.800">
            About the Author
          </Heading>
          <Flex align="center">
            <Avatar
              size="lg"
              name={story.author.name}
              src={story.author.avatar}
              mr={4}
            />
            <Box>
              <Text fontWeight="bold" fontSize="lg">
                {story.author.name}
              </Text>
              <Text color="gray.600" mb={2}>
                {story.author.followers.toLocaleString()} followers • {story.author.stories} stories
              </Text>
              <Button colorScheme="blue" size="sm">
                Follow
              </Button>
            </Box>
          </Flex>
        </Box>

        <Box>
          <Heading size="lg" mb={4} color="brand.800">
            Comments ({story.comments})
          </Heading>
          <form onSubmit={handleCommentSubmit}>
            <HStack mb={6}>
              <Textarea
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                size="lg"
                resize="none"
              />
              <IconButton
                type="submit"
                icon={<FaPaperPlane />}
                colorScheme="blue"
                aria-label="Post comment"
                size="lg"
                isRound
              />
            </HStack>
          </form>
        </Box>
      </MotionBox>

      {/* Share Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share this story</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Copy the link below to share this story:</Text>
            <Box
              p={3}
              bg="gray.100"
              borderRadius="md"
              fontFamily="mono"
              overflowX="auto"
              mb={4}
            >
              {window.location.href}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast({
                  title: "Link copied to clipboard!",
                  status: "success",
                  duration: 2000,
                  isClosable: true,
                })
                onClose()
              }}
            >
              Copy Link
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default StoryDetailPage
