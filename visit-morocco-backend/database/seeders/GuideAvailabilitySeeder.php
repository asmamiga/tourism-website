<?php

namespace Database\Seeders;

use App\Models\Guide;
use App\Models\GuideAvailability;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class GuideAvailabilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $availabilities = [
            // Guide Ahmed's availability
            'guide.ahmed@example.com' => [
                [
                    'date' => Carbon::today()->addDays(1)->format('Y-m-d'),
                    'is_available' => true,
                    'available_hours' => ['09:00-12:00', '14:00-18:00'],
                ],
                [
                    'date' => Carbon::today()->addDays(2)->format('Y-m-d'),
                    'is_available' => true,
                    'available_hours' => ['10:00-13:00', '15:00-19:00'],
                ],
                [
                    'date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                    'is_available' => false,
                    'available_hours' => [],
                ],
            ],
            // Guide Fatima's availability
            'guide.fatima@example.com' => [
                [
                    'date' => Carbon::today()->addDays(1)->format('Y-m-d'),
                    'is_available' => true,
                    'available_hours' => ['08:00-12:00', '14:00-17:00'],
                ],
                [
                    'date' => Carbon::today()->addDays(2)->format('Y-m-d'),
                    'is_available' => true,
                    'available_hours' => ['09:00-13:00', '15:00-18:00'],
                ],
                [
                    'date' => Carbon::today()->addDays(4)->format('Y-m-d'),
                    'is_available' => true,
                    'available_hours' => ['10:00-14:00', '16:00-20:00'],
                ],
            ],
        ];

        foreach ($availabilities as $guideEmail => $dates) {
            $guide = Guide::whereHas('user', function($query) use ($guideEmail) {
                $query->where('email', $guideEmail);
            })->first();

            if ($guide) {
                foreach ($dates as $availability) {
                    GuideAvailability::updateOrCreate(
                        [
                            'guide_id' => $guide->guide_id,
                            'date' => $availability['date'],
                        ],
                        [
                            'is_available' => $availability['is_available'],
                            'available_hours' => $availability['available_hours'],
                        ]
                    );
                }
            }
        }
    }
}
