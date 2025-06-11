import React from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  text?: string;
  size?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Loading...',
  size = 'xl',
  color = 'blue.500',
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="200px"
      w="100%"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color={color}
          size={size}
        />
        {text && (
          <Text color="gray.600" fontSize="lg">
            {text}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default LoadingSpinner;
