import React from 'react';
import { Box, SimpleGrid, Heading, Text, Card, CardBody, CardHeader, Icon, HStack, VStack, Divider } from '@chakra-ui/react';
import { FiCalendar, FiMapPin, FiSearch, FiPlusCircle } from 'react-icons/fi';
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

interface QuickActionProps {
  title: string;
  icon: React.ElementType;
  to: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, icon: Icon, to }) => (
  <Card as={Link} to={to} _hover={{ transform: 'translateY(-4px)', shadow: 'md' }} transition="all 0.2s">
    <CardBody textAlign="center" p={4}>
      <Icon size={24} style={{ margin: '0 auto 8px' }} />
      <Text fontSize="sm" fontWeight="medium">{title}</Text>
    </CardBody>
  </Card>
);

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

const TouristDashboard: React.FC<{ data?: DashboardData }> = ({ data = {} }) => {
  // Provide default values if data or its properties are undefined
  const {
    stats = {
      upcoming_trips: 0,
      past_trips: 0,
      saved_guides: 0,
      saved_businesses: 0,
    },
    upcoming = [],
    recent_activities = [],
    quick_actions = []
  } = data || {};

  return (
    <Box>
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
        <DashboardCard 
          title="Upcoming Trips" 
          value={stats.upcoming_trips || 0} 
          icon={FiCalendar} 
          color="blue" 
        />
        <DashboardCard 
          title="Past Trips" 
          value={stats.past_trips || 0} 
          icon={FiCalendar} 
          color="green" 
        />
        <DashboardCard 
          title="Saved Guides" 
          value={stats.saved_guides || 0} 
          icon={FiMapPin} 
          color="purple" 
        />
        <DashboardCard 
          title="Saved Businesses" 
          value={stats.saved_businesses || 0} 
          icon={FiMapPin} 
          color="orange" 
        />
      </SimpleGrid>

      {/* Quick Actions */}
      <Box mb={8}>
        <Heading size="md" mb={4}>Quick Actions</Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {quick_actions?.map((action: any, index: number) => (
            <QuickAction 
              key={index}
              title={action.title}
              icon={getIconComponent(action.icon)}
              to={action.route}
            />
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <Heading size="md" mb={4}>Upcoming Trips</Heading>
        {upcoming?.length > 0 ? (
          <Card>
            <CardBody>
              {upcoming.map((trip: any) => (
                <Box key={trip.id} p={3} _hover={{ bg: 'gray.50' }}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{trip.service?.name || 'Trip'}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </Text>
                    </VStack>
                    <Text fontWeight="medium">{trip.status}</Text>
                  </HStack>
                  <Divider my={2} />
                </Box>
              ))}
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody textAlign="center" py={8}>
              <Text color="gray.500">No upcoming trips. Start planning your next adventure!</Text>
            </CardBody>
          </Card>
        )}
      </Box>
    </Box>
  );
};

// Helper function to get icon component from string
const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ElementType> = {
    'search': FiSearch,
    'calendar': FiCalendar,
    'plus-circle': FiPlusCircle,
    'map-pin': FiMapPin,
  };
  return icons[iconName] || FiCalendar;
};

export default TouristDashboard;
