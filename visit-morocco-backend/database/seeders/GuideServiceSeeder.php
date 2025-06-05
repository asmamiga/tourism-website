<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Guide;
use App\Models\GuideService;
use Illuminate\Database\Seeder;

class GuideServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'guide_email' => 'guide.ahmed@example.com',
                'city_name' => 'Marrakesh',
                'title' => 'Marrakesh Cultural Tour',
                'description' => 'A full-day tour of Marrakesh\'s most famous landmarks including the Bahia Palace, Koutoubia Mosque, and the vibrant Jemaa el-Fnaa square.',
                'duration' => 8, // hours
                'price' => 600.00,
                'max_group_size' => 10,
                'includes' => ['entrance_fees', 'lunch', 'transportation'],
                'excludes' => ['souvenirs', 'tips'],
                'meeting_point' => 'Main entrance of Koutoubia Mosque',
                'languages' => ['en', 'fr', 'ar'],
                'is_private' => false,
            ],
            [
                'guide_email' => 'guide.fatima@example.com',
                'city_name' => 'Ouarzazate',
                'title' => 'Atlas Mountains & Ait Ben Haddou',
                'description' => 'Explore the stunning Atlas Mountains and visit the UNESCO-listed Ait Ben Haddou kasbah, a famous filming location for many Hollywood movies.',
                'duration' => 10, // hours
                'price' => 800.00,
                'max_group_size' => 6,
                'includes' => ['transportation', 'lunch', 'entrance_fees'],
                'excludes' => ['accommodation', 'personal_expenses'],
                'meeting_point' => 'Your hotel in Ouarzazate',
                'languages' => ['en', 'fr', 'ber'],
                'is_private' => true,
            ],
            [
                'guide_email' => 'guide.ahmed@example.com',
                'city_name' => 'Marrakesh',
                'title' => 'Food Tasting Tour',
                'description' => 'Experience the flavors of Marrakesh with this culinary tour through the medina, tasting traditional dishes and learning about Moroccan cuisine.',
                'duration' => 4, // hours
                'price' => 350.00,
                'max_group_size' => 8,
                'includes' => ['all_food_tastings', 'bottled_water'],
                'excludes' => ['alcohol', 'souvenirs'],
                'meeting_point' => 'Jemaa el-Fnaa main square, near the fountain',
                'languages' => ['en', 'fr', 'ar'],
                'is_private' => false,
            ],
        ];

        foreach ($services as $serviceData) {
            // First find the user by email
            $user = \App\Models\AppUser::where('email', $serviceData['guide_email'])->first();
            
            // Then find the guide by user_id
            $guide = null;
            if ($user) {
                $guide = Guide::where('user_id', $user->user_id)->first();
            }

            $city = City::where('name', $serviceData['city_name'])->first();

            if ($guide && $city) {
                $service = [
                    'guide_id' => $guide->guide_id,
                    'city_id' => $city->city_id,
                    'title' => $serviceData['title'],
                    'description' => $serviceData['description'],
                    'duration' => $serviceData['duration'],
                    'price' => $serviceData['price'],
                    'max_group_size' => $serviceData['max_group_size'],
                    'includes' => $serviceData['includes'],
                    'excludes' => $serviceData['excludes'],
                    'meeting_point' => $serviceData['meeting_point'],
                    'languages' => $serviceData['languages'],
                    'is_private' => $serviceData['is_private'],
                ];

                // Remove the lookup fields
                unset($serviceData['guide_email'], $serviceData['city_name']);

                GuideService::updateOrCreate(
                    [
                        'guide_id' => $guide->guide_id,
                        'title' => $service['title']
                    ],
                    $service
                );
            }
        }
    }
}
