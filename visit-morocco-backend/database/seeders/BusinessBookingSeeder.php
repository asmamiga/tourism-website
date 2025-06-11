<?php

namespace Database\Seeders;

use App\Models\AppUser;
use App\Models\Business;
use App\Models\BusinessBooking;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class BusinessBookingSeeder extends Seeder
{
    /**
     * Create a booking from the given data
     */
    private function createBooking($business, $user, array $data): void
    {
        $booking = new BusinessBooking([
            'business_id' => $business->business_id,
            'user_id' => $user->user_id,
            'booking_date' => $data['booking_date'],
            'booking_time' => $data['booking_time'] ?? null,
            'duration' => $data['duration'] ?? 1,
            'num_people' => $data['num_people'] ?? 1,
            'special_requests' => $data['special_requests'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'payment_status' => $data['payment_status'] ?? 'unpaid',
            'total_amount' => $data['total_amount'] ?? 0,
        ]);
        
        $booking->save();
    }
    
    /**
     * Create random bookings
     */
    private function createRandomBookings($businesses, $users, $count): void
    {
        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        $paymentStatuses = ['unpaid', 'paid', 'partially_paid'];
        
        for ($i = 0; $i < $count; $i++) {
            $business = $businesses->random();
            $user = $users->random();
            
            $bookingDate = Carbon::today()->addDays(rand(-30, 30));
            $status = $statuses[array_rand($statuses)];
            
            $bookingData = [
                'booking_date' => $bookingDate->format('Y-m-d'),
                'booking_time' => rand(8, 20) . ':00:00',
                'duration' => rand(1, 4),
                'num_people' => rand(1, 8),
                'special_requests' => rand(0, 1) ? $this->getRandomSpecialRequest(false, false) : null,
                'status' => $status,
                'payment_status' => $paymentStatuses[array_rand($paymentStatuses)],
                'total_amount' => rand(500, 10000) / 100 * 100, // Random amount between 5 and 10000, rounded to nearest 100
            ];
            
            $this->createBooking($business, $user, $bookingData);
        }
    }
    
    /**
     * Generate a random special request
     */
    private function getRandomSpecialRequest(bool $isAccommodation, bool $isTour): string
    {
        $requests = [
            'Early check-in if possible',
            'Late check-out if possible',
            'Quiet room away from elevator',
            'High floor preferred',
            'Non-smoking room',
            'Vegetarian meal options',
            'Allergy: Please no nuts',
            'Celebrating anniversary',
            'Honeymoon trip',
            'Business trip',
        ];
        
        if ($isAccommodation) {
            $requests = array_merge($requests, [
                'Room with a view',
                'Adjoining rooms if possible',
                'Extra towels needed',
                'Baby cot required',
                'Airport transfer needed',
            ]);
        }
        
        if ($isTour) {
            $requests = array_merge($requests, [
                'English speaking guide',
                'Private tour preferred',
                'Wheelchair accessible',
                'Pickup from hotel',
                'Special dietary requirements',
            ]);
        }
        
        return $requests[array_rand($requests)];
    }
    
    /**
     * Get a random cancellation policy
     */
    private function getRandomCancellationPolicy(): string
    {
        $policies = [
            'Free cancellation up to 24 hours before check-in',
            'Non-refundable',
            'Free cancellation up to 7 days before check-in',
            '50% refund if cancelled at least 48 hours before check-in',
            'Free cancellation up to 48 hours before check-in, then first night non-refundable',
            'Free cancellation up to 14 days before check-in',
        ];
        
        return $policies[array_rand($policies)];
    }
    
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define sample bookings data first
        $bookings = [
            // Hotel/Riad Bookings
            [
                'business_name' => 'Riad Dar Zaman',
                'user_email' => 'tourist.john@example.com',
                'booking_date' => Carbon::tomorrow()->format('Y-m-d'),
                'booking_time' => '14:00:00',
                'duration' => 2, // hours
                'num_people' => 2,
                'special_requests' => 'We\'d like a room with a view of the courtyard',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 2500.00,
            ],
            [
                'business_name' => 'Le Jardin Secret',
                'user_email' => 'traveler.sarah@example.com',
                'booking_date' => Carbon::today()->subDays(2)->format('Y-m-d'),
                'booking_time' => '15:00:00',
                'duration' => 1,
                'num_people' => 1,
                'special_requests' => 'Early check-in if possible',
                'status' => 'completed',
                'payment_status' => 'paid',
                'total_amount' => 3200.00,
            ],
            
            // Restaurant Bookings
            [
                'business_name' => 'Le Jardin Secret',
                'user_email' => 'foodie.mike@example.com',
                'booking_date' => Carbon::tomorrow()->addDay()->format('Y-m-d'),
                'booking_time' => '20:00:00',
                'duration' => 2,
                'num_people' => 4,
                'special_requests' => 'Table in the garden area if possible',
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'total_amount' => 1250.00,
            ],
            [
                'business_name' => 'Nomad Restaurant',
                'user_email' => 'adventure.anna@example.com',
                'booking_date' => Carbon::today()->format('Y-m-d'),
                'booking_time' => '19:30:00',
                'duration' => 2,
                'num_people' => 2,
                'special_requests' => 'Window table with view',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 950.00,
            ],
            
            // Tour Bookings
            [
                'business_name' => 'Atlas Mountain Tours',
                'user_email' => 'hiker.david@example.com',
                'booking_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                'booking_time' => '08:00:00',
                'duration' => 10,
                'num_people' => 2,
                'special_requests' => 'Vegetarian lunch option please',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 1800.00,
                'tour_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                'tour_type' => 'Full Day Trek',
            ],
            [
                'business_name' => 'Sahara Desert Expeditions',
                'user_email' => 'adventure.anna@example.com',
                'booking_date' => Carbon::today()->addWeek()->format('Y-m-d'),
                'booking_time' => '07:00:00',
                'duration' => 48,
                'num_people' => 2,
                'special_requests' => 'Private tent with bathroom',
                'status' => 'confirmed',
                'payment_status' => 'paid_deposit',
                'total_amount' => 4500.00,
                'tour_date' => Carbon::today()->addWeek()->format('Y-m-d'),
                'tour_type' => '2-Day Desert Safari',
            ],
            [
                'business_name' => 'Imperial Cities Tours',
                'user_email' => 'history.buff@example.com',
                'booking_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
                'booking_time' => '09:30:00',
                'duration' => 8,
                'num_people' => 4,
                'special_requests' => 'English speaking guide',
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'total_amount' => 3200.00,
                'tour_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
                'tour_type' => 'Private City Tour',
            ],
            
            // More hotel/riad bookings
            [
                'business_name' => 'Riad El Fenn',
                'user_email' => 'luxury.traveler@example.com',
                'booking_date' => Carbon::today()->addDays(7)->format('Y-m-d'),
                'booking_time' => '16:00:00',
                'duration' => 1,
                'num_people' => 2,
                'special_requests' => 'Honeymoon suite with rose petals',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 5800.00,
                'check_in' => Carbon::today()->addDays(7)->format('Y-m-d'),
                'check_out' => Carbon::today()->addDays(10)->format('Y-m-d'),
                'room_type' => 'Luxury Suite',
            ],
            
            // More restaurant bookings
            [
                'business_name' => 'La Maison Arabe',
                'user_email' => 'food.critic@example.com',
                'booking_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
                'booking_time' => '20:00:00',
                'duration' => 2,
                'num_people' => 6,
                'special_requests' => 'Birthday celebration, table with view',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 3500.00,
            ],
            
            // More tour bookings
            [
                'business_name' => 'Coastal Adventures',
                'user_email' => 'beach.lover@example.com',
                'booking_date' => Carbon::today()->addDays(4)->format('Y-m-d'),
                'booking_time' => '10:00:00',
                'duration' => 6,
                'num_people' => 3,
                'special_requests' => 'Beach towels and snorkeling gear needed',
                'status' => 'confirmed',
                'payment_status' => 'partially_paid',
                'total_amount' => 2700.00,
                'tour_date' => Carbon::today()->addDays(4)->format('Y-m-d'),
                'tour_type' => 'Coastal Excursion',
            ]
        ];
        
        // Ensure we have at least 15 bookings
        $totalBookings = 15;
        
        // Get all businesses and users
        $businesses = Business::all();
        $users = AppUser::all();
        
        if ($businesses->isEmpty() || $users->isEmpty()) {
            $this->command->info('No businesses or users found. Please run BusinessSeeder and UserSeeder first.');
            return;
        }
        
        // Create bookings from our sample data
        foreach ($bookings as $bookingData) {
            $business = $businesses->firstWhere('name', $bookingData['business_name']);
            $user = $users->firstWhere('email', $bookingData['user_email']);
            
            if ($business && $user) {
                $this->createBooking($business, $user, $bookingData);
            }
        }
        
        // Create additional random bookings if needed
        $existingCount = count($bookings);
        if ($existingCount < $totalBookings) {
            $this->createRandomBookings(
                $businesses, 
                $users, 
                $totalBookings - $existingCount
            );
        }
        // Sample booking data
        $bookings = [
            // Hotel/Riad Bookings
            [
                'business_name' => 'Riad Dar Zaman',
                'user_email' => 'tourist.john@example.com',
                'booking_date' => Carbon::tomorrow()->format('Y-m-d'),
                'booking_time' => '14:00:00',
                'duration' => 2, // hours
                'num_people' => 2,
                'special_requests' => 'We\'d like a room with a view of the courtyard',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 2500.00,
                'check_in' => Carbon::tomorrow()->format('Y-m-d'),
                'check_out' => Carbon::tomorrow()->addDays(3)->format('Y-m-d'),
                'room_type' => 'Deluxe Double Room',
            ],
            [
                'business_name' => 'Riad Yasmine',
                'user_email' => 'traveler.sarah@example.com',
                'booking_date' => Carbon::today()->subDays(2)->format('Y-m-d'),
                'booking_time' => '15:00:00',
                'duration' => 1,
                'num_people' => 1,
                'special_requests' => 'Early check-in if possible',
                'status' => 'completed',
                'payment_status' => 'paid',
                'total_amount' => 3200.00,
                'check_in' => Carbon::today()->subDays(2)->format('Y-m-d'),
                'check_out' => Carbon::today()->addDays(2)->format('Y-m-d'),
                'room_type' => 'Superior Room',
            ],
            
            // Restaurant Bookings
            [
                'business_name' => 'Le Jardin Secret',
                'user_email' => 'foodie.mike@example.com',
                'booking_date' => Carbon::tomorrow()->addDay()->format('Y-m-d'),
                'booking_time' => '20:00:00',
                'duration' => 2,
                'num_people' => 4,
                'special_requests' => 'Table in the garden area if possible',
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'total_amount' => 1250.00,
            ],
            [
                'business_name' => 'Nomad Restaurant',
                'user_email' => 'adventure.anna@example.com',
                'booking_date' => Carbon::today()->format('Y-m-d'),
                'booking_time' => '19:30:00',
                'duration' => 2,
                'num_people' => 2,
                'special_requests' => 'Window table with view',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 950.00,
            ],
            
            // Tour Bookings
            [
                'business_name' => 'Atlas Mountain Tours',
                'user_email' => 'hiker.david@example.com',
                'booking_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                'booking_time' => '08:00:00',
                'duration' => 10,
                'num_people' => 2,
                'special_requests' => 'Vegetarian lunch option please',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 1800.00,
                'tour_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                'tour_type' => 'Full Day Trek',
            ],
            [
                'business_name' => 'Sahara Desert Expeditions',
                'user_email' => 'adventure.anna@example.com',
                'booking_date' => Carbon::today()->addWeek()->format('Y-m-d'),
                'booking_time' => '07:00:00',
                'duration' => 48,
                'num_people' => 2,
                'special_requests' => 'Private tent with bathroom',
                'status' => 'confirmed',
                'payment_status' => 'paid_deposit',
                'total_amount' => 4500.00,
                'tour_date' => Carbon::today()->addWeek()->format('Y-m-d'),
                'tour_type' => '2-Day Desert Safari',
            ],
            [
                'business_name' => 'Imperial Cities Tours',
                'user_email' => 'history.buff@example.com',
                'booking_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
                'booking_time' => '09:30:00',
                'duration' => 8,
                'num_people' => 4,
                'special_requests' => 'English speaking guide',
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'total_amount' => 3200.00,
                'tour_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
                'tour_type' => 'Private City Tour',
            ],
            
            // More hotel/riad bookings
            [
                'business_name' => 'Riad El Fenn',
                'user_email' => 'luxury.traveler@example.com',
                'booking_date' => Carbon::today()->addDays(7)->format('Y-m-d'),
                'booking_time' => '16:00:00',
                'duration' => 1,
                'num_people' => 2,
                'special_requests' => 'Honeymoon suite with rose petals',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 5800.00,
                'check_in' => Carbon::today()->addDays(7)->format('Y-m-d'),
                'check_out' => Carbon::today()->addDays(10)->format('Y-m-d'),
                'room_type' => 'Luxury Suite',
            ],
            
            // More restaurant bookings
            [
                'business_name' => 'La Maison Arabe',
                'user_email' => 'food.critic@example.com',
                'booking_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
                'booking_time' => '20:00:00',
                'duration' => 2,
                'num_people' => 6,
                'special_requests' => 'Birthday celebration, table with view',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 3500.00,
            ],
            
            // More tour bookings
            [
                'business_name' => 'Coastal Adventures',
                'user_email' => 'beach.lover@example.com',
                'booking_date' => Carbon::today()->addDays(4)->format('Y-m-d'),
                'booking_time' => '10:00:00',
                'duration' => 6,
                'num_people' => 3,
                'special_requests' => 'Beach towels and snorkeling gear needed',
                'status' => 'confirmed',
                'payment_status' => 'partially_paid',
                'total_amount' => 1600.00,
            ],
        ];

        foreach ($bookings as $bookingData) {
            $business = Business::where('name', $bookingData['business_name'])->first();
            $user = AppUser::where('email', $bookingData['user_email'])->first();

            if ($business && $user) {
                $booking = [
                    'business_id' => $business->business_id,
                    'user_id' => $user->user_id,
                    'booking_date' => $bookingData['booking_date'],
                    'booking_time' => $bookingData['booking_time'],
                    'duration' => $bookingData['duration'],
                    'num_people' => $bookingData['num_people'],
                    'special_requests' => $bookingData['special_requests'],
                    'status' => $bookingData['status'],
                    'payment_status' => $bookingData['payment_status'],
                    'total_amount' => $bookingData['total_amount'],
                ];

                BusinessBooking::create($booking);
            }
        }
    }
}
