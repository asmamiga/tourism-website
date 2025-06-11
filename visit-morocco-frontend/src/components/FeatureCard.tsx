import React from 'react';
import {
  Box,
  Heading,
  Text,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface FeatureCardProps {
  title: string;
  description: string;
  icon: IconType;
  colorScheme?: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  colorScheme = 'blue',
  delay = 0,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBg = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`);
  const iconColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.300`);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Box
        p={6}
        bg={bgColor}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="md"
        transition="all 0.3s ease"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'lg',
        }}
      >
        <VStack align="start" spacing={4}>
          <Box
            p={3}
            bg={iconBg}
            borderRadius="lg"
            color={iconColor}
          >
            <Icon as={icon} boxSize={6} />
          </Box>
          <Heading size="md" fontWeight="semibold">
            {title}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {description}
          </Text>
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default FeatureCard; 