<?php

namespace Database\Seeders;

use App\Models\AppUser;
use App\Models\Guide;
use App\Models\GuideBooking;
use App\Models\GuideService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class GuideBookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bookings = [
            [
                'guide_email' => 'guide.ahmed@example.com',
                'service_title' => 'Marrakesh Cultural Tour',
                'user_email' => 'tourist.john@example.com',
                'booking_date' => Carbon::tomorrow()->format('Y-m-d'),
                'start_time' => '10:00:00',
                'num_people' => 2,
                'special_requests' => 'We\'re interested in the history of the Saadian Tombs',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 600.00,
            ],
            [
                'guide_email' => 'guide.fatima@example.com',
                'service_title' => 'Atlas Mountains & Ait Ben Haddou',
                'user_email' => 'tourist.john@example.com',
                'booking_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                'start_time' => '08:00:00',
                'num_people' => 2,
                'special_requests' => 'We\'d like to visit a Berber family for tea if possible',
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'total_amount' => 1600.00,
            ],
            [
                'guide_email' => 'guide.ahmed@example.com',
                'service_title' => 'Food Tasting Tour',
                'user_email' => 'tourist.john@example.com',
                'booking_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
                'start_time' => '18:00:00',
                'num_people' => 4,
                'special_requests' => 'One of us is vegetarian',
                'status' => 'confirmed',
                'payment_status' => 'partially_paid',
                'total_amount' => 350.00,
            ],
        ];

        foreach ($bookings as $bookingData) {
            $guide = Guide::whereHas('user', function($query) use ($bookingData) {
                $query->where('email', $bookingData['guide_email']);
            })->first();

            $service = GuideService::where('title', $bookingData['service_title'])
                ->where('guide_id', $guide->guide_id ?? null)
                ->first();

            $user = AppUser::where('email', $bookingData['user_email'])->first();

            if ($guide && $service && $user) {
                $booking = [
                    'service_id' => $service->service_id,
                    'guide_id' => $guide->guide_id,
                    'user_id' => $user->user_id,
                    'booking_date' => $bookingData['booking_date'],
                    'start_time' => $bookingData['start_time'],
                    'num_people' => $bookingData['num_people'],
                    'special_requests' => $bookingData['special_requests'],
                    'status' => $bookingData['status'],
                    'payment_status' => $bookingData['payment_status'],
                    'total_amount' => $bookingData['total_amount'],
                ];

                GuideBooking::create($booking);
            }
        }
    }
}
