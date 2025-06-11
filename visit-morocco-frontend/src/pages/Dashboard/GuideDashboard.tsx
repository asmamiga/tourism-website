import React from 'react';
import { Box, SimpleGrid, Heading, Text, Card, CardBody, CardHeader, HStack, VStack, Divider, Badge } from '@chakra-ui/react';
import { FiCalendar, FiDollarSign, FiStar, FiUser, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, color }) => (
  <Card bg={`${color}.50`} borderLeft="4px" borderColor={`${color}.400`}>
    <CardBody>
      <HStack spacing={4}>
        <Box p={2} bg={`${color}.100`} borderRadius="md">
          <Icon size={24} color={`var(--chakra-colors-${color}-500)`} />
        </Box>
        <Box>
          <Text fontSize="sm" color="gray.500">{title}</Text>
          <Heading size="md">{value}</Heading>
        </Box>
      </HStack>
    </CardBody>
  </Card>
);

const GuideDashboard: React.FC<{ data: any }> = ({ data }) => {
  const { stats, upcoming, recent_activities, quick_actions } = data;

  return (
    <Box>
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
        <DashboardCard 
          title="Upcoming Sessions" 
          value={stats.upcoming_sessions || 0} 
          icon={FiCalendar} 
          color="blue" 
        />
        <DashboardCard 
          title="Completed Sessions" 
          value={stats.completed_sessions || 0} 
          icon={FiClock} 
          color="green" 
        />
        <DashboardCard 
          title="Total Earnings" 
          value={`$${stats.total_earnings?.toLocaleString() || '0'}`} 
          icon={FiDollarSign} 
          color="purple" 
        />
        <DashboardCard 
          title="Average Rating" 
          value={stats.average_rating ? `${stats.average_rating.toFixed(1)}/5` : 'N/A'} 
          icon={FiStar} 
          color="orange" 
        />
      </SimpleGrid>

      {/* Quick Actions */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Quick Actions</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {quick_actions?.map((action: any, index: number) => (
            <Card 
              key={index} 
              as={Link} 
              to={action.route}
              _hover={{ transform: 'translateY(-4px)', shadow: 'md' }} 
              transition="all 0.2s"
            >
              <CardBody textAlign="center" p={4}>
                {getIconComponent(action.icon, 24, { margin: '0 auto 8px' })}
                <Text fontSize="sm" fontWeight="medium">{action.title}</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Upcoming Sessions */}
        <Box>
          <Heading size="md" mb={4}>Upcoming Sessions</Heading>
          <Card>
            <CardBody>
              {upcoming?.length > 0 ? (
                upcoming.map((session: any) => (
                  <Box key={session.id} p={3} _hover={{ bg: 'gray.50' }}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{session.user?.first_name} {session.user?.last_name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(session.start_time).toLocaleString()}
                        </Text>
                      </VStack>
                      <Badge colorScheme={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </HStack>
                    <Divider my={2} />
                  </Box>
                ))
              ) : (
                <Text py={4} textAlign="center" color="gray.500">
                  No upcoming sessions scheduled.
                </Text>
              )}
            </CardBody>
          </Card>
        </Box>

        {/* Recent Reviews */}
        <Box>
          <Heading size="md" mb={4}>Recent Reviews</Heading>
          <Card>
            <CardBody>
              {recent_activities?.recent_reviews?.length > 0 ? (
                recent_activities.recent_reviews.map((review: any) => (
                  <Box key={review.id} p={3} _hover={{ bg: 'gray.50' }}>
                    <HStack spacing={3} align="start">
                      <Box>
                        <Box display="flex" alignItems="center">
                          {[...Array(5)].map((_, i) => (
                            <Box key={i} color={i < review.rating ? 'yellow.400' : 'gray.200'}>
                              ★
                            </Box>
                          ))}
                        </Box>
                        <Text fontSize="sm" mt={1} color="gray.600">
                          {review.comment?.substring(0, 100)}{review.comment?.length > 100 ? '...' : ''}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          - {review.user?.first_name || 'Anonymous'}, {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </Box>
                    </HStack>
                    <Divider my={2} />
                  </Box>
                ))
              ) : (
                <Text py={4} textAlign="center" color="gray.500">
                  No recent reviews.
                </Text>
              )}
            </CardBody>
          </Card>
        </Box>
      </SimpleGrid>
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
    'user': FiUser,
    'dollar-sign': FiDollarSign,
    'star': FiStar,
    'plus-circle': FiCalendar, // Add more icons as needed
  };
  
  const IconComponent = icons[iconName] || FiCalendar;
  return <IconComponent size={size} style={style} />;
};

export default GuideDashboard;
