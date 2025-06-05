<?php

namespace Database\Seeders;

use App\Models\GuideService;
use App\Models\GuideServicePhoto;
use Illuminate\Database\Seeder;

class GuideServicePhotoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $photos = [
            // Marrakesh Cultural Tour
            'Marrakesh Cultural Tour' => [
                [
                    'photo_url' => 'storage/guide_services/marrakesh_tour1.jpg',
                    'caption' => 'Exploring the Bahia Palace',
                    'is_primary' => true,
                ],
                [
                    'photo_url' => 'storage/guide_services/marrakesh_tour2.jpg',
                    'caption' => 'Vibrant colors of the souks',
                    'is_primary' => false,
                ],
            ],
            // Atlas Mountains & Ait Ben Haddou
            'Atlas Mountains & Ait Ben Haddou' => [
                [
                    'photo_url' => 'storage/guide_services/atlas_tour1.jpg',
                    'caption' => 'Panoramic view of the Atlas Mountains',
                    'is_primary' => true,
                ],
                [
                    'photo_url' => 'storage/guide_services/atlas_tour2.jpg',
                    'caption' => 'Ait Ben Haddou kasbah',
                    'is_primary' => false,
                ],
                [
                    'photo_url' => 'storage/guide_services/atlas_tour3.jpg',
                    'caption' => 'Traditional Berber village',
                    'is_primary' => false,
                ],
            ],
            // Food Tasting Tour
            'Food Tasting Tour' => [
                [
                    'photo_url' => 'storage/guide_services/food_tour1.jpg',
                    'caption' => 'Sampling traditional Moroccan pastries',
                    'is_primary' => true,
                ],
                [
                    'photo_url' => 'storage/guide_services/food_tour2.jpg',
                    'caption' => 'Fresh spices in the market',
                    'is_primary' => false,
                ],
            ],
        ];

        foreach ($photos as $serviceTitle => $photoData) {
            $service = GuideService::where('title', $serviceTitle)->first();
            
            if ($service) {
                foreach ($photoData as $photo) {
                    GuideServicePhoto::updateOrCreate(
                        [
                            'service_id' => $service->service_id,
                            'photo_url' => $photo['photo_url']
                        ],
                        $photo
                    );
                }
            }
        }
    }
}
