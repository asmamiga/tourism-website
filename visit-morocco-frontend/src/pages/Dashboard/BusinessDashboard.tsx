import React from 'react';
import { Box, SimpleGrid, Heading, Text, Card, CardBody, CardHeader, HStack, VStack, Divider, Badge, Progress, Button } from '@chakra-ui/react';
import { FiCalendar, FiDollarSign, FiStar, FiUsers, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <Card>
    <CardBody>
      <HStack justify="space-between">
        <Box>
          <Text fontSize="sm" color="gray.500">{title}</Text>
          <Heading size="lg" my={2}>{value}</Heading>
          {trend !== undefined && (
            <HStack spacing={1} color={trend >= 0 ? 'green.500' : 'red.500'}>
              <Text fontSize="sm" fontWeight="medium">
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </Text>
              <Text fontSize="xs" color="gray.500">vs last month</Text>
            </HStack>
          )}
        </Box>
        <Box p={3} bg={`${color}.100`} borderRadius="md" color={`${color}.600`}>
          <Icon size={24} />
        </Box>
      </HStack>
    </CardBody>
  </Card>
);

const BusinessDashboard: React.FC<{ data?: any }> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from props or location state
  const routeData = (location.state as any)?.dashboardData;
  const { data } = props;
  
  // Use data from props, then route state, or default to empty object
  const sourceData = data || routeData || {};
  
  // Provide default values if data is undefined
  const { 
    stats = {}, 
    upcoming = [], 
    recent_activities = [], 
    quick_actions = [] 
  } = sourceData;

  // Mock data for demonstration with fallbacks
  const businessStats = {
    total_bookings: 0,
    upcoming_bookings: 0,
    average_rating: 0,
    monthly_revenue: 0,
    monthly_revenue_change: 0,
    new_customers: 0,
    new_customers_change: 0,
    ...stats, // This will override the defaults with any provided stats
  };

  return (
    <Box>
      {/* Welcome Banner */}
      <Card bgGradient="linear(to-r, blue.500, purple.500)" color="white" mb={8}>
        <CardBody>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="sm" opacity={0.9}>Welcome back to your business dashboard</Text>
              <Heading size="lg" my={2}>Business Overview</Heading>
              <Text fontSize="sm" opacity={0.9}>
                Here's what's happening with your business today
              </Text>
            </Box>
            <Button 
              leftIcon={<FiPlus />} 
              colorScheme="green" 
              onClick={() => navigate('/businesses/new')}
              size="md"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              Add New Business
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
        <DashboardCard 
          title="Total Bookings" 
          value={stats.total_bookings || 0} 
          icon={FiCalendar} 
          color="blue"
          trend={5.2}
        />
        <DashboardCard 
          title="Upcoming Bookings" 
          value={stats.upcoming_bookings || 0} 
          icon={FiCalendar} 
          color="green"
          trend={-2.1}
        />
        <DashboardCard 
          title="Total Revenue" 
          value={`$${businessStats.monthly_revenue?.toLocaleString() || '0'}`} 
          icon={FiDollarSign} 
          color="purple"
          trend={businessStats.monthly_revenue_change}
        />
        <DashboardCard 
          title="Average Rating" 
          value={stats.average_rating ? `${stats.average_rating.toFixed(1)}/5` : 'N/A'} 
          icon={FiStar} 
          color="orange"
          trend={1.8}
        />
      </SimpleGrid>

      {/* Quick Actions */}
      <Box mb={8}>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Quick Actions</Heading>
          <Text as={Link} to="/business/actions" color="blue.500" _hover={{ textDecoration: 'underline' }}>
            View All
          </Text>
        </HStack>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {quick_actions?.map((action: any, index: number) => (
            <Card 
              key={index} 
              as={Link} 
              to={action.route}
              _hover={{ transform: 'translateY(-4px)', shadow: 'md' }} 
              transition="all 0.2s"
              h="100%"
            >
              <CardBody textAlign="center" p={4}>
                {getIconComponent(action.icon, 24, { margin: '0 auto 8px' })}
                <Text fontSize="sm" fontWeight="medium">{action.title}</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        {/* Recent Bookings */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Recent Bookings</Heading>
            <Text as={Link} to="/business/bookings" color="blue.500" _hover={{ textDecoration: 'underline' }}>
              View All
            </Text>
          </HStack>
          <Card>
            <CardBody p={0}>
              {upcoming?.length > 0 ? (
                <>
                  {upcoming.map((booking: any) => (
                    <Box key={booking.id} p={4} _hover={{ bg: 'gray.50' }}>
                      <HStack justify="space-between">
                        <Box>
                          <Text fontWeight="medium">{booking.service?.name || 'Booking'}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {booking.user?.first_name} • {new Date(booking.start_time).toLocaleDateString()}
                          </Text>
                        </Box>
                        <Badge colorScheme={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </HStack>
                      <Divider my={3} />
                    </Box>
                  ))}
                </>
              ) : (
                <Box p={6} textAlign="center">
                  <Text color="gray.500">No recent bookings found</Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </Box>

        {/* Recent Reviews */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Recent Reviews</Heading>
            <Text as={Link} to="/business/reviews" color="blue.500" _hover={{ textDecoration: 'underline' }}>
              View All
            </Text>
          </HStack>
          <Card>
            <CardBody p={0}>
              {recent_activities?.recent_reviews?.length > 0 ? (
                <>
                  {recent_activities.recent_reviews.map((review: any) => (
                    <Box key={review.id} p={4} _hover={{ bg: 'gray.50' }}>
                      <HStack align="start" spacing={3}>
                        <Box>
                          <Box display="flex" alignItems="center" mb={1}>
                            {[...Array(5)].map((_, i) => (
                              <Box key={i} color={i < review.rating ? 'yellow.400' : 'gray.200'}>
                                ★
                              </Box>
                            ))}
                          </Box>
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {review.comment}
                          </Text>
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            — {review.user?.first_name || 'Anonymous'}
                          </Text>
                        </Box>
                      </HStack>
                      <Divider my={3} />
                    </Box>
                  ))}
                </>
              ) : (
                <Box p={6} textAlign="center">
                  <Text color="gray.500">No recent reviews</Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </Box>
      </SimpleGrid>

      {/* Performance Metrics */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Performance Metrics</Heading>
        <Card>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium">New Customers</Text>
                  <Text fontWeight="bold" color="green.500">+{businessStats.new_customers_change}%</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" mb={2}>{businessStats.new_customers}</Text>
                <Progress value={65} size="sm" colorScheme="green" borderRadius="full" />
                <Text fontSize="xs" color="gray.500" mt={1}>vs 57 last month</Text>
              </Box>
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium">Customer Satisfaction</Text>
                  <Text fontWeight="bold" color="green.500">+2.5%</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" mb={2}>4.8/5</Text>
                <Progress value={96} size="sm" colorScheme="green" borderRadius="full" />
                <Text fontSize="xs" color="gray.500" mt={1}>vs 4.7 last month</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

// Helper function to get icon component from string
const getIconComponent = (iconName: string, size = 24, style = {}) => {
  const icons: Record<string, React.ElementType> = {
    'calendar': FiCalendar,
    'users': FiUsers,
    'dollar-sign': FiDollarSign,
    'trending-up': FiTrendingUp,
    'plus-circle': FiCalendar, // Add more icons as needed
  };
  
  const IconComponent = icons[iconName] || FiCalendar;
  return <IconComponent size={size} style={style} />;
};

export default BusinessDashboard;
