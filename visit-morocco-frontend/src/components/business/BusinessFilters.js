import React from 'react';
import {
  Box,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Button,
  Flex,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  IconButton,
  useBreakpointValue,
  useColorModeValue,
  Text,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const BusinessFilters = ({
  filters,
  cities,
  categories,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const inputBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const FilterContent = ({ direction = 'row' }) => (
    <VStack spacing={4} align="stretch" w="full" direction={direction}>
      <Box>
        <Text mb={2} fontWeight="500">Search</Text>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search businesses..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            bg={inputBg}
            borderColor={borderColor}
            _hover={{ borderColor: 'brand.primary' }}
          />
        </InputGroup>
      </Box>

      <Box>
        <Text mb={2} fontWeight="500">City</Text>
        <Select
          placeholder="All Cities"
          value={filters.city}
          onChange={(e) => onFilterChange('city', e.target.value)}
          bg={inputBg}
          borderColor={borderColor}
          _hover={{ borderColor: 'brand.primary' }}
        >
          {cities.map((city) => (
            <option key={city.city_id} value={city.city_id}>
              {city.name}
            </option>
          ))}
        </Select>
      </Box>

      <Box>
        <Text mb={2} fontWeight="500">Category</Text>
        <Select
          placeholder="All Categories"
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          bg={inputBg}
          borderColor={borderColor}
          _hover={{ borderColor: 'brand.primary' }}
        >
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </Select>
      </Box>

      <Box>
        <Text mb={2} fontWeight="500">Sort By</Text>
        <Select
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          bg={inputBg}
          borderColor={borderColor}
          _hover={{ borderColor: 'brand.primary' }}
        >
          <option value="name">Name (A-Z)</option>
          <option value="rating">Highest Rated</option>
          <option value="featured">Featured First</option>
        </Select>
      </Box>

      {(filters.search || filters.city || filters.category) && (
        <Button
          variant="outline"
          colorScheme="gray"
          leftIcon={<FaTimes />}
          onClick={onReset}
          size="sm"
          alignSelf="flex-start"
        >
          Clear Filters
        </Button>
      )}
    </VStack>
  );

  return (
    <Box mb={8}>
      {isMobile ? (
        <>
          <Button
            leftIcon={<FaFilter />}
            onClick={onOpen}
            mb={4}
            width="full"
            variant="outline"
          >
            Filters {totalResults > 0 && <Badge ml={2}>{totalResults}</Badge>}
          </Button>
          <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
            <DrawerOverlay />
            <DrawerContent>
              <DrawerHeader borderBottomWidth="1px">
                <HStack justify="space-between" align="center">
                  <Text>Filters</Text>
                  <DrawerCloseButton position="relative" top={0} right={0} />
                </HStack>
              </DrawerHeader>
              <DrawerBody p={4}>
                <FilterContent direction="column" />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          p={4}
          bg={useColorModeValue('gray.50', 'gray.800')}
          borderRadius="lg"
          alignItems="flex-end"
        >
          <FilterContent direction="row" />
        </Flex>
      )}
    </Box>
  );
};

export default BusinessFilters;
