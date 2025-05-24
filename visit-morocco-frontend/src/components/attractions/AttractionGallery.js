import React, { useState } from 'react';
import {
  Box,
  Image,
  Flex,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const AttractionGallery = ({ photos, attractionName }) => {
  const [activeImage, setActiveImage] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalImage, setModalImage] = useState(0);

  const handlePrevious = () => {
    setActiveImage((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImage((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setActiveImage(index);
  };

  const handleOpenModal = (index) => {
    setModalImage(index);
    onOpen();
  };

  const handleModalPrevious = () => {
    setModalImage((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleModalNext = () => {
    setModalImage((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Box>
        {/* Main Image */}
        <Box
          position="relative"
          borderRadius="lg"
          overflow="hidden"
          height={{ base: '250px', md: '400px' }}
          mb={4}
        >
          <Image
            src={photos[activeImage]}
            alt={`${attractionName} - Image ${activeImage + 1}`}
            objectFit="cover"
            w="100%"
            h="100%"
          />
          
          {/* Navigation Arrows */}
          <Flex
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            justify="space-between"
            align="center"
            px={4}
          >
            <IconButton
              aria-label="Previous image"
              icon={<FaChevronLeft />}
              onClick={handlePrevious}
              variant="solid"
              colorScheme="blackAlpha"
              rounded="full"
              size="md"
            />
            <IconButton
              aria-label="Next image"
              icon={<FaChevronRight />}
              onClick={handleNext}
              variant="solid"
              colorScheme="blackAlpha"
              rounded="full"
              size="md"
            />
          </Flex>
          
          {/* Expand Button */}
          <IconButton
            aria-label="View full size"
            icon={<FaExpand />}
            onClick={() => handleOpenModal(activeImage)}
            variant="solid"
            colorScheme="blackAlpha"
            rounded="full"
            size="md"
            position="absolute"
            top={4}
            right={4}
          />
        </Box>
        
        {/* Thumbnails */}
        {photos.length > 1 && (
          <Flex overflow="auto" pb={2}>
            {photos.map((photo, index) => (
              <MotionBox
                key={index}
                width="100px"
                height="70px"
                mr={2}
                borderRadius="md"
                overflow="hidden"
                cursor="pointer"
                opacity={activeImage === index ? 1 : 0.6}
                border={activeImage === index ? '2px solid' : 'none'}
                borderColor="brand.primary"
                onClick={() => handleThumbnailClick(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={photo}
                  alt={`${attractionName} thumbnail ${index + 1}`}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
              </MotionBox>
            ))}
          </Flex>
        )}
      </Box>
      
      {/* Fullscreen Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" zIndex={2} />
          <ModalBody p={0} position="relative">
            <Box
              position="relative"
              height={{ base: '70vh', md: '80vh' }}
              width="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Image
                src={photos[modalImage]}
                alt={`${attractionName} - Image ${modalImage + 1}`}
                objectFit="contain"
                maxH="100%"
                maxW="100%"
              />
              
              {/* Modal Navigation Arrows */}
              <Flex
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                justify="space-between"
                align="center"
                px={4}
              >
                <IconButton
                  aria-label="Previous image"
                  icon={<FaChevronLeft />}
                  onClick={handleModalPrevious}
                  variant="solid"
                  colorScheme="blackAlpha"
                  rounded="full"
                  size="lg"
                />
                <IconButton
                  aria-label="Next image"
                  icon={<FaChevronRight />}
                  onClick={handleModalNext}
                  variant="solid"
                  colorScheme="blackAlpha"
                  rounded="full"
                  size="lg"
                />
              </Flex>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AttractionGallery;
