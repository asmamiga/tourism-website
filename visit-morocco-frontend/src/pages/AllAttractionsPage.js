import React from 'react';
import { Box } from '@chakra-ui/react';
import AttractionsList from '../components/attractions/AttractionsList';

const AllAttractionsPage = () => {
  return (
    <Box as="main" minH="calc(100vh - 64px)" bg="gray.50" py={8}>
      <AttractionsList />
    </Box>
  );
};

export default AllAttractionsPage;
