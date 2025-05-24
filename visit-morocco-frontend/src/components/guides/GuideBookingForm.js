import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Heading,
  Text,
  Flex,
  Alert,
  AlertIcon,
  useToast,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../context/AuthContext';
import { guideBookingService } from '../../services/api';

const GuideBookingForm = ({ guide }) => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [booking, setBooking] = useState({
    date: new Date(),
    time: '',
    service_id: '',
    custom_request: false,
    custom_description: '',
    party_size: 2,
    special_requests: '',
    status: 'pending'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleDateChange = (date) => {
    setBooking({ ...booking, date });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBooking({ ...booking, [name]: value });
  };
  
  const handleNumberChange = (value) => {
    setBooking({ ...booking, party_size: value });
  };
  
  const handleCustomRequestChange = (value) => {
    setBooking({ 
      ...booking, 
      custom_request: value === 'true',
      service_id: value === 'true' ? '' : booking.service_id
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    setLoading(true);
    
    try {
      // Format date and time for API
      const bookingDate = new Date(booking.date);
      const [hours, minutes] = booking.time.split(':');
      bookingDate.setHours(parseInt(hours), parseInt(minutes));
      
      const bookingData = {
        guide_id: guide.guide_id,
        service_id: booking.custom_request ? null : booking.service_id,
        booking_date: bookingDate.toISOString(),
        party_size: booking.party_size,
        special_requests: booking.special_requests,
        custom_request: booking.custom_request,
        custom_description: booking.custom_description,
        status: booking.status
      };
      
      // Submit booking to API
      // In a real implementation, you would use:
      // await guideBookingService.create(bookingData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setBooking({
        date: new Date(),
        time: '',
        service_id: '',
        custom_request: false,
        custom_description: '',
        party_size: 2,
        special_requests: '',
        status: 'pending'
      });
      
      toast({
        title: 'Booking Successful',
        description: `Your booking with ${guide.first_name} ${guide.last_name} has been submitted and is pending confirmation.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      
      toast({
        title: 'Booking Failed',
        description: err.response?.data?.message || 'Failed to create booking. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Generate time slots (every 30 minutes from 8:00 to 20:00)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
        slots.push(time);
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="md"
    >
      {success ? (
        <Alert
          status="success"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <Heading mt={4} mb={1} size="md">
            Booking Submitted!
          </Heading>
          <Text>
            Your booking with {guide.first_name} {guide.last_name} has been submitted and is pending confirmation.
            You can view your bookings in your profile.
          </Text>
          <Button
            mt={4}
            colorScheme="green"
            onClick={() => setSuccess(false)}
          >
            Make Another Booking
          </Button>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Heading size="md" mb={2}>
              Book a tour with {guide.first_name}
            </Heading>
            
            {error && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            <FormControl isRequired>
              <FormLabel>Tour Type</FormLabel>
              <RadioGroup
                onChange={handleCustomRequestChange}
                value={booking.custom_request.toString()}
                defaultValue="false"
              >
                <Stack direction="row">
                  <Radio value="false">Select from available tours</Radio>
                  <Radio value="true">Request custom tour</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            
            {!booking.custom_request ? (
              <FormControl isRequired>
                <FormLabel>Select Tour</FormLabel>
                <Select
                  name="service_id"
                  value={booking.service_id}
                  onChange={handleInputChange}
                  placeholder="Select a tour"
                >
                  {guide.services?.map((service) => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.name} - {service.duration} - {service.price} MAD
                    </option>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl isRequired>
                <FormLabel>Describe Your Custom Tour Request</FormLabel>
                <Textarea
                  name="custom_description"
                  value={booking.custom_description}
                  onChange={handleInputChange}
                  placeholder="Describe what you're looking for, including locations, interests, and any specific requirements..."
                  resize="vertical"
                  rows={4}
                />
              </FormControl>
            )}
            
            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={2}>
                <DatePicker
                  selected={booking.date}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  className="date-picker-input"
                />
              </Box>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Time</FormLabel>
              <Select
                name="time"
                value={booking.time}
                onChange={handleInputChange}
                placeholder="Select time"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Number of People</FormLabel>
              <NumberInput
                min={1}
                max={20}
                value={booking.party_size}
                onChange={handleNumberChange}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Special Requests</FormLabel>
              <Textarea
                name="special_requests"
                value={booking.special_requests}
                onChange={handleInputChange}
                placeholder="Any special requests or requirements..."
                resize="vertical"
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="green"
              size="lg"
              isLoading={loading}
              loadingText="Submitting"
            >
              Request Booking
            </Button>
            
            <Text fontSize="sm" color="gray.500">
              By requesting this booking, you agree to the cancellation policy. 
              Your booking will be confirmed once {guide.first_name} accepts your request.
              Payment will be handled securely through our platform after confirmation.
            </Text>
          </Stack>
        </form>
      )}
    </Box>
  );
};

export default GuideBookingForm;
