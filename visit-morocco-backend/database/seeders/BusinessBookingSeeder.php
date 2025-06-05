<?php

namespace Database\Seeders;

use App\Models\AppUser;
use App\Models\Business;
use App\Models\BusinessBooking;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BusinessBookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bookings = [
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
                'total_amount' => 1200.00,
            ],
            [
                'business_name' => 'Le Jardin Secret',
                'user_email' => 'tourist.john@example.com',
                'booking_date' => Carbon::tomorrow()->addDay()->format('Y-m-d'),
                'booking_time' => '20:00:00',
                'duration' => 2,
                'num_people' => 4,
                'special_requests' => 'Table in the garden area if possible',
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'total_amount' => 800.00,
            ],
            [
                'business_name' => 'Atlas Mountain Tours',
                'user_email' => 'tourist.john@example.com',
                'booking_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                'booking_time' => '08:00:00',
                'duration' => 10,
                'num_people' => 2,
                'special_requests' => 'Vegetarian lunch option please',
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
